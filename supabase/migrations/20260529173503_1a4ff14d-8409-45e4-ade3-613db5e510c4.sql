
-- Roles
create type public.app_role as enum ('admin', 'user');

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role app_role not null default 'user',
  created_at timestamptz not null default now(),
  unique(user_id, role)
);

grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean
language sql stable security definer set search_path = public
as $$ select exists(select 1 from public.user_roles where user_id=_user_id and role=_role) $$;

create policy "users read own roles" on public.user_roles for select to authenticated using (auth.uid() = user_id);
create policy "admins read all roles" on public.user_roles for select to authenticated using (public.has_role(auth.uid(),'admin'));

-- Generic site content KV (hero text, profile image url, etc.)
create table public.site_content (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);
grant select on public.site_content to anon, authenticated;
grant all on public.site_content to authenticated;
grant all on public.site_content to service_role;
alter table public.site_content enable row level security;
create policy "public read site_content" on public.site_content for select to anon, authenticated using (true);
create policy "admin write site_content insert" on public.site_content for insert to authenticated with check (public.has_role(auth.uid(),'admin'));
create policy "admin write site_content update" on public.site_content for update to authenticated using (public.has_role(auth.uid(),'admin'));
create policy "admin write site_content delete" on public.site_content for delete to authenticated using (public.has_role(auth.uid(),'admin'));

-- Announcements
create table public.announcements (
  id uuid primary key default gen_random_uuid(),
  date text not null,
  title text not null,
  body text not null,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);
grant select on public.announcements to anon, authenticated;
grant all on public.announcements to authenticated;
grant all on public.announcements to service_role;
alter table public.announcements enable row level security;
create policy "public read announcements" on public.announcements for select to anon, authenticated using (true);
create policy "admin insert announcements" on public.announcements for insert to authenticated with check (public.has_role(auth.uid(),'admin'));
create policy "admin update announcements" on public.announcements for update to authenticated using (public.has_role(auth.uid(),'admin'));
create policy "admin delete announcements" on public.announcements for delete to authenticated using (public.has_role(auth.uid(),'admin'));

-- Resources
create table public.resources (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  course text not null,
  type text not null,
  date text not null,
  file_url text,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);
grant select on public.resources to anon, authenticated;
grant all on public.resources to authenticated;
grant all on public.resources to service_role;
alter table public.resources enable row level security;
create policy "public read resources" on public.resources for select to anon, authenticated using (true);
create policy "admin insert resources" on public.resources for insert to authenticated with check (public.has_role(auth.uid(),'admin'));
create policy "admin update resources" on public.resources for update to authenticated using (public.has_role(auth.uid(),'admin'));
create policy "admin delete resources" on public.resources for delete to authenticated using (public.has_role(auth.uid(),'admin'));

-- Publications
create table public.publications (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('journal','conference')),
  title text not null,
  authors text,
  venue text,
  year int,
  doi text,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);
grant select on public.publications to anon, authenticated;
grant all on public.publications to authenticated;
grant all on public.publications to service_role;
alter table public.publications enable row level security;
create policy "public read pubs" on public.publications for select to anon, authenticated using (true);
create policy "admin insert pubs" on public.publications for insert to authenticated with check (public.has_role(auth.uid(),'admin'));
create policy "admin update pubs" on public.publications for update to authenticated using (public.has_role(auth.uid(),'admin'));
create policy "admin delete pubs" on public.publications for delete to authenticated using (public.has_role(auth.uid(),'admin'));

-- Supervision
create table public.supervision (
  id uuid primary key default gen_random_uuid(),
  level text not null check (level in ('phd','msc_completed','msc_ongoing')),
  name text not null,
  title text not null,
  school text,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);
grant select on public.supervision to anon, authenticated;
grant all on public.supervision to authenticated;
grant all on public.supervision to service_role;
alter table public.supervision enable row level security;
create policy "public read sup" on public.supervision for select to anon, authenticated using (true);
create policy "admin insert sup" on public.supervision for insert to authenticated with check (public.has_role(auth.uid(),'admin'));
create policy "admin update sup" on public.supervision for update to authenticated using (public.has_role(auth.uid(),'admin'));
create policy "admin delete sup" on public.supervision for delete to authenticated using (public.has_role(auth.uid(),'admin'));

-- Storage buckets
insert into storage.buckets (id, name, public) values ('public-assets','public-assets', true) on conflict do nothing;
insert into storage.buckets (id, name, public) values ('resources','resources', true) on conflict do nothing;

create policy "public read public-assets" on storage.objects for select to anon, authenticated using (bucket_id = 'public-assets');
create policy "admin write public-assets" on storage.objects for insert to authenticated with check (bucket_id = 'public-assets' and public.has_role(auth.uid(),'admin'));
create policy "admin update public-assets" on storage.objects for update to authenticated using (bucket_id = 'public-assets' and public.has_role(auth.uid(),'admin'));
create policy "admin delete public-assets" on storage.objects for delete to authenticated using (bucket_id = 'public-assets' and public.has_role(auth.uid(),'admin'));

create policy "public read resources bucket" on storage.objects for select to anon, authenticated using (bucket_id = 'resources');
create policy "admin write resources bucket" on storage.objects for insert to authenticated with check (bucket_id = 'resources' and public.has_role(auth.uid(),'admin'));
create policy "admin update resources bucket" on storage.objects for update to authenticated using (bucket_id = 'resources' and public.has_role(auth.uid(),'admin'));
create policy "admin delete resources bucket" on storage.objects for delete to authenticated using (bucket_id = 'resources' and public.has_role(auth.uid(),'admin'));
