import React from "react";

const Profile = () => {
  const user = {
    name: "Иван Иванов",
    email: "ivan@example.com",
    provider: "Google", // Пример: через какую соцсеть вошёл
  };

  return (
    <div className="p-8 max-w-md mx-auto">
      <h2 className="text-2xl font-semibold mb-4">Профиль пользователя</h2>
      <div className="bg-white dark:bg-gray-800 p-6 rounded shadow">
        <img
          src="https://via.placeholder.com/100"
          alt="Аватар"
          className="rounded-full mb-4"
        />
        <p className="mb-2">
          <strong>Имя:</strong> {user.name}
        </p>
        <p className="mb-2">
          <strong>Email:</strong> {user.email}
        </p>
        <p>
          <strong>Соцсеть:</strong> {user.provider}
        </p>
        <button className="mt-4 w-full bg-gray-300 dark:bg-gray-600 text-black dark:text-white py-2 rounded hover:opacity-90">
          Выйти
        </button>
      </div>
    </div>
  );
};

export default Profile;
