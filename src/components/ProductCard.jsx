import React, { useState } from "react";
import { useCart } from "../context/CartContext";

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const [isAdded, setIsAdded] = useState(false);

  const handleAdd = () => {
    addToCart(product);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 1000); // сброс через 1 сек
  };

  return (
    <div className="bg-white dark:bg-cardDark border border-borderLight dark:border-borderDark rounded-lg p-4 shadow hover:shadow-md transition">
      <img
        src={product.image}
        alt={product.name}
        className="w-full h-48 object-cover rounded-md mb-4"
      />
      <h3 className="text-lg font-semibold mb-1">{product.name}</h3>
      <p className="text-gray-500 dark:text-gray-300 text-sm mb-2">
        {product.description}
      </p>
      <div className="flex justify-between items-center">
        <span className="font-bold text-accent">{product.price} ₸</span>
        <button
          onClick={handleAdd}
          className={`px-4 py-1 text-sm rounded transition font-medium ${
            isAdded
              ? "bg-green-500 text-white cursor-default"
              : "bg-accent text-white hover:bg-accentHover"
          }`}
        >
          {isAdded ? "Добавлено" : "В корзину"}
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
