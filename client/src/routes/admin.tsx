import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { resolvePoster } from "@/lib/posters";
import { ShieldCheck, Trash2, Pencil, Plus, X } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [{ title: "Admin — CineDrift" }],
  }),
  component: AdminPage,
});

interface Movie {
  id: string;
  title: string;
  genre: string;
  description: string;
  duration_seconds: number;
  category: string;
  poster_url: string;
  video_url: string;
  featured: boolean;
}

const emptyForm: Omit<Movie, "id"> = {
  title: "",
  genre: "",
  description: "",
  duration_seconds: 0,
  category: "General",
  poster_url: "",
  video_url: "",
  featured: false,
};

function AdminPage() {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const [movies, setMovies] = useState<Movie[]>([]);
  const [editing, setEditing] = useState<Movie | null>(null);
  const [form, setForm] = useState<Omit<Movie, "id">>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [userCount, setUserCount] = useState<number | null>(null);

  async function refresh() {
    const token = localStorage.getItem("token");

    const { data } = await axios.get("http://localhost:5000/api/movies", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    setMovies(data);
  }

  useEffect(() => {
    if (isAdmin) {
      void refresh();

      const fetchUserCount = async () => {
        try {
          const token = localStorage.getItem("token");

          const { data } = await axios.get(
            "http://localhost:5000/api/users/count",
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          setUserCount(data.count);
        } catch (err) {
          console.error("Failed to fetch user count");
          setUserCount(0);
        }
      };

      void fetchUserCount();
    }
  }, [isAdmin]);

  if (authLoading) {
    return <p className="container mx-auto px-4 py-16 text-center text-muted-foreground">Loading…</p>;
  }
  if (!user) {
    return (
      <div className="container mx-auto flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
        <h1 className="text-2xl font-bold">Admin only</h1>
        <Button asChild className="mt-4"><Link to="/auth" search={{ mode: "signin", redirect: "/" }}>Sign in</Link></Button>
      </div>
    );
  }
  if (!isAdmin) {
    return (
      <div className="container mx-auto flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
        <ShieldCheck className="h-12 w-12 text-muted-foreground" />
        <h1 className="mt-4 text-2xl font-bold">You're not an admin</h1>
        <p className="mt-2 max-w-md text-sm text-muted-foreground">
          Ask an existing admin to grant you the <code className="rounded bg-muted px-1">admin</code> role
          in the <code className="rounded bg-muted px-1">user_roles</code> table.
        </p>
        <Button asChild className="mt-6"><Link to="/">Back home</Link></Button>
      </div>
    );
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);

    try {
      const token = localStorage.getItem("token");

      if (editing) {
        await axios.put(
          `http://localhost:5000/api/movies/${editing.id}`,
          form,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        toast.success("Movie updated");
      } else {
        await axios.post("http://localhost:5000/api/movies", form, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success("Movie added");
      }

      setEditing(null);
      setForm(emptyForm);
      await refresh();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this movie? This cannot be undone.")) return;

    const token = localStorage.getItem("token");

    try {
      await axios.delete(`http://localhost:5000/api/movies/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success("Movie deleted");
      await refresh();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Delete failed");
    }
  }

  function startEdit(m: Movie) {
    setEditing(m);
    const { id: _id, ...rest } = m;
    setForm(rest);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function cancelEdit() {
    setEditing(null);
    setForm(emptyForm);
  }

  return (
    <div className="container mx-auto px-4 py-10 md:px-8">
      <div className="flex items-center gap-3">
        <ShieldCheck className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Admin</h1>
      </div>
      <p className="mt-2 text-muted-foreground">Manage the movie catalog.</p>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <Card className="border-border/60 bg-card/80 p-5">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Movies</p>
          <p className="mt-1 text-3xl font-bold">{movies.length}</p>
        </Card>
        <Card className="border-border/60 bg-card/80 p-5">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Registered users</p>
          <p className="mt-1 text-3xl font-bold">{userCount ?? "—"}</p>
        </Card>
        <Card className="border-border/60 bg-card/80 p-5">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Featured</p>
          <p className="mt-1 text-3xl font-bold">{movies.filter((m) => m.featured).length}</p>
        </Card>
      </div>

      <Card className="mt-8 border-border/60 bg-card/80 p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">{editing ? "Edit movie" : "Add a movie"}</h2>
          {editing && (
            <Button variant="ghost" size="sm" onClick={cancelEdit}>
              <X className="h-4 w-4" /> Cancel
            </Button>
          )}
        </div>

        <form onSubmit={handleSubmit} className="mt-4 grid gap-4 md:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="title">Title</Label>
            <Input id="title" required maxLength={150} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="genre">Genre</Label>
            <Input id="genre" required maxLength={50} value={form.genre} onChange={(e) => setForm({ ...form, genre: e.target.value })} />
          </div>
          <div className="space-y-1.5 md:col-span-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" rows={3} maxLength={1000} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="duration">Duration (minutes)</Label>
            <Input id="duration" type="number" min={0} max={600} value={form.duration_seconds} onChange={(e) => setForm({ ...form, duration_seconds: Number(e.target.value) })} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="category">Category</Label>
            <Input id="category" maxLength={50} value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="Trending / New Releases / Featured" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="poster">Poster URL or asset key</Label>
            <Input id="poster" required maxLength={500} value={form.poster_url} onChange={(e) => setForm({ ...form, poster_url: e.target.value })} placeholder="https://… or stellar/neon/fantasy/…" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="video">Video URL</Label>
            <Input id="video" required type="url" maxLength={500} value={form.video_url} onChange={(e) => setForm({ ...form, video_url: e.target.value })} placeholder="https://…/clip.mp4" />
          </div>
          <label className="flex cursor-pointer items-center gap-2 md:col-span-2">
            <input type="checkbox" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} />
            <span className="text-sm">Featured on home hero</span>
          </label>
          <div className="md:col-span-2">
            <Button type="submit" disabled={saving}>
              <Plus className="h-4 w-4" /> {saving ? "Saving…" : editing ? "Save changes" : "Add movie"}
            </Button>
          </div>
        </form>
      </Card>

      <h2 className="mt-10 text-xl font-semibold">Catalog</h2>
      <div className="mt-4 space-y-2">
        {movies.map((m) => (
          <Card key={m.id} className="flex items-center gap-4 border-border/60 bg-card/60 p-3">
            <img
              src={resolvePoster(m.poster_url)}
              alt=""
              className="h-16 w-12 rounded object-cover"
              width={48}
              height={64}
              loading="lazy"
            />
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium">{m.title} {m.featured && <span className="ml-1 rounded bg-primary/20 px-1.5 py-0.5 text-[10px] uppercase tracking-wider text-primary">Featured</span>}</p>
              <p className="truncate text-xs text-muted-foreground">{m.genre} • {m.category}</p>
            </div>
            <Button variant="ghost" size="sm" onClick={() => startEdit(m)}>
              <Pencil className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => handleDelete(m.id)} className="text-destructive hover:text-destructive">
              <Trash2 className="h-4 w-4" />
            </Button>
          </Card>
        ))}
      </div>
    </div>
  );
}
