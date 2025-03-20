const express = require('express');
const path = require('path');
const ejs = require('ejs');
const authrouter = require('./routes/auth');
const db = require('./routes/databasecongi');
const app = express();
const PORT = 3000;
const session = require('express-session');

app.use(session({
    secret: 'your_secret_key', // Replace with a secure key
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Set to true if using HTTPS
}));

// Add request logger middleware
app.use((req, res, next) => {
    //   console.log(`Request URL: ${req.url}`);
    next();
});

// Middleware to parse form data
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

app.use(authrouter);
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

    console.log(`Rendering ${role}/${subpage}, Session Email: ${req.session.userEmail}`);
    let data = {};

    // Handle coordinator_profile
    if (subpage === "coordinator_profile" && role === "coordinator") {
        if (!req.session.userEmail) {
            console.log("No user email in session, redirecting to login");
            return res.redirect('/?error-message=Please log in');
        }

        db.get(
            "SELECT id, email, college FROM users WHERE email = ? AND role = 'coordinator'",
            [req.session.userEmail],
            (err, row) => {
                if (err) {
                    console.error("Database Error:", err);
                    return res.redirect('/coordinator_dashboard?error-message=Database Error');
                }
                if (!row) {
                    console.log("No coordinator found for email:", req.session.userEmail);
                    return res.redirect('/coordinator_dashboard?error-message=Coordinator not found');
                }

                console.log("Rendering coordinator_profile with data:", row);
                res.render('coordinator/coordinator_profile', {
                    coordinator: row,
                    successMessage: req.query['success-message'],
                    errorMessage: req.query['error-message']
                });
            }
        );
        return; // Stop further execution
    }

    // Handle other async subpages
    if (subpage === 'coordinator_management') {
        db.all("SELECT name, email, college FROM users WHERE role = 'coordinator'", [], (err, rows) => {
            if (err) {
                console.error("Database Error:", err);
                return res.redirect('/admin_dashboard?error-message=Database Error');
            }
            res.render(`${role}/${subpage}`, { 
                successMessage: req.query['success-message'],
                errorMessage: req.query['error-message'],
                coordinators: rows
            });
        });
        return;
    }
    if (subpage === 'organizer_management' && role === 'admin') {
        db.all("SELECT name, email, college FROM users WHERE role = 'organizer'", [], (err, rows) => {
            if (err) {
                console.error("Database Error:", err);
                return res.redirect('/admin_dashboard?error-message=Database Error');
            }
            res.render(`${role}/${subpage}`, { 
                successMessage: req.query['success-message'],
                errorMessage: req.query['error-message'],
                organizers: rows
            });
        });
        return;
    }
    if (subpage === 'tournament_management' && role === 'coordinator') {
        db.all("SELECT * FROM tournaments", [], (err, tournaments) => {
            if (err) {
                console.error("Database Error:", err);
                return res.redirect('/coordinator_dashboard?error-message=Database Error');
            }
            res.render('coordinator/tournament_management', { 
                tournaments,
                successMessage: req.query['success-message'],
                errorMessage: req.query['error-message'],
                tournamentName: '', // Default empty values
                tournamentDate: '',
                tournamentLocation: '',
                entryFee: ''
            });
        });
        return;
    }

    if (subpage === 'organizer_tournament' && role === 'organizer') {
        db.all("SELECT * FROM tournaments", [], (err, tournaments) => {
            if (err) {
                console.error("Database Error:", err);
                return res.redirect('/organizer_dashboard?error-message=Database Error');
            }
            res.render('organizer/organizer_tournament', { 
                tournaments: tournaments || [], 
                successMessage: req.query['success-message'],
                errorMessage: req.query['error-message']
            });
        });
        return;
    }

    if (subpage === 'admin_tournament_management' && role === 'admin') {
        console.log('Fetching approved tournaments with player counts for admin');
        db.all(
            `SELECT t.*, COUNT(tp.id) AS player_count 
             FROM tournaments t 
             LEFT JOIN tournament_players tp ON t.id = tp.tournament_id 
             WHERE LOWER(t.status) = 'approved' 
             GROUP BY t.id, t.name, t.date, t.location, t.entry_fee, t.status`,
            [],
            (err, tournaments) => {
                if (err) {
                    console.error("Database Error:", err);
                    return res.redirect('/admin_dashboard?error-message=Database Error');
                }
                console.log("✅ Fetched Tournaments with Player Counts for Admin:", tournaments);
                res.render('admin/admin_tournament_management', { 
                    tournaments: tournaments || [],
                    successMessage: req.query['success-message'],
                    errorMessage: req.query['error-message']
                });
            }
        );
        return;
    }
    if (subpage === 'player_tournament' && role === 'player') {
        const username=req.session.username;
        db.all("SELECT * FROM tournaments WHERE status = 'Approved'", [], (err, tournaments) => {
            if (err) {
                console.error("Error fetching tournaments:", err.message);
                return res.status(500).send("Error retrieving tournaments.");
            } 
            // Fetch enrolled tournaments for the logged-in user
            db.all(
                `SELECT t.* FROM tournament_players tp 
                 JOIN tournaments t ON tp.tournament_id = t.id 
                 WHERE tp.username = ?`,
                [username],
                (err, enrolledTournaments) => {
                    if (err) {
                        console.error("Error fetching enrolled tournaments:", err.message);
                        return res.status(500).send("Error retrieving enrolled tournaments.");
                    }
    
                    // Render page with both lists
                    res.render("player/player_tournament", {
                        tournaments,
                        enrolledTournaments, // Pass enrolled tournaments
                        username
                    });
                }
            );
        });
        return;
    }
    if(subpage === 'store_management' && role === 'coordinator')
    {
        db.all("SELECT * FROM products", [], (err, products) => {
            if (err) {
                console.error("Error fetching products:", err.message);
                return res.status(500).send("Could not retrieve products.");
            }
            res.render('coordinator/store_management', { products });
        });
        return;
    }
    if (subpage === 'store' && role === 'player') {
        db.all("SELECT * FROM products", [], (err, products) => {
            if (err) {
                console.error("Database Error:", err);
                return res.status(500).send("Error fetching products");
            }
            if (!req.session.playerName || !req.session.playerCollege) {
                return res.redirect('/login'); // Redirect if session is missing
            }
            const walletBalance = req.session.walletBalance || 0;
            res.render("player/store", { 
                products, 
                walletBalance, 
                playerName: req.session.playerName,  // ✅ Pass player name
                playerCollege: req.session.playerCollege  // ✅ Pass player college
            });
        });
        return;
    }
    
    if (subpage === 'store_monitoring' && role === 'organizer') {
        
        const productsQuery = "SELECT id, name, price, coordinator, college, image_url FROM products";
        const salesQuery = 
            "SELECT p.name AS product, p.price, p.coordinator, s.college AS college, s.buyer, s.purchase_date " +
            "FROM sales s JOIN products p ON s.product_id = p.id;";
        db.all(productsQuery, [], (err, products) => {
            if (err) {
                console.error("Error fetching products:", err);
                return res.status(500).send("Error fetching products.");
            }
            db.all(salesQuery, [], (err, sales) => {
                if (err) {
                    console.error("Error fetching sales:", err);
                    return res.status(500).send("Error fetching sales.");
                }
                console.log("Sales Data:", sales); // Log the sales data
                res.render("organizer/store_monitoring", { products, sales });
            });
        });
        return;
    }
    if (subpage === "coordinator_meetings") {
        const query = "SELECT * FROM meetingsdb ORDER BY date, time";
        db.all(query, [], (err, results) => {
            if (err) {
                console.error('Error fetching meetings:', err);
                return res.status(500).send('Database error');
            }
            res.render('coordinator/coordinator_meetings', { meetings: results });
        });
        return;
    }
    if (subpage === 'meetings') {
        const query = "SELECT * FROM organizermeetings ORDER BY date, time";
        db.all(query, [], (err, results) => {
            if (err) {
                console.error('Error fetching meetings:', err);
                return res.status(500).send('Database error');
            }
            res.render('organizer/meetings', { organizermeetings: results });
        });
        return;
    }
    // Handle synchronous subpages
    if (subpage === 'global_chat') {
        data.messages = [
            { sender: "John", text: "Hi everyone!" },
            { sender: "Jane", text: "Welcome to ChessHive!" }
        ];
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
    if (subpage === 'payments') {
        data.players = [
            { name: "Michael Johnson", subscriptionLevel: 2, paymentStatus: "Paid" },
            { name: "Sarah Williams", subscriptionLevel: 3, paymentStatus: "Pending" },
            { name: "David Brown", subscriptionLevel: 1, paymentStatus: "Paid" }
        ];
    }
    if (subpage === "coordinator_chat") {
        data.users = [
            { username: "John" },
            { username: "Jane" }
        ];
        data.messages = [
            { sender: "John", text: "Hi everyone!" },
            { sender: "Jane", text: "Welcome to ChessHive!" }
        ];
        data.currentUser = "";
    }
    if (subpage === "player_stats") {
        data.players = [
            { name: "John Doe", gamesPlayed: 10, wins: 6, losses: 3, draws: 1, rating: 1500 },
            { name: "Jane Smith", gamesPlayed: 8, wins: 4, losses: 2, draws: 2, rating: 1450 }
        ];
    }
    if (subpage === "store") {
        data.walletBalance = 100;
    }
    if (subpage === "subscription") {
        data.walletBalance = 100;
    }
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
    if (subpage === 'organizer_profile') {
        data.organizer = {
            name: "John Doe",
            email: "johndoe@example.com",
            experience: "10 Years in Chess Tournament Management"
        };
    }

    // Final render for unhandled synchronous subpages
    try {
        res.render(`${role}/${subpage}`, { 
            successMessage: req.query['success-message'],
            errorMessage: req.query['error-message'],
            ...data
        });
    } catch (err) {
        console.error(`Error rendering ${role}/${subpage}:`, err);
        res.redirect(`/${role}_dashboard?error-message=Page not found: ${subpage}`);
    }
});
// Handle Login Form (Redirects Admin & Organizer)
app.post('/login', (req, res) => {
    const { email, password } = req.body;

    // Query the database for user with given email and password
    db.get("SELECT * FROM users WHERE email = ? AND password = ?", [email, password], (err, user) => {
        if (err) {
            console.error("Database Error:", err);
            return res.redirect('/?error-message=Database Error');
        }
        if (!user) {
            return res.redirect('/login?error-message=Invalid credentials');
        }

        // Store the user's email and role in the session
        req.session.userEmail = user.email;
        req.session.userRole = user.role; // Added to support isAdmin middleware
        // Store the user's email in the session
        req.session.username = user.name;
        req.session.playerName = user.name; // Assuming 'name' exists in your 'users' table
        req.session.playerCollege = user.college; // Assuming 'college' exists in your 'users' table


        console.log(`User Login: ${user.email}, Role: ${user.role}, Session set: ${req.session.userEmail}`);

        // Redirect user based on role
        switch (user.role) {
            case 'admin':
                return res.redirect('/admin_dashboard?success-message=Admin Login Successful');
            case 'organizer':
                return res.redirect('/organizer_dashboard?success-message=Organizer Login Successful');
            case 'coordinator':
                return res.redirect('/coordinator_dashboard?success-message=Coordinator Login Successful');
            case 'player':
                return res.redirect('/player_dashboard?success-message=Player Login Successful');
            default:
                return res.redirect('/?error-message=Invalid Role');
        }
    });
});

