import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Megaphone, BookOpen, Download, Clock, Calendar, FileText, FileType, Presentation } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Layout, PageHeader } from "@/components/Layout";
import { courses } from "@/lib/site-data";
import { useAnnouncements, useResources } from "@/lib/content";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/resources")({
  head: () => ({
    meta: [
      { title: "Student Resources — Dr. Jimrise Ochwach" },
      { name: "description", content: "Lecture notes, past papers, assignments and announcements for students." },
    ],
  }),
  component: ResourcesPage,
});

function ResourcesPage() {
  const [filter, setFilter] = useState<string>("All");
  const { data: announcementsData } = useAnnouncements();
  const { data: resourcesData } = useResources();
  const announcements = announcementsData ?? [];
  const resources = resourcesData ?? [];

  const courseFilters = ["All", ...Array.from(new Set(resources.map((r) => r.course)))];
  const filtered = filter === "All" ? resources : resources.filter((r) => r.course === filter);
  const fileIcon = (t: string) => (t === "PPT" ? Presentation : t === "DOC" ? FileType : FileText);

  return (
    <Layout plain>
      <PageHeader eyebrow="For Students" title="Resources for Students" subtitle="Access lecture notes, past papers, assignments, and important announcements." />
      <section className="py-16 md:py-24 bg-gradient-to-b from-secondary/60 to-secondary/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

          <div className="mb-14">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-gold flex items-center justify-center">
                <Megaphone size={20} className="text-navy-deep" />
              </div>
              <h2 className="font-serif text-2xl md:text-3xl font-bold text-navy-deep">Announcements</h2>
            </div>
            <div className="grid md:grid-cols-3 gap-5">
              {announcements.length === 0 && <p className="text-muted-foreground italic">No announcements right now.</p>}
              {announcements.map((a) => (
                <Card key={a.id} className="border-l-4 border-l-gold hover:shadow-lg transition-shadow">
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

          <div className="mb-14">
            <h2 className="font-serif text-2xl md:text-3xl font-bold text-navy-deep mb-6">Courses I Teach</h2>
            <div className="grid md:grid-cols-3 gap-5">
              {courses.map((c) => (
                <Card key={c.name} className="group bg-navy-deep text-cream border-navy-deep hover:bg-navy transition-colors overflow-hidden relative">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gold/10 rounded-full blur-3xl" />
                  <CardContent className="pt-6 relative">
                    <BookOpen size={22} className="text-gold mb-4" />
                    <h4 className="font-serif text-xl font-bold mb-2">{c.name}</h4>
                    <p className="text-sm text-cream/70 leading-relaxed">{c.desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <div className="mb-14">
            <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
              <h2 className="font-serif text-2xl md:text-3xl font-bold text-navy-deep">Resource Library</h2>
              <div className="flex flex-wrap gap-2">
                {courseFilters.map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={cn(
                      "px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-colors",
                      filter === f ? "bg-navy-deep text-cream border-navy-deep" : "bg-background text-foreground border-border hover:border-gold"
                    )}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map((r) => {
                const Icon = fileIcon(r.type);
                return (
                  <Card key={r.id} className="hover:shadow-lg hover:border-gold/50 transition-all">
                    <CardContent className="pt-5">
                      <div className="flex items-start gap-4">
                        <div className="w-11 h-11 rounded-lg bg-gold/15 flex items-center justify-center shrink-0">
                          <Icon size={20} className="text-gold" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-navy-deep leading-snug">{r.title}</p>
                          <div className="flex items-center flex-wrap gap-x-3 gap-y-1 mt-2 text-xs text-muted-foreground">
                            <span className="text-gold font-semibold">{r.course}</span>
                            <span>·</span><span>{r.type}</span><span>·</span><span>{r.date}</span>
                          </div>
                        </div>
                      </div>
                      <Button asChild size="sm" variant="outline" className="w-full mt-4 border-navy/20 hover:bg-navy-deep hover:text-cream hover:border-navy-deep" disabled={!r.file_url}>
                        <a href={r.file_url || "#"} target="_blank" rel="noreferrer">
                          <Download size={14} className="mr-2" /> {r.file_url ? "Download" : "Coming soon"}
                        </a>
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          <Card className="bg-navy-deep text-cream border-navy-deep overflow-hidden">
            <CardContent className="p-8 md:p-10 grid md:grid-cols-3 gap-6 items-center">
              <div className="md:col-span-2">
                <div className="flex items-center gap-3 mb-3">
                  <Clock size={20} className="text-gold" />
                  <p className="text-xs uppercase tracking-[0.2em] text-gold font-semibold">Office Hours</p>
                </div>
                <h3 className="font-serif text-2xl md:text-3xl font-bold mb-2">Have a question? Drop by.</h3>
                <p className="text-cream/75 leading-relaxed">In-person consultations are open during the week. Email ahead for slots outside these times.</p>
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
    </Layout>
  );
}
