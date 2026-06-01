alter table public.student_profiles
add column if not exists admission_number text not null default '';

drop function if exists public.admin_list_users();

create or replace function public.admin_list_users()
returns table (
  id uuid,
  email text,
  role text,
  status text,
  reason text,
  confirmed boolean,
  created_at timestamptz,
  last_sign_in_at timestamptz,
  first_name text,
  last_name text,
  organization_name text,
  education_level text,
  program text,
  admission_number text,
  group_id uuid,
  group_name text
)
language plpgsql
security definer
set search_path = public, auth, extensions
as $$
begin
  if not public.has_role(auth.uid(), 'admin') then
    raise exception 'Admin access required';
  end if;

  return query
  select
    u.id,
    u.email::text,
    coalesce(
      (select 'admin' from public.user_roles ur where ur.user_id = u.id and ur.role = 'admin' limit 1),
      (select 'student' from public.user_roles ur where ur.user_id = u.id and ur.role = 'student' limit 1),
      'user'
    )::text as role,
    coalesce(s.status, 'active')::text as status,
    s.reason,
    u.email_confirmed_at is not null as confirmed,
    u.created_at,
    u.last_sign_in_at,
    coalesce(p.first_name, u.raw_user_meta_data->>'first_name', '')::text as first_name,
    coalesce(p.last_name, u.raw_user_meta_data->>'last_name', '')::text as last_name,
    coalesce(p.organization_name, u.raw_user_meta_data->>'organization_name', '')::text as organization_name,
    coalesce(p.education_level, u.raw_user_meta_data->>'education_level', '')::text as education_level,
    coalesce(p.program, u.raw_user_meta_data->>'program', '')::text as program,
    coalesce(p.admission_number, '')::text as admission_number,
    p.group_id,
    g.group_name::text
  from auth.users u
  left join public.app_user_status s on s.user_id = u.id
  left join public.student_profiles p on p.user_id = u.id
  left join public.student_groups g on g.id = p.group_id
  order by u.created_at desc;
end;
$$;

grant execute on function public.admin_list_users() to authenticated;

notify pgrst, 'reload schema';
