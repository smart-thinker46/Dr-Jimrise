import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Trash2, Save, Plus, ShieldCheck, User, Info, Mail, Megaphone, FolderOpen, BookOpen, Users,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth, useUserRole } from "@/hooks/use-auth";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { DashboardShell, type DashboardNavItem } from "@/components/DashboardShell";
import { ResourcesAdmin } from "@/components/admin/ResourcesAdmin";
import { heroFallback, aboutFallback, contactFallback } from "@/lib/content";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Admin Dashboard" }] }),
  component: AdminPage,
});

const NAV: DashboardNavItem[] = [
  { id: "hero", label: "Hero", icon: User },
  { id: "about", label: "About", icon: Info },
  { id: "contact", label: "Contact", icon: Mail },
  { id: "announcements", label: "Announcements", icon: Megaphone },
  { id: "resources", label: "Resources", icon: FolderOpen },
  { id: "publications", label: "Publications", icon: BookOpen },
  { id: "supervision", label: "Supervision", icon: Users },
];

function AdminPage() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const { data: role, isLoading: roleLoading, refetch } = useUserRole(user);
  const [active, setActive] = useState("hero");

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth" });
  }, [loading, user, navigate]);

  if (loading || !user) return null;

  if (roleLoading) {
    return <div className="py-20 text-center text-muted-foreground">Checking permissions…</div>;
  }

  if (role !== "admin") {
    return (
      <div className="min-h-screen bg-secondary/30 flex items-center justify-center px-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 space-y-4 text-sm">
            <h2 className="font-serif text-xl font-bold text-navy-deep">Admin access required</h2>
            <p>You are signed in as <strong>{user.email}</strong> but don't have admin privileges.</p>
            <p className="text-muted-foreground">If no admin has been set up yet, you can claim the role (this only works for the very first admin).</p>
            <Button className="w-full bg-gold text-navy-deep hover:bg-gold-soft" onClick={async () => {
              const { data, error } = await supabase.rpc("bootstrap_admin");
              if (error) toast.error(error.message);
              else if (data) { toast.success("You are now admin!"); refetch(); }
              else toast.error("An admin already exists.");
            }}><ShieldCheck size={16} className="mr-2" /> Claim admin role</Button>
            <Button variant="outline" className="w-full" asChild><Link to="/student">Go to student dashboard</Link></Button>
            <Button variant="ghost" className="w-full" asChild><Link to="/">Back to site</Link></Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const activeMeta = NAV.find((n) => n.id === active);

  return (
    <DashboardShell
      roleLabel="Admin"
      title={activeMeta?.label ?? "Dashboard"}
      subtitle="Manage site content, announcements, resources, publications & supervision"
      userEmail={user.email ?? undefined}
      nav={NAV}
      active={active}
      onSelect={setActive}
    >
      {active === "hero" && (
        <SiteContentEditor sectionKey="hero" fallback={heroFallback} fields={[
          { name: "name", label: "Name" }, { name: "tagline", label: "Tagline" }, { name: "role", label: "Role" },
          { name: "institution", label: "Institution" }, { name: "quote", label: "Quote", textarea: true },
        ]} imageField="photo_url" imageBucket="public-assets" />
      )}
      {active === "about" && (
        <SiteContentEditor sectionKey="about" fallback={aboutFallback} fields={[
          { name: "bio", label: "Biography", textarea: true, rows: 8 },
        ]} imageField="photo_url" imageBucket="public-assets" />
      )}
      {active === "contact" && (
        <SiteContentEditor sectionKey="contact" fallback={contactFallback} fields={[
          { name: "email", label: "Email" }, { name: "institution_line1", label: "Institution Line 1" },
          { name: "institution_line2", label: "Institution Line 2" }, { name: "linkedin", label: "LinkedIn URL" },
          { name: "scholar", label: "Google Scholar URL" }, { name: "researchgate", label: "ResearchGate URL" },
        ]} />
      )}
      {active === "announcements" && <AnnouncementsAdmin />}
      {active === "resources" && <ResourcesAdmin />}
      {active === "publications" && <PublicationsAdmin />}
      {active === "supervision" && <SupervisionAdmin />}
    </DashboardShell>
  );
}

// ---------- Site content editor ----------
type FieldDef = { name: string; label: string; textarea?: boolean; rows?: number };

function SiteContentEditor<T extends Record<string, unknown>>({
  sectionKey, fallback, fields, imageField, imageBucket,
}: { sectionKey: string; fallback: T; fields: FieldDef[]; imageField?: string; imageBucket?: string }) {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["site_content_edit", sectionKey],
    queryFn: async () => {
      const { data } = await supabase.from("site_content").select("value").eq("key", sectionKey).maybeSingle();
      return ((data?.value as T) ?? fallback);
    },
  });
  const [form, setForm] = useState<Record<string, unknown>>({});
  const [uploading, setUploading] = useState(false);
  useEffect(() => { if (data) setForm(data as Record<string, unknown>); }, [data]);

  const save = async () => {
    const { error } = await supabase.from("site_content").upsert({ key: sectionKey, value: form as never });
    if (error) return toast.error(error.message);
    toast.success("Saved");
    qc.invalidateQueries({ queryKey: ["site_content", sectionKey] });
  };

  const upload = async (file: File) => {
    if (!imageField || !imageBucket) return;
    setUploading(true);
    const path = `${sectionKey}/${Date.now()}-${file.name}`;
    const { error } = await supabase.storage.from(imageBucket).upload(path, file, { upsert: true });
    if (error) { setUploading(false); return toast.error(error.message); }
    const { data: pub } = supabase.storage.from(imageBucket).getPublicUrl(path);
    setForm((f) => ({ ...f, [imageField]: pub.publicUrl }));
    setUploading(false);
    toast.success("Image uploaded — remember to Save.");
  };

  if (isLoading) return <p className="py-10 text-muted-foreground">Loading…</p>;

  return (
    <Card><CardContent className="pt-6 space-y-4">
      {fields.map((f) => (
        <div key={f.name}>
          <Label>{f.label}</Label>
          {f.textarea
            ? <Textarea rows={f.rows ?? 4} value={(form[f.name] as string) ?? ""} onChange={(e) => setForm({ ...form, [f.name]: e.target.value })} />
            : <Input value={(form[f.name] as string) ?? ""} onChange={(e) => setForm({ ...form, [f.name]: e.target.value })} />}
        </div>
      ))}
      {imageField && (
        <div>
          <Label>Image</Label>
          {(form[imageField] as string) && <img src={form[imageField] as string} alt="" className="w-32 h-40 object-cover rounded mb-2" />}
          <Input type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])} disabled={uploading} />
        </div>
      )}
      <Button onClick={save} className="bg-navy-deep hover:bg-navy text-cream"><Save size={16} className="mr-2" />Save</Button>
    </CardContent></Card>
  );
}

