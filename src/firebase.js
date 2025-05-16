import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, FacebookAuthProvider } from "firebase/auth";

// Конфигурация твоего Firebase-проекта 
const firebaseConfig = {
  apiKey: "AIzaSyCHdf1KK-No4pN-obPoc_GvNhvO7d2lUSE",
  authDomain: "projectd-9c1fa.firebaseapp.com",
  projectId: "projectd-9c1fa",
  storageBucket: "projectd-9c1fa.appspot.com", 
  messagingSenderId: "914938764845",
  appId: "1:914938764845:web:891ed5cdc06a46b0b262a4",
  measurementId: "G-QJS4GHN782"
};

// Инициализация Firebase
const app = initializeApp(firebaseConfig);

// Экспортируем сервисы
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();
const facebookProvider = new FacebookAuthProvider();

export { auth, googleProvider, facebookProvider, firebaseConfig };
