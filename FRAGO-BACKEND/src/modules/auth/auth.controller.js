import bcrypt from "bcrypt";
import { sendOtpMail } from "../../utils/sendOtp.js";
import { findUserByEmail, createUser, verifyUser } from "./auth.model.js";

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

        await createUser({
            full_name,
            email,
            phone,
            address,
            password_hash: hashedPassword,
            role: "buyer"
        });

        const otp = Math.floor(100000 + Math.random() * 900000);
        otpStore.set(email, otp);

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

export const verifyOtp = async (req, res) => {
    const { email, otp } = req.body;

    if (otpStore.get(email) != otp) {
        return res.status(400).json({ message: "Invalid OTP" });
    }

    await verifyUser(email);
    otpStore.delete(email);

    res.json({ message: "Email verified successfully" });
};
