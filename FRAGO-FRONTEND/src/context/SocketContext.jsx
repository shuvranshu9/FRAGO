/* eslint-disable react-refresh/only-export-components */
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
} from "react";
import { io } from "socket.io-client";
import { useAuth } from "./AuthContext";
import api from "../utils/api";

const SocketContext = createContext(undefined);

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) throw new Error("useSocket must be used within SocketProvider");
  return context;
};

export const SocketProvider = ({ children }) => {
  const { token, user, isAuthenticated } = useAuth();

  const socketRef = useRef(null); // Keep ref for internal cleanup/checks
  const [socket, setSocket] = useState(null); // Use state for the provider value
  const [isConnected, setIsConnected] = useState(false);
  const [unreadMessagesCount, setUnreadMessagesCount] = useState(0);

  useEffect(() => {
    if (!token || !isAuthenticated) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      return;
    }

    const SOCKET_URL = "http://localhost:8000";

    // Cleanup if token changed or already exists
    if (socketRef.current) {
      socketRef.current.disconnect();
    }

    console.log("Centralized Socket: Initializing for user:", user?.userID);
    const newSocket = io(SOCKET_URL, {
      auth: { token },
    });

    socketRef.current = newSocket;

    newSocket.on("connect", () => {
      setIsConnected(true);
      setSocket(newSocket);
      console.log("Centralized Socket connected:", newSocket.id);
    });

    newSocket.on("disconnect", () => {
      setIsConnected(false);
      console.log("Centralized Socket disconnected");
    });

    newSocket.on("connect_error", (err) => {
      console.error("Centralized Socket error:", err.message);
    });

    const handleNewMessage = (message) => {
      if (message.sender_id !== user?.userID) {
        setUnreadMessagesCount((prev) => prev + 1);
      }
    };

    newSocket.on("newMessage", handleNewMessage);

    // Fetch initial unread count
    const fetchUnreadCount = async () => {
      try {
        const response = await api.get("/chat");
        const chats = response.data;
        const count = chats.reduce(
          (acc, chat) => acc + (chat.unread_count || 0),
          0,
        );
        setUnreadMessagesCount(count);
      } catch (error) {
        console.error("Error fetching unread count:", error);
      }
    };
    fetchUnreadCount();

    return () => {
      newSocket.off("newMessage", handleNewMessage);
      newSocket.disconnect();
      socketRef.current = null;
      setSocket(null);
    };
  }, [token, isAuthenticated, user?.userID]);

  const decrementUnreadCount = (count) => {
    setUnreadMessagesCount((prev) => Math.max(0, prev - count));
  };

  return (
    <SocketContext.Provider
      value={{
        socket,
        isConnected,
        unreadMessagesCount,
        decrementUnreadCount,
        setUnreadMessagesCount,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};
