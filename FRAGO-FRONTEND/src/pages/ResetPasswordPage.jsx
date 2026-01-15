import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import LogoImg from "../assets/FRAGO.png";
import { useNavigate } from "react-router-dom";

export default function ResetPasswordPage() {
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

                {/* Left – Reset Password Form */}
                <div className="flex items-center justify-center px-8 sm:px-10 py-8 md:py-12">
                    <div className="w-full max-w-md">
                        <ResetPasswordForm />
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

function ResetPasswordForm() {
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [code, setCode] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();

        if (newPassword !== confirmPassword) {
            alert("Passwords do not match");
            return;
        }

        setLoading(true);

        const payload = {
            email,
            code,
            new_password: newPassword,
            confirm_password: confirmPassword,
        };

        console.log("Reset payload:", payload);

        setTimeout(() => {
            setLoading(false);
            navigate("/login");
        }, 1000);
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-normal md:font-semibold text-gray-900">
                    Reset Password
                </h1>
                <p className="mt-1 md:mt-2 text-sm text-gray-600">
                    Enter the verification code and your new password
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

                <OTPInput code={code} setCode={setCode} />

                <PasswordField
                    label="New Password"
                    value={newPassword}
                    onChange={setNewPassword}
                    show={showNewPassword}
                    toggleShow={() => setShowNewPassword((p) => !p)}
                />

                <PasswordField
                    label="Confirm Password"
                    value={confirmPassword}
                    onChange={setConfirmPassword}
                    show={showConfirmPassword}
                    toggleShow={() => setShowConfirmPassword((p) => !p)}
                />

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-green-700 hover:bg-green-800 disabled:opacity-60 text-white font-semibold py-3 rounded-xl transition"
                >
                    {loading ? "Resetting..." : "Reset Password"}
                </button>

                <p className="text-xs text-center text-gray-600">
                    Back to{" "}
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

function OTPInput({ code, setCode }) {
    const digits = 6;

    const handleChange = (value, index) => {
        if (!/^\d?$/.test(value)) return;

        const codeArray = code.split("");
        codeArray[index] = value;
        const newCode = codeArray.join("");
        setCode(newCode);

        if (value && index < digits - 1) {
            document.getElementById(`otp-${index + 1}`).focus();
        }
    };

    const handleKeyDown = (e, index) => {
        if (e.key === "Backspace" && !code[index] && index > 0) {
            document.getElementById(`otp-${index - 1}`).focus();
        }
    };

    const handlePaste = (e) => {
        e.preventDefault();
        const pasted = e.clipboardData
            .getData("text")
            .replace(/\D/g, "")
            .slice(0, digits);
        setCode(pasted);
    };

    return (
        <div>
            <label className="block text-sm font-medium text-gray-800 mb-2">
                Verification Code
            </label>

            <div className="flex gap-2 md:gap-4" onPaste={handlePaste}>
                {Array.from({ length: digits }).map((_, index) => (
                    <input
                        key={index}
                        id={`otp-${index}`}
                        type="text"
                        inputMode="numeric"
                        maxLength="1"
                        value={code[index] || ""}
                        onChange={(e) => handleChange(e.target.value, index)}
                        onKeyDown={(e) => handleKeyDown(e, index)}
                        className="
                            w-12 h-12 text-center text-lg font-medium
                            border border-gray-300 rounded-xl
                            focus:outline-none focus:ring-2 focus:ring-green-600
                        "
                    />
                ))}
            </div>
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

function PasswordField({ label, value, onChange, show, toggleShow }) {
    return (
        <div>
            <label className="block text-sm font-medium text-gray-800 mb-2">
                {label}
            </label>
            <div className="relative">
                <input
                    type={show ? "text" : "password"}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
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
                    onClick={toggleShow}
                    className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-gray-700"
                >
                    {show ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
            </div>
        </div>
    );
}
