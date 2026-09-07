-- Activating an account from the admin dashboard also confirms its email.
-- This is intentionally limited to the existing admin-only status function.
create or replace function public.admin_set_user_status(
  target_user_id uuid,
  new_status text,
  status_reason text default null
)
returns void
language plpgsql
security definer
set search_path = public, auth
as $$
begin
  if not public.has_role(auth.uid(), 'admin') then
    raise exception 'Admin access required';
  end if;

  if new_status not in ('active', 'suspended', 'blocked') then
    raise exception 'Invalid status';
  end if;

  if target_user_id = auth.uid() and new_status <> 'active' then
    raise exception 'You cannot suspend or block your own account';
  end if;

  if not exists (select 1 from auth.users where id = target_user_id) then
    raise exception 'User not found';
  end if;

  insert into public.app_user_status (user_id, status, reason, updated_at)
  values (target_user_id, new_status, nullif(status_reason, ''), now())
  on conflict (user_id) do update
  set status = excluded.status,
      reason = excluded.reason,
      updated_at = now();

  if new_status = 'active' then
    update auth.users
    set email_confirmed_at = coalesce(email_confirmed_at, now()),
        confirmed_at = coalesce(confirmed_at, now()),
        updated_at = now()
    where id = target_user_id;
  end if;
end;
$$;

grant execute on function public.admin_set_user_status(uuid, text, text) to authenticated;

notify pgrst, 'reload schema';
