import stellar from "@/assets/poster-stellar.jpg";
import neon from "@/assets/poster-neon.jpg";
import fantasy from "@/assets/poster-fantasy.jpg";
import thriller from "@/assets/poster-thriller.jpg";
import romance from "@/assets/poster-romance.jpg";
import adventure from "@/assets/poster-adventure.jpg";
import horror from "@/assets/poster-horror.jpg";
import action from "@/assets/poster-action.jpg";

const posterMap: Record<string, string> = {
  stellar,
  neon,
  fantasy,
  thriller,
  romance,
  adventure,
  horror,
  action,
};

const fallback = stellar;

/**
 * Resolves a poster_url from the DB to a usable image URL.
 * If the value is a known asset key, returns the bundled asset.
 * If it's already a URL (admin uploaded), returns it as-is.
 */
export function resolvePoster(poster: string | null | undefined): string {
  if (!poster) return fallback;
  if (poster.startsWith("http") || poster.startsWith("/") || poster.startsWith("data:")) {
    return poster;
  }
  return posterMap[poster] ?? fallback;
}

export function formatDuration(seconds: number): string {
  if (!seconds) return "—";
  const h = Math.floor(seconds / 60);
  const m = seconds % 60;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}
