import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";
import { CircleAlert, Home, RefreshCw } from "lucide-react";

import appCss from "../styles.css?url";
import jimriseIcon from "../assets/jimriseicon.png?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { recordAdminClientError } from "@/lib/admin-logs";
import { Toaster } from "@/components/ui/sonner";
import { defaultDescription, defaultTitle, personSchema, seoHead, siteName, websiteSchema } from "@/lib/seo";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
    void recordAdminClientError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-secondary/40 px-4 py-8">
      <div className="w-full max-w-lg overflow-hidden rounded-xl border border-border bg-background shadow-xl shadow-navy-deep/10">
        <div className="border-b border-gold/30 bg-navy-deep px-6 py-5 text-cream">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-gold text-navy-deep"><CircleAlert size={21} /></span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gold">Page unavailable</p>
              <h1 className="mt-0.5 font-serif text-2xl font-bold">This page didn't load</h1>
            </div>
          </div>
        </div>
        <div className="px-6 py-6">
          <p className="text-sm leading-relaxed text-muted-foreground">
            Something interrupted this page while it was loading. Your information is safe. Try again, or return to the main site.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-gold px-4 py-2 text-sm font-semibold text-navy-deep transition-all hover:bg-gold-soft active:scale-[0.98]"
          >
            <RefreshCw size={16} className="mr-2" />Try again
          </button>
          <Link to="/" className="inline-flex items-center justify-center rounded-md border border-border bg-background px-4 py-2 text-sm font-medium text-navy-deep transition-colors hover:bg-secondary">
            <Home size={16} className="mr-2" />Go home
          </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { name: "theme-color", content: "#1a2e4a" },
      { name: "application-name", content: siteName },
      { name: "keywords", content: "Dr Jimrise Ochwach, Applied Mathematics, Mama Ngina University College, mathematical modelling, epidemiology, fluid dynamics, data science, Kenya lecturer" },
      ...seoHead({ title: defaultTitle, description: defaultDescription }).meta,
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", type: "image/png", href: jimriseIcon },
      { rel: "apple-touch-icon", href: jimriseIcon },
      { rel: "manifest", href: "/site.webmanifest" },
      ...seoHead().links,
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Playfair+Display:wght@500;600;700;800&family=Inter:wght@300;400;500;600;700&display=swap" },
    ],
    scripts: [
      { type: "application/ld+json", children: JSON.stringify(personSchema) },
      { type: "application/ld+json", children: JSON.stringify(websiteSchema) },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
      <Outlet />
      <Toaster />
    </QueryClientProvider>
  );
}
