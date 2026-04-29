import express from "express";
import {
    getHistoryByMovie,
    saveHistory,
    getAllHistory
} from "../controllers/historyController";

// ✅ import correct middleware name
import { protect } from "../middleware/authMiddleware";

const router = express.Router();

// ✅ correct usage
router.get("/:movieId", protect, getHistoryByMovie);
router.post("/", protect, saveHistory);
router.get("/", protect, getAllHistory);


export default router;