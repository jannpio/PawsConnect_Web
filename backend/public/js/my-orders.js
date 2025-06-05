async function loadOrders() {
  const token = localStorage.getItem('token');
  if (!token) {
    alert('You must be logged in to view your orders!');
    window.location.href = '/login.html';
    return;
  }

  try {
    const response = await fetch('/api/my-orders', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const orders = await response.json();
    const ordersList = document.getElementById('orders-list');
    ordersList.innerHTML = '';

    if (orders.length === 0) {
      ordersList.innerHTML = '<p class="text-center">You have no orders yet!</p>';
      return;
    }

    orders.forEach(order => {
      const orderCard = document.createElement('div');
      orderCard.className = 'col-md-6';
      const modalId = `modal-${order._id}`;

      orderCard.innerHTML = `
        <div class="card p-4 shadow-sm">
          <h5>Order ID: <span class="text-primary">#${order._id.slice(-6)}</span></h5>
          <p><strong>Total:</strong> ₱${order.totalAmount.toFixed(2)}</p>
          <p><strong>Status:</strong> ${order.status}</p>
          <p><strong>Date:</strong> ${new Date(order.createdAt).toLocaleDateString()}</p>
          <button class="btn btn-info w-100" data-bs-toggle="modal" data-bs-target="#${modalId}">View Details</button>
        </div>

        <!-- Modal -->
        <div class="modal fade" id="${modalId}" tabindex="-1" aria-labelledby="${modalId}Label" aria-hidden="true">
          <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content">
              <div class="modal-header bg-info text-white">
                <h5 class="modal-title" id="${modalId}Label">Order Details</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
              </div>
              <div class="modal-body">
                <p><strong>Order ID:</strong> #${order._id}</p>
                <p><strong>Date:</strong> ${new Date(order.createdAt).toLocaleString()}</p>
                <p><strong>Status:</strong> ${order.status}</p>
                <h6>Items:</h6>
                <ul class="list-group mb-3">
                  ${order.items.map(item => `
                    <li class="list-group-item d-flex justify-content-between align-items-center">
                      ${item.name} × ${item.quantity}
                      <span>₱${(item.price * item.quantity).toFixed(2)}</span>
                    </li>
                  `).join('')}
                </ul>
                <p class="text-end fw-bold">Total: ₱${order.totalAmount.toFixed(2)}</p>
              </div>
              <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
              </div>
            </div>
          </div>
        </div>
      `;
      ordersList.appendChild(orderCard);
    });

  } catch (error) {
    console.error('Error loading orders:', error);
    alert('Failed to load orders.');
  }
}

document.addEventListener('DOMContentLoaded', loadOrders);


function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('isAdmin');
  window.location.href = '/login.html';
}
