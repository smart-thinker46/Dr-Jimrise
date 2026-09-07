-- Evaluate group-announcement membership in a security-definer function.
-- This avoids nested RLS checks hiding valid group announcements from students.
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
    coalesce(
      (select status = 'active' from public.app_user_status where user_id = target_user_id),
      true
    )
    and exists (
      select 1
      from public.announcements a
      where a.id = target_announcement_id
        and (
          a.target_scope = 'general'
          or exists (
            select 1
            from public.student_profiles sp
            join public.announcement_group_access aga on aga.group_id = sp.group_id
            where sp.user_id = target_user_id
              and aga.announcement_id = a.id
          )
        )
    );
$$;

grant execute on function public.student_can_view_announcement(uuid, uuid) to authenticated;

create index if not exists announcement_group_access_group_announcement_idx
  on public.announcement_group_access(group_id, announcement_id);

create index if not exists student_profiles_user_group_idx
  on public.student_profiles(user_id, group_id);

drop policy if exists "read visible announcements" on public.announcements;
create policy "read visible announcements"
on public.announcements
for select
to anon, authenticated
using (
  public.has_role(auth.uid(), 'admin')
  or (
    auth.uid() is null and target_scope = 'general'
  )
  or (
    auth.uid() is not null
    and public.student_can_view_announcement(id, auth.uid())
  )
);

-- Each publication change is isolated so an already-added table does not stop
-- later tables from being registered for real-time client refreshes.
do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    begin
      alter publication supabase_realtime add table public.announcements;
    exception when duplicate_object then null;
    end;
    begin
      alter publication supabase_realtime add table public.announcement_group_access;
    exception when duplicate_object then null;
    end;
    begin
      alter publication supabase_realtime add table public.student_profiles;
    exception when duplicate_object then null;
    end;
  end if;
end $$;

notify pgrst, 'reload schema';
