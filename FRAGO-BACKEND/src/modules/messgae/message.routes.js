import express from "express";
import { sendMessage, getMessages, markAsRead } from "./message.controller.js";
import { verifyToken } from "../../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/", verifyToken, sendMessage);
router.get("/:chatId", verifyToken, getMessages);
router.put("/mark-read/:chatId", verifyToken, markAsRead);

export default router;
