import express from "express";
import {
  forgotPassword,
  loginUser,
  resetPassword,
  signupBuyer,
  signupVendor,
  verifyOtp,
  updateProfile,
} from "./auth.controller.js";
import { verifyToken } from "../../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/signup/buyer", signupBuyer);
router.post("/signup/vendor", signupVendor);
router.post("/verify-otp", verifyOtp);
router.post("/login/buyer", loginUser("buyer"));
router.post("/login/vendor", loginUser("vendor"));
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.patch("/profile/update", verifyToken, updateProfile);

export default router;
