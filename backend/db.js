const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const db = new sqlite3.Database(path.resolve(__dirname, "nittanybusiness.db"), (err) => {
    if (err) return console.error("DB Error:", err.message);
    console.log("Connected to SQLite database.");
});

// Create table
db.run(`
    CREATE TABLE IF NOT EXISTS Users (
        email TEXT PRIMARY KEY,
        password_hash TEXT NOT NULL
    )
`);

db.run(`
    CREATE TABLE IF NOT EXISTS Helpdesk (
        email TEXT PRIMARY KEY,
        position TEXT,
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

module.exports = db;