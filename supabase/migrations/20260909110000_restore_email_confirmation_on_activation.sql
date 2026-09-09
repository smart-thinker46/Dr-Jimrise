-- Keep Supabase Auth confirmation synchronized with admin approval.
-- This runs inside Postgres as a security-definer function; no service-role
-- key is exposed to the browser or required by the dashboard.
create or replace function public.confirm_auth_email_for_active_user()
returns trigger
language plpgsql
security definer
set search_path = public, auth
as $$
begin
  if new.status = 'active' then
    update auth.users
    set email_confirmed_at = coalesce(email_confirmed_at, now()),
        updated_at = now()
    where id = new.user_id;
  end if;
  return new;
end;
$$;

drop trigger if exists confirm_auth_email_after_activation on public.app_user_status;
create trigger confirm_auth_email_after_activation
after insert or update of status on public.app_user_status
for each row execute function public.confirm_auth_email_for_active_user();

-- Ensure the approval RPC also confirms email when the trigger is bypassed or
-- when a status is written by another trusted database operation.
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
        updated_at = now()
    where id = target_user_id;
  end if;
end;
$$;

grant execute on function public.admin_set_user_status(uuid, text, text) to authenticated;

-- Repair students who are already active but still marked unconfirmed.
update auth.users as au
set email_confirmed_at = coalesce(au.email_confirmed_at, now()),
    updated_at = now()
where exists (
  select 1
  from public.app_user_status as aus
  where aus.user_id = au.id
    and aus.status = 'active'
);

notify pgrst, 'reload schema';
