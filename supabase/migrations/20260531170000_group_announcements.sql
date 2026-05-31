alter table public.announcements
  add column if not exists target_scope text not null default 'general'
    check (target_scope in ('general', 'group'));

create table if not exists public.announcement_group_access (
  id uuid primary key default gen_random_uuid(),
  announcement_id uuid not null references public.announcements(id) on delete cascade,
  group_id uuid not null references public.student_groups(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (announcement_id, group_id)
);

alter table public.announcement_group_access enable row level security;

drop policy if exists "admin manage announcement group access" on public.announcement_group_access;
create policy "admin manage announcement group access"
  on public.announcement_group_access
  for all
  to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

grant select on public.announcement_group_access to anon, authenticated;
grant all on public.announcement_group_access to authenticated;
grant all on public.announcement_group_access to service_role;

drop policy if exists "public read announcements" on public.announcements;
drop policy if exists "read visible announcements" on public.announcements;

create policy "read visible announcements"
  on public.announcements
  for select
  to anon, authenticated
  using (
    target_scope = 'general'
    or public.has_role(auth.uid(), 'admin')
    or (
      auth.uid() is not null
      and coalesce((select s.status from public.app_user_status s where s.user_id = auth.uid()), 'active') = 'active'
      and exists (
        select 1
        from public.student_profiles sp
        join public.announcement_group_access aga on aga.group_id = sp.group_id
        where sp.user_id = auth.uid()
          and aga.announcement_id = announcements.id
      )
    )
  );

create or replace function public.admin_list_announcements()
returns table (
  id uuid,
  date text,
  title text,
  body text,
  sort_order int,
  created_at timestamptz,
  target_scope text,
  group_ids uuid[],
  group_names text[]
)
language sql
stable
security definer
set search_path = public
as $$
  select
    a.id,
    a.date,
    a.title,
    a.body,
    a.sort_order,
    a.created_at,
    a.target_scope,
    coalesce(array_agg(g.id order by g.group_name) filter (where g.id is not null), array[]::uuid[]) as group_ids,
    coalesce(array_agg(g.group_name order by g.group_name) filter (where g.group_name is not null), array[]::text[]) as group_names
  from public.announcements a
  left join public.announcement_group_access aga on aga.announcement_id = a.id
  left join public.student_groups g on g.id = aga.group_id
  where public.has_role(auth.uid(), 'admin')
  group by a.id
  order by a.sort_order asc, a.created_at desc;
$$;

grant execute on function public.admin_list_announcements() to authenticated;

do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    alter publication supabase_realtime add table public.announcement_group_access;
  end if;
exception
  when duplicate_object then null;
end $$;
