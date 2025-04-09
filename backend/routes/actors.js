const express = require("express");
const router = express.Router();
const pool = require("../config/db");

router.post("/", async (req, res) => {
  try {
    const { first_name, last_name } = req.body;
    const result = await pool.query(
      "INSERT INTO actor (first_name, last_name) VALUES ($1, $2) RETURNING *",
      [first_name, last_name]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query("SELECT * FROM actor WHERE actor_id = $1", [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: "Not found" });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { first_name, last_name } = req.body;
    const result = await pool.query(
      "UPDATE actor SET first_name = $1, last_name = $2, last_update = now() WHERE actor_id = $3 RETURNING *",
      [first_name, last_name, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: "Not found" });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query("DELETE FROM actor WHERE actor_id = $1 RETURNING *", [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: "Not found" });
    res.json({ message: "Done!" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM actor");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/search/name/:name", async (req, res) => {
  try {
    const { name } = req.params;
    const result = await pool.query(
      "SELECT * FROM actor WHERE first_name ILIKE $1 OR last_name ILIKE $1",
      [`%${name}%`]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/search/lastname/:last_name", async (req, res) => {
  try {
    const { last_name } = req.params;
    const result = await pool.query(
      "SELECT * FROM actor WHERE last_name ILIKE $1",
      [`%${last_name}%`]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/:id/films", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      "SELECT film.* FROM film JOIN film_actor ON film.film_id = film_actor.film_id WHERE film_actor.actor_id = $1",
      [id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
