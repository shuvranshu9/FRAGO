import express from "express";
import {
  createCategoryController,
  getAllCategoriesController,
  getCategoryByIdController,
  updateCategoryController,
  deleteCategoryController,
} from "./category.controller.js";
import { requireVendor, verifyToken } from "../../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/", verifyToken, requireVendor, createCategoryController);
router.get("/", getAllCategoriesController);
router.get("/:id", getCategoryByIdController);
router.put("/:id", verifyToken, requireVendor, updateCategoryController);
router.delete("/:id", verifyToken, requireVendor, deleteCategoryController);

export default router;
