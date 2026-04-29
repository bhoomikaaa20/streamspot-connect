import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { resolvePoster, formatDuration } from "@/lib/posters";
import { Button } from "@/components/ui/button";
import { ArrowLeft, AlertCircle } from "lucide-react";
import axios from "axios";

interface Movie {
  id: string;
  title: string;
  genre: string;
  description: string;
  duration_seconds: number;
  category: string;
  poster_url: string;
  video_url: string;
}

export const Route = createFileRoute("/movie/$id")({
  loader: async ({ params }) => {
    try {
      const { data } = await axios.get(
        `http://localhost:5000/api/movies/${params.id}`
      );

      return { movie: data };
    } catch (error) {
      throw notFound();
    }
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
        { title: `${loaderData.movie.title} — CineDrift` },
        { name: "description", content: loaderData.movie.description.slice(0, 155) },
        { property: "og:title", content: `${loaderData.movie.title} — CineDrift` },
        { property: "og:description", content: loaderData.movie.description.slice(0, 155) },
        { property: "og:image", content: resolvePoster(loaderData.movie.poster_url) },
        { property: "twitter:image", content: resolvePoster(loaderData.movie.poster_url) },
      ]
      : [{ title: "Movie — CineDrift" }],
  }),
  notFoundComponent: () => (
    <div className="container mx-auto flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <AlertCircle className="h-12 w-12 text-primary" />
      <h1 className="mt-4 text-2xl font-bold">Movie not found</h1>
      <p className="mt-2 text-muted-foreground">This title isn't in our catalog.</p>
      <Button asChild className="mt-6">
        <Link to="/">Back to home</Link>
      </Button>
    </div>
  ),
  errorComponent: ({ error }) => (
    <div className="container mx-auto flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <AlertCircle className="h-12 w-12 text-destructive" />
      <h1 className="mt-4 text-2xl font-bold">Something went wrong</h1>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">{error.message}</p>
      <Button asChild className="mt-6">
        <Link to="/">Back to home</Link>
      </Button>
    </div>
  ),
  component: MoviePage,
});

function MoviePage() {
  const { movie } = Route.useLoaderData();
  const { user } = useAuth();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [resumeAt, setResumeAt] = useState(0);
  const [videoError, setVideoError] = useState<string | null>(null);

  // Load existing watch progress
  useEffect(() => {
    if (!user) return;

    const fetchProgress = async () => {
      try {
        const token = localStorage.getItem("token");

        const { data } = await axios.get(
          `http://localhost:5000/api/history/${movie.id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (data?.progress_seconds) {
          setResumeAt(data.progress_seconds);
        }
      } catch (error) {
        console.log("No existing watch history");
      }
    };

    fetchProgress();
  }, [user, movie.id]);

  // Persist progress
  useEffect(() => {
    if (!user || !playing) return;

    const interval = setInterval(async () => {
      const video = videoRef.current;
      if (!video) return;

      try {
        const token = localStorage.getItem("token");

        await axios.post(
          "http://localhost:5000/api/history",
          {
            movieId: movie.id,
            progress_seconds: Math.floor(video.currentTime),
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
      } catch (error) {
        console.error("Failed to save progress");
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [user, playing, movie.id]);

  function startPlay() {
    setVideoError(null);
    setPlaying(true);

    setTimeout(() => {
      const v = videoRef.current;
      if (!v) return;

      // resume logic
      if (resumeAt > 0 && resumeAt < movie.duration_seconds * 60) {
        v.currentTime = resumeAt;
      }

      v.play().catch((e) => setVideoError(e.message));

      // initial save
      if (user) {
        const token = localStorage.getItem("token");

        axios.post(
          "http://localhost:5000/api/history",
          {
            movieId: movie.id,
            progress_seconds: resumeAt || 0,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
      }
    }, 0);
  }

  return (
    <div className="pb-20">
      <div className="relative">
        <div className="relative h-[60vh] min-h-[420px] w-full overflow-hidden">
          {playing ? (
            <video
              ref={videoRef}
              src={movie.video_url}
              controls
              autoPlay
              playsInline
              className="h-full w-full bg-black object-contain"
              onError={() => setVideoError("Unable to load video. Please try again later.")}
            />
          ) : (
            <>
              <img
                src={resolvePoster(movie.poster_url)}
                alt={`${movie.title} poster`}
                className="absolute inset-0 h-full w-full object-cover opacity-70"
                width={1920}
                height={1080}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
              <button
                onClick={startPlay}
                className="absolute inset-0 flex items-center justify-center transition-transform hover:scale-105"
                aria-label="Play trailer"
              >
                <span className="flex h-20 w-20 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-glow">
                  <svg viewBox="0 0 24 24" fill="currentColor" className="ml-1 h-10 w-10">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </span>
              </button>
            </>
          )}
        </div>
      </div>

      <div className="container mx-auto -mt-16 max-w-5xl px-4 md:px-8">
        <Button variant="ghost" size="sm" asChild className="mb-4">
          <Link to="/"><ArrowLeft className="h-4 w-4" /> Back</Link>
        </Button>

        <div className="rounded-2xl border border-border/60 bg-card/80 p-8 shadow-poster backdrop-blur">
          <div className="flex flex-wrap items-center gap-3 text-xs uppercase tracking-wider">
            <span className="rounded-full border border-primary/40 bg-primary/10 px-3 py-1 font-medium text-primary">
              {movie.genre}
            </span>
            <span className="text-muted-foreground">{movie.category}</span>
            <span className="text-muted-foreground">•</span>
            <span className="text-muted-foreground">{formatDuration(movie.duration_seconds)}</span>
          </div>
          <h1 className="mt-3 text-balance text-3xl font-bold tracking-tight md:text-5xl">
            {movie.title}
          </h1>
          <p className="mt-4 max-w-prose text-base leading-relaxed text-muted-foreground md:text-lg">
            {movie.description}
          </p>

          {!user && (
            <p className="mt-6 rounded-lg border border-border/60 bg-muted/40 p-4 text-sm text-muted-foreground">
              <Link to="/auth" search={{ mode: "signin", redirect: "/" }} className="text-primary hover:underline">Sign in</Link> to save your watch progress and resume later.
            </p>
          )}

          {videoError && (
            <p className="mt-6 flex items-center gap-2 rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
              <AlertCircle className="h-4 w-4" /> {videoError}
            </p>
          )}

          {resumeAt > 0 && !playing && user && (
            <p className="mt-4 text-sm text-muted-foreground">
              Resume from {Math.floor(resumeAt / 60)}:{String(Math.floor(resumeAt % 60)).padStart(2, "0")}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
