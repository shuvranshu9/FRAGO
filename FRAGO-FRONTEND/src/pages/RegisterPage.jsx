import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import LogoImg from "../assets/FRAGO.png";
import { useNavigate } from "react-router-dom";
import { toast } from 'react-toastify';

import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000/api/auth',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

export default function RegisterPage() {
  return (
    <div className="min-h-screen w-full bg-gray-50 flex items-center justify-center overflow-hidden px-4">
      <div className="w-full max-w-6xl h-[92vh] bg-white shadow-lg rounded-2xl overflow-hidden grid grid-cols-1 md:grid-cols-2">
        {/* Left – Register Form */}
        <div className="flex items-center justify-center px-6 sm:px-8 py-6">
          <div className="w-full max-w-md">
            <RegisterForm />
          </div>
        </div>

        {/* Right – Branding */}
        <div className="hidden md:flex items-center justify-center bg-gray-100 p-8">
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

function RegisterForm() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    address: "",
    password: "",
    confirm_password: "",
    role: "buyer"
  });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [loading, setLoading] = useState(false);

  // Field-specific validation rules
  const validateField = (name, value) => {
    let error = "";

    switch (name) {
      case "full_name":
        if (!value.trim()) error = "Full name is required";
        else if (value.trim().length < 2) error = "Full name must be at least 2 characters";
        break;

      case "email":
        if (!value.trim()) error = "Email is required";
        else if (!/\S+@\S+\.\S+/.test(value)) error = "Please enter a valid email address";
        break;

      case "phone":
        if (!value.trim()) error = "Phone number is required";
        else if (!/^[+]?[1-9][\d]{0,15}$/.test(value.replace(/\D/g, ""))) error = "Please enter a valid phone number";
        else if (value.replace(/\D/g, "").length < 10) error = "Phone number must be at least 10 digits";
        break;

      case "address":
        if (!value.trim()) error = "Address is required";
        else if (value.trim().length < 5) error = "Please enter a complete address";
        break;

      case "password":
        if (!value) error = "Password is required";
        else if (value.length < 6) error = "Password must be at least 6 characters";
        else if (!/(?=.*[a-z])/.test(value)) error = "Password must contain at least one lowercase letter";
        else if (!/(?=.*[A-Z])/.test(value)) error = "Password must contain at least one uppercase letter";
        else if (!/(?=.*\d)/.test(value)) error = "Password must contain at least one number";
        else if (!/(?=.*[@$!%*?&])/.test(value)) error = "Password must contain at least one special character (@$!%*?&)";
        break;

      case "confirm_password":
        if (!value) error = "Please confirm your password";
        else if (value !== form.password) error = "Passwords do not match";
        break;

      default:
        break;
    }

    return error;
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched({ ...touched, [name]: true });

    const error = validateField(name, value);
    setErrors({ ...errors, [name]: error });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });

    // Real-time validation for touched fields
    if (touched[name]) {
      const error = validateField(name, value);
      setErrors({ ...errors, [name]: error });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    let isValid = true;

    Object.keys(form).forEach((key) => {
      if (key !== "role") {
        const error = validateField(key, form[key]);
        if (error) {
          newErrors[key] = error;
          isValid = false;
        }
      }
    });

    setErrors(newErrors);
    setTouched(
      Object.keys(form).reduce((acc, key) => {
        acc[key] = true;
        return acc;
      }, {})
    );

    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fix the errors in the form", {
        position: "top-right",
        autoClose: 3000,
      });
      return;
    }

    setLoading(true);

    try {
      // Prepare data for backend
      const userData = {
        full_name: form.full_name.trim(),
        email: form.email.trim().toLowerCase(),
        phone: form.phone.trim(),
        address: form.address.trim(),
        password: form.password,
      };

      // Determine which endpoint to use based on role
      const endpoint = form.role === "buyer" ? "/signup/buyer" : "/signup/vendor";

      // Send to backend using axios
      const response = await api.post(endpoint, userData);

      // Success
      toast.success(`Registration successful! Welcome ${form.role}! Redirecting to Verify OTP Page...`, {
        position: "top-right",
        autoClose: 3000,
      });

      // Store token if provided
      if (response.data.token) {
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("user", JSON.stringify(response.data.user));
      }

      // Redirect after 3 seconds
      setTimeout(() => {
        navigate("/verify-otp", {
          state: { email: form.email.trim().toLowerCase() }
        });
      }, 3000);


    } catch (err) {
      console.error("Registration error:", err);

      // Handle different types of errors
      if (axios.isAxiosError(err)) {
        if (err.response) {
          // Server responded with error status
          const errorMessage = err.response.data?.message || "Registration failed";

          // Check for specific error types
          if (err.response.status === 409) {
            if (errorMessage.toLowerCase().includes("email")) {
              toast.error("Email already registered. Please use a different email.", {
                position: "top-right",
                autoClose: 5000,
              });
            } else if (errorMessage.toLowerCase().includes("phone")) {
              toast.error("Phone number already registered.", {
                position: "top-right",
                autoClose: 5000,
              });
            } else {
              toast.error(errorMessage, {
                position: "top-right",
                autoClose: 5000,
              });
            }
          } else if (err.response.status === 400) {
            toast.error("Invalid data. Please check your information.", {
              position: "top-right",
              autoClose: 5000,
            });
          } else if (err.response.status === 500) {
            toast.error("Server error. Please try again later.", {
              position: "top-right",
              autoClose: 5000,
            });
          } else {
            toast.error(errorMessage, {
              position: "top-right",
              autoClose: 5000,
            });
          }
        } else if (err.request) {
          // Request made but no response
          toast.error("Network error. Please check your connection.", {
            position: "top-right",
            autoClose: 5000,
          });
        } else {
          // Other errors
          toast.error("An unexpected error occurred. Please try again.", {
            position: "top-right",
            autoClose: 5000,
          });
        }
      } else {
        // Non-axios error
        toast.error("Registration failed. Please try again.", {
          position: "top-right",
          autoClose: 5000,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  // Helper function to get input props
  const getInputProps = (name) => ({
    label: name.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
    name: name,
    value: form[name],
    onChange: handleChange,
    onBlur: handleBlur,
    disabled: loading,
    error: errors[name],
    touched: touched[name]
  });

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-xl md:text-2xl font-semibold text-gray-900">
          Create Account
        </h1>
        <p className="hidden md:block md:text-sm text-gray-600">
          Register as Buyer or Vendor
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input {...getInputProps("full_name")} />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input {...getInputProps("email")} type="email" />
          <Input {...getInputProps("phone")} />
        </div>

        <Input {...getInputProps("address")} />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input {...getInputProps("password")} type="password" />
          <Input {...getInputProps("confirm_password")} type="password" />
        </div>

        <RoleSelector
          value={form.role}
          onChange={(role) => setForm({ ...form, role })}
          disabled={loading}
        />

        <button
          type="submit"
          disabled={loading}
          className={`
            w-full bg-green-700 hover:bg-green-800 text-white font-medium py-3 rounded-xl transition
            ${loading ? "opacity-70 cursor-not-allowed" : ""}
            disabled:opacity-50 disabled:cursor-not-allowed
          `}
        >
          {loading ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Creating {form.role === "buyer" ? "Buyer" : "Vendor"} Account...
            </span>
          ) : `Create ${form.role === "buyer" ? "Buyer" : "Vendor"} Account`}
        </button>
      </form>

      {/* Footer */}
      <p className="text-xs text-center text-gray-600">
        Already have an account?{" "}
        <span
          className="text-green-700 font-medium cursor-pointer hover:underline"
          onClick={() => !loading && navigate("/login")}
        >
          Sign in
        </span>
      </p>
    </div>
  );
}

function Input({
  label,
  type = "text",
  name,
  value,
  onChange,
  onBlur,
  disabled,
  error,
  touched
}) {
  const [show, setShow] = useState(false);
  const isPassword = type === "password";

  // Determine if we should show error
  const showError = touched && error;

  return (
    <div>
      <label className="block text-xs font-medium text-gray-700 mb-1">
        {label} {!error && <span className="text-red-500">*</span>}
      </label>
      <div className="relative">
        <input
          type={isPassword && show ? "text" : type}
          name={name}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          required
          disabled={disabled}
          className={`
            w-full px-3 py-2.5 pr-10
            border ${showError ? "border-red-500" : "border-gray-300"}
            rounded-lg
            focus:outline-none
            focus:ring-2
            ${showError ? "focus:ring-red-500" : "focus:ring-green-600"}
            text-sm
            transition-colors
            ${disabled ? "bg-gray-100 cursor-not-allowed" : ""}
            placeholder-gray-400
          `}
          placeholder={`Enter your ${label.toLowerCase()}`}
        />

        {isPassword && (
          <button
            type="button"
            onClick={() => !disabled && setShow(!show)}
            className={`
              absolute inset-y-0 right-3 flex items-center 
              ${disabled ? "text-gray-300 cursor-not-allowed" : "text-gray-500 hover:text-gray-700"}
            `}
            tabIndex={-1}
            disabled={disabled}
          >
            {show ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        )}
      </div>

      {/* Error message */}
      {showError && (
        <p className="mt-1 text-xs text-red-600 flex items-center">
          <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </p>
      )}

      {/* Password strength indicator */}
      {name === "password" && value && !error && (
        <div className="mt-1">
          <div className="flex items-center space-x-1">
            {[1, 2, 3, 4].map((i) => {
              let color = "bg-gray-200";
              if (value.length >= 6) {
                if (i === 1) color = "bg-red-500";
                if (i === 2 && /(?=.*[a-z])/.test(value) && /(?=.*[A-Z])/.test(value)) color = "bg-orange-500";
                if (i === 3 && /(?=.*\d)/.test(value)) color = "bg-yellow-500";
                if (i === 4 && /(?=.*[@$!%*?&])/.test(value)) color = "bg-green-500";
              }
              return (
                <div
                  key={i}
                  className={`h-1 flex-1 rounded-full ${color} transition-colors`}
                />
              );
            })}
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {value.length < 6 && "Too short"}
            {value.length >= 6 && !/(?=.*[a-z])/.test(value) && "Add lowercase"}
            {value.length >= 6 && /(?=.*[a-z])/.test(value) && !/(?=.*[A-Z])/.test(value) && "Add uppercase"}
            {value.length >= 6 && /(?=.*[a-z])/.test(value) && /(?=.*[A-Z])/.test(value) && !/(?=.*\d)/.test(value) && "Add number"}
            {value.length >= 6 && /(?=.*[a-z])/.test(value) && /(?=.*[A-Z])/.test(value) && /(?=.*\d)/.test(value) && !/(?=.*[@$!%*?&])/.test(value) && "Add special character"}
            {value.length >= 6 && /(?=.*[a-z])/.test(value) && /(?=.*[A-Z])/.test(value) && /(?=.*\d)/.test(value) && /(?=.*[@$!%*?&])/.test(value) && "Strong password ✓"}
          </p>
        </div>
      )}
    </div>
  );
}

function RoleSelector({ value, onChange, disabled }) {
  const roles = [
    { id: "buyer", label: "Buyer", description: "Browse and purchase products" },
    { id: "vendor", label: "Vendor", description: "Sell your products" }
  ];

  return (
    <div>
      <label className="block text-xs font-medium text-gray-700 mb-2">
        Account Type <span className="text-red-500">*</span>
      </label>
      <div className="grid grid-cols-2 gap-3">
        {roles.map((role) => (
          <button
            key={role.id}
            type="button"
            onClick={() => !disabled && onChange(role.id)}
            disabled={disabled}
            className={`
              p-3 rounded-lg text-left border transition-all
              ${value === role.id
                ? "border-green-700 bg-green-50 text-green-700 ring-2 ring-green-200"
                : "border-gray-300 text-gray-700 hover:border-gray-400 hover:bg-gray-50"
              }
              ${disabled ? "opacity-60 cursor-not-allowed" : ""}
            `}
          >
            <div className="font-medium text-sm">{role.label}</div>
            <div className="text-xs text-gray-500 mt-1">{role.description}</div>
          </button>
        ))}
      </div>
    </div>
  );
}