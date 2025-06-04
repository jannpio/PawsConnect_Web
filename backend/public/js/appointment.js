// Load Appointments
async function loadAppointments() {
  try {
    const response = await fetch('/api/appointments');
    const appointments = await response.json();

    const upcomingSection = document.querySelector('#upcomingAppointments');
    upcomingSection.innerHTML = ''; // Clear previous cards

    if (appointments.length === 0) {
      upcomingSection.innerHTML = '<p class="text-muted">No upcoming appointments.</p>';
      return;
    }

    appointments.forEach(appointment => {
      const card = document.createElement('div');
      card.className = 'col-md-6 col-lg-4';

      const date = new Date(appointment.date);
      const formattedDate = date.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      });

      card.innerHTML = `
        <div class="card shadow-sm border-0 rounded-4 p-4 h-100">
          <h3 class="fw-bold">${appointment.serviceType}</h3>
          <p><strong>Pet:</strong> ${appointment.petName}</p>
          <p><strong>Date:</strong> ${formattedDate}</p>
          <p><strong>Time:</strong> ${appointment.time}</p>
          <p><strong>Location:</strong> PawsConnect Clinic</p>
          <p class="text-muted">Notes: ${appointment.notes || 'None'}</p>
          <a href="#" class="btn int-btn fw-bold disabled">View Details</a>
        </div>
      `;

      upcomingSection.appendChild(card);
    });
  } catch (error) {
    console.error('Error fetching appointments:', error);
  }
}

// Form Submission
document.querySelector('form').addEventListener('submit', async function (e) {
  e.preventDefault();

  const petName = document.getElementById('petName').value;
  const appointmentDate = document.getElementById('appointmentDate').value;
  const appointmentTime = document.getElementById('appointmentTime').value;
  const serviceSelect = document.getElementById('serviceSelect').value;
  const notes = document.getElementById('notes').value;

  try {
    const response = await fetch('/api/appointments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        petName: petName,
        date: appointmentDate,
        time: appointmentTime,
        serviceType: serviceSelect,
        notes: notes
      })
    });

    const data = await response.json();

    if (response.ok) {
      alert('Appointment booked successfully!');
      document.querySelector('form').reset(); // Clear form
      loadAppointments(); // 🐾 Reload appointments after booking!
    } else {
      alert(data.error || 'Failed to book appointment.');
    }
  } catch (error) {
    console.error('Error:', error);
    alert('Something went wrong.');
  }
});

// Initial load
document.addEventListener('DOMContentLoaded', loadAppointments);
