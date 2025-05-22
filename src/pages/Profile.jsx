import React, { useEffect, useState } from "react";

export default function Profile() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) return;

    fetch("https://secure-shop.onrender.com/api/profile", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => setUser(data))
      .catch((err) => console.error("Ошибка загрузки профиля:", err));
  }, []);

  if (!user) return <p className="text-center mt-10">Загрузка...</p>;

  return (
    <div className="p-8 max-w-md mx-auto">
      <h2 className="text-2xl font-semibold mb-4">Профиль пользователя</h2>
      <div className="bg-white dark:bg-gray-800 p-6 rounded shadow">
        <img
          src="https://via.placeholder.com/100"
          alt="Аватар"
          className="rounded-full mb-4"
        />
        <p className="mb-2"><strong>Имя:</strong> {user.name}</p>
        <p className="mb-2"><strong>Email:</strong> {user.email || "—"}</p>
        <p><strong>Соцсеть:</strong> {user.provider || "—"}</p>

        <button
          onClick={() => {
            localStorage.removeItem("token");
            localStorage.removeItem("isAdmin");
            window.location.href = "/login";
          }}
          className="mt-4 w-full bg-gray-300 dark:bg-gray-600 text-black dark:text-white py-2 rounded hover:opacity-90"
        >
          Выйти
        </button>
      </div>
    </div>
  );
}
