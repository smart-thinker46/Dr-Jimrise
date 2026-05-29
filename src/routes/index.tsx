import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  Mail, MapPin, Linkedin, GraduationCap, BookOpen, Award, FileText, FileType, Presentation,
  Download, Calendar, Clock, Globe, Code2, Languages, Briefcase, Users, ShieldCheck,
  ExternalLink, ChevronDown, ArrowRight, Megaphone,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Navbar } from "@/components/Navbar";
import { HeroBackground } from "@/components/HeroBackground";
import { cn } from "@/lib/utils";
import professorPhoto from "@/assets/professor.jpg";
import {
  education, experience, journalArticles, conferences, grants,
  phdStudents, mscCompleted, mscOngoing, leadership, certifications,
  memberships, announcements, resources, courses,
} from "@/lib/site-data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dr. Jimrise Ochwach, PhD — Applied Mathematics" },
      { name: "description", content: "Lecturer in Applied Mathematics at Mama Ngina University College. Research in mathematical modelling, epidemiology, fluid dynamics and data science." },
      { property: "og:title", content: "Dr. Jimrise Ochwach, PhD" },
      { property: "og:description", content: "Applied Mathematics · Research · Teaching · Student Resources" },
    ],
  }),
  component: Index,
});

function SectionTitle({ eyebrow, title, subtitle, light = false }: { eyebrow?: string; title: string; subtitle?: string; light?: boolean }) {
  return (
    <div className="max-w-3xl mb-12 md:mb-16">
      {eyebrow && (
        <p className={cn("text-xs font-semibold tracking-[0.2em] uppercase mb-3", light ? "text-gold-soft" : "text-gold")}>
          {eyebrow}
        </p>
      )}
      <h2 className={cn("text-3xl md:text-5xl font-bold tracking-tight text-balance", light ? "text-cream" : "text-navy-deep")}>
        {title}
      </h2>
      {subtitle && (
        <p className={cn("mt-4 text-base md:text-lg leading-relaxed", light ? "text-cream/75" : "text-muted-foreground")}>
          {subtitle}
        </p>
      )}
    </div>
  );
}

