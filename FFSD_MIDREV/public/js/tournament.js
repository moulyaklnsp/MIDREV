function joinTournament(tournamentId) {
    document.getElementById("tournamentId").value = tournamentId;
    document.getElementById("joinTournamentForm").classList.remove("hidden");
}

document.getElementById("cancelJoin").addEventListener("click", function () {
    document.getElementById("joinTournamentForm").classList.add("hidden");
});