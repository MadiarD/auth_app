import React, { useState } from "react";
import products from "../data/products";
import ProductCard from "../components/ProductCard";

const SearchPage = () => {
  const [query, setQuery] = useState("");

  const filtered = products.filter((item) =>
    item.name.toLowerCase().includes(query.toLowerCase()) ||
    item.description.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold mb-4">Поиск</h2>

      <input
        type="text"
        placeholder="Введите название или описание товара..."
        className="w-full px-4 py-2 mb-6 border border-borderLight dark:border-borderDark rounded bg-white dark:bg-dark text-black dark:text-white"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {filtered.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <p className="text-gray-600 dark:text-gray-400">Ничего не найдено.</p>
      )}
    </div>
  );
};

export default SearchPage;
