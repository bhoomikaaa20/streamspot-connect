import express from "express";
import {
    getMovies,
    createMovie,
    updateMovie,
    deleteMovie,
    getMovieById,
} from "../controllers/movieController";

// ✅ THIS WAS MISSING
import { protect } from "../middleware/authMiddleware";

const router = express.Router();

router.get("/", protect, getMovies);
router.get("/:id", getMovieById);

router.post("/", protect, createMovie);
router.put("/:id", protect, updateMovie);
router.delete("/:id", protect, deleteMovie);

export default router;