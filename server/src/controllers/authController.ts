import { Request, Response } from "express";
import User from "../models/User";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET!;

export const signup = async (req: Request, res: Response) => {
    try {
        const { name, displayName, email, password } = req.body;

        const finalName = name || displayName;

        if (!finalName || !email || !password) {
            return res.status(400).json({ message: "All fields required" });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await User.create({
            name: finalName,
            email,
            password: hashedPassword,
            role: "user",
        });

        // ✅ IMPORTANT: only send success message
        return res.status(201).json({
            message: "User created successfully",
        });

    } catch (error) {
        console.error("Signup error:", error); // 🔥 see real error
        return res.status(500).json({ message: "Signup failed" });
    }
};


export const login = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "All fields required" });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        // 🔥 FIX: ensure JWT_SECRET exists
        if (!process.env.JWT_SECRET) {
            console.error("JWT_SECRET missing in .env");
            return res.status(500).json({ message: "Server config error" });
        }

        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        return res.json({
            token,
            user: {
                id: user._id,
                name: user.name,
                role: user.role,
            },
        });

    } catch (error) {
        console.error("Login error:", error); // 🔥 VERY IMPORTANT
        return res.status(500).json({ message: "Login failed" });
    }
};

export const getMe = async (req: any, res: Response) => {
    res.json({ user: req.user });
};