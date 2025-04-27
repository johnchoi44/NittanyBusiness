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

// == Helper functions ==
function runAsync(sql, params = []) {
	return new Promise((resolve, reject) => {
        db.run(sql, params, function (err) {
            if (err) return reject(err);
            resolve(this);
        });
	});
}

function allAsync(sql, params = []) {
    return new Promise((resolve, reject) => {
        db.all(sql, params, (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
}
// ======================

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
            res.json({ message: "Login successful", email: user.email, user_type: user.user_type });

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
        // console.log("Listings fetched");
    });
});

// Fetch Product Listings for Seller
app.get("/listings-for-seller", (req, res) => {
    const seller_email = req.query.userEmail;
    const query = 'SELECT * FROM Product_Listings WHERE seller_email = ?';
    console.log(req.query)
    console.log("EMAIL: ",seller_email);
    db.all(query, [seller_email], async (err, listings) => {
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

// Fetch category hierarchy
app.get("/category-hierarchy", (req, res) => {
    const query = 'SELECT * FROM Categories';
    db.all(query, [], async (err, categories) => {
        if (err) {
            console.error("Error fetching category hierarchy");
            return res.status(500).json({ error: err.message });
        }
        if (!categories || categories.length === 0) {
            return res.status(404).json({ message: "No categories found" });
        }

        // Transform categories into { parent_category: [category_name, ...] }
        const groupedCategories = {};

        categories.forEach(({ parent_category, category_name }) => {
            if (!groupedCategories[parent_category]) {
                groupedCategories[parent_category] = [];
            }
            groupedCategories[parent_category].push(category_name);
        });

        res.json(groupedCategories);
        console.log("Categories hierarchy fetched");
    });
});

// Fetch Sub Categories for given parent category
app.get("/get-sub-categories", (req, res) => {
    const parent_category = req.query.parent_category;
    const query = 'SELECT category_name FROM Categories WHERE parent_category = ?';
    db.all(query, [parent_category], async (err, subCategories) => {
        if (err) {
            console.error("Error fetching sub categories");
            return res.status(500).json({ error: err.message });
        }
        if (!subCategories || subCategories.length === 0) {
            return res.status(404).json({ message: "No sub categories found" });
        }

        res.json({ subCategories });
        console.log("Sub categories fetched");
        console.log(subCategories);
    });
});

// Fetch category hierarchy
app.get("/category-hierarchy", (req, res) => {
    const query = 'SELECT * FROM Categories';
    db.all(query, [], async (err, categories) => {
        if (err) {
            console.error("Error fetching category hierarchy");
            return res.status(500).json({ error: err.message });
        }
        if (!categories || categories.length === 0) {
            return res.status(404).json({ message: "No categories found" });
        }

        // Transform categories into { parent_category: [category_name, ...] }
        const groupedCategories = {};

        categories.forEach(({ parent_category, category_name }) => {
            if (!groupedCategories[parent_category]) {
                groupedCategories[parent_category] = [];
            }
            groupedCategories[parent_category].push(category_name);
        });

        res.json(groupedCategories);
        console.log("Categories hierarchy fetched");
    });
});

// Fetch Sub Categories for given parent category
app.get("/get-sub-categories", (req, res) => {
    const parent_category = req.query.parent_category;
    const query = 'SELECT category_name FROM Categories WHERE parent_category = ?';
    db.all(query, [parent_category], async (err, subCategories) => {
        if (err) {
            console.error("Error fetching sub categories");
            return res.status(500).json({ error: err.message });
        }
        if (!subCategories || subCategories.length === 0) {
            return res.status(404).json({ message: "No sub categories found" });
        }

        res.json({ subCategories });
        console.log("Sub categories fetched");
        console.log(subCategories);
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

// Fetch credit card info
app.get("/credit-cards", (req, res) => {
    const owner = req.query.owner_email;
    if (!owner) {
        return res.status(400).json({ error: "owner_email is required" });
    }

    const sql = `
        SELECT credit_card_num, card_type, expire_month, expire_year, security_code
        FROM Credit_Cards
        WHERE owner_email = ?
    `;
    db.all(sql, [owner], (err, rows) => {
        if (err) {
        console.error("Error fetching credit cards:", err);
        return res.status(500).json({ error: err.message });
        }
        return res.json({ cards: rows });
    });
});

app.post("/checkout", async (req, res) => {
    const {
        seller_email,
        listing_id,
        buyer_email,
        date,
        quantity,
        payment,
        credit_card,
    } = req.body;

    try {
        await runAsync("BEGIN TRANSACTION");

        await runAsync(
            `INSERT OR IGNORE INTO Credit_Cards
                (credit_card_num, card_type, expire_month, expire_year, security_code, owner_email)
                VALUES (?, ?, ?, ?, ?, ?)`,
            [
                credit_card.credit_card_num,
                credit_card.card_type,
                credit_card.expire_month,
                credit_card.expire_year,
                credit_card.security_code,
                buyer_email,
            ]
        );

        await runAsync(
            `INSERT INTO Orders
                (seller_email, listing_id, buyer_email, date, quantity, payment)
                VALUES (?, ?, ?, ?, ?, ?)`,
            [seller_email, listing_id, buyer_email, date, quantity, payment]
        );

        const rows = await allAsync(
            `SELECT quantity FROM Product_Listings WHERE listing_id = ?`,
            [listing_id]
        );
        if (!rows.length) throw new Error("Listing not found");
        const currentQty = rows[0].quantity;
        const newQty = currentQty - quantity;
        const newStatus = newQty <= 0 ? 2 : 1;

        await runAsync(
            `UPDATE Product_Listings
                SET quantity = ?, status = ?
                WHERE listing_id = ?`,
            [newQty, newStatus, listing_id]
        );

        await runAsync(
            `UPDATE Sellers
                SET balance = balance + ?
                WHERE email = ?`,
            [payment, seller_email]
        );

        await runAsync("COMMIT");
        res.json({ message: "Checkout successful" });
    } catch (err) {
        await runAsync("ROLLBACK");
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

// Fetch pending requests
app.get("/helpdesk/pending-requests", (req, res) => {
    const query = `SELECT * FROM Requests WHERE request_status = 1`;
    db.all(query, [], (err, requests) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ requests });
    });
});

// Update request status
app.post("/helpdesk/update-request-status", (req, res) => {
    const { request_id, new_status } = req.body;
    const query = `UPDATE Requests SET request_status = ? WHERE request_id = ?`;
    db.run(query, [new_status, request_id], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Request status updated successfully" });
    });
});


// Search user by email
app.get("/helpdesk/user", (req, res) => {
    const email = req.query.email?.trim();
    const query = `SELECT email, user_type FROM Users WHERE LOWER(email) = LOWER(?)`;

    console.log("Searching for email:", email);

    db.get(query, [email], (err, user) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!user) return res.status(404).json({ message: "User not found" });
        res.json({ user });
    });
});


// Update user type (e.g., promote/demote users)
app.post("/helpdesk/update-user", (req, res) => {
    const { email, new_user_type } = req.body;
    const query = `UPDATE Users SET user_type = ? WHERE email = ?`;
    db.run(query, [new_user_type, email], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "User updated successfully" });
    });
});

// Fetch the UserType of a given user
app.get("/get-user-type", (req, res) => {
    const user_email = req.query.userEmail;
    console.log(user_email);
    const roles = [];

    const queryBuyer = 'SELECT 1 FROM Buyer WHERE email = ? LIMIT 1';
    const querySeller = 'SELECT 1 FROM Sellers WHERE email = ? LIMIT 1';
    const queryHelpDesk = 'SELECT 1 FROM Helpdesk WHERE email = ? LIMIT 1';

    db.get(queryBuyer, [user_email], (err, rowBuyer) => {
        if (err) {
            console.error("Buyer query error:", err);
            return res.status(500).send("Database error");
        }
        if (rowBuyer) {
            console.log("User in Buyers table");
            roles.push("buyer");
        }

        db.get(querySeller, [user_email], (err, rowSeller) => {
            if (err) {
                console.error("Seller query error:", err);
                return res.status(500).send("Database error");
            }
            if (rowSeller) {
                console.log("User in Sellers table");
                roles.push("seller");
            }

            db.get(queryHelpDesk, [user_email], (err, rowHelpdesk) => {
                if (err) {
                    console.error("Helpdesk query error:", err);
                    return res.status(500).send("Database error");
                }
                if (rowHelpdesk) {
                    console.log("User in Helpdesk table");
                    roles.push("helpdesk");
                }
    
                res.json({ user_email, roles });
            });
        });
    });
});

// fetch the orders for a user email given userType
app.get("/get-orders-by-type", (req, res) => {
    const userType = req.query.userType;
    const userEmail = req.query.userEmail;
    let query = "";

    if (userType === 'buyer') {
        // requestor is buyer, so search for orders they placed
        query = 'SELECT * FROM Orders WHERE buyer_email = ?'
    }
    else {
        // requestor is seller, so search for orders placed to them
        query = 'SELECT * FROM Orders WHERE seller_email = ?'
    }

    db.all(query, [userEmail], (err, orders) => {
        if (err) {
            console.error("Order query error:", err);
            return res.status(500).send("Database error");
        }
        if (orders) {
            console.log("Orders requested");
            res.json({ orders });
        }
    });
});

// get product name given listing_id
app.get("/get-product-name", (req, res) => {
    const listing_id = req.query.listing_id;

    const query = 'SELECT * FROM product_listings WHERE listing_id = ?'
    db.get(query, [listing_id], (err, product) => {
        if (err) {
            console.error("Error Fetching Product:", err);
            return res.status(500).send("Database error");
        }
        if (product) {
            // console.log("Product Requested");
            res.json({ product });
        }
    });
});


// Define the endpoint to update a product
app.put('/update-product', (req, res) => {
    const { listing_id, product_title, product_name, category, product_description, seller_email, product_price, status } = req.body;  // Get updated data from request body
    console.log(req.body);
    console.log(listing_id);
    console.log(product_title);
    console.log(product_name);
    console.log(category);
    console.log(product_description);
    console.log(seller_email);
    console.log(product_price);
    console.log(status);

    // Prepare the SQL statement to update the product by ID
    const sql = `
        UPDATE product_listings
        SET product_title = ?, product_name = ?, category = ?, product_description = ?, product_price = ?, status = ?
        WHERE listing_id = ?
    `;

    // Run the SQL update query
    db.run(sql, [product_title, product_name, category, product_description, product_price, status, listing_id], function(err) {
        if (err) {
            return res.status(500).json({ message: 'Error updating product', error: err.message });
        }

        // Check if any rows were affected (this ensures the product exists)
        if (this.changes === 0) {
            return res.status(404).json({ message: 'Product not found' });
        }

        return res.json({ message: 'Product updated successfully', productId: listing_id });
    });
});

// Define the endpoint to add a product :: TODO: add product id
app.post('/add-product', (req, res) => {
    const { userEmail, product_title, product_name, category, product_description, product_price, quantity, status, listing_id } = req.body;
    console.log(req.body);
    console.log(userEmail);
    console.log(product_title);
    console.log(product_name);
    console.log(category);
    console.log(product_description);
    console.log(product_price);
    console.log(quantity);
    console.log(status);
    console.log(listing_id);

    const sql = `
        INSERT INTO product_listings (product_title, product_name, category, product_description, seller_email, product_price, quantity, status, listing_id)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    db.run(sql, [product_title, product_name, category, product_description, userEmail, product_price, quantity, status, listing_id], function(err) {
        if (err) {
            return res.status(500).json({ message: 'Error adding product', error: err.message });
        }
        return res.json({ message: 'Product added successfully', productId: this.lastID });
    });
});

// User submit their reviews for an order
app.post("/submit-review", (req, res) => {
    const { order_id, rate, review_desc } = req.body;

    if (!order_id || !rate || !review_desc) {
        return res.status(400).json({ message: "Missing review fields" });
    }

    // First, check if a review already exists for this order
    const checkQuery = `SELECT * FROM Reviews WHERE order_id = ?`;
    db.get(checkQuery, [order_id], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });

        if (row) {
            // Review already exists
            return res.status(409).json({ message: "Review already exists for this order." });
        }

        // If no review, proceed to insert
        const insertQuery = `INSERT INTO Reviews (order_id, rate, review_desc) VALUES (?, ?, ?)`;
        db.run(insertQuery, [order_id, rate, review_desc], function (err) {
            if (err) return res.status(500).json({ error: err.message });
            res.status(201).json({ message: "Review submitted successfully" });
        });
    });
});

app.get("/get-reviewed-orders", (req, res) => {
    const { userEmail, userType } = req.query;

    let query = "";
    if (userType === "buyer") {
        query = `
            SELECT Orders.order_id
            FROM Orders
            INNER JOIN Reviews ON Orders.order_id = Reviews.order_id
            WHERE Orders.buyer_email = ?
        `;
    } else if (userType === "seller") {
        query = `
            SELECT Orders.order_id
            FROM Orders
            INNER JOIN Reviews ON Orders.order_id = Reviews.order_id
            WHERE Orders.seller_email = ?
        `;
    } else {
        return res.status(400).json({ message: "Invalid userType" });
    }

    db.all(query, [userEmail], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        const reviewedOrderIds = rows.map(row => row.order_id);
        res.json({ reviewedOrderIds });
    });
});

// User fetches their review for a specific order
app.get("/get-review-by-order", (req, res) => {
    const { order_id } = req.query;

    if (!order_id) {
        return res.status(400).json({ message: "Missing order_id" });
    }

    const query = `SELECT rate, review_desc FROM Reviews WHERE order_id = ?`;
    db.get(query, [order_id], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });

        if (row) {
            res.json({ review: row });
        } else {
            res.json({ review: null }); // No review yet
        }
    });
});


app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`)
});