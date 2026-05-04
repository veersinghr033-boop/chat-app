import express from "express";
import { createChat, getMessages } from "../controllers/chatControllers.js";
import { verifyToken } from "../middlewares/verifyToken.js";

const router = express.Router();

router.post("/chat", verifyToken, createChat);
router.get("/chat/:receiverId", verifyToken, getMessages);
export default router;
