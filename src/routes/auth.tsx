import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Layout, PageHeader } from "@/components/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth, useUserRole } from "@/hooks/use-auth";

export const Route = createFileRoute("/auth")({
  head: () => ({ meta: [{ title: "Sign in — Dr. Jimrise Ochwach" }] }),
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
      <PageHeader eyebrow="Account" title="Sign in or create an account" subtitle="Admins manage site content. Students get a personal dashboard." />
      <section className="py-16 bg-secondary/30 min-h-[60vh]">
        <div className="mx-auto max-w-md px-4">
          <Card>
            <CardContent className="pt-6">
              <Tabs defaultValue="signin">
                <TabsList className="grid grid-cols-2 w-full">
                  <TabsTrigger value="signin">Sign in</TabsTrigger>
                  <TabsTrigger value="signup">Sign up</TabsTrigger>
                </TabsList>
                <TabsContent value="signin"><SignInForm /></TabsContent>
                <TabsContent value="signup"><SignUpForm /></TabsContent>
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
    </form>
  );
}

function SignUpForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const { error } = await supabase.auth.signUp({
      email, password,
      options: { emailRedirectTo: `${window.location.origin}/auth` },
    });
    setBusy(false);
    if (error) toast.error(error.message);
    else toast.success("Account created. You can sign in now.");
  };
  return (
    <form onSubmit={submit} className="space-y-4 pt-4">
      <div><Label>Email</Label><Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} /></div>
      <div><Label>Password</Label><Input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} /></div>
      <Button type="submit" disabled={busy} className="w-full bg-gold text-navy-deep hover:bg-gold-soft">{busy ? "Creating…" : "Create account"}</Button>
      <p className="text-xs text-muted-foreground">Students sign up here to access course materials and announcements.</p>
    </form>
  );
}
