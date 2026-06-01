create table if not exists public.assignment_tasks (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null default '',
  due_date timestamptz,
  file_url text,
  file_name text,
  target_scope text not null default 'all' check (target_scope in ('all', 'group', 'user')),
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.assignment_task_groups (
  id uuid primary key default gen_random_uuid(),
  assignment_id uuid not null references public.assignment_tasks(id) on delete cascade,
  group_id uuid not null references public.student_groups(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (assignment_id, group_id)
);

create table if not exists public.assignment_task_users (
  id uuid primary key default gen_random_uuid(),
  assignment_id uuid not null references public.assignment_tasks(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (assignment_id, user_id)
);

create table if not exists public.assignment_submissions (
  id uuid primary key default gen_random_uuid(),
  assignment_id uuid not null references public.assignment_tasks(id) on delete cascade,
  student_id uuid not null references auth.users(id) on delete cascade,
  file_url text,
  file_name text,
  note text not null default '',
  status text not null default 'submitted' check (status in ('submitted', 'received', 'rejected', 'marked')),
  marks numeric,
  feedback text,
  rejection_reason text,
  submitted_at timestamptz not null default now(),
  reviewed_at timestamptz,
  reviewed_by uuid references auth.users(id) on delete set null,
  unique (assignment_id, student_id)
);

alter table public.assignment_tasks enable row level security;
alter table public.assignment_task_groups enable row level security;
alter table public.assignment_task_users enable row level security;
alter table public.assignment_submissions enable row level security;

grant select on public.assignment_tasks to authenticated;
grant all on public.assignment_tasks to authenticated, service_role;
grant select on public.assignment_task_groups to authenticated;
grant all on public.assignment_task_groups to authenticated, service_role;
grant select on public.assignment_task_users to authenticated;
grant all on public.assignment_task_users to authenticated, service_role;
grant select, insert, update on public.assignment_submissions to authenticated;
grant all on public.assignment_submissions to service_role;

drop policy if exists "admins manage assignment tasks" on public.assignment_tasks;
create policy "admins manage assignment tasks"
on public.assignment_tasks for all to authenticated
using (public.has_role(auth.uid(), 'admin'))
with check (public.has_role(auth.uid(), 'admin'));

drop policy if exists "students read visible assignment tasks" on public.assignment_tasks;
create policy "students read visible assignment tasks"
on public.assignment_tasks for select to authenticated
using (
  public.has_role(auth.uid(), 'admin')
  or target_scope = 'all'
  or exists (
    select 1
    from public.assignment_task_users atu
    where atu.assignment_id = assignment_tasks.id
      and atu.user_id = auth.uid()
  )
  or exists (
    select 1
    from public.student_profiles sp
    join public.assignment_task_groups atg on atg.group_id = sp.group_id
    where sp.user_id = auth.uid()
      and atg.assignment_id = assignment_tasks.id
  )
);

drop policy if exists "admins manage assignment task groups" on public.assignment_task_groups;
create policy "admins manage assignment task groups"
on public.assignment_task_groups for all to authenticated
using (public.has_role(auth.uid(), 'admin'))
with check (public.has_role(auth.uid(), 'admin'));

drop policy if exists "students read visible assignment task groups" on public.assignment_task_groups;
create policy "students read visible assignment task groups"
on public.assignment_task_groups for select to authenticated
using (
  public.has_role(auth.uid(), 'admin')
  or exists (
    select 1 from public.assignment_tasks a
    where a.id = assignment_task_groups.assignment_id
  )
);

drop policy if exists "admins manage assignment task users" on public.assignment_task_users;
create policy "admins manage assignment task users"
on public.assignment_task_users for all to authenticated
using (public.has_role(auth.uid(), 'admin'))
with check (public.has_role(auth.uid(), 'admin'));

drop policy if exists "students read own assignment task users" on public.assignment_task_users;
create policy "students read own assignment task users"
on public.assignment_task_users for select to authenticated
using (public.has_role(auth.uid(), 'admin') or user_id = auth.uid());

drop policy if exists "admins manage assignment submissions" on public.assignment_submissions;
create policy "admins manage assignment submissions"
on public.assignment_submissions for all to authenticated
using (public.has_role(auth.uid(), 'admin'))
with check (public.has_role(auth.uid(), 'admin'));

drop policy if exists "students read own assignment submissions" on public.assignment_submissions;
create policy "students read own assignment submissions"
on public.assignment_submissions for select to authenticated
using (student_id = auth.uid());

drop policy if exists "students submit own assignments" on public.assignment_submissions;
create policy "students submit own assignments"
on public.assignment_submissions for insert to authenticated
with check (student_id = auth.uid());

drop policy if exists "students resubmit own rejected assignments" on public.assignment_submissions;
create policy "students resubmit own rejected assignments"
on public.assignment_submissions for update to authenticated
using (student_id = auth.uid() and status = 'rejected')
with check (student_id = auth.uid() and status = 'submitted');

insert into storage.buckets (id, name, public)
values ('assignments', 'assignments', true)
on conflict do nothing;

drop policy if exists "authenticated read assignments bucket" on storage.objects;
create policy "authenticated read assignments bucket"
on storage.objects for select to authenticated
using (bucket_id = 'assignments');

drop policy if exists "authenticated upload assignments bucket" on storage.objects;
create policy "authenticated upload assignments bucket"
on storage.objects for insert to authenticated
with check (bucket_id = 'assignments');

drop policy if exists "authenticated update assignments bucket" on storage.objects;
create policy "authenticated update assignments bucket"
on storage.objects for update to authenticated
using (bucket_id = 'assignments')
with check (bucket_id = 'assignments');

drop policy if exists "admins delete assignments bucket" on storage.objects;
create policy "admins delete assignments bucket"
on storage.objects for delete to authenticated
using (bucket_id = 'assignments' and public.has_role(auth.uid(), 'admin'));

do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    alter publication supabase_realtime add table public.assignment_tasks;
    alter publication supabase_realtime add table public.assignment_submissions;
  end if;
exception
  when duplicate_object then null;
end $$;

notify pgrst, 'reload schema';
