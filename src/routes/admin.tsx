import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { Component, useEffect, useRef, useState, type DragEvent, type PointerEvent, type ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Trash2, Save, Plus, ShieldCheck, User, Info, Mail, Megaphone, FolderOpen, BookOpen, Users, UserCog, FilePenLine,
  Bold, Italic, Underline, Link as LinkIcon, Image, MousePointerClick, Palette, List, ListOrdered, Quote,
  Database, LayoutDashboard, BarChart3, Bell, FileText, FileUp, GraduationCap, Activity, AlignLeft, AlignCenter, AlignRight,
  AlignJustify, Undo2, Redo2, Eraser, Minus, Table2, Heading1, Heading2, Pilcrow, Highlighter, MessageSquare, PhoneCall, ChevronDown,
  Maximize2, Captions, PanelLeft, PanelRight, Link2,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth, useUserRole } from "@/hooks/use-auth";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { DashboardShell, type DashboardNavItem } from "@/components/DashboardShell";
import { ResourcesAdmin } from "@/components/admin/ResourcesAdmin";
import { ConfirmAction } from "@/components/ConfirmAction";
import { heroFallback, aboutFallback, contactFallback, homeStatsFallback, useStudentGroups, type StudentGroup } from "@/lib/content";
import { optimizedImageUrl } from "@/lib/images";
import { cn } from "@/lib/utils";
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
  { id: "groups", label: "Groups", icon: Users },
  { id: "messages", label: "Messages", icon: MessageSquare },
  { id: "users", label: "Users", icon: UserCog },
  { id: "blogs", label: "Insights", icon: FilePenLine },
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
      {active === "groups" && <GroupsAdmin />}
      {active === "messages" && <ContactMessagesAdmin />}
      {active === "publications" && <PublicationsAdmin />}
      {active === "supervision" && <SupervisionAdmin />}
      {active === "academic-data" && <AcademicDataAdmin />}
      {active === "users" && (
        <SectionErrorBoundary section="Users">
          <UsersAdmin currentUserId={user.id} />
        </SectionErrorBoundary>
      )}
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
        messages,
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
        countTable("contact_messages"),
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
          messages,
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
    { label: "Messages", value: data?.counts.messages ?? 0, icon: MessageSquare, target: "messages", detail: "Contact enquiries" },
    { label: "Publications", value: data?.counts.publications ?? 0, icon: BookOpen, target: "publications", detail: "Journal and conference items" },
    { label: "Supervision", value: data?.counts.supervision ?? 0, icon: GraduationCap, target: "supervision", detail: "Students listed" },
    { label: "Insights", value: data?.counts.blogs ?? 0, icon: FilePenLine, target: "blogs", detail: `${data?.counts.publishedBlogs ?? 0} recently published` },
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
              className="group text-left rounded-xl border border-border bg-card p-5 hover:border-gold/60 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/60 transition-all"
              aria-label={`Open ${stat.label}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">{stat.label}</p>
                  <p className="font-serif text-3xl font-bold text-navy-deep mt-2">{isLoading ? "..." : stat.value}</p>
                  <p className="text-xs text-muted-foreground mt-1">{stat.detail}</p>
                </div>
                <span className="w-10 h-10 rounded-lg bg-gold/15 flex items-center justify-center text-gold group-hover:bg-gold group-hover:text-navy-deep transition-colors">
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

        <DashboardPanel title="Insight Activity" icon={Activity} action="Open" onAction={() => onSelect("blogs")}>
          {(data?.recentBlogs ?? []).map((item: any) => (
            <NotificationItem key={item.id} title={item.title} meta={`${item.status} · ${formatDate(item.updated_at ?? item.created_at)}`} />
          ))}
          {!isLoading && (data?.recentBlogs ?? []).length === 0 && <EmptyDashboardText text="No insight activity yet." />}
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
    <Card
      role="button"
      tabIndex={0}
      onClick={onAction}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onAction();
        }
      }}
      className="cursor-pointer hover:border-gold/60 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/60 transition-all"
    >
      <CardContent className="pt-6">
        <div className="flex items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <Icon size={18} className="text-gold" />
            <h3 className="font-serif text-lg font-semibold text-navy-deep">{title}</h3>
          </div>
          <Button type="button" variant="outline" size="sm" onClick={(event) => { event.stopPropagation(); onAction(); }}>{action}</Button>
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
    const toastId = toast.loading("Saving site content...", {
      description: "Updating the public website.",
    });
    const { error } = await supabase.from("site_content").upsert({ key: sectionKey, value: form as never });
    if (error) return toast.error("Save failed", { id: toastId, description: error.message });
    toast.success("Site content saved", { id: toastId, description: "The public website has been updated." });
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
                src={optimizedImageUrl(form[imageField] as string, 240, 72, "contain")}
                alt={imageLabel}
                width={144}
                height={176}
                loading="lazy"
                decoding="async"
                className="w-36 h-44 object-contain rounded-lg border bg-background"
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
  const { data: groups = [] } = useStudentGroups();
  const { data = [], isLoading } = useQuery({
    queryKey: ["admin", "announcements"],
    queryFn: async () => {
      const { data, error } = await (supabase.rpc as any)("admin_list_announcements");
      if (error) throw error;
      return data ?? [];
    },
  });
  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["admin", "announcements"] });
    qc.invalidateQueries({ queryKey: ["admin", "dashboard"] });
    qc.invalidateQueries({ queryKey: ["announcements"] });
  };
  useEffect(() => {
    const channel = supabase
      .channel("admin:announcements:groups")
      .on("postgres_changes", { event: "*", schema: "public", table: "announcements" }, () => invalidate())
      .on("postgres_changes", { event: "*", schema: "public", table: "announcement_group_access" }, () => invalidate())
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [qc]);
  const add = async () => {
    const { error } = await supabase.from("announcements").insert({
      title: "New announcement",
      body: "",
      date: new Date().toLocaleDateString(),
      sort_order: 0,
      target_scope: "general",
    } as any);
    if (error) toast.error(error.message); else invalidate();
  };
  return (
    <ListSection title="Announcements" onAdd={add}>
      {isLoading ? <p className="py-6 text-sm text-muted-foreground">Loading announcements...</p> : null}
      {(data ?? []).map((a: any) => <AnnouncementEditor key={a.id} row={a} groups={groups} onChange={invalidate} />)}
    </ListSection>
  );
}

function AnnouncementEditor({ row, groups, onChange }: { row: any; groups: StudentGroup[]; onChange: () => void }) {
  const [form, setForm] = useState<any>({
    ...row,
    target_scope: row.target_scope ?? "general",
    group_ids: row.group_ids ?? [],
  });
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setForm({
      ...row,
      target_scope: row.target_scope ?? "general",
      group_ids: row.group_ids ?? [],
    });
  }, [row]);

  const selectedGroups = new Set<string>(form.group_ids ?? []);
  const toggleGroup = (groupId: string) => {
    const next = new Set(selectedGroups);
    if (next.has(groupId)) next.delete(groupId);
    else next.add(groupId);
    setForm({ ...form, group_ids: Array.from(next), target_scope: "group" });
  };

  const save = async () => {
    if (form.target_scope === "group" && (form.group_ids ?? []).length === 0) {
      return toast.error("Choose at least one group", { description: "Group announcements need a target group." });
    }

    setBusy(true);
    const toastId = toast.loading("Saving announcement...", {
      description: "Updating student dashboard notices.",
    });
    const payload = {
      title: form.title ?? "",
      date: form.date ?? "",
      body: form.body ?? "",
      sort_order: Number(form.sort_order ?? 0),
      target_scope: form.target_scope,
    };
    const { error } = await supabase.from("announcements").update(payload as any).eq("id", row.id);
    if (error) {
      setBusy(false);
      return toast.error("Save failed", { id: toastId, description: error.message });
    }

    const { error: deleteError } = await supabase
      .from("announcement_group_access" as any)
      .delete()
      .eq("announcement_id", row.id);
    if (deleteError) {
      setBusy(false);
      return toast.error("Group update failed", { id: toastId, description: deleteError.message });
    }

    if (form.target_scope === "group") {
      const rows = (form.group_ids ?? []).map((groupId: string) => ({ announcement_id: row.id, group_id: groupId }));
      const { error: insertError } = await supabase.from("announcement_group_access" as any).insert(rows);
      if (insertError) {
        setBusy(false);
        return toast.error("Group update failed", { id: toastId, description: insertError.message });
      }
    }

    setBusy(false);
    toast.success("Announcement saved", { id: toastId });
    onChange();
  };

  const remove = async () => {
    const { error } = await supabase.from("announcements").delete().eq("id", row.id);
    if (error) return toast.error("Delete failed", { description: error.message });
    toast.success("Announcement deleted");
    onChange();
  };

  return (
    <div className="border rounded-lg p-4 bg-background space-y-4">
      <div className="grid sm:grid-cols-2 gap-3">
        <div>
          <Label className="text-xs">Title</Label>
          <Input value={form.title ?? ""} onChange={(event) => setForm({ ...form, title: event.target.value })} />
        </div>
        <div>
          <Label className="text-xs">Date</Label>
          <Input value={form.date ?? ""} onChange={(event) => setForm({ ...form, date: event.target.value })} />
        </div>
        <div>
          <Label className="text-xs">Audience</Label>
          <select
            value={form.target_scope ?? "general"}
            onChange={(event) => setForm({ ...form, target_scope: event.target.value, group_ids: event.target.value === "general" ? [] : form.group_ids })}
            className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
          >
            <option value="general">General announcement</option>
            <option value="group">Specific group(s)</option>
          </select>
        </div>
        <div>
          <Label className="text-xs">Sort order</Label>
          <Input type="number" value={form.sort_order ?? 0} onChange={(event) => setForm({ ...form, sort_order: Number(event.target.value) })} />
        </div>
        <div className="sm:col-span-2">
          <Label className="text-xs">Body</Label>
          <Textarea rows={4} value={form.body ?? ""} onChange={(event) => setForm({ ...form, body: event.target.value })} />
        </div>
      </div>

      {form.target_scope === "group" && (
        <div className="rounded-lg border border-border bg-secondary/30 p-4">
          <Label className="text-xs">Groups who should see this announcement</Label>
          <div className="mt-3 grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {groups.map((group) => (
              <label key={group.id} className="flex items-center gap-2 rounded-md border border-border bg-background px-3 py-2 text-sm">
                <input type="checkbox" checked={selectedGroups.has(group.id)} onChange={() => toggleGroup(group.id)} />
                <span>{group.group_name}</span>
              </label>
            ))}
          </div>
          {groups.length === 0 && <p className="mt-2 text-sm text-muted-foreground">Create student groups first before targeting announcements.</p>}
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="text-xs text-muted-foreground">
          {form.target_scope === "general"
            ? "Visible to everyone and all student dashboards."
            : `Visible only to: ${groups.filter((group) => selectedGroups.has(group.id)).map((group) => group.group_name).join(", ") || "No group selected"}`}
        </div>
        <div className="flex gap-2">
          <Button size="sm" onClick={save} disabled={busy} className="bg-navy-deep hover:bg-navy text-cream"><Save size={14} className="mr-1" />Save</Button>
          <ConfirmAction
            title="Delete announcement?"
            description={`This will permanently remove "${row.title}".`}
            confirmLabel="Delete announcement"
            destructive
            onConfirm={remove}
          >
            <Button size="sm" variant="destructive" disabled={busy}><Trash2 size={14} className="mr-1" />Delete</Button>
          </ConfirmAction>
        </div>
      </div>
    </div>
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
    const toastId = toast.loading("Saving publication...", {
      description: "Updating publication details.",
    });
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
    if (error) toast.error("Save failed", { id: toastId, description: error.message }); else { toast.success("Publication saved", { id: toastId }); onChange(); }
  };

  const remove = async () => {
    const { error } = await supabase.from("publications").delete().eq("id", row.id);
    if (error) toast.error("Delete failed", { description: error.message }); else { toast.success("Publication deleted"); onChange(); }
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
        <ConfirmAction
          title="Delete publication?"
          description={`This will remove "${row.title}" from the website.`}
          confirmLabel="Delete publication"
          destructive
          onConfirm={remove}
        >
          <Button size="sm" variant="destructive" disabled={busy}><Trash2 size={14} className="mr-1" />Delete</Button>
        </ConfirmAction>
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
    const toastId = toast.loading("Saving insight...", {
      description: "Publishing the latest content.",
    });
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
  status: "pending" | "active" | "suspended" | "blocked";
  reason: string | null;
  confirmed: boolean;
  created_at: string;
  last_sign_in_at: string | null;
  first_name?: string | null;
  last_name?: string | null;
  organization_name?: string | null;
  education_level?: string | null;
  program?: string | null;
  group_id?: string | null;
  group_name?: string | null;
};

const EMPTY_ADMIN_USERS: AdminUser[] = [];

function GroupsAdmin() {
  const qc = useQueryClient();
  const { data: groups = [], isLoading, error: groupsError } = useStudentGroups();
  const { data: users = [] } = useQuery({
    queryKey: ["admin", "users"],
    queryFn: async () => {
      const { data, error } = await (supabase.rpc as any)("admin_list_users");
      if (error) throw error;
      return (data ?? []) as AdminUser[];
    },
  });
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const refresh = () => {
    qc.invalidateQueries({ queryKey: ["student_groups"] });
    qc.invalidateQueries({ queryKey: ["admin", "users"] });
  };

  const createGroup = async () => {
    if (!name.trim()) return toast.error("Group name is required.");
    const { error } = await supabase.from("student_groups" as any).insert({
      group_name: name.trim(),
      description: description.trim(),
    });
    if (error) return toast.error("Group creation failed", { description: error.message });
    toast.success("Group created", { description: name.trim() });
    setName("");
    setDescription("");
    refresh();
  };

  return (
    <div className="space-y-5">
      <Card>
        <CardContent className="pt-6 space-y-4">
          <h3 className="font-serif text-xl font-semibold text-navy-deep">Create Student Group</h3>
          <div className="grid md:grid-cols-3 gap-3">
            <div>
              <Label>Group Name</Label>
              <Input value={name} onChange={(event) => setName(event.target.value)} placeholder="e.g. Year 1 Mathematics" />
            </div>
            <div className="md:col-span-2">
              <Label>Description</Label>
              <Input value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Short group description" />
            </div>
          </div>
          <Button onClick={createGroup} className="bg-gold text-navy-deep hover:bg-gold-soft">
            <Plus size={16} className="mr-2" />Create Group
          </Button>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-2 gap-4">
        {groupsError ? (
          <div className="lg:col-span-2 rounded-xl border border-destructive/30 bg-destructive/5 p-5">
            <p className="font-semibold text-destructive">Groups could not load</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {groupsError instanceof Error ? groupsError.message : "Please refresh this section."}
            </p>
          </div>
        ) : isLoading ? (
          <p className="text-sm text-muted-foreground">Loading groups...</p>
        ) : groups.length === 0 ? (
          <div className="lg:col-span-2 rounded-xl border border-dashed border-border bg-secondary/30 p-10 text-center">
            <Users className="mx-auto mb-3 text-muted-foreground/70" size={30} />
            <p className="font-semibold text-navy-deep">No groups found</p>
            <p className="text-sm text-muted-foreground">Create the first student group above.</p>
          </div>
        ) : groups.map((group) => (
          <GroupCard
            key={group.id}
            group={group}
            students={users.filter((user) => user.group_id === group.id)}
            onChange={refresh}
          />
        ))}
      </div>
    </div>
  );
}

function GroupCard({ group, students, onChange }: { group: StudentGroup; students: AdminUser[]; onChange: () => void }) {
  const [name, setName] = useState(group.group_name);
  const [description, setDescription] = useState(group.description);
  useEffect(() => {
    setName(group.group_name);
    setDescription(group.description);
  }, [group]);

  const save = async () => {
    const { error } = await supabase
      .from("student_groups" as any)
      .update({ group_name: name.trim(), description: description.trim() })
      .eq("id", group.id);
    if (error) return toast.error("Group save failed", { description: error.message });
    toast.success("Group saved", { description: name.trim() });
    onChange();
  };

  const remove = async () => {
    const { error } = await supabase.from("student_groups" as any).delete().eq("id", group.id);
    if (error) return toast.error("Group delete failed", { description: error.message });
    toast.success("Group deleted", { description: group.group_name });
    onChange();
  };

  return (
    <Card>
      <CardContent className="pt-6 space-y-4">
        <div className="grid gap-3">
          <div>
            <Label>Group Name</Label>
            <Input value={name} onChange={(event) => setName(event.target.value)} />
          </div>
          <div>
            <Label>Description</Label>
            <Textarea rows={2} value={description} onChange={(event) => setDescription(event.target.value)} />
          </div>
        </div>
        <div className="rounded-lg bg-secondary/40 p-3">
          <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Students in this group</p>
          <div className="mt-2 space-y-1">
            {students.length === 0 ? (
              <p className="text-sm text-muted-foreground italic">No students assigned yet.</p>
            ) : students.map((student) => (
              <p key={student.id} className="text-sm text-navy-deep">
                {[student.first_name, student.last_name].filter(Boolean).join(" ") || student.email}
                <span className="text-muted-foreground"> · {student.status}</span>
              </p>
            ))}
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button size="sm" onClick={save} className="bg-navy-deep text-cream hover:bg-navy">
            <Save size={14} className="mr-1" />Save
          </Button>
          <ConfirmAction
            title="Delete group?"
            description={`This removes "${group.group_name}". Students in it will become unassigned.`}
            confirmLabel="Delete group"
            destructive
            onConfirm={remove}
          >
            <Button size="sm" variant="destructive">
              <Trash2 size={14} className="mr-1" />Delete
            </Button>
          </ConfirmAction>
        </div>
      </CardContent>
    </Card>
  );
}

type ContactMessage = {
  id: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  sender_user_id?: string | null;
  status: "unread" | "read";
  admin_reply?: string | null;
  replied_at?: string | null;
  replied_by?: string | null;
  created_at: string;
};

function ContactMessagesAdmin() {
  const qc = useQueryClient();
  const [query, setQuery] = useState("");

  const { data = [], isLoading } = useQuery({
    queryKey: ["admin", "contact_messages"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("contact_messages" as any)
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as ContactMessage[];
    },
  });

  useEffect(() => {
    const channel = supabase
      .channel("admin:contact_messages")
      .on("postgres_changes", { event: "*", schema: "public", table: "contact_messages" }, () => {
        qc.invalidateQueries({ queryKey: ["admin", "contact_messages"] });
        qc.invalidateQueries({ queryKey: ["admin", "dashboard"] });
      })
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [qc]);

  const refresh = () => {
    qc.invalidateQueries({ queryKey: ["admin", "contact_messages"] });
    qc.invalidateQueries({ queryKey: ["admin", "dashboard"] });
  };

  const filtered = data.filter((item) => {
    const needle = query.trim().toLowerCase();
    if (!needle) return true;
    return [item.name, item.email, item.phone, item.subject, item.message]
      .filter(Boolean)
      .some((value) => value.toLowerCase().includes(needle));
  });

  const markStatus = async (id: string, status: "unread" | "read") => {
    const { error } = await supabase.from("contact_messages" as any).update({ status }).eq("id", id);
    if (error) return toast.error("Status update failed", { description: error.message });
    toast.success(status === "read" ? "Message marked as read" : "Message marked as unread");
    refresh();
  };

  const remove = async (item: ContactMessage) => {
    const { error } = await supabase.from("contact_messages" as any).delete().eq("id", item.id);
    if (error) return toast.error("Delete failed", { description: error.message });
    toast.success("Message deleted", { description: `${item.name} - ${item.subject}` });
    refresh();
  };

  const unread = data.filter((item) => item.status === "unread").length;

  return (
    <div className="space-y-5">
      <div className="grid sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-5">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Total Messages</p>
            <p className="font-serif text-3xl font-bold text-navy-deep mt-1">{data.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Unread</p>
            <p className="font-serif text-3xl font-bold text-gold mt-1">{unread}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Read</p>
            <p className="font-serif text-3xl font-bold text-navy-deep mt-1">{data.length - unread}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div>
              <h3 className="font-serif text-xl font-semibold text-navy-deep">Contact Form Messages</h3>
              <p className="text-sm text-muted-foreground">Messages submitted from the public contact page.</p>
            </div>
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search messages..."
              className="md:max-w-xs"
            />
          </div>

          {isLoading ? (
            <p className="py-8 text-sm text-muted-foreground">Loading messages...</p>
          ) : filtered.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border bg-secondary/30 p-10 text-center">
              <MessageSquare className="mx-auto mb-3 text-muted-foreground/70" size={30} />
              <p className="font-semibold text-navy-deep">No messages found</p>
              <p className="text-sm text-muted-foreground">New contact form submissions will appear here.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map((item) => (
                <AdminMessageCard
                  key={item.id}
                  item={item}
                  onReplySaved={refresh}
                  onToggleStatus={() => markStatus(item.id, item.status === "read" ? "unread" : "read")}
                  onDelete={() => remove(item)}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function AdminMessageCard({
  item,
  onReplySaved,
  onToggleStatus,
  onDelete,
}: {
  item: ContactMessage;
  onReplySaved: () => void;
  onToggleStatus: () => void;
  onDelete: () => void;
}) {
  const [reply, setReply] = useState(item.admin_reply ?? "");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setReply(item.admin_reply ?? "");
  }, [item.admin_reply]);

  const saveReply = async () => {
    if (!reply.trim()) return toast.error("Reply message is required.");
    setSaving(true);
    const { data: sessionData } = await supabase.auth.getSession();
    const { error } = await supabase
      .from("contact_messages" as any)
      .update({
        admin_reply: reply.trim(),
        replied_at: new Date().toISOString(),
        replied_by: sessionData.session?.user.id ?? null,
        status: "read",
      })
      .eq("id", item.id);
    setSaving(false);
    if (error) return toast.error("Reply could not be saved", { description: error.message });
    toast.success("Reply saved", { description: item.sender_user_id ? "The student can now see it in their dashboard." : "Reply saved on this message." });
    onReplySaved();
  };

  return (
    <div className="rounded-xl border border-border bg-background p-4">
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-semibold text-navy-deep">{item.name}</p>
            <span className={item.status === "unread" ? "rounded-full bg-gold/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-navy-deep" : "rounded-full bg-secondary px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground"}>
              {item.status}
            </span>
            {item.sender_user_id && (
              <span className="rounded-full bg-navy-deep/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-navy-deep">
                Student dashboard
              </span>
            )}
            {item.admin_reply && (
              <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                Replied
              </span>
            )}
            <span className="text-xs text-muted-foreground">{formatDate(item.created_at)}</span>
          </div>
          <p className="mt-1 text-sm font-medium text-navy-deep">{formatMessageSubject(item.subject)}</p>
          <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-foreground/75">{item.message}</p>
          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
            <a href={`mailto:${item.email}`} className="inline-flex items-center gap-1 hover:text-gold">
              <Mail size={13} /> {item.email}
            </a>
            <a href={`tel:${item.phone}`} className="inline-flex items-center gap-1 hover:text-gold">
              <PhoneCall size={13} /> {item.phone}
            </a>
          </div>
          <div className="mt-4 rounded-lg border border-border bg-secondary/30 p-3">
            <Label className="text-xs">Admin Reply</Label>
            <Textarea
              value={reply}
              onChange={(event) => setReply(event.target.value)}
              rows={3}
              maxLength={2000}
              placeholder="Write a reply the student can see in their dashboard..."
              className="mt-2 bg-background"
            />
            {item.replied_at && (
              <p className="mt-2 text-xs text-muted-foreground">Last replied: {formatDate(item.replied_at)}</p>
            )}
            <Button size="sm" className="mt-3 bg-navy-deep text-cream hover:bg-navy" disabled={saving} onClick={saveReply}>
              {saving ? "Saving..." : "Save Reply"}
            </Button>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 lg:justify-end">
          <Button asChild size="sm" variant="outline">
            <a href={`mailto:${item.email}?subject=${encodeURIComponent(`Re: ${formatMessageSubject(item.subject)}`)}`}>
              Email
            </a>
          </Button>
          <Button size="sm" variant="outline" onClick={onToggleStatus}>
            Mark {item.status === "read" ? "unread" : "read"}
          </Button>
          <ConfirmAction
            title="Delete message?"
            description={`This will permanently remove the message from ${item.name}.`}
            confirmLabel="Delete message"
            destructive
            onConfirm={onDelete}
          >
            <Button size="sm" variant="destructive">
              <Trash2 size={14} className="mr-1" />Delete
            </Button>
          </ConfirmAction>
        </div>
      </div>
    </div>
  );
}

function formatMessageSubject(value: string) {
  const labels: Record<string, string> = {
    student: "Student Query",
    resources: "Resource Access",
    assignment: "Assignment / Deadline",
    general: "General Enquiry",
    research: "Research Collaboration",
    supervision: "Supervision Interest",
  };
  return labels[value] ?? value;
}

function UsersAdmin({ currentUserId }: { currentUserId: string }) {
  const qc = useQueryClient();
  const { data: groups = [], isLoading: groupsLoading, error: groupsError } = useStudentGroups();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"student" | "admin" | "user">("student");
  const [search, setSearch] = useState("");
  const [groupFilter, setGroupFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");
  const [confirmedFilter, setConfirmedFilter] = useState("all");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [expandedIds, setExpandedIds] = useState<string[]>([]);
  const [bulkGroup, setBulkGroup] = useState("unassigned");
  const [busy, setBusy] = useState(false);

  const { data: usersData = EMPTY_ADMIN_USERS, isLoading, error: usersError } = useQuery({
    queryKey: ["admin", "users"],
    queryFn: async () => {
      const { data, error } = await (supabase.rpc as any)("admin_list_users");
      if (error) throw error;
      return (data ?? []) as AdminUser[];
    },
  });
  const data = Array.isArray(usersData) ? usersData : EMPTY_ADMIN_USERS;

  const refresh = async () => {
    await qc.invalidateQueries({ queryKey: ["admin", "users"] });
  };

  const filteredUsers = data.filter((user) => {
    const q = search.trim().toLowerCase();
    if (q && ![user.email, user.first_name, user.last_name, user.group_name, user.organization_name, user.program].some((value) => String(value ?? "").toLowerCase().includes(q))) return false;
    if (groupFilter !== "all" && (user.group_id ?? "unassigned") !== groupFilter) return false;
    if (statusFilter !== "all" && user.status !== statusFilter) return false;
    if (roleFilter !== "all" && user.role !== roleFilter) return false;
    if (confirmedFilter !== "all" && String(Boolean(user.confirmed)) !== confirmedFilter) return false;
    return true;
  });
  const selectableUsers = filteredUsers.filter((user) => user.id !== currentUserId);
  const selectedUsers = data.filter((user) => selectedIds.includes(user.id) && user.id !== currentUserId);
  const allVisibleSelected = selectableUsers.length > 0 && selectableUsers.every((user) => selectedIds.includes(user.id));

  const toggleSelected = (id: string) => {
    setSelectedIds((ids) => ids.includes(id) ? ids.filter((item) => item !== id) : [...ids, id]);
  };

  const toggleAllVisible = () => {
    setSelectedIds((ids) => {
      const visible = selectableUsers.map((user) => user.id);
      if (visible.length === 0) return ids;
      if (visible.every((id) => ids.includes(id))) return ids.filter((id) => !visible.includes(id));
      return Array.from(new Set([...ids, ...visible]));
    });
  };

  const toggleExpanded = (id: string) => {
    setExpandedIds((ids) => ids.includes(id) ? ids.filter((item) => item !== id) : [...ids, id]);
  };

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
    if (error) toast.error(error.message); else { await refresh(); toast.success("Role updated"); }
  };

  const setUserStatus = async (id: string, nextStatus: string, reason = "") => {
    const { error } = await (supabase.rpc as any)("admin_set_user_status", {
      target_user_id: id,
      new_status: nextStatus,
      status_reason: reason,
    });
    if (error) toast.error("Status update failed", { description: error.message }); else { await refresh(); toast.success("Status updated", { description: `User is now ${nextStatus}.` }); }
  };

  const setUserGroup = async (id: string, groupId: string) => {
    const toastId = toast.loading("Updating group...");
    const { error } = await (supabase.rpc as any)("admin_set_user_group", {
      target_user_id: id,
      target_group_id: groupId === "unassigned" ? null : groupId,
    });
    if (error) return toast.error("Group update failed", { id: toastId, description: error.message });
    await refresh();
    toast.success("Group updated", { id: toastId });
  };

  const deleteUser = async (id: string, userEmail: string) => {
    const { error } = await (supabase.rpc as any)("admin_delete_user", { target_user_id: id });
    if (error) toast.error("Delete failed", { description: error.message }); else { await refresh(); toast.success("User deleted", { description: userEmail }); }
  };

  const bulkSetStatus = async (nextStatus: "active" | "suspended" | "blocked") => {
    if (selectedUsers.length === 0) return toast.error("Select at least one user.");
    const toastId = toast.loading("Updating selected users...");
    const results = await Promise.all(selectedUsers.map((user) =>
      (supabase.rpc as any)("admin_set_user_status", {
        target_user_id: user.id,
        new_status: nextStatus,
        status_reason: nextStatus === "active" ? "" : `Bulk ${nextStatus} by admin`,
      })
    ));
    const failed = results.find((result) => result.error);
    if (failed?.error) return toast.error("Bulk update failed", { id: toastId, description: failed.error.message });
    toast.success(`${selectedUsers.length} user${selectedUsers.length === 1 ? "" : "s"} updated`, { id: toastId });
    setSelectedIds([]);
    await refresh();
  };

  const bulkSetGroup = async () => {
    if (selectedUsers.length === 0) return toast.error("Select at least one user.");
    const toastId = toast.loading("Assigning selected users...");
    const results = await Promise.all(selectedUsers.map((user) =>
      (supabase.rpc as any)("admin_set_user_group", {
        target_user_id: user.id,
        target_group_id: bulkGroup === "unassigned" ? null : bulkGroup,
      })
    ));
    const failed = results.find((result) => result.error);
    if (failed?.error) return toast.error("Group assignment failed", { id: toastId, description: failed.error.message });
    toast.success(`${selectedUsers.length} user${selectedUsers.length === 1 ? "" : "s"} assigned`, { id: toastId });
    setSelectedIds([]);
    await refresh();
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
          <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div>
              <h3 className="font-serif text-xl font-semibold text-navy-deep">Site Users</h3>
              <p className="text-sm text-muted-foreground">
                {filteredUsers.length} shown from {data.length} total · {selectedUsers.length} selected
              </p>
              {groupsError && (
                <p className="mt-1 text-xs text-destructive">
                  Groups could not load: {groupsError instanceof Error ? groupsError.message : "Refresh this section."}
                </p>
              )}
            </div>
            {(search || groupFilter !== "all" || statusFilter !== "all" || roleFilter !== "all" || confirmedFilter !== "all") && (
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => {
                  setSearch("");
                  setGroupFilter("all");
                  setStatusFilter("all");
                  setRoleFilter("all");
                  setConfirmedFilter("all");
                }}
              >
                Clear Filters
              </Button>
            )}
          </div>

          <div className="mb-4 grid md:grid-cols-5 gap-3">
            <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search name, email, group, program..." className="md:col-span-2" />
            <select value={groupFilter} onChange={(event) => setGroupFilter(event.target.value)} className="h-10 rounded-md border border-input bg-background px-3 text-sm">
              <option value="all">{groupsLoading ? "Loading groups..." : "All groups"}</option>
              <option value="unassigned">Unassigned</option>
              {groups.map((group) => <option key={group.id} value={group.id}>{group.group_name}</option>)}
            </select>
            <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="h-10 rounded-md border border-input bg-background px-3 text-sm">
              <option value="all">All statuses</option>
              <option value="pending">Pending</option>
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
              <option value="blocked">Blocked</option>
            </select>
            <select value={roleFilter} onChange={(event) => setRoleFilter(event.target.value)} className="h-10 rounded-md border border-input bg-background px-3 text-sm">
              <option value="all">All roles</option>
              <option value="admin">Admin</option>
              <option value="student">Student</option>
              <option value="user">User</option>
            </select>
            <select value={confirmedFilter} onChange={(event) => setConfirmedFilter(event.target.value)} className="h-10 rounded-md border border-input bg-background px-3 text-sm">
              <option value="all">All confirmations</option>
              <option value="true">Confirmed</option>
              <option value="false">Unconfirmed</option>
            </select>
          </div>

          <div className="mb-4 rounded-lg border border-border bg-secondary/30 p-3">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Bulk actions</p>
                <p className="text-sm text-navy-deep">{selectedUsers.length} selectable user{selectedUsers.length === 1 ? "" : "s"} selected</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button type="button" size="sm" variant="outline" disabled={selectedUsers.length === 0} onClick={() => bulkSetStatus("active")}>
                  Activate
                </Button>
                <Button type="button" size="sm" variant="outline" disabled={selectedUsers.length === 0} onClick={() => bulkSetStatus("suspended")}>
                  Suspend
                </Button>
                <Button type="button" size="sm" variant="outline" disabled={selectedUsers.length === 0} onClick={() => bulkSetStatus("blocked")}>
                  Block Resources
                </Button>
                <select value={bulkGroup} onChange={(event) => setBulkGroup(event.target.value)} className="h-9 rounded-md border border-input bg-background px-3 text-sm">
                  <option value="unassigned">{groupsLoading ? "Loading groups..." : "Unassigned"}</option>
                  {groups.map((group) => <option key={group.id} value={group.id}>{group.group_name}</option>)}
                </select>
                <Button type="button" size="sm" className="bg-navy-deep text-cream hover:bg-navy" disabled={selectedUsers.length === 0} onClick={bulkSetGroup}>
                  Assign Group
                </Button>
                {selectedUsers.length > 0 && (
                  <Button type="button" size="sm" variant="ghost" onClick={() => setSelectedIds([])}>
                    Clear Selection
                  </Button>
                )}
              </div>
            </div>
          </div>

          {usersError ? (
            <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-5">
              <p className="font-semibold text-destructive">Could not load users</p>
              <p className="mt-1 text-sm text-muted-foreground">{usersError instanceof Error ? usersError.message : "Please try refreshing this section."}</p>
            </div>
          ) : isLoading ? (
            <p className="text-muted-foreground">Loading users...</p>
          ) : filteredUsers.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border bg-secondary/30 p-10 text-center">
              <Users className="mx-auto mb-3 text-muted-foreground/70" size={30} />
              <p className="font-semibold text-navy-deep">No users match these filters</p>
              <p className="text-sm text-muted-foreground">Adjust the filters or search term to widen the list.</p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-border">
              <table className="w-full min-w-[980px] text-sm">
                <thead className="bg-secondary/70 text-xs uppercase tracking-[0.12em] text-muted-foreground">
                  <tr>
                    <th className="w-10 px-3 py-3 text-left">
                      <input
                        type="checkbox"
                        checked={allVisibleSelected}
                        onChange={toggleAllVisible}
                        aria-label="Select all visible users"
                      />
                    </th>
                    <th className="px-3 py-3 text-left">User</th>
                    <th className="px-3 py-3 text-left">Role</th>
                    <th className="px-3 py-3 text-left">Status</th>
                    <th className="px-3 py-3 text-left">Group</th>
                    <th className="px-3 py-3 text-left">Joined</th>
                    <th className="px-3 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border bg-background">
              {filteredUsers.map((u) => (
                <UserTableRows
                  key={u.id}
                  user={u}
                  groups={groups}
                  currentUserId={currentUserId}
                  selected={selectedIds.includes(u.id)}
                  expanded={expandedIds.includes(u.id)}
                  onSelect={() => toggleSelected(u.id)}
                  onExpand={() => toggleExpanded(u.id)}
                  setUserRole={setUserRole}
                  setUserStatus={setUserStatus}
                  setUserGroup={setUserGroup}
                  deleteUser={deleteUser}
                />
              ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function UserTableRows({
  user,
  groups,
  currentUserId,
  selected,
  expanded,
  onSelect,
  onExpand,
  setUserRole,
  setUserStatus,
  setUserGroup,
  deleteUser,
}: {
  user: AdminUser;
  groups: StudentGroup[];
  currentUserId: string;
  selected: boolean;
  expanded: boolean;
  onSelect: () => void;
  onExpand: () => void;
  setUserRole: (id: string, nextRole: string) => void | Promise<void>;
  setUserStatus: (id: string, nextStatus: string, reason?: string) => void | Promise<void>;
  setUserGroup: (id: string, groupId: string) => void | Promise<void>;
  deleteUser: (id: string, userEmail: string) => void | Promise<void>;
}) {
  const fullName = [user.first_name, user.last_name].filter(Boolean).join(" ") || user.email || "Unnamed user";
  const isCurrentUser = user.id === currentUserId;

  return (
    <>
      <tr className={cn("transition-colors hover:bg-secondary/30", selected && "bg-gold/5")}>
        <td className="px-3 py-3 align-middle">
          <input
            type="checkbox"
            checked={selected}
            onChange={onSelect}
            disabled={isCurrentUser}
            aria-label={`Select ${user.email}`}
          />
        </td>
        <td className="px-3 py-3 align-middle">
          <button type="button" onClick={onExpand} className="flex min-w-0 items-center gap-2 text-left">
            <ChevronDown size={15} className={cn("shrink-0 text-muted-foreground transition-transform", expanded && "rotate-180")} />
            <span className="min-w-0">
              <span className="block font-semibold text-navy-deep">{fullName}</span>
              <span className="block max-w-[260px] truncate text-xs text-muted-foreground">{user.email}</span>
            </span>
          </button>
        </td>
        <td className="px-3 py-3 align-middle">
          <span className="rounded-full bg-secondary px-2 py-1 text-xs font-semibold capitalize text-navy-deep">{user.role}</span>
        </td>
        <td className="px-3 py-3 align-middle">
          <span className={cn("rounded-full px-2 py-1 text-xs font-semibold capitalize", userStatusClass(user.status))}>
            {user.status}
          </span>
        </td>
        <td className="px-3 py-3 align-middle">
          <select
            value={user.group_id ?? "unassigned"}
            onChange={(event) => setUserGroup(user.id, event.target.value)}
            onClick={(event) => event.stopPropagation()}
            className="h-9 w-full min-w-[180px] rounded-md border border-input bg-background px-2 text-xs text-navy-deep outline-none focus:ring-2 focus:ring-gold/40"
            aria-label={`Assign group for ${user.email}`}
          >
            <option value="unassigned">Unassigned</option>
            {groups.map((group) => <option key={group.id} value={group.id}>{group.group_name}</option>)}
          </select>
        </td>
        <td className="px-3 py-3 align-middle text-xs text-muted-foreground">{formatDate(user.created_at)}</td>
        <td className="px-3 py-3 align-middle text-right">
          <div className="flex justify-end gap-2">
            {user.status === "pending" && (
              <Button size="sm" className="bg-gold text-navy-deep hover:bg-gold-soft" onClick={() => setUserStatus(user.id, "active", "")}>
                Approve
              </Button>
            )}
            <Button type="button" size="sm" variant="outline" onClick={onExpand}>
              {expanded ? "Hide" : "Details"}
            </Button>
          </div>
        </td>
      </tr>
      {expanded && (
        <tr className="bg-secondary/20">
          <td colSpan={7} className="px-4 py-4">
            <div className="grid gap-4 lg:grid-cols-[1.2fr_1fr_1.2fr]">
              <div className="rounded-lg border border-border bg-background p-4">
                <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Profile</p>
                <div className="grid gap-2 text-sm">
                  <UserDetail label="Email" value={user.email} />
                  <UserDetail label="Organization" value={user.organization_name} />
                  <UserDetail label="Education" value={user.education_level ? formatEducationLevel(user.education_level) : ""} />
                  <UserDetail label="Program" value={user.program} />
                  <UserDetail label="Confirmed" value={user.confirmed ? "Confirmed" : "Unconfirmed"} />
                  <UserDetail label="Last sign in" value={user.last_sign_in_at ? formatDate(user.last_sign_in_at) : "Never"} />
                  {user.reason && <UserDetail label="Reason" value={user.reason} tone="danger" />}
                </div>
              </div>

              <div className="rounded-lg border border-border bg-background p-4">
                <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Role & Group</p>
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-2">
                    {["admin", "student", "user"].map((role) => (
                      <Button
                        key={role}
                        size="sm"
                        variant={user.role === role ? "default" : "outline"}
                        onClick={() => setUserRole(user.id, role)}
                        disabled={isCurrentUser && role !== "admin"}
                        className={user.role === role ? "bg-navy-deep text-cream hover:bg-navy" : ""}
                      >
                        {role}
                      </Button>
                    ))}
                  </div>
                  <div>
                    <Label className="text-xs">Assigned Group</Label>
                    <select
                      value={user.group_id ?? "unassigned"}
                      onChange={(event) => setUserGroup(user.id, event.target.value)}
                      className="mt-1 h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                    >
                      <option value="unassigned">Unassigned</option>
                      {groups.map((group) => <option key={group.id} value={group.id}>{group.group_name}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              <div className="rounded-lg border border-border bg-background p-4">
                <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Account Actions</p>
                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant={user.status === "active" ? "default" : "outline"}
                    onClick={() => setUserStatus(user.id, "active", "")}
                    className={user.status === "active" ? "bg-gold text-navy-deep hover:bg-gold-soft" : ""}
                  >
                    Active
                  </Button>
                  <UserStatusAction
                    label="Suspend"
                    userEmail={user.email}
                    status="suspended"
                    disabled={isCurrentUser}
                    onConfirm={(reason) => setUserStatus(user.id, "suspended", reason)}
                  />
                  <UserStatusAction
                    label="Block Resources"
                    userEmail={user.email}
                    status="blocked"
                    disabled={isCurrentUser}
                    onConfirm={(reason) => setUserStatus(user.id, "blocked", reason)}
                  />
                  <ConfirmAction
                    title="Delete user?"
                    description={`This will remove ${user.email}'s login account. This action cannot be undone.`}
                    confirmLabel="Delete user"
                    destructive
                    onConfirm={() => deleteUser(user.id, user.email)}
                  >
                    <Button size="sm" variant="destructive" disabled={isCurrentUser}>
                      <Trash2 size={14} className="mr-1" />Delete
                    </Button>
                  </ConfirmAction>
                </div>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

function UserDetail({ label, value, tone }: { label: string; value?: string | null; tone?: "danger" }) {
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">{label}</p>
      <p className={cn("text-sm text-navy-deep", tone === "danger" && "text-destructive")}>{value || "Not provided"}</p>
    </div>
  );
}

