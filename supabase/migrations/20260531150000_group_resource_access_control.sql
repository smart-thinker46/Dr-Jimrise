alter table public.app_user_status
drop constraint if exists app_user_status_status_check;

alter table public.app_user_status
add constraint app_user_status_status_check
check (status in ('pending', 'active', 'suspended', 'blocked'));

create table if not exists public.student_groups (
  id uuid primary key default gen_random_uuid(),
  group_name text not null unique,
  description text not null default '',
  created_at timestamptz not null default now()
);

alter table public.student_groups enable row level security;
grant select on public.student_groups to anon, authenticated;
grant all on public.student_groups to authenticated;
grant all on public.student_groups to service_role;

drop policy if exists "public read student groups" on public.student_groups;
drop policy if exists "admin insert student groups" on public.student_groups;
drop policy if exists "admin update student groups" on public.student_groups;
drop policy if exists "admin delete student groups" on public.student_groups;

create policy "public read student groups"
on public.student_groups for select
to anon, authenticated
using (true);

create policy "admin insert student groups"
on public.student_groups for insert
to authenticated
with check (public.has_role(auth.uid(), 'admin'));

create policy "admin update student groups"
on public.student_groups for update
to authenticated
using (public.has_role(auth.uid(), 'admin'))
with check (public.has_role(auth.uid(), 'admin'));

create policy "admin delete student groups"
on public.student_groups for delete
to authenticated
using (public.has_role(auth.uid(), 'admin'));

insert into public.student_groups (group_name, description)
values
  ('BSc Mathematics', 'Undergraduate mathematics students'),
  ('BSc Statistics', 'Undergraduate statistics students'),
  ('MSc Applied Mathematics', 'Postgraduate applied mathematics students')
on conflict (group_name) do nothing;

alter table public.student_profiles
add column if not exists group_id uuid references public.student_groups(id) on delete set null;

create table if not exists public.resource_group_access (
  id uuid primary key default gen_random_uuid(),
  resource_id uuid not null references public.resources(id) on delete cascade,
  group_id uuid not null references public.student_groups(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique(resource_id, group_id)
);

alter table public.resource_group_access enable row level security;
grant select on public.resource_group_access to authenticated;
grant all on public.resource_group_access to authenticated;
grant all on public.resource_group_access to service_role;

drop policy if exists "admins manage resource group access" on public.resource_group_access;
drop policy if exists "students read own resource group access" on public.resource_group_access;

create policy "admins manage resource group access"
on public.resource_group_access
for all
to authenticated
using (public.has_role(auth.uid(), 'admin'))
with check (public.has_role(auth.uid(), 'admin'));

create policy "students read own resource group access"
on public.resource_group_access
for select
to authenticated
using (
  exists (
    select 1
    from public.student_profiles sp
    where sp.user_id = auth.uid()
      and sp.group_id = resource_group_access.group_id
  )
);

create or replace function public.user_has_resource_group_access(resource_id uuid, user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    not exists (select 1 from public.resource_group_access rga where rga.resource_id = $1)
    or exists (
      select 1
      from public.resource_group_access rga
      join public.student_profiles sp on sp.group_id = rga.group_id
      where rga.resource_id = $1
        and sp.user_id = $2
    );
$$;

drop policy if exists "public read resources" on public.resources;
drop policy if exists "admin read resources" on public.resources;
drop policy if exists "allowed read resources" on public.resources;

create policy "admin read resources"
on public.resources
for select
to authenticated
using (public.has_role(auth.uid(), 'admin'));

create policy "allowed read resources"
on public.resources
for select
to anon, authenticated
using (
  access_level = 'public'
  or public.has_role(auth.uid(), 'admin')
  or (
    auth.uid() is not null
    and coalesce((select s.status from public.app_user_status s where s.user_id = auth.uid()), 'active') = 'active'
    and public.user_has_resource_group_access(resources.id, auth.uid())
  )
);

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

  update public.student_profiles
  set group_id = target_group_id,
      updated_at = now()
  where user_id = target_user_id;
end;
$$;

grant execute on function public.admin_set_user_group(uuid, uuid) to authenticated;

create or replace function public.handle_new_user_role()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  requested_group uuid := nullif(new.raw_user_meta_data->>'group_id', '')::uuid;
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
    program,
    group_id
  )
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'first_name', ''),
    coalesce(new.raw_user_meta_data->>'last_name', ''),
    coalesce(new.raw_user_meta_data->>'organization_name', ''),
    coalesce(new.raw_user_meta_data->>'education_level', ''),
    coalesce(new.raw_user_meta_data->>'program', ''),
    requested_group
  )
  on conflict (user_id) do update set
    first_name = excluded.first_name,
    last_name = excluded.last_name,
    organization_name = excluded.organization_name,
    education_level = excluded.education_level,
    program = excluded.program,
    group_id = excluded.group_id,
    updated_at = now();

  insert into public.app_user_status (user_id, status, reason, updated_at)
  values (new.id, 'pending', 'Awaiting admin approval', now())
  on conflict (user_id) do nothing;

  return new;
end;
$$;
