import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, BookOpen, Users, GraduationCap, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/Layout";
import { HeroBackground } from "@/components/HeroBackground";
import professorPhoto from "@/assets/professor.jpg";
import { useSiteContent, heroFallback, type HeroContent } from "@/lib/content";

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
  const photo = hero.photo_url || professorPhoto;

  const sections = [
    { to: "/about", icon: GraduationCap, label: "About & Education" },
    { to: "/research", icon: BookOpen, label: "Research & Publications" },
    { to: "/supervision", icon: Users, label: "Student Supervision" },
    { to: "/resources", icon: FileText, label: "Student Resources" },
  ];

  return (
    <Layout plain>
      <section className="relative min-h-screen flex items-center bg-navy-deep text-cream overflow-hidden pt-24 pb-16">
        <HeroBackground />
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
              <img src={photo} alt={hero.name} className="relative w-full aspect-[4/5] object-cover rounded-2xl shadow-2xl ring-1 ring-cream/10" />
            </div>
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
    </Layout>
  );
}
