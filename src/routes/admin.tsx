import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Trash2, Save, Plus, ShieldCheck, User, Info, Mail, Megaphone, FolderOpen, BookOpen, Users, UserCog, FilePenLine,
  Bold, Italic, Underline, Link as LinkIcon, Image, MousePointerClick, Palette, List, ListOrdered, Quote,
  Database, LayoutDashboard, BarChart3, Bell, FileText, FileUp, GraduationCap, Activity, AlignLeft, AlignCenter, AlignRight,
  AlignJustify, Undo2, Redo2, Eraser, Minus, Table2, Heading1, Heading2, Pilcrow, Highlighter,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth, useUserRole } from "@/hooks/use-auth";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { DashboardShell, type DashboardNavItem } from "@/components/DashboardShell";
import { ResourcesAdmin } from "@/components/admin/ResourcesAdmin";
import { heroFallback, aboutFallback, contactFallback, homeStatsFallback } from "@/lib/content";
import { optimizedImageUrl } from "@/lib/images";
import {
  education,
  experience,
  grants,
  leadership,
  certifications,
  memberships,
  courses,
} from "@/lib/site-data";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Admin Dashboard" }] }),
  component: AdminPage,
});

const NAV: DashboardNavItem[] = [
  { id: "dashboard", label: "Dashboard", icon: BarChart3 },
  {
    id: "site-content",
    label: "Site Content",
    icon: LayoutDashboard,
    children: [
      { id: "hero", label: "Hero", icon: User },
      { id: "home-stats", label: "Home Stats", icon: BarChart3 },
      { id: "about", label: "About", icon: Info },
      { id: "contact", label: "Contact", icon: Mail },
      { id: "publications", label: "Publications", icon: BookOpen },
      { id: "supervision", label: "Supervision", icon: Users },
      { id: "academic-data", label: "Academic Data", icon: Database },
    ],
  },
  { id: "announcements", label: "Announcements", icon: Megaphone },
  { id: "resources", label: "Resources", icon: FolderOpen },
  { id: "users", label: "Users", icon: UserCog },
  { id: "blogs", label: "Blogs", icon: FilePenLine },
];

function AdminPage() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const { data: role, isLoading: roleLoading, refetch } = useUserRole(user);
  const [active, setActive] = useState("dashboard");

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

  const activeMeta = NAV.flatMap((n) => n.children ?? [n]).find((n) => n.id === active);

  return (
    <DashboardShell
      roleLabel="Admin"
      title={activeMeta?.label ?? "Dashboard"}
      subtitle="Manage site content, announcements, resources, publications & supervision"
      userEmail={user.email ?? undefined}
      userId={user.id}
      nav={NAV}
      active={active}
      onSelect={setActive}
    >
      {active === "dashboard" && <AdminDashboard onSelect={setActive} />}
      {active === "hero" && (
        <SiteContentEditor sectionKey="hero" fallback={heroFallback} fields={[
          { name: "name", label: "Name" }, { name: "tagline", label: "Tagline" }, { name: "role", label: "Role" },
          { name: "institution", label: "Institution" }, { name: "quote", label: "Quote", textarea: true },
        ]} imageField="photo_url" imageLabel="Hero Photo" imageBucket="public-assets" />
      )}
      {active === "home-stats" && (
        <SiteContentEditor sectionKey="home_stats" fallback={homeStatsFallback} fields={[
          { name: "journal_articles", label: "Journal Articles", number: true },
          { name: "phd_supervision", label: "PhD Supervision", number: true },
          { name: "msc_completed", label: "MSc Completed", number: true },
          { name: "msc_ongoing", label: "MSc Ongoing", number: true },
        ]} />
      )}
      {active === "about" && (
        <SiteContentEditor sectionKey="about" fallback={aboutFallback} fields={[
          { name: "bio", label: "Biography", textarea: true, rows: 8 },
        ]} imageField="photo_url" imageLabel="About Page Photo" imageBucket="public-assets" />
      )}
      {active === "contact" && (
        <SiteContentEditor sectionKey="contact" fallback={contactFallback} fields={[
          { name: "email", label: "Email" }, { name: "institution_line1", label: "Institution Line 1" },
          { name: "institution_line2", label: "Institution Line 2" }, { name: "linkedin", label: "LinkedIn URL" },
          { name: "scholar", label: "Google Scholar URL" }, { name: "researchgate", label: "ResearchGate URL" },
          { name: "x_url", label: "X URL" }, { name: "instagram", label: "Instagram URL" },
          { name: "facebook", label: "Facebook URL" }, { name: "whatsapp", label: "WhatsApp Link or Number" },
        ]} />
      )}
      {active === "announcements" && <AnnouncementsAdmin />}
      {active === "resources" && <ResourcesAdmin />}
      {active === "publications" && <PublicationsAdmin />}
      {active === "supervision" && <SupervisionAdmin />}
      {active === "academic-data" && <AcademicDataAdmin />}
      {active === "users" && <UsersAdmin currentUserId={user.id} />}
      {active === "blogs" && <BlogsAdmin />}
    </DashboardShell>
  );
}

async function compressImageFile(file: File, maxWidth: number, quality: number) {
  if (!file.type.startsWith("image/") || file.type === "image/svg+xml" || file.type === "image/gif") {
    return file;
  }

  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, maxWidth / bitmap.width);
    const width = Math.max(1, Math.round(bitmap.width * scale));
    const height = Math.max(1, Math.round(bitmap.height * scale));
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d");
    if (!context) return file;

    context.drawImage(bitmap, 0, 0, width, height);
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/webp", quality));
    bitmap.close();
    if (!blob || blob.size >= file.size) return file;

    const name = file.name.replace(/\.[^.]+$/, "") || "image";
    return new File([blob], `${name}.webp`, { type: "image/webp" });
  } catch {
    return file;
  }
}

