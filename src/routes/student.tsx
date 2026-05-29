import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect } from "react";
import { Layout, PageHeader } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Megaphone, BookOpen } from "lucide-react";
import { useAuth, useUserRole } from "@/hooks/use-auth";
import { useAnnouncements, useResources } from "@/lib/content";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/student")({
  head: () => ({ meta: [{ title: "Student Dashboard" }] }),
  component: StudentPage,
});

function StudentPage() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const { data: role } = useUserRole(user);
  const { data: announcements } = useAnnouncements();
  const { data: resources } = useResources();

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth" });
  }, [loading, user, navigate]);

  if (!user) return null;
  const items = announcements ?? [];
  const files = resources ?? [];

  return (
    <Layout plain>
      <PageHeader eyebrow={`Welcome, ${user.email}`} title="Student Dashboard" subtitle="Latest announcements and resources from Dr. Ochwach." />
      <section className="py-12 bg-secondary/30">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="flex justify-end gap-2">
            {role === "admin" && <Button asChild variant="outline"><Link to="/admin">Admin dashboard</Link></Button>}
            <Button variant="outline" onClick={async () => { await supabase.auth.signOut(); navigate({ to: "/" }); }}>Sign out</Button>
          </div>

          <div>
            <h2 className="font-serif text-2xl font-bold text-navy-deep mb-5 flex items-center gap-2"><Megaphone className="text-gold" size={22} /> Announcements</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {items.length === 0 && <p className="text-muted-foreground italic">No announcements.</p>}
              {items.map((a) => (
                <Card key={a.id} className="border-l-4 border-l-gold">
                  <CardHeader className="pb-2"><p className="text-xs uppercase tracking-wider text-gold font-bold">{a.date}</p><CardTitle className="text-base">{a.title}</CardTitle></CardHeader>
                  <CardContent><p className="text-sm text-foreground/75">{a.body}</p></CardContent>
                </Card>
              ))}
            </div>
          </div>

          <div>
            <h2 className="font-serif text-2xl font-bold text-navy-deep mb-5 flex items-center gap-2"><BookOpen className="text-gold" size={22} /> Resources</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {files.map((r) => (
                <Card key={r.id}>
                  <CardContent className="pt-5">
                    <p className="font-semibold text-navy-deep">{r.title}</p>
                    <p className="text-xs text-muted-foreground mt-1">{r.course} · {r.type} · {r.date}</p>
                    <Button asChild size="sm" variant="outline" className="w-full mt-3" disabled={!r.file_url}>
                      <a href={r.file_url || "#"} target="_blank" rel="noreferrer"><Download size={14} className="mr-2" />{r.file_url ? "Download" : "Coming soon"}</a>
                    </Button>
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
