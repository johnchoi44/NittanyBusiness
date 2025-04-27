const sqlite3 = require("sqlite3").verbose();
const path = require("path");
const csv = require("csv-parser");
const fs = require("fs");
const bcrypt = require("bcrypt"); // Import bcrypt for password hashing


const db = new sqlite3.Database(path.resolve(__dirname, "nittanybusiness.db"), (err) => {
    if (err) return console.error("DB Error:", err.message);
    console.log("Connected to SQLite database.");
    //populateTables();
});


// Create table
db.run(`
    CREATE TABLE IF NOT EXISTS Users (
        email TEXT PRIMARY KEY,
        password_hash TEXT NOT NULL,
        user_type TEXT
    )
`);

db.run(`
    CREATE TABLE IF NOT EXISTS Helpdesk (
        email TEXT PRIMARY KEY,
        position TEXT,
        user_type TEXT DEFAULT 'helpdesk',
        FOREIGN KEY (email) REFERENCES Users(email)
    )
`);

db.run(`
    CREATE TABLE IF NOT EXISTS Requests (
        request_id INTEGER PRIMARY KEY AUTOINCREMENT,
        sender_email TEXT NOT NULL,
        helpdesk_staff_email TEXT NOT NULL DEFAULT 'helpdeskteam@nittybiz.com',
        request_type TEXT,
        request_desc TEXT,
        request_status INTEGER CHECK(request_status IN (0, 1)),
        FOREIGN KEY (sender_email) REFERENCES Users(email),
        FOREIGN KEY (helpdesk_staff_email) REFERENCES Users(email)
    )
`);

db.run(`
    CREATE TABLE IF NOT EXISTS Buyer (
        email TEXT PRIMARY KEY,
        business_name TEXT,
        buyer_address_id TEXT,
        user_type TEXT DEFAULT 'buyer',
        FOREIGN KEY (email) REFERENCES Users(email),
        FOREIGN KEY (buyer_address_id) REFERENCES Address(address_id)
    )
`);

db.run(`
    CREATE TABLE IF NOT EXISTS Credit_Cards (
        credit_card_num TEXT PRIMARY KEY,
        card_type TEXT,
        expire_month INTEGER,
        expire_year INTEGER,
        security_code TEXT,
        owner_email TEXT,
        FOREIGN KEY (owner_email) REFERENCES Buyer(email)
    )
`);

db.run(`
    CREATE TABLE IF NOT EXISTS Address (
        address_id TEXT PRIMARY KEY,
        zipcode INTEGER,
        street_num TEXT,
        street_name TEXT
    )
`);

db.run(`
    CREATE TABLE IF NOT EXISTS Zipcode_Info (
        zipcode INTEGER PRIMARY KEY,
        city TEXT,
        state TEXT
    )
`);

db.run(`
    CREATE TABLE IF NOT EXISTS Sellers (
        email TEXT PRIMARY KEY,
        business_name TEXT,
        business_address_id TEXT,
        bank_routing_number TEXT,
        bank_account_number TEXT,
        balance REAL DEFAULT 0.0,
        user_type TEXT DEFAULT 'seller',
        FOREIGN KEY (email) REFERENCES Users(email),
        FOREIGN KEY (business_address_id) REFERENCES Address(address_id)
    )
`);

db.run(`
    CREATE TABLE IF NOT EXISTS Categories (
        parent_category TEXT,
        category_name TEXT PRIMARY KEY,
        FOREIGN KEY(parent_category) REFERENCES Categories(category_name)
    )
`);

db.run(`
    CREATE TABLE IF NOT EXISTS Product_Listings (
        seller_email TEXT,
        listing_id INTEGER,
        category TEXT,
        product_title TEXT,
        product_name TEXT,
        product_description TEXT,
        quantity INTEGER,
        product_price TEXT,
        status INTEGER CHECK(status IN (0, 1, 2)) DEFAULT 1,
        PRIMARY KEY (seller_email, listing_id),
        FOREIGN KEY (seller_email) REFERENCES Sellers(email),
        FOREIGN KEY (category) REFERENCES Categories(category_name)
    )
`);

db.run(`
    CREATE TABLE IF NOT EXISTS Orders (
        order_id INTEGER PRIMARY KEY AUTOINCREMENT,
        seller_email TEXT,
        listing_id INTEGER,
        buyer_email TEXT,
        date TEXT,
        quantity INTEGER,
        payment REAL,
        FOREIGN KEY (seller_email, listing_id) REFERENCES Product_Listings(seller_email, listing_id),
        FOREIGN KEY (buyer_email) REFERENCES Buyer(email)
    )
`);

db.run(`
    CREATE TABLE IF NOT EXISTS Reviews (
        order_id INTEGER PRIMARY KEY,
        rate INTEGER CHECK(rate >= 1 AND rate <= 5),
        review_desc TEXT,
        FOREIGN KEY (order_id) REFERENCES Orders(order_id)
    )
`);

// ls


