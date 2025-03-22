const express = require('express');
const router = express.Router();
const db = require('./databasecongi');

router.post('/signup', (req, res) => {
    console.log("hi");
    const { name, dob, gender, college, email, phone, password, role } = req.body;
    let errors = {};

    if (!name.trim()) errors.name = "Full Name is required.";
    if (!dob.trim()) errors.dob = "Date of Birth is required.";
    if (!gender.trim()) errors.gender = "Gender is required.";
    if (!college.trim()) errors.college = "College is required.";
    if (!email.trim()) errors.email = "Email is required.";
    if (!phone.trim()) errors.phone = "Phone Number is required.";
    if (phone.length !== 10) errors.phone = "Phone Number must be 10 digits.";
    if (!password.trim()) errors.password = "Password is required.";
    if (!role.trim()) errors.role = "Role is required.";

    // ✅ If there are errors, re-render the form with errors
    console.log(errors);
    if (Object.keys(errors).length > 0) {
        return res.render('signup', { 
            errors, 
            name, dob, gender, college, email, phone, role
        });
    }

    db.run(
        "INSERT INTO users (name, dob, gender, college, email, phone, password, role) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
        [name, dob, gender, college, email, phone, password, role],
        (err) => {
            if (err) {
                console.error("Error inserting user:", err.message);
                return res.send("Error: User already exists or invalid data.");
            }
            // Move db.all inside the callback
            db.all("SELECT * FROM users", [], (err, rows) => {
                if (err) {
                    console.error("Error fetching users:", err.message);
                    return res.status(500).send("Error fetching users");
                }
                console.table(rows);
                res.redirect("/login");
            });
        }
    );
     
});

router.post('/tournament_management', (req, res) => {
    console.log("hi");
    console.log("Received request to add tournament:", req.body);
    const { tournamentName, tournamentDate, tournamentLocation, entryFee } = req.body;
    let errors = {};
    if (!tournamentName.trim()) errors.name = "Tournament Name is required.";
    if (!tournamentDate.trim()) errors.date = "Tournament Date is required.";
    if (!tournamentLocation.trim()) errors.location = "Location is required.";
    if (!entryFee || isNaN(entryFee) || entryFee < 0) errors.entryFee = "Valid Entry Fee is required.";

    console.log(errors);
    if (Object.keys(errors).length > 0) {
        db.all("SELECT * FROM tournaments", [], (err, tournaments) => {
            if (err) {
                console.error("Error fetching tournaments:", err.message);
                return res.status(500).send("Error: Could not fetch tournaments.");
            }
            res.render('coordinator/tournament_management', { 
                errors, 
                tournamentName, 
                tournamentDate, 
                tournamentLocation, 
                entryFee,
                tournaments,
                successMessage: '',
                errorMessage: 'Please correct the errors below'
            });
        });
        return;
    }
    db.run(
        "INSERT INTO tournaments (name, date, location, entry_fee, status) VALUES (?, ?, ?, ?, ?)",
        [tournamentName, tournamentDate, tournamentLocation, entryFee],
        function (err) {
            if (err) {
                console.error("Error inserting tournament:", err.message);
                return res.status(500).send("Error: Could not add tournament.");
            }
            console.log("Tournament added successfully."); 
            db.all("SELECT * FROM tournaments", [], (err, rows) => {
                if (err) {
                    console.error("Error fetching tournaments:", err.message);
                    return res.status(500).send("Error: Could not fetch tournaments.");
                }
                console.table(rows); 
                res.redirect("/coordinator/tournament_management?success-message=Tournament added successfully"); 
            });
        }
    );
});

// New routes for approval/rejection
router.post('/organizer/approve-tournament', (req, res) => {
    const { tournamentId } = req.body;
    db.run(
        "UPDATE tournaments SET status = 'Approved' WHERE id = ?",
        [tournamentId],
        function (err) {
            if (err) {
                console.error("Error approving tournament:", err.message);
                return res.redirect('/organizer/organizer_tournament?error-message=Failed to approve tournament');
            }
            console.log(`Tournament ${tournamentId} approved`);
            res.redirect('/organizer/organizer_tournament?success-message=Tournament approved successfully');
        }
    );
});

router.post('/organizer/reject-tournament', (req, res) => {
    const { tournamentId } = req.body;
    db.run(
        "UPDATE tournaments SET status = 'Rejected' WHERE id = ?",
        [tournamentId],
        function (err) {
            if (err) {
                console.error("Error rejecting tournament:", err.message);
                return res.redirect('/organizer/organizer_tournament?error-message=Failed to reject tournament');
            }
            console.log(`Tournament ${tournamentId} rejected`);
            res.redirect('/organizer/organizer_tournament?success-message=Tournament rejected successfully');
        }
    );
});

