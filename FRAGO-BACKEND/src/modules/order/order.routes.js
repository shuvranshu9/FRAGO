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
  cancelOrderController,
  updateOrderController,
  getVendorStatsController,
  getVendorOrdersController,
} from "./order.controller.js";

const router = express.Router();

router.use(verifyToken);

router.post("/", checkoutController);
router.get("/", getMyOrdersController);

// Vendor endpoints (More specific routes first)
router.get("/vendor/stats", requireVendor, getVendorStatsController);
router.get("/vendor/orders", requireVendor, getVendorOrdersController);

router.get("/:orderId", getOrderDetailsController);
router.patch("/:orderId/cancel", cancelOrderController);
router.put("/:orderId", updateOrderController);
router.put("/:orderId/status", requireVendor, updateOrderStatusController);

export default router;
