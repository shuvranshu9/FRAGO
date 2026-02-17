import { Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import LoginPage from "./pages/LoginPage.jsx";
import RegisterPage from "./pages/RegisterPage.jsx";
import ForgotPasswordPage from "./pages/ForgotPasswordPage.jsx";
import ResetPasswordPage from "./pages/ResetPasswordPage.jsx";
import VerifyOTPPage from "./pages/VerifyOtp.jsx";
import MainLayout from "./layout/MainLayout.jsx";
import HomePage from "./pages/HomePage.jsx";
import AboutUsPage from "./pages/AboutUsPage.jsx";
import ContactUsPage from "./pages/ContactUsPage.jsx";
import AccountPage from "./pages/AccountPage.jsx";
import VendorProductsPage from "./pages/VendorProductsPage.jsx";
import VendorProductFormPage from "./pages/VendorProductFormPage.jsx";
import VendorCategoriesPage from "./pages/VendorCategoriesPage.jsx";
import BrandsPage from "./pages/BrandsPage.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import ProtectedRoute from "./components/auth/ProtectedRoute.jsx";
import ScrollToTop from "./components/global/ScrollToTop.jsx";

export default function App() {
  return (
    <AuthProvider>
      <ScrollToTop />
      <Routes>

        {/* Public routes within MainLayout */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/about-us" element={<AboutUsPage />} />
          <Route path="/contact-us" element={<ContactUsPage />} />
          <Route path="/brands" element={<BrandsPage />} />

          {/* Protected routes within MainLayout */}
          <Route element={<ProtectedRoute />}>
            <Route path="/account" element={<AccountPage />} />
            <Route path="/wishlist" element={<div>Wishlist Page</div>} />
            <Route path="/chat" element={<div>Chat Page</div>} />
            <Route path="/cart" element={<div>Cart Page</div>} />
          </Route>

          {/* Vendor Specific Routes */}
          <Route element={<ProtectedRoute allowedRoles={["vendor"]} />}>
            <Route path="/vendor/products" element={<VendorProductsPage />} />
            <Route
              path="/vendor/products/add"
              element={<VendorProductFormPage />}
            />
            <Route
              path="/vendor/products/edit/:id"
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
        draggable
        pauseOnHover
        theme="light"
      />
    </AuthProvider>
  );
}
