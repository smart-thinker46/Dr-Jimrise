import { createFileRoute } from "@tanstack/react-router";
import { Briefcase } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Layout, PageHeader } from "@/components/Layout";
import { experience, leadership } from "@/lib/site-data";

export const Route = createFileRoute("/experience")({
  head: () => ({
    meta: [
      { title: "Experience — Dr. Jimrise Ochwach" },
      { name: "description", content: "Teaching, professional roles, leadership, and service." },
    ],
  }),
  component: ExperiencePage,
});

function ExperiencePage() {
  return (
    <Layout plain>
      <PageHeader eyebrow="Experience" title="Teaching & professional roles" />
      <section className="py-16 md:py-24 bg-background">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
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

      <section className="py-16 md:py-24 bg-secondary/40">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-navy-deep mb-10">Leadership & Service</h2>
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
    </Layout>
  );
}
