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
          <p><strong>Date:</strong> ${new Date(app.date).toLocaleDateString()}</p>
          <p><strong>Time:</strong> ${app.time}</p>
          <p><strong>Service:</strong> ${app.serviceType}</p>
          <p><strong>Notes:</strong> ${app.notes || 'None'}</p>
          <p><strong>Status:</strong> 
            <span class="badge ${app.status === 'Done' ? 'bg-success' : 'bg-secondary'}">
              ${app.status}
            </span>
          </p>
          <div class="d-flex gap-2">
            ${app.status === 'Pending' ? `
              <button class="btn btn-success btn-sm w-100" onclick="markAsDone('${app._id}')">Mark as Done</button>
            ` : ''}
            <button class="btn btn-danger btn-sm w-100" onclick="deleteAppointment('${app._id}')">Delete</button>
          </div>
        </div>
      `;
      appointmentList.appendChild(appCard);
    });
  } catch (error) {
    console.error('Error loading appointments:', error);
  }
}

async function markAsDone(appointmentId) {
  if (confirm('Mark this appointment as done?')) {
    try {
      const response = await fetch(`/api/appointments/${appointmentId}/done`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (response.ok) {
        alert('Appointment marked as done!');
        loadAppointments(); // Refresh list
      } else {
        alert('Failed to mark appointment as done.');
      }
    } catch (error) {
      console.error('Mark as done error:', error);
    }
  }
}

async function deleteAppointment(appointmentId) {
  if (confirm('Are you sure you want to delete this appointment?')) {
    try {
      const response = await fetch(`/api/appointments/${appointmentId}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        alert('Appointment deleted successfully!');
        loadAppointments(); // Refresh list
      } else {
        alert('Failed to delete appointment.');
      }
    } catch (error) {
      console.error('Delete appointment error:', error);
    }
  }
}

document.addEventListener('DOMContentLoaded', loadAppointments);

function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('isAdmin');
  window.location.href = '/login.html';
}
