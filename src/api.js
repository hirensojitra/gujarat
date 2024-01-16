const express = require('express');
const serverless = require('serverless-http');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const cors = require('cors');
const crypto = require('crypto');

const app = express();
const router = express.Router();

const secretKey = crypto.randomBytes(32).toString('hex');

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'http://localhost:4200');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

app.use(cors());
app.use(express.urlencoded({ extended: true }));

// Create a MySQL connection pool
const pool = mysql.createPool({
  host: 'sql12.freemysqlhosting.net',
  user: 'sql12676167',
  password: 'fWa1SkN3eG',
  database: 'sql12676167',
  port: 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Middleware to handle MySQL connections
app.use((req, res, next) => {
  req.mysql = pool;
  next();
});

app.use(bodyParser.json({ limit: '5mb' }));
app.use(express.json());

// Define your API routes using the router
router.get('/', (req, res) => {
  res.json({
    hello: 'Hi!',
  });
});
router.post("/api/register", (req, res) => {
    const { username, password, email, roles, emailVerified } = req.body;
  
    if (
      !username ||
      !password ||
      !email ||
      !roles ||
      emailVerified === undefined
    ) {
      return res.status(400).json({ error: "Missing required fields" });
    }
  
    // Your registration logic here
  
    // Example query
    req.mysql.query(
      "INSERT INTO users SET ?",
      { username, password, email, roles, emailVerified },
      (err, results) => {
        if (err) {
          console.error("Error registering user:", err);
          return res.status(500).json({ error: "Internal Server Error" });
        }
  
        res.json({
          message: "User registered successfully",
          userId: results.insertId,
        });
      }
    );
  })
// You can define other routes here using router
router.get("/api/district", (req, res) => {
  // Retrieve only active (not soft-deleted) districts from the 'districts' table
  const getAllDistrictsQuery =
    "SELECT * FROM district WHERE is_deleted = false";

  req.mysql.query(getAllDistrictsQuery, (error, results) => {
    if (error) {
      console.error("Error retrieving districts:", error);
      return res
        .status(500)
        .json({ success: false, message: "Internal Server Error" });
    }

    res.json(results);
  });
});
// Use the router for the '/.netlify/functions/api' path
app.use('/.netlify/functions/api', router);

// Export the serverless handler
module.exports.handler = serverless(app);
