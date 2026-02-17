import express from "express";
import {
  recommendPerfumeController,
  getRecommendationOptions,
} from "./recommend.controller.js";

const router = express.Router();

// Dropdown values for frontend
router.get("/options", getRecommendationOptions);

// Recommendation API
router.get("/", recommendPerfumeController);

export default router;
