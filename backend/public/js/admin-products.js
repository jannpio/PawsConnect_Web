async function loadProducts() {
  try {
    const response = await fetch('/api/products');
    const products = await response.json();
    const productList = document.getElementById('productList');

    productList.innerHTML = '';

    products.forEach(product => {
      const card = document.createElement('div');
      card.className = 'col-md-4';
      card.innerHTML = `
        <div class="card p-3 shadow-sm">
          <img src="${product.imageUrl}" class="card-img-top mb-2" alt="${product.name}" style="height: 200px; object-fit: cover;">
          <div class="card-body">
            <h4 class="card-title">${product.name}</h4>
            <p>₱${product.price.toFixed(2)}</p>
            <p class="text-muted small">${product.description || ''}</p>
            <button class="btn btn-danger btn-sm w-100" onclick="deleteProduct('${product._id}')">Delete</button>
          </div>
        </div>
      `;
      productList.appendChild(card);
    });
  } catch (error) {
    console.error('Error loading products:', error);
  }
}

async function deleteProduct(productId) {
  if (confirm('Are you sure you want to delete this product?')) {
    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        alert('Product deleted successfully!');
        loadProducts();
      } else {
        alert('Failed to delete product.');
      }
    } catch (error) {
      console.error('Delete error:', error);
    }
  }
}

function showAddProductForm() {
  const addProductModal = new bootstrap.Modal(document.getElementById('addProductModal'));
  addProductModal.show();
}

// 🧸 Add Product Form Handler
document.getElementById('addProductForm').addEventListener('submit', async function (e) {
  e.preventDefault();

  const name = document.getElementById('productName').value.trim();
  const price = document.getElementById('productPrice').value.trim();
  const description = document.getElementById('productDescription').value.trim();
  const image = document.getElementById('productImage').files[0];

  if (!name || !price || !image) {
    alert('Please fill all required fields!');
    return;
  }

  const formData = new FormData();
  formData.append('name', name);
  formData.append('price', price);
  formData.append('description', description);
  formData.append('image', image);

  try {
    const token = localStorage.getItem('token');

    const response = await fetch('/api/products', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData // 🧸 Important: multipart/form-data (NO Content-Type manually)
    });

    const data = await response.json();
    if (response.ok) {
      alert('Product added successfully!');
      document.getElementById('addProductForm').reset();
      bootstrap.Modal.getInstance(document.getElementById('addProductModal')).hide();
      loadProducts(); // refresh product list
    } else {
      alert(data.error || 'Failed to add product.');
    }
  } catch (error) {
    console.error('Error adding product:', error);
    alert('Something went wrong.');
  }
});

document.addEventListener('DOMContentLoaded', loadProducts);

function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('isAdmin');
  window.location.href = '/login.html';
}
