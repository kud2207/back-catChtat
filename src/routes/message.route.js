import express from "express";
import { getMessages, getUsersForSidebar, sendMessages } from "../controllers/message.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/users", protectRoute, getUsersForSidebar);
router.get("/:id", protectRoute, getMessages) //recuper user pour causer
router.post("/send/:id", protectRoute, sendMessages) 


export default router; 