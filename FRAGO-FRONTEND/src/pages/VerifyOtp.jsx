import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import LogoImg from "../assets/FRAGO.png";

export default function VerifyOTPPage() {
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
            <div className="w-full max-w-4xl bg-white rounded-2xl shadow-xl grid grid-cols-1 md:grid-cols-2 overflow-hidden">

                {/* Mobile Logo */}
                <div className="flex md:hidden justify-center">
                    <img
                        src={LogoImg}
                        alt="FRAGO Logo"
                        className="h-60 object-contain"
                    />
                </div>

                {/* Left – Form */}
                <div className="flex items-center justify-center p-8 md:p-12">
                    <VerifyOTPForm />
                </div>

                {/* Right – Branding */}
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

function VerifyOTPForm() {
    const navigate = useNavigate();
    const location = useLocation();

    const email = location.state?.email;

    const [otp, setOtp] = useState("");
    const [loading, setLoading] = useState(false);

    const handleVerify = async (e) => {
        e.preventDefault();

        if (!email) {
            toast.error("Email not found. Please restart verification.");
            return;
        }

        if (otp.length !== 6) {
            toast.error("Please enter a valid 6-digit OTP");
            return;
        }

        try {
            setLoading(true);

            const res = await axios.post("http://localhost:8000/api/auth/verify-otp", {
                email,
                otp
            });

            toast.success(res.data.message || "OTP verified successfully");

            navigate("/login", {
                state: { email }
            });

        } catch (err) {
            const message =
                err.response?.data?.message ||
                "OTP verification failed";

            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full max-w-md space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-semibold text-gray-900">
                    Verify OTP
                </h1>
                <p className="mt-2 text-sm text-gray-600">
                    Enter the 6-digit code sent to your email
                </p>
            </div>

            {/* Form */}
            <form onSubmit={handleVerify} className="space-y-6">
                <OTPInput otp={otp} setOtp={setOtp} />

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-green-700 hover:bg-green-800 disabled:opacity-60 text-white font-semibold py-3 rounded-xl transition"
                >
                    {loading ? "Verifying..." : "Verify Code"}
                </button>

                <p className="text-xs text-center text-gray-600">
                    Didn’t receive the code?{" "}
                    <span className="text-green-700 font-medium cursor-pointer">
                        Resend
                    </span>
                </p>
            </form>
        </div>
    );
}

function OTPInput({ otp, setOtp }) {
    const length = 6;

    const handleChange = (value, index) => {
        if (!/^\d?$/.test(value)) return;

        const otpArr = otp.split("");
        otpArr[index] = value;
        setOtp(otpArr.join(""));

        if (value && index < length - 1) {
            document.getElementById(`otp-${index + 1}`)?.focus();
        }
    };

    const handleKeyDown = (e, index) => {
        if (e.key === "Backspace" && !otp[index] && index > 0) {
            document.getElementById(`otp-${index - 1}`)?.focus();
        }
    };

    const handlePaste = (e) => {
        e.preventDefault();
        const pasted = e.clipboardData
            .getData("text")
            .replace(/\D/g, "")
            .slice(0, length);

        setOtp(pasted);
    };

    return (
        <div>
            <label className="block text-sm font-medium text-gray-800 mb-2">
                Verification Code
            </label>

            <div
                className="flex gap-3 justify-between"
                onPaste={handlePaste}
            >
                {Array.from({ length }).map((_, index) => (
                    <input
                        key={index}
                        id={`otp-${index}`}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={otp[index] || ""}
                        onChange={(e) => handleChange(e.target.value, index)}
                        onKeyDown={(e) => handleKeyDown(e, index)}
                        className="
                            w-12 h-12 md:w-14 md:h-14
                            text-center text-lg font-semibold
                            border border-gray-300 rounded-xl
                            focus:outline-none focus:ring-2 focus:ring-green-600
                        "
                    />
                ))}
            </div>
        </div>
    );
}
