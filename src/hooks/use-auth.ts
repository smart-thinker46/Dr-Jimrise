import { useEffect, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      setLoading(false);
    });
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  return { session, user: session?.user ?? null, loading };
}

export function useUserRole(user: User | null) {
  return useQuery({
    queryKey: ["user_role", user?.id ?? null],
    queryFn: async () => {
      if (!user) return null;
      const { data } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id);
      const roles = (data ?? []).map((r) => r.role);
      if (roles.includes("admin")) return "admin" as const;
      if (roles.includes("student")) return "student" as const;
      return "user" as const;
    },
    enabled: !!user,
    staleTime: 30_000,
  });
}

export function useUserAccessStatus(user: User | null) {
  return useQuery({
    queryKey: ["user_access_status", user?.id ?? null],
    queryFn: async () => {
      if (!user) return "active" as const;
      const { data } = await supabase
        .from("app_user_status" as any)
        .select("status")
        .eq("user_id", user.id)
        .maybeSingle();
      return ((data as any)?.status ?? "active") as "active" | "suspended" | "blocked";
    },
    enabled: !!user,
    staleTime: 15_000,
  });
}