function userStatusClass(status: AdminUser["status"]) {
  if (status === "active") return "bg-emerald-500/10 text-emerald-700";
  if (status === "pending") return "bg-gold/15 text-navy-deep";
  if (status === "suspended") return "bg-amber-500/10 text-amber-700";
  return "bg-destructive/10 text-destructive";
}

function UserStatusAction({
  label,
  userEmail,
  status,
  disabled,
  onConfirm,
}: {
  label: string;
  userEmail: string;
  status: "suspended" | "blocked";
  disabled?: boolean;
  onConfirm: (reason: string) => void | Promise<void>;
}) {
  const [reason, setReason] = useState("");

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button size="sm" variant="outline" disabled={disabled}>{label}</Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="max-w-md overflow-hidden rounded-2xl border-border p-0 shadow-2xl shadow-navy-deep/20">
        <div className="border-b border-border bg-secondary/50 px-6 py-5">
          <AlertDialogHeader className="space-y-2 text-left">
            <AlertDialogTitle className="font-serif text-xl text-navy-deep">
              {status === "blocked" ? "Block resource access?" : "Suspend user?"}
            </AlertDialogTitle>
            <AlertDialogDescription className="leading-relaxed">
              This will mark {userEmail} as {status}. Add a short reason for admin records.
            </AlertDialogDescription>
          </AlertDialogHeader>
        </div>
        <div className="px-6 py-4">
          <Label htmlFor={`reason-${status}-${userEmail}`}>Reason</Label>
          <Textarea
            id={`reason-${status}-${userEmail}`}
            rows={3}
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            placeholder={status === "blocked" ? "e.g. Resource misuse" : "e.g. Account review pending"}
            maxLength={300}
          />
        </div>
        <AlertDialogFooter className="gap-2 px-6 py-4 sm:space-x-0">
          <AlertDialogCancel asChild>
            <Button type="button" variant="outline">Cancel</Button>
          </AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button
              type="button"
              className="bg-navy-deep text-cream hover:bg-navy"
              onClick={() => {
                onConfirm(reason.trim());
                setReason("");
              }}
            >
              Confirm
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
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
    const title = "New insight";
    const slug = `${slugify(title)}-${Date.now()}`;
    const { error } = await supabase.from("blog_posts" as any).insert({
      title,
      slug,
      excerpt: "",
      content: "",
      author_name: "Dr. Jimrise Ochwach, PhD",
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
            <h3 className="font-serif text-xl font-semibold text-navy-deep">Insight Writer</h3>
            <p className="text-sm text-muted-foreground mt-1">Write rich insights with formatted text, images, links, and call-to-action buttons.</p>
          </div>
          <Button size="sm" onClick={add} className="bg-gold text-navy-deep hover:bg-gold-soft">
            <Plus size={14} className="mr-1" />New Insight
          </Button>
        </div>
        {isLoading ? (
          <p className="text-muted-foreground">Loading insights...</p>
        ) : (
          <div className="space-y-4">
            {(data ?? []).map((b: any) => (
              <BlogPostEditor key={b.id} post={b} onSaved={invalidate} />
            ))}
            {(data ?? []).length === 0 && (
              <p className="text-sm text-muted-foreground italic">No insights yet.</p>
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
  cover_image_url?: string | null;
  author_id?: string | null;
  author_name?: string | null;
  status: "draft" | "published";
  sort_order: number;
};

function BlogPostEditor({ post, onSaved }: { post: BlogPost; onSaved: () => void }) {
  const editorRef = useRef<HTMLDivElement | null>(null);
  const { user } = useAuth();
  const [form, setForm] = useState<BlogPost>(post);
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [coverUploading, setCoverUploading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<HTMLImageElement | null>(null);
  const savedSelectionRef = useRef<Range | null>(null);
  const [activePanel, setActivePanel] = useState<null | "link" | "embed" | "button" | "table" | "image">(null);
  const [linkDraft, setLinkDraft] = useState({ url: "", text: "" });
  const [embedDraft, setEmbedDraft] = useState({ url: "", title: "", description: "" });
  const [buttonDraft, setButtonDraft] = useState({ label: "Read more", url: "" });
  const [tableDraft, setTableDraft] = useState({ rows: 3, cols: 3 });
  const [imageDraft, setImageDraft] = useState({ caption: "", link: "", width: "60", crop: "none", focusX: "50", focusY: "50" });
  const dragImageRef = useRef<HTMLElement | null>(null);
  const cropDragRef = useRef<{ image: HTMLImageElement; rect: DOMRect } | null>(null);

  useEffect(() => {
    setForm(post);
    setSelectedImage(null);
    if (editorRef.current) editorRef.current.innerHTML = post.content ?? "";
  }, [post]);

  const syncContent = () => {
    setForm((f) => ({ ...f, content: editorRef.current?.innerHTML ?? "" }));
  };

  const saveSelection = () => {
    const selection = window.getSelection();
    if (!selection?.rangeCount) return;
    const range = selection.getRangeAt(0);
    if (editorRef.current?.contains(range.commonAncestorContainer)) {
      savedSelectionRef.current = range.cloneRange();
    }
  };

  const restoreSelection = () => {
    const selection = window.getSelection();
    if (!selection || !savedSelectionRef.current) return;
    selection.removeAllRanges();
    selection.addRange(savedSelectionRef.current);
  };

  const openPanel = (panel: NonNullable<typeof activePanel>) => {
    saveSelection();
    if (panel === "image" && selectedImage) {
      const figure = selectedFigure();
      setImageDraft({
        caption: figure?.querySelector("figcaption")?.textContent ?? "",
        link: selectedImage.closest("a")?.getAttribute("href") ?? "",
        width: (figure?.style.width || "60%").replace("%", ""),
        crop: figure?.dataset.crop || "none",
        focusX: selectedImage.style.objectPosition.split(" ")[0]?.replace("%", "") || "50",
        focusY: selectedImage.style.objectPosition.split(" ")[1]?.replace("%", "") || "50",
      });
    }
    setActivePanel((current) => (current === panel ? null : panel));
  };

  const selectImageFromTarget = (target: EventTarget | null) => {
    if (target instanceof HTMLImageElement) {
      setSelectedImage(target);
      const figure = target.closest("figure");
      setImageDraft({
        caption: figure?.querySelector("figcaption")?.textContent ?? "",
        link: target.closest("a")?.getAttribute("href") ?? "",
        width: ((figure as HTMLElement | null)?.style.width || "60%").replace("%", ""),
        crop: (figure as HTMLElement | null)?.dataset.crop || "none",
        focusX: target.style.objectPosition.split(" ")[0]?.replace("%", "") || "50",
        focusY: target.style.objectPosition.split(" ")[1]?.replace("%", "") || "50",
      });
      return;
    }
    const element = target instanceof HTMLElement ? target : null;
    const image = element?.closest("figure")?.querySelector("img") ?? null;
    setSelectedImage(image);
  };

  const exec = (command: string, value?: string) => {
    restoreSelection();
    editorRef.current?.focus();
    document.execCommand(command, false, value);
    syncContent();
    saveSelection();
  };

  const insertHtml = (html: string) => {
    restoreSelection();
    editorRef.current?.focus();
    document.execCommand("insertHTML", false, html);
    syncContent();
    saveSelection();
  };

  const escapeHtml = (value: string) =>
    value.replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char] ?? char);

  const normalizeUrl = (url: string) => {
    if (!url || url === "#") return "#";
    if (/^(https?:|mailto:|tel:)/i.test(url)) return url;
    return `https://${url}`;
  };

  const addLink = () => {
    const url = normalizeUrl(linkDraft.url);
    if (!linkDraft.url) return toast.error("Enter a link URL.");
    if (linkDraft.text.trim()) {
      insertHtml(`<a href="${url}" target="_blank" rel="noopener noreferrer">${escapeHtml(linkDraft.text.trim())}</a>`);
    } else {
      exec("createLink", url);
    }
    setLinkDraft({ url: "", text: "" });
    setActivePanel(null);
  };

  const addEmbeddedLink = () => {
    const url = normalizeUrl(embedDraft.url);
    if (!embedDraft.url) return toast.error("Enter a link URL.");
    const title = embedDraft.title || "Open linked resource";
    const description = embedDraft.description || "Click to open this resource in a new tab.";
    let host = "";
    try {
      host = new URL(url).hostname.replace(/^www\./, "");
    } catch {
      host = url;
    }
    insertHtml(`
      <a href="${url}" target="_blank" rel="noopener noreferrer" class="blog-link-embed" style="display:block;border:1px solid #d8dee8;border-radius:8px;padding:16px 18px;margin:18px 0;text-decoration:none;background:#ffffff;color:#1a2e4a;">
        <span style="display:block;font-size:12px;text-transform:uppercase;letter-spacing:.08em;color:#c9a84c;font-weight:800;margin-bottom:6px;">${escapeHtml(host)}</span>
        <strong style="display:block;font-size:18px;color:#1a2e4a;margin-bottom:6px;">${escapeHtml(title)}</strong>
        <span style="display:block;color:#64748b;font-weight:500;line-height:1.55;">${escapeHtml(description)}</span>
      </a>
    `);
    setEmbedDraft({ url: "", title: "", description: "" });
    setActivePanel(null);
  };

  const addButton = () => {
    const url = normalizeUrl(buttonDraft.url || "#");
    insertHtml(`<a href="${url}" class="blog-button" style="display:inline-block;background:#1a2e4a;color:#fff;padding:10px 16px;border-radius:6px;text-decoration:none;font-weight:700;margin:10px 0;">${escapeHtml(buttonDraft.label || "Read more")}</a>`);
    setButtonDraft({ label: "Read more", url: "" });
    setActivePanel(null);
  };

  const addCallout = () => {
    insertHtml(`<div class="blog-callout" style="border-left:4px solid #c9a84c;background:#f8f3df;padding:14px 16px;margin:14px 0;border-radius:6px;"><strong>Note:</strong> Write your important message here.</div>`);
  };

  const addTable = () => {
    const rows = Math.max(1, tableDraft.rows || 3);
    const cols = Math.max(1, tableDraft.cols || 3);
    const header = `<tr>${Array.from({ length: cols }, (_, i) => `<th>Heading ${i + 1}</th>`).join("")}</tr>`;
    const body = Array.from({ length: rows - 1 }, () => `<tr>${Array.from({ length: cols }, () => "<td>Text</td>").join("")}</tr>`).join("");
    insertHtml(`<table class="blog-table" style="width:100%;border-collapse:collapse;margin:16px 0;">${header}${body}</table>`);
    setActivePanel(null);
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
    const alt = imageDraft.caption ?? "";
    insertHtml(`<figure class="blog-image-block" draggable="true" data-crop="none" style="margin:16px auto;width:100%;max-width:100%;"><img src="${optimizedImageUrl(data.publicUrl, 1200)}" alt="${alt.replace(/"/g, "&quot;")}" loading="lazy" decoding="async" style="width:100%;max-width:100%;height:auto;border-radius:8px;display:block;margin:0 auto;object-position:50% 50%;" /><figcaption style="font-size:13px;color:#64748b;margin-top:6px;text-align:center;">${alt}</figcaption></figure>`);
    setUploading(false);
    toast.success("Image inserted");
  };

  const uploadCoverImage = async (file: File) => {
    setCoverUploading(true);
    const optimizedFile = await compressImageFile(file, 1800, 0.78);
    const path = `blogs/${form.id}/cover-${Date.now()}-${optimizedFile.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
    const { error } = await supabase.storage.from("public-assets").upload(path, optimizedFile, { upsert: true, contentType: optimizedFile.type });
    if (error) {
      setCoverUploading(false);
      return toast.error(error.message);
    }
    const { data } = supabase.storage.from("public-assets").getPublicUrl(path);
    setForm((current) => ({ ...current, cover_image_url: optimizedImageUrl(data.publicUrl, 1200) }));
    setCoverUploading(false);
    toast.success("Insight hero image uploaded");
  };

  const selectedFigure = () => selectedImage?.closest("figure") as HTMLElement | null;

  const updateImageLayout = (position: "left" | "center" | "right" | "full") => {
    const figure = selectedFigure();
    if (!figure || !selectedImage) return toast.error("Select an image inside the editor first.");

    figure.classList.add("blog-image-block");
    figure.style.maxWidth = "100%";
    selectedImage.style.width = "100%";
    selectedImage.style.maxWidth = "100%";
    selectedImage.style.height = "auto";
    selectedImage.style.display = "block";

    if (position === "left") {
      figure.style.float = "left";
      figure.style.margin = "8px 24px 16px 0";
      if (!figure.style.width || figure.style.width === "100%") figure.style.width = "45%";
      selectedImage.style.margin = "0";
    } else if (position === "right") {
      figure.style.float = "right";
      figure.style.margin = "8px 0 16px 24px";
      if (!figure.style.width || figure.style.width === "100%") figure.style.width = "45%";
      selectedImage.style.margin = "0";
    } else if (position === "full") {
      figure.style.float = "none";
      figure.style.width = "100%";
      figure.style.margin = "18px 0";
      selectedImage.style.margin = "0 auto";
    } else {
      figure.style.float = "none";
      figure.style.margin = "18px auto";
      selectedImage.style.margin = "0 auto";
    }
    syncContent();
  };

  const resizeSelectedImage = (width: string) => {
    const figure = selectedFigure();
    if (!figure || !selectedImage) return toast.error("Select an image inside the editor first.");
    figure.classList.add("blog-image-block");
    figure.style.width = width;
    figure.style.maxWidth = "100%";
    selectedImage.style.width = "100%";
    selectedImage.style.maxWidth = "100%";
    selectedImage.style.height = "auto";
    syncContent();
  };

  const applyImageCrop = (crop: string, focusX = imageDraft.focusX, focusY = imageDraft.focusY) => {
    const figure = selectedFigure();
    if (!figure || !selectedImage) return toast.error("Select an image inside the editor first.");
    figure.classList.add("blog-image-block");
    figure.dataset.crop = crop;
    selectedImage.style.width = "100%";
    selectedImage.style.maxWidth = "100%";
    selectedImage.style.display = "block";
    selectedImage.style.objectPosition = `${focusX}% ${focusY}%`;
    if (crop === "none") {
      selectedImage.style.height = "auto";
      selectedImage.style.aspectRatio = "";
      selectedImage.style.objectFit = "";
    } else {
      selectedImage.style.height = "auto";
      selectedImage.style.aspectRatio = crop;
      selectedImage.style.objectFit = "cover";
    }
    setImageDraft((draft) => ({ ...draft, crop, focusX, focusY }));
    syncContent();
  };

  const startCropDrag = (event: PointerEvent<HTMLDivElement>) => {
    if (!(event.target instanceof HTMLImageElement)) return;
    if (!event.target.closest(".blog-image-block")) return;
    setSelectedImage(event.target);
    if ((event.target.closest("figure") as HTMLElement | null)?.dataset.crop === "none") return;
    cropDragRef.current = { image: event.target, rect: event.target.getBoundingClientRect() };
    event.target.setPointerCapture(event.pointerId);
  };

  const moveCropFocus = (event: PointerEvent<HTMLDivElement>) => {
    if (!cropDragRef.current) return;
    const { image, rect } = cropDragRef.current;
    const x = Math.round(Math.min(100, Math.max(0, ((event.clientX - rect.left) / rect.width) * 100)));
    const y = Math.round(Math.min(100, Math.max(0, ((event.clientY - rect.top) / rect.height) * 100)));
    image.style.objectPosition = `${x}% ${y}%`;
    setImageDraft((draft) => ({ ...draft, focusX: String(x), focusY: String(y) }));
  };

  const stopCropDrag = () => {
    if (cropDragRef.current) syncContent();
    cropDragRef.current = null;
  };

  const handleImageDragStart = (event: DragEvent<HTMLDivElement>) => {
    const figure = (event.target as HTMLElement | null)?.closest?.("figure.blog-image-block") as HTMLElement | null;
    if (!figure) return;
    dragImageRef.current = figure;
    figure.classList.add("is-dragging");
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", "blog-image-block");
  };

  const handleImageDragOver = (event: DragEvent<HTMLDivElement>) => {
    if (!dragImageRef.current) return;
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  };

  const handleImageDrop = (event: DragEvent<HTMLDivElement>) => {
    const figure = dragImageRef.current;
    if (!figure || !editorRef.current) return;
    event.preventDefault();
    const range = (document as Document & { caretRangeFromPoint?: (x: number, y: number) => Range | null }).caretRangeFromPoint?.(event.clientX, event.clientY);
    if (range && editorRef.current.contains(range.commonAncestorContainer)) {
      range.insertNode(figure);
      figure.classList.remove("is-dragging");
      setSelectedImage(figure.querySelector("img"));
      syncContent();
    }
    dragImageRef.current = null;
  };

  const handleImageDragEnd = () => {
    dragImageRef.current?.classList.remove("is-dragging");
    dragImageRef.current = null;
  };

  const setCustomImageWidth = (value = imageDraft.width) => {
    const width = value;
    if (!width) return;
    const numeric = Math.min(100, Math.max(15, Number(width)));
    if (!Number.isFinite(numeric)) return toast.error("Enter a valid width number.");
    resizeSelectedImage(`${numeric}%`);
    setImageDraft((draft) => ({ ...draft, width: String(numeric) }));
  };

  const editImageCaption = (value = imageDraft.caption) => {
    const figure = selectedFigure();
    if (!figure) return toast.error("Select an image inside the editor first.");
    let caption = figure.querySelector("figcaption") as HTMLElement | null;
    const text = value ?? "";
    if (!caption) {
      caption = document.createElement("figcaption");
      caption.style.fontSize = "13px";
      caption.style.color = "#64748b";
      caption.style.marginTop = "6px";
      caption.style.textAlign = "center";
      figure.appendChild(caption);
    }
    caption.textContent = text;
    syncContent();
  };

  const linkSelectedImage = (value = imageDraft.link) => {
    if (!selectedImage) return toast.error("Select an image inside the editor first.");
    const url = normalizeUrl(value || "");
    if (!url || url === "#") return;
    const existingLink = selectedImage.closest("a");
    if (existingLink && editorRef.current?.contains(existingLink)) {
      existingLink.setAttribute("href", url);
      existingLink.setAttribute("target", "_blank");
      existingLink.setAttribute("rel", "noopener noreferrer");
    } else {
      const link = document.createElement("a");
      link.href = url;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      selectedImage.parentNode?.insertBefore(link, selectedImage);
      link.appendChild(selectedImage);
    }
    syncContent();
  };

  const applyImageSettings = () => {
    setCustomImageWidth(imageDraft.width);
    applyImageCrop(imageDraft.crop, imageDraft.focusX, imageDraft.focusY);
    editImageCaption(imageDraft.caption);
    if (imageDraft.link) linkSelectedImage(imageDraft.link);
    setActivePanel(null);
  };

  const save = async () => {
    setBusy(true);
    const toastId = toast.loading("Saving insight...");
    const payload = {
      title: form.title,
      slug: form.slug || slugify(form.title),
      excerpt: form.excerpt,
      content: editorRef.current?.innerHTML ?? form.content,
      cover_image_url: form.cover_image_url || null,
      author_id: form.author_id || user?.id || null,
      author_name: form.author_name || "Dr. Jimrise Ochwach, PhD",
      status: form.status,
      sort_order: form.sort_order ?? 0,
      published_at: form.status === "published" ? new Date().toISOString() : null,
      updated_at: new Date().toISOString(),
    };
    const { error } = await supabase.from("blog_posts" as any).update(payload).eq("id", form.id);
    setBusy(false);
    if (error) return toast.error("Save failed", { id: toastId, description: error.message });
    toast.success("Insight saved", { id: toastId, description: form.status === "published" ? "Published content is now updated." : "Draft changes were saved." });
    onSaved();
  };

  const remove = async () => {
    const { error } = await supabase.from("blog_posts" as any).delete().eq("id", form.id);
    if (error) return toast.error("Delete failed", { description: error.message });
    toast.success("Insight deleted", { description: form.title });
    onSaved();
  };

  return (
    <div className="border rounded-lg bg-slate-100 overflow-hidden shadow-sm">
      <div className="p-4 border-b bg-white space-y-3">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <h4 className="font-serif text-lg font-semibold text-navy-deep">{form.title || "Untitled insight"}</h4>
            <p className="text-xs text-muted-foreground">Draft, format, insert media, then save or publish from one workspace.</p>
          </div>
          <div className="flex gap-2">
            <Button size="sm" onClick={save} disabled={busy} className="bg-navy-deep hover:bg-navy text-cream">
              <Save size={14} className="mr-1" />{busy ? "Saving..." : "Save"}
            </Button>
            <ConfirmAction
              title="Delete insight?"
              description={`This will permanently remove "${form.title}".`}
              confirmLabel="Delete insight"
              destructive
              onConfirm={remove}
            >
              <Button size="sm" variant="destructive">
                <Trash2 size={14} className="mr-1" />Delete
              </Button>
            </ConfirmAction>
          </div>
        </div>
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
        <div className="grid gap-3 lg:grid-cols-[220px_1fr]">
          <div className="overflow-hidden rounded-lg border bg-secondary/30 aspect-[16/10]">
            {form.cover_image_url ? (
              <img
                src={optimizedImageUrl(form.cover_image_url, 600)}
                alt=""
                className="h-full w-full object-cover"
                loading="lazy"
                decoding="async"
              />
            ) : (
              <div className="flex h-full items-center justify-center px-4 text-center text-xs text-muted-foreground">
                Hero image preview
              </div>
            )}
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <div>
              <Label className="text-xs">Insight hero image</Label>
              <label className="mt-1 flex h-10 items-center justify-center gap-2 rounded-md border bg-background px-3 text-sm cursor-pointer hover:bg-accent">
                <Image size={15} />
                {coverUploading ? "Uploading..." : form.cover_image_url ? "Change hero image" : "Upload hero image"}
                <input type="file" accept="image/*" className="hidden" disabled={coverUploading} onChange={(e) => e.target.files?.[0] && uploadCoverImage(e.target.files[0])} />
              </label>
              {form.cover_image_url && (
                <Button type="button" size="sm" variant="ghost" className="mt-1 px-0 text-xs text-destructive hover:text-destructive" onClick={() => setForm({ ...form, cover_image_url: null })}>
                  Remove image
                </Button>
              )}
            </div>
            <div>
              <Label className="text-xs">Author full name</Label>
              <Input
                value={form.author_name ?? "Dr. Jimrise Ochwach, PhD"}
                onChange={(e) => setForm({ ...form, author_name: e.target.value })}
                placeholder="Dr. Jimrise Ochwach, PhD"
              />
              <p className="mt-1 text-xs text-muted-foreground">This name appears on public insight cards.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="sticky top-0 z-20 p-3 border-b bg-white/95 backdrop-blur space-y-2 shadow-sm">
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
        <ToolbarButton label="Table" onClick={() => openPanel("table")}><Table2 size={14} /></ToolbarButton>
        <label className="h-8 px-2 rounded-md border bg-background text-xs flex items-center gap-1 cursor-pointer">
          <Palette size={14} />
          <input type="color" className="w-6 h-5 border-0 bg-transparent" onChange={(e) => exec("foreColor", e.target.value)} aria-label="Text color" />
        </label>
        <label className="h-8 px-2 rounded-md border bg-background text-xs flex items-center gap-1 cursor-pointer">
          <Highlighter size={14} />
          <input type="color" className="w-6 h-5 border-0 bg-transparent" onChange={(e) => exec("backColor", e.target.value)} aria-label="Highlight color" />
        </label>
        <ToolbarButton label="Clear formatting" onClick={() => exec("removeFormat")}><Eraser size={14} /></ToolbarButton>
        <ToolbarButton label="Link" onClick={() => openPanel("link")}><LinkIcon size={14} /></ToolbarButton>
        <ToolbarButton label="Embed link card" onClick={() => openPanel("embed")}><Link2 size={14} /></ToolbarButton>
        <ToolbarButton label="Button" onClick={() => openPanel("button")}><MousePointerClick size={14} /></ToolbarButton>
        <ToolbarButton label="Callout" onClick={addCallout}><FileText size={14} /></ToolbarButton>
        <label className="h-8 px-3 rounded-md border bg-background text-xs flex items-center gap-2 cursor-pointer hover:bg-accent">
          <Image size={14} /> {uploading ? "Uploading..." : "Image"}
          <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && uploadImage(e.target.files[0])} disabled={uploading} />
        </label>
        </div>
        <div className="flex flex-wrap gap-2 items-center rounded-md border bg-secondary/30 p-2">
          <span className="text-xs font-semibold text-navy-deep px-1">
            {selectedImage ? "Image selected" : "Select an image to resize or position"}
          </span>
          <ToolbarButton label="Image left" onClick={() => updateImageLayout("left")}><PanelLeft size={14} /></ToolbarButton>
          <ToolbarButton label="Image center" onClick={() => updateImageLayout("center")}><AlignCenter size={14} /></ToolbarButton>
          <ToolbarButton label="Image right" onClick={() => updateImageLayout("right")}><PanelRight size={14} /></ToolbarButton>
          <ToolbarButton label="Full width image" onClick={() => updateImageLayout("full")}><Maximize2 size={14} /></ToolbarButton>
          <button type="button" onClick={() => resizeSelectedImage("25%")} className="h-8 px-2 rounded-md border bg-background text-xs hover:bg-accent">25%</button>
          <button type="button" onClick={() => resizeSelectedImage("50%")} className="h-8 px-2 rounded-md border bg-background text-xs hover:bg-accent">50%</button>
          <button type="button" onClick={() => resizeSelectedImage("75%")} className="h-8 px-2 rounded-md border bg-background text-xs hover:bg-accent">75%</button>
          <button type="button" onClick={() => resizeSelectedImage("100%")} className="h-8 px-2 rounded-md border bg-background text-xs hover:bg-accent">100%</button>
          <ToolbarButton label="Image settings" onClick={() => openPanel("image")}><Captions size={14} /></ToolbarButton>
        </div>
        {activePanel && (
          <div className="rounded-lg border bg-white p-3 shadow-sm">
            {activePanel === "link" && (
              <div className="grid gap-2 md:grid-cols-[1fr_1fr_auto] items-end">
                <div>
                  <Label className="text-xs">URL</Label>
                  <Input value={linkDraft.url} onChange={(e) => setLinkDraft({ ...linkDraft, url: e.target.value })} placeholder="https://example.com" />
                </div>
                <div>
                  <Label className="text-xs">Text optional</Label>
                  <Input value={linkDraft.text} onChange={(e) => setLinkDraft({ ...linkDraft, text: e.target.value })} placeholder="Leave empty to link selected text" />
                </div>
                <PanelActions onApply={addLink} onCancel={() => setActivePanel(null)} />
              </div>
            )}
            {activePanel === "embed" && (
              <div className="grid gap-2 md:grid-cols-3 items-end">
                <div>
                  <Label className="text-xs">URL</Label>
                  <Input value={embedDraft.url} onChange={(e) => setEmbedDraft({ ...embedDraft, url: e.target.value })} placeholder="https://example.com" />
                </div>
                <div>
                  <Label className="text-xs">Title</Label>
                  <Input value={embedDraft.title} onChange={(e) => setEmbedDraft({ ...embedDraft, title: e.target.value })} placeholder="Resource title" />
                </div>
                <div>
                  <Label className="text-xs">Description</Label>
                  <Input value={embedDraft.description} onChange={(e) => setEmbedDraft({ ...embedDraft, description: e.target.value })} placeholder="Short description" />
                </div>
                <div className="md:col-span-3 flex justify-end">
                  <PanelActions onApply={addEmbeddedLink} onCancel={() => setActivePanel(null)} />
                </div>
              </div>
            )}
            {activePanel === "button" && (
              <div className="grid gap-2 md:grid-cols-[1fr_1fr_auto] items-end">
                <div>
                  <Label className="text-xs">Button text</Label>
                  <Input value={buttonDraft.label} onChange={(e) => setButtonDraft({ ...buttonDraft, label: e.target.value })} />
                </div>
                <div>
                  <Label className="text-xs">URL</Label>
                  <Input value={buttonDraft.url} onChange={(e) => setButtonDraft({ ...buttonDraft, url: e.target.value })} placeholder="https://example.com" />
                </div>
                <PanelActions onApply={addButton} onCancel={() => setActivePanel(null)} />
              </div>
            )}
            {activePanel === "table" && (
              <div className="grid gap-2 md:grid-cols-[140px_140px_auto] items-end">
                <div>
                  <Label className="text-xs">Rows</Label>
                  <Input type="number" min={1} value={tableDraft.rows} onChange={(e) => setTableDraft({ ...tableDraft, rows: Number(e.target.value) })} />
                </div>
                <div>
                  <Label className="text-xs">Columns</Label>
                  <Input type="number" min={1} value={tableDraft.cols} onChange={(e) => setTableDraft({ ...tableDraft, cols: Number(e.target.value) })} />
                </div>
                <PanelActions onApply={addTable} onCancel={() => setActivePanel(null)} />
              </div>
            )}
            {activePanel === "image" && (
              <div className="space-y-3">
                <div className="grid gap-2 md:grid-cols-[1fr_1fr_160px_auto] items-end">
                <div>
                  <Label className="text-xs">Caption</Label>
                  <Input value={imageDraft.caption} onChange={(e) => setImageDraft({ ...imageDraft, caption: e.target.value })} placeholder="Image caption" />
                </div>
                <div>
                  <Label className="text-xs">Image link optional</Label>
                  <Input value={imageDraft.link} onChange={(e) => setImageDraft({ ...imageDraft, link: e.target.value })} placeholder="https://example.com" />
                </div>
                <div>
                  <Label className="text-xs">Width %</Label>
                  <Input type="number" min={15} max={100} value={imageDraft.width} onChange={(e) => setImageDraft({ ...imageDraft, width: e.target.value })} />
                </div>
                <PanelActions onApply={applyImageSettings} onCancel={() => setActivePanel(null)} />
                </div>
                <div className="grid gap-3 md:grid-cols-[1fr_1fr]">
                  <div className="rounded-md border bg-secondary/20 p-3">
                    <div className="flex items-center justify-between gap-3">
                      <Label className="text-xs">Resize image</Label>
                      <span className="text-xs font-semibold text-navy-deep">{imageDraft.width}%</span>
                    </div>
                    <input
                      type="range"
                      min={15}
                      max={100}
                      value={imageDraft.width}
                      onChange={(e) => {
                        setImageDraft({ ...imageDraft, width: e.target.value });
                        setCustomImageWidth(e.target.value);
                      }}
                      className="mt-2 w-full accent-[#c9a84c]"
                    />
                  </div>
                  <div className="rounded-md border bg-secondary/20 p-3">
                    <Label className="text-xs">Crop shape</Label>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {[
                        ["none", "Original"],
                        ["16 / 9", "Wide"],
                        ["4 / 3", "Standard"],
                        ["1 / 1", "Square"],
                        ["3 / 4", "Portrait"],
                      ].map(([value, label]) => (
                        <button
                          key={value}
                          type="button"
                          onClick={() => applyImageCrop(value)}
                          className={cn("h-8 rounded-md border px-2 text-xs hover:bg-accent", imageDraft.crop === value && "border-gold bg-gold/10 text-navy-deep")}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="rounded-md border bg-secondary/20 p-3 md:col-span-2">
                    <div className="flex items-center justify-between gap-3 flex-wrap">
                      <Label className="text-xs">Crop focus</Label>
                      <span className="text-xs text-muted-foreground">For cropped images, drag directly on the image or use these sliders.</span>
                    </div>
                    <div className="grid gap-3 md:grid-cols-2 mt-2">
                      <label className="text-xs text-muted-foreground">
                        Horizontal {imageDraft.focusX}%
                        <input
                          type="range"
                          min={0}
                          max={100}
                          value={imageDraft.focusX}
                          onChange={(e) => applyImageCrop(imageDraft.crop, e.target.value, imageDraft.focusY)}
                          className="mt-1 w-full accent-[#c9a84c]"
                        />
                      </label>
                      <label className="text-xs text-muted-foreground">
                        Vertical {imageDraft.focusY}%
                        <input
                          type="range"
                          min={0}
                          max={100}
                          value={imageDraft.focusY}
                          onChange={(e) => applyImageCrop(imageDraft.crop, imageDraft.focusX, e.target.value)}
                          className="mt-1 w-full accent-[#c9a84c]"
                        />
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="blog-editor-stage px-3 py-6 md:px-8 md:py-10">
        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          onInput={syncContent}
          onClick={(e) => { selectImageFromTarget(e.target); saveSelection(); }}
          onPointerDown={startCropDrag}
          onPointerMove={moveCropFocus}
          onPointerUp={stopCropDrag}
          onPointerCancel={stopCropDrag}
          onDragStart={handleImageDragStart}
          onDragOver={handleImageDragOver}
          onDrop={handleImageDrop}
          onDragEnd={handleImageDragEnd}
          onKeyUp={saveSelection}
          onMouseUp={saveSelection}
          onBlur={saveSelection}
          data-placeholder="Start writing the insight here..."
          className="blog-editor-content min-h-[720px] p-6 md:p-12 bg-white text-foreground leading-relaxed focus:outline-none"
          style={{ fontFamily: "Inter, system-ui, sans-serif" }}
        />
      </div>

      <div className="p-4 border-t bg-secondary/30 flex flex-wrap gap-2 justify-between">
        <div className="text-xs text-muted-foreground pt-2">
          Content is saved as rich HTML for publishing.
        </div>
        <div className="flex gap-2">
          <Button size="sm" onClick={save} disabled={busy} className="bg-navy-deep hover:bg-navy text-cream">
            <Save size={14} className="mr-1" />{busy ? "Saving..." : "Save Post"}
          </Button>
          <ConfirmAction
            title="Delete insight?"
            description={`This will permanently remove "${form.title}".`}
            confirmLabel="Delete insight"
            destructive
            onConfirm={remove}
          >
            <Button size="sm" variant="destructive">
              <Trash2 size={14} className="mr-1" />Delete
            </Button>
          </ConfirmAction>
        </div>
      </div>
    </div>
  );
}

function PanelActions({ onApply, onCancel }: { onApply: () => void; onCancel: () => void }) {
  return (
    <div className="flex gap-2 justify-end">
      <Button type="button" size="sm" onClick={onApply} className="bg-navy-deep text-cream hover:bg-navy">
        Apply
      </Button>
      <Button type="button" size="sm" variant="outline" onClick={onCancel}>
        Cancel
      </Button>
    </div>
  );
}

function ToolbarButton({ label, onClick, children }: { label: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" title={label} aria-label={label} onMouseDown={(e) => e.preventDefault()} onClick={onClick}
      className="h-8 min-w-8 px-2 rounded-md border bg-background text-xs inline-flex items-center justify-center hover:bg-accent">
      {children}
    </button>
  );
}

type RowField = { name: string; label: string; textarea?: boolean; number?: boolean };

class SectionErrorBoundary extends Component<
  { section: string; children: ReactNode },
  { error: Error | null }
> {
  state = { error: null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error) {
    console.error(`${this.props.section} section failed`, error);
  }

  render() {
    if (this.state.error) {
      return (
        <Card>
          <CardContent className="pt-6">
            <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-5">
              <h3 className="font-serif text-xl font-semibold text-destructive">{this.props.section} could not load</h3>
              <p className="mt-2 text-sm text-muted-foreground">{this.state.error.message}</p>
              <Button type="button" className="mt-4" variant="outline" onClick={() => this.setState({ error: null })}>
                Try again
              </Button>
            </div>
          </CardContent>
        </Card>
      );
    }

    return this.props.children;
  }
}

function RowEditor({
  table, row, fields, onChange, fileField, fileBucket,
}: { table: string; row: any; fields: RowField[]; onChange: () => void; fileField?: string; fileBucket?: string }) {
  const [form, setForm] = useState<any>(row);
  const [busy, setBusy] = useState(false);
  useEffect(() => setForm(row), [row]);

  const save = async () => {
    setBusy(true);
    const toastId = toast.loading("Saving item...", {
      description: "Updating this section.",
    });
    const payload: any = { ...form };
    delete payload.id; delete payload.created_at;
    const { error } = await supabase.from(table as any).update(payload).eq("id", row.id);
    setBusy(false);
    if (error) toast.error("Save failed", { id: toastId, description: error.message }); else { toast.success("Item saved", { id: toastId }); onChange(); }
  };
  const remove = async () => {
    const { error } = await supabase.from(table as any).delete().eq("id", row.id);
    if (error) toast.error("Delete failed", { description: error.message }); else { toast.success("Item deleted"); onChange(); }
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
        <ConfirmAction
          title="Delete item?"
          description="This will permanently remove this item from the website."
          confirmLabel="Delete item"
          destructive
          onConfirm={remove}
        >
          <Button size="sm" variant="destructive"><Trash2 size={14} className="mr-1" />Delete</Button>
        </ConfirmAction>
      </div>
    </div>
  );
}
