import bcrypt from "bcrypt";
import { sendOtpMail } from "../../utils/sendOtp.js";
import { findUserByEmail, createUser, verifyUserOtp } from "./auth.model.js";

const otpStore = new Map();

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

        await createUser({
            full_name,
            email,
            phone,
            address,
            password_hash: hashedPassword,
            role: "vendor"
        });

        const otp = Math.floor(100000 + Math.random() * 900000);
        otpStore.set(email, otp);

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


