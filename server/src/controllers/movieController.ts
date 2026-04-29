import { Request, Response } from "express";
import Movie from "../models/Movie";
import { AuthRequest } from "../middleware/authMiddleware";

// GET ALL
export const getMovies = async (req: Request, res: Response) => {
    const movies = await Movie.find().sort({ createdAt: -1 });
    res.json(movies);
};

// CREATE
export const createMovie = async (req: AuthRequest, res: Response) => {
    try {
        if (req.user.role !== "admin") {
            return res.status(403).json({ message: "Admin only" });
        }

        const movie = await Movie.create(req.body);
        res.json(movie);
    } catch {
        res.status(500).json({ message: "Create failed" });
    }
};
export const getMovieById = async (req: Request, res: Response) => {
    try {
        const movie = await Movie.findById(req.params.id);

        if (!movie) {
            return res.status(404).json({ message: "Movie not found" });
        }

        res.json(movie);
    } catch {
        res.status(500).json({ message: "Error fetching movie" });
    }
};
// UPDATE
export const updateMovie = async (req: AuthRequest, res: Response) => {
    try {
        if (req.user.role !== "admin") {
            return res.status(403).json({ message: "Admin only" });
        }

        const movie = await Movie.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );

        res.json(movie);
    } catch {
        res.status(500).json({ message: "Update failed" });
    }
};

// DELETE
export const deleteMovie = async (req: AuthRequest, res: Response) => {
    try {
        if (req.user.role !== "admin") {
            return res.status(403).json({ message: "Admin only" });
        }

        await Movie.findByIdAndDelete(req.params.id);
        res.json({ message: "Deleted" });
    } catch {
        res.status(500).json({ message: "Delete failed" });
    }
};

