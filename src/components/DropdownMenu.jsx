import React from "react";
import { Link } from "react-router-dom";

const DropdownMenu = () => {
  const categories = [
    { title: "Платья", gender: "women" },
    { title: "Обувь", gender: "women" },
    { title: "Юбки", gender: "women" },
    { title: "Брюки", gender: "women" },
    { title: "Украшения", gender: "women" },
  ];

  const specials = [
    { title: "Новинки", gender: "women", category: "Новинки" },
    { title: "Скидки до -10%", gender: "women", category: "Скидки до -10%" },
    { title: "Купальники", gender: "women", category: "Купальники" },
  ];
  return (
    <div className="grid grid-cols-2 gap-8 text-sm min-w-[280px]">
      <div>
        <h3 className="font-bold mb-2">Специальные предложения</h3>
        <ul className="space-y-1">
          {specials.map((item) => (
            <li key={item.title}>
              <Link
                to={`/catalog?gender=${item.gender}&category=${encodeURIComponent(item.category)}`}
                className="hover:underline"
              >
                {item.title}
              </Link>
            </li>
          ))}
        </ul>
      </div>
      <div>
        <h3 className="font-bold mb-2">Женщинам</h3>
        <ul className="space-y-1">
          {categories.map((item) => (
            <li key={item.title}>
              <Link
                to={`/catalog?gender=${item.gender}&category=${encodeURIComponent(item.title)}`}
                className="hover:underline"
              >
                {item.title}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default DropdownMenu;
