import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Layout } from "@/components/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/reset-password")({
  head: () => ({ meta: [{ title: "Reset password — Dr. Jimrise Ochwach" }] }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setReady(Boolean(data.session));
    });

    const { data: subscription } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" || session) setReady(Boolean(session));
    });

    return () => subscription.subscription.unsubscribe();
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) return toast.error("Password must be at least 6 characters.");
    if (password !== confirmPassword) return toast.error("Passwords do not match.");

    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password });
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Password updated. Please sign in with your new password.");
    await supabase.auth.signOut();
    navigate({ to: "/auth" });
  };

  return (
    <Layout plain>
      <section className="pt-32 pb-16 bg-secondary/30 min-h-screen">
        <div className="mx-auto max-w-md px-4">
          <Card>
            <CardContent className="pt-6">
              {!ready ? (
                <div className="space-y-4 text-sm text-muted-foreground">
                  <p>Open the reset link from your email to set a new password.</p>
                  <Button asChild className="w-full bg-gold text-navy-deep hover:bg-gold-soft">
                    <Link to="/auth">Request reset link</Link>
                  </Button>
                </div>
              ) : (
                <form onSubmit={submit} className="space-y-4">
                  <PasswordField
                    label="New Password"
                    value={password}
                    onChange={setPassword}
                    show={showPassword}
                    onToggle={() => setShowPassword((show) => !show)}
                  />
                  <PasswordField
                    label="Confirm New Password"
                    value={confirmPassword}
                    onChange={setConfirmPassword}
                    show={showPassword}
                    onToggle={() => setShowPassword((show) => !show)}
                  />
                  <Button type="submit" disabled={busy} className="w-full bg-navy-deep hover:bg-navy text-cream">
                    {busy ? "Updating…" : "Update password"}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </section>
    </Layout>
  );
}

function PasswordField({
  label,
  value,
  onChange,
  show,
  onToggle,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  show: boolean;
  onToggle: () => void;
}) {
  return (
    <div>
      <Label>{label}</Label>
      <div className="relative">
        <Input
          type={show ? "text" : "password"}
          required
          minLength={6}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="pr-11"
        />
        <button
          type="button"
          onClick={onToggle}
          className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-md inline-flex items-center justify-center text-muted-foreground hover:text-navy-deep hover:bg-secondary"
          aria-label={show ? "Hide password" : "Show password"}
        >
          {show ? <EyeOff size={17} /> : <Eye size={17} />}
        </button>
      </div>
    </div>
  );
}
