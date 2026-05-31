import { useEffect, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Menu, X, LogIn, LayoutDashboard, LogOut, Mail, Instagram, Facebook, MessageCircle } from "lucide-react";
import { navLinks } from "@/lib/site-data";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useAuth, useUserRole } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { contactFallback, type ContactContent, useSiteContent } from "@/lib/content";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: role, isLoading: roleLoading } = useUserRole(user);
  const { data: contact } = useSiteContent<ContactContent>("contact", contactFallback);
  const dashTo = role === "admin" ? "/admin" : "/student";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const signOut = async () => { await supabase.auth.signOut(); navigate({ to: "/" }); };
  const socialLinks = [
    { label: "X", href: normalizeSocialUrl(contact.x_url), icon: null },
    { label: "Instagram", href: normalizeSocialUrl(contact.instagram), icon: Instagram },
    { label: "Facebook", href: normalizeSocialUrl(contact.facebook), icon: Facebook },
    { label: "WhatsApp", href: normalizeWhatsApp(contact.whatsapp), icon: MessageCircle },
    { label: "Email", href: contact.email ? `mailto:${contact.email}` : "#", icon: Mail },
  ];

  return (
    <header
      className={cn(
        "fixed top-0 inset-x-0 z-50 transition-all duration-300",
        scrolled ? "bg-navy/95 backdrop-blur-md shadow-lg shadow-navy/20" : "bg-navy/80 backdrop-blur-sm"
      )}
    >
      <div className="border-b border-navy-deep/10 bg-gold text-navy-deep">
        <div className="mx-auto flex h-7 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <p className="hidden sm:block text-[11px] font-semibold tracking-wide text-navy-deep/80 truncate">
            Applied Mathematics | Research | Teaching
          </p>
          <div className="flex flex-1 sm:flex-none items-center justify-end gap-1.5">
            {socialLinks.map((item) => {
              const Icon = item.icon;
              return (
                <a
                  key={item.label}
                  href={item.href}
                  target={item.href.startsWith("mailto:") ? undefined : "_blank"}
                  rel={item.href.startsWith("mailto:") ? undefined : "noreferrer"}
                  aria-label={item.label}
                  title={item.label}
                  className="inline-flex h-6 w-6 items-center justify-center rounded-full text-navy-deep/80 hover:text-cream hover:bg-navy-deep transition-colors"
                >
                  {Icon ? <Icon size={14} /> : <span className="text-xs font-black">X</span>}
                </a>
              );
            })}
          </div>
        </div>
      </div>
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
          <li className="ml-3 flex items-center gap-2">
            {user ? (
              <>
                <Button asChild size="sm" variant="outline" disabled={roleLoading || !role} className="border-cream/30 text-cream bg-transparent hover:bg-cream/10 hover:text-cream">
                  <Link to={roleLoading || !role ? "/auth" : dashTo}><LayoutDashboard size={14} className="mr-1.5" />Dashboard</Link>
                </Button>
                <Button size="sm" variant="ghost" onClick={signOut} className="text-cream/85 hover:bg-cream/10 hover:text-cream"><LogOut size={14} /></Button>
              </>
            ) : (
              <Button asChild size="sm" className="bg-gold text-navy-deep hover:bg-gold-soft font-semibold">
                <Link to="/auth"><LogIn size={14} className="mr-1.5" />Login</Link>
              </Button>
            )}
          </li>
        </ul>

        <button onClick={() => setOpen((v) => !v)} className="lg:hidden text-cream p-2 -mr-2" aria-label="Toggle menu">
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </nav>

      {open && (
        <div className="lg:hidden border-t border-cream/10 bg-navy-deep">
          <ul className="px-4 py-3 space-y-1">
            {navLinks.map((l) => (
              <li key={l.to}>
                <Link to={l.to} onClick={() => setOpen(false)} className="block px-3 py-2 text-sm text-cream/85 hover:text-gold hover:bg-cream/5 rounded-md">{l.label}</Link>
              </li>
            ))}
            <li className="pt-2 border-t border-cream/10 mt-2">
              {user ? (
                <>
                  <Link to={roleLoading || !role ? "/auth" : dashTo} onClick={() => setOpen(false)} className="block px-3 py-2 text-sm text-gold">Dashboard</Link>
                  <button onClick={() => { setOpen(false); signOut(); }} className="block w-full text-left px-3 py-2 text-sm text-cream/85">Sign out</button>
                </>
              ) : (
                <Link to="/auth" onClick={() => setOpen(false)} className="block px-3 py-2 text-sm text-gold font-semibold">Login / Sign up</Link>
              )}
            </li>
          </ul>
        </div>
      )}
    </header>
  );
}

function normalizeSocialUrl(value?: string) {
  if (!value || value.trim() === "") return "#";
  const trimmed = value.trim();
  if (trimmed === "#") return "#";
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed.replace(/^@/, "")}`;
}

function normalizeWhatsApp(value?: string) {
  if (!value || value.trim() === "") return "#";
  const trimmed = value.trim();
  if (trimmed === "#") return "#";
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  const digits = trimmed.replace(/[^\d]/g, "");
  return digits ? `https://wa.me/${digits}` : "#";
}
