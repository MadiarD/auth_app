import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, FacebookAuthProvider } from "firebase/auth";

// Конфигурация твоего Firebase-проекта 
const firebaseConfig = {
  apiKey: "AIzaSyDYyBOJO5S2BUURXmBsDqZ5fpsN4l_hG1g",
  authDomain: "auth-1ba03.firebaseapp.com",
  projectId: "auth-1ba03",
  storageBucket: "auth-1ba03.firebasestorage.app",
  messagingSenderId: "527073397937",
  appId: "1:527073397937:web:9f0f235a36f81fc4636690",
  measurementId: "G-EXZH3SNX10"
};
// Инициализация Firebase
const app = initializeApp(firebaseConfig);

// Экспортируем сервисы
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();
const facebookProvider = new FacebookAuthProvider();

export { auth, googleProvider, facebookProvider, firebaseConfig };
