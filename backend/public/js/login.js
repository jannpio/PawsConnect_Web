document.getElementById('loginForm').addEventListener('submit', async function (e) {
  e.preventDefault();

  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;
  const responseDiv = document.getElementById('responseMsg');

  responseDiv.textContent = '';

  try {
    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (res.ok) {
      // Save token + isAdmin to localStorage
      localStorage.setItem('token', data.token);
      localStorage.setItem('isAdmin', data.user.isAdmin);

      if (data.user.isAdmin) {
        window.location.href = '/admin.html'; // Admin dashboard
      } else {
        window.location.href = '/home.html'; // Normal user
      }
    } else {
      responseDiv.textContent = data.error || 'Login failed.';
      responseDiv.style.color = 'red';
    }
  } catch (error) {
    console.error('Login error:', error);
    responseDiv.textContent = 'Something went wrong. Please try again.';
    responseDiv.style.color = 'red';
  }
});
