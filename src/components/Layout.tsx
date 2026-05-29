import type { ReactNode } from "react";
import { Navbar } from "./Navbar";
import { SiteFooter } from "./SiteFooter";

export function Layout({ children, plain = false }: { children: ReactNode; plain?: boolean }) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className={plain ? "flex-1" : "flex-1 pt-16"}>{children}</main>
      <SiteFooter />
    </div>
  );
}

export function SectionTitle({
  eyebrow,
  title,
  subtitle,
  light = false,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  light?: boolean;
}) {
  return (
    <div className="max-w-3xl mb-12 md:mb-16">
      {eyebrow && (
        <p className={`text-xs font-semibold tracking-[0.2em] uppercase mb-3 ${light ? "text-gold-soft" : "text-gold"}`}>
          {eyebrow}
        </p>
      )}
      <h1 className={`text-3xl md:text-5xl font-bold tracking-tight text-balance ${light ? "text-cream" : "text-navy-deep"}`}>
        {title}
      </h1>
      {subtitle && (
        <p className={`mt-4 text-base md:text-lg leading-relaxed ${light ? "text-cream/75" : "text-muted-foreground"}`}>
          {subtitle}
        </p>
      )}
    </div>
  );
}

export function PageHeader({ eyebrow, title, subtitle }: { eyebrow?: string; title: string; subtitle?: string }) {
  return (
    <section className="bg-navy-deep text-cream pt-20 pb-14 md:pt-28 md:pb-20 border-b border-cream/10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {eyebrow && <p className="text-gold text-xs font-semibold tracking-[0.25em] uppercase mb-4">{eyebrow}</p>}
        <h1 className="font-serif text-4xl md:text-6xl font-bold tracking-tight text-balance">{title}</h1>
        {subtitle && <p className="mt-5 max-w-3xl text-base md:text-lg text-cream/75 leading-relaxed">{subtitle}</p>}
      </div>
    </section>
  );
}
