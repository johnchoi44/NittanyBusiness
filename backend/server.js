const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");
const db = require("./db");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 8080;

// // Register
// app.post("/register", async (req, res) => {
//     const { email, password, user_type } = req.body;
//     const hashed = await bcrypt.hash(password, 10);
//
//     const stmt = `INSERT INTO users (email, password_hash, user_type) VALUES (?, ?, ?)`;
//     db.run(stmt, [email, hashed, user_type], function (err) {
//         if (err) {
//             if (err.message.includes("UNIQUE constraint")) {
//                 return res.status(409).json({ message: "Email already exists" });
//             }
//             return res.status(500).json({ error: err.message });
//         }
//         res.status(201).json({ message: "User registered", user_id: this.lastID });
//     });
// });

// Login
app.post("/login", (req, res) => {
    const { email, password } = req.body;

    const query = `SELECT * FROM Users WHERE email = ?`;
    db.get(query, [email], async (err, user) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!user) return res.status(401).json({ message: "Invalid username" });

        try {
            const match = await bcrypt.compare(password, user.password_hash);
            console.log("Password match result:", match); // Debug log
            
            if (!match) {
                return res.status(401).json({ message: "Invalid password" });
            }
            res.json({ message: "Login successful" });

        } catch (error) {
            console.error("Error comparing passwords:", error);  // Catch bcrypt errors
            return res.status(500).json({ error: "Internal server error" });
        }
    });
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`)
});