/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useEffect, useState } from "react";
import api from "../utils/api";
import { useAuth } from "./AuthContext";
import { useSocket } from "./SocketContext";

const OrdersContext = createContext(null);

export const OrdersProvider = ({ children }) => {
  const { token, isAuthenticated } = useAuth();
  const { socket, isConnected } = useSocket();

  const [pendingOrdersCount, setPendingOrdersCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const refreshPendingOrdersCount = useCallback(async () => {
    if (!isAuthenticated || !token) {
      setPendingOrdersCount(0);
      return;
    }

    setLoading(true);
    try {
      const response = await api.get("/order", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const pending = (response.data || []).filter(
        (order) => (order.order_status || "").toLowerCase() === "pending",
      );
      setPendingOrdersCount(pending.length);
    } catch (error) {
      console.error("Error fetching pending orders count:", error);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, token]);

  useEffect(() => {
    refreshPendingOrdersCount();
  }, [refreshPendingOrdersCount]);

  useEffect(() => {
    if (!socket || !isConnected || !isAuthenticated) return;

    const handleOrderUpdated = () => {
      refreshPendingOrdersCount();
    };

    socket.on("orderUpdated", handleOrderUpdated);

    return () => {
      socket.off("orderUpdated", handleOrderUpdated);
    };
  }, [socket, isConnected, isAuthenticated, refreshPendingOrdersCount]);

  return (
    <OrdersContext.Provider
      value={{
        pendingOrdersCount,
        refreshPendingOrdersCount,
        loading,
      }}
    >
      {children}
    </OrdersContext.Provider>
  );
};

export const useOrders = () => {
  const context = useContext(OrdersContext);
  if (!context) {
    throw new Error("useOrders must be used within an OrdersProvider");
  }
  return context;
};
