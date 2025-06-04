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

// Updated openPetBookletModal to accept full pet object
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
}

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

document.addEventListener('DOMContentLoaded', loadPets);
