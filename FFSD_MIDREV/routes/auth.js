const express = require('express');
const router = express.Router();
const db = require('./databasecongi');

router.post('/signup', (req, res) => {
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
            return res.send("Error: User already exists or invalid data.");
        }
        res.redirect("/login"); // Redirect to login page

        }
    
        
    );
    db.all("SELECT * FROM users", [], (err, rows) => {
    if (err) {
        throw err;
    }

    console.table(rows); // Prints data in table format in console
});
     
});

module.exports = router;  