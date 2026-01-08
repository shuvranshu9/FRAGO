import { useState } from "react"
import LogoImg from "../assets/FRAGO.png"

export default function LoginPage() {
    return (
        <div className="w-screen h-screen overflow-hidden flex items-center justify-center bg-white">
            <div className="grid grid-cols-1 md:grid-cols-2 w-full h-full px-8">
                {/* Left Side - Sign In Form */}
                <div className="flex items-center justify-center px-6 md:px-12 bg-white">
                    <div className="w-full max-w-md">
                        <SignInForm />
                    </div>
                </div>

                {/* Right Side - Logo & Branding */}
                <div className="hidden md:flex items-center justify-center ">
                    <div className="flex flex-col items-center gap-6">
                        <img
                            src={LogoImg}
                            alt="FRAGO Logo"
                            className="w-full h-full object-contain"
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}

function SignInForm() {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [loading, setLoading] = useState(false)

    const handleSubmit = (e) => {
        e.preventDefault()
        setLoading(true)
        // Handle login API logic here
        setTimeout(() => setLoading(false), 1000)
    }

    return (
        <div className="space-y-6 p-6 md:p-8 rounded-lg shadow-lg bg-white w-full">
            <div>
                <h1 className="text-3xl font-semibold text-gray-900">Sign In</h1>
                <p className="text-gray-600 text-sm mt-2">
                    Welcome back! Please enter your details.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                        Email
                    </label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your email"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent transition"
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                        Password
                    </label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter your password"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent transition"
                        required
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-green-700 hover:bg-green-800 disabled:opacity-60 text-white font-semibold py-3 rounded-lg transition duration-200"
                >
                    {loading ? "Signing in..." : "Sign in"}
                </button>
            </form>
        </div>
    )
}
