import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { ArrowRight, BookOpen, Users, GraduationCap, FileText, Activity, Microscope, BarChart3, Waves, Bell, Download, PenLine } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Layout } from "@/components/Layout";
import { HeroBackground } from "@/components/HeroBackground";
import {
  useAnnouncements,
  useBlogs,
  useResources,
  useSiteContent,
  aboutFallback,
  heroFallback,
  homeStatsFallback,
  type AboutContent,
  type HeroContent,
  type HomeStatsContent,
} from "@/lib/content";
import { optimizedImageSrcSet, optimizedImageUrl } from "@/lib/images";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dr. Jimrise Ochwach, PhD — Applied Mathematics" },
      { name: "description", content: "Lecturer in Applied Mathematics at Mama Ngina University College. Research in mathematical modelling, epidemiology, fluid dynamics and data science." },
    ],
  }),
  component: Home,
});

function Home() {
  const { data: hero } = useSiteContent<HeroContent>("hero", heroFallback);
  const { data: about } = useSiteContent<AboutContent>("about", aboutFallback);
  const { data: homeStats } = useSiteContent<HomeStatsContent>("home_stats", homeStatsFallback);
  const { data: announcements = [] } = useAnnouncements();
  const { data: resources = [] } = useResources();
  const { data: blogs = [] } = useBlogs();

  const sections = [
    { to: "/about", icon: GraduationCap, label: "About & Education" },
    { to: "/research", icon: BookOpen, label: "Research & Publications" },
    { to: "/supervision", icon: Users, label: "Student Supervision" },
    { to: "/resources", icon: FileText, label: "Student Resources" },
  ];
  const researchFocus = [
    { icon: Activity, title: "Mathematical Modelling", text: "Practical models for biological, agricultural, and socio-economic systems." },
    { icon: Microscope, title: "Epidemiology", text: "Disease dynamics, intervention design, and population-level analysis." },
    { icon: Waves, title: "Fluid Dynamics", text: "Applied analysis of flow, transport, and environmental processes." },
    { icon: BarChart3, title: "Data Science", text: "Computational methods for education, finance, agribusiness, and computing." },
  ];
  const stats = [
    { label: "Journal Articles", value: safeStat(homeStats.journal_articles) },
    { label: "PhD Supervision", value: safeStat(homeStats.phd_supervision) },
    { label: "MSc Completed", value: safeStat(homeStats.msc_completed) },
    { label: "MSc Ongoing", value: safeStat(homeStats.msc_ongoing) },
  ];
  const latestAnnouncements = announcements.slice(0, 2);
  const latestResources = resources.slice(0, 3);
  const latestBlogs = blogs.slice(0, 2);

  return (
    <Layout plain>
      <section className="relative min-h-screen flex items-center bg-navy-deep text-cream overflow-hidden pt-24 pb-16">
        <HeroBackground medium />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 grid lg:grid-cols-12 gap-10 lg:gap-16 items-center w-full">
          <div className="lg:col-span-7 animate-fade-in">
            <p className="text-gold text-xs font-semibold tracking-[0.25em] uppercase mb-5">{hero.tagline}</p>
            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold leading-[1.05] text-balance">
              {hero.name.split(" ").slice(0, -1).join(" ")} <span className="text-gold">{hero.name.split(" ").slice(-1)}</span>
            </h1>
            <p className="mt-5 text-lg md:text-xl text-cream/85 font-light">{hero.role}</p>
            <p className="mt-1 text-sm md:text-base text-cream/65">{hero.institution}</p>
            <p className="mt-8 max-w-2xl text-base md:text-lg leading-relaxed text-cream/80 border-l-2 border-gold pl-5 italic font-serif">
              “{hero.quote}”
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Button asChild size="lg" className="bg-gold text-navy-deep hover:bg-gold-soft font-semibold shadow-lg shadow-gold/20">
                <Link to="/research">View Research <ArrowRight size={18} className="ml-1" /></Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-cream/30 text-cream bg-transparent hover:bg-cream/10 hover:text-cream font-semibold">
                <Link to="/resources">Student Resources</Link>
              </Button>
            </div>
          </div>

          <div className="lg:col-span-5 animate-slide-up">
            <div className="relative max-w-md mx-auto">
              <div className="absolute -inset-4 bg-gradient-to-tr from-gold/30 to-transparent rounded-2xl blur-2xl" />
              <div className="absolute -top-3 -left-3 w-24 h-24 border-t-2 border-l-2 border-gold rounded-tl-2xl" />
              <div className="absolute -bottom-3 -right-3 w-24 h-24 border-b-2 border-r-2 border-gold rounded-br-2xl" />
              {hero.photo_url ? (
                <img
                  src={optimizedImageUrl(hero.photo_url, 720)}
                  srcSet={optimizedImageSrcSet(hero.photo_url, [360, 540, 720, 960])}
                  sizes="(min-width: 1024px) 420px, min(100vw - 2rem, 448px)"
                  alt={hero.name}
                  width={720}
                  height={900}
                  loading="eager"
                  decoding="async"
                  fetchPriority="high"
                  className="relative w-full aspect-[4/5] object-cover rounded-2xl shadow-2xl ring-1 ring-cream/10"
                />
              ) : (
                <div className="relative w-full aspect-[4/5] rounded-2xl border border-cream/15 bg-cream/5 shadow-2xl ring-1 ring-cream/10 flex items-center justify-center text-center p-8">
                  <p className="text-sm text-cream/60">Hero photo will appear after admin uploads it.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 grid lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-7">
            <p className="text-gold text-xs font-semibold tracking-[0.2em] uppercase mb-3">Academic Profile</p>
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-navy-deep mb-5">Applied mathematics for real-world decisions.</h2>
            <p className="text-foreground/75 leading-relaxed whitespace-pre-line">
              {about.bio}
            </p>
          </div>
          <div className="lg:col-span-5">
            <Card className="border-gold/30 bg-secondary/40">
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Explore Dr. Ochwach's education, experience, leadership roles, certifications, and full academic service profile.
                </p>
                <Button asChild className="mt-5 bg-navy-deep hover:bg-navy text-cream">
                  <Link to="/about">Read Full Profile <ArrowRight size={16} className="ml-1" /></Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-20 bg-secondary/40 border-y border-border">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-10">
            <div>
              <p className="text-gold text-xs font-semibold tracking-[0.2em] uppercase mb-3">Research Focus</p>
              <h2 className="font-serif text-3xl md:text-4xl font-bold text-navy-deep">Areas of scholarship</h2>
            </div>
            <Button asChild variant="outline">
              <Link to="/research">View Research <ArrowRight size={16} className="ml-1" /></Link>
            </Button>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {researchFocus.map((item) => (
              <Card key={item.title} className="bg-background hover:border-gold/60 hover:shadow-lg transition-all">
                <CardContent className="pt-6">
                  <item.icon size={24} className="text-gold mb-4" />
                  <h3 className="font-serif text-lg font-semibold text-navy-deep mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{item.text}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-navy-deep text-cream">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat) => (
              <div key={stat.label} className="rounded-xl border border-cream/10 bg-cream/5 p-6">
                <p className="font-serif text-4xl font-bold text-gold">
                  <CountUpNumber value={stat.value} />
                </p>
                <p className="text-sm text-cream/70 mt-2">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-navy-deep mb-10 text-center">Explore</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {sections.map((s) => (
              <Link key={s.to} to={s.to} className="group p-6 rounded-2xl border border-border hover:border-gold hover:shadow-xl hover:-translate-y-1 transition-all bg-card">
                <s.icon size={28} className="text-gold mb-4" />
                <p className="font-serif text-lg font-semibold text-navy-deep">{s.label}</p>
                <span className="text-sm text-gold mt-3 inline-flex items-center gap-1 group-hover:gap-2 transition-all">
                  Visit <ArrowRight size={14} />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-secondary/40 border-t border-border">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-10">
            <div>
              <p className="text-gold text-xs font-semibold tracking-[0.2em] uppercase mb-3">Student Hub</p>
              <h2 className="font-serif text-3xl md:text-4xl font-bold text-navy-deep">Latest updates</h2>
            </div>
            <Button asChild className="bg-gold text-navy-deep hover:bg-gold-soft">
              <Link to="/resources">Open Resources <ArrowRight size={16} className="ml-1" /></Link>
            </Button>
          </div>
          <div className="grid lg:grid-cols-3 gap-5">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 mb-4">
                  <Bell size={18} className="text-gold" />
                  <h3 className="font-serif text-lg font-semibold text-navy-deep">Announcements</h3>
                </div>
                <div className="space-y-3">
                  {latestAnnouncements.length > 0 ? latestAnnouncements.map((item) => (
                    <div key={item.id} className="border-b border-border pb-3 last:border-0">
                      <p className="text-sm font-semibold text-navy-deep">{item.title}</p>
                      <p className="text-xs text-muted-foreground mt-1">{item.date}</p>
                    </div>
                  )) : <p className="text-sm text-muted-foreground">No announcements yet.</p>}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 mb-4">
                  <Download size={18} className="text-gold" />
                  <h3 className="font-serif text-lg font-semibold text-navy-deep">Recent Resources</h3>
                </div>
                <div className="space-y-3">
                  {latestResources.length > 0 ? latestResources.map((item) => (
                    <div key={item.id} className="border-b border-border pb-3 last:border-0">
                      <p className="text-sm font-semibold text-navy-deep">{item.title}</p>
                      <p className="text-xs text-muted-foreground mt-1">{item.course} · {item.type}</p>
                    </div>
                  )) : <p className="text-sm text-muted-foreground">No resources uploaded yet.</p>}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 mb-4">
                  <PenLine size={18} className="text-gold" />
                  <h3 className="font-serif text-lg font-semibold text-navy-deep">Latest Writing</h3>
                </div>
                <div className="space-y-3">
                  {latestBlogs.length > 0 ? latestBlogs.map((post) => (
                    <Link key={post.id} to="/blogs/$slug" params={{ slug: post.slug }} className="block border-b border-border pb-3 last:border-0 group">
                      <p className="text-sm font-semibold text-navy-deep group-hover:text-gold transition-colors">{post.title}</p>
                      {post.excerpt && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{post.excerpt}</p>}
                    </Link>
                  )) : <p className="text-sm text-muted-foreground">No published posts yet.</p>}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </Layout>
  );
}

function safeStat(value: unknown) {
  const next = Number(value);
  return Number.isFinite(next) && next > 0 ? Math.round(next) : 0;
}

function CountUpNumber({ value }: { value: number }) {
  const ref = useRef<HTMLSpanElement | null>(null);
  const [started, setStarted] = useState(false);
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStarted(true);
          observer.disconnect();
        }
      },
      { threshold: 0.35 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!started) return;
    const duration = 1200;
    const start = performance.now();
    let frame = 0;
    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(value * eased));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [started, value]);

  return <span ref={ref}>{display}</span>;
}
