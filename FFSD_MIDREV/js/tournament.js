// Global storage keys
const PENDING_TOURNAMENTS_KEY = "pendingTournaments";
const APPROVED_TOURNAMENTS_KEY = "approvedTournaments";
const ENROLLED_TOURNAMENTS_KEY = "enrolledTournaments";

// Load data from localStorage
function loadFromStorage(key) {
    return JSON.parse(localStorage.getItem(key)) || [];
}

// Save data to localStorage
function saveToStorage(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
}

/* ===== COORDINATOR PAGE FUNCTIONS ===== */
if (window.location.pathname.includes("coordinator")) {
    document.addEventListener("DOMContentLoaded", () => {
        displayPendingTournaments();
        displayApprovedTournaments();
    });

    function handleTournamentForm(event) {
        event.preventDefault();

        let tournamentId = document.getElementById("tournamentId").value;
        let name = document.getElementById("tournamentName").value;
        let date = document.getElementById("tournamentDate").value;
        let location = document.getElementById("tournamentLocation").value;
        let entryFee = document.getElementById("entryFee").value;

        let tournaments = loadFromStorage(PENDING_TOURNAMENTS_KEY);
        if (tournamentId) {
            // Edit existing tournament
            tournaments = tournaments.map(t => t.id === tournamentId ? { id: tournamentId, name, date, location, entryFee, status: "Pending" } : t);
        } else {
            // Add new tournament
            tournaments.push({ id: Date.now().toString(), name, date, location, entryFee, status: "Pending" });
        }

        saveToStorage(PENDING_TOURNAMENTS_KEY, tournaments);
        document.getElementById("tournamentForm").reset();
        displayPendingTournaments();
    }

    function displayPendingTournaments() {
        const tableBody = document.querySelector("#tournamentTable tbody");
        tableBody.innerHTML = "";
        loadFromStorage(PENDING_TOURNAMENTS_KEY).forEach(t => {
            let row = `<tr>
                <td>${t.name}</td>
                <td>${t.date}</td>
                <td>${t.location}</td>
                <td>${t.entryFee}</td>
                <td>
                    <button onclick="editTournament('${t.id}')">Edit</button>
                    <button onclick="deleteTournament('${t.id}')">Delete</button>
                </td>
            </tr>`;
            tableBody.innerHTML += row;
        });
    }

    function editTournament(id) {
        let tournaments = loadFromStorage(PENDING_TOURNAMENTS_KEY);
        let tournament = tournaments.find(t => t.id === id);
        if (tournament) {
            document.getElementById("tournamentId").value = tournament.id;
            document.getElementById("tournamentName").value = tournament.name;
            document.getElementById("tournamentDate").value = tournament.date;
            document.getElementById("tournamentLocation").value = tournament.location;
            document.getElementById("entryFee").value = tournament.entryFee;
        }
    }

    function deleteTournament(id) {
        let tournaments = loadFromStorage(PENDING_TOURNAMENTS_KEY).filter(t => t.id !== id);
        saveToStorage(PENDING_TOURNAMENTS_KEY, tournaments);
        displayPendingTournaments();
    }

    function displayApprovedTournaments() {
        const approvedTournaments = loadFromStorage(APPROVED_TOURNAMENTS_KEY);
        const tableBody = document.querySelector("#tournamentTable tbody");
        tableBody.innerHTML = approvedTournaments.map(t => `
            <tr>
                <td>${t.name}</td>
                <td>${t.date}</td>
                <td>${t.location}</td>
                <td>${t.entryFee}</td>
                <td>Approved</td>
            </tr>
        `).join("");
    }
}

/* ===== ADMIN PAGE FUNCTIONS ===== */
if (window.location.pathname.includes("admin")) {
    document.addEventListener("DOMContentLoaded", displayPendingTournamentsForApproval);

    function displayPendingTournamentsForApproval() {
        const tableBody = document.querySelector("table tbody");
        tableBody.innerHTML = "";
        loadFromStorage(PENDING_TOURNAMENTS_KEY).forEach(t => {
            let row = `<tr>
                <td>${t.name}</td>
                <td>${t.date}</td>
                <td>Pending Approval</td>
                <td>${t.location}</td>
                <td>
                    <button onclick="approveTournament('${t.id}')">Approve</button>
                </td>
            </tr>`;
            tableBody.innerHTML += row;
        });
    }

    function approveTournament(id) {
        let pendingTournaments = loadFromStorage(PENDING_TOURNAMENTS_KEY);
        let approvedTournaments = loadFromStorage(APPROVED_TOURNAMENTS_KEY);

        let tournament = pendingTournaments.find(t => t.id === id);
        if (tournament) {
            tournament.status = "Approved";
            approvedTournaments.push(tournament);
            saveToStorage(APPROVED_TOURNAMENTS_KEY, approvedTournaments);
            saveToStorage(PENDING_TOURNAMENTS_KEY, pendingTournaments.filter(t => t.id !== id));
            displayPendingTournamentsForApproval();
        }
    }
}

/* ===== ORGANIZER PAGE FUNCTIONS ===== */
if (window.location.pathname.includes("organizer")) {
    document.addEventListener("DOMContentLoaded", displayApprovedTournaments);

    function displayApprovedTournaments() {
        const tableBody = document.querySelector("#tournamentTable tbody");
        tableBody.innerHTML = "";
        loadFromStorage(APPROVED_TOURNAMENTS_KEY).forEach(t => {
            let row = `<tr>
                <td>${t.name}</td>
                <td>Upcoming</td>
                <td>0</td>
                <td>${t.date}</td>
                <td>---</td>
            </tr>`;
            tableBody.innerHTML += row;
        });
    }
}

/* ===== PLAYER PAGE FUNCTIONS ===== */
if (window.location.pathname.includes("player")) {
    document.addEventListener("DOMContentLoaded", () => {
        displayAvailableTournaments();
        displayEnrolledTournaments();
    });

    function displayAvailableTournaments() {
        const list = document.getElementById("tournamentList");
        list.innerHTML = "";
        loadFromStorage(APPROVED_TOURNAMENTS_KEY).forEach(t => {
            let tournamentDiv = document.createElement("div");
            tournamentDiv.innerHTML = `<p>${t.name} - ${t.date} - ${t.location} - $${t.entryFee}
                <button onclick="joinTournament('${t.id}')">Join</button>
            </p>`;
            list.appendChild(tournamentDiv);
        });
    }

    function joinTournament(id) {
        let tournaments = loadFromStorage(APPROVED_TOURNAMENTS_KEY);
        let enrolled = loadFromStorage(ENROLLED_TOURNAMENTS_KEY);
        let tournament = tournaments.find(t => t.id === id);

        if (tournament && !enrolled.some(e => e.id === id)) {
            enrolled.push(tournament);
            saveToStorage(ENROLLED_TOURNAMENTS_KEY, enrolled);
            displayEnrolledTournaments();
        }
    }

    function displayEnrolledTournaments() {
        const list = document.getElementById("enrolledTournaments");
        list.innerHTML = loadFromStorage(ENROLLED_TOURNAMENTS_KEY).map(t => `<p>${t.name} - ${t.date}</p>`).join("");
    }
}
