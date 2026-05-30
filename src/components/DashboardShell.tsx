import { type ReactNode } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { LogOut, Home, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";

export type DashboardNavItem = {
  id: string;
  label: string;
  icon: LucideIcon;
};

export function DashboardShell({
  title,
  subtitle,
  userEmail,
  roleLabel,
  nav,
  active,
  onSelect,
  children,
}: {
  title: string;
  subtitle?: string;
  userEmail?: string;
  roleLabel: string;
  nav: DashboardNavItem[];
  active: string;
  onSelect: (id: string) => void;
  children: ReactNode;
}) {
  const navigate = useNavigate();
  const signOut = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/" });
  };

  return (
    <div className="min-h-screen bg-secondary/30 flex">
      {/* Sidebar */}
      <aside className="hidden md:flex w-64 shrink-0 flex-col bg-navy-deep text-cream sticky top-0 h-screen">
        <Link to="/" className="px-6 py-5 border-b border-cream/10 hover:bg-navy/60 transition-colors">
          <p className="font-serif text-lg font-bold leading-tight">J. Ochwach</p>
          <p className="text-[10px] tracking-[0.2em] uppercase text-gold mt-0.5">{roleLabel}</p>
        </Link>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {nav.map((item) => {
            const Icon = item.icon;
            const isActive = item.id === active;
            return (
              <button
                key={item.id}
                onClick={() => onSelect(item.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors text-left",
                  isActive
                    ? "bg-gold text-navy-deep"
                    : "text-cream/80 hover:text-cream hover:bg-cream/5"
                )}
              >
                <Icon size={16} />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="px-3 py-4 border-t border-cream/10 space-y-1">
          <Link
            to="/"
            className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm text-cream/80 hover:text-gold hover:bg-cream/5"
          >
            <Home size={16} /> Back to site
          </Link>
          <button
            onClick={signOut}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm text-cream/80 hover:text-gold hover:bg-cream/5"
          >
            <LogOut size={16} /> Sign out
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-background border-b sticky top-0 z-10">
          <div className="px-4 sm:px-6 lg:px-10 py-4 flex items-center justify-between gap-4">
            <div className="min-w-0">
              <h1 className="font-serif text-xl md:text-2xl font-bold text-navy-deep truncate">
                {title}
              </h1>
              {subtitle && (
                <p className="text-xs md:text-sm text-muted-foreground truncate">{subtitle}</p>
              )}
            </div>
            <div className="flex items-center gap-3">
              {userEmail && (
                <span className="hidden sm:inline text-xs text-muted-foreground truncate max-w-[180px]">
                  {userEmail}
                </span>
              )}
              <Button size="sm" variant="outline" onClick={signOut} className="md:hidden">
                <LogOut size={14} />
              </Button>
            </div>
          </div>

          {/* Mobile nav */}
          <div className="md:hidden border-t overflow-x-auto">
            <div className="flex gap-1 px-3 py-2 min-w-max">
              {nav.map((item) => {
                const Icon = item.icon;
                const isActive = item.id === active;
                return (
                  <button
                    key={item.id}
                    onClick={() => onSelect(item.id)}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap",
                      isActive
                        ? "bg-navy-deep text-cream"
                        : "text-muted-foreground hover:bg-secondary"
                    )}
                  >
                    <Icon size={14} />
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>
        </header>

        <main className="flex-1 px-4 sm:px-6 lg:px-10 py-6 md:py-8">{children}</main>
      </div>
    </div>
  );
}
