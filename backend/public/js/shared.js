// ============================================
// Shared Utility Functions
// ============================================

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

// Logout functionality
function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('isAdmin');
  window.location.href = '/login.html';
}
