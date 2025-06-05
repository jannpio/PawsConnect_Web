const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const path = require('path');
const multer = require('multer');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Multer setup for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/uploads/');
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, Date.now() + ext);
  }
});
const upload = multer({ storage: storage });

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected'))
.catch((err) => console.error('MongoDB connection error:', err));

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';

// Schemas
const userSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  isAdmin: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});
const User = mongoose.model('User', userSchema);

const petSchema = new mongoose.Schema({
  petName: { type: String, required: true },
  species: { type: String },
  bio: { type: String },
  birthday: { type: Date },
  weight: { type: String },
  gender: { type: String },
  photoUrl: { type: String },
  createdAt: { type: Date, default: Date.now }
});
const Pet = mongoose.model('Pet', petSchema);

const appointmentSchema = new mongoose.Schema({
  petName: { type: String, required: true },
  date: { type: Date, required: true },
  time: { type: String, required: true },
  serviceType: { type: String, required: true },
  notes: { type: String },
  createdAt: { type: Date, default: Date.now }
});
const Appointment = mongoose.model('Appointment', appointmentSchema);

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  imageUrl: { type: String, required: true },
  description: { type: String },
  createdAt: { type: Date, default: Date.now },
});
const Product = mongoose.model('Product', productSchema);

const orderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  items: [
    {
      productId: String,
      name: String,
      quantity: Number,
      price: Number,
    }
  ],
  totalAmount: Number,
  status: { type: String, default: 'Pending' },
  createdAt: { type: Date, default: Date.now }
});
const Order = mongoose.model('Order', orderSchema);

// 🧸 Contact Message Schema (Only One Correct Schema!)
const contactSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  subject: { type: String },
  message: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});
const Contact = mongoose.model('Contact', contactSchema);

// JWT Authentication Middleware
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer token

  if (!token) return res.status(401).json({ error: 'Access Denied. No Token Provided.' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid Token' });
    req.user = user;
    next();
  });
}

// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'signup.html'));
});

// User registration
app.post('/api/signup', async (req, res) => {
  try {
    const { fullName, email, password } = req.body;

    if (!fullName || !email || !password) {
      return res.status(400).json({ error: 'Please fill all required fields.' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ error: 'Email is already registered.' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const newUser = new User({ fullName, email, passwordHash });
    await newUser.save();
    res.status(201).json({ message: 'Account created successfully!' });
  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ error: 'Server error during registration.' });
  }
});

// Login route
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: 'Invalid email or password.' });

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) return res.status(400).json({ error: 'Invalid email or password.' });

    const token = jwt.sign({ id: user._id, isAdmin: user.isAdmin }, JWT_SECRET, { expiresIn: '7d' });

    res.json({ token, user: { id: user._id, fullName: user.fullName, email: user.email, isAdmin: user.isAdmin } });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error during login.' });
  }
});

// Pets
app.post('/api/pets', upload.single('photo'), async (req, res) => {
  try {
    const { petName, species, bio, birthday, weight, gender } = req.body;
    const photoUrl = req.file ? `/uploads/${req.file.filename}` : 'images/default-pet.jpg';

    if (!petName || !species || !bio) {
      return res.status(400).json({ error: 'Please fill all required fields.' });
    }

    const newPet = new Pet({ petName, species, bio, birthday, weight, gender, photoUrl });
    await newPet.save();
    res.status(201).json({ message: 'Pet booklet created successfully!' });
  } catch (err) {
    console.error('Pet creation error:', err);
    res.status(500).json({ error: 'Server error while creating pet.' });
  }
});

app.get('/api/pets', async (req, res) => {
  try {
    const pets = await Pet.find();
    res.status(200).json(pets);
  } catch (err) {
    console.error('Fetching pets error:', err);
    res.status(500).json({ error: 'Server error while fetching pets.' });
  }
});

app.delete('/api/pets/:id', async (req, res) => {
  try {
    await Pet.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Pet deleted successfully!' });
  } catch (err) {
    console.error('Delete pet error:', err);
    res.status(500).json({ error: 'Server error while deleting pet.' });
  }
});

app.put('/api/pets/:id', upload.single('photo'), async (req, res) => {
  try {
    const updatedFields = {
      petName: req.body.petName,
      species: req.body.species,
      bio: req.body.bio,
      birthday: req.body.birthday,
      weight: req.body.weight,
      gender: req.body.gender,
    };

    if (req.file) {
      updatedFields.photoUrl = `/uploads/${req.file.filename}`;
    }

    await Pet.findByIdAndUpdate(req.params.id, updatedFields);
    res.status(200).json({ message: 'Pet updated successfully!' });
  } catch (err) {
    console.error('Update pet error:', err);
    res.status(500).json({ error: 'Server error while updating pet.' });
  }
});

