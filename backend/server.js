const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const path = require('path');
const multer = require('multer');
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

// User schema & model (keep your registration)
const userSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});
const User = mongoose.model('User', userSchema);

// Pet schema & model
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

// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'signup.html'));
});

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

    const newUser = new User({
      fullName,
      email,
      passwordHash,
    });

    await newUser.save();
    res.status(201).json({ message: 'Account created successfully!' });
  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ error: 'Server error during registration.' });
  }
});

// Upload pet booklet
app.post('/api/pets', upload.single('photo'), async (req, res) => {
  try {
    const { petName, species, bio, birthday, weight, gender } = req.body;
    const photoUrl = req.file ? `/uploads/${req.file.filename}` : 'images/default-pet.jpg';

    if (!petName || !species || !bio) {
      return res.status(400).json({ error: 'Please fill all required fields.' });
    }

    const newPet = new Pet({
      petName,
      species,
      bio,
      birthday,
      weight,
      gender,
      photoUrl
    });

    await newPet.save();
    res.status(201).json({ message: 'Pet booklet created successfully!' });
  } catch (err) {
    console.error('Pet creation error:', err);
    res.status(500).json({ error: 'Server error while creating pet.' });
  }
});

// Get all pets
app.get('/api/pets', async (req, res) => {
  try {
    const pets = await Pet.find();
    res.status(200).json(pets);
  } catch (err) {
    console.error('Fetching pets error:', err);
    res.status(500).json({ error: 'Server error while fetching pets.' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
