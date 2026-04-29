import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    displayName: String,
    role: { type: String, enum: ["user", "admin"], default: "user" },
});

export default mongoose.model("User", userSchema);