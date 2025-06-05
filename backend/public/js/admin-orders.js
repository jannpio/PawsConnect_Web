async function loadOrders() {
  try {
    const response = await fetch('/api/orders');
    const orders = await response.json();
    const orderList = document.getElementById('orderList');

    orderList.innerHTML = '';

    orders.forEach(order => {
      const orderCard = document.createElement('div');
      orderCard.className = 'col-md-6';
      orderCard.innerHTML = `
        <div class="card p-3 shadow-sm">
          <h5>Order #${order._id}</h5>
          <ul>
            ${order.items.map(item => `<li>${item.name} × ${item.quantity} (₱${item.price.toFixed(2)})</li>`).join('')}
          </ul>
          <p class="fw-bold">Total: ₱${order.totalAmount.toFixed(2)}</p>
          <p>Status: ${order.status}</p>
          <button class="btn btn-success btn-sm w-100" onclick="completeOrder('${order._id}')">Mark as Completed</button>
        </div>
      `;
      orderList.appendChild(orderCard);
    });
  } catch (error) {
    console.error('Error loading orders:', error);
  }
}

async function completeOrder(orderId) {
  if (confirm('Mark this order as completed?')) {
    try {
      const response = await fetch(`/api/orders/${orderId}/complete`, {
        method: 'PUT',
      });
      if (response.ok) {
        alert('Order marked as completed!');
        loadOrders();
      } else {
        alert('Failed to complete order.');
      }
    } catch (error) {
      console.error('Complete order error:', error);
    }
  }
}

document.addEventListener('DOMContentLoaded', loadOrders);

function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('isAdmin');
  window.location.href = '/login.html';
}
