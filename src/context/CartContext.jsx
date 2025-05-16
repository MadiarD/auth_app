import React, { createContext, useContext, useEffect, useState } from 'react';

// Создание контекста
const CartContext = createContext();

// Хук для доступа к корзине из любого компонента
export const useCart = () => useContext(CartContext);

// Провайдер корзины
export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    // Инициализация из localStorage
    const savedCart = localStorage.getItem('cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });

  // Сохраняем в localStorage при каждом изменении корзины
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cartItems));
  }, [cartItems]);

  // Добавить товар
  const addToCart = (product) => {
    setCartItems((prevItems) => [...prevItems, product]);
  };

  // Удалить товар по id
  const removeFromCart = (productId) => {
    setCartItems((prevItems) =>
      prevItems.filter((item) => item.id !== productId)
    );
  };

  // Очистить корзину
  const clearCart = () => {
    setCartItems([]);
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
