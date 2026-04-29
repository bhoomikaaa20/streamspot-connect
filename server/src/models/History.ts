import mongoose from "mongoose";

const historySchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    movie: { type: mongoose.Schema.Types.ObjectId, ref: "Movie" },
    progress_seconds: Number,
    watched_at: { type: Date, default: Date.now },
});

export default mongoose.model("History", historySchema);