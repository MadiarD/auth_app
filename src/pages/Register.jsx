import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleRegister = async () => {
    try {
      const res = await fetch("https://secure-shop.onrender.com/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      if (!res.ok) {
        const error = await res.text();
        alert("Ошибка регистрации: " + error);
        return;
      }

      alert("Регистрация успешна!");
      navigate("/login");
    } catch (error) {
      console.error("Ошибка регистрации:", error);
      alert("Ошибка сервера");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-light dark:bg-dark text-textLight dark:text-textDark">
      <div className="bg-white dark:bg-cardDark p-8 rounded-lg shadow-md w-full max-w-md text-center">
        <h2 className="text-xl font-bold mb-6">Регистрация</h2>

        <input
          type="text"
          placeholder="Имя"
          className="w-full px-4 py-3 mb-3 bg-gray-100 dark:bg-dark border border-gray-300 rounded"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          type="email"
          placeholder="Email"
          className="w-full px-4 py-3 mb-3 bg-gray-100 dark:bg-dark border border-gray-300 rounded"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Пароль"
          className="w-full px-4 py-3 mb-3 bg-gray-100 dark:bg-dark border border-gray-300 rounded"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          onClick={handleRegister}
          className="w-full bg-black text-white py-3 rounded-full text-lg font-semibold hover:bg-gray-800 transition"
        >
          Зарегистрироваться
        </button>
      </div>
    </div>
  );
}
