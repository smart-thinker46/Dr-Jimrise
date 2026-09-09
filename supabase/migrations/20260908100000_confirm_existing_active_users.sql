-- Confirm accounts that were activated before admin activation started
-- synchronizing the Supabase Auth email confirmation state.
update auth.users as au
set email_confirmed_at = coalesce(au.email_confirmed_at, now()),
    updated_at = now()
where exists (
  select 1
  from public.app_user_status as aus
  where aus.user_id = au.id
    and aus.status = 'active'
);

-- Keep the application status and Supabase Auth confirmation state in sync for
-- every future activation, including older admin approval code paths.
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

notify pgrst, 'reload schema';
