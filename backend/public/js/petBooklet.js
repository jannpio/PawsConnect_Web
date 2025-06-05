let selectedPetId = null;

async function loadPets() {
  try {
    const response = await fetch('/api/pets');
    const pets = await response.json();
    const petsContainer = document.querySelector('.row.g-4');
    petsContainer.innerHTML = '';

    pets.forEach(pet => {
      const age = pet.birthday ? calculateAge(pet.birthday) + ' years' : 'Unknown';

      const card = document.createElement('div');
      card.className = 'col-md-4';
      card.innerHTML = `
        <div class="card pet-card text-center">
          <img src="${pet.photoUrl}" alt="${pet.petName}" class="pet-photo card-img-top" style="height: 300px; object-fit: cover;" />
          <div class="card-body">
            <h5 class="pet-name card-title">${pet.petName}</h5>
            <button class="btn btn-info mt-2" data-bs-toggle="modal" data-bs-target="#petBookletModal" onclick='openPetBookletModal(${JSON.stringify(pet)})'>
              View Booklet
            </button>
          </div>
        </div>
      `;
      petsContainer.appendChild(card);
    });
  } catch (error) {
    console.error('Error fetching pets:', error);
  }
}

function calculateAge(birthday) {
  const birthDate = new Date(birthday);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}

function openPetBookletModal(pet) {
  const age = pet.birthday ? calculateAge(pet.birthday) + ' years' : 'Unknown';
  document.getElementById('modalPetPhoto').src = pet.photoUrl;
  document.getElementById('modalPetName').textContent = pet.petName;
  document.getElementById('modalSpecies').textContent = pet.species || 'N/A';
  document.getElementById('modalBirthday').textContent = pet.birthday ? new Date(pet.birthday).toLocaleDateString() : 'N/A';
  document.getElementById('modalAge').textContent = age;
  document.getElementById('modalWeight').textContent = pet.weight || 'N/A';
  document.getElementById('modalGender').textContent = pet.gender || 'N/A';
  document.getElementById('modalBio').textContent = pet.bio || 'N/A';

  // Prefill Edit Form
  document.getElementById('editPetId').value = pet._id;
  document.getElementById('editPetName').value = pet.petName;
  document.getElementById('editSpecies').value = pet.species;
  document.getElementById('editBio').value = pet.bio;
  document.getElementById('editBirthday').value = pet.birthday ? pet.birthday.substr(0, 10) : '';
  document.getElementById('editWeight').value = pet.weight;
  document.getElementById('editGender').value = pet.gender;

  selectedPetId = pet._id;

  // Show view mode first
  document.getElementById('viewMode').style.display = 'block';
  document.getElementById('editForm').style.display = 'none';
  document.getElementById('editPetBtn').style.display = 'inline-block'; // Show Edit button
  document.getElementById('saveChangesBtn').style.display = 'none'; // Hide Save Changes
}

// DELETE PET
document.getElementById('deletePetBtn').addEventListener('click', async () => {
  if (confirm('Are you sure you want to delete this pet?')) {
    try {
      const response = await fetch(`/api/pets/${selectedPetId}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        alert('Pet deleted successfully!');
        const modal = bootstrap.Modal.getInstance(document.getElementById('petBookletModal'));
        modal.hide();
        loadPets();
      } else {
        alert('Failed to delete pet.');
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('Something went wrong.');
    }
  }
});

// TOGGLE TO EDIT MODE
document.getElementById('editPetBtn').addEventListener('click', () => {
  document.getElementById('viewMode').style.display = 'none';
  document.getElementById('editForm').style.display = 'block';

  document.getElementById('editPetBtn').style.display = 'none'; // Hide Edit button
  document.getElementById('saveChangesBtn').style.display = 'inline-block'; // Show Save Changes button
});

// HANDLE EDIT FORM SUBMIT
document.getElementById('editForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const form = document.getElementById('editForm');
  const formData = new FormData(form);

  try {
    const response = await fetch(`/api/pets/${selectedPetId}`, {
      method: 'PUT',
      body: formData
    });

    const data = await response.json();
    if (response.ok) {
      alert('Pet updated successfully!');
      const modal = bootstrap.Modal.getInstance(document.getElementById('petBookletModal'));
      modal.hide();
      loadPets();
    } else {
      alert(data.error || 'Failed to update pet.');
    }
  } catch (error) {
    console.error('Error:', error);
    alert('Something went wrong.');
  }
});

// HANDLE ADD BOOKLET
document.getElementById('bookletForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const form = document.getElementById('bookletForm');
  const formData = new FormData(form);

  try {
    const response = await fetch('/api/pets', {
      method: 'POST',
      body: formData
    });

    const data = await response.json();
    if (response.ok) {
      alert('Pet booklet created successfully!');
      form.reset();
      loadPets();
      const addBookletModal = bootstrap.Modal.getInstance(document.getElementById('addBookletModal'));
      addBookletModal.hide();
    } else {
      alert(data.error || 'Failed to create pet booklet.');
    }
  } catch (error) {
    console.error('Error:', error);
    alert('Something went wrong.');
  }
});

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

// Load Upcoming Appointments
async function loadAppointments() {
  try {
    const response = await fetch('/api/appointments');
    const appointments = await response.json();
    const appointmentsContainer = document.getElementById('upcomingAppointments');

    appointmentsContainer.innerHTML = '';

    if (appointments.length === 0) {
      appointmentsContainer.innerHTML = '<p class="text-center">No upcoming appointments.</p>';
      return;
    }

    appointments.forEach(app => {
      const dateObj = new Date(app.date);
      const formattedDate = dateObj.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      });

      const card = document.createElement('div');
      card.className = 'col-md-6 col-lg-4';
      card.innerHTML = `
        <div class="card shadow-sm border-0 rounded-4 p-4 h-100">
          <h3 class="fw-bold">${app.petName}</h3>
          <p><strong>Date:</strong> ${formattedDate}</p>
          <p><strong>Time:</strong> ${app.time}</p>
          <p><strong>Service:</strong> ${app.serviceType}</p>
          <p><strong>Notes:</strong> ${app.notes || 'No additional notes'}</p>
        </div>
      `;
      appointmentsContainer.appendChild(card);
    });
  } catch (error) {
    console.error('Error loading appointments:', error);
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
      loadAppointments(); 
    } else {
      alert(data.error || 'Failed to book appointment.');
    }
  } catch (error) {
    console.error('Error booking appointment:', error);
    alert('Something went wrong.');
  }
});

// Load everything when page loads
document.addEventListener('DOMContentLoaded', () => {
  loadPetsForAppointment();
  loadAppointments(); 
});


document.addEventListener('DOMContentLoaded', loadPets);

function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('isAdmin');
  window.location.href = '/login.html';
}
