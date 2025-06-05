async function loadAppointments() {
  try {
    const response = await fetch('/api/appointments');
    const appointments = await response.json();
    const appointmentList = document.getElementById('appointmentList');

    appointmentList.innerHTML = '';

    appointments.forEach(app => {
      const appCard = document.createElement('div');
      appCard.className = 'col-md-6';
      appCard.innerHTML = `
        <div class="card p-3 shadow-sm">
          <h5>${app.petName}</h5>
          <p>Date: ${new Date(app.date).toLocaleDateString()}</p>
          <p>Time: ${app.time}</p>
          <p>Service: ${app.serviceType}</p>
          <p>Notes: ${app.notes || 'None'}</p>
        </div>
      `;
      appointmentList.appendChild(appCard);
    });
  } catch (error) {
    console.error('Error loading appointments:', error);
  }
}

document.addEventListener('DOMContentLoaded', loadAppointments);

function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('isAdmin');
  window.location.href = '/login.html';
}
