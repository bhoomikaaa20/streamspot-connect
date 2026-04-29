import mongoose from "mongoose";

const movieSchema = new mongoose.Schema(
    {
        title: String,
        genre: String,
        description: String,
        duration_seconds: Number,
        category: String,
        poster_url: String,
        featured: Boolean,
        video_url: String,
    },
    { timestamps: true }
);

export default mongoose.model("Movie", movieSchema);