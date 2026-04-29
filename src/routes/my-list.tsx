import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { MovieCard } from "@/components/movie-card";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/my-list")({
  head: () => ({
    meta: [{ title: "Continue watching — CineDrift" }],
  }),
  component: MyListPage,
});

interface Movie {
  id: string;
  title: string;
  genre: string;
  poster_url: string;
}
interface Row {
  movie_id: string;
  progress_seconds: number;
  watched_at: string;
  movies: Movie | null;
}

function MyListPage() {
  const { user, loading: authLoading } = useAuth();
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setLoading(false);
      return;
    }
    (async () => {
      const { data } = await supabase
        .from("watch_history")
        .select("movie_id, progress_seconds, watched_at, movies(id,title,genre,poster_url)")
        .order("watched_at", { ascending: false });
      setRows((data ?? []) as unknown as Row[]);
      setLoading(false);
    })();
  }, [user, authLoading]);

  if (!authLoading && !user) {
    return (
      <div className="container mx-auto flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
        <h1 className="text-2xl font-bold">Sign in to track what you watch</h1>
        <p className="mt-2 text-muted-foreground">Your continue-watching list lives here.</p>
        <Button asChild className="mt-6">
          <Link to="/auth" search={{ mode: "signin", redirect: "/" }}>Sign in</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-10 md:px-8">
      <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Continue watching</h1>
      <p className="mt-2 text-muted-foreground">Pick up where you left off.</p>

      {loading ? (
        <p className="py-16 text-center text-muted-foreground">Loading…</p>
      ) : rows.length === 0 ? (
        <div className="py-16 text-center">
          <p className="text-muted-foreground">You haven't watched anything yet.</p>
          <Button asChild className="mt-4">
            <Link to="/browse">Browse the catalog</Link>
          </Button>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {rows.map((r) =>
            r.movies ? <MovieCard key={r.movie_id} {...r.movies} /> : null,
          )}
        </div>
      )}
    </div>
  );
}
