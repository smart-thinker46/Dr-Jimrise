import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Download, Megaphone, BookOpen, LayoutDashboard, Search, FileText, ShieldCheck, Eye, ExternalLink, MessageSquare, Phone, Send, CheckCircle2, Clock3,
  BellRing, Trash2, ClipboardList, Upload,
} from "lucide-react";
import { useAuth, useUserAccessStatus, useUserRole } from "@/hooks/use-auth";
import { useAnnouncements, useResources, type Announcement } from "@/lib/content";
import { DashboardShell, type DashboardNavItem } from "@/components/DashboardShell";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { seoHead } from "@/lib/seo";
import { ConfirmAction } from "@/components/ConfirmAction";

export const Route = createFileRoute("/student")({
  head: () => seoHead({
    title: "Student Dashboard - Dr. Jimrise Ochwach",
    description: "Private student dashboard for course resources, announcements, messages, and profile settings.",
    path: "/student",
    noIndex: true,
  }),
  component: StudentPage,
});

const NAV: DashboardNavItem[] = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "announcements", label: "Announcements", icon: Megaphone },
  { id: "resources", label: "Resources", icon: BookOpen },
  { id: "assignments", label: "Assignments", icon: ClipboardList },
  { id: "messages", label: "Messages", icon: MessageSquare },
];

