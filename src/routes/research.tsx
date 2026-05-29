import { createFileRoute } from "@tanstack/react-router";
import { BookOpen, Presentation, ExternalLink, Award } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Layout, PageHeader } from "@/components/Layout";
import { grants } from "@/lib/site-data";
import { usePublications } from "@/lib/content";

export const Route = createFileRoute("/research")({
  head: () => ({
    meta: [
      { title: "Research & Publications — Dr. Jimrise Ochwach" },
      { name: "description", content: "Journal articles, conference papers, and active research grants." },
    ],
  }),
  component: ResearchPage,
});

function ResearchPage() {
  const { data: journals } = usePublications("journal");
  const { data: conferences } = usePublications("conference");

  return (
    <Layout plain>
      <PageHeader eyebrow="Research" title="Publications & scholarship" subtitle="Peer-reviewed journal articles, conference contributions, and active research grants." />
      <section className="py-16 md:py-24 bg-navy-deep text-cream relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(201,168,76,0.1),transparent_60%)]" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Tabs defaultValue="journals" className="w-full">
            <TabsList className="bg-cream/10 border border-cream/15 mb-8">
              <TabsTrigger value="journals" className="data-[state=active]:bg-gold data-[state=active]:text-navy-deep text-cream">
                Journal Articles ({journals.length})
              </TabsTrigger>
              <TabsTrigger value="conferences" className="data-[state=active]:bg-gold data-[state=active]:text-navy-deep text-cream">
                Conference Presentations ({conferences.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="journals" className="grid md:grid-cols-2 gap-5 mt-0">
              {journals.map((p) => (
                <Card key={p.id} className="bg-cream/5 border-cream/10 hover:border-gold/50 transition-all group">
                  <CardContent className="pt-6 flex flex-col h-full">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <Badge variant="outline" className="border-gold/40 text-gold bg-transparent shrink-0">{p.year}</Badge>
                      <BookOpen size={16} className="text-gold/60" />
                    </div>
                    <h3 className="font-serif text-lg font-semibold text-cream leading-snug mb-2 group-hover:text-gold-soft transition-colors">{p.title}</h3>
                    {p.authors && <p className="text-sm text-cream/65 mb-2">{p.authors}</p>}
                    {p.venue && <p className="text-xs italic text-cream/50 mb-4">{p.venue}</p>}
                    {p.doi && (
                      <div className="mt-auto pt-3 border-t border-cream/10">
                        <a href={p.doi} className="inline-flex items-center gap-1.5 text-xs font-semibold text-gold hover:text-gold-soft uppercase tracking-wider">
                          DOI / Read <ExternalLink size={12} />
                        </a>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="conferences" className="grid md:grid-cols-2 gap-5 mt-0">
              {conferences.map((c) => (
                <Card key={c.id} className="bg-cream/5 border-cream/10 hover:border-gold/50 transition-all">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <Badge variant="outline" className="border-gold/40 text-gold bg-transparent">{c.year}</Badge>
                      <Presentation size={16} className="text-gold/60" />
                    </div>
                    <h3 className="font-serif text-lg font-semibold text-cream leading-snug mb-2">{c.title}</h3>
                    {c.venue && <p className="text-sm text-cream/65 italic">{c.venue}</p>}
                  </CardContent>
                </Card>
              ))}
            </TabsContent>
          </Tabs>

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
    </Layout>
  );
}
