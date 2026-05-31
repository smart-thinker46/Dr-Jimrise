import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { BookOpen, Presentation, ExternalLink, Award, FileText, Search } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Layout, PageHeader } from "@/components/Layout";
import { grants as grantsFallback } from "@/lib/site-data";
import { usePublications, useSiteContent } from "@/lib/content";

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
  const { data: journalsData } = usePublications("journal");
  const { data: conferencesData } = usePublications("conference");
  const { data: grants } = useSiteContent<typeof grantsFallback>("grants", grantsFallback);
  const [query, setQuery] = useState("");
  const journals = journalsData ?? [];
  const conferences = conferencesData ?? [];
  const filteredJournals = useMemo(() => filterPublications(journals, query), [journals, query]);
  const filteredConferences = useMemo(() => filterPublications(conferences, query), [conferences, query]);

  return (
    <Layout plain>
      <PageHeader eyebrow="Research" title="Publications & scholarship" subtitle="Peer-reviewed journal articles, conference contributions, and active research grants." />
      <section className="py-16 md:py-24 bg-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Tabs defaultValue="journals" className="w-full">
            <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <TabsList className="bg-secondary border border-border">
                <TabsTrigger value="journals" className="data-[state=active]:bg-navy-deep data-[state=active]:text-cream text-navy-deep">
                  Journal Articles ({filteredJournals.length})
                </TabsTrigger>
                <TabsTrigger value="conferences" className="data-[state=active]:bg-navy-deep data-[state=active]:text-cream text-navy-deep">
                  Conference Presentations ({filteredConferences.length})
                </TabsTrigger>
              </TabsList>
              <div className="relative w-full lg:max-w-sm">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search articles by title, author, venue, or year"
                  className="pl-9"
                />
              </div>
            </div>

            <TabsContent value="journals" className="grid md:grid-cols-2 gap-5 mt-0">
              {filteredJournals.map((p) => {
                const articleUrl = getArticleUrl(p);
                const hasPdf = Boolean((p as any).pdf_url);
                const card = (
                  <Card className="h-full bg-card border-border hover:border-gold/60 hover:shadow-lg transition-all group">
                    <CardContent className="pt-6 flex flex-col h-full">
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <Badge variant="outline" className="border-gold/50 text-navy-deep bg-gold/10 shrink-0">{p.year}</Badge>
                        {hasPdf ? <FileText size={16} className="text-gold" /> : <BookOpen size={16} className="text-gold" />}
                      </div>
                      <h3 className="font-serif text-lg font-semibold text-navy-deep leading-snug mb-2 group-hover:text-gold transition-colors">{p.title}</h3>
                      {p.authors && <p className="text-sm text-foreground/70 mb-2">{p.authors}</p>}
                      {p.venue && <p className="text-xs italic text-muted-foreground mb-4">{p.venue}</p>}
                      {(hasPdf || articleUrl) && (
                        <div className="mt-auto pt-3 border-t border-border">
                          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-gold group-hover:text-navy-deep uppercase tracking-wider">
                            {hasPdf ? "Read PDF" : "Open Article"} <ExternalLink size={12} />
                          </span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );

                if (hasPdf) {
                  return (
                    <Link key={p.id} to="/publications/$id" params={{ id: p.id }} className="block h-full">
                      {card}
                    </Link>
                  );
                }

                return articleUrl ? (
                  <a key={p.id} href={articleUrl} target="_blank" rel="noreferrer" className="block h-full">
                    {card}
                  </a>
                ) : (
                  <div key={p.id} className="h-full">{card}</div>
                );
              })}
            </TabsContent>

            <TabsContent value="conferences" className="grid md:grid-cols-2 gap-5 mt-0">
              {filteredConferences.map((c) => {
                const articleUrl = getArticleUrl(c);
                const hasPdf = Boolean((c as any).pdf_url);
                const card = (
                  <Card className="h-full bg-card border-border hover:border-gold/60 hover:shadow-lg transition-all group">
                    <CardContent className="pt-6 flex flex-col h-full">
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <Badge variant="outline" className="border-gold/50 text-navy-deep bg-gold/10">{c.year}</Badge>
                        {hasPdf ? <FileText size={16} className="text-gold" /> : <Presentation size={16} className="text-gold" />}
                      </div>
                      <h3 className="font-serif text-lg font-semibold text-navy-deep leading-snug mb-2 group-hover:text-gold transition-colors">{c.title}</h3>
                      {c.authors && <p className="text-sm text-foreground/70 mb-2">{c.authors}</p>}
                      {c.venue && <p className="text-sm text-muted-foreground italic mb-4">{c.venue}</p>}
                      {(hasPdf || articleUrl) && (
                        <div className="mt-auto pt-3 border-t border-border">
                          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-gold group-hover:text-navy-deep uppercase tracking-wider">
                            {hasPdf ? "Read PDF" : "Open Presentation"} <ExternalLink size={12} />
                          </span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
                if (hasPdf) return <Link key={c.id} to="/publications/$id" params={{ id: c.id }} className="block h-full">{card}</Link>;
                if (articleUrl) return <a key={c.id} href={articleUrl} target="_blank" rel="noreferrer" className="block h-full">{card}</a>;
                return <div key={c.id} className="h-full">{card}</div>;
              })}
            </TabsContent>
          </Tabs>
        </div>
      </section>

      <section className="py-16 md:py-20 bg-secondary/40 border-y border-border">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h3 className="font-serif text-2xl md:text-3xl font-bold text-navy-deep mb-2">Research Grants</h3>
            <p className="text-muted-foreground">Currently funded projects.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {grants.map((g, i) => (
              <Card key={i} className="bg-background border-gold/30 hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 mb-3">
                    <Award className="text-gold" size={20} />
                    <Badge className="bg-gold text-navy-deep hover:bg-gold">{g.role}</Badge>
                  </div>
                  <h4 className="font-serif text-lg font-semibold text-navy-deep mb-4 leading-snug">{g.title}</h4>
                  <div className="flex items-center justify-between text-sm pt-4 border-t border-border">
                    <span className="text-gold font-bold">{g.amount}</span>
                    <span className="text-muted-foreground">{g.period}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
}

function filterPublications<T extends { title?: string | null; authors?: string | null; venue?: string | null; year?: number | null }>(items: T[], query: string) {
  const q = query.trim().toLowerCase();
  if (!q) return items;
  return items.filter((item) =>
    [item.title, item.authors, item.venue, item.year?.toString()]
      .filter(Boolean)
      .some((value) => String(value).toLowerCase().includes(q))
  );
}

function getArticleUrl(publication: { doi?: string | null; article_url?: string | null }) {
  const raw = (publication.article_url || publication.doi || "").trim();
  if (!raw) return "";
  if (/^https?:\/\//i.test(raw)) return raw;
  if (/^10\.\d{4,9}\//.test(raw)) return `https://doi.org/${raw}`;
  return `https://${raw}`;
}
