import { createFileRoute } from "@tanstack/react-router";
import { GraduationCap, ShieldCheck, Users } from "lucide-react";
import { Layout, PageHeader } from "@/components/Layout";
import { useSupervision } from "@/lib/content";

export const Route = createFileRoute("/supervision")({
  head: () => ({
    meta: [
      { title: "Student Supervision — Dr. Jimrise Ochwach" },
      { name: "description", content: "PhD and MSc students supervised, ongoing and completed." },
    ],
  }),
  component: SupPage,
});

function SupPage() {
  const phd = useSupervision("phd").data;
  const mscC = useSupervision("msc_completed").data;
  const mscO = useSupervision("msc_ongoing").data;

  const cols = [
    { label: "PhD — Ongoing", icon: GraduationCap, students: phd },
    { label: "MSc — Completed", icon: ShieldCheck, students: mscC },
    { label: "MSc — Ongoing", icon: Users, students: mscO },
  ];

  return (
    <Layout plain>
      <PageHeader eyebrow="Mentorship" title="Student supervision" subtitle="Postgraduate students I have supervised or am currently co-supervising." />
      <section className="py-16 md:py-24 bg-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-3 gap-6">
            {cols.map((col) => (
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
                  {col.students.length === 0 && <li className="text-sm text-muted-foreground italic">No students listed.</li>}
                  {col.students.map((s) => (
                    <li key={s.id} className="group">
                      <p className="font-semibold text-navy-deep">{s.name}</p>
                      <p className="text-sm text-foreground/75 leading-snug mt-0.5">{s.title}</p>
                      {s.school && <p className="text-xs text-muted-foreground mt-1">{s.school}</p>}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
}