function AdminDashboard({ onSelect }: { onSelect: (id: string) => void }) {
  const { data, isLoading } = useQuery({
    queryKey: ["admin", "dashboard"],
    queryFn: async () => {
      const countTable = async (table: string) => {
        const { count, error } = await supabase.from(table as any).select("*", { count: "exact", head: true });
        if (error) throw error;
        return count ?? 0;
      };

      const [
        announcements,
        resources,
        publications,
        supervision,
        blogs,
        siteContent,
        usersResult,
        recentAnnouncements,
        recentResources,
        recentBlogs,
      ] = await Promise.all([
        countTable("announcements"),
        countTable("resources"),
        countTable("publications"),
        countTable("supervision"),
        countTable("blog_posts"),
        countTable("site_content"),
        (supabase.rpc as any)("admin_list_users"),
        supabase.from("announcements").select("id,title,date,created_at").order("created_at", { ascending: false }).limit(4),
        supabase.from("resources").select("id,title,course,type,date,created_at").order("created_at", { ascending: false }).limit(4),
        supabase.from("blog_posts" as any).select("id,title,status,updated_at,created_at").order("updated_at", { ascending: false }).limit(4),
      ]);

      if (usersResult.error) throw usersResult.error;
      if (recentAnnouncements.error) throw recentAnnouncements.error;
      if (recentResources.error) throw recentResources.error;
      if (recentBlogs.error) throw recentBlogs.error;

      const users = (usersResult.data ?? []) as AdminUser[];
      const activeUsers = users.filter((u) => u.status === "active").length;
      const blockedUsers = users.filter((u) => u.status === "blocked" || u.status === "suspended").length;
      const publishedBlogs = ((recentBlogs.data ?? []) as any[]).filter((post) => post.status === "published").length;

      return {
        counts: {
          users: users.length,
          activeUsers,
          blockedUsers,
          announcements,
          resources,
          publications,
          supervision,
          blogs,
          publishedBlogs,
          siteContent,
        },
        recentAnnouncements: recentAnnouncements.data ?? [],
        recentResources: recentResources.data ?? [],
        recentBlogs: recentBlogs.data ?? [],
      };
    },
  });

  const stats = [
    { label: "Total Users", value: data?.counts.users ?? 0, icon: Users, target: "users", detail: `${data?.counts.activeUsers ?? 0} active` },
    { label: "Resources", value: data?.counts.resources ?? 0, icon: FolderOpen, target: "resources", detail: "Student downloads" },
    { label: "Announcements", value: data?.counts.announcements ?? 0, icon: Megaphone, target: "announcements", detail: "Student notices" },
    { label: "Publications", value: data?.counts.publications ?? 0, icon: BookOpen, target: "publications", detail: "Journal and conference items" },
    { label: "Supervision", value: data?.counts.supervision ?? 0, icon: GraduationCap, target: "supervision", detail: "Students listed" },
    { label: "Blog Posts", value: data?.counts.blogs ?? 0, icon: FilePenLine, target: "blogs", detail: `${data?.counts.publishedBlogs ?? 0} recently published` },
    { label: "Site Sections", value: data?.counts.siteContent ?? 0, icon: Database, target: "academic-data", detail: "Editable content records" },
    { label: "Restricted Users", value: data?.counts.blockedUsers ?? 0, icon: ShieldCheck, target: "users", detail: "Suspended or blocked" },
  ];

  return (
    <div className="space-y-6">
      <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <button
              key={stat.label}
              type="button"
              onClick={() => onSelect(stat.target)}
              className="text-left rounded-xl border border-border bg-card p-5 hover:border-gold/60 hover:shadow-lg transition-all"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">{stat.label}</p>
                  <p className="font-serif text-3xl font-bold text-navy-deep mt-2">{isLoading ? "..." : stat.value}</p>
                  <p className="text-xs text-muted-foreground mt-1">{stat.detail}</p>
                </div>
                <span className="w-10 h-10 rounded-lg bg-gold/15 flex items-center justify-center text-gold">
                  <Icon size={19} />
                </span>
              </div>
            </button>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        <DashboardPanel title="Recent Announcements" icon={Bell} action="Manage" onAction={() => onSelect("announcements")}>
          {(data?.recentAnnouncements ?? []).map((item: any) => (
            <NotificationItem key={item.id} title={item.title} meta={item.date || formatDate(item.created_at)} />
          ))}
          {!isLoading && (data?.recentAnnouncements ?? []).length === 0 && <EmptyDashboardText text="No announcements yet." />}
        </DashboardPanel>

        <DashboardPanel title="Latest Resources" icon={FolderOpen} action="Manage" onAction={() => onSelect("resources")}>
          {(data?.recentResources ?? []).map((item: any) => (
            <NotificationItem key={item.id} title={item.title} meta={`${item.course} · ${item.type} · ${item.date}`} />
          ))}
          {!isLoading && (data?.recentResources ?? []).length === 0 && <EmptyDashboardText text="No resources uploaded yet." />}
        </DashboardPanel>

        <DashboardPanel title="Blog Activity" icon={Activity} action="Open" onAction={() => onSelect("blogs")}>
          {(data?.recentBlogs ?? []).map((item: any) => (
            <NotificationItem key={item.id} title={item.title} meta={`${item.status} · ${formatDate(item.updated_at ?? item.created_at)}`} />
          ))}
          {!isLoading && (data?.recentBlogs ?? []).length === 0 && <EmptyDashboardText text="No blog activity yet." />}
        </DashboardPanel>
      </div>
    </div>
  );
}

function DashboardPanel({
  title,
  icon: Icon,
  action,
  onAction,
  children,
}: {
  title: string;
  icon: typeof Bell;
  action: string;
  onAction: () => void;
  children: React.ReactNode;
}) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <Icon size={18} className="text-gold" />
            <h3 className="font-serif text-lg font-semibold text-navy-deep">{title}</h3>
          </div>
          <Button type="button" variant="outline" size="sm" onClick={onAction}>{action}</Button>
        </div>
        <div className="space-y-3">{children}</div>
      </CardContent>
    </Card>
  );
}

function NotificationItem({ title, meta }: { title: string; meta: string }) {
  return (
    <div className="rounded-lg border border-border/70 bg-background p-3">
      <p className="text-sm font-semibold text-navy-deep leading-snug">{title}</p>
      <p className="text-xs text-muted-foreground mt-1">{meta}</p>
    </div>
  );
}

function EmptyDashboardText({ text }: { text: string }) {
  return <p className="text-sm text-muted-foreground italic">{text}</p>;
}

function formatDate(value?: string | null) {
  if (!value) return "No date";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString();
}

// ---------- Site content editor ----------
type FieldDef = { name: string; label: string; textarea?: boolean; rows?: number; number?: boolean };

