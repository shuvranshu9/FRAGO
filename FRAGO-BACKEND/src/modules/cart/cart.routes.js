import express from "express";
import { requireBuyer, verifyToken } from "../../middlewares/authMiddleware.js";
import {
  getCartController,
  addToCartController,
  updateCartItemController,
  removeFromCartController,
  clearCartController,
} from "./cart.controller.js";

const router = express.Router();

router.use(verifyToken);

router.get("/", getCartController);
router.post("/", addToCartController);
router.put("/:cartItemId", updateCartItemController);
router.delete("/:cartItemId", removeFromCartController);
router.delete("/", clearCartController);

export default router;