// Function to hash password using bcrypt
async function hashPassword(password) {
    const saltRounds = 10; // Adjust the salt rounds for bcrypt
    return bcrypt.hash(password, saltRounds); // Returns a Promise with the hashed password
}

// Function to populate tables from CSV files
async function populateTables() {
    console.log("Populating tables...");
    const promises = [];

    let completedStreams = 0;
    const totalStreams = 12;

    function checkIfDone() {
        completedStreams++;
        if (completedStreams === totalStreams) {
            Promise.all(promises)
                .then(() => {
                    console.log("All data inserted successfully.");
                });
        }
    }

    // === USERS ===
    fs.createReadStream(path.resolve(__dirname, "data/users.csv"))
        .pipe(csv())
        .on("data", async (row) => {
            row = Object.fromEntries(
                Object.entries(row).map(([key, value]) => [key.trim(), value])
            );
            try {
                const hashedPassword = await hashPassword(row.password);
                const promise = new Promise((resolve, reject) => {
                    db.run(
                        `INSERT INTO Users (email, password_hash) VALUES (?, ?)`,
                        [row.email, hashedPassword],
                        (err) => err ? reject(err) : resolve()
                    );
                });
                promises.push(promise);
            } catch (err) {
                console.error("Error hashing password:", err);
            }
        })
        .on("end", checkIfDone);

    // === CATEGORIES ===
    fs.createReadStream(path.resolve(__dirname, "data/categories.csv"))
        .pipe(csv())
        .on("data", (row) => {
            row = Object.fromEntries(
                Object.entries(row).map(([key, value]) => [key.trim(), value])
            );
            const promise = new Promise((resolve, reject) => {
                db.run(
                    `INSERT INTO Categories (parent_category, category_name) VALUES (?, ?)`,
                    [row.parent_category, row.category_name],
                    (err) => err ? reject(err) : resolve()
                );
            });
            promises.push(promise);
        })
        .on("end", checkIfDone);

    // === PRODUCT LISTINGS ===
    fs.createReadStream(path.resolve(__dirname, "data/product_listings.csv"))
        .pipe(csv())
        .on("data", (row) => {
            const productPrice = parseFloat(row.Product_Price.replace(/[^0-9.]/g, "").trim());
            const listing = [
                row.Seller_Email.trim(),
                parseInt(row.Listing_ID),
                row.Category.trim(),
                row.Product_Title.trim(),
                row.Product_Name.trim(),
                row.Product_Description.trim(),
                parseInt(row.Quantity),
                productPrice,
                parseInt(row.Status)
            ];
            const promise = new Promise((resolve, reject) => {
                db.run(
                    `INSERT INTO Product_Listings (
                        seller_email, listing_id, category, product_title,
                        product_name, product_description, quantity, product_price, status
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    listing,
                    (err) => err ? reject(err) : resolve()
                );
            });
            promises.push(promise);
        })
        .on("end", checkIfDone);

    // === REVIEWS ===
    fs.createReadStream(path.resolve(__dirname, "data/reviews.csv"))
        .pipe(csv())
        .on("data", (row) => {
            const review = [
                parseInt(row.Order_ID),
                parseInt(row.Rate),
                (row.Review_Desc || "").trim()
            ];
            const promise = new Promise((resolve, reject) => {
                db.run(
                    `INSERT INTO Reviews (order_id, rate, review_desc) VALUES (?, ?, ?)`,
                    review,
                    (err) => err ? reject(err) : resolve()
                );
            });
            promises.push(promise);
        })
        .on("end", checkIfDone);

    // === Orders ===
    fs.createReadStream(path.resolve(__dirname, "data/orders.csv"))
    .pipe(csv())
    .on("data", (row) => {
        const order = [
            parseInt(row.Order_ID),
            row.Seller_Email.trim(),
            parseInt(row.Listing_ID),
            row.Buyer_Email.trim(),
            row.Date.trim(),
            parseInt(row.Quantity),
            parseInt(row.Payment)
        ];
        const promise = new Promise((resolve, reject) => {
            db.run(
                `INSERT INTO Orders (
                    order_id, seller_email, listing_id, buyer_email,
                    date, quantity, payment
                ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
                order,
                (err) => err ? reject(err) : resolve()
            );
        });
        promises.push(promise);
    })
    .on("end", checkIfDone);

    // === Sellers ===
    fs.createReadStream(path.resolve(__dirname, "data/sellers.csv"))
    .pipe(csv())
    .on("data", (row) => {
        row = Object.fromEntries(
            Object.entries(row).map(([key, value]) => [key.trim(), value])
        );
        const seller = [
            row.email.trim(),
            row.business_name.trim(),
            row.Business_Address_ID.trim(),
            row.bank_routing_number.trim(),
            row.bank_account_number.trim(),
            parseFloat(row.balance || 0) // Default to 0.0 if missing
        ];
        const promise = new Promise((resolve, reject) => {
            db.run(
                `INSERT INTO Sellers (
                    email, business_name, business_address_id,
                    bank_routing_number, bank_account_number, balance
                ) VALUES (?, ?, ?, ?, ?, ?)`,
                seller,
                (err) => err ? reject(err) : resolve()
            );
        });
        promises.push(promise);
    })
    .on("end", checkIfDone);

    // === Requests ===
    fs.createReadStream(path.resolve(__dirname, "data/Requests.csv"))
    .pipe(csv())
    .on("data", (row) => {
        row = Object.fromEntries(
            Object.entries(row).map(([key, value]) => [key.trim(), value])
        );
        const request = [
            row.sender_email.trim(),
            row.helpdesk_staff_email ? row.helpdesk_staff_email.trim() : 'helpdeskteam@nittybiz.com',
            row.request_type.trim(),
            row.request_desc.trim(),
            parseInt(row.request_status)
        ];
        const promise = new Promise((resolve, reject) => {
            db.run(
                `INSERT INTO Requests (
                    sender_email, helpdesk_staff_email, request_type,
                    request_desc, request_status
                ) VALUES (?, ?, ?, ?, ?)`,
                request,
                (err) => err ? reject(err) : resolve()
            );
        });
        promises.push(promise);
    })
    .on("end", checkIfDone);

    // === HelpDesk ===
    fs.createReadStream(path.resolve(__dirname, "data/Helpdesk.csv"))
    .pipe(csv())
    .on("data", (row) => {
        row = Object.fromEntries(
            Object.entries(row).map(([key, value]) => [key.trim(), value])
        );
        const request = [
            row.email.trim(),
            row.Position.trim()
        ];
        const promise = new Promise((resolve, reject) => {
            db.run(
                `INSERT INTO Helpdesk (
                    email, Position
                ) VALUES (?, ?)`,
                request,
                (err) => err ? reject(err) : resolve()
            );
        });
        promises.push(promise);
    })
    .on("end", checkIfDone);

    // === Address ===
    fs.createReadStream(path.resolve(__dirname, "data/Address.csv"))
    .pipe(csv())
    .on("data", (row) => {
        row = Object.fromEntries(
            Object.entries(row).map(([key, value]) => [key.trim(), value])
        );
        const request = [
            row.address_id.trim(),
            parseInt(row.zipcode),
            parseInt(row.street_num),
            row.street_name.trim()
        ];
        const promise = new Promise((resolve, reject) => {
            db.run(
                `INSERT INTO Address (
                    address_id, zipcode, street_num, street_name
                ) VALUES (?, ?, ?, ?)`,
                request,
                (err) => err ? reject(err) : resolve()
            );
        });
        promises.push(promise);
    })
    .on("end", checkIfDone);

    // === Buyer ===
    fs.createReadStream(path.resolve(__dirname, "data/Buyers.csv"))
    .pipe(csv())
    .on("data", (row) => {
        row = Object.fromEntries(
            Object.entries(row).map(([key, value]) => [key.trim(), value])
        );
        const request = [
            row.email.trim(),
            row.business_name.trim(),
            row.buyer_address_id.trim(),
        ];
        const promise = new Promise((resolve, reject) => {
            db.run(
                `INSERT INTO Buyer (
                    email, business_name, buyer_address_id
                ) VALUES (?, ?, ?)`,
                request,
                (err) => err ? reject(err) : resolve()
            );
        });
        promises.push(promise);
    })
    .on("end", checkIfDone);

    // === Credit_Cards ===
    fs.createReadStream(path.resolve(__dirname, "data/Credit_Cards.csv"))
    .pipe(csv())
    .on("data", (row) => {
        row = Object.fromEntries(
            Object.entries(row).map(([key, value]) => [key.trim(), value])
        );
        const request = [
            row.credit_card_num.trim(),
            row.card_type.trim(),
            parseInt(row.expire_month),
            parseInt(row.expire_year),
            parseInt(row.security_code),
            row.Owner_email.trim()
        ];
        const promise = new Promise((resolve, reject) => {
            db.run(
                `INSERT INTO Credit_Cards (
                    credit_card_num, card_type, expire_month, expire_year,
                    security_code, Owner_email
                ) VALUES (?, ?, ?, ?, ?, ?)`,
                request,
                (err) => err ? reject(err) : resolve()
            );
        });
        promises.push(promise);
    })
    .on("end", checkIfDone);

    // === Zipcode_Info ===
    fs.createReadStream(path.resolve(__dirname, "data/Zipcode_Info.csv"))
    .pipe(csv())
    .on("data", (row) => {
        row = Object.fromEntries(
            Object.entries(row).map(([key, value]) => [key.trim(), value])
        );
        const request = [
            parseInt(row.zipcode),
            row.city.trim(),
            row.state.trim()
        ];
        const promise = new Promise((resolve, reject) => {
            db.run(
                `INSERT INTO Zipcode_Info (
                    zipcode, city, state
                ) VALUES (?, ?, ?)`,
                request,
                (err) => err ? reject(err) : resolve()
            );
        });
        promises.push(promise);
    })
    .on("end", checkIfDone);

}

module.exports = db;