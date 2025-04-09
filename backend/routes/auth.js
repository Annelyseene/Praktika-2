const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require("../config/db");

const router = express.Router();
const SECRET_KEY = "your_secret_key";

router.post("/register", async (req, res) => {
  try {
    const { first_name, last_name, username, password, email, store_id, address_id } = req.body;

    const existingUser = await pool.query("SELECT * FROM staff WHERE username = $1", [username]);
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: "User with this username already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
      "INSERT INTO staff (first_name, last_name, username, password, email, store_id, address_id) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING staff_id, first_name, last_name, username, email",
      [first_name, last_name, username, hashedPassword, email, store_id, address_id]
    );

    res.json({ message: "User registered successfully", user: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: "An error occurred during registration" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await pool.query("SELECT * FROM staff WHERE username = $1", [username]);
    if (user.rows.length === 0) {
      return res.status(400).json({ error: "Invalid username or password" });
    }

    const validPassword = await bcrypt.compare(password, user.rows[0].password);
    if (!validPassword) {
      return res.status(400).json({ error: "Invalid username or password" });
    }

    const token = jwt.sign({ staff_id: user.rows[0].staff_id, username: user.rows[0].username }, SECRET_KEY, { expiresIn: "1h" });

    res.json({ message: "Login successful", token });
  } catch (err) {
    res.status(500).json({ error: "An error occurred during login" });
  }
});

const authenticateToken = (req, res, next) => {
  const token = req.header("Authorization");
  if (!token) return res.status(401).json({ error: "Access denied" });

  try {
    const decoded = jwt.verify(token.split(" ")[1], SECRET_KEY);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: "Invalid token" });
  }
};

module.exports = { router, authenticateToken };
