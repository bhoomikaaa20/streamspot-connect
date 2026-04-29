import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { MovieCard } from "@/components/movie-card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/browse")({
  head: () => ({
    meta: [
      { title: "Browse — CineDrift" },
      { name: "description", content: "Browse the full CineDrift catalog and filter by genre." },
      { property: "og:title", content: "Browse — CineDrift" },
      { property: "og:description", content: "Browse the full CineDrift catalog and filter by genre." },
    ],
  }),
  component: BrowsePage,
});

interface Movie {
  id: string;
  title: string;
  genre: string;
  poster_url: string;
}

function BrowsePage() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [query, setQuery] = useState("");
  const [genre, setGenre] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const token = localStorage.getItem("token");

        const { data } = await axios.get(
          "http://localhost:5000/api/movies",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        // only required fields (optional but clean)
        const formatted = data.map((m: any) => ({
          id: m._id,
          title: m.title,
          genre: m.genre,
          poster_url: m.poster_url,
        }));

        setMovies(formatted);
      } catch (error) {
        console.error("Failed to fetch movies");
        setMovies([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMovies();
  }, []);

  const genres = useMemo(() => Array.from(new Set(movies.map((m) => m.genre))).sort(), [movies]);

  const filtered = movies.filter((m) => {
    const matchesQuery = !query || m.title.toLowerCase().includes(query.toLowerCase());
    const matchesGenre = !genre || m.genre === genre;
    return matchesQuery && matchesGenre;
  });

  return (
    <div className="container mx-auto px-4 py-10 md:px-8">
      <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Browse</h1>
      <p className="mt-2 text-muted-foreground">Search and filter the full catalog.</p>

      <div className="mt-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <Input
          placeholder="Search titles…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="md:max-w-sm"
        />
        <div className="flex flex-wrap gap-2">
          <Button
            variant={!genre ? "default" : "secondary"}
            size="sm"
            onClick={() => setGenre(null)}
          >
            All
          </Button>
          {genres.map((g) => (
            <Button
              key={g}
              variant={genre === g ? "default" : "secondary"}
              size="sm"
              onClick={() => setGenre(g)}
            >
              {g}
            </Button>
          ))}
        </div>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
        {filtered.map((m) => (
          <MovieCard key={m.id} {...m} />
        ))}
      </div>

      {!loading && filtered.length === 0 && (
        <p className="py-16 text-center text-muted-foreground">No movies match your filters.</p>
      )}
      {loading && <p className="py-16 text-center text-muted-foreground">Loading…</p>}
    </div>
  );
}
