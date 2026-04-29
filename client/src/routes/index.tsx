import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { MovieCard } from "@/components/movie-card";
import { Button } from "@/components/ui/button";
import { resolvePoster, formatDuration } from "@/lib/posters";
import { useAuth } from "@/hooks/use-auth";
import { Play, Info, Sparkles, Film, Clock, Globe2, ShieldCheck, Tv, Star } from "lucide-react";
import heroBanner from "@/assets/hero-banner.jpg";
import axios from "axios";


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
      const token = localStorage.getItem("token");

      const { data } = await axios.get("http://localhost:5000/api/movies", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setMovies(data);
      setLoading(false);
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
      const token = localStorage.getItem("token");

      const { data } = await axios.get("http://localhost:5000/api/history", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setHistory(data);
    })();
  }, [user]);

  const featured = movies.find((m) => m.featured) ?? movies[0];
  const trending = movies.filter((m) => m.category === "Trending");
  const newReleases = movies.filter((m) => m.category === "New Releases");
  const others = movies.filter((m) => !["Trending", "New Releases"].includes(m.category) && m.id !== featured?.id);
  const genres = Array.from(new Set(movies.map((m) => m.genre))).filter(Boolean);

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

        {/* Top 10 picks */}
        {movies.length > 0 && (
          <section>
            <h2 className="mb-4 text-xl font-semibold tracking-tight md:text-2xl">Top 10 this week</h2>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5">
              {movies.slice(0, 10).map((m, i) => (
                <div key={m.id} className="relative">
                  <span
                    aria-hidden
                    className="pointer-events-none absolute -left-2 -top-4 z-10 select-none text-7xl font-black leading-none text-primary/30 md:text-8xl"
                  >
                    {i + 1}
                  </span>
                  <div className="relative z-0 pl-6">
                    <MovieCard {...m} />
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Browse by genre */}
        {genres.length > 0 && (
          <section>
            <h2 className="mb-4 text-xl font-semibold tracking-tight md:text-2xl">Browse by genre</h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
              {genres.map((g) => (
                <Link
                  key={g}
                  to="/browse"
                  className="group relative flex h-24 items-center justify-center overflow-hidden rounded-lg border border-border bg-card/60 px-4 text-center transition-all hover:border-primary/60 hover:shadow-glow"
                >
                  <div className="absolute inset-0 gradient-card opacity-60 transition-opacity group-hover:opacity-90" />
                  <span className="relative text-base font-semibold tracking-wide text-foreground md:text-lg">
                    {g}
                  </span>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Why CineDrift */}
        <section className="rounded-2xl border border-border bg-card/40 p-6 md:p-10">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-2xl font-bold tracking-tight md:text-3xl">Why CineDrift</h2>
            <p className="mt-2 text-muted-foreground">
              Cinematic shorts, on-demand, anywhere. Built for the way you watch today.
            </p>
          </div>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: Film, title: "Curated catalog", desc: "Hand-picked shorts across every genre." },
              { icon: Tv, title: "Stream anywhere", desc: "Optimized playback on any device." },
              { icon: Clock, title: "Resume instantly", desc: "Pick up exactly where you left off." },
              { icon: ShieldCheck, title: "Secure & private", desc: "Encrypted accounts and protected streams." },
            ].map((f) => (
              <div key={f.title} className="rounded-xl border border-border/60 bg-background/40 p-5">
                <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/15 text-primary">
                  <f.icon className="h-5 w-5" />
                </div>
                <h3 className="text-base font-semibold">{f.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Stats banner */}
        <section className="grid grid-cols-2 gap-4 rounded-2xl border border-border bg-gradient-to-br from-primary/10 via-card/40 to-background p-6 md:grid-cols-4 md:p-8">
          {[
            { label: "Shorts in catalog", value: `${movies.length}+`, icon: Film },
            { label: "Genres", value: `${genres.length}`, icon: Sparkles },
            { label: "Available worldwide", value: "24/7", icon: Globe2 },
            { label: "Avg. user rating", value: "4.8★", icon: Star },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <div className="mx-auto mb-2 inline-flex h-9 w-9 items-center justify-center rounded-full bg-primary/15 text-primary">
                <s.icon className="h-4 w-4" />
              </div>
              <div className="text-2xl font-bold md:text-3xl">{s.value}</div>
              <div className="mt-1 text-xs uppercase tracking-wider text-muted-foreground">{s.label}</div>
            </div>
          ))}
        </section>

        {/* Final CTA */}
        {!user && (
          <section className="overflow-hidden rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/20 via-background to-background p-8 text-center md:p-12">
            <h2 className="text-balance text-2xl font-bold tracking-tight md:text-4xl">
              Ready to start watching?
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
              Create a free account to save your progress, build your list, and stream instantly.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Button size="lg" asChild>
                <Link to="/browse">
                  <Play className="h-5 w-5 fill-current" /> Browse catalog
                </Link>
              </Button>
            </div>
          </section>
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
