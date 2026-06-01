import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth, useUserRole } from "@/hooks/use-auth";
import { Eye, EyeOff } from "lucide-react";
import { useStudentGroups } from "@/lib/content";
import { seoHead } from "@/lib/seo";

export const Route = createFileRoute("/auth")({
  head: () => seoHead({
    title: "Sign in - Dr. Jimrise Ochwach",
    description: "Sign in to access the Dr. Jimrise Ochwach student resource dashboard.",
    path: "/auth",
    noIndex: true,
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: role } = useUserRole(user);

  useEffect(() => {
    if (user && role) {
      navigate({ to: role === "admin" ? "/admin" : "/student" });
    }
  }, [user, role, navigate]);

  return (
    <Layout plain>
      <section className="pt-32 pb-16 bg-secondary/30 min-h-screen">
        <div className="mx-auto max-w-xl px-4">
          <Card>
            <CardContent className="pt-6">
              <Tabs defaultValue="signin">
                <TabsList className="grid grid-cols-3 w-full">
                  <TabsTrigger value="signin">Sign in</TabsTrigger>
                  <TabsTrigger value="signup">Sign up</TabsTrigger>
                  <TabsTrigger value="forgot">Reset</TabsTrigger>
                </TabsList>
                <TabsContent value="signin"><SignInForm /></TabsContent>
                <TabsContent value="signup"><SignUpForm /></TabsContent>
                <TabsContent value="forgot"><ForgotPasswordForm /></TabsContent>
              </Tabs>
              <p className="text-xs text-center text-muted-foreground mt-6">
                <Link to="/" className="hover:text-gold">← Back to home</Link>
              </p>
            </CardContent>
          </Card>
        </div>
      </section>
    </Layout>
  );
}

function SignInForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) toast.error(error.message);
    else toast.success("Signed in");
  };
  return (
    <form onSubmit={submit} className="space-y-4 pt-4">
      <div><Label>Email</Label><Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} /></div>
      <div><Label>Password</Label><Input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} /></div>
      <Button type="submit" disabled={busy} className="w-full bg-navy-deep hover:bg-navy text-cream">{busy ? "Signing in…" : "Sign in"}</Button>
      <p className="text-xs text-center text-muted-foreground">Forgot your password? Open the <span className="font-semibold text-gold">Reset</span> tab.</p>
    </form>
  );
}

function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setBusy(false);
    if (error) toast.error(error.message);
    else toast.success("Password reset link sent. Check your email.");
  };

  return (
    <form onSubmit={submit} className="space-y-4 pt-4">
      <p className="text-sm text-muted-foreground">
        Enter your account email and we will send a password reset link.
      </p>
      <div><Label>Email</Label><Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} /></div>
      <Button type="submit" disabled={busy} className="w-full bg-navy-deep hover:bg-navy text-cream">{busy ? "Sending…" : "Send reset link"}</Button>
    </form>
  );
}

function SignUpForm() {
  const { data: groups = [], isLoading: groupsLoading, error: groupsError } = useStudentGroups();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [organizationName, setOrganizationName] = useState("");
  const [educationLevel, setEducationLevel] = useState("");
  const [program, setProgram] = useState("");
  const [groupId, setGroupId] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const { error } = await supabase.auth.signUp({
      email, password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth`,
        data: {
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          organization_name: organizationName.trim(),
          education_level: educationLevel,
          program: program.trim(),
          group_id: groupId,
        },
      },
    });
    setBusy(false);
    if (error) toast.error(error.message);
    else toast.success("Account created. Your account is pending admin approval.");
  };
  return (
    <form onSubmit={submit} className="space-y-4 pt-4">
      <div className="grid sm:grid-cols-2 gap-3">
        <div><Label>First Name</Label><Input required value={firstName} onChange={(e) => setFirstName(e.target.value)} /></div>
        <div><Label>Last Name</Label><Input required value={lastName} onChange={(e) => setLastName(e.target.value)} /></div>
      </div>
      <div><Label>Organization Name</Label><Input required value={organizationName} onChange={(e) => setOrganizationName(e.target.value)} placeholder="School, college, university, or organization" /></div>
      <div>
        <Label>Education Level</Label>
        <select
          required
          value={educationLevel}
          onChange={(e) => setEducationLevel(e.target.value)}
          className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
        >
          <option value="">Select education level</option>
          <option value="secondary_school">Secondary School</option>
          <option value="certificate">Certificate</option>
          <option value="diploma">Diploma</option>
          <option value="undergraduate">Undergraduate</option>
          <option value="masters">Masters</option>
          <option value="phd">PhD</option>
          <option value="professional">Professional / Short Course</option>
          <option value="other">Other</option>
        </select>
      </div>
      <div><Label>Program</Label><Input required value={program} onChange={(e) => setProgram(e.target.value)} placeholder="e.g. BSc Applied Mathematics" /></div>
      <div>
        <Label>Course / Group</Label>
        <select
          required
          value={groupId}
          onChange={(e) => setGroupId(e.target.value)}
          disabled={groupsLoading || Boolean(groupsError)}
          className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
        >
          <option value="">
            {groupsLoading ? "Loading groups..." : groupsError ? "Groups are unavailable" : "Select your group"}
          </option>
          {groups.map((group) => (
            <option key={group.id} value={group.id}>{group.group_name}</option>
          ))}
        </select>
        {groupsError && (
          <p className="mt-1 text-xs text-destructive">
            Groups could not load. Please refresh the page or contact the administrator.
          </p>
        )}
      </div>
      <div><Label>Email</Label><Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} /></div>
      <div>
        <Label>Password</Label>
        <div className="relative">
          <Input
            type={showPassword ? "text" : "password"}
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="pr-11"
          />
          <button
            type="button"
            onClick={() => setShowPassword((show) => !show)}
            className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-md inline-flex items-center justify-center text-muted-foreground hover:text-navy-deep hover:bg-secondary"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
          </button>
        </div>
      </div>
      <Button type="submit" disabled={busy} className="w-full bg-gold text-navy-deep hover:bg-gold-soft">{busy ? "Creating…" : "Create account"}</Button>
      <p className="text-xs text-muted-foreground">After registration, your account remains pending until admin approval.</p>
    </form>
  );
}
