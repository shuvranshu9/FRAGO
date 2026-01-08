import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import LogoImg from "../assets/FRAGO.png";
import { useNavigate } from "react-router-dom";

export default function LoginPage() {
    return (
        <div className="min-h-screen w-full bg-gray-50 flex items-center justify-center px-4">
            <div className="w-full max-w-6xl bg-white shadow-xl rounded-2xl overflow-hidden grid grid-cols-1 md:grid-cols-2">

                {/* Mobile Logo */}
                <div className="flex md:hidden justify-center">
                    <img
                        src={LogoImg}
                        alt="FRAGO Logo"
                        className="h-80 object-contain scale-120"
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
                        className="max-w-lg w-full object-contain"
                    />
                </div>
            </div>
        </div>
    );
}

function LoginForm() {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        setLoading(true);
        setTimeout(() => setLoading(false), 1000);
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-normal md:font-semibold text-gray-900">
                    Sign in to FRAGO
                </h1>
                <p className="mt-1 md:mt-2 text-sm text-gray-600">
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
                    placeholder="you@example.com"
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

                {/* Actions */}
                <div className="flex justify-end text-sm">
                    <button
                        type="button"
                        className="text-green-700 hover:text-green-800 font-medium"
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
