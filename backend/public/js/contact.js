document.querySelector('form').addEventListener('submit', async (e) => {
  e.preventDefault();

  const name = document.getElementById('name').value.trim();
  const email = document.getElementById('email').value.trim();
  const subject = document.getElementById('subject').value.trim();
  const message = document.getElementById('message').value.trim();

  try {
    const res = await fetch('/api/contact-messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, subject, message }),
    });

    const data = await res.json();

    if (res.ok) {
      alert('Message sent successfully! 🐾');
      e.target.reset(); // Clear form fields
    } else {
      alert(data.error || 'Failed to send message.');
    }
  } catch (err) {
    console.error('Error sending message:', err);
    alert('Something went wrong.');
  }
});

function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('isAdmin');
  window.location.href = '/login.html';
}
