import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const getAuthToastMessage = (pathname) => {
  if (pathname.startsWith("/wishlist")) {
    return "Please login to use wishlist.";
  }
  if (pathname.startsWith("/cart")) {
    return "Please login to use cart.";
  }
  if (pathname.startsWith("/checkout")) {
    return "Please login to checkout.";
  }
  if (pathname.startsWith("/account/orders")) {
    return "Please login to view your orders.";
  }
  if (pathname.startsWith("/account")) {
    return "Please login to view your account.";
  }
  if (pathname.startsWith("/chat")) {
    return "Please login to use chat.";
  }
  return "Please login to continue.";
};

const ProtectedRoute = ({ allowedRoles }) => {
  const { isAuthenticated, user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-700"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        replace
        state={{
          toastMessage: getAuthToastMessage(location.pathname),
          from: location.pathname,
        }}
      />
    );
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
