const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const db = require("../db");
const router = express.Router();

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await db.get("SELECT * FROM users WHERE email = ?", [email]);
    if (!user) return res.status(404).json({ message: "User not found" });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ message: "Wrong password" });

    const isAdmin = email === "your_email@example.com"; // ← сюда вставь свою почту

    await db.run("UPDATE users SET isAdmin = ? WHERE email = ?", [isAdmin, email]);

    const token = jwt.sign({ id: user.id, email, isAdmin }, process.env.JWT_SECRET);
    res.json({ token, isAdmin });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
