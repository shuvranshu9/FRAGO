import express from "express";
import * as PaymentController from "./payment.controller.js";
import { verifyToken } from "../../middlewares/authMiddleware.js";

const router = express.Router();

// Initiate payment
router.post(
  "/initiate",
  verifyToken,
  PaymentController.initiatePaymentController,
);

// Verify payment
router.post("/verify", verifyToken, PaymentController.verifyPaymentController);

export default router;
