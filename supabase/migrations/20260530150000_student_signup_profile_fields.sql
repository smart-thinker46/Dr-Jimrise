create table if not exists public.student_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  first_name text not null default '',
  last_name text not null default '',
  organization_name text not null default '',
  education_level text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.student_profiles enable row level security;
grant select, insert, update on public.student_profiles to authenticated;
grant all on public.student_profiles to service_role;

drop policy if exists "students read own profile" on public.student_profiles;
drop policy if exists "students insert own profile" on public.student_profiles;
drop policy if exists "students update own profile" on public.student_profiles;
drop policy if exists "admins read all student profiles" on public.student_profiles;
drop policy if exists "admins update all student profiles" on public.student_profiles;

create policy "students read own profile" on public.student_profiles
for select to authenticated using (auth.uid() = user_id);

create policy "students insert own profile" on public.student_profiles
for insert to authenticated with check (auth.uid() = user_id);

create policy "students update own profile" on public.student_profiles
for update to authenticated using (auth.uid() = user_id);

create policy "admins read all student profiles" on public.student_profiles
for select to authenticated using (public.has_role(auth.uid(), 'admin'));

create policy "admins update all student profiles" on public.student_profiles
for update to authenticated using (public.has_role(auth.uid(), 'admin'));

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
    education_level
  )
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'first_name', ''),
    coalesce(new.raw_user_meta_data->>'last_name', ''),
    coalesce(new.raw_user_meta_data->>'organization_name', ''),
    coalesce(new.raw_user_meta_data->>'education_level', '')
  )
  on conflict (user_id) do update set
    first_name = excluded.first_name,
    last_name = excluded.last_name,
    organization_name = excluded.organization_name,
    education_level = excluded.education_level,
    updated_at = now();

  return new;
end;
$$;
