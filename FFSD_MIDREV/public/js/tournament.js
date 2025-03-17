document.addEventListener("DOMContentLoaded", () => {

    const form = document.getElementById('tournamentForm');  
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();

            const name = document.getElementById('tournamentName').value;
            const date = document.getElementById('tournamentDate').value;
            const location = document.getElementById('tournamentLocation').value;
            const entryFee = document.getElementById('entryFee').value;

            const tournament = { name, date, location, entryFee };

            let tournaments = JSON.parse(localStorage.getItem('tournaments')) || [];
            tournaments.push(tournament);

            localStorage.setItem('tournaments', JSON.stringify(tournaments));

            displayTournaments();
            form.reset();
        });
    }

    displayTournaments();//COORDINATOR
    displayApproveTournaments();//ORGANISER
    displayApprovedTournamentsForAdmin();//ADMIN


    displayApprovedTournamentsForPlayer();
    loadWalletBalance();
    loadEnrolledTournaments();

    document.getElementById("joinForm").addEventListener("submit", function (event) {
        event.preventDefault();
        submitTournamentRegistration();
    });

    document.getElementById("cancelJoin").addEventListener("click", function () {
        document.getElementById("joinTournamentForm").classList.add("hidden");
    });
});
//---------------COORDINATOR FUNCTIONS----------//
function displayTournaments() {
    let tournaments = JSON.parse(localStorage.getItem('tournaments')) || [];
    let tableContainer = document.getElementById('Coordinator_tournamentTable');

    if (!tableContainer) return; // Ensure the div exists

    let tableHTML = `
        <table border="1">
            <thead>
                <tr>
                    <th>Name</th>
                    <th>Date</th>
                    <th>Location</th>
                    <th>Entry Fee</th>
                    <th>Status & Actions</th>
                </tr>
            </thead>
            <tbody>
                ${tournaments.map((tournament, index) => `
                    <tr>
                        <td>${tournament.name}</td>
                        <td>${tournament.date}</td>
                        <td>${tournament.location}</td>
                        <td>${tournament.entryFee}</td>
                        <td>${tournament.status ? tournament.status : "Pending"}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;

    tableContainer.innerHTML = tableHTML;
}

//-------------ORGANISER FUNCTIONS--------------------//
// Function to display tournaments for Organizers
// Function to display tournaments for Organizers
function displayApproveTournaments() {
    let tournaments = JSON.parse(localStorage.getItem('tournaments')) || [];
    let tableContainer = document.getElementById('Organiser_tournamentTable');

    if (!tableContainer) {
        return; // Ensure the div exists
    }

    let tableHTML = `
        <table border="1">
            <thead>
                <tr>
                    <th>Name</th>
                    <th>Date</th>
                    <th>Location</th>
                    <th>Entry Fee</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                ${tournaments.map((tournament, index) => `
                    <tr>
                        <td>${tournament.name}</td>
                        <td>${tournament.date}</td>
                        <td>${tournament.location}</td>
                        <td>${tournament.entryFee}</td>
                        <td>
                            ${tournament.status === "Approved" 
                                ? '<button>Approved</button>' 
                                : `<button onclick="approveTournament(${index})">Approve</button>`}
                            <button onclick="rejectTournament(${index})">Reject</button>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;

    tableContainer.innerHTML = tableHTML;
}

// Function to register a tournament
function approveTournament(index) {
    let tournaments = JSON.parse(localStorage.getItem('tournaments')) || [];

    if (tournaments[index]) {
        tournaments[index].status = "Approved"; // Mark tournament as approved
        localStorage.setItem('tournaments', JSON.stringify(tournaments));
        alert("Tournament has been registered!");

        displayApproveTournaments(); // Refresh the table
        displayTournaments(); // Update coordinator's view
    }
}


// Function to reject a tournament
function rejectTournament(index) {
    let tournaments = JSON.parse(localStorage.getItem('tournaments')) || [];
    
    if (tournaments[index]) {
        tournaments.splice(index, 1); // Remove tournament from the list
        localStorage.setItem('tournaments', JSON.stringify(tournaments));
        alert("Tournament has been rejected!");
        displayApproveTournaments(); // Refresh the table
        displayTournaments(); // Update coordinator's view
    }
}

