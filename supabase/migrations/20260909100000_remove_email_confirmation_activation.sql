-- Approval is controlled by app_user_status. Email verification is disabled
-- in Supabase Auth for this project, so activating a student must not mutate
-- auth.users or require a service-role key.
drop trigger if exists confirm_auth_email_after_activation on public.app_user_status;
drop function if exists public.confirm_auth_email_for_active_user();

create or replace function public.admin_set_user_status(
  target_user_id uuid,
  new_status text,
  status_reason text default null
)
returns void
language plpgsql
security definer
set search_path = public
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
end;
$$;

grant execute on function public.admin_set_user_status(uuid, text, text) to authenticated;
notify pgrst, 'reload schema';
