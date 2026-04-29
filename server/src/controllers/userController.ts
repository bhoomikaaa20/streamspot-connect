import { Response } from "express";
import User from "../models/User";
import { AuthRequest } from "../middleware/authMiddleware";

export const getUserCount = async (req: AuthRequest, res: Response) => {
    try {
        if (req.user.role !== "admin") {
            return res.status(403).json({ message: "Admin only" });
        }

        const count = await User.countDocuments();
        res.json({ count });
    } catch {
        res.status(500).json({ message: "Error fetching count" });
    }
};