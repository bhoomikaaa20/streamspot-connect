import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import User from "../models/User";

// ✅ Extend Request type
export interface AuthRequest extends Request {
    user?: any;
}

const JWT_SECRET = process.env.JWT_SECRET!;

export const protect = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
        return res.status(401).json({ message: "No token" });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET) as { id: string };

        const user = await User.findById(decoded.id).select("-password");

        if (!user) {
            return res.status(401).json({ message: "User not found" });
        }

        req.user = user; // ✅ properly typed
        next();
    } catch (error) {
        return res.status(401).json({ message: "Invalid token" });
    }
};