const express = require('express');
const path = require('path');
const ejs = require('ejs');

const app = express();
const PORT = 3000;

// Array to store meetings data
const meetings = [];

// Add request logger middleware
app.use((req, res, next) => {
  console.log(`Request URL: ${req.url}`);
  next();
});

// Middleware to parse form data
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// Set EJS as the view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Prevent favicon error
app.get('/favicon.ico', (req, res) => res.status(204));

// Home Route
app.get('/', (req, res) => {
    res.render('index', { 
        successMessage: req.query['success-message'], 
        errorMessage: req.query['error-message']
    });
});

// Define specific dashboard routes first (before parametric routes)
app.get('/admin_dashboard', (req, res) => {
    console.log('Rendering admin dashboard');
    res.render('admin/admin_dashboard', {
        successMessage: req.query['success-message'],
        errorMessage: req.query['error-message']
    });
});

app.get('/organizer_dashboard', (req, res) => {
    console.log('Rendering organizer dashboard');
    res.render('organizer/organizer_dashboard', {
        successMessage: req.query['success-message'],
        errorMessage: req.query['error-message']
    });
});

app.get('/coordinator_dashboard', (req, res) => {
    console.log('Rendering coordinator dashboard');
    res.render('coordinator/coordinator_dashboard', {
        successMessage: req.query['success-message'],
        errorMessage: req.query['error-message']
    });
});

app.get('/player_dashboard', (req, res) => {
    console.log('Rendering player dashboard');
    res.render('player/player_dashboard', {
        successMessage: req.query['success-message'],
        errorMessage: req.query['error-message']
    });
});

// Dynamic Routing for role-specific subpages
app.get('/:role/:subpage', (req, res) => {
    const { role, subpage } = req.params;

    // Validate roles
    if (role !== 'admin' && role !== 'organizer' && role !== 'coordinator' && role !== 'player') {
        return res.redirect('/?error-message=Invalid Role');
    }

    console.log(`Rendering ${role}/${subpage}`);
    let data = {};

    // Handle Dynamic Data for Specific Pages
    //admin_dashboard

    if (subpage === 'coordinator_management' && role === 'admin') {
        data.coordinators = [
            { name: "Jane Smith", email: "jane@example.com", college: "ABC Institute" },
            { name: "John Doe", email: "john@example.com", college: "XYZ University" }
        ];
    }

    if (subpage === 'organizer_management' && role === 'admin') {
        data.organizers = [
            { name: "Alice Johnson", email: "alice@example.com", college: "DEF College" },
            { name: "Bob Brown", email: "bob@example.com", college: "GHI University" }
        ];
    }

    if (subpage === 'global_chat') {
        data.messages = [
            { sender: "John", text: "Hi everyone!" },
            { sender: "Jane", text: "Welcome to ChessHive!" }
        ];
    }

    if (subpage === 'payments') {
        data.players = [
            { name: "Michael Johnson", subscriptionLevel: 2, paymentStatus: "Paid" },
            { name: "Sarah Williams", subscriptionLevel: 3, paymentStatus: "Pending" },
            { name: "David Brown", subscriptionLevel: 1, paymentStatus: "Paid" }
        ];
    }

    //organizer_dashboard
    if (subpage === "chat") {
        data.users = [
            { username: "John" },
            { username: "Jane" }
        ];
        data.messages = [
            { sender: "John", text: "Hi everyone!" },
            { sender: "Jane", text: "Welcome to ChessHive!" }
        ];
        data.currentUser = ""; // Can be set dynamically when a user logs in
    }

    if (subpage === 'college_stats') {
        console.log("Injecting College Stats Data");

        data.collegePerformance = [
            { college: 'College A', tournaments: 10, wins: 6, losses: 3, draws: 1 },
            { college: 'College B', tournaments: 8, wins: 5, losses: 2, draws: 1 },
            { college: 'College C', tournaments: 12, wins: 7, losses: 4, draws: 1 }
        ];

        data.tournamentRecords = [
            { name: 'Spring Invitational', college: 'College A', format: 'Classical', position: 1, date: '2025-03-15' },
            { name: 'Rapid Challenge', college: 'College B', format: 'Rapid', position: 2, date: '2025-04-10' },
            { name: 'Blitz Masters', college: 'College C', format: 'Blitz', position: 3, date: '2025-05-20' }
        ];

        data.topCollegesByFormat = {
            classical: ['College A', 'College C', 'College B'],
            rapid: ['College B', 'College A', 'College D'],
            blitz: ['College C', 'College B', 'College A']
        };
    }

    if (subpage === 'coordinator_management') {
        data.coordinators = [
            { name: "John Doe", email: "john@example.com", college: "XYZ University" },
            { name: "Jane Smith", email: "jane@example.com", college: "ABC Institute" }
        ];
    }

    if (subpage === 'meetings') {
        // Use the meetings array
        data.meetings = meetings.length > 0 ? meetings : [
            { title: "Strategy Session", date: "2025-03-20", time: "14:00", link: "#" }
        ];
    }

    if (subpage === 'organizer_profile') {
        data.organizer = {
            name: "John Doe",
            email: "johndoe@example.com",
            experience: "10 Years in Chess Tournament Management"
        };
    }

    //coordinator_dashboard
    if (subpage === "coordinator_chat") {
        data.users = [
            { username: "John" },
            { username: "Jane" }
        ];
        data.messages = [
            { sender: "John", text: "Hi everyone!" },
            { sender: "Jane", text: "Welcome to ChessHive!" }
        ];
        data.currentUser = ""; // Can be set dynamically when a user logs in
    }

    if (subpage === "coordinator_profile") {
        data.coordinator = {
            id: "COORD12345",
            email: "coordinator@example.com",
            college: "XYZ University"
        };
    
        data.pendingPlayers = [
            { name: "John Doe", game: "Soccer" },
            { name: "Jane Smith", game: "Basketball" }
        ];
    }

    if (subpage === "coordinator_meetings") {
        data.meetings = [
            { title: "Strategy Session", date: "2025-03-20", time: "14:00", link: "#" }
        ];
    }

    if (subpage === "player_stats") {
        data.players = [
            { name: "John Doe", gamesPlayed: 10, wins: 6, losses: 3, draws: 1, rating: 1500 },
            { name: "Jane Smith", gamesPlayed: 8, wins: 4, losses: 2, draws: 2, rating: 1450 }
        ];
    }

    //player_dashboard
    if (subpage === "player_chat") {
        data.users = [
            { username: "John" },
            { username: "Jane" }
        ];
        data.messages = [
            { sender: "John", text: "Hi everyone!" },
            { sender: "Jane", text: "Welcome to ChessHive!" }
        ];
        data.currentUser = ""; // Can be set dynamically when a user logs in
    }

    if (subpage === "player_profile") {
        data.player = {
            name: 'John Doe',
            email: 'johndoe@example.com',
            phone: '123-456-7890',
            fideId: '12345678',
            aicfId: '87654321',
            subscriptionLevel: 'Basic Plan',
            wins: 10,
            losses: 5,
            winRate: '66.67%',
            walletBalance: '50.00',
            purchases: ['Chess Set', 'Premium Membership'],
            tournaments: ['National Open 2024', 'City Championship']
        };
    }

    if (subpage === "store") {
        data.walletBalance= 100
    }

    if (subpage === "subscription") {
        data.walletBalance= 100
    }

    // Check if the template exists (you might need to implement this)
    try {
        res.render(`${role}/${subpage}`, { 
            successMessage: req.query['success-message'],
            errorMessage: req.query['error-message'],
            ...data
        });
    } catch (err) {
        console.error(`Error rendering template ${role}/${subpage}:`, err);
        res.redirect(`/?error-message=Page not found: ${role}/${subpage}`);
    }
});

