import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Download, Megaphone, BookOpen, LayoutDashboard, Search, FileText, ShieldCheck,
} from "lucide-react";
import { useAuth, useUserRole } from "@/hooks/use-auth";
import { useAnnouncements, useResources } from "@/lib/content";
import { DashboardShell, type DashboardNavItem } from "@/components/DashboardShell";

export const Route = createFileRoute("/student")({
  head: () => ({ meta: [{ title: "Student Dashboard" }] }),
  component: StudentPage,
});

const NAV: DashboardNavItem[] = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "announcements", label: "Announcements", icon: Megaphone },
  { id: "resources", label: "Resources", icon: BookOpen },
];

function StudentPage() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const { data: role } = useUserRole(user);
  const { data: announcements } = useAnnouncements();
  const { data: resources } = useResources();
  const [active, setActive] = useState("overview");
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth" });
  }, [loading, user, navigate]);

  if (!user) return null;
  const items = announcements ?? [];
  const files = resources ?? [];

  const filteredFiles = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return files;
    return files.filter((r) =>
      [r.title, r.course, r.type].filter(Boolean).some((v) => String(v).toLowerCase().includes(q))
    );
  }, [files, query]);

  const activeMeta = NAV.find((n) => n.id === active);

  const nav: DashboardNavItem[] = role === "admin"
    ? [...NAV, { id: "admin-link", label: "Admin Panel", icon: ShieldCheck }]
    : NAV;

  const onSelect = (id: string) => {
    if (id === "admin-link") navigate({ to: "/admin" });
    else setActive(id);
  };

  return (
    <DashboardShell
      roleLabel="Student"
      title={activeMeta?.label ?? "Dashboard"}
      subtitle="Latest announcements and learning resources"
      userEmail={user.email ?? undefined}
      nav={nav}
      active={active}
      onSelect={onSelect}
    >
      {active === "overview" && (
        <div className="space-y-6">
          <div className="grid sm:grid-cols-3 gap-4">
            <StatCard label="Announcements" value={items.length} icon={Megaphone} />
            <StatCard label="Resources" value={files.length} icon={BookOpen} />
            <StatCard label="Files" value={files.filter((f) => f.file_url).length} icon={FileText} />
          </div>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2"><Megaphone size={16} className="text-gold" /> Recent announcements</CardTitle>
              <Button size="sm" variant="ghost" onClick={() => setActive("announcements")}>View all</Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {items.slice(0, 3).map((a) => (
                <div key={a.id} className="border-l-2 border-gold pl-3">
                  <p className="text-[10px] uppercase tracking-wider text-gold font-bold">{a.date}</p>
                  <p className="font-semibold text-navy-deep text-sm">{a.title}</p>
                  <p className="text-sm text-muted-foreground line-clamp-2">{a.body}</p>
                </div>
              ))}
              {items.length === 0 && <p className="text-sm text-muted-foreground italic">No announcements yet.</p>}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2"><BookOpen size={16} className="text-gold" /> Latest resources</CardTitle>
              <Button size="sm" variant="ghost" onClick={() => setActive("resources")}>Browse all</Button>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-2 gap-3">
                {files.slice(0, 4).map((r) => (
                  <ResourceCard key={r.id} r={r} />
                ))}
                {files.length === 0 && <p className="text-sm text-muted-foreground italic">No resources yet.</p>}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {active === "announcements" && (
        <div className="grid md:grid-cols-2 gap-4">
          {items.length === 0 && <p className="text-muted-foreground italic">No announcements.</p>}
          {items.map((a) => (
            <Card key={a.id} className="border-l-4 border-l-gold">
              <CardHeader className="pb-2">
                <p className="text-xs uppercase tracking-wider text-gold font-bold">{a.date}</p>
                <CardTitle className="text-base">{a.title}</CardTitle>
              </CardHeader>
              <CardContent><p className="text-sm text-foreground/75 whitespace-pre-line">{a.body}</p></CardContent>
            </Card>
          ))}
        </div>
      )}

      {active === "resources" && (
        <div className="space-y-4">
          <div className="relative max-w-md">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by title, course, or type…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredFiles.map((r) => <ResourceCard key={r.id} r={r} />)}
            {filteredFiles.length === 0 && <p className="text-sm text-muted-foreground italic col-span-full">No resources match your search.</p>}
          </div>
        </div>
      )}
    </DashboardShell>
  );
}

function StatCard({ label, value, icon: Icon }: { label: string; value: number; icon: any }) {
  return (
    <Card>
      <CardContent className="pt-5 flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">{label}</p>
          <p className="font-serif text-3xl font-bold text-navy-deep mt-1">{value}</p>
        </div>
        <div className="w-10 h-10 rounded-full bg-gold/15 text-gold flex items-center justify-center">
          <Icon size={18} />
        </div>
      </CardContent>
    </Card>
  );
}

function ResourceCard({ r }: { r: any }) {
  return (
    <Card>
      <CardContent className="pt-5">
        <p className="font-semibold text-navy-deep">{r.title}</p>
        <p className="text-xs text-muted-foreground mt-1">{r.course} · {r.type} · {r.date}</p>
        <Button asChild size="sm" variant="outline" className="w-full mt-3" disabled={!r.file_url}>
          <a href={r.file_url || "#"} target="_blank" rel="noreferrer">
            <Download size={14} className="mr-2" />{r.file_url ? "Download" : "Coming soon"}
          </a>
        </Button>
      </CardContent>
    </Card>
  );
}
