import { Router } from "express";
import { verifyToken } from "../../middlewares/authMiddleware.js";
import {
  getReviews,
  addReview,
  removeReview,
  editReview,
} from "./review.controller.js";

const router = Router();

// Public — get all reviews for a perfume
router.get("/:perfume_id", getReviews);

// Protected — submit a review (buyer only)
router.post("/:perfume_id", verifyToken, addReview);

// Protected — edit own review
router.put("/:review_id", verifyToken, editReview);

// Protected — delete own review
router.delete("/:review_id", verifyToken, removeReview);

export default router;
