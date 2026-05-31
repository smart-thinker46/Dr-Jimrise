import type { ReactNode } from "react";
import { Navbar } from "./Navbar";
import { SiteFooter } from "./SiteFooter";
import { HeroBackground } from "./HeroBackground";

export function Layout({ children, plain = false }: { children: ReactNode; plain?: boolean }) {
  return (
    <div className="min-h-screen w-full max-w-full overflow-x-clip bg-background flex flex-col">
      <Navbar />
      <main className={plain ? "flex-1 min-w-0" : "flex-1 min-w-0 pt-[92px]"}>{children}</main>
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

export function PageHeader({ eyebrow, title, subtitle, denseMath = false }: { eyebrow?: string; title: string; subtitle?: string; denseMath?: boolean }) {
  return (
    <section className="relative overflow-hidden bg-navy-deep text-cream pt-[104px] pb-14 md:pt-[136px] md:pb-20 border-b border-cream/10">
      <HeroBackground dense={denseMath} />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {eyebrow && <p className="text-gold text-xs font-semibold tracking-[0.25em] uppercase mb-4">{eyebrow}</p>}
        <h1 className="font-serif text-4xl md:text-6xl font-bold tracking-tight text-balance">{title}</h1>
        {subtitle && <p className="mt-5 max-w-3xl text-base md:text-lg text-cream/75 leading-relaxed">{subtitle}</p>}
      </div>
    </section>
  );
}
