import { Outlet, Link, createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";
import { AuthProvider } from "@/hooks/use-auth";
import { SiteHeader } from "@/components/site-header";
import { Toaster } from "@/components/ui/sonner";
import { Film } from "lucide-react";

import appCss from "../styles.css?url";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-primary">404</h1>
        <h2 className="mt-4 text-xl font-semibold">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link
          to="/"
          className="mt-6 inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          Back home
        </Link>
      </div>
    </div>
  );
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "CineDrift — Cloud Movie Streaming" },
      { name: "description", content: "Browse and stream cinematic short clips on CineDrift, a cloud-based movie streaming platform." },
      { name: "author", content: "CineDrift" },
      { property: "og:title", content: "CineDrift — Cloud Movie Streaming" },
      { property: "og:description", content: "Browse and stream cinematic short clips on CineDrift." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "stylesheet", href: appCss }],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        <HeadContent />
      </head>
      <body className="min-h-screen bg-background font-sans antialiased">
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  return (
    <AuthProvider>
      <div className="flex min-h-screen flex-col">
        <SiteHeader />
        <main className="flex-1">
          <Outlet />
        </main>
        <footer className="border-t border-border/40 py-8 text-center text-xs text-muted-foreground">
          <div className="container mx-auto flex flex-col items-center gap-2 px-4">
            <div className="flex items-center gap-2 text-primary">
              <Film className="h-4 w-4" />
              <span className="font-semibold tracking-wide">CINEDRIFT</span>
            </div>
            <p>Streaming short cinematic clips. Built on Lovable Cloud.</p>
          </div>
        </footer>
      </div>
      <Toaster richColors position="top-center" />
    </AuthProvider>
  );
}