function Index() {
  const [resourceFilter, setResourceFilter] = useState<string>("All");
  const courseFilters = ["All", ...new Set(resources.map((r) => r.course))];
  const filteredResources = resourceFilter === "All" ? resources : resources.filter((r) => r.course === resourceFilter);
  const fileIcon = (t: string) => (t === "PPT" ? Presentation : t === "DOC" ? FileType : FileText);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* HERO */}
      <section id="home" className="relative min-h-screen flex items-center bg-navy-deep text-cream overflow-hidden pt-24 pb-16">
        <HeroBackground />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 grid lg:grid-cols-12 gap-10 lg:gap-16 items-center w-full">
          <div className="lg:col-span-7 animate-fade-in">
            <p className="text-gold text-xs font-semibold tracking-[0.25em] uppercase mb-5">
              Applied Mathematician · Lecturer · Researcher
            </p>
            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold leading-[1.05] text-balance">
              Dr. Jimrise <span className="text-gold">Ochwach</span>, PhD
            </h1>
            <p className="mt-5 text-lg md:text-xl text-cream/85 font-light">
              Lecturer, Applied Mathematics
            </p>
            <p className="mt-1 text-sm md:text-base text-cream/65">
              Mama Ngina University College <span className="text-gold mx-2">·</span> Chuka University (Adjunct)
            </p>
            <p className="mt-8 max-w-2xl text-base md:text-lg leading-relaxed text-cream/80 border-l-2 border-gold pl-5 italic font-serif">
              “Developing practical mathematical solutions to socio-economic challenges in Kenya and beyond.”
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Button asChild size="lg" className="bg-gold text-navy-deep hover:bg-gold-soft font-semibold shadow-lg shadow-gold/20">
                <a href="#research">View Research <ArrowRight size={18} className="ml-1" /></a>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-cream/30 text-cream bg-transparent hover:bg-cream/10 hover:text-cream font-semibold">
                <a href="#resources">Student Resources</a>
              </Button>
            </div>
          </div>

          <div className="lg:col-span-5 animate-slide-up">
            <div className="relative max-w-md mx-auto">
              <div className="absolute -inset-4 bg-gradient-to-tr from-gold/30 to-transparent rounded-2xl blur-2xl" />
              <div className="absolute -top-3 -left-3 w-24 h-24 border-t-2 border-l-2 border-gold rounded-tl-2xl" />
              <div className="absolute -bottom-3 -right-3 w-24 h-24 border-b-2 border-r-2 border-gold rounded-br-2xl" />
              <img
                src={professorPhoto}
                alt="Dr. Jimrise Ochwach"
                width={896}
                height={1152}
                className="relative w-full aspect-[4/5] object-cover rounded-2xl shadow-2xl ring-1 ring-cream/10"
              />
            </div>
          </div>
        </div>
        <a href="#about" className="absolute bottom-6 left-1/2 -translate-x-1/2 text-cream/50 hover:text-gold transition-colors" aria-label="Scroll down">
          <ChevronDown size={28} className="animate-bounce" />
        </a>
      </section>

      {/* ABOUT */}
      <section id="about" className="section-pad bg-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionTitle eyebrow="About" title="A mathematician working on problems that matter." />
          <div className="grid lg:grid-cols-12 gap-12 items-start">
            <div className="lg:col-span-4">
              <div className="relative">
                <img
                  src={professorPhoto}
                  alt="Dr. Jimrise Ochwach"
                  width={896}
                  height={1152}
                  loading="lazy"
                  className="w-full aspect-[4/5] object-cover rounded-xl shadow-xl"
                />
                <div className="absolute -bottom-6 -right-4 bg-navy-deep text-cream rounded-lg p-5 shadow-2xl max-w-[80%] border-l-4 border-gold">
                  <p className="font-serif text-lg font-semibold leading-tight">Dr. Jimrise Ochwach</p>
                  <p className="text-gold text-xs mt-1 tracking-wider uppercase">PhD, Applied Mathematics</p>
                </div>
              </div>
            </div>
            <div className="lg:col-span-8 space-y-8">
              <p className="text-lg leading-relaxed text-foreground/85">
                I am an Applied Mathematician and researcher with expertise in mathematical modeling and analysis.
                My work spans human and plant disease dynamics, pest control, and fluid mechanics. I also apply
                data science methods to problems in agribusiness, education, finance, and computing.
                My goal is to develop practical solutions to socio-economic challenges in Kenya, Africa, and beyond.
              </p>

              <div className="grid sm:grid-cols-3 gap-4">
                {[
                  { icon: Globe, label: "Nationality", value: "Kenyan" },
                  { icon: Languages, label: "Languages", value: "English · Kiswahili · Luo" },
                  { icon: Code2, label: "Programming", value: "Python · R · SQL · MATLAB · Mathematica · LaTeX" },
                ].map((c) => (
                  <Card key={c.label} className="border-border/60 hover:border-gold/60 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                    <CardContent className="pt-6">
                      <c.icon className="text-gold mb-3" size={22} />
                      <p className="text-xs font-semibold tracking-widest uppercase text-muted-foreground">{c.label}</p>
                      <p className="mt-1.5 font-medium text-foreground text-sm">{c.value}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div>
                <p className="text-xs font-semibold tracking-[0.2em] uppercase text-muted-foreground mb-4">Research Interests</p>
                <div className="flex flex-wrap gap-2">
                  {["Mathematical Modelling", "Dynamical Systems", "Epidemiology", "Fluid Dynamics", "Data Science", "Machine Learning"].map((t) => (
                    <Badge key={t} variant="outline" className="border-navy/20 bg-navy/5 text-navy-deep hover:bg-gold hover:text-navy-deep hover:border-gold transition-colors px-3 py-1.5 text-sm font-medium">
                      {t}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* EDUCATION */}
      <section id="education" className="section-pad bg-secondary/40">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <SectionTitle eyebrow="Education" title="Academic background" />
          <div className="relative">
            <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-gold via-navy/30 to-transparent md:-translate-x-px" />
            {education.map((e, i) => (
              <div key={i} className={cn("relative grid md:grid-cols-2 gap-6 md:gap-12 pb-12 last:pb-0", i % 2 === 0 ? "" : "md:[direction:rtl]")}>
                <div className="absolute left-4 md:left-1/2 top-2 w-3 h-3 rounded-full bg-gold ring-4 ring-secondary/40 -translate-x-1/2" />
                <div className="pl-12 md:pl-0 md:[direction:ltr]">
                  <Card className="border-l-4 border-l-gold border-y-border border-r-border hover:shadow-xl transition-shadow">
                    <CardHeader className="pb-3">
                      <p className="text-gold text-xs font-bold tracking-widest uppercase">{e.period}</p>
                      <CardTitle className="font-serif text-xl text-navy-deep mt-1">{e.degree}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="font-medium text-foreground">{e.school}</p>
                      {e.detail && <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{e.detail}</p>}
                    </CardContent>
                  </Card>
                </div>
                <div className="hidden md:block" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* EXPERIENCE */}
      <section id="experience" className="section-pad bg-background">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <SectionTitle eyebrow="Experience" title="Teaching and professional roles" />
          <Accordion type="multiple" defaultValue={["item-0"]} className="space-y-3">
            {experience.map((x, i) => (
              <AccordionItem key={i} value={`item-${i}`} className="border border-border rounded-xl bg-card px-5 hover:border-gold/60 transition-colors data-[state=open]:border-gold/60 data-[state=open]:shadow-md">
                <AccordionTrigger className="hover:no-underline py-5">
                  <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-6 text-left w-full">
                    <div className="flex items-center gap-3 md:w-44 shrink-0">
                      <Briefcase size={18} className="text-gold shrink-0" />
                      <span className="text-xs font-bold tracking-widest uppercase text-gold">{x.period}</span>
                    </div>
                    <div className="flex-1">
                      <p className="font-serif font-semibold text-base md:text-lg text-navy-deep">{x.role}</p>
                      <p className="text-sm text-muted-foreground">{x.org}</p>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pb-5">
                  <ul className="space-y-2 md:pl-[12.5rem]">
                    {x.bullets.map((b, j) => (
                      <li key={j} className="flex gap-3 text-sm text-foreground/80">
                        <span className="text-gold mt-1.5">•</span>
                        <span className="leading-relaxed">{b}</span>
                      </li>
                    ))}
                  </ul>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* RESEARCH & PUBLICATIONS */}
      <section id="research" className="section-pad bg-navy-deep text-cream relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(201,168,76,0.1),transparent_60%)]" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionTitle eyebrow="Research" title="Publications & scholarship" subtitle="Peer-reviewed journal articles, conference contributions, and active research grants." light />

          <div id="publications" className="scroll-mt-24">
            <Tabs defaultValue="journals" className="w-full">
              <TabsList className="bg-cream/10 border border-cream/15 mb-8">
                <TabsTrigger value="journals" className="data-[state=active]:bg-gold data-[state=active]:text-navy-deep text-cream">
                  Journal Articles ({journalArticles.length})
                </TabsTrigger>
                <TabsTrigger value="conferences" className="data-[state=active]:bg-gold data-[state=active]:text-navy-deep text-cream">
                  Conference Presentations ({conferences.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="journals" className="grid md:grid-cols-2 gap-5 mt-0">
                {journalArticles.map((p, i) => (
                  <Card key={i} className="bg-cream/5 border-cream/10 hover:border-gold/50 hover:bg-cream/[0.08] transition-all group">
                    <CardContent className="pt-6 flex flex-col h-full">
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <Badge variant="outline" className="border-gold/40 text-gold bg-transparent shrink-0">{p.year}</Badge>
                        <BookOpen size={16} className="text-gold/60" />
                      </div>
                      <h3 className="font-serif text-lg font-semibold text-cream leading-snug mb-2 group-hover:text-gold-soft transition-colors">
                        {p.title}
                      </h3>
                      <p className="text-sm text-cream/65 mb-2">{p.authors}</p>
                      <p className="text-xs italic text-cream/50 mb-4">{p.journal}</p>
                      <div className="mt-auto pt-3 border-t border-cream/10">
                        <a href={p.doi} className="inline-flex items-center gap-1.5 text-xs font-semibold text-gold hover:text-gold-soft uppercase tracking-wider">
                          DOI / Read <ExternalLink size={12} />
                        </a>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>

              <TabsContent value="conferences" className="grid md:grid-cols-2 gap-5 mt-0">
                {conferences.map((c, i) => (
                  <Card key={i} className="bg-cream/5 border-cream/10 hover:border-gold/50 transition-all">
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <Badge variant="outline" className="border-gold/40 text-gold bg-transparent">{c.year}</Badge>
                        <Presentation size={16} className="text-gold/60" />
                      </div>
                      <h3 className="font-serif text-lg font-semibold text-cream leading-snug mb-2">{c.title}</h3>
                      <p className="text-sm text-cream/65 italic">{c.venue}</p>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>
            </Tabs>
          </div>

          <div className="mt-20">
            <h3 className="font-serif text-2xl md:text-3xl font-bold text-cream mb-2">Research Grants</h3>
            <p className="text-cream/65 mb-8">Currently funded projects.</p>
            <div className="grid md:grid-cols-2 gap-6">
              {grants.map((g, i) => (
                <Card key={i} className="bg-gradient-to-br from-cream/10 to-cream/[0.03] border-gold/30">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-2 mb-3">
                      <Award className="text-gold" size={20} />
                      <Badge className="bg-gold text-navy-deep hover:bg-gold">{g.role}</Badge>
                    </div>
                    <h4 className="font-serif text-lg font-semibold text-cream mb-4 leading-snug">{g.title}</h4>
                    <div className="flex items-center justify-between text-sm pt-4 border-t border-cream/10">
                      <span className="text-gold font-bold">{g.amount}</span>
                      <span className="text-cream/65">{g.period}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* SUPERVISION */}
      <section id="supervision" className="section-pad bg-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionTitle eyebrow="Mentorship" title="Student supervision" subtitle="Postgraduate students I have supervised or am currently co-supervising." />
          <div className="grid lg:grid-cols-3 gap-6">
            {[
              { label: "PhD — Ongoing", icon: GraduationCap, students: phdStudents.map((s) => ({ name: s.name, title: s.title, meta: s.school })) },
              { label: "MSc — Completed", icon: ShieldCheck, students: mscCompleted.map((s) => ({ name: s.name, title: s.title })) },
              { label: "MSc — Ongoing", icon: Users, students: mscOngoing.map((s) => ({ name: s.name, title: s.title })) },
            ].map((col) => (
              <div key={col.label} className="bg-card border border-border rounded-2xl p-6 flex flex-col">
                <div className="flex items-center gap-3 pb-4 mb-4 border-b border-border">
                  <div className="w-10 h-10 rounded-lg bg-gold/15 flex items-center justify-center">
                    <col.icon size={20} className="text-gold" />
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">Level</p>
                    <p className="font-serif text-lg font-bold text-navy-deep">{col.label}</p>
                  </div>
                </div>
                <ul className="space-y-4 flex-1">
                  {col.students.map((s, i) => (
                    <li key={i} className="group">
                      <p className="font-semibold text-navy-deep">{s.name}</p>
                      <p className="text-sm text-foreground/75 leading-snug mt-0.5">{s.title}</p>
                      {"meta" in s && s.meta && <p className="text-xs text-muted-foreground mt-1">{s.meta}</p>}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* LEADERSHIP */}
      <section id="leadership" className="section-pad bg-secondary/40">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <SectionTitle eyebrow="Service" title="Leadership & responsibilities" />
          <Accordion type="multiple" defaultValue={["lead-0"]} className="space-y-3">
            {leadership.map((g, i) => (
              <AccordionItem key={i} value={`lead-${i}`} className="border border-border rounded-xl bg-card px-5">
                <AccordionTrigger className="hover:no-underline">
                  <span className="font-serif text-lg font-semibold text-navy-deep">{g.org}</span>
                </AccordionTrigger>
                <AccordionContent>
                  <ul className="space-y-3">
                    {g.items.map((it, j) => (
                      <li key={j} className="flex items-start gap-3">
                        <Badge className="bg-navy text-cream hover:bg-navy mt-0.5 shrink-0 min-w-[5.5rem] justify-center">{it.role}</Badge>
                        <span className="text-sm text-foreground/85 leading-relaxed pt-0.5">{it.text}</span>
                      </li>
                    ))}
                  </ul>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* CERTIFICATIONS */}
      <section id="certifications" className="section-pad bg-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionTitle eyebrow="Credentials" title="Certifications & memberships" />
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-12">
            {certifications.map((c) => (
              <a key={c.title} href={c.link} target="_blank" rel="noreferrer" className="group">
                <Card className="h-full border-border hover:border-gold hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                  <CardContent className="pt-6 flex flex-col h-full">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-gold/20 to-gold/5 flex items-center justify-center mb-4">
                      <Award size={22} className="text-gold" />
                    </div>
                    <h3 className="font-serif font-semibold text-navy-deep leading-snug">{c.title}</h3>
                    <p className="text-xs text-muted-foreground mt-2 flex-1">{c.issuer}</p>
                    <span className="text-xs font-semibold text-gold mt-3 inline-flex items-center gap-1 group-hover:gap-2 transition-all">
                      View credential <ExternalLink size={11} />
                    </span>
                  </CardContent>
                </Card>
              </a>
            ))}
          </div>

          <div className="bg-navy-deep text-cream rounded-2xl p-8 md:p-10">
            <p className="text-xs uppercase tracking-[0.2em] text-gold font-semibold mb-4">Professional Memberships</p>
            <div className="flex flex-wrap gap-3">
              {memberships.map((m) => (
                <Badge key={m} className="bg-cream/10 hover:bg-gold hover:text-navy-deep text-cream border border-cream/15 px-4 py-2 text-sm font-medium">
                  {m}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* STUDENT RESOURCES */}
      <section id="resources" className="section-pad bg-gradient-to-b from-secondary/60 to-secondary/30 border-y border-border">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionTitle eyebrow="For Students" title="Resources for Students" subtitle="Access lecture notes, past papers, assignments, and important announcements." />

          {/* Announcements */}
          <div className="mb-14">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-gold flex items-center justify-center">
                <Megaphone size={20} className="text-navy-deep" />
              </div>
              <h3 className="font-serif text-2xl font-bold text-navy-deep">Announcements</h3>
            </div>
            <div className="grid md:grid-cols-3 gap-5">
              {announcements.map((a, i) => (
                <Card key={i} className="border-l-4 border-l-gold hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-2">
                    <p className="text-xs uppercase tracking-widest text-gold font-bold">{a.date}</p>
                    <CardTitle className="font-serif text-lg text-navy-deep leading-snug mt-1">{a.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-foreground/75 leading-relaxed">{a.body}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Courses */}
          <div className="mb-14">
            <h3 className="font-serif text-2xl font-bold text-navy-deep mb-6">Courses I Teach</h3>
            <div className="grid md:grid-cols-3 gap-5">
              {courses.map((c) => (
                <Card key={c.name} className="group bg-navy-deep text-cream border-navy-deep hover:bg-navy transition-colors overflow-hidden relative">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gold/10 rounded-full blur-3xl group-hover:bg-gold/20 transition-colors" />
                  <CardContent className="pt-6 relative">
                    <BookOpen size={22} className="text-gold mb-4" />
                    <h4 className="font-serif text-xl font-bold mb-2">{c.name}</h4>
                    <p className="text-sm text-cream/70 leading-relaxed">{c.desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Resource Library */}
          <div className="mb-14">
            <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
              <h3 className="font-serif text-2xl font-bold text-navy-deep">Resource Library</h3>
              <div className="flex flex-wrap gap-2">
                {courseFilters.map((f) => (
                  <button
                    key={f}
                    onClick={() => setResourceFilter(f)}
                    className={cn(
                      "px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-colors",
                      resourceFilter === f
                        ? "bg-navy-deep text-cream border-navy-deep"
                        : "bg-background text-foreground border-border hover:border-gold"
                    )}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredResources.map((r, i) => {
                const Icon = fileIcon(r.type);
                return (
                  <Card key={i} className="hover:shadow-lg hover:border-gold/50 transition-all group">
                    <CardContent className="pt-5">
                      <div className="flex items-start gap-4">
                        <div className="w-11 h-11 rounded-lg bg-gold/15 flex items-center justify-center shrink-0">
                          <Icon size={20} className="text-gold" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-navy-deep leading-snug">{r.title}</p>
                          <div className="flex items-center flex-wrap gap-x-3 gap-y-1 mt-2 text-xs text-muted-foreground">
                            <span className="text-gold font-semibold">{r.course}</span>
                            <span>·</span>
                            <span>{r.type}</span>
                            <span>·</span>
                            <span>{r.date}</span>
                          </div>
                        </div>
                      </div>
                      <Button size="sm" variant="outline" className="w-full mt-4 border-navy/20 hover:bg-navy-deep hover:text-cream hover:border-navy-deep">
                        <Download size={14} className="mr-2" /> Download
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Office Hours */}
          <Card className="bg-navy-deep text-cream border-navy-deep overflow-hidden">
            <CardContent className="p-8 md:p-10 grid md:grid-cols-3 gap-6 items-center">
              <div className="md:col-span-2">
                <div className="flex items-center gap-3 mb-3">
                  <Clock size={20} className="text-gold" />
                  <p className="text-xs uppercase tracking-[0.2em] text-gold font-semibold">Office Hours</p>
                </div>
                <h3 className="font-serif text-2xl md:text-3xl font-bold mb-2">Have a question? Drop by.</h3>
                <p className="text-cream/75 leading-relaxed">
                  In person consultations are open during the week. Email ahead for slots outside these times,
                  or to schedule an online meeting.
                </p>
              </div>
              <ul className="space-y-3 text-sm bg-cream/5 rounded-xl p-5 border border-cream/10">
                <li className="flex justify-between gap-4"><span className="text-cream/70">Tuesday</span><span className="font-semibold">10:00 – 12:00</span></li>
                <li className="flex justify-between gap-4"><span className="text-cream/70">Wednesday</span><span className="font-semibold">14:00 – 16:00</span></li>
                <li className="flex justify-between gap-4"><span className="text-cream/70">Friday</span><span className="font-semibold">11:00 – 13:00</span></li>
                <li className="pt-3 border-t border-cream/10 flex items-center gap-2 text-gold">
                  <Calendar size={14} /> <span className="text-xs">Book via email</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CONTACT */}
      <section id="contact" className="section-pad bg-background">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <SectionTitle eyebrow="Contact" title="Get in touch" subtitle="For research collaboration, supervision enquiries, or student questions." />
          <div className="grid lg:grid-cols-5 gap-10">
            <div className="lg:col-span-2 space-y-6">
              <div className="flex items-start gap-4 p-5 rounded-xl border border-border hover:border-gold/60 transition-colors">
                <Mail className="text-gold mt-1 shrink-0" size={20} />
                <div>
                  <p className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">Email</p>
                  <a href="mailto:jochwach@example.ac.ke" className="font-medium text-navy-deep hover:text-gold transition-colors">
                    jochwach@example.ac.ke
                  </a>
                </div>
              </div>
              <div className="flex items-start gap-4 p-5 rounded-xl border border-border hover:border-gold/60 transition-colors">
                <MapPin className="text-gold mt-1 shrink-0" size={20} />
                <div>
                  <p className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">Institution</p>
                  <p className="font-medium text-navy-deep leading-snug">
                    Mama Ngina University College<br />
                    <span className="text-sm text-muted-foreground font-normal">Dept. of Computing and Information Technology</span>
                  </p>
                </div>
              </div>
              <div>
                <p className="text-xs uppercase tracking-widest text-muted-foreground font-semibold mb-3">Profiles</p>
                <div className="flex gap-3">
                  {[
                    { Icon: Linkedin, label: "LinkedIn", href: "#" },
                    { Icon: GraduationCap, label: "Google Scholar", href: "#" },
                    { Icon: BookOpen, label: "ResearchGate", href: "#" },
                  ].map(({ Icon, label, href }) => (
                    <a key={label} href={href} aria-label={label}
                      className="w-11 h-11 rounded-lg bg-navy-deep text-cream flex items-center justify-center hover:bg-gold hover:text-navy-deep transition-colors">
                      <Icon size={18} />
                    </a>
                  ))}
                </div>
              </div>
            </div>

            <form
              className="lg:col-span-3 bg-card border border-border rounded-2xl p-6 md:p-8 space-y-5 shadow-sm"
              onSubmit={(e) => { e.preventDefault(); alert("Thank you — your message has been received."); }}
            >
              <div className="grid sm:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" required placeholder="Your full name" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" required placeholder="you@example.com" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Select>
                  <SelectTrigger id="subject"><SelectValue placeholder="Select a topic" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">General Enquiry</SelectItem>
                    <SelectItem value="student">Student Query</SelectItem>
                    <SelectItem value="research">Research Collaboration</SelectItem>
                    <SelectItem value="supervision">Supervision Interest</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Textarea id="message" required rows={6} placeholder="Write your message…" />
              </div>
              <Button type="submit" size="lg" className="w-full bg-navy-deep hover:bg-navy text-cream font-semibold">
                Send Message <ArrowRight size={16} className="ml-2" />
              </Button>
            </form>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-navy-deep text-cream pt-14 pb-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-10 pb-10 border-b border-cream/10">
            <div>
              <p className="font-serif text-xl font-bold">Dr. Jimrise Ochwach, PhD</p>
              <p className="text-gold text-sm mt-1 tracking-wider uppercase">Lecturer, Applied Mathematics</p>
              <p className="text-cream/65 text-sm mt-4 leading-relaxed">
                Applied Mathematics · Research · Teaching
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-widest text-gold font-semibold mb-4">Quick Links</p>
              <ul className="grid grid-cols-2 gap-y-2 text-sm">
                {[
                  { href: "#about", label: "About" },
                  { href: "#research", label: "Research" },
                  { href: "#publications", label: "Publications" },
                  { href: "#supervision", label: "Supervision" },
                  { href: "#resources", label: "Resources" },
                  { href: "#contact", label: "Contact" },
                ].map((l) => (
                  <li key={l.href}><a href={l.href} className="text-cream/75 hover:text-gold transition-colors">{l.label}</a></li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-xs uppercase tracking-widest text-gold font-semibold mb-4">Affiliation</p>
              <p className="text-sm text-cream/75 leading-relaxed">
                Mama Ngina University College<br />
                Dept. of Computing and Information Technology<br />
                Kenya
              </p>
            </div>
          </div>
          <div className="pt-6 flex flex-col md:flex-row justify-between gap-3 text-xs text-cream/55">
            <p>© 2024 – 2025 Dr. Jimrise Ochwach, PhD | Mama Ngina University College</p>
            <p className="italic">Applied Mathematics · Research · Teaching</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
