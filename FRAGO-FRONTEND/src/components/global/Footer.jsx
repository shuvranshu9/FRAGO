import {
  FaFacebookF,
  FaInstagram,
  FaTwitter,
  FaEnvelope,
  FaMapMarkerAlt,
  FaPhoneAlt,
} from "react-icons/fa";
import { Link } from "react-router-dom";
import { theme } from "../../styles/theme";

const Footer = () => {
  return (
    <footer
      style={{
        color: theme.colors.text.inverse,
        backgroundColor: theme.colors.surfaceDark,
      }}
      className="pt-20 pb-10 bg-white"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ">
        {/* Newsletter Section */}
        <div
          style={{ borderColor: theme.colors.primary }}
          className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center border-b pb-12 mb-12"
        >
          <div>
            <h3
              style={{ fontFamily: theme.fonts.heading }}
              className="text-2xl font-medium mb-2"
            >
              Join our fragrant journey
            </h3>
            <p style={{ color: theme.colors.text.muted }} className="text-sm">
              Subscribe to receive updates, access to exclusive deals, and more.
            </p>
          </div>
          <div className="relative">
            <form className="flex items-center">
              <input
                type="email"
                placeholder="Enter your email address"
                style={{
                  backgroundColor: theme.colors.secondary,
                  borderColor: theme.colors.primaryLight,
                  color: theme.colors.text.inverse,
                }}
                className="w-full border rounded-full py-3 pl-6 pr-32 transition-colors"
              />
              <button
                type="button"
                style={{
                  color: theme.colors.primary,
                  backgroundColor: "#ffffff",
                }}
                className="absolute right-1 rounded-full px-6 py-2.5 font-medium text-sm hover:bg-gray-100 transition-colors"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>

        {/* Links Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          {/* Brand Column */}
          <div className="space-y-6">
            <Link
              to="/"
              style={{ fontFamily: theme.fonts.heading }}
              className="text-2xl font-bold tracking-wide uppercase"
            >
              FRAGO
            </Link>
            <p
              style={{ color: theme.colors.text.muted }}
              className="text-sm leading-relaxed"
            >
              Discover the art of scent with our curated collection of premium
              fragrances. Elevating your senses since 1997.
            </p>
            <div className="flex space-x-4">
              {[FaFacebookF, FaInstagram, FaTwitter].map((Icon, index) => (
                <a
                  key={index}
                  href="#"
                  style={{ backgroundColor: theme.colors.secondary }}
                  className="p-2 rounded-full hover:opacity-80 transition-opacity"
                >
                  <Icon size={18} />
                </a>
              ))}
            </div>
          </div>

          {/* Shop Column */}
          <div>
            <h4
              style={{ fontFamily: theme.fonts.heading }}
              className="text-lg font-medium mb-6"
            >
              Shop
            </h4>
            <ul className="space-y-4">
              {[
                "Perfumes",
                "Best Sellers",
                "New Arrivals",
                "Brands",
                "Gift Sets",
              ].map((item) => (
                <li key={item}>
                  <Link
                    to={`/${item.toLowerCase().replace(" ", "-")}`}
                    style={{ color: theme.colors.text.muted }}
                    className="hover:text-white text-sm transition-colors"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Column */}
          <div>
            <h4
              style={{ fontFamily: theme.fonts.heading }}
              className="text-lg font-medium mb-6"
            >
              Support
            </h4>
            <ul className="space-y-4">
              {[
                "Contact Us",
                "Shipping & Returns",
                "FAQ",
                "Track Order",
                "Terms & Conditions",
              ].map((item) => (
                <li key={item}>
                  <Link
                    to={`/${item.toLowerCase().replace(" & ", "-").replace(" ", "-")}`}
                    style={{ color: theme.colors.text.muted }}
                    className="hover:text-white text-sm transition-colors"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Column */}
          <div>
            <h4
              style={{ fontFamily: theme.fonts.heading }}
              className="text-lg font-medium mb-6"
            >
              Contact Us
            </h4>
            <ul className="space-y-4">
              <li className="flex items-start">
                <FaMapMarkerAlt
                  size={18}
                  style={{ color: theme.colors.primaryLight }}
                  className="mr-3 mt-0.5"
                />
                <span
                  style={{ color: theme.colors.text.muted }}
                  className="text-sm"
                >
                  Nepal
                  <br />
                  Kathmandu, Nepal 75001
                </span>
              </li>
              <li className="flex items-center">
                <FaPhoneAlt
                  size={18}
                  style={{ color: theme.colors.primaryLight }}
                  className="mr-3"
                />
                <span
                  style={{ color: theme.colors.text.muted }}
                  className="text-sm"
                >
                  +977-9812345678
                </span>
              </li>
              <li className="flex items-center">
                <FaEnvelope
                  size={18}
                  style={{ color: theme.colors.primaryLight }}
                  className="mr-3"
                />
                <span
                  style={{ color: theme.colors.text.muted }}
                  className="text-sm"
                >
                  hello@frago.com
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div
          style={{ borderColor: theme.colors.secondary }}
          className="border-t pt-8 flex flex-col md:flex-row justify-between items-center"
        >
          <p
            style={{ color: theme.colors.text.muted }}
            className="text-xs text-center md:text-left"
          >
            &copy; {new Date().getFullYear()} FRAGO. All rights reserved.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link
              to="/privacy"
              style={{ color: theme.colors.text.muted }}
              className="hover:text-white text-xs transition-colors"
            >
              Privacy Policy
            </Link>
            <Link
              to="/accessibility"
              style={{ color: theme.colors.text.muted }}
              className="hover:text-white text-xs transition-colors"
            >
              Accessibility
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
