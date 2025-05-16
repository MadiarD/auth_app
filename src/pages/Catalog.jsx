import React from "react";
import { useLocation } from "react-router-dom";
import products from "../data/products";
import ProductCard from "../components/ProductCard";

const Catalog = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);

  const gender = searchParams.get("gender");
  let category = searchParams.get("category");

  // 🔒 Безопасное декодирование
  try {
    if (category) {
      category = decodeURIComponent(category);
    }
  } catch (error) {
    console.error("Некорректный URI:", category);
    category = null;
  }

  // Фильтрация
  const filteredProducts = products.filter((product) => {
    const genderMatch = gender ? product.gender === gender : true;
    const categoryMatch = category ? product.category === category : true;
    return genderMatch && categoryMatch;
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">
        Каталог
        {gender && ` / ${gender === "women" ? "Женщины" : "Мужчины"}`}
        {category && ` / ${category}`}
      </h1>

      {filteredProducts.length === 0 ? (
        <p>Товары не найдены.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Catalog;
