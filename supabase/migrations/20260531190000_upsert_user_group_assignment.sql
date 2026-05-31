create or replace function public.admin_set_user_group(target_user_id uuid, target_group_id uuid)
returns void
language plpgsql
security definer
set search_path = public, auth
as $$
begin
  if not public.has_role(auth.uid(), 'admin') then
    raise exception 'Admin access required';
  end if;

  insert into public.student_profiles (
    user_id,
    group_id,
    updated_at
  )
  values (
    target_user_id,
    target_group_id,
    now()
  )
  on conflict (user_id) do update set
    group_id = excluded.group_id,
    updated_at = now();
end;
$$;

grant execute on function public.admin_set_user_group(uuid, uuid) to authenticated;
