/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import api from "../utils/api";
import { useAuth } from "./AuthContext";
import { toast } from "react-toastify";

const WishlistContext = createContext(null);

export const WishlistProvider = ({ children }) => {
  const { token, isAuthenticated } = useAuth();
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchWishlist = useCallback(async () => {
    if (!isAuthenticated) {
      setWishlist([]);
      return;
    }

    setLoading(true);
    try {
      const response = await api.get("/bookmark", {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Backend now returns { message, bookmarks: [] }
      setWishlist(response.data.bookmarks || []);
    } catch (error) {
      console.error("Error fetching wishlist:", error);
      // Don't toast on initial load error to avoid noise
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, token]);

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  const addToWishlist = async (perfumeId) => {
    if (!isAuthenticated) {
      toast.info("Please login to add items to your wishlist");
      return false;
    }

    try {
      await api.post(
        "/bookmark",
        { perfumeId },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      await fetchWishlist(); // Refresh wishlist
      toast.success("Added to wishlist");
      return true;
    } catch (error) {
      console.error("Error adding to wishlist:", error);
      toast.error(error.response?.data?.message || "Failed to add to wishlist");
      return false;
    }
  };

  const removeFromWishlist = async (perfumeId) => {
    if (!isAuthenticated) return false;

    try {
      await api.delete(`/bookmark/${perfumeId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Optimistic update
      setWishlist((prev) =>
        prev.filter((item) => item.perfume_id !== perfumeId),
      );
      toast.success("Removed from wishlist");
      return true;
    } catch (error) {
      console.error("Error removing from wishlist:", error);
      toast.error("Failed to remove from wishlist");
      return false;
    }
  };

  const isInWishlist = (perfumeId) => {
    return wishlist.some((item) => item.perfume_id === perfumeId);
  };

  const toggleWishlist = async (perfumeId) => {
    if (isInWishlist(perfumeId)) {
      return await removeFromWishlist(perfumeId);
    } else {
      return await addToWishlist(perfumeId);
    }
  };

  const value = {
    wishlist,
    loading,
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
    toggleWishlist,
    fetchWishlist,
    wishlistCount: wishlist.length,
  };

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error("useWishlist must be used within a WishlistProvider");
  }
  return context;
};
