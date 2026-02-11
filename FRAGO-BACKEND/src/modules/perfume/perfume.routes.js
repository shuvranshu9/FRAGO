import express from "express";
import {
  createPerfumeController,
  getAllPerfumesController,
  getPerfumeByIdController,
  updatePerfumeController,
  deletePerfumeController,
  deletePerfumeImage,
} from "./perfume.controller.js";
import { requireVendor, verifyToken } from "../../middlewares/authMiddleware.js";
import upload from "../../middlewares/upload.js";

const router = express.Router();

router.post(
  "/",
  verifyToken,
  requireVendor,
  upload.array("images", 5),
  createPerfumeController
);

router.get("/", getAllPerfumesController);
router.get("/:id", getPerfumeByIdController);

router.put("/:id", verifyToken, requireVendor, updatePerfumeController);
router.delete("/:id", verifyToken, requireVendor, deletePerfumeController);

router.delete(
  "/delete/:imageID",
  verifyToken,
  requireVendor,
  deletePerfumeImage
);

export default router;
