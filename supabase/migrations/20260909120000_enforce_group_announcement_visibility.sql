-- Enforce announcement audience at the database boundary.
-- General announcements are public; group announcements require an active
-- authenticated student in one of the assigned groups.
alter table public.announcements enable row level security;
alter table public.announcement_group_access enable row level security;

create or replace function public.student_can_view_announcement(
  target_announcement_id uuid,
  target_user_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    coalesce((
      select s.status = 'active'
      from public.app_user_status s
      where s.user_id = target_user_id
    ), false)
    and exists (
      select 1
      from public.announcements a
      join public.announcement_group_access aga
        on aga.announcement_id = a.id
      join public.student_profiles sp
        on sp.group_id = aga.group_id
       and sp.user_id = target_user_id
      where a.id = target_announcement_id
        and coalesce(a.target_scope, 'general') = 'group'
    );
$$;

grant execute on function public.student_can_view_announcement(uuid, uuid) to authenticated;

drop policy if exists "public read announcements" on public.announcements;
drop policy if exists "read visible announcements" on public.announcements;
drop policy if exists "students read announcements" on public.announcements;

create policy "read visible announcements"
on public.announcements
for select
to anon, authenticated
using (
  coalesce(target_scope, 'general') = 'general'
  or public.has_role(auth.uid(), 'admin')
  or (
    auth.uid() is not null
    and public.student_can_view_announcement(id, auth.uid())
  )
);

drop policy if exists "students read announcement group access" on public.announcement_group_access;
drop policy if exists "public read announcement group access" on public.announcement_group_access;

create policy "students read announcement group access"
on public.announcement_group_access
for select
to authenticated
using (
  public.has_role(auth.uid(), 'admin')
  or exists (
    select 1
    from public.student_profiles sp
    join public.app_user_status aus on aus.user_id = sp.user_id
    where sp.user_id = auth.uid()
      and sp.group_id = announcement_group_access.group_id
      and aus.status = 'active'
  )
);

notify pgrst, 'reload schema';
