import React, { useState, useEffect, useRef } from "react";
import { Routes, Route, Link } from "react-router-dom";
import {
  Menu,
  Search,
  User,
  ShoppingCart,
  Sun,
  Moon,
} from "lucide-react";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import Catalog from "./pages/Catalog";
import Cart from "./pages/Cart";
import SearchPage from "./pages/Search";
import Checkout from "./pages/Checkout";
//import Admin from "./pages/Admin";

import DropdownMenu from "./components/DropdownMenu";
import ProtectedAdminRoute from "./components/ProtectedAdminRoute";
import ProtectedRoute from "./components/ProtectedRoute";

export default function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const menuRef = useRef(null);
  const token = localStorage.getItem("token");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("isAdmin");
    window.location.href = "/login";
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  return (
    <div
      className={`pt-20 min-h-screen transition-colors duration-300 font-sans
      ${menuOpen ? "backdrop-blur-sm" : ""}
      bg-light dark:bg-dark text-textLight dark:text-textDark`}
    >
      <nav className="fixed top-0 left-0 w-full z-50 px-6 py-4 flex justify-between items-center bg-light dark:bg-dark border-b border-borderLight dark:border-borderDark shadow">
        <div className="relative z-50" ref={menuRef}>
          <button
            className="flex items-center border border-borderLight dark:border-borderDark rounded-full px-4 py-1 text-sm hover:bg-white dark:hover:bg-cardDark hover:text-black transition"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <Menu size={18} className="mr-2" />
            <span>Menu</span>
          </button>

          {menuOpen && (
            <div className="absolute top-full left-0 mt-2 bg-white dark:bg-cardDark shadow-lg rounded-md p-4 z-50 animate-fade-in transition-all duration-300">
              <DropdownMenu />
            </div>
          )}
        </div>

        <Link to="/" className="text-xl md:text-2xl font-bold tracking-wider">
          SecureShop
        </Link>

        <div className="flex items-center space-x-4">
          <Link
            to="/search"
            className="flex items-center border border-borderLight dark:border-borderDark rounded-full px-4 py-1 text-sm hover:bg-white dark:hover:bg-cardDark transition"
          >
            <Search size={16} className="mr-2" />
            <span className="opacity-80">Search</span>
          </Link>

          {!token && (
            <Link
              to="/login"
              className="flex items-center border border-borderLight dark:border-borderDark rounded-full px-4 py-1 text-sm hover:bg-white dark:hover:bg-cardDark transition"
            >
              <User size={16} className="mr-2" />
              <span>Войти</span>
            </Link>
          )}

          {token && (
            <button
              onClick={handleLogout}
              className="flex items-center border border-red-400 text-red-500 rounded-full px-4 py-1 text-sm hover:bg-red-50 transition"
            >
              Выйти
            </button>
          )}

          <Link to="/cart">
            <ShoppingCart size={20} className="hover:text-accent transition cursor-pointer" />
          </Link>

          <button onClick={() => setDarkMode(!darkMode)}>
            {darkMode ? (
              <Sun size={20} className="text-accent hover:text-accentHover transition" />
            ) : (
              <Moon size={20} className="text-gray-600 hover:text-black transition" />
            )}
          </button>
        </div>
      </nav>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />

        <Route path="/catalog" element={<Catalog />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />

    

      </Routes>

      
    </div>
  );
}
