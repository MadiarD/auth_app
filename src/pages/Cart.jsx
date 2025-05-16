import React from "react";
import { useCart } from "../context/CartContext";
import { Link } from "react-router-dom";

const Cart = () => {
  const { cartItems, removeFromCart } = useCart();

  const total = cartItems.reduce((sum, item) => sum + item.price, 0);

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <h2 className="text-2xl font-semibold mb-4">Корзина</h2>
      {cartItems.length === 0 ? (
        <p className="text-gray-500">Ваша корзина пуста.</p>
      ) : (
        <>
          <ul className="space-y-4">
            {cartItems.map((item, index) => (
              <li
                key={index}
                className="flex justify-between bg-white dark:bg-gray-800 p-4 rounded shadow"
              >
                <div className="flex flex-col">
                  <span>{item.name}</span>
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="text-sm text-red-500 hover:underline"
                  >
                    Удалить
                  </button>
                </div>
                <span>{item.price} ₸</span>
              </li>
            ))}
          </ul>
          <div className="mt-6 flex justify-between text-lg font-medium">
            <span>Итого:</span>
            <span>{total} ₸</span>
          </div>
          <Link
            to="/checkout"
            className="mt-4 block w-full bg-black dark:bg-white text-white dark:text-black py-2 rounded text-center hover:opacity-90 transition"
          >
            Перейти к оформлению
          </Link>
        </>
      )}
    </div>
  );
};

export default Cart;
