import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Film, LogOut, ShieldCheck } from "lucide-react";

export function SiteHeader() {
  const { user, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();
  const { location } = useRouterState();
  const scrolled = typeof window !== "undefined" && location.pathname !== "/";

  return (
    <header
      className={`sticky top-0 z-50 w-full border-b border-border/40 backdrop-blur transition-colors ${
        scrolled ? "bg-background/85" : "bg-gradient-to-b from-background via-background/70 to-transparent"
      }`}
    >
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-8">
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-2 text-primary">
            <Film className="h-6 w-6" />
            <span className="text-xl font-bold tracking-tight">CINEDRIFT</span>
          </Link>
          <nav className="hidden items-center gap-6 text-sm md:flex">
            <Link to="/" activeOptions={{ exact: true }} activeProps={{ className: "text-foreground" }} className="text-muted-foreground transition-colors hover:text-foreground">
              Home
            </Link>
            <Link to="/browse" activeProps={{ className: "text-foreground" }} className="text-muted-foreground transition-colors hover:text-foreground">
              Browse
            </Link>
            {user && (
              <Link to="/my-list" activeProps={{ className: "text-foreground" }} className="text-muted-foreground transition-colors hover:text-foreground">
                Continue Watching
              </Link>
            )}
            {isAdmin && (
              <Link to="/admin" activeProps={{ className: "text-foreground" }} className="flex items-center gap-1 text-muted-foreground transition-colors hover:text-foreground">
                <ShieldCheck className="h-4 w-4" /> Admin
              </Link>
            )}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          {user ? (
            <>
              <span className="hidden text-sm text-muted-foreground sm:inline">
                {user.email}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={async () => {
                  await signOut();
                  navigate({ to: "/" });
                }}
              >
                <LogOut className="h-4 w-4" />
                <span className="sr-only">Sign out</span>
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/auth" search={{ mode: "signin", redirect: "/" }}>Sign in</Link>
              </Button>
              <Button size="sm" asChild>
                <Link to="/auth" search={{ mode: "signup", redirect: "/" }}>Sign up</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
