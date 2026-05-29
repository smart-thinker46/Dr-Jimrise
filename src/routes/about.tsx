import { createFileRoute } from "@tanstack/react-router";
import { Globe, Languages, Code2, Award, ExternalLink, Briefcase } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Layout, PageHeader } from "@/components/Layout";
import { education, certifications, memberships, experience, leadership } from "@/lib/site-data";
import { useSiteContent, aboutFallback, type AboutContent } from "@/lib/content";
import professorPhoto from "@/assets/professor.jpg";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — Dr. Jimrise Ochwach" },
      { name: "description", content: "Biography, education, and credentials of Dr. Jimrise Ochwach, Applied Mathematics lecturer." },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  const { data: about } = useSiteContent<AboutContent>("about", aboutFallback);
  const photo = about.photo_url || professorPhoto;

  return (
    <Layout plain>
      <PageHeader eyebrow="About" title="A mathematician working on problems that matter." />
      <section className="py-16 md:py-24 bg-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-12 gap-12 items-start">
            <div className="lg:col-span-4">
              <img src={photo} alt="Dr. Jimrise Ochwach" className="w-full aspect-[4/5] object-cover rounded-xl shadow-xl" />
            </div>
            <div className="lg:col-span-8 space-y-8">
              <p className="text-lg leading-relaxed text-foreground/85 whitespace-pre-line">{about.bio}</p>
              <div className="grid sm:grid-cols-3 gap-4">
                {[
                  { icon: Globe, label: "Nationality", value: "Kenyan" },
                  { icon: Languages, label: "Languages", value: "English · Kiswahili · Luo" },
                  { icon: Code2, label: "Programming", value: "Python · R · SQL · MATLAB · LaTeX" },
                ].map((c) => (
                  <Card key={c.label} className="border-border/60 hover:border-gold/60 transition-all">
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
                    <Badge key={t} variant="outline" className="border-navy/20 bg-navy/5 text-navy-deep px-3 py-1.5 text-sm font-medium">{t}</Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-secondary/40">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-navy-deep mb-10">Education</h2>
          <div className="space-y-5">
            {education.map((e, i) => (
              <Card key={i} className="border-l-4 border-l-gold hover:shadow-xl transition-shadow">
                <CardHeader className="pb-3">
                  <p className="text-gold text-xs font-bold tracking-widest uppercase">{e.period}</p>
                  <CardTitle className="font-serif text-xl text-navy-deep mt-1">{e.degree}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="font-medium text-foreground">{e.school}</p>
                  {e.detail && <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{e.detail}</p>}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-navy-deep mb-10">Certifications & Memberships</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-12">
            {certifications.map((c) => (
              <a key={c.title} href={c.link} target="_blank" rel="noreferrer" className="group">
                <Card className="h-full border-border hover:border-gold hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                  <CardContent className="pt-6 flex flex-col h-full">
                    <Award size={22} className="text-gold mb-4" />
                    <h3 className="font-serif font-semibold text-navy-deep leading-snug">{c.title}</h3>
                    <p className="text-xs text-muted-foreground mt-2 flex-1">{c.issuer}</p>
                    <span className="text-xs font-semibold text-gold mt-3 inline-flex items-center gap-1">View <ExternalLink size={11} /></span>
                  </CardContent>
                </Card>
              </a>
            ))}
          </div>
          <div className="bg-navy-deep text-cream rounded-2xl p-8 md:p-10">
            <p className="text-xs uppercase tracking-[0.2em] text-gold font-semibold mb-4">Professional Memberships</p>
            <div className="flex flex-wrap gap-3">
              {memberships.map((m) => (
                <Badge key={m} className="bg-cream/10 hover:bg-gold hover:text-navy-deep text-cream border border-cream/15 px-4 py-2 text-sm font-medium">{m}</Badge>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-secondary/40">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-navy-deep mb-10">Experience</h2>
          <Accordion type="multiple" defaultValue={["item-0"]} className="space-y-3">
            {experience.map((x, i) => (
              <AccordionItem key={i} value={`item-${i}`} className="border border-border rounded-xl bg-card px-5 hover:border-gold/60 transition-colors data-[state=open]:border-gold/60">
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
                      <li key={j} className="flex gap-3 text-sm text-foreground/80"><span className="text-gold mt-1.5">•</span><span className="leading-relaxed">{b}</span></li>
                    ))}
                  </ul>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-background">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-navy-deep mb-10">Leadership & Service</h2>
          <Accordion type="multiple" defaultValue={["lead-0"]} className="space-y-3">
            {leadership.map((g, i) => (
              <AccordionItem key={i} value={`lead-${i}`} className="border border-border rounded-xl bg-card px-5">
                <AccordionTrigger className="hover:no-underline"><span className="font-serif text-lg font-semibold text-navy-deep">{g.org}</span></AccordionTrigger>
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
    </Layout>
  );
}