// ---------- Generic list CRUD ----------
function useList(table: string, eqCol?: string, eqVal?: string) {
  return useQuery({
    queryKey: ["admin", table, eqCol, eqVal],
    queryFn: async () => {
      let q = supabase.from(table as any).select("*").order("sort_order", { ascending: true });
      if (eqCol && eqVal) q = q.eq(eqCol, eqVal);
      const { data } = await q;
      return data ?? [];
    },
  });
}

function ListSection({ title, children, onAdd, headerActions }: { title: string; children: React.ReactNode; onAdd?: () => void; headerActions?: React.ReactNode }) {
  return (
    <Card><CardContent className="pt-6">
      <div className="flex justify-between items-center mb-4 gap-3 flex-wrap">
        <h3 className="font-serif text-xl font-semibold text-navy-deep">{title}</h3>
        <div className="flex gap-2 flex-wrap">
          {headerActions}
          {onAdd && <Button size="sm" onClick={onAdd} className="bg-gold text-navy-deep hover:bg-gold-soft"><Plus size={14} className="mr-1" />Add</Button>}
        </div>
      </div>
      <div className="space-y-3">{children}</div>
    </CardContent></Card>
  );
}

function AnnouncementsAdmin() {
  const qc = useQueryClient();
  const { data } = useList("announcements");
  const invalidate = () => { qc.invalidateQueries({ queryKey: ["admin", "announcements"] }); qc.invalidateQueries({ queryKey: ["announcements"] }); };
  const add = async () => {
    const { error } = await supabase.from("announcements").insert({ title: "New announcement", body: "", date: new Date().toLocaleDateString(), sort_order: 0 });
    if (error) toast.error(error.message); else invalidate();
  };
  return (
    <ListSection title="Announcements" onAdd={add}>
      {(data ?? []).map((a: any) => (
        <RowEditor key={a.id} table="announcements" row={a} onChange={invalidate}
          fields={[{ name: "title", label: "Title" }, { name: "date", label: "Date" }, { name: "body", label: "Body", textarea: true }]} />
      ))}
    </ListSection>
  );
}


function PublicationsAdmin() {
  const qc = useQueryClient();
  const { data } = useList("publications");
  const invalidate = () => { qc.invalidateQueries({ queryKey: ["admin", "publications"] }); qc.invalidateQueries({ queryKey: ["publications"] }); };
  const add = async (kind: string) => {
    const { error } = await supabase.from("publications").insert({ title: "New paper", kind, year: new Date().getFullYear(), sort_order: 0 });
    if (error) toast.error(error.message); else invalidate();
  };
  return (
    <ListSection title="Publications" headerActions={
      <>
        <Button size="sm" onClick={() => add("journal")} className="bg-gold text-navy-deep hover:bg-gold-soft"><Plus size={14} className="mr-1" />Journal</Button>
        <Button size="sm" onClick={() => add("conference")} className="bg-navy-deep text-cream hover:bg-navy"><Plus size={14} className="mr-1" />Conference</Button>
      </>
    }>
      {(data ?? []).map((p: any) => (
        <RowEditor key={p.id} table="publications" row={p} onChange={invalidate}
          fields={[
            { name: "title", label: "Title" }, { name: "authors", label: "Authors" }, { name: "venue", label: "Venue" },
            { name: "year", label: "Year", number: true }, { name: "doi", label: "DOI/URL" },
            { name: "kind", label: "Kind (journal/conference)" },
          ]} />
      ))}
    </ListSection>
  );
}

