import { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { CalendarIcon, Download, Edit3, ExternalLink, Eye, FileText, Lock, Plus, Search, Trash2, Upload, X } from "lucide-react";
import { toast } from "sonner";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { ConfirmAction } from "@/components/ConfirmAction";
import { useStudentGroups, type StudentGroup } from "@/lib/content";
import { safeUrl } from "@/lib/security";

type Resource = {
  id: string;
  title: string;
  course: string;
  type: string;
  date: string;
  file_url: string | null;
  source_type?: "file" | "link" | null;
  link_url?: string | null;
  allow_download?: boolean | null;
  access_level?: "public" | "authenticated" | null;
  description?: string | null;
  sort_order: number;
  created_at: string;
};

type ResourceGroupAccess = {
  resource_id: string;
  group_id: string;
};

const FILE_TYPES = ["PDF", "DOCX", "PPTX", "XLSX", "ZIP", "Image", "Video", "Link", "Other"] as const;

const COURSE_SUGGESTIONS = [
  "Calculus I", "Calculus II", "Linear Algebra", "Differential Equations",
  "Numerical Methods", "Mathematical Modeling", "Probability & Statistics",
  "Real Analysis", "Discrete Mathematics", "General",
];

function inferType(name: string): string {
  const ext = name.split(".").pop()?.toLowerCase() ?? "";
  if (["pdf"].includes(ext)) return "PDF";
  if (["doc", "docx"].includes(ext)) return "DOCX";
  if (["ppt", "pptx"].includes(ext)) return "PPTX";
  if (["xls", "xlsx", "csv"].includes(ext)) return "XLSX";
  if (["zip", "rar", "7z"].includes(ext)) return "ZIP";
  if (["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(ext)) return "Image";
  if (["mp4", "mov", "webm"].includes(ext)) return "Video";
  return "Other";
}

function normalizeUrl(value: string) {
  return safeUrl(value, "");
}

function getResourceHref(resource: Resource) {
  if (resource.source_type === "link") return resource.link_url || "#";
  return resource.file_url || "#";
}

export function ResourcesAdmin() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [filterCourse, setFilterCourse] = useState<string>("all");
  const [filterType, setFilterType] = useState<string>("all");
  const [editing, setEditing] = useState<Resource | null>(null);
  const [open, setOpen] = useState(false);
  const { data: groups = [] } = useStudentGroups();

  const { data: rows = [], isLoading } = useQuery({
    queryKey: ["admin", "resources"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("resources").select("*")
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Resource[];
    },
  });

  const { data: accessRows = [] } = useQuery({
    queryKey: ["admin", "resource_group_access"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("resource_group_access" as any)
        .select("resource_id,group_id");
      if (error) throw error;
      return (data ?? []) as ResourceGroupAccess[];
    },
  });

  const accessByResource = useMemo(() => {
    const map = new Map<string, string[]>();
    accessRows.forEach((row) => {
      map.set(row.resource_id, [...(map.get(row.resource_id) ?? []), row.group_id]);
    });
    return map;
  }, [accessRows]);

  useEffect(() => {
    const channel = supabase
      .channel("admin:resources")
      .on("postgres_changes", { event: "*", schema: "public", table: "resources" }, () => {
        qc.invalidateQueries({ queryKey: ["admin", "resources"] });
        qc.invalidateQueries({ queryKey: ["admin", "resource_group_access"] });
        qc.invalidateQueries({ queryKey: ["resources"] });
      })
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [qc]);

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["admin", "resources"] });
    qc.invalidateQueries({ queryKey: ["admin", "resource_group_access"] });
    qc.invalidateQueries({ queryKey: ["resources"] });
  };

  const courses = useMemo(() => {
    const set = new Set<string>(COURSE_SUGGESTIONS);
    rows.forEach((r) => r.course && set.add(r.course));
    return Array.from(set).sort();
  }, [rows]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter((r) => {
      if (filterCourse !== "all" && r.course !== filterCourse) return false;
      if (filterType !== "all" && r.type !== filterType) return false;
      if (q && ![r.title, r.course, r.type, r.description ?? ""].some((v) => v.toLowerCase().includes(q))) return false;
      return true;
    });
  }, [rows, search, filterCourse, filterType]);

  const openCreate = () => { setEditing(null); setOpen(true); };
  const openEdit = (r: Resource) => { setEditing(r); setOpen(true); };
  const editingGroupIds = useMemo(() => editing ? accessByResource.get(editing.id) ?? [] : [], [editing, accessByResource]);

  const remove = async (r: Resource) => {
    // Best-effort: remove file from storage if it's in our bucket
    if (r.file_url) {
      const marker = "/storage/v1/object/public/resources/";
      const idx = r.file_url.indexOf(marker);
      if (idx >= 0) {
        const path = r.file_url.slice(idx + marker.length);
        await supabase.storage.from("resources").remove([path]);
      }
    }
    const { error } = await supabase.from("resources").delete().eq("id", r.id);
    if (error) toast.error("Delete failed", { description: error.message });
    else { toast.success("Resource deleted", { description: `"${r.title}" was removed.` }); invalidate(); }
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <Card>
        <CardContent className="pt-6 flex flex-col lg:flex-row gap-3 lg:items-center">
          <div className="relative flex-1 min-w-[180px]">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search title, course, type…" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
          </div>
          <div className="flex gap-2 flex-wrap">
            <Select value={filterCourse} onValueChange={setFilterCourse}>
              <SelectTrigger className="w-[180px]"><SelectValue placeholder="Course" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All courses</SelectItem>
                {courses.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-[140px]"><SelectValue placeholder="Type" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All types</SelectItem>
                {FILE_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
              </SelectContent>
            </Select>
            <Button onClick={openCreate} className="bg-gold text-navy-deep hover:bg-gold-soft">
              <Plus size={16} className="mr-1" />Add resource
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Stat label="Total" value={rows.length} />
        <Stat label="Files" value={rows.filter((r) => (r.source_type ?? "file") === "file").length} />
        <Stat label="Links" value={rows.filter((r) => r.source_type === "link").length} />
        <Stat label="Courses" value={new Set(rows.map((r) => r.course)).size} />
      </div>

      {/* List */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <p className="p-6 text-muted-foreground">Loading…</p>
          ) : filtered.length === 0 ? (
            <div className="p-10 text-center text-muted-foreground text-sm">
              <FileText className="mx-auto mb-2 text-muted-foreground/60" size={28} />
              No resources match your filters.
            </div>
          ) : (
            <ul className="divide-y">
              {filtered.map((r) => (
                <li key={r.id} className="p-4 flex flex-col md:flex-row md:items-center gap-3">
                  <div className="w-10 h-10 rounded-md bg-navy-deep/5 text-navy-deep flex items-center justify-center shrink-0">
                    <FileText size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-navy-deep truncate">{r.title}</p>
                      <Badge variant="secondary" className="text-[10px]">{r.type}</Badge>
                      <Badge variant="outline" className="text-[10px]">{r.source_type === "link" ? "Link" : r.allow_download === false ? "View only" : "Download"}</Badge>
                      <Badge variant="outline" className="text-[10px]">
                        {r.access_level === "authenticated" ? "Logged-in only" : "Anyone"}
                      </Badge>
                      {r.access_level !== "public" && (
                        <Badge variant="outline" className="text-[10px]">
                          {(accessByResource.get(r.id)?.length ?? 0) || "All"} group{(accessByResource.get(r.id)?.length ?? 0) === 1 ? "" : "s"}
                        </Badge>
                      )}
                      <Badge className="bg-gold/15 text-navy-deep hover:bg-gold/15 text-[10px]">{r.course}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Published {r.date}
                      {r.description ? ` · ${r.description}` : ""}
                    </p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <Button asChild size="sm" variant="outline" disabled={!getResourceHref(r)}>
                      <a href={getResourceHref(r)} target="_blank" rel="noreferrer">
                        {r.source_type === "link" ? <ExternalLink size={14} className="mr-1" /> : r.allow_download === false ? <Eye size={14} className="mr-1" /> : <Download size={14} className="mr-1" />}
                        {r.source_type === "link" ? "Open" : r.allow_download === false ? "View" : "Download"}
                      </a>
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => openEdit(r)}>
                      <Edit3 size={14} />
                    </Button>
                    <ConfirmAction
                      title="Delete resource?"
                      description={`This will remove "${r.title}" from the website. This action cannot be undone.`}
                      confirmLabel="Delete resource"
                      destructive
                      onConfirm={() => remove(r)}
                    >
                      <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive">
                        <Trash2 size={14} />
                      </Button>
                    </ConfirmAction>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <ResourceFormDialog
        open={open}
        onOpenChange={setOpen}
        initial={editing}
        courses={courses}
        groups={groups}
        initialGroupIds={editingGroupIds}
        onSaved={invalidate}
      />
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <Card><CardContent className="pt-5">
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">{label}</p>
      <p className="font-serif text-2xl font-bold text-navy-deep">{value}</p>
    </CardContent></Card>
  );
}

// ---------- Form Dialog ----------
function ResourceFormDialog({
  open, onOpenChange, initial, courses, groups, initialGroupIds, onSaved,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  initial: Resource | null;
  courses: string[];
  groups: StudentGroup[];
  initialGroupIds: string[];
  onSaved: () => void;
}) {
  const [title, setTitle] = useState("");
  const [course, setCourse] = useState("");
  const [courseMode, setCourseMode] = useState<"existing" | "new">("existing");
  const [type, setType] = useState<string>("PDF");
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [description, setDescription] = useState("");
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [sourceType, setSourceType] = useState<"file" | "link">("file");
  const [linkUrl, setLinkUrl] = useState("");
  const [allowDownload, setAllowDownload] = useState(true);
  const [accessLevel, setAccessLevel] = useState<"public" | "authenticated">("public");
  const [selectedGroupIds, setSelectedGroupIds] = useState<string[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!open) return;
    if (initial) {
      setTitle(initial.title);
      setCourse(initial.course);
      setCourseMode(courses.includes(initial.course) ? "existing" : "new");
      setType(initial.type || "PDF");
      const parsed = initial.date ? new Date(initial.date) : new Date();
      setDate(isNaN(parsed.getTime()) ? new Date() : parsed);
      setDescription(initial.description ?? "");
      setFileUrl(initial.file_url);
      setSourceType(initial.source_type === "link" ? "link" : "file");
      setLinkUrl(initial.link_url ?? "");
      setAllowDownload(initial.allow_download !== false);
      setAccessLevel(initial.access_level === "authenticated" ? "authenticated" : "public");
      setSelectedGroupIds(initialGroupIds);
    } else {
      setTitle(""); setCourse(""); setCourseMode("existing");
      setType("PDF"); setDate(new Date()); setDescription("");
      setFileUrl(null);
      setSourceType("file");
      setLinkUrl("");
      setAllowDownload(true);
      setAccessLevel("public");
      setSelectedGroupIds([]);
    }
    setFile(null); setProgress(0);
  }, [open, initial, courses, initialGroupIds]);

  const handleFile = (f: File | null) => {
    if (!f) return;
    if (f.size > 50 * 1024 * 1024) {
      toast.error("File too large (max 50 MB).");
      return;
    }
    setFile(f);
    setType(inferType(f.name));
  };

  const uploadFile = async (resourceId: string): Promise<string | null> => {
    if (!file) return fileUrl;
    const path = `${resourceId}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
    setProgress(20);
    const { error } = await supabase.storage.from("resources").upload(path, file, { upsert: true, contentType: file.type });
    if (error) throw error;
    setProgress(80);
    const { data: pub } = supabase.storage.from("resources").getPublicUrl(path);
    setProgress(100);
    return pub.publicUrl;
  };

  const saveGroupAccess = async (resourceId: string) => {
    const { error: deleteError } = await supabase
      .from("resource_group_access" as any)
      .delete()
      .eq("resource_id", resourceId);
    if (deleteError) throw deleteError;
    if (accessLevel === "public" || selectedGroupIds.length === 0) return;
    const { error } = await supabase
      .from("resource_group_access" as any)
      .insert(selectedGroupIds.map((groupId) => ({ resource_id: resourceId, group_id: groupId })));
    if (error) throw error;
  };

  const submit = async () => {
    if (!title.trim()) return toast.error("Title is required.");
    if (!course.trim()) return toast.error("Course is required.");
    if (!date) return toast.error("Publication date is required.");
    if (sourceType === "file" && !initial && !file) return toast.error("Please attach a file.");
    if (sourceType === "file" && initial && !file && !fileUrl) return toast.error("Please attach a file.");
    if (sourceType === "link" && !linkUrl.trim()) return toast.error("Please enter the resource link.");

    setBusy(true);
    const toastId = toast.loading(initial ? "Saving resource changes..." : "Publishing resource...", {
      description: "Please wait while the resource is updated.",
    });
    try {
      const normalizedLink = sourceType === "link" ? normalizeUrl(linkUrl) : null;
      const payload = {
        title: title.trim(),
        course: course.trim(),
        type: sourceType === "link" ? "Link" : type,
        date: format(date, "MMM d, yyyy"),
        description: description.trim() || null,
        source_type: sourceType,
        link_url: normalizedLink,
        allow_download: sourceType === "file" ? allowDownload : false,
        access_level: accessLevel,
      };

      if (initial) {
        // update first, then upload (so we have a stable id)
        const newUrl = sourceType === "file" ? (file ? await uploadFile(initial.id) : fileUrl) : null;
        const { error } = await supabase.from("resources")
          .update({ ...payload, file_url: newUrl })
          .eq("id", initial.id);
        if (error) throw error;
        await saveGroupAccess(initial.id);
        toast.success("Resource updated", { id: toastId, description: `"${title.trim()}" is now live.` });
      } else {
        const { data: inserted, error } = await supabase.from("resources")
          .insert({ ...payload, file_url: null, sort_order: 0 })
          .select("id").single();
        if (error) throw error;
        const newUrl = sourceType === "file" ? await uploadFile(inserted.id) : null;
        if (newUrl) {
          const { error: upErr } = await supabase.from("resources")
            .update({ file_url: newUrl }).eq("id", inserted.id);
          if (upErr) throw upErr;
        }
        await saveGroupAccess(inserted.id);
        toast.success("Resource published", { id: toastId, description: `"${title.trim()}" is now live.` });
      }
      onSaved();
      onOpenChange(false);
    } catch (e: any) {
      toast.error("Resource save failed", { id: toastId, description: e?.message ?? "Failed to save" });
    } finally {
      setBusy(false);
      setProgress(0);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-serif text-navy-deep">
            {initial ? "Edit resource" : "Upload new resource"}
          </DialogTitle>
          <DialogDescription>
            Provide details students will see in the Resources page.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label>Title *</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Lecture 4 — Eigenvalues" maxLength={200} />
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <Label className="flex items-center justify-between">
                Course *
                <button type="button" className="text-xs text-gold hover:underline"
                  onClick={() => setCourseMode(courseMode === "existing" ? "new" : "existing")}>
                  {courseMode === "existing" ? "+ New course" : "Pick existing"}
                </button>
              </Label>
              {courseMode === "existing" ? (
                <Select value={course} onValueChange={setCourse}>
                  <SelectTrigger><SelectValue placeholder="Select course" /></SelectTrigger>
                  <SelectContent>
                    {courses.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              ) : (
                <Input value={course} onChange={(e) => setCourse(e.target.value)} placeholder="New course name" maxLength={80} />
              )}
            </div>

            <div>
              <Label>File type *</Label>
              <Select value={type} onValueChange={setType} disabled={sourceType === "link"}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {FILE_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <Label>Resource source *</Label>
              <Select value={sourceType} onValueChange={(value) => setSourceType(value as "file" | "link")}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="file">Upload file</SelectItem>
                  <SelectItem value="link">External link</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Student access *</Label>
              <Select
                value={sourceType === "link" ? "link" : allowDownload ? "download" : "view"}
                onValueChange={(value) => setAllowDownload(value === "download")}
                disabled={sourceType === "link"}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="download">Can download</SelectItem>
                  <SelectItem value="view">View only</SelectItem>
                  <SelectItem value="link">Opens link</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label>Who can access this resource? *</Label>
            <Select value={accessLevel} onValueChange={(value) => setAccessLevel(value as "public" | "authenticated")}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="public">Anyone can open it</SelectItem>
                <SelectItem value="authenticated">Specific logged-in groups</SelectItem>
              </SelectContent>
            </Select>
            <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
              <Lock size={12} />
              Choose one or more groups below. If no group is selected, all active logged-in users can access it.
            </p>
          </div>

          {accessLevel === "authenticated" && (
            <div className="rounded-lg border border-border bg-secondary/30 p-4">
              <Label>Allowed groups</Label>
              <div className="mt-3 grid gap-2">
                {groups.length === 0 && (
                  <p className="text-xs text-muted-foreground">No groups yet. Create groups from Admin → Groups.</p>
                )}
                {groups.map((group) => (
                  <label key={group.id} className="flex items-start gap-2 rounded-md bg-background p-2 text-sm">
                    <input
                      type="checkbox"
                      className="mt-1"
                      checked={selectedGroupIds.includes(group.id)}
                      onChange={(event) => {
                        setSelectedGroupIds((current) =>
                          event.target.checked ? [...current, group.id] : current.filter((id) => id !== group.id)
                        );
                      }}
                    />
                    <span>
                      <span className="font-medium text-navy-deep">{group.group_name}</span>
                      {group.description && <span className="block text-xs text-muted-foreground">{group.description}</span>}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          )}

          <div>
            <Label>Publication date *</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}>
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar mode="single" selected={date} onSelect={setDate} initialFocus className={cn("p-3 pointer-events-auto")} />
              </PopoverContent>
            </Popover>
          </div>

          <div>
            <Label>Description (optional)</Label>
            <Textarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)} maxLength={500}
              placeholder="Short summary shown to students" />
          </div>

          {sourceType === "link" ? (
            <div>
              <Label>Resource link *</Label>
              <Input value={linkUrl} onChange={(e) => setLinkUrl(e.target.value)} placeholder="https://example.com/resource" />
              <p className="text-xs text-muted-foreground mt-1">External links open in a new browser tab.</p>
            </div>
          ) : (
            <div>
              <Label>File {initial ? "(leave empty to keep existing)" : "*"}</Label>
              <label className="mt-1 flex flex-col items-center justify-center gap-2 border-2 border-dashed border-muted rounded-lg p-6 cursor-pointer hover:border-gold/60 hover:bg-gold/5 transition-colors">
                <Upload size={24} className="text-muted-foreground" />
                <span className="text-sm font-medium">{file ? file.name : "Click to choose a file"}</span>
                <span className="text-xs text-muted-foreground">PDF, DOCX, PPTX, ZIP, Image, Video — up to 50 MB</span>
                <input type="file" className="hidden" onChange={(e) => handleFile(e.target.files?.[0] ?? null)} />
              </label>
              {file && (
                <button type="button" onClick={() => setFile(null)} className="mt-2 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive">
                  <X size={12} /> Remove selected file
                </button>
              )}
              {!file && fileUrl && (
                <p className="text-xs text-muted-foreground mt-2">
                  Current file: <a href={fileUrl} target="_blank" rel="noreferrer" className="text-gold underline">view</a>
                </p>
              )}
              {progress > 0 && progress < 100 && (
                <div className="mt-2 h-1.5 rounded-full bg-muted overflow-hidden">
                  <div className="h-full bg-gold transition-all" style={{ width: `${progress}%` }} />
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={busy}>Cancel</Button>
          <Button onClick={submit} disabled={busy} className="bg-navy-deep hover:bg-navy text-cream">
            {busy ? "Saving…" : initial ? "Save changes" : "Publish resource"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
