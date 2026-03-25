import express from "express";
import { sendMessage, getMessages } from "./message.controller.js";
import { verifyToken } from "../../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/", verifyToken, sendMessage);
router.get("/:chatId", verifyToken, getMessages);

export default router;
