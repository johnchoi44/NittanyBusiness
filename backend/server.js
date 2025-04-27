const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");
const { randomUUID } = require("crypto");
const db = require("./db");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 8080;

// Register
app.post("/register", async (req, res) => {
	const {
        email,
        password,
        user_type,
        business_name,
        address: { street, city, zipcode, state = "" } = {},
        credit_card,
        bank,
	} = req.body;

	try {
        const hashed = await bcrypt.hash(password, 10);
        await runAsync(
            `INSERT INTO users (email, password_hash, user_type)
            VALUES (?, ?, ?)`,
            [email, hashed, user_type]
	);

	await runAsync(
		`INSERT OR IGNORE INTO Zipcode_Info (zipcode, city, state)
		VALUES (?, ?, ?)`,
		[zipcode, city, state]
	);

	const addressId = randomUUID();
	await runAsync(
		`INSERT INTO Address (address_id, zipcode, street_num, street_name)
		VALUES (?, ?, ?, ?)`,
		[addressId, zipcode, "", street]
	);

	if (user_type === "buyer") {
		// a) Buyer table
		await runAsync(
		`INSERT INTO Buyer (email, business_name, buyer_address_id)
		VALUES (?, ?, ?)`,
		[email, business_name, addressId]
		);

		await runAsync(
		`INSERT INTO Credit_Cards 
            (credit_card_num, card_type, expire_month, expire_year, security_code, owner_email)
		VALUES (?, ?, ?, ?, ?, ?)`,
		[
            credit_card.credit_card_num,
            credit_card.card_type,
            credit_card.expire_month,
            credit_card.expire_year,
            credit_card.security_code,
            email,
		]
		);
	} else if (user_type === "seller") {
		await runAsync(
		`INSERT INTO Sellers
			(email, business_name, business_address_id, bank_routing_number, bank_account_number, balance)
		VALUES (?, ?, ?, ?, ?, ?)`,
		[
			email,
			business_name,
			addressId,
			bank.bank_routing_number,
			bank.bank_account_number,
			bank.balance,
		]
		);
	}

	res.status(201).json({ message: "User successfully registered", user_id: email, user_type });
	} catch (err) {
	if (err.message.includes("UNIQUE constraint")) {
		return res.status(409).json({ message: "Email already exists" });
	}
        console.error(err);
        res.status(500).json({ error: err.message });
	}
});

// Helper function for register
function runAsync(sql, params = []) {
	return new Promise((resolve, reject) => {
        db.run(sql, params, function (err) {
            if (err) return reject(err);
            resolve(this);
        });
	});
}

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

// Fetch All Active Product Listings
app.get("/active-listings", (req, res) => {
    const query = 'SELECT * FROM Product_Listings WHERE status != 0';
    db.all(query, [], async (err, listings) => {
        if (err) {
            console.error("Error fetching listings");
            return res.status(500).json({ error: err.message });
        }
        if (!listings || listings.length === 0) {
            return res.status(404).json({ message: "No Available Listings" });
        }

        res.json({ listings });
        console.log("Listings fetched");
    });
});

// Fetch Product Listings for Seller
// TODO


// Fetch All Parent Categories
app.get("/categories", (req, res) => {
    const query = 'SELECT parent_category FROM Categories';
    db.all(query, [], async (err, categories) => {
        if (err) {
            console.error("Error fetching parent categories");
            return res.status(500).json({ error: err.message });
        }
        if (!categories || categories.length === 0) {
            return res.status(404).json({ message: "No categories found" });
        }

        res.json({ categories });
        console.log("Categories fetched");
    });
});

// Fetch review data (count and avg. rate) for listings
app.get("/review-data", (req, res) => {
    const listing_id = req.query.listing_id
    const query = 'SELECT AVG(r.rate) AS average_rating, COUNT(r.order_id) AS total_reviews FROM Reviews r JOIN Orders o ON r.order_id = o.order_id WHERE o.listing_id = ?';
    db.all(query, [listing_id], async (err, reviews) => {
        if (err) {
            console.error("Error fetching review data");
            return res.status(500).json({ error: err.message });
        }
        if (!reviews || reviews.length === 0) {
            return res.status(404).json({ message: "No review data found" });
        }

        res.json({ reviews });
        // console.log("review data fetched");
    });
});

// Fetch reviews for listing
app.get("/reviews", (req, res) => {
    const listing_id = req.query.listing_id
    const query = 'SELECT r.rate, r.review_desc FROM Reviews r JOIN Orders o ON r.order_id = o.order_id WHERE o.listing_id = ?';
    db.all(query, [listing_id], async (err, reviews) => {
        if (err) {
            console.error("Error fetching reviews");
            return res.status(500).json({ error: err.message });
        }
        if (!reviews || reviews.length === 0) {
            return res.status(404).json({ message: "No reviews found" });
        }

        res.json({ reviews });
        console.log("reviews fetched");
    });
});

app.post("/submit-order", (req, res) => {
    console.log(req.body);
    const {seller_email, listing_id, buyer_email, date, quantity, payment} = req.body.params;
    console.log(seller_email);
    console.log(listing_id);
    console.log(buyer_email);
    console.log(date);
    console.log(quantity);
    console.log(payment);
    console.log("Type of req.body:", typeof req.body);
    console.log("req.body keys:", Object.keys(req.body));
    const stmt = 'INSERT INTO Orders (seller_email, listing_id, buyer_email, date, quantity, payment) VALUES (?,?,?,?,?,?)';
    db.run(stmt, [
        seller_email,
        listing_id,
        buyer_email,
        date,
        quantity,
        payment
    ], function (err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.status(201).json({ message: "Order submitted" });
    });
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`)
});