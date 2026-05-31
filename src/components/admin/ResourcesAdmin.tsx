import { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { CalendarIcon, Download, Edit3, FileText, Plus, Search, Trash2, Upload, X } from "lucide-react";
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

type Resource = {
  id: string;
  title: string;
  course: string;
  type: string;
  date: string;
  file_url: string | null;
  description?: string | null;
  sort_order: number;
  created_at: string;
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

export function ResourcesAdmin() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [filterCourse, setFilterCourse] = useState<string>("all");
  const [filterType, setFilterType] = useState<string>("all");
  const [editing, setEditing] = useState<Resource | null>(null);
  const [open, setOpen] = useState(false);

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

  useEffect(() => {
    const channel = supabase
      .channel("admin:resources")
      .on("postgres_changes", { event: "*", schema: "public", table: "resources" }, () => {
        qc.invalidateQueries({ queryKey: ["admin", "resources"] });
        qc.invalidateQueries({ queryKey: ["resources"] });
      })
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [qc]);

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["admin", "resources"] });
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

  const remove = async (r: Resource) => {
    if (!confirm(`Delete "${r.title}"?`)) return;
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
    if (error) toast.error(error.message);
    else { toast.success("Deleted"); invalidate(); }
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
        <Stat label="With files" value={rows.filter((r) => !!r.file_url).length} />
        <Stat label="Courses" value={new Set(rows.map((r) => r.course)).size} />
        <Stat label="Showing" value={filtered.length} />
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
                      <Badge className="bg-gold/15 text-navy-deep hover:bg-gold/15 text-[10px]">{r.course}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Published {r.date}
                      {r.description ? ` · ${r.description}` : ""}
                    </p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <Button asChild size="sm" variant="outline" disabled={!r.file_url}>
                      <a href={r.file_url ?? "#"} target="_blank" rel="noreferrer">
                        <Download size={14} className="mr-1" />{r.file_url ? "Download" : "No file"}
                      </a>
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => openEdit(r)}>
                      <Edit3 size={14} />
                    </Button>
                    <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive" onClick={() => remove(r)}>
                      <Trash2 size={14} />
                    </Button>
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
  open, onOpenChange, initial, courses, onSaved,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  initial: Resource | null;
  courses: string[];
  onSaved: () => void;
}) {
  const [title, setTitle] = useState("");
  const [course, setCourse] = useState("");
  const [courseMode, setCourseMode] = useState<"existing" | "new">("existing");
  const [type, setType] = useState<string>("PDF");
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [description, setDescription] = useState("");
  const [fileUrl, setFileUrl] = useState<string | null>(null);
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
    } else {
      setTitle(""); setCourse(""); setCourseMode("existing");
      setType("PDF"); setDate(new Date()); setDescription("");
      setFileUrl(null);
    }
    setFile(null); setProgress(0);
  }, [open, initial, courses]);

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

  const submit = async () => {
    if (!title.trim()) return toast.error("Title is required.");
    if (!course.trim()) return toast.error("Course is required.");
    if (!date) return toast.error("Publication date is required.");
    if (!initial && !file) return toast.error("Please attach a file or link.");

    setBusy(true);
    try {
      const payload = {
        title: title.trim(),
        course: course.trim(),
        type,
        date: format(date, "MMM d, yyyy"),
        description: description.trim() || null,
      };

      if (initial) {
        // update first, then upload (so we have a stable id)
        const newUrl = file ? await uploadFile(initial.id) : fileUrl;
        const { error } = await supabase.from("resources")
          .update({ ...payload, file_url: newUrl })
          .eq("id", initial.id);
        if (error) throw error;
        toast.success("Resource updated");
      } else {
        const { data: inserted, error } = await supabase.from("resources")
          .insert({ ...payload, file_url: null, sort_order: 0 })
          .select("id").single();
        if (error) throw error;
        const newUrl = await uploadFile(inserted.id);
        if (newUrl) {
          const { error: upErr } = await supabase.from("resources")
            .update({ file_url: newUrl }).eq("id", inserted.id);
          if (upErr) throw upErr;
        }
        toast.success("Resource added");
      }
      onSaved();
      onOpenChange(false);
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to save");
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
              <Select value={type} onValueChange={setType}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {FILE_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

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
