import express from "express";
import { verifyToken, requireBuyer } from "../../middlewares/authMiddleware.js";
import {
    addBookmarkController,
    removeBookmarkController,
    getBookmarksController,
} from "./bookmark.controller.js";

const router = express.Router();

// Apply middleware to all bookmark routes
router.use(verifyToken, requireBuyer);

router.post("/", addBookmarkController);
router.get("/", getBookmarksController);
router.delete("/:perfumeId", removeBookmarkController);

export default router;