// Appointments
app.post('/api/appointments', async (req, res) => {
  try {
    const { petName, date, time, serviceType, notes } = req.body;

    if (!petName || !date || !time || !serviceType) {
      return res.status(400).json({ error: 'Please fill all required fields.' });
    }

    const newAppointment = new Appointment({ petName, date, time, serviceType, notes });
    await newAppointment.save();
    res.status(201).json({ message: 'Appointment booked successfully!' });
  } catch (err) {
    console.error('Appointment booking error:', err);
    res.status(500).json({ error: 'Server error during booking.' });
  }
});

app.get('/api/appointments', async (req, res) => {
  try {
    const appointments = await Appointment.find().sort({ date: 1, time: 1 });
    res.status(200).json(appointments);
  } catch (err) {
    console.error('Fetching appointments error:', err);
    res.status(500).json({ error: 'Server error while fetching appointments.' });
  }
});

app.delete('/api/appointments/:id', async (req, res) => {
  try {
    await Appointment.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Appointment cancelled successfully!' });
  } catch (err) {
    console.error('Cancel appointment error:', err);
    res.status(500).json({ error: 'Server error while cancelling appointment.' });
  }
});

// Products
app.post('/api/products', upload.single('image'), async (req, res) => {
  try {
    const { name, price, description } = req.body;
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : '';

    if (!name || !price || !imageUrl) {
      return res.status(400).json({ error: 'All fields are required.' });
    }

    const newProduct = new Product({ name, price, description, imageUrl });
    await newProduct.save();
    res.status(201).json({ message: 'Product created successfully!' });
  } catch (err) {
    console.error('Product creation error:', err);
    res.status(500).json({ error: 'Server error while creating product.' });
  }
});

app.get('/api/products', async (req, res) => {
  try {
    const products = await Product.find();
    res.status(200).json(products);
  } catch (err) {
    console.error('Fetching products error:', err);
    res.status(500).json({ error: 'Server error while fetching products.' });
  }
});

app.delete('/api/products/:id', async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Product deleted successfully!' });
  } catch (err) {
    console.error('Delete product error:', err);
    res.status(500).json({ error: 'Server error while deleting product.' });
  }
});

// Orders
app.post('/api/orders', authenticateToken, async (req, res) => {
  try {
    const { items, totalAmount } = req.body;

    if (!items || items.length === 0 || !totalAmount) {
      return res.status(400).json({ error: 'Invalid order data.' });
    }

    const newOrder = new Order({ userId: req.user.id, items, totalAmount });
    await newOrder.save();

    res.status(201).json({ message: 'Order placed successfully!' });
  } catch (err) {
    console.error('Order creation error:', err);
    res.status(500).json({ error: 'Server error while placing order.' });
  }
});

app.get('/api/orders', async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.status(200).json(orders);
  } catch (err) {
    console.error('Fetching orders error:', err);
    res.status(500).json({ error: 'Server error while fetching orders.' });
  }
});

app.put('/api/orders/:id/complete', async (req, res) => {
  try {
    await Order.findByIdAndUpdate(req.params.id, { status: 'Completed' });
    res.status(200).json({ message: 'Order marked as completed!' });
  } catch (err) {
    console.error('Complete order error:', err);
    res.status(500).json({ error: 'Server error while updating order.' });
  }
});

app.delete('/api/orders/:id', async (req, res) => {
  try {
    await Order.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Order deleted successfully!' });
  } catch (err) {
    console.error('Delete order error:', err);
    res.status(500).json({ error: 'Server error while deleting order.' });
  }
});

app.get('/api/my-orders', authenticateToken, async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.status(200).json(orders);
  } catch (err) {
    console.error('Fetching user orders error:', err);
    res.status(500).json({ error: 'Server error while fetching user orders.' });
  }
});

// ✅ POST Contact Message
app.post('/api/contact-messages', async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ error: 'Please fill all required fields.' });
    }

    const newContact = new Contact({ name, email, subject, message });
    await newContact.save();
    res.status(201).json({ message: 'Message sent successfully!' });
  } catch (err) {
    console.error('Contact message error:', err);
    res.status(500).json({ error: 'Server error while sending message.' });
  }
});

// ✅ GET Contact Messages
app.get('/api/contact-messages', async (req, res) => {
  try {
    const messages = await Contact.find().sort({ createdAt: -1 });
    res.status(200).json(messages);
  } catch (err) {
    console.error('Fetching contact messages error:', err);
    res.status(500).json({ error: 'Server error while fetching messages.' });
  }
});

// ✅ GET Users
app.get('/api/users', async (req, res) => {
  try {
    const users = await User.find().select('fullName email isAdmin createdAt');
    res.status(200).json(users);
  } catch (err) {
    console.error('Fetching users error:', err);
    res.status(500).json({ error: 'Server error while fetching users.' });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
