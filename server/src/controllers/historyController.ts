import { Response } from "express";
import History from "../models/History";
import { AuthRequest } from "../middleware/authMiddleware";

// GET SINGLE MOVIE PROGRESS
export const getHistoryByMovie = async (req: AuthRequest, res: Response) => {
    try {
        const history = await History.findOne({
            user: req.user._id,
            movie: req.params.movieId,
        });

        res.json(history || {});
    } catch {
        res.status(500).json({ message: "Error fetching history" });
    }
};
export const getAllHistory = async (req: AuthRequest, res: Response) => {
    try {
        const history = await History.find({ user: req.user._id })
            .populate("movie")
            .sort({ watched_at: -1 });

        const formatted = history.map((h: any) => ({
            movie_id: h.movie._id,
            progress_seconds: h.progress_seconds,
            watched_at: h.watched_at,
            movies: {
                id: h.movie._id,
                title: h.movie.title,
                genre: h.movie.genre,
                poster_url: h.movie.poster_url,
            },
        }));

        res.json(formatted);
    } catch {
        res.status(500).json({ message: "Error fetching history" });
    }
};
// SAVE / UPDATE
export const saveHistory = async (req: AuthRequest, res: Response) => {
    try {
        const { movieId, progress_seconds } = req.body;

        const history = await History.findOneAndUpdate(
            {
                user: req.user._id,
                movie: movieId,
            },
            {
                progress_seconds,
                watched_at: new Date(),
            },
            { upsert: true, new: true }
        );

        res.json(history);
    } catch {
        res.status(500).json({ message: "Error saving history" });
    }
};