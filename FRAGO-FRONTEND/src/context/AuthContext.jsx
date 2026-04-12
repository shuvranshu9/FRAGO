/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const decodeToken = (token) => {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map(function (c) {
          return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join(""),
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
};

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  });

  const [token, setToken] = useState(() => {
    return localStorage.getItem("token") || null;
  });

  const navigate = useNavigate();

  const login = (userData, tokenData) => {
    setUser(userData);
    setToken(tokenData);
    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("token", tokenData);
  };

  const logout = useCallback(() => {
    // Prevent redundant ProtectedRoute redirect toast right after logout
    try {
      sessionStorage.setItem("suppressAuthToastOnce", "1");
      window.setTimeout(() => {
        try {
          sessionStorage.removeItem("suppressAuthToastOnce");
        } catch {
          // ignore
        }
      }, 3000);
    } catch {
      // ignore
    }

    setUser(null);
    setToken(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
  }, []);

  useEffect(() => {
    let isExpiredHandled = false;

    const handleSessionExpired = () => {
      if (isExpiredHandled) return;
      isExpiredHandled = true;

      logout();
      toast.error("Session Expired please log in");
      navigate("/login");
    };

    window.addEventListener("sessionExpired", handleSessionExpired);

    return () => {
      window.removeEventListener("sessionExpired", handleSessionExpired);
    };
  }, [logout, navigate]);

  // Handle automatic timeout when the token expires
  useEffect(() => {
    if (token) {
      const decoded = decodeToken(token);
      if (decoded && decoded.exp) {
        const currentTime = Date.now() / 1000;
        const timeRemaining = decoded.exp - currentTime;

        if (timeRemaining <= 0) {
          // Token is already expired
          window.dispatchEvent(new CustomEvent("sessionExpired"));
        } else {
          // Set a timeout to log the user out exactly when the token expires
          const timer = setTimeout(() => {
            window.dispatchEvent(new CustomEvent("sessionExpired"));
          }, timeRemaining * 1000);

          return () => clearTimeout(timer); // Cleanup if token changes or unmounts
        }
      }
    }
  }, [token]);

  const updateUserContext = (updatedData) => {
    const newUser = { ...user, ...updatedData };
    setUser(newUser);
    localStorage.setItem("user", JSON.stringify(newUser));
  };

  const value = {
    user,
    token,
    login,
    logout,
    updateUserContext,
    isAuthenticated: !!token,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
};
