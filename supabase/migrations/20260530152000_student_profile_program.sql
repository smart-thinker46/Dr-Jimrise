alter table public.student_profiles
add column if not exists program text not null default '';

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
  program text
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
    coalesce(p.program, u.raw_user_meta_data->>'program', '')::text as program
  from auth.users u
  left join public.app_user_status s on s.user_id = u.id
  left join public.student_profiles p on p.user_id = u.id
  order by u.created_at desc;
end;
$$;

grant execute on function public.admin_list_users() to authenticated;

create or replace function public.handle_new_user_role()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.user_roles (user_id, role)
  values (new.id, 'student')
  on conflict (user_id, role) do nothing;

  insert into public.student_profiles (
    user_id,
    first_name,
    last_name,
    organization_name,
    education_level,
    program
  )
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'first_name', ''),
    coalesce(new.raw_user_meta_data->>'last_name', ''),
    coalesce(new.raw_user_meta_data->>'organization_name', ''),
    coalesce(new.raw_user_meta_data->>'education_level', ''),
    coalesce(new.raw_user_meta_data->>'program', '')
  )
  on conflict (user_id) do update set
    first_name = excluded.first_name,
    last_name = excluded.last_name,
    organization_name = excluded.organization_name,
    education_level = excluded.education_level,
    program = excluded.program,
    updated_at = now();

  return new;
end;
$$;
