// Sample data structure to hold tournaments
let tournaments = [];

// Function to handle form submission for adding/editing tournaments
function handleTournamentForm(event) {
    event.preventDefault();


    const id = document.getElementById('tournamentId').value;
    const name = document.getElementById('tournamentName').value;
    const date = document.getElementById('tournamentDate').value;
    const location = document.getElementById('tournamentLocation').value;
    const entryFee = document.getElementById('entryFee').value;

    if (id) {
        // Edit existing tournament
        const tournament = tournaments.find(t => t.id === parseInt(id));
        tournament.name = name;
        tournament.date = date;
        tournament.location = location;
        tournament.entryFee = parseFloat(entryFee);
    } else {
        // Add new tournament
        const newTournament = {
            id: Date.now(),
            name,
            date,
            location,
            entryFee: parseFloat(entryFee)
        };
        tournaments.push(newTournament);
    }

    resetForm();
    displayTournaments();
}

// Function to display tournaments in the table
function displayTournaments() {
    const tbody = document.querySelector('#tournamentTable tbody');
    tbody.innerHTML = '';

    tournaments.forEach(tournament => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${tournament.name}</td>
            <td>${tournament.date}</td>
            <td>${tournament.location}</td>
            <td>${tournament.entryFee.toFixed(2)}</td>
            <td>
                <button class="edit" onclick="editTournament(${tournament.id})">Edit</button>
                <button class="remove"onclick="deleteTournament(${tournament.id})">Delete</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// Function to edit a tournament
function editTournament(id) {
    const tournament = tournaments.find(t => t.id === id);
    document.getElementById('tournamentId').value = tournament.id;
    document.getElementById('tournamentName').value = tournament.name;
    document.getElementById('tournamentDate').value = tournament.date;
    document.getElementById('tournamentLocation').value = tournament.location;
    document.getElementById('entryFee').value = tournament.entryFee;

    document.getElementById('formTitle').innerText = 'Edit Tournament';
    document.getElementById('submitButton').innerText = 'Update Tournament';
    document.getElementById('cancelButton').classList.remove('hidden');


    document.getElementById("deleteButton").addEventListener("click", () => {
    deleteTournament(tournament.id);
    });

}

// Function to delete a tournament
function deleteTournament(id) {
    tournaments = tournaments.filter(t => t.id !== id);
    displayTournaments();
    resetForm();
}

// Function to reset the form
function resetForm() {
    document.getElementById('tournamentId').value = '';
    document.getElementById('tournamentForm').reset();
    document.getElementById('formTitle').innerText = 'Add New Tournament';
    document.getElementById('submitButton').innerText = 'Add Tournament';
    document.getElementById('cancelButton').classList.add('hidden');
}

// Function to cancel the edit operation
function cancelEdit() {
    resetForm();
}