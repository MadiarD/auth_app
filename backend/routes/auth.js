const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const db = require("../db");
const router = express.Router();

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await new Promise((resolve, reject) => {
      db.get("SELECT * FROM users WHERE email = ?", [email], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    if (!user) return res.status(404).json({ message: "User not found" });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ message: "Wrong password" });

    const isAdmin = email === "your_email@example.com"; // ← здесь замени на свой email

    const token = jwt.sign({ id: user.id, email, isAdmin }, process.env.JWT_SECRET || "secret");

    await new Promise((resolve, reject) => {
      db.run("UPDATE users SET isAdmin = ?, token = ? WHERE email = ?", [isAdmin, token, email], function (err) {
        if (err) reject(err);
        else resolve();
      });
    });

    res.json({ token, isAdmin });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
