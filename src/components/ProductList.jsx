import React from "react";
import products from "../data/products";
import ProductCard from "./ProductCard";

const ProductList = ({ gender }) => {
  const filteredProducts = gender
    ? products.filter((product) => product.gender === gender)
    : products;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
      {filteredProducts.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
};

export default ProductList;
