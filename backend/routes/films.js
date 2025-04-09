const express = require("express");
const router = express.Router();
const pool = require("../config/db");

router.post("/", async (req, res) => {
    try {
      const { title, description, release_year, language_id, rental_duration, rental_rate, length, replacement_cost, rating, special_features } = req.body;
      const result = await pool.query(
        "INSERT INTO film (title, description, release_year, language_id, rental_duration, rental_rate, length, replacement_cost, rating, special_features) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *",
        [title, description, release_year, language_id, rental_duration, rental_rate, length, replacement_cost, rating, special_features]
      );
      res.json({ message: "Film added successfully", film: result.rows[0] });
    } catch (err) {
      res.status(500).json({ error: "An error occurred while adding the film" });
    }
  });

router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query("SELECT * FROM film WHERE film_id = $1", [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: "Film not found" });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: "An error occurred while retrieving the film" });
  }
});

router.put("/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const { title, description, release_year, language_id } = req.body;
      const result = await pool.query(
        "UPDATE film SET title = $1, description = $2, release_year = $3, language_id = $4 WHERE film_id = $5 RETURNING *",
        [title, description, release_year, language_id, id]
      );
      if (result.rows.length === 0) return res.status(404).json({ error: "Film not found" });
      res.json({ message: "Film updated successfully", film: result.rows[0] });
    } catch (err) {
      res.status(500).json({ error: "An error occurred while updating the film" });
    }
  });

router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query("DELETE FROM film WHERE film_id = $1 RETURNING *", [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: "Film not found" });
    res.json({ message: "Film deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "An error occurred while deleting the film" });
  }
});

router.get("/search/title/:title", async (req, res) => {
  try {
    const { title } = req.params;
    const result = await pool.query("SELECT * FROM film WHERE title ILIKE $1", [`%${title}%`]);
    res.json({ message: "Films retrieved successfully", films: result.rows });
  } catch (err) {
    res.status(500).json({ error: "An error occurred while searching for films" });
  }
});

router.get("/search/actor/:actor_id", async (req, res) => {
  try {
    const { actor_id } = req.params;
    const result = await pool.query(
      "SELECT film.* FROM film JOIN film_actor ON film.film_id = film_actor.film_id WHERE film_actor.actor_id = $1",
      [actor_id]
    );
    res.json({ message: "Films retrieved successfully", films: result.rows });
  } catch (err) {
    res.status(500).json({ error: "An error occurred while retrieving films by actor" });
  }
});

router.get("/search/language/:language_id", async (req, res) => {
  try {
    const { language_id } = req.params;
    let { page, limit } = req.query;

    page = parseInt(page) || 1;
    limit = parseInt(limit) || 10;

    if (page < 1 || limit < 1) {
      return res.status(400).json({ error: "Invalid pagination parameters" });
    }

    const offset = (page - 1) * limit;

    const result = await pool.query(
      "SELECT * FROM film WHERE language_id = $1 LIMIT $2 OFFSET $3",
      [language_id, limit, offset]
    );

    const countResult = await pool.query(
      "SELECT COUNT(*) FROM film WHERE language_id = $1",
      [language_id]
    );

    const totalRecords = parseInt(countResult.rows[0].count);
    const totalPages = Math.ceil(totalRecords / limit);

    res.json({
      message: "Films retrieved successfully",
      page,
      limit,
      totalPages,
      totalRecords,
      films: result.rows
    });
  } catch (err) {
    res.status(500).json({ error: "An error occurred while retrieving films by language" });
  }
});

router.get("/search/category/:category_id", async (req, res) => {
  try {
    const { category_id } = req.params;
    const result = await pool.query(
      "SELECT film.* FROM film JOIN film_category ON film.film_id = film_category.film_id WHERE film_category.category_id = $1",
      [category_id]
    );
    res.json({ message: "Films retrieved successfully", films: result.rows });
  } catch (err) {
    res.status(500).json({ error: "An error occurred while retrieving films by category" });
  }
});

router.get("/:id/actors", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      "SELECT actor.* FROM actor JOIN film_actor ON actor.actor_id = film_actor.actor_id WHERE film_actor.film_id = $1",
      [id]
    );
    res.json({ message: "Actors retrieved successfully", actors: result.rows });
  } catch (err) {
    res.status(500).json({ error: "An error occurred while retrieving actors for the film" });
  }
});

module.exports = router;
