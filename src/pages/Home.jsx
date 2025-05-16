import React from "react";
import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="flex h-screen w-full">
      {/* Для женщин */}
      <Link
        to="/catalog?gender=women"
        className="w-1/2 h-full bg-[url('https://i.pinimg.com/736x/c8/ce/e3/c8cee360998836138a41d95bb0257062.jpg')] bg-cover bg-center flex items-center justify-center hover:scale-105 transition-transform duration-500"
      >
        <span className="text-white text-3xl md:text-5xl font-bold drop-shadow-lg">Для Женщин</span>
      </Link>

      {/* Для мужчин */}
      <Link
        to="/catalog?gender=men"
        className="w-1/2 h-full bg-[url('https://i.pinimg.com/736x/04/90/4b/04904bed8e1f8c3023eb6558fc87efc3.jpg')] bg-cover bg-center flex items-center justify-center hover:scale-105 transition-transform duration-500"
      >
        <span className="text-white text-3xl md:text-5xl font-bold drop-shadow-lg">Для Мужчин</span>
      </Link>
    </div>
  );
}
