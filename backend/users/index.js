const express = require("express");
const db = require("../db");
const router = express.Router();

router.post("/save-user", (req, res) => {
  const { id, name, email, provider } = req.body;

  db.run(
    `INSERT OR REPLACE INTO users (id, name, email, provider) VALUES (?, ?, ?, ?)`,
    [id, name, email, provider],
    (err) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({ success: true });
    }
  );
});

module.exports = router;
