import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import LogoImg from "../assets/FRAGO.png";
import { useNavigate } from "react-router-dom";

export default function RegisterPage() {
    return (
        <div className="min-h-screen w-full bg-gray-50 flex items-center justify-center overflow-hidden px-4">
            <div className="w-full max-w-6xl h-[92vh] bg-white shadow-lg rounded-2xl overflow-hidden grid grid-cols-1 md:grid-cols-2">

                {/* Mobile Logo */}
                <div className="flex md:hidden justify-center pt-8">
                    <img
                        src={LogoImg}
                        alt="FRAGO Logo"
                        className="h-16 object-contain scale-300"
                    />
                </div>

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

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // frontend-only placeholder
    };

    return (
        <div className="space-y-5">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-semibold text-gray-900">
                    Create Account
                </h1>
                <p className="text-sm text-gray-600">
                    Register as Buyer or Vendor
                </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-3">

                <Input
                    label="Full Name"
                    name="full_name"
                    value={form.full_name}
                    onChange={handleChange}
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Input
                        label="Email"
                        type="email"
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                    />
                    <Input
                        label="Phone"
                        name="phone"
                        value={form.phone}
                        onChange={handleChange}
                    />
                </div>

                <Input
                    label="Address"
                    name="address"
                    value={form.address}
                    onChange={handleChange}
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Input
                        label="Password"
                        type="password"
                        name="password"
                        value={form.password}
                        onChange={handleChange}
                    />
                    <Input
                        label="Confirm Password"
                        type="password"
                        name="confirm_password"
                        value={form.confirm_password}
                        onChange={handleChange}
                    />
                </div>

                <RoleSelector
                    value={form.role}
                    onChange={(role) =>
                        setForm({ ...form, role })
                    }
                />

                <button
                    type="submit"
                    className="w-full bg-green-700 hover:bg-green-800 text-white font-medium py-2.5 rounded-xl transition"
                >
                    Create Account
                </button>
            </form>

            {/* Footer */}
            <p className="text-xs text-center text-gray-600">
                Already have an account?{" "}
                <span
                    className="text-green-700 font-medium cursor-pointer"
                    onClick={() => navigate("/login")} 
                >
                    Sign in
                </span>
            </p>
        </div>
    );
}

function Input({ label, type = "text", name, value, onChange }) {
    const [show, setShow] = useState(false);
    const isPassword = type === "password";
    return (
        <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
                {label}
            </label>
            <div className="relative">
                <input
                    type={isPassword && show ? "text" : type}
                    name={name}
                    value={value}
                    onChange={onChange}
                    required
                    className="
                        w-full px-3 py-2 pr-10
                        border border-gray-300
                        rounded-lg
                        focus:outline-none
                        focus:ring-2
                        focus:ring-green-600
                        text-sm
                    "
                />

                {isPassword && (
                    <button
                        type="button"
                        onClick={() => setShow(!show)}
                        className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-gray-700"
                        tabIndex={-1}
                    >
                        {show ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                )}
            </div>

        </div>
    );
}

function Textarea({ label, name, value, onChange }) {
    return (
        <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
                {label}
            </label>
            <textarea
                name={name}
                value={value}
                onChange={onChange}
                rows={2}
                required
                className="
                    w-full px-3 py-2
                    border border-gray-300
                    rounded-lg
                    resize-none
                    focus:outline-none
                    focus:ring-2
                    focus:ring-green-600
                    text-sm
                "
            />
        </div>
    );
}

function RoleSelector({ value, onChange }) {
    return (
        <div>
            <label className="block text-xs font-medium text-gray-700 mb-2">
                Account Type
            </label>
            <div className="grid grid-cols-2 gap-3">
                {["buyer", "vendor"].map((role) => (
                    <button
                        key={role}
                        type="button"
                        onClick={() => onChange(role)}
                        className={`
                            py-2 rounded-lg text-xs font-medium border transition
                            ${value === role
                                ? "border-green-700 bg-green-50 text-green-700"
                                : "border-gray-300 text-gray-700 hover:border-gray-400"
                            }
                        `}
                    >
                        {role === "buyer" ? "Buyer" : "Vendor"}
                    </button>
                ))}
            </div>
        </div>
    );
}
