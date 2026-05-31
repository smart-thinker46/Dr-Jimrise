import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Download, Megaphone, BookOpen, LayoutDashboard, Search, FileText, ShieldCheck, Eye, ExternalLink, MessageSquare, Phone, Send, CheckCircle2, Clock3,
} from "lucide-react";
import { useAuth, useUserAccessStatus, useUserRole } from "@/hooks/use-auth";
import { useAnnouncements, useResources } from "@/lib/content";
import { DashboardShell, type DashboardNavItem } from "@/components/DashboardShell";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const Route = createFileRoute("/student")({
  head: () => ({ meta: [{ title: "Student Dashboard" }] }),
  component: StudentPage,
});

const NAV: DashboardNavItem[] = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "announcements", label: "Announcements", icon: Megaphone },
  { id: "resources", label: "Resources", icon: BookOpen },
  { id: "messages", label: "Messages", icon: MessageSquare },
];

function StudentPage() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { user, loading } = useAuth();
  const { data: role } = useUserRole(user);
  const { data: accessStatus = "active" } = useUserAccessStatus(user);
  const { data: announcements } = useAnnouncements();
  const { data: resources } = useResources();
  const { data: profile } = useQuery({
    queryKey: ["student_profile_group", user?.id ?? null],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase
        .from("student_profiles" as any)
        .select("first_name,last_name,group_id,student_groups(group_name)")
        .eq("user_id", user!.id)
        .maybeSingle();
      return data as any;
    },
    initialData: null,
    staleTime: 5_000,
    refetchInterval: 15_000,
  });
  const [active, setActive] = useState("overview");
  const [query, setQuery] = useState("");
  const items = announcements ?? [];
  const files = resources ?? [];

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth" });
  }, [loading, user, navigate]);

  useEffect(() => {
    if (role === "admin") navigate({ to: "/admin" });
  }, [role, navigate]);

  useEffect(() => {
    if (!user) return;

    const refreshStudentData = () => {
      qc.invalidateQueries({ queryKey: ["student_profile_group", user.id] });
      qc.invalidateQueries({ queryKey: ["resources"] });
      qc.invalidateQueries({ queryKey: ["resource-directory"] });
    };

    const channel = supabase
      .channel(`student-profile:${user.id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "student_profiles", filter: `user_id=eq.${user.id}` },
        refreshStudentData,
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "resource_group_access" },
        () => {
          qc.invalidateQueries({ queryKey: ["resources"] });
          qc.invalidateQueries({ queryKey: ["resource-directory"] });
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [qc, user]);

  const filteredFiles = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return files;
    return files.filter((r) =>
      [r.title, r.course, r.type].filter(Boolean).some((v) => String(v).toLowerCase().includes(q))
    );
  }, [files, query]);

  if (!user) return null;

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
      userId={user.id}
      nav={nav}
      active={active}
      onSelect={onSelect}
    >
      {accessStatus !== "active" && (
        <Card className="border-destructive/40">
          <CardContent className="pt-6">
            <h2 className="font-serif text-xl font-bold text-navy-deep">
              {accessStatus === "pending" ? "Account pending approval" : "Access restricted"}
            </h2>
            <p className="text-sm text-muted-foreground mt-2">
              {accessStatus === "pending"
                ? "Your account is pending approval. You will be able to access resources once the admin activates it."
                : `Your account is ${accessStatus}. Contact the site administrator if you believe this is a mistake.`}
            </p>
          </CardContent>
        </Card>
      )}
      {accessStatus === "active" && (
      <>
      {active === "overview" && (
        <div className="space-y-6">
          <Card className="border-gold/40 bg-gold/5">
            <CardContent className="pt-5">
              <h2 className="font-serif text-2xl font-bold text-navy-deep">
                Welcome back, {[profile?.first_name, profile?.last_name].filter(Boolean).join(" ") || user.email}
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                {profile?.student_groups?.group_name ? `Group: ${profile.student_groups.group_name}` : "No group assigned yet."}
              </p>
            </CardContent>
          </Card>
          <div className="grid sm:grid-cols-3 gap-4">
            <StatCard label="Announcements" value={items.length} icon={Megaphone} onClick={() => setActive("announcements")} />
            <StatCard label="Resources" value={files.length} icon={BookOpen} onClick={() => setActive("resources")} />
            <StatCard label="Files" value={files.filter((f) => f.file_url).length} icon={FileText} onClick={() => setActive("resources")} />
          </div>

          <Card
            role="button"
            tabIndex={0}
            onClick={() => setActive("announcements")}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                setActive("announcements");
              }
            }}
            className="cursor-pointer hover:border-gold/60 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/60 transition-all"
          >
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2"><Megaphone size={16} className="text-gold" /> Recent announcements</CardTitle>
              <Button size="sm" variant="ghost" onClick={(event) => { event.stopPropagation(); setActive("announcements"); }}>View all</Button>
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

          <Card
            role="button"
            tabIndex={0}
            onClick={() => setActive("resources")}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                setActive("resources");
              }
            }}
            className="cursor-pointer hover:border-gold/60 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/60 transition-all"
          >
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2"><BookOpen size={16} className="text-gold" /> Latest resources</CardTitle>
              <Button size="sm" variant="ghost" onClick={(event) => { event.stopPropagation(); setActive("resources"); }}>Browse all</Button>
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

      {active === "messages" && (
        <StudentMessagePanel
          userId={user.id}
          userEmail={user.email ?? ""}
          fullName={[profile?.first_name, profile?.last_name].filter(Boolean).join(" ")}
        />
      )}
      </>
      )}
    </DashboardShell>
  );
}

type StudentContactMessage = {
  id: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  status: "unread" | "read";
  admin_reply: string | null;
  replied_at: string | null;
  created_at: string;
};

function StudentMessagePanel({ userId, userEmail, fullName }: { userId: string; userEmail: string; fullName: string }) {
  const qc = useQueryClient();
  const [name, setName] = useState(fullName || "");
  const [email, setEmail] = useState(userEmail || "");
  const [phone, setPhone] = useState("");
  const [subject, setSubject] = useState("student");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const { data: messages = [], isLoading, error: messagesError } = useQuery({
    queryKey: ["student", "contact_messages", userId, userEmail],
    queryFn: async () => {
      const normalizedEmail = userEmail.trim().toLowerCase();
      const visibilityFilter = normalizedEmail
        ? `sender_user_id.eq.${userId},email.ilike.${normalizedEmail}`
        : `sender_user_id.eq.${userId}`;
      const { data, error } = await supabase
        .from("contact_messages" as any)
        .select("id,name,email,phone,subject,message,status,admin_reply,replied_at,created_at")
        .or(visibilityFilter)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as StudentContactMessage[];
    },
    enabled: !!userId,
  });

  useEffect(() => {
    if (!userId) return;
    const channel = supabase
      .channel(`student-contact-messages:${userId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "contact_messages", filter: `sender_user_id=eq.${userId}` },
        () => qc.invalidateQueries({ queryKey: ["student", "contact_messages", userId, userEmail] }),
      )
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [qc, userEmail, userId]);

  useEffect(() => {
    setName((value) => value || fullName || "");
  }, [fullName]);

  useEffect(() => {
    setEmail((value) => value || userEmail || "");
  }, [userEmail]);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!name.trim()) return toast.error("Name is required.");
    if (!email.trim()) return toast.error("Email is required.");
    if (!phone.trim()) return toast.error("Phone number is required.");
    if (!message.trim()) return toast.error("Message is required.");

    setSending(true);
    const toastId = toast.loading("Sending message...", {
      description: "Your message will appear in the admin dashboard.",
    });
    const { error } = await supabase.from("contact_messages" as any).insert({
      sender_user_id: userId,
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      subject,
      message: message.trim(),
    });
    setSending(false);

    if (error) return toast.error("Message could not be sent", { id: toastId, description: error.message });
    toast.success("Message sent", { id: toastId, description: "The admin can now read it from the dashboard." });
    setMessage("");
    qc.invalidateQueries({ queryKey: ["student", "contact_messages", userId, userEmail] });
  };

  return (
    <div className="space-y-5">
      <div className="grid gap-5 lg:grid-cols-[1fr_1.4fr]">
        <Card className="border-gold/30 bg-gold/5">
          <CardContent className="pt-6">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-gold text-navy-deep">
              <MessageSquare size={20} />
            </div>
            <h2 className="mt-4 font-serif text-2xl font-bold text-navy-deep">Contact Admin</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Send questions about resources, classes, assignments, account access, or supervision. Your message goes directly to the admin dashboard.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <form onSubmit={submit} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="student-message-name">Name</Label>
                <Input id="student-message-name" value={name} onChange={(event) => setName(event.target.value)} required maxLength={100} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="student-message-email">Email</Label>
                <Input id="student-message-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required maxLength={255} />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="student-message-phone">Phone number</Label>
                <div className="relative">
                  <Phone size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="student-message-phone"
                    type="tel"
                    value={phone}
                    onChange={(event) => setPhone(event.target.value)}
                    required
                    maxLength={40}
                    placeholder="+254 700 000 000"
                    className="pl-9"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="student-message-subject">Subject</Label>
                <select
                  id="student-message-subject"
                  value={subject}
                  onChange={(event) => setSubject(event.target.value)}
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-gold/40"
                >
                  <option value="student">Student Query</option>
                  <option value="resources">Resource Access</option>
                  <option value="assignment">Assignment / Deadline</option>
                  <option value="general">General Enquiry</option>
                  <option value="supervision">Supervision Interest</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="student-message-body">Message</Label>
              <Textarea
                id="student-message-body"
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                required
                rows={7}
                maxLength={2000}
                placeholder="Write your message..."
              />
            </div>

            <Button type="submit" disabled={sending} className="w-full bg-navy-deep hover:bg-navy text-cream">
              {sending ? "Sending..." : (<><Send size={16} className="mr-2" />Send Message</>)}
            </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h3 className="font-serif text-xl font-semibold text-navy-deep">My Messages</h3>
              <p className="text-sm text-muted-foreground">Track messages you have sent and read admin replies.</p>
            </div>
          </div>
          {messagesError ? (
            <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-5">
              <p className="font-semibold text-destructive">Messages could not load</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {messagesError instanceof Error ? messagesError.message : "Please refresh this section."}
              </p>
            </div>
          ) : isLoading ? (
            <p className="text-sm text-muted-foreground">Loading your messages...</p>
          ) : messages.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border bg-secondary/30 p-8 text-center">
              <MessageSquare className="mx-auto mb-3 text-muted-foreground/70" size={28} />
              <p className="font-semibold text-navy-deep">No messages sent yet</p>
              <p className="text-sm text-muted-foreground">Messages you send to admin will appear here.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {messages.map((item) => (
                <div key={item.id} className="rounded-xl border border-border bg-background p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="font-semibold text-navy-deep">{formatStudentSubject(item.subject)}</p>
                      <p className="text-xs text-muted-foreground">{formatStudentDate(item.created_at)}</p>
                    </div>
                    <span className={item.admin_reply ? "inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-1 text-xs font-semibold text-emerald-700" : "inline-flex items-center gap-1 rounded-full bg-gold/15 px-2 py-1 text-xs font-semibold text-navy-deep"}>
                      {item.admin_reply ? <CheckCircle2 size={13} /> : <Clock3 size={13} />}
                      {item.admin_reply ? "Replied" : "Awaiting reply"}
                    </span>
                  </div>
                  <div className="mt-3 rounded-lg bg-secondary/40 p-3">
                    <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">Your message</p>
                    <p className="mt-1 whitespace-pre-line text-sm text-foreground/75">{item.message}</p>
                  </div>
                  {item.admin_reply ? (
                    <div className="mt-3 rounded-lg border border-gold/30 bg-gold/5 p-3">
                      <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-gold">
                        Admin reply {item.replied_at ? `- ${formatStudentDate(item.replied_at)}` : ""}
                      </p>
                      <p className="mt-1 whitespace-pre-line text-sm text-navy-deep">{item.admin_reply}</p>
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function formatStudentSubject(value: string) {
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

function formatStudentDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function StatCard({ label, value, icon: Icon, onClick }: { label: string; value: number; icon: any; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group text-left rounded-xl border border-border bg-card hover:border-gold/60 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/60 transition-all"
      aria-label={`Open ${label}`}
    >
      <div className="p-5 flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">{label}</p>
          <p className="font-serif text-3xl font-bold text-navy-deep mt-1">{value}</p>
        </div>
        <div className="w-10 h-10 rounded-full bg-gold/15 text-gold flex items-center justify-center group-hover:bg-gold group-hover:text-navy-deep transition-colors">
          <Icon size={18} />
        </div>
      </div>
    </button>
  );
}

function ResourceCard({ r }: { r: any }) {
  const action = getResourceAction(r);
  const navigate = useNavigate();
  const openResource = () => {
    if (!action.href) return;
    if (action.kind === "internal") {
      navigate({ to: "/resources/$id", params: { id: r.id } });
      return;
    }
    window.open(action.href, "_blank", "noopener,noreferrer");
  };

  return (
    <Card
      role="button"
      tabIndex={0}
      onClick={openResource}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          openResource();
        }
      }}
      className="cursor-pointer hover:border-gold/60 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/60 transition-all"
    >
      <CardContent className="pt-5">
        <p className="font-semibold text-navy-deep">{r.title}</p>
        <p className="text-xs text-muted-foreground mt-1">{r.course} · {r.type} · {r.date}</p>
        <Button asChild size="sm" variant="outline" className="w-full mt-3" disabled={!action.href} onClick={(event) => event.stopPropagation()}>
          {action.kind === "internal" ? (
            <Link to="/resources/$id" params={{ id: r.id }}>
              <Eye size={14} className="mr-2" />View
            </Link>
          ) : (
            <a href={action.href || "#"} target="_blank" rel="noreferrer" download={action.download || undefined}>
              {action.icon === "external" ? <ExternalLink size={14} className="mr-2" /> : <Download size={14} className="mr-2" />}
              {action.label}
            </a>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}

function getResourceAction(resource: any) {
  if (resource.source_type === "link") {
    return { kind: "external", href: normalizeUrl(resource.link_url), label: "Open Link", icon: "external", download: false };
  }
  if (!resource.file_url) {
    return { kind: "external", href: "", label: "Coming soon", icon: "download", download: false };
  }
  if (resource.allow_download === false) {
    return { kind: "internal", href: `/resources/${resource.id}`, label: "View", icon: "view", download: false };
  }
  return { kind: "external", href: resource.file_url, label: "Download", icon: "download", download: true };
}

function normalizeUrl(value?: string | null) {
  const trimmed = value?.trim() ?? "";
  if (!trimmed) return "";
  if (/^(https?:|mailto:|tel:)/i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}