function SiteContentEditor<T extends Record<string, unknown>>({
  sectionKey, fallback, fields, imageField, imageLabel = "Image", imageBucket,
}: { sectionKey: string; fallback: T; fields: FieldDef[]; imageField?: string; imageLabel?: string; imageBucket?: string }) {
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
    const optimizedFile = await compressImageFile(file, 1400, 0.78);
    const path = `${sectionKey}/${Date.now()}-${optimizedFile.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
    const { error } = await supabase.storage.from(imageBucket).upload(path, optimizedFile, { upsert: true, contentType: optimizedFile.type });
    if (error) { setUploading(false); return toast.error(error.message); }
    const { data: pub } = supabase.storage.from(imageBucket).getPublicUrl(path);
    const nextForm = { ...form, [imageField]: pub.publicUrl };
    setForm(nextForm);
    const { error: saveError } = await supabase.from("site_content").upsert({ key: sectionKey, value: nextForm as never });
    setUploading(false);
    if (saveError) return toast.error(saveError.message);
    qc.invalidateQueries({ queryKey: ["site_content", sectionKey] });
    qc.invalidateQueries({ queryKey: ["site_content_edit", sectionKey] });
    toast.success(`${imageLabel} updated`);
  };

  const removeImage = async () => {
    if (!imageField) return;
    const nextForm = { ...form, [imageField]: "" };
    setForm(nextForm);
    const { error } = await supabase.from("site_content").upsert({ key: sectionKey, value: nextForm as never });
    if (error) return toast.error(error.message);
    qc.invalidateQueries({ queryKey: ["site_content", sectionKey] });
    qc.invalidateQueries({ queryKey: ["site_content_edit", sectionKey] });
    toast.success(`${imageLabel} removed`);
  };

  if (isLoading) return <p className="py-10 text-muted-foreground">Loading…</p>;

  return (
    <Card><CardContent className="pt-6 space-y-4">
      {fields.map((f) => (
        <div key={f.name}>
          <Label>{f.label}</Label>
          {f.textarea
            ? <Textarea rows={f.rows ?? 4} value={(form[f.name] as string) ?? ""} onChange={(e) => setForm({ ...form, [f.name]: e.target.value })} />
            : <Input
                type={f.number ? "number" : "text"}
                min={f.number ? 0 : undefined}
                value={(form[f.name] as string | number) ?? ""}
                onChange={(e) => setForm({ ...form, [f.name]: f.number ? Number(e.target.value) : e.target.value })}
              />}
        </div>
      ))}
      {imageField && (
        <div className="rounded-lg border border-border bg-secondary/30 p-4 space-y-3">
          <div>
            <Label>{imageLabel}</Label>
            <p className="text-xs text-muted-foreground mt-1">Upload a JPG, PNG, or WebP image. It saves immediately after upload.</p>
          </div>
          {(form[imageField] as string) && (
            <div className="flex flex-col sm:flex-row gap-4 sm:items-end">
              <img
                src={optimizedImageUrl(form[imageField] as string, 240)}
                alt={imageLabel}
                width={144}
                height={176}
                loading="lazy"
                decoding="async"
                className="w-36 h-44 object-cover rounded-lg border bg-background"
              />
              <Button type="button" variant="outline" size="sm" onClick={removeImage}>Remove Photo</Button>
            </div>
          )}
          <Input type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])} disabled={uploading} />
          {uploading && <p className="text-xs text-muted-foreground">Uploading...</p>}
        </div>
      )}
      <Button onClick={save} className="bg-navy-deep hover:bg-navy text-cream"><Save size={16} className="mr-2" />Save</Button>
    </CardContent></Card>
  );
}

// ---------- Generic list CRUD ----------
function useList(table: string, eqCol?: string, eqVal?: string) {
  const qc = useQueryClient();
  useEffect(() => {
    const channel = supabase
      .channel(`admin:${table}:${eqCol ?? "all"}:${eqVal ?? "all"}`)
      .on("postgres_changes", { event: "*", schema: "public", table }, () => {
        qc.invalidateQueries({ queryKey: ["admin", table] });
        qc.invalidateQueries({ queryKey: [table] });
      })
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [eqCol, eqVal, qc, table]);

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
        <PublicationEditor key={p.id} row={p} onChange={invalidate} />
      ))}
    </ListSection>
  );
}

function PublicationEditor({ row, onChange }: { row: any; onChange: () => void }) {
  const initialForm = {
    ...row,
    article_url: row.article_url ?? row.doi ?? "",
    pdf_url: row.pdf_url ?? "",
    pdf_download_allowed: row.pdf_download_allowed ?? true,
  };
  const [form, setForm] = useState<any>(initialForm);
  const [busy, setBusy] = useState(false);
  useEffect(() => setForm({
    ...row,
    article_url: row.article_url ?? row.doi ?? "",
    pdf_url: row.pdf_url ?? "",
    pdf_download_allowed: row.pdf_download_allowed ?? true,
  }), [row]);

  const save = async () => {
    setBusy(true);
    const articleUrl = String(form.article_url ?? "").trim();
    const payload = {
      kind: form.kind,
      title: form.title,
      authors: form.authors,
      venue: form.venue,
      year: form.year ? Number(form.year) : null,
      doi: articleUrl || null,
      article_url: articleUrl || null,
      pdf_url: form.pdf_url || null,
      pdf_download_allowed: Boolean(form.pdf_download_allowed),
      sort_order: Number(form.sort_order ?? 0),
    };
    const { error } = await supabase.from("publications").update(payload as any).eq("id", row.id);
    setBusy(false);
    if (error) toast.error(error.message); else { toast.success("Publication saved"); onChange(); }
  };

  const remove = async () => {
    if (!confirm("Delete this publication?")) return;
    const { error } = await supabase.from("publications").delete().eq("id", row.id);
    if (error) toast.error(error.message); else { toast.success("Deleted"); onChange(); }
  };

  const uploadPdf = async (file: File) => {
    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      return toast.error("Please upload a PDF file.");
    }
    setBusy(true);
    const path = `publications/${row.id}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
    const { error } = await supabase.storage.from("public-assets").upload(path, file, { upsert: true, contentType: "application/pdf" });
    setBusy(false);
    if (error) return toast.error(error.message);
    const { data } = supabase.storage.from("public-assets").getPublicUrl(path);
    setForm((current: any) => ({ ...current, pdf_url: data.publicUrl }));
    toast.success("PDF uploaded. Click Save to publish the change.");
  };

  return (
    <div className="border rounded-lg p-4 bg-background space-y-4">
      <div className="grid md:grid-cols-2 gap-3">
        <div>
          <Label className="text-xs">Type</Label>
          <select
            value={form.kind ?? "journal"}
            onChange={(event) => setForm({ ...form, kind: event.target.value })}
            className="mt-1 h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-gold/40"
          >
            <option value="journal">Journal Article</option>
            <option value="conference">Conference Presentation</option>
          </select>
        </div>
        <div>
          <Label className="text-xs">Year</Label>
          <Input type="number" value={form.year ?? ""} onChange={(event) => setForm({ ...form, year: event.target.value })} />
        </div>
        <div className="md:col-span-2">
          <Label className="text-xs">Title</Label>
          <Input value={form.title ?? ""} onChange={(event) => setForm({ ...form, title: event.target.value })} />
        </div>
        <div>
          <Label className="text-xs">Authors</Label>
          <Input value={form.authors ?? ""} onChange={(event) => setForm({ ...form, authors: event.target.value })} />
        </div>
        <div>
          <Label className="text-xs">Journal / Conference / Venue</Label>
          <Input value={form.venue ?? ""} onChange={(event) => setForm({ ...form, venue: event.target.value })} />
        </div>
        <div className="md:col-span-2">
          <Label className="text-xs">Article URL / Link</Label>
          <Input placeholder="https://..." value={form.article_url ?? ""} onChange={(event) => setForm({ ...form, article_url: event.target.value })} />
          <p className="mt-1 text-xs text-muted-foreground">Links open the publisher/article website. Uploaded PDFs open inside this website.</p>
        </div>
        <div>
          <Label className="text-xs">Sort order</Label>
          <Input type="number" value={form.sort_order ?? 0} onChange={(event) => setForm({ ...form, sort_order: Number(event.target.value) })} />
        </div>
      </div>

      <div className="rounded-lg border border-border bg-secondary/30 p-3 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <Label className="text-xs">Publication PDF</Label>
            {form.pdf_url && <a href={form.pdf_url} target="_blank" rel="noreferrer" className="ml-2 text-xs font-semibold text-gold underline">current PDF</a>}
          </div>
          {form.pdf_url && (
            <Button type="button" size="sm" variant="outline" onClick={() => setForm({ ...form, pdf_url: "" })}>
              Remove PDF
            </Button>
          )}
        </div>
        <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-muted bg-background p-5 text-center hover:border-gold/60 hover:bg-gold/5">
          <FileUp size={22} className="text-gold" />
          <span className="text-sm font-semibold text-navy-deep">{busy ? "Uploading..." : "Upload PDF"}</span>
          <span className="text-xs text-muted-foreground">PDF files only</span>
          <input type="file" accept="application/pdf,.pdf" className="hidden" disabled={busy} onChange={(event) => event.target.files?.[0] && uploadPdf(event.target.files[0])} />
        </label>
        <label className="flex items-start gap-2 text-sm">
          <input
            type="checkbox"
            checked={Boolean(form.pdf_download_allowed)}
            onChange={(event) => setForm({ ...form, pdf_download_allowed: event.target.checked })}
            className="mt-1"
          />
          <span>
            <span className="font-medium text-navy-deep">Allow users to download the PDF</span>
            <span className="block text-xs text-muted-foreground">If unchecked, users will see a read-only viewer without a download button.</span>
          </span>
        </label>
      </div>

      <div className="flex gap-2">
        <Button size="sm" onClick={save} disabled={busy} className="bg-navy-deep hover:bg-navy text-cream"><Save size={14} className="mr-1" />Save</Button>
        <Button size="sm" variant="destructive" onClick={remove} disabled={busy}><Trash2 size={14} className="mr-1" />Delete</Button>
      </div>
    </div>
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

type AcademicField = {
  name: string;
  label: string;
  multiline?: boolean;
  list?: boolean;
};

type AcademicSection =
  | {
      key: string;
      title: string;
      description: string;
      type: "object-list";
      fallback: Array<Record<string, any>>;
      fields: AcademicField[];
      emptyItem: Record<string, any>;
    }
  | {
      key: string;
      title: string;
      description: string;
      type: "string-list";
      fallback: string[];
      itemLabel: string;
    }
  | {
      key: string;
      title: string;
      description: string;
      type: "leadership";
      fallback: typeof leadership;
    }
  | {
      key: string;
      title: string;
      description: string;
      type: "note";
      fallback: { text: string };
    };

const academicDataSections: AcademicSection[] = [
  {
    key: "personal_info",
    title: "Personal Information",
    description: "CV identity and biographical facts shown on the About page.",
    type: "object-list",
    fallback: [],
    fields: [{ name: "label", label: "Label" }, { name: "value", label: "Value" }],
    emptyItem: { label: "", value: "" },
  },
  {
    key: "research_interests",
    title: "Research Interests",
    description: "Research interest tags shown on the About page.",
    type: "string-list",
    fallback: [],
    itemLabel: "Research interest",
  },
  {
    key: "skills",
    title: "Skills",
    description: "Language, programming, database, web, and academic skill details shown on the About page.",
    type: "object-list",
    fallback: [],
    fields: [{ name: "label", label: "Skill area" }, { name: "value", label: "Details", multiline: true }],
    emptyItem: { label: "", value: "" },
  },
  {
    key: "education",
    title: "Education",
    description: "Timeline entries shown on the About page.",
    type: "object-list",
    fallback: education,
    fields: [
      { name: "period", label: "Period" },
      { name: "degree", label: "Qualification" },
      { name: "school", label: "Institution" },
      { name: "detail", label: "Thesis / details", multiline: true },
    ],
    emptyItem: { period: "", degree: "", school: "", detail: "" },
  },
  {
    key: "experience",
    title: "Experience",
    description: "Employment accordion entries shown on the About page.",
    type: "object-list",
    fallback: experience,
    fields: [
      { name: "period", label: "Period" },
      { name: "role", label: "Role" },
      { name: "org", label: "Institution / organization", multiline: true },
      { name: "bullets", label: "Responsibilities", multiline: true, list: true },
    ],
    emptyItem: { period: "", role: "", org: "", bullets: [] },
  },
  {
    key: "leadership",
    title: "Leadership & Service",
    description: "Institutional leadership groups shown on the About page.",
    type: "leadership",
    fallback: leadership,
  },
  {
    key: "certifications",
    title: "Certifications",
    description: "Certification cards shown on the About page.",
    type: "object-list",
    fallback: certifications,
    fields: [
      { name: "period", label: "Year / period" },
      { name: "title", label: "Certification" },
      { name: "issuer", label: "Issuer" },
      { name: "link", label: "Link" },
    ],
    emptyItem: { period: "", title: "", issuer: "", link: "#" },
  },
  {
    key: "memberships",
    title: "Professional Memberships",
    description: "Membership badges shown on the About page.",
    type: "string-list",
    fallback: memberships,
    itemLabel: "Membership",
  },
  {
    key: "grants",
    title: "Research Grants",
    description: "Grant cards shown on the Research page.",
    type: "object-list",
    fallback: grants,
    fields: [
      { name: "title", label: "Grant title", multiline: true },
      { name: "type", label: "Grant type" },
      { name: "funding_body", label: "Funding body" },
      { name: "amount", label: "Amount" },
      { name: "period", label: "Period" },
      { name: "role", label: "Role" },
    ],
    emptyItem: { title: "", type: "", funding_body: "", amount: "", period: "", role: "" },
  },
  {
    key: "courses",
    title: "Course Cards",
    description: "Course cards shown on the Student Resources page.",
    type: "object-list",
    fallback: courses,
    fields: [{ name: "name", label: "Course name" }, { name: "desc", label: "Description", multiline: true }],
    emptyItem: { name: "", desc: "" },
  },
  {
    key: "thesis_examinations",
    title: "Thesis Examination",
    description: "Postgraduate thesis examination records shown on the About page.",
    type: "object-list",
    fallback: [],
    fields: [
      { name: "name", label: "Student name" },
      { name: "title", label: "Thesis title", multiline: true },
      { name: "degree", label: "Degree" },
      { name: "institution", label: "Institution" },
      { name: "date", label: "Date" },
    ],
    emptyItem: { name: "", title: "", degree: "", institution: "", date: "" },
  },
  {
    key: "community_outreach",
    title: "Community Outreach",
    description: "Community leadership and service records shown on the About page.",
    type: "object-list",
    fallback: [],
    fields: [{ name: "period", label: "Period" }, { name: "role", label: "Role" }, { name: "org", label: "Organization / activity", multiline: true }],
    emptyItem: { period: "", role: "", org: "" },
  },
  {
    key: "electoral_engagement",
    title: "Electoral Engagement",
    description: "National electoral service records shown on the About page.",
    type: "object-list",
    fallback: [],
    fields: [{ name: "year", label: "Year" }, { name: "role", label: "Role" }, { name: "event", label: "Election / event" }],
    emptyItem: { year: "", role: "", event: "" },
  },
  {
    key: "workshops_training",
    title: "Workshops & Training",
    description: "Training, workshop, and professional development records shown on the About page.",
    type: "object-list",
    fallback: [],
    fields: [{ name: "year", label: "Year" }, { name: "title", label: "Workshop / training", multiline: true }, { name: "detail", label: "Details", multiline: true }],
    emptyItem: { year: "", title: "", detail: "" },
  },
  {
    key: "awards",
    title: "Awards & Recognitions",
    description: "Awards and recognitions shown on the About page.",
    type: "object-list",
    fallback: [],
    fields: [{ name: "year", label: "Year" }, { name: "text", label: "Award / recognition", multiline: true }],
    emptyItem: { year: "", text: "" },
  },
  {
    key: "personal_interests",
    title: "Personal Interests",
    description: "Personal interests shown on the About page.",
    type: "string-list",
    fallback: [],
    itemLabel: "Interest",
  },
  {
    key: "references_note",
    title: "References Note",
    description: "References note shown near the bottom of the About page.",
    type: "note",
    fallback: { text: "References available on request." },
  },
];

function AcademicDataAdmin() {
  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="pt-6">
          <h3 className="font-serif text-xl font-semibold text-navy-deep">Editable Academic Site Data</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Edit the lecturer profile using normal form fields. Changes are saved to Supabase and appear on the public pages.
          </p>
        </CardContent>
      </Card>
      {academicDataSections.map((section) => (
        <AcademicContentEditor
          key={section.key}
          section={section}
        />
      ))}
    </div>
  );
}

