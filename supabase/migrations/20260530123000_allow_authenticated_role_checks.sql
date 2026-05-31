-- RLS policies on user_roles call public.has_role(...).
-- Authenticated clients need execute permission so their own role query can pass policy checks.
grant execute on function public.has_role(uuid, public.app_role) to authenticated;
