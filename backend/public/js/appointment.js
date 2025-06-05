// Load Pets into Dropdown
async function loadPetsForAppointment() {
  try {
    const response = await fetch('/api/pets');
    const pets = await response.json();
    const petSelect = document.getElementById('petSelect');

    petSelect.innerHTML = '<option value="" disabled selected>Select your pet</option>';

    pets.forEach(pet => {
      const option = document.createElement('option');
      option.value = pet.petName;
      option.textContent = pet.petName;
      petSelect.appendChild(option);
    });
  } catch (error) {
    console.error('Error loading pets:', error);
  }
}

// Load and Sort Appointments
async function loadAppointments() {
  try {
    const response = await fetch('/api/appointments');
    const appointments = await response.json();
    console.log('Appointments:', appointments);

    const upcomingContainer = document.getElementById('upcomingAppointments');
    const pastContainer = document.getElementById('pastAppointments');
    upcomingContainer.innerHTML = '';
    pastContainer.innerHTML = '';

    const today = new Date();

    const upcoming = appointments.filter(app => new Date(app.date) >= today);
    const past = appointments.filter(app => new Date(app.date) < today);

    if (upcoming.length === 0) {
      upcomingContainer.innerHTML = '<p class="text-center">No upcoming appointments.</p>';
    } else {
      upcoming.sort((a, b) => new Date(a.date) - new Date(b.date));
      upcoming.forEach(app => createAppointmentCard(app, upcomingContainer));
    }

    if (past.length === 0) {
      pastContainer.innerHTML = '<p class="text-center">No past appointments.</p>';
    } else {
      past.sort((a, b) => new Date(b.date) - new Date(a.date));
      past.forEach(app => createAppointmentCard(app, pastContainer));
    }
  } catch (error) {
    console.error('Error loading appointments:', error);
  }
}

// Create Appointment Card (with Cancel button)
function createAppointmentCard(app, container) {
  const dateObj = new Date(app.date);
  const formattedDate = dateObj.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  const card = document.createElement('div');
  card.className = 'col-md-6 col-lg-4';
  card.innerHTML = `
    <div class="card shadow-sm border-0 rounded-4 p-4 h-100 appointment-card d-flex flex-column justify-content-between">
      <div>
        <h3 class="fw-bold">${app.petName}</h3>
        <p><strong>Date:</strong> ${formattedDate}</p>
        <p><strong>Time:</strong> ${app.time}</p>
        <p><strong>Service:</strong> ${app.serviceType}</p>
        <p><strong>Notes:</strong> ${app.notes || 'No additional notes'}</p>
      </div>
      <button class="btn book-btn mt-3" onclick="deleteAppointment('${app._id}')">Cancel Appointment</button>
    </div>
  `;
  container.appendChild(card);
}

// Delete Appointment
async function deleteAppointment(appointmentId) {
  if (confirm('Are you sure you want to cancel this appointment?')) {
    try {
      const response = await fetch(`/api/appointments/${appointmentId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        alert('Appointment cancelled successfully!');
        loadAppointments();
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to cancel appointment.');
      }
    } catch (error) {
      console.error('Error cancelling appointment:', error);
      alert('Something went wrong.');
    }
  }
}

// Handle Appointment Form Submission
document.getElementById('appointmentForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const petName = document.getElementById('petSelect').value;
  const date = document.getElementById('appointmentDate').value;
  const time = document.getElementById('appointmentTime').value;
  const serviceType = document.getElementById('serviceSelect').value;
  const notes = document.getElementById('notes').value;

  try {
    const response = await fetch('/api/appointments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        petName,
        date,
        time,
        serviceType,
        notes
      }),
    });

    const data = await response.json();
    if (response.ok) {
      alert('Appointment booked successfully!');
      document.getElementById('appointmentForm').reset();
      const modal = bootstrap.Modal.getInstance(document.getElementById('appointmentModal'));
      modal.hide(); 
      loadAppointments();
    } else {
      alert(data.error || 'Failed to book appointment.');
    }
  } catch (error) {
    console.error('Error booking appointment:', error);
    alert('Something went wrong.');
  }
});

// On Page Load
document.addEventListener('DOMContentLoaded', () => {
  loadPetsForAppointment();
  loadAppointments();
});

function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('isAdmin');
  window.location.href = '/login.html';
}

