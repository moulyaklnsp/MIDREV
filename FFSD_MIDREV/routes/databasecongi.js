const sqlite3 = require("sqlite3").verbose();

// Connect to Users Database
const db = new sqlite3.Database("./users.db", (err) => {
    if (err) {
        console.error("Error opening users database:", err.message);
    } else {
        console.log("Connected to users database.");
    }
});

// Create Users Table (if not exists)
db.serialize(() => {
    db.run(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            dob DATE NOT NULL,
            gender TEXT CHECK(gender IN ('male', 'female', 'other')) NOT NULL,
            college TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            phone TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            role TEXT CHECK(role IN ('admin','player', 'coordinator', 'organizer')) NOT NULL
        )
    `, (err) => {
        if (err) console.error("Error creating users table:", err.message);
        else console.log("Users table is ready.");
    });
});

// Connect to Tournaments Database
const db1 = new sqlite3.Database("./tournaments.db", (err) => {
    if (err) {
        console.error("Error opening tournaments database:", err.message);
    } else {
        console.log("Connected to tournaments database.");
    }
});

// Create Tournaments Table (if not exists)
db1.serialize(() => {
    db1.run(`
        CREATE TABLE IF NOT EXISTS tournaments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            date TEXT NOT NULL,
            location TEXT NOT NULL,
            entry_fee REAL NOT NULL,
            status TEXT DEFAULT 'Pending'
        )
    `, (err) => {
        if (err) console.error("Error creating tournaments table:", err.message);
        else console.log("Tournaments table is ready.");
    });

    db1.run(`
        CREATE TABLE IF NOT EXISTS tournament_players (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            tournament_id INTEGER,
            username TEXT,
            college TEXT,
            gender TEXT,
            FOREIGN KEY (tournament_id) REFERENCES tournaments(id)
        )`);

});

// Export both database connections
module.exports = { db, db1 };
