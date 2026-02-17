import express from "express";
import {
  verifyToken,
  requireVendor,
} from "../../middlewares/authMiddleware.js";
import {
  checkoutController,
  getMyOrdersController,
  getOrderDetailsController,
  updateOrderStatusController,
} from "./order.controller.js";

const router = express.Router();

router.use(verifyToken);

router.post("/", checkoutController);
router.get("/", getMyOrdersController);
router.get("/:orderId", getOrderDetailsController);
router.put("/:orderId/status", requireVendor, updateOrderStatusController);

export default router;
