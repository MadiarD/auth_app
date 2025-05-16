import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "../firebase";
import TelegramLoginButton from "../components/TelegramLoginButton";

export default function Login() {
  const navigate = useNavigate();
  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [password, setPassword] = useState("");

  const handleEmailLogin = async () => {
    try {
      const res = await fetch("https://backend-service-p8bw.onrender.com/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailOrPhone, password }),
      });

      if (!res.ok) {
        const error = await res.text();
        alert("Ошибка входа: " + error);
        return;
      }

      const data = await res.json();
      localStorage.setItem("token", data.token);
      localStorage.setItem("isAdmin", data.isAdmin);

      if (data.isAdmin) {
        navigate("/admin");
      } else {
        navigate("/profile");
      }
    } catch (error) {
      console.error("Ошибка при входе:", error);
      alert("Ошибка входа.");
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      await fetch("https://backend-service-p8bw.onrender.com/api/social-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: user.uid,
          name: user.displayName,
          email: user.email,
          provider: "google",
        }),
      });

      navigate("/profile");
    } catch (error) {
      console.error("Ошибка входа через Google:", error);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-light dark:bg-dark text-textLight dark:text-textDark">
      <div className="bg-white dark:bg-cardDark p-8 rounded-lg shadow-md w-full max-w-md text-center">
        <h2 className="text-xl font-bold mb-6">Log in / Register</h2>

        <input
          type="text"
          placeholder="Email"
          className="w-full px-4 py-3 mb-3 bg-gray-100 dark:bg-dark border border-gray-300 rounded"
          value={emailOrPhone}
          onChange={(e) => setEmailOrPhone(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full px-4 py-3 mb-4 bg-gray-100 dark:bg-dark border border-gray-300 rounded"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <div className="flex items-center mb-4">
          <input type="checkbox" id="stayLogged" className="mr-2" />
          <label htmlFor="stayLogged" className="text-sm opacity-70">
            Stay logged in
          </label>
        </div>

        <button
          onClick={handleEmailLogin}
          className="w-full bg-black text-white py-3 rounded-full text-lg font-semibold hover:bg-gray-800 transition"
        >
          Next
        </button>

        <div className="my-6 space-y-3">
          <TelegramLoginButton />

          <button
            onClick={handleGoogleLogin}
            className="w-full bg-red-500 hover:bg-red-600 text-white py-2 rounded text-base font-medium"
          >
            Войти через Google
          </button>
        </div>

        <div className="text-sm underline space-y-1 mt-4">
          <p className="hover:text-accent cursor-pointer">Access with code</p>
          <p className="hover:text-accent cursor-pointer">Reset my password</p>
        </div>

        <p className="text-xs text-gray-400 mt-6">
          Мы используем указанный адрес электронной почты, чтобы отправить тебе проверочный код.
        </p>
      </div>
    </div>
  );
}
