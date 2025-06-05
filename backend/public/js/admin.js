async function loadUsers() {
  try {
    const response = await fetch('/api/users'); 
    const users = await response.json();
    const userList = document.getElementById('userList');

    userList.innerHTML = `
      <div class="table-responsive">
        <table class="table table-striped align-middle">
          <thead class="table-dark">
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Joined</th>
            </tr>
          </thead>
          <tbody>
            ${users.map(user => `
              <tr>
                <td>${user.fullName}</td>
                <td>${user.email}</td>
                <td>${user.isAdmin ? 'Admin' : 'User'}</td>
                <td>${new Date(user.createdAt).toLocaleDateString()}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  } catch (error) {
    console.error('Error loading users:', error);
  }
}

function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('isAdmin');
  window.location.href = '/login.html';
}

document.addEventListener('DOMContentLoaded', loadUsers);
