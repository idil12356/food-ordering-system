import { createContext, useContext, useState } from 'react';
const CartContext = createContext();
export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const addToCart = (item) => {
    setCart(prev => {
      const ex = prev.find(i => i._id === item._id);
      if (ex) return prev.map(i => i._id === item._id ? { ...i, quantity: i.quantity + 1 } : i);
      return [...prev, { ...item, quantity: 1 }];
    });
  };
  const removeFromCart = (id) => setCart(prev => prev.filter(i => i._id !== id));
  const updateQuantity = (id, qty) => {
    if (qty <= 0) return removeFromCart(id);
    setCart(prev => prev.map(i => i._id === id ? { ...i, quantity: qty } : i));
  };
  const clearCart = () => setCart([]);
  const subtotal = cart.reduce((s, i) => s + i.price * i.quantity, 0);
  const deliveryFee = cart.length > 0 ? 5 : 0;
  const total = subtotal + deliveryFee;
  const itemCount = cart.reduce((s, i) => s + i.quantity, 0);
  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart, subtotal, deliveryFee, total, itemCount }}>
      {children}
    </CartContext.Provider>
  );
};
export const useCart = () => useContext(CartContext);