function SupervisionAdmin() {
  const qc = useQueryClient();
  const { data } = useList("supervision");
  const invalidate = () => { qc.invalidateQueries({ queryKey: ["admin", "supervision"] }); qc.invalidateQueries({ queryKey: ["supervision"] }); };
  const add = async (level: string) => {
    const { error } = await supabase.from("supervision").insert({ name: "New student", title: "", level, sort_order: 0 });
    if (error) toast.error(error.message); else invalidate();
  };
  return (
    <ListSection title="Supervision" headerActions={
      <>
        <Button size="sm" onClick={() => add("phd")} className="bg-gold text-navy-deep hover:bg-gold-soft"><Plus size={14} className="mr-1" />PhD</Button>
        <Button size="sm" onClick={() => add("msc_completed")} className="bg-navy-deep text-cream hover:bg-navy"><Plus size={14} className="mr-1" />MSc done</Button>
        <Button size="sm" onClick={() => add("msc_ongoing")} variant="outline"><Plus size={14} className="mr-1" />MSc ongoing</Button>
      </>
    }>
      {(data ?? []).map((s: any) => (
        <RowEditor key={s.id} table="supervision" row={s} onChange={invalidate}
          fields={[
            { name: "name", label: "Name" }, { name: "title", label: "Thesis title" },
            { name: "school", label: "School" }, { name: "level", label: "Level (phd/msc_completed/msc_ongoing)" },
          ]} />
      ))}
    </ListSection>
  );
}

type RowField = { name: string; label: string; textarea?: boolean; number?: boolean };
function RowEditor({
  table, row, fields, onChange, fileField, fileBucket,
}: { table: string; row: any; fields: RowField[]; onChange: () => void; fileField?: string; fileBucket?: string }) {
  const [form, setForm] = useState<any>(row);
  const [busy, setBusy] = useState(false);
  useEffect(() => setForm(row), [row]);

  const save = async () => {
    setBusy(true);
    const payload: any = { ...form };
    delete payload.id; delete payload.created_at;
    const { error } = await supabase.from(table as any).update(payload).eq("id", row.id);
    setBusy(false);
    if (error) toast.error(error.message); else { toast.success("Saved"); onChange(); }
  };
  const remove = async () => {
    if (!confirm("Delete this item?")) return;
    const { error } = await supabase.from(table as any).delete().eq("id", row.id);
    if (error) toast.error(error.message); else { toast.success("Deleted"); onChange(); }
  };
  const upload = async (file: File) => {
    if (!fileField || !fileBucket) return;
    setBusy(true);
    const path = `${table}/${row.id}/${Date.now()}-${file.name}`;
    const { error } = await supabase.storage.from(fileBucket).upload(path, file, { upsert: true });
    if (error) { setBusy(false); return toast.error(error.message); }
    const { data: pub } = supabase.storage.from(fileBucket).getPublicUrl(path);
    setForm((f: any) => ({ ...f, [fileField]: pub.publicUrl }));
    setBusy(false);
    toast.success("Uploaded — remember to Save.");
  };

  return (
    <div className="border rounded-lg p-4 bg-background space-y-3">
      <div className="grid sm:grid-cols-2 gap-3">
        {fields.map((f) => (
          <div key={f.name} className={f.textarea ? "sm:col-span-2" : ""}>
            <Label className="text-xs">{f.label}</Label>
            {f.textarea
              ? <Textarea rows={3} value={form[f.name] ?? ""} onChange={(e) => setForm({ ...form, [f.name]: e.target.value })} />
              : <Input type={f.number ? "number" : "text"} value={form[f.name] ?? ""} onChange={(e) => setForm({ ...form, [f.name]: f.number ? Number(e.target.value) : e.target.value })} />}
          </div>
        ))}
        <div>
          <Label className="text-xs">Sort order</Label>
          <Input type="number" value={form.sort_order ?? 0} onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) })} />
        </div>
      </div>
      {fileField && (
        <div>
          <Label className="text-xs">File {form[fileField] && <a href={form[fileField]} target="_blank" rel="noreferrer" className="text-gold ml-2 underline">current</a>}</Label>
          <Input type="file" onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])} disabled={busy} />
        </div>
      )}
      <div className="flex gap-2">
        <Button size="sm" onClick={save} disabled={busy} className="bg-navy-deep hover:bg-navy text-cream"><Save size={14} className="mr-1" />Save</Button>
        <Button size="sm" variant="destructive" onClick={remove}><Trash2 size={14} className="mr-1" />Delete</Button>
      </div>
    </div>
  );
}
