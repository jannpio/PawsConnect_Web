document.getElementById('signupForm').addEventListener('submit', async function(e) {
  e.preventDefault();

  const fullName = document.getElementById('fullname').value.trim();
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;
  const confirmPassword = document.getElementById('confirmPassword').value;
  const agreed = document.getElementById('formCheck').checked;
  const responseDiv = document.getElementById('responseMsg');

  responseDiv.textContent = '';
  responseDiv.style.color = '';

  if (!agreed) {
    responseDiv.textContent = 'You must agree to the Terms & Conditions.';
    responseDiv.style.color = 'red';
    return;
  }
  if (password !== confirmPassword) {
    responseDiv.textContent = 'Passwords do not match!';
    responseDiv.style.color = 'red';
    return;
  }

  try {
    const res = await fetch('/api/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fullName, email, password }),
    });

    const data = await res.json();

    if (res.ok) {
      responseDiv.textContent = data.message || 'Account created successfully!';
      responseDiv.style.color = 'green';
      this.reset();
      setTimeout(() => {
        window.location.href = '/login.html';
      }, 1500);
    } else {
      responseDiv.textContent = data.error || 'Sign up failed.';
      responseDiv.style.color = 'red';
    }
  } catch (error) {
    responseDiv.textContent = 'Something went wrong. Please try again.';
    responseDiv.style.color = 'red';
    console.error(error);
  }
});
