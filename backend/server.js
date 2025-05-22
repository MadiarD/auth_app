const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const admin = require("firebase-admin");
const crypto = require("crypto");
const axios = require("axios");
const rateLimit = require("express-rate-limit"); // Добавляем rate limiting
const db = require("./users/db");

const app = express();
const PORT = process.env.PORT || 3001;

// Настройка Rate Limiting
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 минут
  max: 50, // Максимум 50 запросов с одного IP
  message: "Слишком много попыток входа, попробуйте снова через 15 минут",
});

// Настройка CORS
const corsOptions = {
  origin: "https://projectd-9c1fa.web.app",
  methods: ["GET", "POST", "OPTIONS"],
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization"],
};
app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

// Проверка HTTPS
app.use((req, res, next) => {
  if (req.get("x-forwarded-proto") !== "https" && process.env.NODE_ENV === "production") {
    return res.redirect(301, `https://${req.get("host")}${req.url}`);
  }
  next();
});

app.use(bodyParser.json());

// Инициализация Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert({
    projectId: "projectd-9c1fa",
    privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  }),
});

// Валидация входных данных
const validateInput = (data, requiredFields) => {
  for (const field of requiredFields) {
    if (!data[field] || typeof data[field] !== "string") {
      throw new Error(`Поле ${field} обязательно и должно быть строкой`);
    }
  }
};

// Регистрация по email + пароль
app.post("/api/register", loginLimiter, async (req, res) => {
  const { name, email, password } = req.body;

  try {
    validateInput({ email, password }, ["email", "password"]);
    if (!name) throw new Error("Поле name обязательно");

    const hashedPassword = await bcrypt.hash(password, 10);
    const id = Date.now().toString(); // Рекомендую заменить на uuid

    const query = `INSERT INTO users (id, name, email, password, provider) VALUES (?, ?, ?, ?, ?)`;
    db.run(query, [id, name, email, hashedPassword, "local"], function (err) {
      if (err) {
        if (err.message.includes("UNIQUE")) {
          return res.status(409).send("Пользователь с таким email уже существует");
        }
        console.error("Ошибка базы данных:", err);
        return res.status(500).send("Ошибка базы данных");
      }
      return res.status(200).send("Регистрация прошла успешно");
    });
  } catch (error) {
    console.error("Ошибка регистрации:", error.message);
    res.status(400).send(error.message);
  }
});

// Вход по email + пароль
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
      expiresIn: "1h", // Уменьшен срок действия токена
    });

    res.json({ token, isAdmin });
  } catch (error) {
    console.error("Ошибка входа:", error.message);
    res.status(400).send(error.message);
  }
});

// Вход/регистрация через Google, Telegram, Mail.ru
app.post("/api/social-login", loginLimiter, async (req, res) => {
  const { id, name, username, provider, email, token, hash } = req.body;

  try {
    validateInput({ id, name, provider }, ["id", "name", "provider"]);

    let isAdmin = email === "mkoishyn@mail.ru";

    if (provider === "google") {
      // Валидация Firebase токена
      const decodedToken = await admin.auth().verifyIdToken(token);
      if (decodedToken.uid !== id) {
        return res.status(401).send("Invalid Google token");
      }
    } else if (provider === "telegram") {
      // Проверка подписи Telegram
      const botToken = process.env.TELEGRAM_BOT_TOKEN;
      if (!hash) throw new Error("Telegram hash отсутствует");
      const dataCheckString = Object.keys(req.body)
        .filter((key) => key !== "hash" && key !== "provider" && key !== "token")
        .sort()
        .map((key) => `${key}=${req.body[key]}`)
        .join("\n");
      const secretKey = crypto.createHash("sha256").update(botToken).digest();
      const calculatedHash = crypto.createHmac("sha256", secretKey).update(dataCheckString).digest("hex");

      if (calculatedHash !== hash) {
        return res.status(401).send("Invalid Telegram hash");
      }
    } else {
      return res.status(400).send("Unsupported provider");
    }

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

    const jwtToken = jwt.sign({ id, name, email, provider, isAdmin }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.json({ token: jwtToken, isAdmin });
  } catch (error) {
    console.error("Ошибка входа через соцсеть:", error.message);
    res.status(400).send(error.message);
  }
});

// Mail.ru авторизация
app.post("/api/social-login/mailru", loginLimiter, async (req, res) => {
  try {
    const { code } = req.body;
    if (!code) throw new Error("Код авторизации отсутствует");

    const clientId = process.env.MAILRU_CLIENT_ID;
    const clientSecret = process.env.MAILRU_CLIENT_SECRET;
    const redirectUri = "https://projectd-9c1fa.web.app/auth/mailru-callback";

    // Обмен code на access token
    const tokenResponse = await axios.post("https://o2.mail.ru/token", {
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: "authorization_code",
      code,
      redirect_uri: redirectUri,
    });

    const accessToken = tokenResponse.data.access_token;
    // Получение данных пользователя
    const userResponse = await axios.get(`https://o2.mail.ru/userinfo?access_token=${accessToken}`);
    const userData = userResponse.data;

    const isAdmin = userData.email === "mkoishyn@mail.ru";

    // Проверка/создание пользователя
    const existingUser = await db.get(
      "SELECT * FROM users WHERE id = ? OR email = ?",
      [userData.id, userData.email]
    );

    if (!existingUser) {
      await db.run(
        "INSERT INTO users (id, name, email, provider, isAdmin) VALUES (?, ?, ?, ?, ?)",
        [userData.id, userData.name, userData.email, "mailru", isAdmin]
      );
    } else {
      await db.run("UPDATE users SET isAdmin = ? WHERE id = ?", [isAdmin, userData.id]);
    }

    // Создание Firebase кастомного токена
    const firebaseToken = await admin.auth().createCustomToken(userData.id, {
      email: userData.email,
      name: userData.name,
    });

    const jwtToken = jwt.sign(
      { id: userData.id, name: userData.name, email: userData.email, provider: "mailru", isAdmin },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({ token: jwtToken, firebaseToken, isAdmin });
  } catch (error) {
    console.error("Ошибка Mail.ru:", error.message);
    res.status(400).send("Mail.ru auth failed");
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});