function AcademicContentEditor({ section }: { section: AcademicSection }) {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["site_content_edit", section.key],
    queryFn: async () => {
      const { data } = await supabase.from("site_content").select("value").eq("key", section.key).maybeSingle();
      return data?.value ?? section.fallback;
    },
  });
  const [value, setValue] = useState<any>(section.fallback);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (data !== undefined) setValue(data);
  }, [data, section.fallback]);

  const save = async () => {
    setBusy(true);
    const { error } = await supabase.from("site_content").upsert({ key: section.key, value: value as never });
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success(`${section.title} saved`);
    qc.invalidateQueries({ queryKey: ["site_content_edit", section.key] });
    qc.invalidateQueries({ queryKey: ["site_content", section.key] });
  };

  const resetToFallback = () => setValue(section.fallback);

  return (
    <Card>
      <CardContent className="pt-6 space-y-3">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
          <div>
            <h4 className="font-serif text-lg font-semibold text-navy-deep">{section.title}</h4>
            <p className="text-sm text-muted-foreground">{section.description}</p>
          </div>
          <div className="flex gap-2">
            <Button type="button" variant="outline" size="sm" onClick={resetToFallback}>Reset Sample</Button>
            <Button type="button" size="sm" disabled={busy || isLoading} onClick={save} className="bg-navy-deep hover:bg-navy text-cream">
              <Save size={14} className="mr-1" />{busy ? "Saving..." : "Save"}
            </Button>
          </div>
        </div>
        {isLoading ? <p className="text-sm text-muted-foreground">Loading...</p> : (
          <AcademicFields section={section} value={value} onChange={setValue} />
        )}
      </CardContent>
    </Card>
  );
}

