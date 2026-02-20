import { useState, useEffect, useRef } from "react";
import {
  Search,
  User,
  Heart,
  ShoppingBag,
  Menu,
  X,
  MessageCircleMore,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import Logo from "../../assets/LOGO.png";
import { useAuth } from "../../context/AuthContext";

const Navbar = () => {
  const { user, isAuthenticated } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const lastScrollY = useRef(0);
  const location = useLocation();

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      document.body.style.position = "fixed";
      document.body.style.width = "100%";
    } else {
      document.body.style.overflow = "unset";
      document.body.style.position = "static";
    }

    return () => {
      document.body.style.overflow = "unset";
      document.body.style.position = "static";
    };
  }, [isOpen]);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY > lastScrollY.current && currentScrollY > 100) {
        setIsVisible(false); // Hide
      } else {
        setIsVisible(true); // Show
      }
      lastScrollY.current = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Helper function to check if link is active
  const isActiveLink = (path) => {
    if (path === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(path);
  };

  // Get active state for specific vendor paths
  const isVendorProductsActive =
    location.pathname.startsWith("/vendor/products");
  const isVendorCategoriesActive =
    location.pathname.startsWith("/vendor/categories");

  return (
    <nav
      className={`fixed top-0 left-0 w-full z-100 bg-white transform duration-300 ${isVisible ? "translate-y-0" : "-translate-y-full"}`}
    >
      {/* Top Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-24">
          {/* Left: Search Bar (Hidden on mobile, visible on lg) */}
          <div className="hidden lg:flex flex-1 items-center justify-start">
            <div className="relative w-full max-w-sm">
              <input
                type="text"
                placeholder="Hey, what are you looking for?"
                className="w-full bg-gray-50 border border-gray-200 rounded-full py-2.5 pl-5 pr-12 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:border-gray-400 focus:ring-0 transition-all"
              />
              <button className="absolute right-0 top-1/2 -translate-y-1/2 mr-3 p-1.5 text-gray-500 hover:text-gray-800 rounded-full hover:bg-gray-100 transition-colors">
                <Search size={20} />
              </button>
            </div>
          </div>

          {/* Mobile Menu Button (Visible on mobile) */}
          <div className="flex items-center lg:hidden flex-1">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-700 hover:text-black focus:outline-none p-2"
              aria-label="Toggle menu"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          {/* Center: Logo */}
          <div className="shrink-0 flex flex-col items-center justify-center mx-4">
            <Link to="/" className="flex flex-col items-center group">
              <div className="flex items-center">
                <img
                  src={Logo}
                  alt="FRAGO"
                  className="h-14 w-auto object-contain"
                />
                <span className="text-2xl md:text-3xl font-serif font-medium text-green-900 tracking-tight group-hover:opacity-90 transition-opacity">
                  FRAGO
                  <span className="text-sm text-gray-500 ml-0.5 align-top">
                    .com
                  </span>
                </span>
              </div>
              <span className="text-[8px] md:text-[10px] text-gray-400 tracking-[0.2em] font-medium mt-1 uppercase">
                Trusted Online Since 2025
              </span>
            </Link>
          </div>

          {/* Right: Icons */}
          <div className="flex-1 flex items-center justify-end space-x-6">
            {/* Mobile Search Icon */}
            <button className="lg:hidden p-2 text-gray-600 hover:text-black">
              <Search size={22} />
            </button>

            <Link
              to="/account"
              className={`hidden lg:flex items-center transition-colors group ${
                isActiveLink("/account")
                  ? "text-green-900"
                  : "text-gray-600 hover:text-green-900"
              }`}
            >
              <User
                size={22}
                className="mr-2 group-hover:scale-105 transition-transform"
              />
              <span className="font-medium text-sm">My Account</span>
            </Link>
            <Link
              to="/wishlist"
              className={`hidden lg:flex items-center transition-colors group ${
                isActiveLink("/wishlist")
                  ? "text-green-900"
                  : "text-gray-600 hover:text-green-900"
              }`}
            >
              <Heart
                size={22}
                className="mr-2 group-hover:scale-105 transition-transform"
              />
            </Link>
            <Link
              to="/cart"
              className={`flex items-center transition-colors group relative ${
                isActiveLink("/cart")
                  ? "text-green-900"
                  : "text-gray-600 hover:text-green-900"
              }`}
            >
              <ShoppingBag
                size={22}
                className="mr-2 group-hover:scale-105 transition-transform"
              />
            </Link>
            <Link
              to="/chat"
              className={`flex items-center transition-colors group relative ${
                isActiveLink("/chat")
                  ? "text-green-900"
                  : "text-gray-600 hover:text-green-900"
              }`}
            >
              <MessageCircleMore
                size={22}
                className="mr-2 group-hover:scale-105 transition-transform"
              />
            </Link>
          </div>
        </div>
      </div>

      {/* Bottom Bar: Navigation Links (Desktop) */}
      <div className="hidden lg:block border-t border-gray-100 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center space-x-10 py-4">
            {["Perfumes", "Brands", "About-Us", "Contact-Us"].map((item) => {
              const path = `/${item.toLowerCase()}`;
              const isActive = isActiveLink(path);

              return (
                <Link
                  key={item}
                  to={path}
                  className={`uppercase text-[10px] md:text-[12px] font-semibold tracking-widest transition-colors relative after:content-[''] after:absolute after:bottom-0 after:left-0 after:h-0.5 after:bg-green-900 after:transition-all ${
                    isActive
                      ? "text-green-900 after:w-full"
                      : "text-gray-500 hover:text-green-900 after:w-0 hover:after:w-full"
                  }`}
                >
                  {item.replace("-", " ")}
                </Link>
              );
            })}

            {isAuthenticated && user?.role === "vendor" && (
              <Link
                to="/vendor/products"
                className={`uppercase text-[13px] font-semibold tracking-widest transition-colors relative after:content-[''] after:absolute after:bottom-0 after:left-0 after:h-0.5 after:bg-green-900 after:transition-all ${
                  isVendorProductsActive
                    ? "text-green-900 after:w-full"
                    : "text-gray-500 hover:text-green-900 after:w-0 hover:after:w-full"
                }`}
              >
                Your Listings
              </Link>
            )}

            {isAuthenticated && user?.role === "vendor" && (
              <Link
                to="/vendor/categories"
                className={`uppercase text-[13px] font-semibold tracking-widest transition-colors relative after:content-[''] after:absolute after:bottom-0 after:left-0 after:h-0.5 after:bg-green-900 after:transition-all ${
                  isVendorCategoriesActive
                    ? "text-green-900 after:w-full"
                    : "text-gray-500 hover:text-green-900 after:w-0 hover:after:w-full"
                }`}
              >
                Categories
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Menu (Drawer) */}
      <div
        className={`lg:hidden fixed inset-0 z-110 transition-opacity duration-300 ${isOpen ? "opacity-100 visible" : "opacity-0 invisible pointer-events-none"}`}
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/60 backdrop-blur-[2px]"
          onClick={() => setIsOpen(false)}
        />

        {/* Drawer */}
        <div
          className={`absolute top-0 left-0 w-[80%] max-w-sm h-full bg-white shadow-2xl transform transition-transform duration-300 ease-in-out ${isOpen ? "translate-x-0" : "-translate-x-full"}`}
          style={{ backgroundColor: "#ffffff" }}
        >
          <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-white">
            <span className="text-2xl font-serif font-bold text-green-900">
              Menu
            </span>
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 text-gray-500 hover:text-black rounded-full hover:bg-gray-100 transition-colors"
              aria-label="Close menu"
            >
              <X size={24} />
            </button>
          </div>

          <div className="p-6 space-y-8 overflow-y-auto h-[calc(100vh-80px)] bg-white">
            {/* Mobile Search */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search products..."
                className="w-full bg-gray-50 border border-gray-200 rounded-lg py-3.5 pl-4 pr-10 text-sm focus:outline-none focus:border-green-300 transition-colors"
              />
              <Search
                size={18}
                className="absolute right-3 top-4 text-gray-400"
              />
            </div>

            {/* Navigation Links */}
            <div className="space-y-2">
              <p className="text-[10px] uppercase tracking-[0.2em] text-gray-400 font-bold mb-4 px-3">
                Categories
              </p>
              {["Perfumes", "Brands", "About-Us", "Contact-Us"].map((item) => {
                const path = `/${item.toLowerCase()}`;
                const isActive = isActiveLink(path);

                return (
                  <Link
                    key={item}
                    to={path}
                    className={`block px-3 py-3.5 text-base font-medium rounded-lg transition-colors border-b border-gray-50 last:border-0 ${
                      isActive
                        ? "text-green-900 bg-green-50"
                        : "text-gray-700 hover:text-green-900 hover:bg-green-50"
                    }`}
                    onClick={() => setIsOpen(false)}
                  >
                    {item.replace("-", " ")}
                    {isActive && (
                      <span className="ml-2 text-green-600 text-xs">•</span>
                    )}
                  </Link>
                );
              })}

              {isAuthenticated && user?.role === "vendor" && (
                <Link
                  to="/vendor/products"
                  className={`block px-3 py-3.5 text-base font-medium rounded-lg transition-colors border-b border-gray-50 last:border-0 ${
                    isVendorProductsActive
                      ? "text-green-900 bg-green-50"
                      : "text-gray-700 hover:text-green-900 hover:bg-green-50"
                  }`}
                  onClick={() => setIsOpen(false)}
                >
                  Your Listings
                  {isVendorProductsActive && (
                    <span className="ml-2 text-green-600 text-xs">•</span>
                  )}
                </Link>
              )}

              {isAuthenticated && user?.role === "vendor" && (
                <Link
                  to="/vendor/categories"
                  className={`block px-3 py-3.5 text-base font-medium rounded-lg transition-colors border-b border-gray-50 last:border-0 ${
                    isVendorCategoriesActive
                      ? "text-green-900 bg-green-50"
                      : "text-gray-700 hover:text-green-900 hover:bg-green-50"
                  }`}
                  onClick={() => setIsOpen(false)}
                >
                  Manage Categories
                  {isVendorCategoriesActive && (
                    <span className="ml-2 text-green-600 text-xs">•</span>
                  )}
                </Link>
              )}
            </div>

            {/* Account Links */}
            <div className="pt-6 border-t border-gray-100 space-y-2">
              <p className="text-[10px] uppercase tracking-[0.2em] text-gray-400 font-bold mb-4 px-3">
                Settings
              </p>
              <Link
                to="/account"
                onClick={() => setIsOpen(false)}
                className={`flex items-center px-3 py-3 rounded-lg transition-colors ${
                  isActiveLink("/account")
                    ? "text-green-900 bg-green-50"
                    : "text-gray-700 hover:text-green-900 hover:bg-green-50"
                }`}
              >
                <User
                  size={20}
                  className={`mr-3 ${isActiveLink("/account") ? "text-green-500" : "text-gray-400"}`}
                />
                <span className="font-medium">My Account</span>
                {isActiveLink("/account") && (
                  <span className="ml-auto text-green-600 text-xs">Active</span>
                )}
              </Link>
              <Link
                to="/wishlist"
                onClick={() => setIsOpen(false)}
                className={`flex items-center px-3 py-3 rounded-lg transition-colors ${
                  isActiveLink("/wishlist")
                    ? "text-green-900 bg-green-50"
                    : "text-gray-700 hover:text-green-900 hover:bg-green-50"
                }`}
              >
                <Heart
                  size={20}
                  className={`mr-3 ${isActiveLink("/wishlist") ? "text-green-500" : "text-gray-400"}`}
                />
                <span className="font-medium">Wishlist</span>
                {isActiveLink("/wishlist") && (
                  <span className="ml-auto text-green-600 text-xs">Active</span>
                )}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
