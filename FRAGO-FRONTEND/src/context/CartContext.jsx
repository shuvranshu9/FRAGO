import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import api from "../utils/api";
import { useAuth } from "./AuthContext";

const CartContext = createContext();

// eslint-disable-next-line react-refresh/only-export-components
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const { token, isAuthenticated } = useAuth();
  const [cart, setCart] = useState(null);
  const [cartCount, setCartCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchCart = useCallback(async () => {
    if (!isAuthenticated || !token) {
      setCart(null);
      setCartCount(0);
      return;
    }

    try {
      setLoading(true);
      const response = await api.get("/cart", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCart(response.data);
      // Calculate total items
      const count =
        response.data?.items?.reduce(
          (total, item) => total + item.quantity,
          0,
        ) || 0;
      setCartCount(count);
    } catch (error) {
      console.error("Error fetching cart:", error);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, token]);

  // Initial fetch when auth changes
  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const addToCart = async (variantId, quantity) => {
    if (!isAuthenticated)
      return {
        success: false,
        message: "Please login to add items to your cart",
      };

    try {
      await api.post(
        "/cart",
        { variantId, quantity },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      await fetchCart(); // Refresh cart to get updated state
      return { success: true, message: "Item added to cart" };
    } catch (error) {
      console.error("Error adding to cart:", error);
      return {
        success: false,
        message: error.response?.data?.message || "Failed to add item to cart",
      };
    }
  };

  const updateQuantity = async (cartItemId, quantity) => {
    if (!isAuthenticated)
      return { success: false, message: "Not authenticated" };

    try {
      await api.put(
        `/cart/${cartItemId}`,
        { quantity },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      await fetchCart(); // Refresh cart
      return { success: true };
    } catch (error) {
      console.error("Error updating cart quantity:", error);
      return {
        success: false,
        message: error.response?.data?.message || "Failed to update quantity",
      };
    }
  };

  const removeFromCart = async (cartItemId) => {
    if (!isAuthenticated)
      return { success: false, message: "Not authenticated" };

    try {
      await api.delete(`/cart/${cartItemId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      await fetchCart(); // Refresh cart
      return { success: true };
    } catch (error) {
      console.error("Error removing from cart:", error);
      return {
        success: false,
        message: error.response?.data?.message || "Failed to remove item",
      };
    }
  };

  const clearCart = async () => {
    if (!isAuthenticated)
      return { success: false, message: "Not authenticated" };

    try {
      await api.delete("/cart", {
        headers: { Authorization: `Bearer ${token}` },
      });
      await fetchCart(); // Refresh cart
      return { success: true };
    } catch (error) {
      console.error("Error clearing cart:", error);
      return {
        success: false,
        message: error.response?.data?.message || "Failed to clear cart",
      };
    }
  };

  const value = {
    cart,
    cartCount,
    loading,
    fetchCart,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
