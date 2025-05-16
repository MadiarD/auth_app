const functions = require("firebase-functions");
const express = require("express");
const cors = require("cors");
const admin = require("firebase-admin");

// Инициализация Firebase Admin SDK
if (!admin.apps.length) {
  admin.initializeApp();
}
const db = admin.firestore();

const app = express();
app.use(cors({ origin: true }));
app.use(express.json());

// Сохранение пользователя в Firestore
app.post("/save-user", async (req, res) => {
  const user = req.body;
  if (!user.uid) return res.status(400).send("UID is required");

  try {
    await db.collection("users").doc(user.uid).set({
      name: user.name || "",
      email: user.email || "",
      photoURL: user.photoURL || "",
      provider: user.provider || "custom",
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    }, { merge: true });

    return res.status(200).send("User saved");
  } catch (err) {
    console.error("Ошибка при сохранении:", err);
    return res.status(500).send("Internal Server Error");
  }
});

exports.api = functions.https.onRequest(app);
