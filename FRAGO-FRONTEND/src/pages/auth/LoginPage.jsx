import { useEffect, useRef, useState } from "react";
import { Eye, EyeOff, User, UserCheck, ArrowLeft } from "lucide-react";
import LogoImg from "../../assets/global/FRAGO.png";
import { useLocation, useNavigate, Link } from "react-router-dom";
import api from "../../utils/api";
import { toast } from "react-toastify";
import { useAuth } from "../../context/AuthContext";

export default function LoginPage() {
  return (
    <div className="min-h-screen w-full bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-6xl bg-white shadow-xl rounded-2xl overflow-hidden grid grid-cols-1 md:grid-cols-2">
        {/* Mobile Logo */}
        <div className="flex md:hidden justify-center">
          <img
            src={LogoImg}
            alt="FRAGO Logo"
            className="h-60 object-contain scale-120"
          />
        </div>

        {/* Left – Login Form */}
        <div className="flex items-center justify-center px-8 sm:px-10 py-8 md:py-12">
          <div className="w-full max-w-md">
            <LoginForm />
          </div>
        </div>

        {/* Right – Branding (Desktop only) */}
        <div className="hidden md:flex items-center justify-center bg-gray-100 p-10">
          <img
            src={LogoImg}
            alt="FRAGO Logo"
            className="max-w-md w-full object-contain"
          />
        </div>
      </div>
    </div>
  );
}

function LoginForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const shownRedirectToast = useRef(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("buyer");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const toastMessage = location.state?.toastMessage;

    let suppressToast = false;
    try {
      suppressToast = sessionStorage.getItem("suppressAuthToastOnce") === "1";
    } catch {
      suppressToast = false;
    }

    if (toastMessage && !shownRedirectToast.current && !suppressToast) {
      shownRedirectToast.current = true;
      toast.info(toastMessage);

      // Clear state so it doesn't re-toast on refresh/back
      navigate(location.pathname, { replace: true, state: null });
    } else if (toastMessage && suppressToast) {
      // Clear state even if we're suppressing, so it won't appear later.
      navigate(location.pathname, { replace: true, state: null });
    }
  }, [location.pathname, location.state, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error("Please enter email and password");
      return;
    }

    try {
      setLoading(true);

      // Determine endpoint based on role
      const endpoint =
        role === "buyer" ? "/auth/login/buyer" : "/auth/login/vendor";

      const res = await api.post(endpoint, { email, password });

      // Store token and user info via context
      login(res.data.user, res.data.token);

      toast.success(res.data.message || "Login successful!");

      // Redirect to home page
      navigate("/");
    } catch (err) {
      const status = err.response?.status;

      if (status === 404) {
        toast.error("Email not registered. Please sign up.");
        return;
      }

      const message =
        err.response?.data?.message ||
        "Login failed. Please check your credentials.";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Back to Home */}
      <Link
        to="/"
        className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-green-700 transition group"
      >
        <ArrowLeft
          size={18}
          className="transition-transform group-hover:-translate-x-1"
        />
        Back to Home
      </Link>

      {/* Header */}
      <div>
        <h1 className="text-2xl font-normal md:font-semibold text-gray-900">
          Sign in to FRAGO
        </h1>
        <p className="mt-1 md:mt-2 text-xs md:text-sm text-gray-600">
          Enter your credentials to access your account
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-5">
        <InputField
          label="Email"
          type="email"
          value={email}
          onChange={setEmail}
          placeholder="you@gmail.com"
        />

        {/* Password Field with Toggle */}
        <div>
          <label className="block text-sm font-medium text-gray-800 mb-2">
            Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="
                  w-full px-4 py-3 pr-12
                  border border-gray-300
                  rounded-xl
                  focus:outline-none
                  focus:ring-2
                  focus:ring-green-600
                  transition
              "
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-gray-700"
              aria-label="Toggle password visibility"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>

        <RoleSelector value={role} onChange={setRole} disabled={loading} />

        {/* Actions */}
        <div className="flex justify-end text-sm">
          <button
            type="button"
            className="text-green-700 hover:text-green-800 font-medium"
            onClick={() => navigate("/forgot-password")}
          >
            Forgot password?
          </button>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-green-700 hover:bg-green-800 disabled:opacity-60 text-white font-semibold py-3 rounded-xl transition"
        >
          {loading ? "Signing in..." : "Sign In"}
        </button>

        {/* Signup Footer */}
        <p className="text-xs text-center text-gray-600">
          Don’t have an account?{" "}
          <span
            className="text-green-700 font-medium cursor-pointer"
            onClick={() => navigate("/register")}
          >
            Sign Up
          </span>
        </p>
      </form>
    </div>
  );
}

function InputField({ label, type, value, onChange, placeholder }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-800 mb-2">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required
        className="
            w-full px-4 py-3
            border border-gray-300
            rounded-xl
            focus:outline-none
            focus:ring-2
            focus:ring-green-600
            transition
        "
      />
    </div>
  );
}

function RoleSelector({ value, onChange, disabled }) {
  const roles = [
    {
      id: "buyer",
      label: "Buyer",
      icon: <User size={18} />,
      description: "Shop for perfumes",
    },
    {
      id: "vendor",
      label: "Vendor",
      icon: <UserCheck size={18} />,
      description: "Sell your products",
    },
  ];

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-800">
        Continue as
      </label>
      <div className="grid grid-cols-2 gap-3">
        {roles.map((r) => (
          <button
            key={r.id}
            type="button"
            onClick={() => !disabled && onChange(r.id)}
            disabled={disabled}
            className={`
                            flex flex-col p-3 rounded-xl border-2 transition-all text-left
                            ${
                              value === r.id
                                ? "border-green-700 bg-green-50 text-green-900 ring-4 ring-green-100"
                                : "border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50"
                            }
                            ${disabled ? "opacity-60 cursor-not-allowed" : ""}
                        `}
          >
            <div className="flex items-center gap-2 mb-1">
              <span
                className={value === r.id ? "text-green-700" : "text-gray-400"}
              >
                {r.icon}
              </span>
              <span className="font-semibold text-sm">{r.label}</span>
            </div>
            <span className="text-[10px] leading-tight opacity-70">
              {r.description}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
