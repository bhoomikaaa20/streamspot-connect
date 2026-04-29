import express from "express";
import { getUserCount } from "../controllers/userController";
import { protect } from "../middleware/authMiddleware";

const router = express.Router();

router.get("/count", protect, getUserCount);

export default router;