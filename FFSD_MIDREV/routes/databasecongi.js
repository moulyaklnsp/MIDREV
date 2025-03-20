const sqlite3 = require("sqlite3").verbose();

// Connect to Users Database
const db = new sqlite3.Database("./users.db", (err) => {
    if (err) {
        console.error("Error opening users database:", err.message);
    } else {
        console.log("Connected to users database.");
    }
});

// Create Tables
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
        if (err) console.error("❌ Error creating users table:", err.message);
        else console.log("✅ Users table is ready.");
    });

    db.run(`
        CREATE TABLE IF NOT EXISTS tournaments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            date TEXT NOT NULL,
            location TEXT NOT NULL,
            entry_fee REAL NOT NULL,
            status TEXT DEFAULT 'Pending'
        )
    `, (err) => {
        if (err) console.error("❌ Error creating tournaments table:", err.message);
        else console.log("✅ Tournaments table is ready.");
    });

    db.run(`
        CREATE TABLE IF NOT EXISTS tournament_players (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            tournament_id INTEGER,
            username TEXT,
            college TEXT,
            gender TEXT,
            FOREIGN KEY (tournament_id) REFERENCES tournaments(id)
        )
    `, (err) => {
        if (err) console.error("❌ Error creating tournament_players table:", err.message);
        else console.log("✅ Tournament Players table is ready.");
    });

    db.run(`
        CREATE TABLE IF NOT EXISTS products (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            price REAL NOT NULL,
            image_url TEXT NOT NULL,
            coordinator TEXT NOT NULL,
            college TEXT NOT NULL
        )
    `, (err) => {
        if (err) console.error("❌ Error creating products table:", err.message);
        else console.log("✅ Products table is ready.");
    });

    db.run(`
        CREATE TABLE IF NOT EXISTS sales (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            product_id INTEGER NOT NULL,
            buyer TEXT NOT NULL,
            college TEXT NOT NULL, 
            price REAL NOT NULL,
            purchase_date TEXT DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (product_id) REFERENCES products(id)
        )
    `, (err) => {
        if (err) console.error("❌ Error creating sales table:", err.message);
        else console.log("✅ Sales table is ready.");
    });

    db.run(`CREATE TABLE IF NOT EXISTS meetingsdb (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        date TEXT NOT NULL,
        time TEXT NOT NULL,
        link TEXT NOT NULL
    )`, (err) => {
        if (err) {
            console.error("❌ Error creating meetings table:", err);
        } else {
            console.log('✅ Meetings table is ready.');
        }
    });

    db.run(`CREATE TABLE IF NOT EXISTS organizermeetings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        date TEXT NOT NULL,
        time TEXT NOT NULL,
        link TEXT NOT NULL
    )`, (err) => {
        if (err) {
            console.error("❌ Error creating organizermeetings table:", err);
        } else {
            console.log('✅ OrganizerMeetings table is ready.');
        }
    });
});

module.exports = db;
