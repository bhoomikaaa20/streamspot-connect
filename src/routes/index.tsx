import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { MovieCard } from "@/components/movie-card";
import { Button } from "@/components/ui/button";
import { resolvePoster, formatDuration } from "@/lib/posters";
import { useAuth } from "@/hooks/use-auth";
import { Play, Info, Sparkles } from "lucide-react";
import heroBanner from "@/assets/hero-banner.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "CineDrift — Stream Cinematic Shorts" },
      { name: "description", content: "Discover trending shorts, cult favorites, and new releases on CineDrift." },
      { property: "og:title", content: "CineDrift — Stream Cinematic Shorts" },
      { property: "og:description", content: "Discover trending shorts, cult favorites, and new releases on CineDrift." },
    ],
  }),
  component: HomePage,
});

interface Movie {
  id: string;
  title: string;
  genre: string;
  description: string;
  duration_seconds: number;
  category: string;
  poster_url: string;
  featured: boolean;
}

interface HistoryRow {
  movie_id: string;
  progress_seconds: number;
  watched_at: string;
  movies: Movie | null;
}

function HomePage() {
  const { user } = useAuth();
  const [movies, setMovies] = useState<Movie[]>([]);
  const [history, setHistory] = useState<HistoryRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("movies").select("*").order("created_at", { ascending: false });
      setMovies((data ?? []) as Movie[]);
      setLoading(false);
    })();
  }, []);

  useEffect(() => {
    if (!user) {
      setHistory([]);
      return;
    }
    (async () => {
      const { data } = await supabase
        .from("watch_history")
        .select("movie_id, progress_seconds, watched_at, movies(*)")
        .order("watched_at", { ascending: false })
        .limit(10);
      setHistory((data ?? []) as unknown as HistoryRow[]);
    })();
  }, [user]);

  const featured = movies.find((m) => m.featured) ?? movies[0];
  const trending = movies.filter((m) => m.category === "Trending");
  const newReleases = movies.filter((m) => m.category === "New Releases");
  const others = movies.filter((m) => !["Trending", "New Releases"].includes(m.category) && m.id !== featured?.id);

  return (
    <div className="pb-16">
      {/* Hero */}
      {featured ? (
        <section className="relative -mt-16 h-[78vh] min-h-[520px] w-full overflow-hidden">
          <img
            src={resolvePoster(featured.poster_url)}
            alt={`${featured.title} backdrop`}
            className="absolute inset-0 h-full w-full object-cover opacity-70"
            width={1920}
            height={1080}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/70 to-transparent" />
          <div className="absolute inset-0 gradient-hero" />
          <div className="container relative mx-auto flex h-full max-w-6xl flex-col justify-end px-4 pb-20 md:px-8">
            <div className="max-w-xl">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-xs font-medium uppercase tracking-wider text-primary">
                <Sparkles className="h-3 w-3" /> Featured
              </div>
              <h1 className="text-balance text-4xl font-bold leading-tight tracking-tight md:text-6xl">
                {featured.title}
              </h1>
              <div className="mt-3 flex items-center gap-3 text-sm text-muted-foreground">
                <span>{featured.genre}</span>
                <span>•</span>
                <span>{formatDuration(featured.duration_seconds)}</span>
                <span>•</span>
                <span>{featured.category}</span>
              </div>
              <p className="mt-4 max-w-prose text-base text-muted-foreground md:text-lg">
                {featured.description}
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Button size="lg" asChild>
                  <Link to="/movie/$id" params={{ id: featured.id }}>
                    <Play className="h-5 w-5 fill-current" /> Play
                  </Link>
                </Button>
                <Button size="lg" variant="secondary" asChild>
                  <Link to="/movie/$id" params={{ id: featured.id }}>
                    <Info className="h-5 w-5" /> More info
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      ) : (
        <div className="h-32" />
      )}

      <div className="container mx-auto space-y-12 px-4 md:px-8">
        {user && history.length > 0 && (
          <Row title="Continue watching">
            {history.map((h) =>
              h.movies ? (
                <MovieCard
                  key={h.movie_id}
                  id={h.movies.id}
                  title={h.movies.title}
                  genre={h.movies.genre}
                  poster_url={h.movies.poster_url}
                />
              ) : null,
            )}
          </Row>
        )}

        {trending.length > 0 && (
          <Row title="Trending now">
            {trending.map((m) => (
              <MovieCard key={m.id} {...m} />
            ))}
          </Row>
        )}

        {newReleases.length > 0 && (
          <Row title="New releases">
            {newReleases.map((m) => (
              <MovieCard key={m.id} {...m} />
            ))}
          </Row>
        )}

        {others.length > 0 && (
          <Row title="More to explore">
            {others.map((m) => (
              <MovieCard key={m.id} {...m} />
            ))}
          </Row>
        )}

        {loading && (
          <p className="py-16 text-center text-muted-foreground">Loading catalog…</p>
        )}
      </div>
    </div>
  );
}

function Row({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="mb-4 text-xl font-semibold tracking-tight md:text-2xl">{title}</h2>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
        {children}
      </div>
    </section>
  );
}
