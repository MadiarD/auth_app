import React, { useEffect, useState } from "react";

export default function Profile() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) return;
    const API = import.meta.env.VITE_API_URL;

    fetch(`${API}/api/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(async (res) => {
          if (!res.ok) {
            const msg = await res.text();     
            throw new Error(msg);
          }
          return res.json();
        })
        .then(setUser)
        .catch((err) => {
          console.error(err.message);
          if (err.message === 'Invalid token') {
            console.log(token)
            localStorage.removeItem('token');
          }
        });

  }, []);

  if (!user) return <p className="text-center mt-10">Загрузка...</p>;

  return (
    <div className="p-8 max-w-md mx-auto">
      <h2 className="text-2xl font-semibold mb-4">Профиль пользователя</h2>
      <div className="bg-white dark:bg-gray-800 p-6 rounded shadow">
        <img
          src="https://cdn1.iconfinder.com/data/icons/avatars-1-5/136/87-1024.png"
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
