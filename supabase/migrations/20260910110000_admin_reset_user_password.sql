-- Allow administrators to reset a user's password without exposing a
-- Supabase service-role key to the browser.
create extension if not exists pgcrypto with schema extensions;

create or replace function public.admin_reset_user_password(
  target_user_id uuid,
  new_password text
)
returns void
language plpgsql
security definer
set search_path = public, auth, extensions
as $$
begin
  if not public.has_role(auth.uid(), 'admin') then
    raise exception 'Admin access required';
  end if;

  if new_password is null or char_length(new_password) < 6 then
    raise exception 'Password must be at least 6 characters';
  end if;

  if not exists (select 1 from auth.users where id = target_user_id) then
    raise exception 'User not found';
  end if;

  update auth.users
  set encrypted_password = extensions.crypt(new_password, extensions.gen_salt('bf')),
      updated_at = now()
  where id = target_user_id;

  if to_regprocedure('public.admin_record_activity_log(text,text,text,text,text,jsonb)') is not null then
    perform public.admin_record_activity_log(
      'password_reset',
      'user',
      target_user_id::text,
      'Reset user password',
      'warning',
      '{}'::jsonb
    );
  end if;
end;
$$;

revoke all on function public.admin_reset_user_password(uuid, text) from public;
grant execute on function public.admin_reset_user_password(uuid, text) to authenticated;

notify pgrst, 'reload schema';
