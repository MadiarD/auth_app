const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("./users/db");

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(bodyParser.json());

// ✅ Регистрация по email + пароль
app.post("/api/register", async (req, res) => {
  const { name, email, password } = req.body;
  if (!email || !password) return res.status(400).send("Email и пароль обязательны");

  const hashedPassword = await bcrypt.hash(password, 10);
  const id = Date.now().toString(); // Можно заменить на uuid

  const query = `INSERT INTO users (id, name, email, password, provider) VALUES (?, ?, ?, ?, ?)`;
  db.run(query, [id, name, email, hashedPassword, "local"], function (err) {
    if (err) {
      if (err.message.includes("UNIQUE")) {
        return res.status(409).send("Пользователь с таким email уже существует");
      }
      return res.status(500).send("Ошибка базы данных");
    }
    return res.status(200).send("Регистрация прошла успешно");
  });
});

// ✅ Вход по email + пароль
app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;

  const user = await db.get("SELECT * FROM users WHERE email = ?", [email]);
  if (!user) return res.status(404).send("Пользователь не найден");

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(401).send("Неверный пароль");

  const isAdmin = email === "mkoishyn@mail.ru";

  await db.run("UPDATE users SET isAdmin = ? WHERE email = ?", [isAdmin, email]);

  const token = jwt.sign({ id: user.id, email, isAdmin }, "secret_key", {
    expiresIn: "7d",
  });

  res.json({ token, isAdmin });
});

// ✅ Вход/регистрация через Google и Telegram
app.post("/api/social-login", async (req, res) => {
  const { id, name, username, provider, email } = req.body;

  try {
    const isAdmin = email === "mkoishyn@mail.ru";

    const existingUser = await db.get(
      "SELECT * FROM users WHERE id = ? OR email = ?",
      [id, email || null]
    );

    if (!existingUser) {
      await db.run(
        "INSERT INTO users (id, name, username, email, provider, isAdmin) VALUES (?, ?, ?, ?, ?, ?)",
        [id, name, username || null, email || null, provider, isAdmin]
      );
    } else {
      await db.run("UPDATE users SET isAdmin = ? WHERE id = ?", [isAdmin, id]);
    }

    const token = jwt.sign({ id, name, isAdmin }, "secret_key", {
      expiresIn: "7d",
    });

    res.json({ token, isAdmin });
  } catch (error) {
    console.error("Ошибка входа через соцсеть:", error);
    res.status(500).send("Ошибка входа через соцсеть");
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
