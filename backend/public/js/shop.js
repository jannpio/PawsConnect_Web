let cart = [];

// Load products dynamically
async function loadProducts() {
  try {
    const response = await fetch('/api/products');
    const products = await response.json();
    const productList = document.getElementById('product-list');

    productList.innerHTML = '';

    products.forEach(product => {
      const card = document.createElement('div');
      card.className = 'col-md-4 mb-4';
      card.innerHTML = `
        <div class="product-card card shadow-sm">
          <img src="${product.imageUrl}" class="card-img-top" alt="${product.name}">
          <div class="product-info d-flex justify-content-between p-3">
            <h5 class="mb-0">${product.name}</h5>
            <p class="mb-0">₱${product.price.toFixed(2)}</p>
          </div>
          <button class="btn btn-warning add-to-cart w-100" 
            data-id="${product._id}" 
            data-name="${product.name}" 
            data-price="${product.price}" 
            data-image="${product.imageUrl}">
            Add to Cart
          </button>
        </div>
      `;
      productList.appendChild(card);
    });

    attachAddToCartEvents();
  } catch (error) {
    console.error('Error loading products:', error);
  }
}

function attachAddToCartEvents() {
  document.querySelectorAll('.add-to-cart').forEach(button => {
    button.addEventListener('click', () => {
      const id = button.getAttribute('data-id');
      const name = button.getAttribute('data-name');
      const price = parseFloat(button.getAttribute('data-price'));
      const image = button.getAttribute('data-image');

      addToCart({ id, name, price, image });
    });
  });
}

function addToCart(product) {
  const existing = cart.find(item => item.id === product.id);
  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({ ...product, quantity: 1 });
  }
  updateCartDisplay();
}

function updateCartDisplay() {
  const cartCount = document.getElementById('cart-count');
  const cartItems = document.getElementById('cart-items');
  const totalPrice = document.getElementById('total-price');
  const emptyCart = document.getElementById('empty-cart');

  cartCount.textContent = cart.reduce((sum, item) => sum + item.quantity, 0);

  if (cart.length === 0) {
    cartItems.innerHTML = '';
    emptyCart.style.display = 'block';
    totalPrice.textContent = '0.00';
  } else {
    emptyCart.style.display = 'none';
    cartItems.innerHTML = cart.map(item => `
      <div class="d-flex justify-content-between align-items-center mb-3">
        <div class="d-flex align-items-center gap-3">
          <img src="${item.image}" alt="${item.name}" style="width: 60px; height: 60px; object-fit: cover; border-radius: 10px;">
          <div>
            <h6 class="mb-0">${item.name}</h6>
            <small>₱${item.price.toFixed(2)} x ${item.quantity}</small>
          </div>
        </div>
        <div>
          <button class="btn btn-sm btn-danger" onclick="removeFromCart('${item.id}')">Remove</button>
        </div>
      </div>
    `).join('');

    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    totalPrice.textContent = total.toFixed(2);
  }
}

function removeFromCart(id) {
  cart = cart.filter(item => item.id !== id);
  updateCartDisplay();
}

// 🧸 Checkout Button Logic
document.getElementById('checkout-btn').addEventListener('click', async () => {
  if (cart.length === 0) {
    alert('Your cart is empty!');
    return;
  }

  const totalAmount = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const orderData = {
    items: cart.map(item => ({
      productId: item.id,
      name: item.name,
      quantity: item.quantity,
      price: item.price,
    })),
    totalAmount,
  };

  try {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Please login first!');
      return;
    }

    const response = await fetch('/api/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`, 
      },
      body: JSON.stringify(orderData),
    });

    const data = await response.json();
    if (response.ok) {
      alert('Thank you for your order! 🐾✨');
      cart = [];
      updateCartDisplay();
      const modal = bootstrap.Modal.getInstance(document.getElementById('cartModal'));
      modal.hide();
    } else {
      alert(data.error || 'Failed to place order.');
    }
  } catch (error) {
    console.error('Checkout error:', error);
    alert('Something went wrong. Please try again.');
  }
});

document.addEventListener('DOMContentLoaded', loadProducts);

function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('isAdmin');
  window.location.href = '/login.html';
}