//--------------ADMIN FUNCTIONS------------------//
// Function to display only approved tournaments for Admin
function displayApprovedTournamentsForAdmin() {
    let tournaments = JSON.parse(localStorage.getItem('tournaments')) || [];
    let approvedTournaments = tournaments.filter(tournament => tournament.status === "Approved");

    let tableContainer = document.getElementById('adminTournamentTable');

    if (!tableContainer) return; // Ensure the div exists

    let tableHTML = `
        <table>
            <thead>
                <tr>
                    <th>Name</th>
                    <th>Date</th>
                    <th>Venue</th>
                </tr>
            </thead>
            <tbody>
                ${approvedTournaments.map(tournament => `
                    <tr>
                        <td>${tournament.name}</td>
                        <td>${tournament.date}</td>
                        <td>${tournament.location}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;

    tableContainer.innerHTML = tableHTML;
}
//---------PLAYER FUNCTIONS-----------------//

let selectedTournament = null; // Store selected tournament

// Function to load and display only approved tournaments for players
function displayApprovedTournamentsForPlayer() {
    let tournaments = JSON.parse(localStorage.getItem('tournaments')) || [];
    let approvedTournaments = tournaments.filter(t => t.status === "Approved");

    let tournamentList = document.getElementById("tournamentList");
    tournamentList.innerHTML = approvedTournaments.map(tournament => `
        <div class="tournament-card">
            <h3>${tournament.name}</h3>
            <p><strong>Date:</strong> ${tournament.date}</p>
            <p><strong>Venue:</strong> ${tournament.location}</p>
            <p><strong>Entry Fee:</strong> ${tournament.entryFee}</p>


            <button class="register-btn" onclick="registerForTournament('${tournament.name}', ${tournament.entryFee || 10})">Register</button>
        </div>
    `).join('');
}

// Function to load wallet balance from localStorage
function loadWalletBalance() {
    let balance = localStorage.getItem("walletBalance") || 100;
    document.getElementById("walletBalance").innerText = balance;
}

// Function to register for a tournament
function registerForTournament(tournamentName, entryFee) {
    let balance = parseInt(localStorage.getItem("walletBalance")) || 100;

    if (balance < entryFee) {
        alert("Insufficient balance! Please add funds.");
        return;
    }

    selectedTournament = tournamentName;
    document.getElementById("joinTournamentForm").classList.remove("hidden");
}

// Function to handle tournament registration
function submitTournamentRegistration() {
    let username = document.getElementById("username").value;
    let college = document.getElementById("college").value;
    let gender = document.getElementById("gender").value;

    if (!username || !college || !gender) {
        alert("Please fill in all details.");
        return;
    }

    let enrolledTournaments = JSON.parse(localStorage.getItem("enrolledTournaments")) || [];
    enrolledTournaments.push({
        name: selectedTournament,
        username: username,
        college: college,
        gender: gender
    });

    localStorage.setItem("enrolledTournaments", JSON.stringify(enrolledTournaments));

    // Deduct entry fee
    let balance = parseInt(localStorage.getItem("walletBalance")) || 100;
    balance -= 10; // Example: Assume entry fee is 10
    localStorage.setItem("walletBalance", balance);
    document.getElementById("walletBalance").innerText = balance;

    // Hide form and refresh enrolled tournaments
    document.getElementById("joinTournamentForm").classList.add("hidden");
    loadEnrolledTournaments();
}

// Function to load enrolled tournaments
function loadEnrolledTournaments() {
    let enrolledTournaments = JSON.parse(localStorage.getItem("enrolledTournaments")) || [];
    let enrolledDiv = document.getElementById("enrolledTournaments");

    enrolledDiv.innerHTML = enrolledTournaments.map(t => `
        <div class="tournament-card">
            <h3>${t.name}</h3>
            <p><strong>Player:</strong> ${t.username}</p>
            <p><strong>College:</strong> ${t.college}</p>
            <p><strong>Gender:</strong> ${t.gender}</p>
        </div>
    `).join('');
}
// Function to add funds (For Testing)
function addFunds() {
    let balance = parseInt(localStorage.getItem("walletBalance")) || 100;

    // Prompt user for amount to add
    let amount = prompt("Enter the amount to add to your wallet:");

    // Convert input to a number and validate
    let amountToAdd = parseInt(amount);
    if (!isNaN(amountToAdd) && amountToAdd > 0) {
        balance += amountToAdd; // Add amount to balance
        localStorage.setItem("walletBalance", balance);
        document.getElementById("walletBalance").innerText = balance;
        alert(`$${amountToAdd} added successfully! New Balance: $${balance}`);
    } else {
        alert("Invalid amount. Please enter a positive number.");
    }
}
