import { type ReactNode, useEffect, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { BookOpen, Building2, ChevronDown, Eye, EyeOff, GraduationCap, KeyRound, LogOut, Home, Mail, Pencil, User, ExternalLink, type LucideIcon } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";

export type DashboardNavItem = {
  id: string;
  label: string;
  icon: LucideIcon;
  badge?: number;
  children?: DashboardNavItem[];
};

export function DashboardShell({
  title,
  subtitle,
  userEmail,
  userId,
  roleLabel,
  nav,
  active,
  onSelect,
  children,
}: {
  title: string;
  subtitle?: string;
  userEmail?: string;
  userId?: string;
  roleLabel: string;
  nav: DashboardNavItem[];
  active: string;
  onSelect: (id: string) => void;
  children: ReactNode;
}) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: profile, isLoading: profileLoading } = useDashboardProfile(userId);
  const showStudentProfileFields = roleLabel.toLowerCase() !== "admin";
  const [editingProfile, setEditingProfile] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [profileForm, setProfileForm] = useState<DashboardProfileForm>(emptyProfileForm);
  const [passwordForm, setPasswordForm] = useState({ password: "", confirmPassword: "" });
  const [openGroups, setOpenGroups] = useState<string[]>(() =>
    nav.filter((item) => item.children?.some((child) => child.id === active)).map((item) => item.id)
  );

  useEffect(() => {
    setProfileForm({
      first_name: profile?.first_name ?? "",
      last_name: profile?.last_name ?? "",
      organization_name: profile?.organization_name ?? "",
      education_level: profile?.education_level ?? "",
      program: profile?.program ?? "",
      admission_number: profile?.admission_number ?? "",
    });
  }, [profile]);

  useEffect(() => {
    const activeGroup = nav.find((item) => item.children?.some((child) => child.id === active));
    if (activeGroup) {
      setOpenGroups((groups) => groups.includes(activeGroup.id) ? groups : [...groups, activeGroup.id]);
    }
  }, [active, nav]);

  const toggleGroup = (id: string) => {
    setOpenGroups((groups) => groups.includes(id) ? groups.filter((group) => group !== id) : [...groups, id]);
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/" });
  };
  const saveProfile = async () => {
    if (!userId) return;
    setSavingProfile(true);
    const payload = {
      user_id: userId,
      first_name: profileForm.first_name.trim(),
      last_name: profileForm.last_name.trim(),
      organization_name: profileForm.organization_name.trim(),
      education_level: profileForm.education_level,
      program: profileForm.program.trim(),
      admission_number: showStudentProfileFields ? profileForm.admission_number.trim() : "",
      updated_at: new Date().toISOString(),
    };
    const { error } = await supabase.from("student_profiles" as any).upsert(payload);
    if (!error) {
      await supabase.auth.updateUser({
        data: {
          first_name: payload.first_name,
          last_name: payload.last_name,
          organization_name: payload.organization_name,
          education_level: payload.education_level,
          program: payload.program,
        },
      });
    }
    setSavingProfile(false);
    if (error) return toast.error(error.message);
    await queryClient.invalidateQueries({ queryKey: ["dashboard_profile", userId] });
    toast.success("Profile updated");
    setEditingProfile(false);
  };

  const changePassword = async () => {
    if (passwordForm.password.length < 6) return toast.error("Password must be at least 6 characters.");
    if (passwordForm.password !== passwordForm.confirmPassword) return toast.error("Passwords do not match.");

    setSavingPassword(true);
    const { error } = await supabase.auth.updateUser({ password: passwordForm.password });
    setSavingPassword(false);

    if (error) return toast.error("Password update failed", { description: error.message });
    setPasswordForm({ password: "", confirmPassword: "" });
    setShowPassword(false);
    toast.success("Password updated", { description: "Use the new password the next time you sign in." });
  };
  const initials = getInitials(userEmail ?? roleLabel);

  return (
    <div className="min-h-[100dvh] bg-secondary/30 flex">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col bg-navy-deep text-cream md:flex h-[100dvh] max-h-[100dvh] overflow-hidden">
        <Link to="/" className="shrink-0 px-5 py-4 border-b border-cream/10 hover:bg-navy/60 transition-colors">
          <p className="font-serif text-lg font-bold leading-tight">J. Ochwach</p>
          <p className="text-[10px] tracking-[0.2em] uppercase text-gold mt-0.5">{roleLabel}</p>
        </Link>

        <nav className="flex-1 min-h-0 px-2.5 py-3 space-y-1 overflow-y-auto overscroll-contain">
          {nav.map((item) => {
            const Icon = item.icon;
            const hasChildren = Boolean(item.children?.length);
            const isOpen = openGroups.includes(item.id);
            const isActive = item.id === active || Boolean(item.children?.some((child) => child.id === active));
            return (
              <div key={item.id}>
                <button
                  onClick={() => hasChildren ? toggleGroup(item.id) : onSelect(item.id)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-1.5 rounded-md text-sm font-medium transition-colors text-left",
                    isActive
                      ? "bg-gold text-navy-deep"
                      : "text-cream/80 hover:text-cream hover:bg-cream/5"
                  )}
                >
                  <Icon size={16} />
                  <span className="flex-1">{item.label}</span>
                  {Number(item.badge) > 0 && (
                    <span className={cn(
                      "min-w-5 rounded-full px-1.5 py-0.5 text-center text-[10px] font-bold leading-none",
                      isActive ? "bg-navy-deep text-cream" : "bg-gold text-navy-deep"
                    )}>
                      {formatBadgeCount(item.badge)}
                    </span>
                  )}
                  {hasChildren && (
                    <ChevronDown size={15} className={cn("transition-transform", isOpen && "rotate-180")} />
                  )}
                </button>
                {hasChildren && isOpen && (
                  <div className="mt-1 ml-5 pl-3 border-l border-cream/15 space-y-0.5">
                    {item.children?.map((child) => {
                      const ChildIcon = child.icon;
                      const isChildActive = child.id === active;
                      return (
                        <button
                          key={child.id}
                          onClick={() => onSelect(child.id)}
                          className={cn(
                            "w-full flex items-center gap-2 px-3 py-[5px] rounded-md text-xs font-medium transition-colors text-left",
                            isChildActive
                              ? "bg-cream/95 text-navy-deep"
                              : "text-cream/70 hover:text-cream hover:bg-cream/5"
                          )}
                        >
                          <ChildIcon size={14} />
                          <span className="flex-1">{child.label}</span>
                          {Number(child.badge) > 0 && (
                            <span className={cn(
                              "min-w-5 rounded-full px-1.5 py-0.5 text-center text-[10px] font-bold leading-none",
                              isChildActive ? "bg-navy-deep text-cream" : "bg-gold text-navy-deep"
                            )}>
                              {formatBadgeCount(child.badge)}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        <div className="shrink-0 px-3 py-3 border-t border-cream/10 space-y-1">
          <Link
            to="/"
            className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm text-cream/80 hover:text-gold hover:bg-cream/5"
          >
            <Home size={16} /> Back to site
          </Link>
          <button
            onClick={signOut}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm text-cream/80 hover:text-gold hover:bg-cream/5"
          >
            <LogOut size={16} /> Sign out
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 min-h-[100dvh] md:ml-64">
        <header className="bg-background border-b sticky top-0 z-10">
          <div className="px-4 sm:px-6 lg:px-10 py-4 flex items-center justify-between gap-4">
            <div className="min-w-0">
              <h1 className="font-serif text-xl md:text-2xl font-bold text-navy-deep truncate">
                {title}
              </h1>
              {subtitle && (
                <p className="text-xs md:text-sm text-muted-foreground truncate">{subtitle}</p>
              )}
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="group flex items-center gap-3 rounded-full border border-border bg-card py-1.5 pl-1.5 pr-2 md:pr-3 shadow-sm hover:border-gold/70 hover:shadow-md transition-all focus:outline-none focus:ring-2 focus:ring-gold/40"
                >
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-navy-deep text-cream text-sm font-bold ring-2 ring-gold/25">
                    {initials}
                  </span>
                  <span className="hidden sm:block text-left min-w-0">
                    <span className="block text-xs font-semibold text-navy-deep leading-tight">{roleLabel}</span>
                    {userEmail && (
                      <span className="block text-[11px] text-muted-foreground truncate max-w-[190px]">{userEmail}</span>
                    )}
                  </span>
                  <ChevronDown size={15} className="hidden sm:block text-muted-foreground group-data-[state=open]:rotate-180 transition-transform" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80 p-2">
                <DropdownMenuLabel className="p-3">
                  <div className="flex items-center gap-3">
                    <span className="flex h-11 w-11 items-center justify-center rounded-full bg-navy-deep text-cream font-bold ring-2 ring-gold/30">
                      {initials}
                    </span>
                    <span className="min-w-0">
                      <span className="block font-serif text-base text-navy-deep">{roleLabel} Dashboard</span>
                      <span className="block text-xs font-normal text-muted-foreground truncate">{userEmail ?? "Signed in user"}</span>
                    </span>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <div className="px-3 py-2">
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">Profile Details</p>
                    {!editingProfile && (
                      <Button type="button" size="sm" variant="ghost" className="h-7 px-2 text-xs" onClick={() => setEditingProfile(true)}>
                        <Pencil size={12} /> Edit
                      </Button>
                    )}
                  </div>
                  {editingProfile ? (
                    <div className="space-y-3 rounded-lg border border-border bg-secondary/40 p-3" onClick={(event) => event.stopPropagation()}>
                      <div className="grid grid-cols-2 gap-2">
                        <ProfileField label="First Name" value={profileForm.first_name} onChange={(value) => setProfileForm((form) => ({ ...form, first_name: value }))} />
                        <ProfileField label="Last Name" value={profileForm.last_name} onChange={(value) => setProfileForm((form) => ({ ...form, last_name: value }))} />
                      </div>
                      <ProfileField label="Organization" value={profileForm.organization_name} onChange={(value) => setProfileForm((form) => ({ ...form, organization_name: value }))} />
                      {showStudentProfileFields && (
                        <ProfileField label="Adm No:" value={profileForm.admission_number} onChange={(value) => setProfileForm((form) => ({ ...form, admission_number: value }))} />
                      )}
                      <div>
                        <Label className="text-xs">Education Level</Label>
                        <select
                          value={profileForm.education_level}
                          onChange={(event) => setProfileForm((form) => ({ ...form, education_level: event.target.value }))}
                          className="mt-1 h-9 w-full rounded-md border border-input bg-background px-3 text-xs outline-none focus:ring-2 focus:ring-gold/40"
                        >
                          <option value="">Select education level</option>
                          {educationLevelOptions.map((option) => (
                            <option key={option.value} value={option.value}>{option.label}</option>
                          ))}
                        </select>
                      </div>
                      <ProfileField label="Program" value={profileForm.program} onChange={(value) => setProfileForm((form) => ({ ...form, program: value }))} />
                      <div className="flex gap-2 pt-1">
                        <Button type="button" size="sm" className="flex-1 bg-navy-deep hover:bg-navy text-cream" disabled={savingProfile} onClick={saveProfile}>
                          {savingProfile ? "Saving..." : "Save Profile"}
                        </Button>
                        <Button type="button" size="sm" variant="outline" disabled={savingProfile} onClick={() => {
                          setProfileForm({
                            first_name: profile?.first_name ?? "",
                            last_name: profile?.last_name ?? "",
                            organization_name: profile?.organization_name ?? "",
                            education_level: profile?.education_level ?? "",
                            program: profile?.program ?? "",
                            admission_number: profile?.admission_number ?? "",
                          });
                          setEditingProfile(false);
                        }}>
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2 rounded-lg border border-border bg-secondary/40 p-3">
                      <ProfileRow icon={User} label="Full Name" value={[profile?.first_name, profile?.last_name].filter(Boolean).join(" ")} fallback={profileLoading ? "Loading..." : "Not saved"} />
                      <ProfileRow icon={Mail} label="Email" value={userEmail} />
                      <ProfileRow icon={Building2} label="Organization" value={profile?.organization_name} />
                      {showStudentProfileFields && <ProfileRow icon={GraduationCap} label="Adm No:" value={profile?.admission_number} />}
                      <ProfileRow icon={GraduationCap} label="Education Level" value={profile?.education_level ? formatEducationLevel(profile.education_level) : ""} />
                      <ProfileRow icon={BookOpen} label="Program" value={profile?.program} />
                    </div>
                  )}
                </div>
                <DropdownMenuSeparator />
                <div className="px-3 py-2">
                  <div className="mb-2 flex items-center gap-2">
                    <KeyRound size={14} className="text-gold" />
                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">Password</p>
                  </div>
                  <div className="space-y-3 rounded-lg border border-border bg-secondary/40 p-3" onClick={(event) => event.stopPropagation()}>
                    <PasswordField
                      label="New Password"
                      value={passwordForm.password}
                      show={showPassword}
                      onChange={(value) => setPasswordForm((form) => ({ ...form, password: value }))}
                      onToggleShow={() => setShowPassword((show) => !show)}
                    />
                    <PasswordField
                      label="Confirm Password"
                      value={passwordForm.confirmPassword}
                      show={showPassword}
                      onChange={(value) => setPasswordForm((form) => ({ ...form, confirmPassword: value }))}
                      onToggleShow={() => setShowPassword((show) => !show)}
                    />
                    <Button
                      type="button"
                      size="sm"
                      className="w-full bg-navy-deep hover:bg-navy text-cream"
                      disabled={savingPassword || !passwordForm.password || !passwordForm.confirmPassword}
                      onClick={changePassword}
                    >
                      {savingPassword ? "Updating..." : "Change Password"}
                    </Button>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/" className="cursor-pointer">
                    <Home size={15} />
                    Back to site
                    <ExternalLink size={13} className="ml-auto opacity-60" />
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={signOut} className="cursor-pointer text-destructive focus:text-destructive">
                  <LogOut size={15} />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Mobile nav */}
          <div className="md:hidden border-t overflow-x-auto">
            <div className="flex gap-1 px-3 py-2 min-w-max">
              {nav.flatMap((item) => item.children ?? [item]).map((item) => {
                const Icon = item.icon;
                const isActive = item.id === active;
                return (
                  <button
                    key={item.id}
                    onClick={() => onSelect(item.id)}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap",
                      isActive
                        ? "bg-navy-deep text-cream"
                        : "text-muted-foreground hover:bg-secondary"
                    )}
                  >
                    <Icon size={14} />
                    {item.label}
                    {Number(item.badge) > 0 && (
                      <span className={cn(
                        "ml-0.5 min-w-5 rounded-full px-1.5 py-0.5 text-center text-[10px] font-bold leading-none",
                        isActive ? "bg-gold text-navy-deep" : "bg-navy-deep text-cream"
                      )}>
                        {formatBadgeCount(item.badge)}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </header>

        <main className="flex-1 px-4 sm:px-6 lg:px-10 py-6 md:py-8">{children}</main>
      </div>
    </div>
  );
}

function formatBadgeCount(value?: number) {
  const count = Number(value ?? 0);
  if (count > 99) return "99+";
  return String(count);
}

type DashboardProfile = {
  first_name: string | null;
  last_name: string | null;
  organization_name: string | null;
  education_level: string | null;
  program: string | null;
  admission_number: string | null;
};

type DashboardProfileForm = {
  first_name: string;
  last_name: string;
  organization_name: string;
  education_level: string;
  program: string;
  admission_number: string;
};

const emptyProfileForm: DashboardProfileForm = {
  first_name: "",
  last_name: "",
  organization_name: "",
  education_level: "",
  program: "",
  admission_number: "",
};

const educationLevelOptions = [
  { value: "secondary_school", label: "Secondary School" },
  { value: "certificate", label: "Certificate" },
  { value: "diploma", label: "Diploma" },
  { value: "undergraduate", label: "Undergraduate" },
  { value: "masters", label: "Masters" },
  { value: "phd", label: "PhD" },
  { value: "professional", label: "Professional / Short Course" },
  { value: "other", label: "Other" },
];

function useDashboardProfile(userId?: string) {
  return useQuery({
    queryKey: ["dashboard_profile", userId ?? null],
    queryFn: async () => {
      if (!userId) return null;
      const { data, error } = await supabase
        .from("student_profiles" as any)
        .select("first_name,last_name,organization_name,education_level,program,admission_number")
        .eq("user_id", userId)
        .maybeSingle();
      if (error) throw error;
      return data as DashboardProfile | null;
    },
    enabled: !!userId,
    staleTime: 30_000,
  });
}

function ProfileField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <Label className="text-xs">{label}</Label>
      <Input className="mt-1 h-9 text-xs" value={value} onChange={(event) => onChange(event.target.value)} />
    </div>
  );
}

function PasswordField({
  label,
  value,
  show,
  onChange,
  onToggleShow,
}: {
  label: string;
  value: string;
  show: boolean;
  onChange: (value: string) => void;
  onToggleShow: () => void;
}) {
  return (
    <div>
      <Label className="text-xs">{label}</Label>
      <div className="relative mt-1">
        <Input
          type={show ? "text" : "password"}
          className="h-9 pr-10 text-xs"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          minLength={6}
        />
        <button
          type="button"
          onClick={onToggleShow}
          className="absolute right-1 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground hover:bg-secondary hover:text-navy-deep"
          aria-label={show ? "Hide password" : "Show password"}
        >
          {show ? <EyeOff size={15} /> : <Eye size={15} />}
        </button>
      </div>
    </div>
  );
}

function ProfileRow({
  icon: Icon,
  label,
  value,
  fallback = "Not saved",
}: {
  icon: LucideIcon;
  label: string;
  value?: string | null;
  fallback?: string;
}) {
  const display = value?.trim() || fallback;
  return (
    <div className="grid grid-cols-[1rem_1fr] gap-x-2 gap-y-0.5 text-xs">
      <Icon size={14} className="mt-0.5 text-gold" />
      <div className="min-w-0">
        <p className="font-medium text-navy-deep">{label}</p>
        <p className="break-words text-muted-foreground">{display}</p>
      </div>
    </div>
  );
}

function formatEducationLevel(value: string) {
  return value
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function getInitials(value: string) {
  const namePart = value.includes("@") ? value.split("@")[0] : value;
  const parts = namePart.split(/[.\s_-]+/).filter(Boolean);
  const initials = parts.slice(0, 2).map((part) => part[0]?.toUpperCase()).join("");
  return initials || "A";
}
