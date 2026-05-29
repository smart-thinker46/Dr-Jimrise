import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";
import { navLinks } from "@/lib/site-data";
import { cn } from "@/lib/utils";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed top-0 inset-x-0 z-50 transition-all duration-300",
        scrolled ? "bg-navy/95 backdrop-blur-md shadow-lg shadow-navy/20" : "bg-navy/80 backdrop-blur-sm"
      )}
    >
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 h-16">
        <Link to="/" className="flex items-baseline gap-2 text-cream hover:text-gold transition-colors">
          <span className="font-serif text-xl font-bold tracking-tight">J. Ochwach</span>
          <span className="text-gold text-xs font-medium tracking-widest uppercase hidden sm:inline">PhD</span>
        </Link>

        <ul className="hidden lg:flex items-center gap-1">
          {navLinks.map((l) => (
            <li key={l.to}>
              <Link
                to={l.to}
                className="relative px-3 py-2 text-sm font-medium text-cream/85 hover:text-gold transition-colors"
                activeProps={{ className: "text-gold" }}
              >
                {l.label}
              </Link>
            </li>
          ))}
        </ul>

        <button
          onClick={() => setOpen((v) => !v)}
          className="lg:hidden text-cream p-2 -mr-2"
          aria-label="Toggle menu"
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </nav>

      {open && (
        <div className="lg:hidden border-t border-cream/10 bg-navy-deep">
          <ul className="px-4 py-3 space-y-1">
            {navLinks.map((l) => (
              <li key={l.to}>
                <Link
                  to={l.to}
                  onClick={() => setOpen(false)}
                  className="block px-3 py-2 text-sm text-cream/85 hover:text-gold hover:bg-cream/5 rounded-md"
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </header>
  );
}
