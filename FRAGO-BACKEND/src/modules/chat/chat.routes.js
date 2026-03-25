import express from "express";
import { createChat, getUserChats } from "./chat.controller.js";
import { verifyToken } from "../../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/", verifyToken, createChat);
router.get("/", verifyToken, getUserChats);

export default router;
