async function loadMessages() {
  try {
    const response = await fetch('/api/contact-messages');
    const messages = await response.json();
    const contactList = document.getElementById('contactList');

    contactList.innerHTML = '';

    if (messages.length === 0) {
      contactList.innerHTML = '<p class="text-center text-muted">No messages yet.</p>';
      return;
    }

    messages.forEach(message => {
      const card = document.createElement('div');
      card.className = 'col-md-6'; // 2 messages per row on desktop
      card.innerHTML = `
        <div class="card p-3 shadow-sm">
          <div class="card-body">
            <h5 class="card-title">${message.subject || 'No Subject'}</h5>
            <p><strong>Name:</strong> ${message.name}</p>
            <p><strong>Email:</strong> ${message.email}</p>
            <p><strong>Message:</strong> ${message.message}</p>
            <small class="text-muted">Sent: ${new Date(message.createdAt).toLocaleString()}</small>
          </div>
        </div>
      `;
      contactList.appendChild(card);
    });
  } catch (error) {
    console.error('Error loading messages:', error);
  }
}

function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('isAdmin');
  window.location.href = '/login.html';
}

document.addEventListener('DOMContentLoaded', loadMessages);
