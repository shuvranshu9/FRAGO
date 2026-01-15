import { useState } from "react";
import LogoImg from "../assets/FRAGO.png";
import { useNavigate } from "react-router-dom";

export default function ForgotPasswordPage() {
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

                {/* Left – Forgot Password Form */}
                <div className="flex items-center justify-center px-8 sm:px-10 py-8 md:py-12">
                    <div className="w-full max-w-md">
                        <ForgotPasswordForm />
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

function ForgotPasswordForm() {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        setLoading(true);

        setTimeout(() => {
            setLoading(false);
            // navigate("/reset-password"); 
        }, 1000);
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-normal md:font-semibold text-gray-900">
                    Forgot Password
                </h1>
                <p className="mt-1 md:mt-2 text-sm text-gray-600">
                    Enter your email address to receive a password reset code
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

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-green-700 hover:bg-green-800 disabled:opacity-60 text-white font-semibold py-3 rounded-xl transition"
                >
                    {loading ? "Sending..." : "Send Reset Code"}
                </button>

                {/* Back to Login */}
                <p className="text-xs text-center text-gray-600">
                    Remember your password?{" "}
                    <span
                        className="text-green-700 font-medium cursor-pointer"
                        onClick={() => navigate("/login")}
                    >
                        Sign In
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
