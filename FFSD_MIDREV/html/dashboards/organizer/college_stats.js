// college_stats.js
// Sample data
const collegePerformance = [
    { college: 'College A', tournaments: 10, wins: 6, losses: 3, draws: 1 },
    { college: 'College B', tournaments: 8, wins: 5, losses: 2, draws: 1 },
    // Add more data as needed
];

const tournamentRecords = [
    { name: 'Spring Invitational', college: 'College A', format: 'Classical', position: 1, date: '2025-03-15' },
    { name: 'Rapid Challenge', college: 'College B', format: 'Rapid', position: 2, date: '2025-04-10' },
    // Add more data as needed
];

const topCollegesByFormat = {
    classical: ['College A', 'College C', 'College B'],
    rapid: ['College B', 'College A', 'College D'],
    blitz: ['College C', 'College B', 'College A'],
};

// Function to populate overall performance table
function populatePerformanceTable() {
    const tableBody = document.querySelector('#performance-table tbody');
    tableBody.innerHTML = '';
    collegePerformance.forEach(record => {
        const row = document.createElement('tr');
        const winRate = ((record.wins / record.tournaments) * 100).toFixed(1);
        row.innerHTML = `
            <td>${record.college}</td>
            <td>${record.tournaments}</td>
            <td>${record.wins}</td>
            <td>${record.losses}</td>
            <td>${record.draws}</td>
            <td>${winRate}%</td>
        `;
        tableBody.appendChild(row);
    });
}

// Function to populate tournament records table
function populateRecordsTable() {
    const tableBody = document.querySelector('#records-table tbody');
    tableBody.innerHTML = '';
    
    // Sort records by date (most recent first)
    const sortedRecords = [...tournamentRecords].sort((a, b) => 
        new Date(b.date) - new Date(a.date)
    );

    sortedRecords.forEach(record => {
        const row = document.createElement('tr');
        const formattedDate = new Date(record.date).toLocaleDateString();
        row.innerHTML = `
            <td>${record.name}</td>
            <td>${record.college}</td>
            <td>${record.format}</td>
            <td>${record.position}</td>
            <td>${formattedDate}</td>
        `;
        tableBody.appendChild(row);
    });
}

// Function to populate leaderboards
function populateLeaderboards() {
    const formats = ['classical', 'rapid', 'blitz'];
    formats.forEach(format => {
        const leaderboard = document.querySelector(`#${format}-list`);
        leaderboard.innerHTML = '';
        
        topCollegesByFormat[format].forEach((college, index) => {
            const li = document.createElement('li');
            li.className = index < 3 ? 'top-three' : ''; // Add class for top 3 positions
            li.innerHTML = `${college}`;
            leaderboard.appendChild(li);
        });
    });
}

// Function to calculate and display statistics
function displayStatistics() {
    const statsContainer = document.querySelector('#statistics');
    if (!statsContainer) {
        console.error("Error: #statistics container not found!");
        return;
    }else{
    
    const totalTournaments = collegePerformance.reduce((sum, record) => 
        sum + record.tournaments, 0);
    
    const totalMatches = collegePerformance.reduce((sum, record) => 
        sum + record.wins + record.losses + record.draws, 0);
    
    const averageWinRate = collegePerformance.reduce((sum, record) => 
        sum + (record.wins / record.tournaments), 0) / collegePerformance.length;

    statsContainer.innerHTML = `
        <div class="stats">
            <h3>Total Tournaments</h3>
            <p>${totalTournaments}</p>
        </div>
        <div class="stats">
            <h3>Total Matches</h3>
            <p>${totalMatches}</p>
        </div>
        <div class="stats">
            <h3>Average Win Rate</h3>
            <p>${averageWinRate.toFixed(1)}%</p>
        </div>
    `;
}
}

// Function to initialize the dashboard
function initializeDashboard() {
    populatePerformanceTable();
    populateRecordsTable();
    populateLeaderboards();
    displayStatistics();
}

// Event listeners for sorting and filtering
document.addEventListener('DOMContentLoaded', () => {
    initializeDashboard();
    
    // Add refresh button functionality
    const refreshButton = document.querySelector('#refresh-data');
    if (refreshButton) {
        refreshButton.addEventListener('click', initializeDashboard);
    }
    
    // Add format filter functionality
    const formatFilter = document.querySelector('#format-filter');
    if (formatFilter) {
        formatFilter.addEventListener('change', (e) => {
            const selectedFormat = e.target.value;
            const records = document.querySelectorAll('#records-table tbody tr');
            
            records.forEach(row => {
                const format = row.children[2].textContent;
                row.style.display = 
                    selectedFormat === 'all' || format.toLowerCase() === selectedFormat
                        ? ''
                        : 'none';
            });
        });
    }
});
    