// Middleware for admin authorization
const isAdmin = (req, res, next) => {
    if (req.session.userRole === 'admin') {
        next();
    } else {
        res.status(403).json({ success: false, message: 'Unauthorized' });
    }
};
//Middleware for admin or organiser authorization
const isAdminOrOrganizer = (req, res, next) => {
    if (req.session.userRole === 'admin' || req.session.userRole === 'organizer') {
        return next(); // Proceed if user is admin or organizer
    }
    res.status(403).json({ success: false, message: 'Unauthorized' });
};


// Remove coordinator route
app.delete('/coordinators/remove/:email', isAdminOrOrganizer, (req, res) => {
    const email = req.params.email;
    db.run("DELETE FROM users WHERE email = ? AND role = 'coordinator'", [email], function(err) {
        if (err) {
            console.error("Database Error:", err);
            return res.status(500).json({ success: false, message: 'Database Error' });
        }
        if (this.changes === 0) {
            return res.status(404).json({ success: false, message: 'Coordinator not found' });
        }
        res.json({ success: true, message: 'Coordinator removed successfully' });
    });
});

// Remove organizer route
app.delete('/organizers/remove/:email', isAdmin, (req, res) => {
    const email = req.params.email;
    db.run("DELETE FROM users WHERE email = ? AND role = 'organizer'", [email], function(err) {
        if (err) {
            console.error("Database Error:", err);
            return res.status(500).json({ success: false, message: 'Database Error' });
        }
        if (this.changes === 0) {
            return res.status(404).json({ success: false, message: 'Organizer not found' });
        }
        res.json({ success: true, message: 'Organizer removed successfully' });
    });
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