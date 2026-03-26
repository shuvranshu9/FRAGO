import { Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { WishlistProvider } from "./context/WishlistContext.jsx";
import { CartProvider } from "./context/CartContext.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import { SocketProvider } from "./context/SocketContext.jsx";
import MainLayout from "./layout/MainLayout.jsx";
import ProtectedRoute from "./components/auth/ProtectedRoute.jsx";
import LoginPage from "./pages/auth/LoginPage.jsx";
import RegisterPage from "./pages/auth/RegisterPage.jsx";
import ForgotPasswordPage from "./pages/auth/ForgotPasswordPage.jsx";
import ResetPasswordPage from "./pages/auth/ResetPasswordPage.jsx";
import VerifyOTPPage from "./pages/auth/VerifyOTPPage.jsx";
import ScrollToTop from "./components/global/ScrollToTop.jsx";
import BrandsPage from "./pages/global/BrandsPage.jsx";
import HomePage from "./pages/global/HomePage.jsx";
import AboutUsPage from "./pages/global/AboutUsPage.jsx";
import ContactUsPage from "./pages/global/ContactUsPage.jsx";
import AccountPage from "./pages/global/AccountPage.jsx";
import WishlistPage from "./pages/bookmark/WishlistPage.jsx";
import ProductDetailsPage from "./pages/perfume/ProductDetailsPage.jsx";
import PerfumesPage from "./pages/perfume/PerfumesPage.jsx";
import VendorProductsPage from "./pages/vendor/VendorProductsPage.jsx";
import VendorProductFormPage from "./pages/vendor/VendorProductFormPage.jsx";
import VendorCategoriesPage from "./pages/vendor/VendorCategoriesPage.jsx";
import VendorDashboardPage from "./pages/vendor/VendorDashboardPage.jsx";
import CheckoutPage from "./pages/cart/CheckoutPage.jsx";
import CartPage from "./pages/cart/CartPage.jsx";
import OrderSuccessPage from "./pages/order/OrderSuccessPage.jsx";
import OrdersPage from "./pages/order/OrdersPage.jsx";
import ChatPage from "./pages/chat/chatPage.jsx";

export default function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <CartProvider>
          <WishlistProvider>
            <ScrollToTop />
            <Routes>
              {/* ... routes ... */}
              <Route element={<MainLayout />}>
                <Route path="/" element={<HomePage />} />
                <Route path="/about-us" element={<AboutUsPage />} />
                <Route path="/contact-us" element={<ContactUsPage />} />
                <Route path="/brands" element={<BrandsPage />} />
                <Route path="/perfumes" element={<PerfumesPage />} />
                <Route path="/product/:slug" element={<ProductDetailsPage />} />

                {/* Protected routes within MainLayout */}
                <Route element={<ProtectedRoute />}>
                  <Route path="/account" element={<AccountPage />} />
                  <Route path="/account/orders" element={<OrdersPage />} />
                  <Route path="/wishlist" element={<WishlistPage />} />
                  <Route path="/chat" element={<ChatPage />} />
                  <Route path="/cart" element={<CartPage />} />
                  <Route path="/checkout" element={<CheckoutPage />} />
                  <Route
                    path="/order-success/:orderId"
                    element={<OrderSuccessPage />}
                  />
                </Route>

                {/* Vendor Specific Routes */}
                <Route element={<ProtectedRoute allowedRoles={["vendor"]} />}>
                  <Route
                    path="/vendor/dashboard"
                    element={<VendorDashboardPage />}
                  />
                  <Route
                    path="/vendor/products"
                    element={<VendorProductsPage />}
                  />
                  <Route
                    path="/vendor/products/add"
                    element={<VendorProductFormPage />}
                  />
                  <Route
                    path="/vendor/products/edit/:slug"
                    element={<VendorProductFormPage />}
                  />
                  <Route
                    path="/vendor/categories"
                    element={<VendorCategoriesPage />}
                  />
                </Route>
              </Route>

              {/* Auth routes */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />
              <Route path="/verify-otp" element={<VerifyOTPPage />} />

              {/* 404 */}
              <Route
                path="*"
                element={
                  <div className="min-h-screen flex items-center justify-center text-gray-600">
                    Page not found
                  </div>
                }
              />
            </Routes>
          </WishlistProvider>
        </CartProvider>

        {/* Toast notifications */}
        <ToastContainer
          position="top-right"
          hideProgressBar={false}
          autoClose={2000}
          limit={1}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          pauseOnHover
          theme="light"
        />
      </SocketProvider>
    </AuthProvider>
  );
}
