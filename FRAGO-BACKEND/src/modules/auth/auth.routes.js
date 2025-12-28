import express from "express";
import { signupBuyer, signupVendor, verifyOtp } from "./auth.controller.js";

const router = express.Router();

router.post("/signup/buyer", signupBuyer);
router.post("/signup/vendor", signupVendor);
router.post("/verify-otp", verifyOtp);

export default router;
