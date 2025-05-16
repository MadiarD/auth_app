import React, { useState } from "react";
import { useCart } from "../context/CartContext";
import { Link } from "react-router-dom";

const Checkout = () => {
  const { cartItems, clearCart } = useCart();
  const [form, setForm] = useState({ name: "", address: "", phone: "" });
  const [isSubmitted, setIsSubmitted] = useState(false);

  const total = cartItems.reduce((sum, item) => sum + item.price, 0);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    clearCart();              // Очистить корзину
    setIsSubmitted(true);     // Показать сообщение "Спасибо"
  };

  if (isSubmitted) {
    return (
      <div className="p-8 max-w-3xl mx-auto text-center">
        <h2 className="text-2xl font-semibold mb-4">Спасибо за заказ!</h2>
        <p className="text-gray-600">Мы свяжемся с вами для подтверждения.</p>
        <Link
          to="/"
          className="mt-6 inline-block bg-black text-white py-2 px-4 rounded hover:opacity-90 transition"
        >
          На главную
        </Link>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <h2 className="text-2xl font-semibold mb-6">Оформление заказа</h2>

      <ul className="mb-6">
        {cartItems.map((item, index) => (
          <li key={index} className="flex justify-between py-2 border-b border-gray-200">
            <span>{item.name}</span>
            <span>{item.price} ₸</span>
          </li>
        ))}
      </ul>

      <div className="text-right text-lg font-semibold mb-6">
        Итого: {total} ₸
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          name="name"
          placeholder="Имя"
          value={form.name}
          onChange={handleChange}
          className="w-full border rounded px-4 py-2"
          required
        />
        <input
          type="text"
          name="address"
          placeholder="Адрес доставки"
          value={form.address}
          onChange={handleChange}
          className="w-full border rounded px-4 py-2"
          required
        />
        <input
          type="tel"
          name="phone"
          placeholder="Телефон"
          value={form.phone}
          onChange={handleChange}
          className="w-full border rounded px-4 py-2"
          required
        />
        <button
          type="submit"
          className="w-full bg-black text-white py-2 rounded hover:opacity-90 transition"
        >
          Оформить заказ
        </button>
      </form>
    </div>
  );
};

export default Checkout;
