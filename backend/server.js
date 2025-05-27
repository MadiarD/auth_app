require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const admin = require("firebase-admin");
const crypto = require("crypto");
const axios = require("axios");
const rateLimit = require("express-rate-limit");

const app = express();
const PORT = process.env.PORT || 3001;

// Проверка переменных окружения
if (!process.env.FIREBASE_PRIVATE_KEY || !process.env.FIREBASE_CLIENT_EMAIL || !process.env.JWT_SECRET) {
  console.error("❌ Ошибка: отсутствуют переменные окружения");
  process.exit(1);
}

// Rate Limiting
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  message: "Слишком много попыток входа, попробуйте снова через 15 минут",
});

// CORS
const corsOptions = {
  origin: "http://localhost:5173",
  methods: ["GET", "POST", "OPTIONS"],
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization"],
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

// HTTPS редирект
app.use((req, res, next) => {
  if (req.get("x-forwarded-proto") !== "https" && process.env.NODE_ENV === "production") {
    return res.redirect(301, `https://${req.get("host")}${req.url}`);
  }
  next();
});

// // CSRF-защита
// app.use((req, res, next) => {
//   const referer = req.get("Referer");
//   if (req.path.startsWith("/api") && referer && !referer.includes("projectd-9c1fa.web.app")) {
//     return res.status(403).send("Forbidden: Invalid Referer");
//   }
//   next();
// });

app.use(bodyParser.json());

// Инициализация Firebase Admin
delete require.cache[require.resolve('./firebase-adminsdk.json')];
const serviceAccount = require('./firebase-adminsdk.json');

console.log("🔥 Подключаемся к проекту:", serviceAccount.project_id);
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// Утилита валидации
const validateInput = (data, requiredFields) => {
  for (const field of requiredFields) {
    if (!data[field] || typeof data[field] !== "string") {
      throw new Error(`Поле ${field} обязательно и должно быть строкой`);
    }
  }
};

// 📌 Вход по email/паролю
app.post("/api/login", loginLimiter, async (req, res) => {
  const { email, password } = req.body;
  try {
    validateInput({ email, password }, ["email", "password"]);
    const user = await db.get("SELECT * FROM users WHERE email = ?", [email]);
    if (!user) return res.status(404).send("Пользователь не найден");

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).send("Неверный пароль");

    const isAdmin = email === "mkoishyn@mail.ru";
    await db.run("UPDATE users SET isAdmin = ? WHERE email = ?", [isAdmin, email]);

    const token = jwt.sign({ id: user.id, email, isAdmin }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.json({ token, isAdmin });
  } catch (error) {
    console.error("Ошибка входа:", error.message);
    res.status(400).send(error.message);
  }
});

// 📌 Регистрация
app.post("/api/register", loginLimiter, async (req, res) => {
  const { name, email, password } = req.body;
  try {
    validateInput({ email, password }, ["email", "password"]);
    if (!name) throw new Error("Поле name обязательно");

    const hashedPassword = await bcrypt.hash(password, 10);
    const id = Date.now().toString();

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
  } catch (error) {
    console.error("Ошибка регистрации:", error.message);
    res.status(400).send(error.message);
  }
});

// 📌 Вход через Google
app.post("/api/google-login", loginLimiter, async (req, res) => {
  try {
    const { token } = req.body;
    console.log("🌐 Запрос на /api/google-login:", token);

    const decoded = await admin.auth().verifyIdToken(token);
    const email = decoded.email;
    const name = decoded.name || "Google User";
    const provider = "google";
    const uid = decoded.uid;
    const sqlite3 = require("sqlite3").verbose();
    const db = new sqlite3.Database("users.db");

    const existingUser = await db.get("SELECT * FROM users WHERE id = ? OR email = ?", [uid, email]);

    if (!existingUser) {
      await db.run(
        "INSERT INTO users (id, name, email, provider, isAdmin) VALUES (?, ?, ?, ?, ?)",
        [uid, name, email, provider, email === "mkoishyn@mail.ru"]
      );
    }

    const jwtToken = jwt.sign(
      { id: uid, name, email, provider, isAdmin: email === "mkoishyn@mail.ru" },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({ token: jwtToken });

  } catch (error) {
    console.error("Ошибка входа через Google:", error.message);
    res.status(401).json({ error: "Invalid Google token", message: error.message });
  }
});


// 📌 Соцвход (Google, Telegram)
app.post("/api/social-login", loginLimiter, async (req, res) => {
  const { id, name, username, provider, email, token, hash } = req.body;

  try {
    validateInput({ id, name, provider }, ["id", "name", "provider"]);
    let isAdmin = email === "mkoishyn@mail.ru";

    if (provider === "google") {
      const decodedToken = await admin.auth().verifyIdToken(token);
      if (decodedToken.uid !== id) return res.status(401).send("Invalid Google token");
    } else if (provider === "telegram") {
      const botToken = process.env.TELEGRAM_BOT_TOKEN;

      // 🔍 Логируем пришедшие данные от Telegram
      console.log("📥 Получен запрос от Telegram:", req.body);
      console.log("🔑 Используемый botToken:", botToken);

      const dataCheckString = Object.keys(req.body)
        .filter((key) => key !== "hash" && key !== "provider" && key !== "token")
        .sort()
        .map((key) => `${key}=${req.body[key]}`)
        .join("\n");

      console.log("📦 Сформированная строка для hash:", dataCheckString);

      const secretKey = crypto.createHash("sha256").update(botToken).digest();
      const calculatedHash = crypto.createHmac("sha256", secretKey).update(dataCheckString).digest("hex");

      console.log("🔐 calculatedHash:", calculatedHash);
      console.log("🔐 hash из Telegram:", hash);

      if (calculatedHash !== hash) {
        console.error("❌ Hash mismatch! Telegram вход отклонён.");
        return res.status(401).send("Invalid Telegram hash");
      }
    } else {
      return res.status(400).send("Unsupported provider");
    }

    const existingUser = await db.get("SELECT * FROM users WHERE id = ? OR email = ?", [
      id,
      email || null,
    ]);

    if (!existingUser) {
      await db.run(
        "INSERT INTO users (id, name, username, email, provider, isAdmin) VALUES (?, ?, ?, ?, ?, ?)",
        [id, name, username || null, email || null, provider, isAdmin]
      );
    } else {
      await db.run("UPDATE users SET isAdmin = ? WHERE id = ?", [isAdmin, id]);
    }

    const jwtToken = jwt.sign({ id, name, email, provider, isAdmin }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.json({ token: jwtToken, isAdmin });
  } catch (error) {
    console.error("Ошибка входа через соцсеть:", error.message);
    res.status(400).send(error.message);
  }
});


// 📌 Профиль
app.get("/api/profile", async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await db.get("SELECT * FROM users WHERE id = ?", [decoded.id]);
    if (!user) return res.status(404).send("User not found");
    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      provider: user.provider,
      isAdmin: user.isAdmin,
    });
  } catch (error) {
    res.status(401).send("Invalid token");
  }
});

// 📌 Подключение дополнительных маршрутов (например, save-user)
const userRoutes = require("./users");
app.use("/api", userRoutes);

// Запуск сервера
app.listen(PORT, () => {
  console.log(`✅ Сервер запущен на http://localhost:${PORT}`);
});
