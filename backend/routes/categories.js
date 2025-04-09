const express = require("express");
const router = express.Router();
const pool = require("../config/db");

router.post("/", async (req, res) => {
  try {
    const { name } = req.body;
    const result = await pool.query(
      "INSERT INTO category (name) VALUES ($1) RETURNING *",
      [name]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query("SELECT * FROM category WHERE category_id = $1", [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: "Not found" });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    const result = await pool.query(
      "UPDATE category SET name = $1, last_update = now() WHERE category_id = $2 RETURNING *",
      [name, id]
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
    const result = await pool.query("DELETE FROM category WHERE category_id = $1 RETURNING *", [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: "Not found" });
    res.json({ message: "Done!" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM category");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/search/name/:name", async (req, res) => {
  try {
    const { name } = req.params;
    const result = await pool.query(
      "SELECT * FROM category WHERE name ILIKE $1",
      [`%${name}%`]
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
      "SELECT film.* FROM film JOIN film_category ON film.film_id = film_category.film_id WHERE film_category.category_id = $1",
      [id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/stats/film_count", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT category.name, COUNT(film_category.film_id) as film_count FROM category LEFT JOIN film_category ON category.category_id = film_category.category_id GROUP BY category.name"
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