function AcademicFields({ section, value, onChange }: { section: AcademicSection; value: any; onChange: (value: any) => void }) {
  if (section.type === "string-list") {
    const items = Array.isArray(value) ? value : [];
    return (
      <div className="space-y-3">
        {items.map((item, index) => (
          <div key={index} className="flex gap-2">
            <Input
              value={item ?? ""}
              onChange={(e) => onChange(items.map((current, i) => i === index ? e.target.value : current))}
              placeholder={section.itemLabel}
            />
            <Button type="button" variant="outline" size="icon" onClick={() => onChange(items.filter((_, i) => i !== index))} aria-label={`Remove ${section.itemLabel}`}>
              <Trash2 size={15} />
            </Button>
          </div>
        ))}
        <Button type="button" variant="outline" size="sm" onClick={() => onChange([...items, ""])}>
          <Plus size={14} className="mr-1" />Add {section.itemLabel}
        </Button>
      </div>
    );
  }

  if (section.type === "note") {
    return (
      <div>
        <Label>Note</Label>
        <Input value={value?.text ?? ""} onChange={(e) => onChange({ text: e.target.value })} />
      </div>
    );
  }

  if (section.type === "leadership") {
    const groups = Array.isArray(value) ? value : [];
    const updateGroup = (groupIndex: number, nextGroup: any) => onChange(groups.map((group, index) => index === groupIndex ? nextGroup : group));
    return (
      <div className="space-y-4">
        {groups.map((group, groupIndex) => (
          <div key={groupIndex} className="rounded-lg border border-border p-4 bg-background space-y-4">
            <div className="flex flex-col md:flex-row gap-2">
              <div className="flex-1">
                <Label>Institution / group</Label>
                <Input value={group.org ?? ""} onChange={(e) => updateGroup(groupIndex, { ...group, org: e.target.value })} />
              </div>
              <Button type="button" variant="outline" className="md:self-end" onClick={() => onChange(groups.filter((_, index) => index !== groupIndex))}>
                <Trash2 size={14} className="mr-1" />Remove Group
              </Button>
            </div>
            <div className="space-y-3">
              {(group.items ?? []).map((item: any, itemIndex: number) => (
                <div key={itemIndex} className="grid md:grid-cols-[180px_1fr_auto] gap-2 rounded-md border border-border/70 p-3">
                  <div>
                    <Label>Badge / role</Label>
                    <Input
                      value={item.role ?? ""}
                      onChange={(e) => {
                        const items = (group.items ?? []).map((current: any, index: number) => index === itemIndex ? { ...current, role: e.target.value } : current);
                        updateGroup(groupIndex, { ...group, items });
                      }}
                    />
                  </div>
                  <div>
                    <Label>Details</Label>
                    <Textarea
                      rows={2}
                      value={item.text ?? ""}
                      onChange={(e) => {
                        const items = (group.items ?? []).map((current: any, index: number) => index === itemIndex ? { ...current, text: e.target.value } : current);
                        updateGroup(groupIndex, { ...group, items });
                      }}
                    />
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="md:self-end"
                    onClick={() => updateGroup(groupIndex, { ...group, items: (group.items ?? []).filter((_: any, index: number) => index !== itemIndex) })}
                    aria-label="Remove leadership role"
                  >
                    <Trash2 size={15} />
                  </Button>
                </div>
              ))}
              <Button type="button" variant="outline" size="sm" onClick={() => updateGroup(groupIndex, { ...group, items: [...(group.items ?? []), { role: "", text: "" }] })}>
                <Plus size={14} className="mr-1" />Add Role
              </Button>
            </div>
          </div>
        ))}
        <Button type="button" variant="outline" size="sm" onClick={() => onChange([...groups, { org: "", items: [] }])}>
          <Plus size={14} className="mr-1" />Add Institution
        </Button>
      </div>
    );
  }

  const items = Array.isArray(value) ? value : [];
  const updateItem = (itemIndex: number, field: AcademicField, nextValue: string) => {
    onChange(items.map((item, index) => index === itemIndex ? {
      ...item,
      [field.name]: field.list ? nextValue.split("\n").map((line) => line.trim()).filter(Boolean) : nextValue,
    } : item));
  };

  return (
    <div className="space-y-4">
      {items.map((item, itemIndex) => (
        <div key={itemIndex} className="rounded-lg border border-border p-4 bg-background space-y-3">
          <div className="flex justify-between gap-3">
            <p className="text-sm font-semibold text-navy-deep">Entry {itemIndex + 1}</p>
            <Button type="button" variant="outline" size="sm" onClick={() => onChange(items.filter((_, index) => index !== itemIndex))}>
              <Trash2 size={14} className="mr-1" />Remove
            </Button>
          </div>
          <div className="grid md:grid-cols-2 gap-3">
            {section.fields.map((field) => (
              <div key={field.name} className={field.multiline || field.list ? "md:col-span-2" : ""}>
                <Label>{field.label}</Label>
                {field.multiline || field.list ? (
                  <Textarea
                    rows={field.list ? 4 : 3}
                    value={field.list ? (item[field.name] ?? []).join("\n") : item[field.name] ?? ""}
                    onChange={(e) => updateItem(itemIndex, field, e.target.value)}
                    placeholder={field.list ? "Write one item per line" : undefined}
                  />
                ) : (
                  <Input value={item[field.name] ?? ""} onChange={(e) => updateItem(itemIndex, field, e.target.value)} />
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
      <Button type="button" variant="outline" size="sm" onClick={() => onChange([...items, { ...section.emptyItem }])}>
        <Plus size={14} className="mr-1" />Add Entry
      </Button>
    </div>
  );
}

type AdminUser = {
  id: string;
  email: string;
  role: "admin" | "student" | "user";
  status: "active" | "suspended" | "blocked";
  reason: string | null;
  confirmed: boolean;
  created_at: string;
  last_sign_in_at: string | null;
  first_name?: string | null;
  last_name?: string | null;
  organization_name?: string | null;
  education_level?: string | null;
  program?: string | null;
};

function UsersAdmin({ currentUserId }: { currentUserId: string }) {
  const qc = useQueryClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"student" | "admin" | "user">("student");
  const [busy, setBusy] = useState(false);

  const { data = [], isLoading } = useQuery({
    queryKey: ["admin", "users"],
    queryFn: async () => {
      const { data, error } = await (supabase.rpc as any)("admin_list_users");
      if (error) throw error;
      return (data ?? []) as AdminUser[];
    },
  });

  const refresh = () => qc.invalidateQueries({ queryKey: ["admin", "users"] });

  const createUser = async () => {
    if (!email.trim()) return toast.error("Email is required.");
    if (password.length < 6) return toast.error("Password must be at least 6 characters.");
    setBusy(true);
    const { error } = await (supabase.rpc as any)("admin_create_user", {
      user_email: email.trim(),
      user_password: password,
      user_role: role,
    });
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("User created");
    setEmail("");
    setPassword("");
    refresh();
  };

  const setUserRole = async (id: string, nextRole: string) => {
    const { error } = await (supabase.rpc as any)("admin_set_user_role", { target_user_id: id, new_role: nextRole });
    if (error) toast.error(error.message); else { toast.success("Role updated"); refresh(); }
  };

  const setUserStatus = async (id: string, nextStatus: string) => {
    const reason = nextStatus === "active" ? "" : prompt(`Reason for ${nextStatus}?`) ?? "";
    const { error } = await (supabase.rpc as any)("admin_set_user_status", {
      target_user_id: id,
      new_status: nextStatus,
      status_reason: reason,
    });
    if (error) toast.error(error.message); else { toast.success("Status updated"); refresh(); }
  };

  const deleteUser = async (id: string, userEmail: string) => {
    if (!confirm(`Delete ${userEmail}? This removes their login account.`)) return;
    const { error } = await (supabase.rpc as any)("admin_delete_user", { target_user_id: id });
    if (error) toast.error(error.message); else { toast.success("User deleted"); refresh(); }
  };

  return (
    <div className="space-y-5">
      <Card>
        <CardContent className="pt-6 space-y-4">
          <h3 className="font-serif text-xl font-semibold text-navy-deep">Create User</h3>
          <div className="grid md:grid-cols-4 gap-3">
            <div className="md:col-span-2">
              <Label>Email</Label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="newuser@example.com" />
            </div>
            <div>
              <Label>Password</Label>
              <Input value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            <div>
              <Label>Role</Label>
              <div className="flex gap-2 pt-1">
                {["student", "admin", "user"].map((r) => (
                  <Button key={r} type="button" size="sm" variant={role === r ? "default" : "outline"} onClick={() => setRole(r as any)}
                    className={role === r ? "bg-navy-deep text-cream hover:bg-navy" : ""}>
                    {r}
                  </Button>
                ))}
              </div>
            </div>
          </div>
          <Button onClick={createUser} disabled={busy} className="bg-gold text-navy-deep hover:bg-gold-soft">
            <Plus size={16} className="mr-2" />{busy ? "Creating..." : "Add User"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <h3 className="font-serif text-xl font-semibold text-navy-deep mb-4">Site Users</h3>
          {isLoading ? (
            <p className="text-muted-foreground">Loading users...</p>
          ) : (
            <div className="space-y-3">
              {data.map((u) => (
                <div key={u.id} className="border rounded-lg p-4 bg-background space-y-3">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold text-navy-deep">
                        {[u.first_name, u.last_name].filter(Boolean).join(" ") || u.email}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Role: {u.role} · Status: {u.status} · {u.confirmed ? "Confirmed" : "Unconfirmed"}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {u.email}
                        {u.organization_name ? ` · ${u.organization_name}` : ""}
                        {u.education_level ? ` · ${formatEducationLevel(u.education_level)}` : ""}
                        {u.program ? ` · ${u.program}` : ""}
                      </p>
                      {u.reason && <p className="text-xs text-destructive mt-1">Reason: {u.reason}</p>}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {["admin", "student", "user"].map((r) => (
                        <Button key={r} size="sm" variant={u.role === r ? "default" : "outline"} onClick={() => setUserRole(u.id, r)}
                          disabled={u.id === currentUserId && r !== "admin"}
                          className={u.role === r ? "bg-navy-deep text-cream hover:bg-navy" : ""}>
                          {r}
                        </Button>
                      ))}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button size="sm" variant={u.status === "active" ? "default" : "outline"} onClick={() => setUserStatus(u.id, "active")}
                      className={u.status === "active" ? "bg-gold text-navy-deep hover:bg-gold-soft" : ""}>
                      Active
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setUserStatus(u.id, "suspended")} disabled={u.id === currentUserId}>
                      Suspend
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setUserStatus(u.id, "blocked")} disabled={u.id === currentUserId}>
                      Block Resources
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => deleteUser(u.id, u.email)} disabled={u.id === currentUserId}>
                      <Trash2 size={14} className="mr-1" />Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function slugify(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "new-post";
}

function formatEducationLevel(value: string) {
  return value
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function BlogsAdmin() {
  const qc = useQueryClient();
  const { data, isLoading } = useList("blog_posts");
  const invalidate = () => { qc.invalidateQueries({ queryKey: ["admin", "blog_posts"] }); qc.invalidateQueries({ queryKey: ["blogs"] }); };

  const add = async () => {
    const title = "New blog post";
    const slug = `${slugify(title)}-${Date.now()}`;
    const { error } = await supabase.from("blog_posts" as any).insert({
      title,
      slug,
      excerpt: "",
      content: "",
      status: "draft",
      sort_order: 0,
    });
    if (error) toast.error(error.message); else invalidate();
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex justify-between items-center mb-4 gap-3 flex-wrap">
          <div>
            <h3 className="font-serif text-xl font-semibold text-navy-deep">Blog Writer</h3>
            <p className="text-sm text-muted-foreground mt-1">Write rich posts with formatted text, images, links, and call-to-action buttons.</p>
          </div>
          <Button size="sm" onClick={add} className="bg-gold text-navy-deep hover:bg-gold-soft">
            <Plus size={14} className="mr-1" />New Post
          </Button>
        </div>
        {isLoading ? (
          <p className="text-muted-foreground">Loading posts...</p>
        ) : (
          <div className="space-y-4">
            {(data ?? []).map((b: any) => (
              <BlogPostEditor key={b.id} post={b} onSaved={invalidate} />
            ))}
            {(data ?? []).length === 0 && (
              <p className="text-sm text-muted-foreground italic">No blog posts yet.</p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

type BlogPost = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  status: "draft" | "published";
  sort_order: number;
};

function BlogPostEditor({ post, onSaved }: { post: BlogPost; onSaved: () => void }) {
  const editorRef = useRef<HTMLDivElement | null>(null);
  const [form, setForm] = useState<BlogPost>(post);
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    setForm(post);
    if (editorRef.current) editorRef.current.innerHTML = post.content ?? "";
  }, [post]);

  const syncContent = () => {
    setForm((f) => ({ ...f, content: editorRef.current?.innerHTML ?? "" }));
  };

  const exec = (command: string, value?: string) => {
    editorRef.current?.focus();
    document.execCommand(command, false, value);
    syncContent();
  };

  const insertHtml = (html: string) => {
    editorRef.current?.focus();
    document.execCommand("insertHTML", false, html);
    syncContent();
  };

  const normalizeUrl = (url: string) => {
    if (!url || url === "#") return "#";
    if (/^(https?:|mailto:|tel:)/i.test(url)) return url;
    return `https://${url}`;
  };

  const addLink = () => {
    const url = prompt("Enter link URL");
    if (!url) return;
    exec("createLink", normalizeUrl(url));
  };

  const addButton = () => {
    const label = prompt("Button text") || "Read more";
    const url = normalizeUrl(prompt("Button URL") || "#");
    insertHtml(`<a href="${url}" class="blog-button" style="display:inline-block;background:#1a2e4a;color:#fff;padding:10px 16px;border-radius:6px;text-decoration:none;font-weight:700;margin:10px 0;">${label}</a>`);
  };

  const addCallout = () => {
    insertHtml(`<div class="blog-callout" style="border-left:4px solid #c9a84c;background:#f8f3df;padding:14px 16px;margin:14px 0;border-radius:6px;"><strong>Note:</strong> Write your important message here.</div>`);
  };

  const addTable = () => {
    const rows = Math.max(1, Number(prompt("Number of rows", "3")) || 3);
    const cols = Math.max(1, Number(prompt("Number of columns", "3")) || 3);
    const header = `<tr>${Array.from({ length: cols }, (_, i) => `<th>Heading ${i + 1}</th>`).join("")}</tr>`;
    const body = Array.from({ length: rows - 1 }, () => `<tr>${Array.from({ length: cols }, () => "<td>Text</td>").join("")}</tr>`).join("");
    insertHtml(`<table class="blog-table" style="width:100%;border-collapse:collapse;margin:16px 0;">${header}${body}</table>`);
  };

  const uploadImage = async (file: File) => {
    setUploading(true);
    const optimizedFile = await compressImageFile(file, 1600, 0.76);
    const path = `blogs/${form.id}/${Date.now()}-${optimizedFile.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
    const { error } = await supabase.storage.from("public-assets").upload(path, optimizedFile, { upsert: true, contentType: optimizedFile.type });
    if (error) {
      setUploading(false);
      return toast.error(error.message);
    }
    const { data } = supabase.storage.from("public-assets").getPublicUrl(path);
    const alt = prompt("Image description / alt text", "") ?? "";
    insertHtml(`<figure style="margin:16px 0;"><img src="${optimizedImageUrl(data.publicUrl, 1200)}" alt="${alt.replace(/"/g, "&quot;")}" loading="lazy" decoding="async" style="max-width:100%;border-radius:8px;display:block;" /><figcaption style="font-size:13px;color:#64748b;margin-top:6px;text-align:center;">${alt}</figcaption></figure>`);
    setUploading(false);
    toast.success("Image inserted");
  };

  const save = async () => {
    setBusy(true);
    const payload = {
      title: form.title,
      slug: form.slug || slugify(form.title),
      excerpt: form.excerpt,
      content: editorRef.current?.innerHTML ?? form.content,
      status: form.status,
      sort_order: form.sort_order ?? 0,
      published_at: form.status === "published" ? new Date().toISOString() : null,
      updated_at: new Date().toISOString(),
    };
    const { error } = await supabase.from("blog_posts" as any).update(payload).eq("id", form.id);
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Blog post saved");
    onSaved();
  };

  const remove = async () => {
    if (!confirm(`Delete "${form.title}"?`)) return;
    const { error } = await supabase.from("blog_posts" as any).delete().eq("id", form.id);
    if (error) return toast.error(error.message);
    toast.success("Blog post deleted");
    onSaved();
  };

  return (
    <div className="border rounded-lg bg-background overflow-hidden">
      <div className="p-4 border-b bg-secondary/40 space-y-3">
        <div className="grid md:grid-cols-5 gap-3">
          <div className="md:col-span-2">
            <Label className="text-xs">Title</Label>
            <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value, slug: form.slug || slugify(e.target.value) })} />
          </div>
          <div className="md:col-span-2">
            <Label className="text-xs">Slug</Label>
            <Input value={form.slug} onChange={(e) => setForm({ ...form, slug: slugify(e.target.value) })} />
          </div>
          <div>
            <Label className="text-xs">Status</Label>
            <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as BlogPost["status"] })}
              className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm">
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </div>
        </div>
        <div>
          <Label className="text-xs">Excerpt</Label>
          <Textarea rows={2} value={form.excerpt ?? ""} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} />
        </div>
      </div>

      <div className="p-3 border-b bg-card space-y-2">
        <div className="flex flex-wrap gap-2 items-center">
        <select onChange={(e) => exec("formatBlock", e.target.value)} className="h-8 rounded-md border px-2 text-xs bg-background" aria-label="Paragraph style">
          <option value="p">Paragraph</option>
          <option value="h1">Heading 1</option>
          <option value="h2">Heading 2</option>
          <option value="h3">Heading 3</option>
          <option value="blockquote">Quote</option>
        </select>
        <select onChange={(e) => exec("fontName", e.target.value)} className="h-8 rounded-md border px-2 text-xs bg-background" aria-label="Font family">
          <option value="Inter">Inter</option>
          <option value="Georgia">Georgia</option>
          <option value="Playfair Display">Playfair</option>
          <option value="Arial">Arial</option>
          <option value="Times New Roman">Times</option>
        </select>
        <select onChange={(e) => exec("fontSize", e.target.value)} className="h-8 rounded-md border px-2 text-xs bg-background" aria-label="Font size">
          <option value="2">Small</option>
          <option value="3">Normal</option>
          <option value="4">Large</option>
          <option value="5">Extra large</option>
          <option value="6">Display</option>
        </select>
        <ToolbarButton label="Undo" onClick={() => exec("undo")}><Undo2 size={14} /></ToolbarButton>
        <ToolbarButton label="Redo" onClick={() => exec("redo")}><Redo2 size={14} /></ToolbarButton>
        <ToolbarButton label="Paragraph" onClick={() => exec("formatBlock", "p")}><Pilcrow size={14} /></ToolbarButton>
        <ToolbarButton label="Heading 1" onClick={() => exec("formatBlock", "h1")}><Heading1 size={14} /></ToolbarButton>
        <ToolbarButton label="Heading 2" onClick={() => exec("formatBlock", "h2")}><Heading2 size={14} /></ToolbarButton>
        <ToolbarButton label="Bold" onClick={() => exec("bold")}><Bold size={14} /></ToolbarButton>
        <ToolbarButton label="Italic" onClick={() => exec("italic")}><Italic size={14} /></ToolbarButton>
        <ToolbarButton label="Underline" onClick={() => exec("underline")}><Underline size={14} /></ToolbarButton>
        <ToolbarButton label="Align left" onClick={() => exec("justifyLeft")}><AlignLeft size={14} /></ToolbarButton>
        <ToolbarButton label="Align center" onClick={() => exec("justifyCenter")}><AlignCenter size={14} /></ToolbarButton>
        <ToolbarButton label="Align right" onClick={() => exec("justifyRight")}><AlignRight size={14} /></ToolbarButton>
        <ToolbarButton label="Justify" onClick={() => exec("justifyFull")}><AlignJustify size={14} /></ToolbarButton>
        <ToolbarButton label="Bullet list" onClick={() => exec("insertUnorderedList")}><List size={14} /></ToolbarButton>
        <ToolbarButton label="Numbered list" onClick={() => exec("insertOrderedList")}><ListOrdered size={14} /></ToolbarButton>
        <ToolbarButton label="Quote" onClick={() => exec("formatBlock", "blockquote")}><Quote size={14} /></ToolbarButton>
        <ToolbarButton label="Line" onClick={() => exec("insertHorizontalRule")}><Minus size={14} /></ToolbarButton>
        <ToolbarButton label="Table" onClick={addTable}><Table2 size={14} /></ToolbarButton>
        <label className="h-8 px-2 rounded-md border bg-background text-xs flex items-center gap-1 cursor-pointer">
          <Palette size={14} />
          <input type="color" className="w-6 h-5 border-0 bg-transparent" onChange={(e) => exec("foreColor", e.target.value)} aria-label="Text color" />
        </label>
        <label className="h-8 px-2 rounded-md border bg-background text-xs flex items-center gap-1 cursor-pointer">
          <Highlighter size={14} />
          <input type="color" className="w-6 h-5 border-0 bg-transparent" onChange={(e) => exec("backColor", e.target.value)} aria-label="Highlight color" />
        </label>
        <ToolbarButton label="Clear formatting" onClick={() => exec("removeFormat")}><Eraser size={14} /></ToolbarButton>
        <ToolbarButton label="Link" onClick={addLink}><LinkIcon size={14} /></ToolbarButton>
        <ToolbarButton label="Button" onClick={addButton}><MousePointerClick size={14} /></ToolbarButton>
        <ToolbarButton label="Callout" onClick={addCallout}><FileText size={14} /></ToolbarButton>
        <label className="h-8 px-3 rounded-md border bg-background text-xs flex items-center gap-2 cursor-pointer hover:bg-accent">
          <Image size={14} /> {uploading ? "Uploading..." : "Image"}
          <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && uploadImage(e.target.files[0])} disabled={uploading} />
        </label>
        </div>
      </div>

      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={syncContent}
        data-placeholder="Start writing the blog post here..."
        className="blog-editor-content min-h-[520px] p-6 md:p-10 bg-white text-foreground leading-relaxed focus:outline-none"
        style={{ fontFamily: "Inter, system-ui, sans-serif" }}
      />

      <div className="p-4 border-t bg-secondary/30 flex flex-wrap gap-2 justify-between">
        <div className="text-xs text-muted-foreground pt-2">
          Content is saved as rich HTML for publishing.
        </div>
        <div className="flex gap-2">
          <Button size="sm" onClick={save} disabled={busy} className="bg-navy-deep hover:bg-navy text-cream">
            <Save size={14} className="mr-1" />{busy ? "Saving..." : "Save Post"}
          </Button>
          <Button size="sm" variant="destructive" onClick={remove}>
            <Trash2 size={14} className="mr-1" />Delete
          </Button>
        </div>
      </div>
    </div>
  );
}

function ToolbarButton({ label, onClick, children }: { label: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" title={label} aria-label={label} onClick={onClick}
      className="h-8 min-w-8 px-2 rounded-md border bg-background text-xs inline-flex items-center justify-center hover:bg-accent">
      {children}
    </button>
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
