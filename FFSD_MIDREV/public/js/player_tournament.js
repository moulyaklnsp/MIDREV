const tournaments = [
    { id: 1, name: "State Chess Championship", entryFee: 10 },
    { id: 2, name: "National Blitz Cup", entryFee: 15 },
    { id: 3, name: "Rapid Chess Open", entryFee: 0 },
];

let enrolledTournaments = JSON.parse(localStorage.getItem("enrolledTournaments")) || [];
let walletBalance = parseFloat(localStorage.getItem("walletBalance")) || 100;

window.onload = function () {
    document.getElementById("walletBalance").innerText = walletBalance.toFixed(2);
    let tournamentList = document.getElementById("tournamentList");
    let enrolledSection = document.getElementById("enrolledTournaments");

    updateEnrolledTournaments();

    tournaments.forEach(tournament => {
        let div = document.createElement("div");
        div.classList.add("tournament");
        div.innerHTML = `<div class=table-div>
            <h3>${tournament.name}</h3>
            <p>Entry Fee: $${tournament.entryFee}</p>
            <button id="joinBtn-${tournament.id}" onclick="showJoinForm(${tournament.id}, '${tournament.name}', ${tournament.entryFee})">Join</button>
            </div>
        `;
        tournamentList.appendChild(div);
    });

    disableAlreadyEnrolledButtons();
    
    // Add event listener for form submission
    document.getElementById("joinForm").addEventListener("submit", joinTournament);
    
    // Add event listener for cancel button
    document.getElementById("cancelJoin").addEventListener("click", hideJoinForm);
};

function showJoinForm(tournamentId, tournamentName, entryFee) {
    if (enrolledTournaments.some(t => t.tournamentId === tournamentId)) {
        alert("You are already enrolled in this tournament!");
        return;
    }

    let walletBalance = parseFloat(document.getElementById("walletBalance").innerText);
    if (walletBalance >= entryFee) {
        let form = document.getElementById("joinTournamentForm");
        form.classList.remove("hidden");
        form.dataset.tournamentId = tournamentId;
        form.dataset.tournamentName = tournamentName;
        form.dataset.entryFee = entryFee;
        
        // Clear form fields when showing
        document.getElementById("username").value = "";
        document.getElementById("college").value = "";
        document.getElementById("gender").value = "";
    } else {
        alert("Insufficient funds! Please add more money to your wallet.");
    }
}

function hideJoinForm() {
    document.getElementById("joinTournamentForm").classList.add("hidden");
}

function joinTournament(event) {
    event.preventDefault();

    let username = document.getElementById("username").value.trim();
    let college = document.getElementById("college").value.trim();
    let gender = document.getElementById("gender").value;
    let tournamentId = parseInt(document.getElementById("joinTournamentForm").dataset.tournamentId);
    let tournamentName = document.getElementById("joinTournamentForm").dataset.tournamentName;
    let entryFee = parseFloat(document.getElementById("joinTournamentForm").dataset.entryFee);

    if (!username || !college || !gender) {
        alert("All fields are required!");
        return;
    }

    let walletBalance = parseFloat(document.getElementById("walletBalance").innerText);
    if (walletBalance < entryFee) {
        alert("Insufficient funds! Please add more money to your wallet.");
        return;
    }

    // Deduct fee and update balance
    walletBalance -= entryFee;
    document.getElementById("walletBalance").innerText = walletBalance.toFixed(2);
    localStorage.setItem("walletBalance", walletBalance.toFixed(2));

    // Store enrolled tournament
    enrolledTournaments.push({ username, college, gender, tournamentId, tournamentName, entryFee });
    localStorage.setItem("enrolledTournaments", JSON.stringify(enrolledTournaments));

    updateEnrolledTournaments();
    disableAlreadyEnrolledButtons();

    // Hide the form after successful enrollment
    hideJoinForm();
    
    alert(`You have successfully joined ${tournamentName}! An entry fee of $${entryFee} has been deducted.`);
}

function quitTournament(tournamentId) {
    let tournament = enrolledTournaments.find(t => t.tournamentId === tournamentId);
    if (!tournament) return;

    if (confirm(`Are you sure you want to quit ${tournament.tournamentName}?`)) {
        enrolledTournaments = enrolledTournaments.filter(t => t.tournamentId !== tournamentId);
        localStorage.setItem("enrolledTournaments", JSON.stringify(enrolledTournaments));

        let walletBalance = parseFloat(document.getElementById("walletBalance").innerText);
        let refundAmount = tournament.entryFee / 2; 
        walletBalance += refundAmount;
        document.getElementById("walletBalance").innerText = walletBalance.toFixed(2);
        localStorage.setItem("walletBalance", walletBalance.toFixed(2));

        updateEnrolledTournaments();
        enableJoinButton(tournamentId);

        alert(`You have left the tournament and $${refundAmount} has been refunded.`);
    }
}

function updateEnrolledTournaments() {
    let enrolledSection = document.getElementById("enrolledTournaments");
    enrolledSection.innerHTML = "";

    if (enrolledTournaments.length === 0) {
        enrolledSection.innerText = "No enrolled tournaments";
        return;
    }

    enrolledTournaments.forEach(tournament => {
        let div = document.createElement("div");
        div.classList.add("enrolled-tournament");
        div.innerHTML = `<div class="table-div">
            <span>${tournament.tournamentName}</span>
            <button onclick="quitTournament(${tournament.tournamentId})" class="quit-btn">Quit</button>
            </div>
        `;
        enrolledSection.appendChild(div);
    });
}

function disableAlreadyEnrolledButtons() {
    enrolledTournaments.forEach(t => {
        let btn = document.getElementById(`joinBtn-${t.tournamentId}`);
        if (btn) btn.disabled = true;
    });
}

function enableJoinButton(tournamentId) {
    let btn = document.getElementById(`joinBtn-${tournamentId}`);
    if (btn) btn.disabled = false;
}

function addFunds() {
    let amount = prompt("Enter amount to add:");
    if (!amount || isNaN(amount) || amount <= 0) {
        alert("Invalid amount.");
        return;
    }

    walletBalance += parseFloat(amount);
    document.getElementById("walletBalance").innerText = walletBalance.toFixed(2);
    localStorage.setItem("walletBalance", walletBalance.toFixed(2));
}