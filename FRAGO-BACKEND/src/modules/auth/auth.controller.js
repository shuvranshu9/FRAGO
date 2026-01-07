import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { sendOtpMail } from "../../utils/sendOtp.js";
import { findUserByEmail, createUser, verifyUserOtp, saveResetCode, verifyResetCode, updatePassword } from "./auth.model.js";
import { sendResetCodeMail } from "../../utils/sendResetCode.js";

export const signupBuyer = async (req, res, next) => {
    try {
        const { full_name, email, password, phone, address } = req.body;

        if (!full_name || !email || !password) {
            return res.status(400).json({ message: "Required fields missing" });
        }

        const existingUser = await findUserByEmail(email);
        if (existingUser) {
            return res.status(409).json({ message: "Email already registered" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const otp = Math.floor(100000 + Math.random() * 900000);

        await createUser({
            full_name,
            email,
            phone,
            address,
            password_hash: hashedPassword,
            role: "buyer",
            otp
        });

        await sendOtpMail(email, otp);

        res.status(201).json({ message: "Buyer registered. OTP sent to email." });
    } catch (err) {
        next(err);
    }
};

export const signupVendor = async (req, res, next) => {
    try {
        const { full_name, email, password, phone, address } = req.body;

        if (!full_name || !email || !password) {
            return res.status(400).json({ message: "Required fields missing" });
        }

        const existingUser = await findUserByEmail(email);
        if (existingUser) {
            return res.status(409).json({ message: "Email already registered" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const otp = Math.floor(100000 + Math.random() * 900000);

        await createUser({
            full_name,
            email,
            phone,
            address,
            password_hash: hashedPassword,
            role: "vendor",
            otp
        });

        await sendOtpMail(email, otp);

        res.status(201).json({ message: "Vendor registered. OTP sent to email." });
    } catch (err) {
        next(err);
    }
};

export const verifyOtp = async (req, res, next) => {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({ message: "Email and OTP are required" });
        }

        const result = await verifyUserOtp(email, otp);

        if (!result.success) {
            return res.status(result.status).json({ message: result.message });
        }

        res.json({ message: "Email verified successfully" });
    } catch (err) {
        next(err);
    }
};

export const loginUser = (role) => async (req, res, next) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required" });
        }

        const user = await findUserByEmail(email);

        // User not found or wrong role
        if (!user || user.role !== role) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        // Check if email is verified
        if (!user.is_verified) {
            return res.status(403).json({ message: "Please verify your email first" });
        }

        // Compare password
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        // JWT payload
        const payload = {
            userID: user.userID,
            role: user.role
        };

        const token = jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: "8h" }
        );

        res.status(200).json({
            message: "Login successful",
            token,
            user: {
                userID: user.userID,
                full_name: user.full_name,
                email: user.email,
                role: user.role,
                phone:user.phone,
                address:user.address
            }
        });
    } catch (err) {
        next(err);
    }
};

export const forgotPassword = async (req, res, next) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ message: "Email is required" });
        }

        const user = await findUserByEmail(email);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const resetCode = Math.floor(100000 + Math.random() * 900000);

        await saveResetCode(email, resetCode);
        await sendResetCodeMail(email, resetCode);

        res.json({ message: "Reset code sent to email" });
    } catch (err) {
        next(err);
    }
};

export const resetPassword = async (req, res, next) => {
    try {
        const { email, code, new_password, confirm_password } = req.body;

        // Required fields validation
        if (!email || !code || !new_password || !confirm_password) {
            return res.status(400).json({
                message: "Email, code, new password and confirm password are required"
            });
        }

        // Password length validation
        if (new_password.length < 8) {
            return res.status(400).json({
                message: "Password must be at least 8 characters long"
            });
        }

        // Password match validation
        if (new_password !== confirm_password) {
            return res.status(400).json({
                message: "Password and confirm password do not match"
            });
        }

        // Verify reset code
        const verification = await verifyResetCode(email, code);
        if (!verification.success) {
            return res.status(400).json({
                message: verification.message
            });
        }

        // Hash and update password
        const hashedPassword = await bcrypt.hash(new_password, 10);
        await updatePassword(email, hashedPassword);

        res.status(200).json({
            message: "Password reset successful"
        });
    } catch (err) {
        next(err);
    }
};