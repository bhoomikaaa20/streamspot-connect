import { Link } from "@tanstack/react-router";
import { resolvePoster } from "@/lib/posters";
import { Play } from "lucide-react";

interface MovieCardProps {
  id: string;
  title: string;
  genre: string;
  poster_url: string;
}

export function MovieCard({ id, title, genre, poster_url }: MovieCardProps) {
  return (
    <Link
      to="/movie/$id"
      params={{ id }}
      className="group relative block overflow-hidden rounded-lg shadow-poster transition-transform duration-300 hover:scale-[1.04] hover:shadow-glow focus-visible:scale-[1.04] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
    >
      <div className="aspect-[2/3] w-full overflow-hidden bg-card">
        <img
          src={resolvePoster(poster_url)}
          alt={`${title} poster`}
          loading="lazy"
          width={512}
          height={768}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>
      <div className="pointer-events-none absolute inset-0 gradient-card opacity-90" />
      <div className="absolute inset-x-0 bottom-0 p-4">
        <p className="text-xs font-medium uppercase tracking-wider text-primary/90">{genre}</p>
        <h3 className="mt-1 line-clamp-2 text-base font-semibold text-foreground text-balance">{title}</h3>
      </div>
      <div className="absolute right-3 top-3 flex h-10 w-10 translate-y-1 items-center justify-center rounded-full bg-primary text-primary-foreground opacity-0 shadow-glow transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
        <Play className="h-4 w-4 fill-current" />
      </div>
    </Link>
  );
}
