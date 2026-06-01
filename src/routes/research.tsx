import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { BookOpen, Presentation, ExternalLink, Award, FileText, Search, GraduationCap, ShieldCheck, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Layout, PageHeader } from "@/components/Layout";
import { grants as grantsFallback } from "@/lib/site-data";
import { useAllPublications, useSiteContent, useSupervision, type Publication } from "@/lib/content";
import { seoHead } from "@/lib/seo";

const PUBLICATIONS_PER_PAGE = 8;

export const Route = createFileRoute("/research")({
  head: () => ({
    ...seoHead({
      title: "Research & Publications - Dr. Jimrise Ochwach, PhD",
      description: "Journal articles, conference papers, research grants, and postgraduate supervision by Dr. Jimrise Ochwach in applied mathematics and mathematical modelling.",
      path: "/research",
    }),
  }),
  component: ResearchPage,
});

function ResearchPage() {
  const { data: publications = [], isLoading: publicationsLoading, error: publicationsError } = useAllPublications();
  const { data: grants } = useSiteContent<typeof grantsFallback>("grants", grantsFallback);
  const [activeTab, setActiveTab] = useState("journals");
  const shouldLoadSupervision = activeTab === "supervision";
  const phd = useSupervision("phd", shouldLoadSupervision).data ?? [];
  const mscCompleted = useSupervision("msc_completed", shouldLoadSupervision).data ?? [];
  const mscOngoing = useSupervision("msc_ongoing", shouldLoadSupervision).data ?? [];
  const [query, setQuery] = useState("");
  const [journalPage, setJournalPage] = useState(1);
  const [conferencePage, setConferencePage] = useState(1);
  const journals = useMemo(() => publications.filter((item) => item.kind === "journal"), [publications]);
  const conferences = useMemo(() => publications.filter((item) => item.kind === "conference"), [publications]);
  const filteredJournals = useMemo(() => filterPublications(journals, query), [journals, query]);
  const filteredConferences = useMemo(() => filterPublications(conferences, query), [conferences, query]);
  const journalTotalPages = getTotalPages(filteredJournals.length);
  const conferenceTotalPages = getTotalPages(filteredConferences.length);
  const pagedJournals = paginate(filteredJournals, journalPage);
  const pagedConferences = paginate(filteredConferences, conferencePage);
  const supervisionCols = [
    { label: "PhD — Ongoing", icon: GraduationCap, students: phd },
    { label: "MSc — Completed", icon: ShieldCheck, students: mscCompleted },
    { label: "MSc — Ongoing", icon: Users, students: mscOngoing },
  ];
  const supervisionCount = phd.length + mscCompleted.length + mscOngoing.length;

  return (
    <Layout plain>
      <PageHeader eyebrow="Research" title="Publications & scholarship" subtitle="Peer-reviewed journal articles, conference contributions, postgraduate supervision, and active research grants." />
      <section className="py-16 md:py-24 bg-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Tabs
            value={activeTab}
            onValueChange={(value) => {
              setActiveTab(value);
              setJournalPage(1);
              setConferencePage(1);
            }}
            className="w-full"
          >
            <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <TabsList className="!grid !h-auto w-full grid-cols-1 gap-1 bg-secondary border border-border p-1 sm:grid-cols-3 lg:w-auto lg:min-w-[640px]">
                <TabsTrigger value="journals" className="min-h-10 whitespace-normal px-3 text-center text-xs leading-tight data-[state=active]:bg-navy-deep data-[state=active]:text-cream text-navy-deep sm:text-sm">
                  <span className="sm:hidden">Journals ({filteredJournals.length})</span>
                  <span className="hidden sm:inline">Journal Articles ({filteredJournals.length})</span>
                </TabsTrigger>
                <TabsTrigger value="conferences" className="min-h-10 whitespace-normal px-3 text-center text-xs leading-tight data-[state=active]:bg-navy-deep data-[state=active]:text-cream text-navy-deep sm:text-sm">
                  <span className="sm:hidden">Conferences ({filteredConferences.length})</span>
                  <span className="hidden sm:inline">Conference Presentations ({filteredConferences.length})</span>
                </TabsTrigger>
                <TabsTrigger value="supervision" className="min-h-10 whitespace-normal px-3 text-center text-xs leading-tight data-[state=active]:bg-navy-deep data-[state=active]:text-cream text-navy-deep sm:text-sm">
                  Supervision ({supervisionCount})
                </TabsTrigger>
              </TabsList>
              <div className="relative w-full lg:max-w-sm">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={query}
                  onChange={(event) => {
                    setQuery(event.target.value);
                    setJournalPage(1);
                    setConferencePage(1);
                  }}
                  placeholder="Search articles by title, author, venue, or year"
                  className="pl-9"
                />
              </div>
            </div>

            <TabsContent value="journals" className="mt-0">
              <div className="grid md:grid-cols-2 gap-5">
                {publicationsLoading && <PublicationSkeletons />}
                {publicationsError && <PublicationError message="Journal articles could not be loaded from the backend." />}
                {!publicationsLoading && !publicationsError && pagedJournals.map((p) => (
                  <PublicationCard key={p.id} publication={p} icon="journal" />
                ))}
              </div>
              {!publicationsLoading && !publicationsError && filteredJournals.length === 0 && (
                <EmptyPublicationState text={query ? "No journal articles match your search." : "No journal articles have been added yet."} />
              )}
              {!publicationsLoading && !publicationsError && filteredJournals.length > PUBLICATIONS_PER_PAGE && (
                <PaginationControls
                  page={journalPage}
                  totalPages={journalTotalPages}
                  totalItems={filteredJournals.length}
                  onBack={() => setJournalPage((page) => Math.max(1, page - 1))}
                  onNext={() => setJournalPage((page) => Math.min(journalTotalPages, page + 1))}
                />
              )}
            </TabsContent>

            <TabsContent value="conferences" className="mt-0">
              <div className="grid md:grid-cols-2 gap-5">
                {publicationsLoading && <PublicationSkeletons />}
                {publicationsError && <PublicationError message="Conference presentations could not be loaded from the backend." />}
                {!publicationsLoading && !publicationsError && pagedConferences.map((c) => (
                  <PublicationCard key={c.id} publication={c} icon="conference" />
                ))}
              </div>
              {!publicationsLoading && !publicationsError && filteredConferences.length === 0 && (
                <EmptyPublicationState text={query ? "No conference presentations match your search." : "No conference presentations have been added yet."} />
              )}
              {!publicationsLoading && !publicationsError && filteredConferences.length > PUBLICATIONS_PER_PAGE && (
                <PaginationControls
                  page={conferencePage}
                  totalPages={conferenceTotalPages}
                  totalItems={filteredConferences.length}
                  onBack={() => setConferencePage((page) => Math.max(1, page - 1))}
                  onNext={() => setConferencePage((page) => Math.min(conferenceTotalPages, page + 1))}
                />
              )}
            </TabsContent>

            <TabsContent value="supervision" className="grid lg:grid-cols-3 gap-6 mt-0">
              {supervisionCols.map((col) => (
                <Card key={col.label} className="bg-card border-border hover:border-gold/50 hover:shadow-lg transition-all">
                  <CardContent className="pt-6 flex min-h-full flex-col">
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
                      {col.students.length === 0 && <li className="text-sm text-muted-foreground italic">No students listed.</li>}
                      {col.students.map((student) => (
                        <li key={student.id}>
                          <p className="font-semibold text-navy-deep">{student.name}</p>
                          <p className="text-sm text-foreground/75 leading-snug mt-0.5">{student.title}</p>
                          {student.school && <p className="text-xs text-muted-foreground mt-1">{student.school}</p>}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
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

function PublicationCard({ publication, icon }: { publication: Publication; icon: "journal" | "conference" }) {
  const articleUrl = getArticleUrl(publication);
  const hasPdf = Boolean(publication.pdf_url);
  const card = (
    <Card className="h-full bg-card border-border hover:border-gold/60 hover:shadow-lg transition-all group">
      <CardContent className="pt-6 flex flex-col h-full">
        <div className="flex items-start justify-between gap-3 mb-3">
          <Badge variant="outline" className="border-gold/50 text-navy-deep bg-gold/10 shrink-0">{publication.year ?? "Publication"}</Badge>
          {hasPdf ? <FileText size={16} className="text-gold" /> : icon === "journal" ? <BookOpen size={16} className="text-gold" /> : <Presentation size={16} className="text-gold" />}
        </div>
        <h3 className="font-serif text-lg font-semibold text-navy-deep leading-snug mb-2 group-hover:text-gold transition-colors">{publication.title}</h3>
        {publication.authors && <p className="text-sm text-foreground/70 mb-2">{publication.authors}</p>}
        {publication.venue && <p className="text-xs italic text-muted-foreground mb-4">{publication.venue}</p>}
        {(hasPdf || articleUrl) && (
          <div className="mt-auto pt-3 border-t border-border">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-gold group-hover:text-navy-deep uppercase tracking-wider">
              {hasPdf ? "Read PDF" : icon === "journal" ? "Open Article" : "Open Presentation"} <ExternalLink size={12} />
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );

  if (hasPdf) return <Link to="/publications/$id" params={{ id: publication.id }} className="block h-full">{card}</Link>;
  if (articleUrl) return <a href={articleUrl} target="_blank" rel="noreferrer" className="block h-full">{card}</a>;
  return <div className="h-full">{card}</div>;
}

function PublicationSkeletons() {
  return Array.from({ length: PUBLICATIONS_PER_PAGE }, (_, index) => (
    <Card key={index} className="h-44 border-border bg-card">
      <CardContent className="pt-6 space-y-4">
        <div className="h-5 w-20 rounded bg-secondary animate-pulse" />
        <div className="h-5 w-4/5 rounded bg-secondary animate-pulse" />
        <div className="h-4 w-2/3 rounded bg-secondary animate-pulse" />
        <div className="h-4 w-1/2 rounded bg-secondary animate-pulse" />
      </CardContent>
    </Card>
  ));
}

function PaginationControls({
  page,
  totalPages,
  totalItems,
  onBack,
  onNext,
}: {
  page: number;
  totalPages: number;
  totalItems: number;
  onBack: () => void;
  onNext: () => void;
}) {
  const start = (page - 1) * PUBLICATIONS_PER_PAGE + 1;
  const end = Math.min(page * PUBLICATIONS_PER_PAGE, totalItems);

  return (
    <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-t border-border pt-5">
      <p className="text-sm text-muted-foreground">
        Showing {start}-{end} of {totalItems} articles
      </p>
      <div className="flex items-center gap-2">
        <Button type="button" variant="outline" onClick={onBack} disabled={page <= 1}>
          Back
        </Button>
        <span className="min-w-20 text-center text-sm font-medium text-navy-deep">
          {page} / {totalPages}
        </span>
        <Button type="button" className="bg-navy-deep text-cream hover:bg-navy" onClick={onNext} disabled={page >= totalPages}>
          Next
        </Button>
      </div>
    </div>
  );
}

function PublicationError({ message }: { message: string }) {
  return (
    <Card className="md:col-span-2 border-destructive/30 bg-destructive/5">
      <CardContent className="py-8">
        <p className="font-semibold text-navy-deep">{message}</p>
        <p className="text-sm text-muted-foreground mt-1">Please check the Supabase publications table and public select policy.</p>
      </CardContent>
    </Card>
  );
}

function EmptyPublicationState({ text }: { text: string }) {
  return (
    <Card className="md:col-span-2 border-border bg-secondary/30">
      <CardContent className="py-10 text-center">
        <p className="text-sm text-muted-foreground">{text}</p>
      </CardContent>
    </Card>
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

function paginate<T>(items: T[], page: number) {
  const start = (page - 1) * PUBLICATIONS_PER_PAGE;
  return items.slice(start, start + PUBLICATIONS_PER_PAGE);
}

function getTotalPages(count: number) {
  return Math.max(1, Math.ceil(count / PUBLICATIONS_PER_PAGE));
}

function getArticleUrl(publication: { doi?: string | null; article_url?: string | null }) {
  const raw = (publication.article_url || publication.doi || "").trim();
  if (!raw) return "";
  if (/^https?:\/\//i.test(raw)) return raw;
  if (/^10\.\d{4,9}\//.test(raw)) return `https://doi.org/${raw}`;
  return `https://${raw}`;
}
