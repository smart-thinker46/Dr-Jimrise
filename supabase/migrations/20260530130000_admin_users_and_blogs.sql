create extension if not exists pgcrypto with schema extensions;

create table if not exists public.app_user_status (
  user_id uuid primary key references auth.users(id) on delete cascade,
  status text not null default 'active' check (status in ('active', 'suspended', 'blocked')),
  reason text,
  updated_at timestamptz not null default now()
);

alter table public.app_user_status enable row level security;
grant select on public.app_user_status to authenticated;
grant all on public.app_user_status to service_role;

drop policy if exists "users read own app status" on public.app_user_status;
drop policy if exists "admins read all app status" on public.app_user_status;
drop policy if exists "admins insert app status" on public.app_user_status;
drop policy if exists "admins update app status" on public.app_user_status;
drop policy if exists "admins delete app status" on public.app_user_status;

create policy "users read own app status" on public.app_user_status
for select to authenticated using (auth.uid() = user_id);

create policy "admins read all app status" on public.app_user_status
for select to authenticated using (public.has_role(auth.uid(), 'admin'));

create policy "admins insert app status" on public.app_user_status
for insert to authenticated with check (public.has_role(auth.uid(), 'admin'));

create policy "admins update app status" on public.app_user_status
for update to authenticated using (public.has_role(auth.uid(), 'admin'));

create policy "admins delete app status" on public.app_user_status
for delete to authenticated using (public.has_role(auth.uid(), 'admin'));

create table if not exists public.blog_posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  excerpt text,
  content text not null default '',
  status text not null default 'draft' check (status in ('draft', 'published')),
  published_at timestamptz,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.blog_posts enable row level security;
grant select on public.blog_posts to anon, authenticated;
grant all on public.blog_posts to authenticated;
grant all on public.blog_posts to service_role;

drop policy if exists "public read published blogs" on public.blog_posts;
drop policy if exists "admins read all blogs" on public.blog_posts;
drop policy if exists "admins insert blogs" on public.blog_posts;
drop policy if exists "admins update blogs" on public.blog_posts;
drop policy if exists "admins delete blogs" on public.blog_posts;

create policy "public read published blogs" on public.blog_posts
for select to anon, authenticated using (status = 'published');

create policy "admins read all blogs" on public.blog_posts
for select to authenticated using (public.has_role(auth.uid(), 'admin'));

create policy "admins insert blogs" on public.blog_posts
for insert to authenticated with check (public.has_role(auth.uid(), 'admin'));

create policy "admins update blogs" on public.blog_posts
for update to authenticated using (public.has_role(auth.uid(), 'admin'));

create policy "admins delete blogs" on public.blog_posts
for delete to authenticated using (public.has_role(auth.uid(), 'admin'));

create or replace function public.admin_list_users()
returns table (
  id uuid,
  email text,
  role text,
  status text,
  reason text,
  confirmed boolean,
  created_at timestamptz,
  last_sign_in_at timestamptz
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
    u.last_sign_in_at
  from auth.users u
  left join public.app_user_status s on s.user_id = u.id
  order by u.created_at desc;
end;
$$;

create or replace function public.admin_create_user(
  user_email text,
  user_password text,
  user_role text default 'student'
)
returns uuid
language plpgsql
security definer
set search_path = public, auth, extensions
as $$
declare
  new_user_id uuid := gen_random_uuid();
  normalized_email text := lower(trim(user_email));
  normalized_role public.app_role := user_role::public.app_role;
begin
  if not public.has_role(auth.uid(), 'admin') then
    raise exception 'Admin access required';
  end if;

  if normalized_role not in ('admin', 'student', 'user') then
    raise exception 'Invalid role';
  end if;

  if exists (select 1 from auth.users where lower(email) = normalized_email) then
    raise exception 'A user with this email already exists';
  end if;

  insert into auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
  )
  values (
    '00000000-0000-0000-0000-000000000000',
    new_user_id,
    'authenticated',
    'authenticated',
    normalized_email,
    extensions.crypt(user_password, extensions.gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    jsonb_build_object('name', normalized_email),
    now(),
    now(),
    '',
    '',
    '',
    ''
  );

  insert into auth.identities (
    id,
    user_id,
    provider_id,
    identity_data,
    provider,
    last_sign_in_at,
    created_at,
    updated_at
  )
  values (
    new_user_id,
    new_user_id,
    normalized_email,
    jsonb_build_object(
      'sub', new_user_id::text,
      'email', normalized_email,
      'email_verified', true
    ),
    'email',
    now(),
    now(),
    now()
  );

  delete from public.user_roles where user_id = new_user_id;
  insert into public.user_roles (user_id, role) values (new_user_id, normalized_role);
  insert into public.app_user_status (user_id, status)
  values (new_user_id, 'active')
  on conflict (user_id) do update set status = 'active', reason = null, updated_at = now();

  return new_user_id;
end;
$$;

create or replace function public.admin_set_user_role(target_user_id uuid, new_role text)
returns void
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  normalized_role public.app_role := new_role::public.app_role;
begin
  if not public.has_role(auth.uid(), 'admin') then
    raise exception 'Admin access required';
  end if;

  if normalized_role not in ('admin', 'student', 'user') then
    raise exception 'Invalid role';
  end if;

  if target_user_id = auth.uid() and normalized_role <> 'admin' then
    raise exception 'You cannot remove your own admin role';
  end if;

  delete from public.user_roles where user_id = target_user_id;
  insert into public.user_roles (user_id, role) values (target_user_id, normalized_role);
end;
$$;

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

  insert into public.app_user_status (user_id, status, reason, updated_at)
  values (target_user_id, new_status, nullif(status_reason, ''), now())
  on conflict (user_id) do update
  set status = excluded.status,
      reason = excluded.reason,
      updated_at = now();
end;
$$;

create or replace function public.admin_delete_user(target_user_id uuid)
returns void
language plpgsql
security definer
set search_path = public, auth
as $$
begin
  if not public.has_role(auth.uid(), 'admin') then
    raise exception 'Admin access required';
  end if;

  if target_user_id = auth.uid() then
    raise exception 'You cannot delete your own account';
  end if;

  delete from auth.users where id = target_user_id;
end;
$$;

grant execute on function public.admin_list_users() to authenticated;
grant execute on function public.admin_create_user(text, text, text) to authenticated;
grant execute on function public.admin_set_user_role(uuid, text) to authenticated;
grant execute on function public.admin_set_user_status(uuid, text, text) to authenticated;
grant execute on function public.admin_delete_user(uuid) to authenticated;
