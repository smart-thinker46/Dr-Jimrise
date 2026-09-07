-- Group messages give administrators a direct way to notify every active
-- student in one or more groups without exposing the message to other groups.
create table if not exists public.group_messages (
  id uuid primary key default gen_random_uuid(),
  subject text not null check (char_length(subject) between 1 and 160),
  body text not null check (char_length(body) between 1 and 5000),
  target_scope text not null default 'all' check (target_scope in ('all', 'group')),
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.group_message_access (
  id uuid primary key default gen_random_uuid(),
  message_id uuid not null references public.group_messages(id) on delete cascade,
  group_id uuid not null references public.student_groups(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique(message_id, group_id)
);

create index if not exists group_message_access_group_id_idx
  on public.group_message_access(group_id, message_id);

create index if not exists group_messages_created_at_idx
  on public.group_messages(created_at desc);

alter table public.group_messages enable row level security;
alter table public.group_message_access enable row level security;

grant select, insert, update, delete on public.group_messages to authenticated;
grant select, insert, update, delete on public.group_message_access to authenticated;
grant all on public.group_messages, public.group_message_access to service_role;

drop policy if exists "admins manage group messages" on public.group_messages;
create policy "admins manage group messages"
on public.group_messages for all to authenticated
using (public.has_role(auth.uid(), 'admin'))
with check (public.has_role(auth.uid(), 'admin'));

drop policy if exists "students read assigned group messages" on public.group_messages;
create policy "students read assigned group messages"
on public.group_messages for select to authenticated
using (
  coalesce((select s.status from public.app_user_status s where s.user_id = auth.uid()), 'active') = 'active'
  and (
    target_scope = 'all'
    or exists (
      select 1
      from public.student_profiles sp
      join public.group_message_access gma on gma.group_id = sp.group_id
      where sp.user_id = auth.uid()
        and gma.message_id = group_messages.id
    )
  )
);

drop policy if exists "admins manage group message access" on public.group_message_access;
create policy "admins manage group message access"
on public.group_message_access for all to authenticated
using (public.has_role(auth.uid(), 'admin'))
with check (public.has_role(auth.uid(), 'admin'));

drop policy if exists "students read own group message access" on public.group_message_access;
create policy "students read own group message access"
on public.group_message_access for select to authenticated
using (
  exists (
    select 1 from public.student_profiles sp
    where sp.user_id = auth.uid()
      and sp.group_id = group_message_access.group_id
  )
);

do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    alter publication supabase_realtime add table public.group_messages;
    alter publication supabase_realtime add table public.group_message_access;
  end if;
exception
  when duplicate_object then null;
end $$;

notify pgrst, 'reload schema';
