import { supabase } from "@/integrations/supabase/client";

function safeMessage(error: unknown) {
  const message = error instanceof Error ? error.message : String(error ?? "Unexpected error");
  return message.replace(/[\r\n]+/g, " ").slice(0, 500);
}

export async function recordAdminClientError(error: unknown, context: Record<string, unknown> = {}) {
  if (typeof window === "undefined") return;

  try {
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session) return;
    await (supabase.rpc as any)("admin_record_activity_log", {
      p_event_type: "client_error",
      p_entity_type: "application",
      p_entity_id: window.location.pathname,
      p_message: safeMessage(error),
      p_severity: "error",
      p_metadata: { route: window.location.pathname, ...context },
    });
  } catch {
    // Logging must never cause a second user-visible failure.
  }
}