// Handle Login Form (Redirects Admin & Organizer)
app.post('/login', (req, res) => {
    const { email, role } = req.body; // Assume role is sent in form data
    console.log(`User Login: ${email}, Role: ${role}`);

    if (role === 'admin') {
        return res.redirect('/admin_dashboard?success-message=Admin Login Successful');
    } else if (role === 'organizer') {
        return res.redirect('/organizer_dashboard?success-message=Organizer Login Successful');
    }else if (role === 'coordinator') {
        return res.redirect('/coordinator_dashboard?success-message=Coordinator Login Successful');
    }else if (role === 'player') {
        return res.redirect('/player_dashboard?success-message=player Login Successful');
    }
    res.redirect('/?error-message=Invalid Role');
});

app.post("/meetings/schedule", (req, res) => {
    const { title, date, time, link } = req.body;
    meetings.push({ title, date, time, link });
    res.redirect("/organizer/meetings?success-message=Meeting scheduled successfully");
});

app.post('/coordinator/coordinator_meetings/schedule', (req, res) => {
    const { title, date, time, link } = req.body;
    
    // Ideally, store this data in a database. For now, log it.
    console.log("New Meeting Scheduled:", { title, date, time, link });
    res.redirect("/coordinator/coordinator_meetings?success-message=Meeting scheduled successfully");
});

app.post('/signup', (req, res) => {
    const { name, dob, gender, college, email, phone, password, role } = req.body;

    // Example: Save to database (pseudo-code)
    try {
        console.log("User signed up:", { name, email });
        res.redirect('/login');
    } catch (error) {
        res.render('signup', {
            errors: { email: "Email already exists" }, // Adjust based on actual error
            name, dob, gender, college, email, phone, role
        });
    }
});

// Dynamic Route Handler for general pages (AFTER more specific routes)
app.get('/:page', (req, res) => {
    const { page } = req.params;
    console.log(`Rendering page: ${page}`);
    
    // Prevent conflicting with admin/organizer dashboard routes
    if (page === 'admin_dashboard' || page === 'organizer_dashboard' || page === 'coordinator_dashboard' || page === 'player_dashboard') {
        return res.redirect(`/${page}`);
    }

    try {
        res.render(`${page}`, { 
            successMessage: req.query['success-message'], 
            errorMessage: req.query['error-message']
        });
    } catch (err) {
        console.error(`Error rendering template ${page}:`, err);
        res.redirect(`/?error-message=Page not found: ${page}`);
    }
});

// Add a 404 handler for any unmatched routes
app.use((req, res) => {
    console.log(`404: ${req.url}`);
    res.status(404).redirect('/?error-message=Page not found');
});

// Add error handling middleware
app.use((err, req, res, next) => {
    console.error('Server error:', err.stack);
    res.status(500).redirect('/?error-message=Server error occurred');
});

// Start Server
app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));