router.post("/player/join-tournament", (req, res) => {
    const { tournamentId,username, college, gender } = req.body; // Remove 'username' from req.body
    if (!req.session.username) {
        return res.redirect('/?error-message=Please log in');
    }
    if (username !== req.session.username) {
        console.log(`Username mismatch: ${username} does not match session username ${req.session.username}`);
        return res.redirect('/player/player_tournament?error-message=Invalid Username, please use your logged-in username');
    }
    if (!tournamentId || !college || !gender) {
        return res.status(400).send("All fields are required.");
    }

    db.run(
        "INSERT INTO tournament_players (tournament_id, username, college, gender) VALUES (?, ?, ?, ?)",
        [tournamentId, req.session.username, college, gender],
        function (err) {
            if (err) {
                console.error("Error joining tournament:", err.message);
                return res.status(500).send("Error: Could not join tournament.");
            }
            console.log(`Player ${req.session.username} joined tournament ID: ${tournamentId}`);
            db.all("SELECT * FROM tournament_players", [], (err, rows) => {
                if (err) {
                    console.error("Error fetching tournament players:", err.message);
                } else {
                    console.log("Current Tournament Players:");
                    console.table(rows);
                }
                res.redirect("/player/player_tournament");
            });
        }
    );
});

router.post('/coordinator/add-product', (req, res) => {
    const { productName, productPrice, productImage, coordinatorName, collegeName } = req.body;

    if (!productName || !productPrice || !productImage || !coordinatorName || !collegeName) {
        return res.send("All fields are required.");
    }

    db.run(
        "INSERT INTO products (name, price, image_url, coordinator, college) VALUES (?, ?, ?, ?, ?)",
        [productName, productPrice, productImage, coordinatorName, collegeName],
        function (err) {
            if (err) {
                console.error("Error adding product:", err.message);
                return res.send("Could not add product.");
            }
            db.all("SELECT * FROM products", [], (err, rows) => {
                if (err) {
                    console.error("Error fetching products:", err.message);
                    return;
                }
                console.log("Current Products Table Entries:");
                console.table(rows);
            });
            res.redirect('/coordinator/store_management');
        }
    );
});

router.post("/buy", (req, res) => {
    console.log("req.body:", req.body);
    const { productId, price, buyer, college } = req.body;

    if (!productId || !price || !buyer || !college) {
        return res.send("Error: Missing required fields.");
    }
    
    db.run(
        "INSERT INTO sales (product_id, price, buyer, college, purchase_date) VALUES (?, ?, ?, ?, datetime('now'))",
        [productId, price, buyer, college],
        function (err) {
            if (err) {
                console.error("Error inserting into sales:", err.message);
                return res.send("Purchase failed.");
            }
            res.redirect("/player/store");
        }
    );
});

// Route to schedule a new meeting (Coordinator-Specific)
router.post('/coordinator/coordinator_meetings/schedule', (req, res) => {
    const { title, date, time, link } = req.body;

    const query = `INSERT INTO meetingsdb (title, date, time, link) VALUES (?, ?, ?, ?)`;
    db.run(query, [title, date, time, link], function (err) {
        if (err) {
            console.error('Error scheduling meeting:', err);
            return res.status(500).send('Database error');
        }
         // Fetch all entries from meetingsdb after inserting a new one
         db.all("SELECT * FROM meetingsdb", [], (err, rows) => {
            if (err) {
                console.error('Error retrieving meetings:', err);
            } else {
                console.log('Current Meetings in DB:', rows);
            }
        });
        res.redirect('/coordinator/coordinator_meetings');
    });
});

router.post('/meetings/schedule', (req, res) => {
    const { title, date, time, link } = req.body;

    const query = `INSERT INTO organizermeetings (title, date, time, link) VALUES (?, ?, ?, ?)`;
    db.run(query, [title, date, time, link], function (err) {
        if (err) {
            console.error('Error scheduling meeting:', err);
            return res.status(500).send('Database error');
        }
         // Fetch all entries from meetingsdb after inserting a new one
         db.all("SELECT * FROM organizermeetings", [], (err, rows) => {
            if (err) {
                console.error('Error retrieving meetings:', err);
            } else {
                console.log('Current Meetings in DB:', rows);
            }
        });
        res.redirect('/coordinator/coordinator_meetings');
    });
});
module.exports = router;