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
} from "./order.controller.js";

const router = express.Router();

router.use(verifyToken);

router.post("/", checkoutController);
router.get("/", getMyOrdersController);
router.get("/:orderId", getOrderDetailsController);
router.patch("/:orderId/cancel", cancelOrderController);
router.put("/:orderId", updateOrderController);
router.put("/:orderId/status", requireVendor, updateOrderStatusController);

export default router;