function StudentPage() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { user, loading } = useAuth();
  const { data: role } = useUserRole(user);
  const { data: accessStatus = "active" } = useUserAccessStatus(user);
  const { data: announcements, isLoading: announcementsLoading, error: announcementsError } = useAnnouncements(user?.id ? `student:${user.id}` : "student");
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
      qc.invalidateQueries({ queryKey: ["announcements"] });
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
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "announcements" },
        () => qc.invalidateQueries({ queryKey: ["announcements"] }),
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "announcement_group_access" },
        () => qc.invalidateQueries({ queryKey: ["announcements"] }),
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

          <AnnouncementSpotlight
            announcements={items}
            isLoading={announcementsLoading}
            error={announcementsError}
            onViewAll={() => setActive("announcements")}
          />

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
              {announcementsLoading ? <p className="text-sm text-muted-foreground">Loading announcements...</p> : null}
              {announcementsError ? (
                <p className="text-sm text-destructive">Announcements could not load. Please refresh.</p>
              ) : null}
              {!announcementsLoading && !announcementsError && items.slice(0, 3).map((a) => (
                <AnnouncementListItem key={a.id} announcement={a} />
              ))}
              {!announcementsLoading && !announcementsError && items.length === 0 && <p className="text-sm text-muted-foreground italic">No announcements yet.</p>}
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
        <div className="space-y-4">
          <AnnouncementSpotlight
            announcements={items}
            isLoading={announcementsLoading}
            error={announcementsError}
            onViewAll={() => undefined}
            compact
          />
          {announcementsLoading ? <p className="text-muted-foreground">Loading announcements...</p> : null}
          {announcementsError ? (
            <Card className="border-destructive/30">
              <CardContent className="pt-6">
                <p className="font-semibold text-destructive">Announcements could not load</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {announcementsError instanceof Error ? announcementsError.message : "Please refresh this section."}
                </p>
              </CardContent>
            </Card>
          ) : null}
          {!announcementsLoading && !announcementsError && items.length === 0 && <p className="text-muted-foreground italic">No announcements.</p>}
          <div className="grid md:grid-cols-2 gap-4">
          {items.map((a) => (
            <Card key={a.id} className="overflow-hidden border-l-4 border-l-gold shadow-sm">
              <CardHeader className="pb-2">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-xs uppercase tracking-wider text-gold font-bold">{a.date}</p>
                  <AnnouncementScopeBadge scope={a.target_scope} />
                </div>
                <CardTitle className="text-lg text-navy-deep">{a.title}</CardTitle>
              </CardHeader>
              <CardContent><p className="text-sm text-foreground/75 whitespace-pre-line">{a.body}</p></CardContent>
            </Card>
          ))}
          </div>
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

      {active === "assignments" && (
        <StudentAssignmentsPanel userId={user.id} />
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

function AnnouncementSpotlight({
  announcements,
  isLoading,
  error,
  onViewAll,
  compact = false,
}: {
  announcements: Announcement[];
  isLoading: boolean;
  error: unknown;
  onViewAll: () => void;
  compact?: boolean;
}) {
  const latest = announcements[0];

  if (isLoading) {
    return (
      <Card className="border-gold/30 bg-gold/5">
        <CardContent className="flex items-center gap-3 pt-6">
          <BellRing className="text-gold" size={22} />
          <p className="text-sm text-muted-foreground">Loading latest announcements...</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-destructive/30 bg-destructive/5">
        <CardContent className="pt-6">
          <p className="font-semibold text-destructive">Announcements could not load</p>
          <p className="text-sm text-muted-foreground">Please refresh this section.</p>
        </CardContent>
      </Card>
    );
  }

  if (!latest) {
    return (
      <Card className="border-dashed bg-secondary/30">
        <CardContent className="flex items-center gap-3 pt-6">
          <Megaphone className="text-muted-foreground" size={22} />
          <p className="text-sm text-muted-foreground">No announcements have been posted for your dashboard yet.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden border-gold/50 bg-gradient-to-br from-gold/15 via-background to-background shadow-sm">
      <CardContent className={compact ? "pt-5" : "pt-6"}>
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="min-w-0">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-gold px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-navy-deep">
                <BellRing size={13} /> Latest notice
              </span>
              <AnnouncementScopeBadge scope={latest.target_scope} />
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{latest.date}</span>
            </div>
            <h3 className="font-serif text-2xl font-bold text-navy-deep">{latest.title}</h3>
            <p className="mt-2 max-w-3xl whitespace-pre-line text-sm leading-relaxed text-foreground/75">
              {latest.body}
            </p>
          </div>
          {!compact && announcements.length > 1 && (
            <Button variant="outline" className="shrink-0" onClick={onViewAll}>
              View all {announcements.length}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function AnnouncementListItem({ announcement }: { announcement: Announcement }) {
  return (
    <div className="rounded-lg border border-border bg-background p-3 shadow-sm">
      <div className="mb-1 flex flex-wrap items-center gap-2">
        <p className="text-[10px] uppercase tracking-wider text-gold font-bold">{announcement.date}</p>
        <AnnouncementScopeBadge scope={announcement.target_scope} />
      </div>
      <p className="font-semibold text-navy-deep text-sm">{announcement.title}</p>
      <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{announcement.body}</p>
    </div>
  );
}

function AnnouncementScopeBadge({ scope }: { scope?: string | null }) {
  const isGroup = scope === "group";
  return (
    <span className={isGroup
      ? "rounded-full bg-navy-deep/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-navy-deep"
      : "rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-700"
    }>
      {isGroup ? "Your group" : "General"}
    </span>
  );
}

type StudentContactMessage = {
  id: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  status: "unread" | "read" | "replied";
  admin_reply: string | null;
  replied_at: string | null;
  created_at: string;
};

type AssignmentTask = {
  id: string;
  title: string;
  description: string | null;
  due_date: string | null;
  file_url: string | null;
  file_name: string | null;
  target_scope: string;
  created_at: string;
};

type AssignmentSubmission = {
  id: string;
  assignment_id: string;
  student_id: string;
  file_url: string | null;
  file_name: string | null;
  note: string | null;
  status: "submitted" | "received" | "rejected" | "marked";
  marks: number | null;
  feedback: string | null;
  rejection_reason: string | null;
  submitted_at: string;
  reviewed_at: string | null;
};

function StudentAssignmentsPanel({ userId }: { userId: string }) {
  const qc = useQueryClient();
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [files, setFiles] = useState<Record<string, File | null>>({});
  const [busyId, setBusyId] = useState<string | null>(null);

  const { data: tasks = [], isLoading: tasksLoading, error: tasksError } = useQuery({
    queryKey: ["student", "assignment_tasks", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("assignment_tasks" as any)
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as AssignmentTask[];
    },
    enabled: !!userId,
  });

  const { data: submissions = [], isLoading: submissionsLoading } = useQuery({
    queryKey: ["student", "assignment_submissions", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("assignment_submissions" as any)
        .select("*")
        .eq("student_id", userId)
        .order("submitted_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as AssignmentSubmission[];
    },
    enabled: !!userId,
  });

  useEffect(() => {
    const channel = supabase
      .channel(`student-assignments:${userId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "assignment_tasks" }, () => {
        qc.invalidateQueries({ queryKey: ["student", "assignment_tasks", userId] });
      })
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "assignment_submissions", filter: `student_id=eq.${userId}` },
        () => qc.invalidateQueries({ queryKey: ["student", "assignment_submissions", userId] }),
      )
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [qc, userId]);

  const submissionByTask = useMemo(() => {
    const map = new Map<string, AssignmentSubmission>();
    submissions.forEach((submission) => map.set(submission.assignment_id, submission));
    return map;
  }, [submissions]);

  const submitAssignment = async (task: AssignmentTask) => {
    const file = files[task.id];
    if (!file) return toast.error("Please choose a file to submit.");

    setBusyId(task.id);
    const toastId = toast.loading("Submitting assignment...");
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-");
    const path = `submissions/${userId}/${task.id}/${Date.now()}-${safeName}`;
    const { error: uploadError } = await supabase.storage.from("assignments").upload(path, file, {
      upsert: true,
      contentType: file.type || "application/octet-stream",
    });
    if (uploadError) {
      setBusyId(null);
      return toast.error("Upload failed", { id: toastId, description: uploadError.message });
    }
    const { data: publicFile } = supabase.storage.from("assignments").getPublicUrl(path);
    const existing = submissionByTask.get(task.id);
    const payload = {
      assignment_id: task.id,
      student_id: userId,
      file_url: publicFile.publicUrl,
      file_name: file.name,
      note: notes[task.id]?.trim() ?? "",
      status: "submitted",
      marks: null,
      feedback: null,
      rejection_reason: null,
      submitted_at: new Date().toISOString(),
      reviewed_at: null,
      reviewed_by: null,
    };
    const request = existing
      ? supabase.from("assignment_submissions" as any).update(payload).eq("id", existing.id)
      : supabase.from("assignment_submissions" as any).insert(payload);
    const { error } = await request;
    setBusyId(null);
    if (error) return toast.error("Submission failed", { id: toastId, description: error.message });
    toast.success("Assignment submitted", { id: toastId });
    setFiles((state) => ({ ...state, [task.id]: null }));
    setNotes((state) => ({ ...state, [task.id]: "" }));
    qc.invalidateQueries({ queryKey: ["student", "assignment_submissions", userId] });
  };

  const loading = tasksLoading || submissionsLoading;
  const openTasks = tasks.filter((task) => {
    const submission = submissionByTask.get(task.id);
    return !submission || submission.status === "rejected";
  });
  const reviewedSubmissions = submissions.filter((submission) => ["received", "rejected", "marked"].includes(submission.status));

  return (
    <div className="space-y-4">
      <Card className="border-gold/30 bg-gold/5">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-gold text-navy-deep">
              <ClipboardList size={20} />
            </div>
            <div>
              <h2 className="font-serif text-2xl font-bold text-navy-deep">Assignments</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Submit assignments, track whether they were received or rejected, and view marks after review.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {tasksError ? (
        <Card className="border-destructive/30">
          <CardContent className="pt-6">
            <p className="font-semibold text-destructive">Assignments could not load</p>
            <p className="text-sm text-muted-foreground">
              {getErrorMessage(tasksError, "Please refresh this section.")}
            </p>
          </CardContent>
        </Card>
      ) : loading ? (
        <p className="text-sm text-muted-foreground">Loading assignments...</p>
      ) : tasks.length === 0 ? (
        <div className="space-y-4">
          <div className="rounded-xl border border-dashed border-border bg-secondary/30 p-8 text-center">
            <ClipboardList className="mx-auto mb-3 text-muted-foreground/70" size={30} />
            <p className="font-semibold text-navy-deep">No assignments yet</p>
            <p className="text-sm text-muted-foreground">Assignments posted by admin will appear here. The upload button appears after an assignment has been assigned to you.</p>
          </div>
          <AssignmentResultsPanel submissions={submissions} tasks={tasks} />
        </div>
      ) : (
        <div className="space-y-5">
          <div className="grid gap-3 sm:grid-cols-3">
            <AssignmentMiniStat label="To submit" value={openTasks.length} />
            <AssignmentMiniStat label="Submitted" value={submissions.filter((item) => item.status === "submitted").length} />
            <AssignmentMiniStat label="Results" value={reviewedSubmissions.length} />
          </div>

          <Card>
            <CardContent className="pt-6">
              <div className="mb-4">
                <h3 className="font-serif text-xl font-semibold text-navy-deep">Assignments to Submit</h3>
                <p className="text-sm text-muted-foreground">Choose a file under the assignment, then click Submit Assignment.</p>
              </div>
              {openTasks.length === 0 ? (
                <div className="rounded-xl border border-dashed border-border bg-secondary/30 p-6 text-center">
                  <CheckCircle2 className="mx-auto mb-2 text-emerald-600" size={28} />
                  <p className="font-semibold text-navy-deep">No pending uploads</p>
                  <p className="text-sm text-muted-foreground">Your submitted work is shown below under results and feedback.</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {openTasks.map((task) => (
                    <StudentAssignmentSubmitCard
                      key={task.id}
                      task={task}
                      submission={submissionByTask.get(task.id)}
                      note={notes[task.id] ?? ""}
                      file={files[task.id] ?? null}
                      busy={busyId === task.id}
                      onNoteChange={(value) => setNotes((state) => ({ ...state, [task.id]: value }))}
                      onFileChange={(file) => setFiles((state) => ({ ...state, [task.id]: file }))}
                      onSubmit={() => submitAssignment(task)}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="mb-4">
                <h3 className="font-serif text-xl font-semibold text-navy-deep">Submitted Assignments</h3>
                <p className="text-sm text-muted-foreground">Track files already sent to admin.</p>
              </div>
              <div className="grid gap-3">
                {tasks.filter((task) => {
                  const submission = submissionByTask.get(task.id);
                  return submission && submission.status !== "rejected";
                }).map((task) => {
                  const submission = submissionByTask.get(task.id)!;
                  return (
                    <div key={task.id} className="rounded-lg border border-border bg-background p-4">
                      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                        <div>
                          <div className="mb-2 flex flex-wrap items-center gap-2">
                            <AssignmentStatusBadge status={submission.status} />
                            <span className="text-xs text-muted-foreground">Submitted {formatStudentDate(submission.submitted_at)}</span>
                          </div>
                          <p className="font-semibold text-navy-deep">{task.title}</p>
                          {submission.note && <p className="mt-1 text-sm text-muted-foreground">{submission.note}</p>}
                        </div>
                        {submission.file_url && (
                          <Button asChild size="sm" variant="outline">
                            <a href={submission.file_url} target="_blank" rel="noreferrer">
                              <ExternalLink size={14} className="mr-1" />Open submitted file
                            </a>
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
                {submissions.filter((item) => item.status !== "rejected").length === 0 && (
                  <p className="rounded-lg border border-dashed border-border bg-secondary/30 p-5 text-sm text-muted-foreground">No submitted assignments yet.</p>
                )}
              </div>
            </CardContent>
          </Card>

          <AssignmentResultsPanel submissions={submissions} tasks={tasks} />

          <div className="grid gap-4">
          {tasks.map((task) => {
            const submission = submissionByTask.get(task.id);
            return (
              <Card key={task.id} className="overflow-hidden">
                <CardContent className="pt-5">
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div className="min-w-0">
                      <div className="mb-2 flex flex-wrap items-center gap-2">
                        <AssignmentStatusBadge status={submission?.status ?? "not_submitted"} />
                        {task.due_date && <span className="text-xs font-semibold text-muted-foreground">Due {formatStudentDate(task.due_date)}</span>}
                      </div>
                      <h3 className="font-serif text-xl font-bold text-navy-deep">{task.title}</h3>
                      {task.description && <p className="mt-1 whitespace-pre-line text-sm text-muted-foreground">{task.description}</p>}
                      {task.file_url && (
                        <Button asChild size="sm" variant="outline" className="mt-3">
                          <a href={task.file_url} target="_blank" rel="noreferrer">
                            <Download size={14} className="mr-1" />Open assignment file
                          </a>
                        </Button>
                      )}
                    </div>
                    {submission?.marks != null && (
                      <div className="rounded-lg bg-emerald-500/10 px-4 py-3 text-center">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">Marks</p>
                        <p className="font-serif text-2xl font-bold text-emerald-700">{submission.marks}</p>
                      </div>
                    )}
                  </div>

                  {submission && (
                    <div className="mt-4 grid gap-3 rounded-lg border border-border bg-secondary/30 p-3 text-sm">
                      <p><span className="font-semibold text-navy-deep">Submitted:</span> {formatStudentDate(submission.submitted_at)}</p>
                      {submission.file_url && (
                        <a href={submission.file_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 font-semibold text-gold hover:text-navy-deep">
                          <ExternalLink size={14} /> Open your submitted file
                        </a>
                      )}
                      {submission.status === "rejected" && (
                        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3">
                          <p className="font-semibold text-destructive">Rejected</p>
                          <p className="mt-1 text-muted-foreground">{submission.rejection_reason || "No reason provided."}</p>
                        </div>
                      )}
                      {submission.feedback && (
                        <div className="rounded-lg border border-gold/30 bg-gold/5 p-3">
                          <p className="font-semibold text-navy-deep">Admin feedback</p>
                          <p className="mt-1 whitespace-pre-line text-muted-foreground">{submission.feedback}</p>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
          </div>
        </div>
      )}
    </div>
  );
}

function StudentAssignmentSubmitCard({
  task,
  submission,
  note,
  file,
  busy,
  onNoteChange,
  onFileChange,
  onSubmit,
}: {
  task: AssignmentTask;
  submission?: AssignmentSubmission;
  note: string;
  file: File | null;
  busy: boolean;
  onNoteChange: (value: string) => void;
  onFileChange: (file: File | null) => void;
  onSubmit: () => void;
}) {
  return (
    <div className="rounded-xl border border-gold/30 bg-gold/5 p-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <AssignmentStatusBadge status={submission?.status ?? "not_submitted"} />
            {task.due_date && <span className="text-xs font-semibold text-muted-foreground">Due {formatStudentDate(task.due_date)}</span>}
          </div>
          <h4 className="font-serif text-lg font-bold text-navy-deep">{task.title}</h4>
          {task.description && <p className="mt-1 whitespace-pre-line text-sm text-muted-foreground">{task.description}</p>}
          {task.file_url && (
            <Button asChild size="sm" variant="outline" className="mt-3">
              <a href={task.file_url} target="_blank" rel="noreferrer">
                <Download size={14} className="mr-1" />Open assignment file
              </a>
            </Button>
          )}
        </div>
      </div>

      {submission?.status === "rejected" && (
        <div className="mt-4 rounded-lg border border-destructive/30 bg-destructive/5 p-3">
          <p className="font-semibold text-destructive">Rejected. Submit afresh.</p>
          <p className="mt-1 text-sm text-muted-foreground">{submission.rejection_reason || "No reason provided."}</p>
        </div>
      )}

      <div className="mt-4 rounded-lg border border-border bg-background p-3">
        <div className="grid gap-3 md:grid-cols-[1fr_1.2fr_auto] md:items-end">
          <div>
            <Label className="text-xs">Upload assignment file</Label>
            <label className="mt-1 flex min-h-20 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gold/50 bg-gold/5 px-4 py-3 text-center transition-colors hover:border-gold hover:bg-gold/10">
              <Upload size={20} className="mb-1 text-gold" />
              <span className="text-sm font-semibold text-navy-deep">{file ? file.name : "Choose assignment file"}</span>
              <span className="mt-0.5 text-xs text-muted-foreground">PDF, DOCX, PPT, ZIP, images, or other coursework files</span>
              <input type="file" className="sr-only" onChange={(event) => onFileChange(event.target.files?.[0] ?? null)} />
            </label>
          </div>
          <div>
            <Label className="text-xs">Note (optional)</Label>
            <Input value={note} onChange={(event) => onNoteChange(event.target.value)} placeholder="Short note to admin" />
          </div>
          <Button className="bg-navy-deep text-cream hover:bg-navy" disabled={busy || !file} onClick={onSubmit}>
            <Upload size={15} className="mr-1" />{busy ? "Submitting..." : "Submit Assignment"}
          </Button>
        </div>
      </div>
    </div>
  );
}

function AssignmentResultsPanel({ submissions, tasks }: { submissions: AssignmentSubmission[]; tasks: AssignmentTask[] }) {
  const taskById = new Map(tasks.map((task) => [task.id, task]));
  const results = submissions.filter((submission) => ["received", "rejected", "marked"].includes(submission.status));

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="mb-4">
          <h3 className="font-serif text-xl font-semibold text-navy-deep">Assignment Results and Feedback</h3>
          <p className="text-sm text-muted-foreground">Marks, received status, rejection reasons, and admin feedback appear here after review.</p>
        </div>
        {results.length === 0 ? (
          <p className="rounded-lg border border-dashed border-border bg-secondary/30 p-5 text-sm text-muted-foreground">No assignment results yet.</p>
        ) : (
          <div className="grid gap-3">
            {results.map((submission) => {
              const task = taskById.get(submission.assignment_id);
              return (
                <div key={submission.id} className="rounded-lg border border-border bg-background p-4">
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div>
                      <div className="mb-2 flex flex-wrap items-center gap-2">
                        <AssignmentStatusBadge status={submission.status} />
                        {submission.reviewed_at && <span className="text-xs text-muted-foreground">Reviewed {formatStudentDate(submission.reviewed_at)}</span>}
                      </div>
                      <p className="font-semibold text-navy-deep">{task?.title ?? "Assignment"}</p>
                    </div>
                    {submission.marks != null && (
                      <div className="rounded-lg bg-emerald-500/10 px-4 py-2 text-center">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">Marks</p>
                        <p className="font-serif text-2xl font-bold text-emerald-700">{submission.marks}</p>
                      </div>
                    )}
                  </div>
                  {submission.status === "rejected" && (
                    <div className="mt-3 rounded-lg border border-destructive/30 bg-destructive/5 p-3">
                      <p className="font-semibold text-destructive">Rejected</p>
                      <p className="mt-1 text-sm text-muted-foreground">{submission.rejection_reason || "No reason provided."}</p>
                    </div>
                  )}
                  {submission.feedback && (
                    <div className="mt-3 rounded-lg border border-gold/30 bg-gold/5 p-3">
                      <p className="font-semibold text-navy-deep">Admin feedback</p>
                      <p className="mt-1 whitespace-pre-line text-sm text-muted-foreground">{submission.feedback}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function AssignmentMiniStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-border bg-background p-4">
      <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="mt-1 font-serif text-3xl font-bold text-navy-deep">{value}</p>
    </div>
  );
}

function AssignmentStatusBadge({ status }: { status: string }) {
  const config: Record<string, string> = {
    not_submitted: "bg-secondary text-muted-foreground",
    submitted: "bg-gold/15 text-navy-deep",
    received: "bg-blue-500/10 text-blue-700",
    rejected: "bg-destructive/10 text-destructive",
    marked: "bg-emerald-500/10 text-emerald-700",
  };
  const label: Record<string, string> = {
    not_submitted: "Not submitted",
    submitted: "Submitted",
    received: "Received",
    rejected: "Rejected",
    marked: "Marked",
  };
  return (
    <span className={`rounded-full px-2 py-1 text-xs font-semibold ${config[status] ?? config.not_submitted}`}>
      {label[status] ?? status}
    </span>
  );
}

function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error) return error.message;
  if (error && typeof error === "object" && "message" in error) return String((error as any).message);
  return fallback;
}

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

  const deleteMessage = async (item: StudentContactMessage) => {
    const toastId = toast.loading("Deleting message...", {
      description: "Removing it from your message history.",
    });
    const { error } = await supabase
      .from("contact_messages" as any)
      .delete()
      .eq("id", item.id);

    if (error) {
      return toast.error("Message could not be deleted", { id: toastId, description: error.message });
    }

    toast.success("Message deleted", { id: toastId });
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
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-navy-deep">{formatStudentSubject(item.subject)}</p>
                      <p className="text-xs text-muted-foreground">{formatStudentDate(item.created_at)}</p>
                    </div>
                    <div className="flex flex-wrap items-center justify-end gap-2">
                      <span className={item.admin_reply ? "inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-1 text-xs font-semibold text-emerald-700" : "inline-flex items-center gap-1 rounded-full bg-gold/15 px-2 py-1 text-xs font-semibold text-navy-deep"}>
                        {item.admin_reply ? <CheckCircle2 size={13} /> : <Clock3 size={13} />}
                        {item.admin_reply ? "Replied" : "Awaiting reply"}
                      </span>
                      <ConfirmAction
                        title="Delete message?"
                        description={`This will permanently remove "${formatStudentSubject(item.subject)}" from your messages.`}
                        confirmLabel="Delete message"
                        destructive
                        onConfirm={() => deleteMessage(item)}
                      >
                        <Button size="sm" variant="destructive">
                          <Trash2 size={14} className="mr-1" />Delete
                        </Button>
                      </ConfirmAction>
                    </div>
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
