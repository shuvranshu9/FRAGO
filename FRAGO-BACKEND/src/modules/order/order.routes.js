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
  confirmDeliveryController,
  updateOrderController,
  getVendorStatsController,
  getVendorOrdersController,
  getVendorTopProductsController,
} from "./order.controller.js";

const router = express.Router();

router.use(verifyToken);

router.post("/", checkoutController);
router.get("/", getMyOrdersController);

// Vendor endpoints 
router.get("/vendor/stats", requireVendor, getVendorStatsController);
router.get("/vendor/orders", requireVendor, getVendorOrdersController);
router.get("/vendor/top-products", requireVendor, getVendorTopProductsController);

router.get("/:orderId", getOrderDetailsController);
router.patch("/:orderId/cancel", cancelOrderController);
router.patch("/:orderId/confirm-delivery", confirmDeliveryController);
router.put("/:orderId", updateOrderController);
router.put("/:orderId/status", requireVendor, updateOrderStatusController);

export default router;
