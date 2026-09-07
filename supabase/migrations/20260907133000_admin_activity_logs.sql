create table if not exists public.admin_activity_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references auth.users(id) on delete set null,
  event_type text not null check (char_length(event_type) between 1 and 80),
  entity_type text not null check (char_length(entity_type) between 1 and 80),
  entity_id text,
  message text not null check (char_length(message) between 1 and 500),
  severity text not null default 'info' check (severity in ('info', 'warning', 'error')),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists admin_activity_logs_created_at_idx
  on public.admin_activity_logs(created_at desc);

create index if not exists admin_activity_logs_severity_created_at_idx
  on public.admin_activity_logs(severity, created_at desc);

alter table public.admin_activity_logs enable row level security;
alter table public.admin_activity_logs force row level security;

grant select on public.admin_activity_logs to authenticated;
grant insert on public.admin_activity_logs to authenticated;
grant all on public.admin_activity_logs to service_role;

drop policy if exists "admins read activity logs" on public.admin_activity_logs;
create policy "admins read activity logs"
on public.admin_activity_logs for select to authenticated
using (public.has_role(auth.uid(), 'admin'));

create or replace function public.admin_record_activity_log(
  p_event_type text,
  p_entity_type text,
  p_entity_id text,
  p_message text,
  p_severity text default 'info',
  p_metadata jsonb default '{}'::jsonb
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.has_role(auth.uid(), 'admin') then
    raise exception 'Admin access required';
  end if;

  insert into public.admin_activity_logs (actor_id, event_type, entity_type, entity_id, message, severity, metadata)
  values (
    auth.uid(),
    left(coalesce(nullif(trim(p_event_type), ''), 'activity'), 80),
    left(coalesce(nullif(trim(p_entity_type), ''), 'system'), 80),
    nullif(left(coalesce(p_entity_id, ''), 160), ''),
    left(coalesce(nullif(trim(p_message), ''), 'Admin activity recorded'), 500),
    case when p_severity in ('info', 'warning', 'error') then p_severity else 'info' end,
    coalesce(p_metadata, '{}'::jsonb)
  );
end;
$$;

grant execute on function public.admin_record_activity_log(text, text, text, text, text, jsonb) to authenticated;

create or replace function public.capture_admin_content_activity()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  row_data jsonb := case when tg_op = 'DELETE' then to_jsonb(old) else to_jsonb(new) end;
  record_id text := coalesce(row_data->>'id', row_data->>'user_id', '');
begin
  if auth.uid() is null or not public.has_role(auth.uid(), 'admin') then
    if tg_op = 'DELETE' then return old; end if;
    return new;
  end if;

  insert into public.admin_activity_logs (actor_id, event_type, entity_type, entity_id, message, severity)
  values (
    auth.uid(),
    lower(tg_op),
    tg_table_name,
    nullif(record_id, ''),
    initcap(lower(tg_op)) || ' ' || replace(tg_table_name, '_', ' '),
    'info'
  );

  if tg_op = 'DELETE' then return old; end if;
  return new;
end;
$$;

drop trigger if exists admin_activity_announcements on public.announcements;
create trigger admin_activity_announcements after insert or update or delete on public.announcements
for each row execute function public.capture_admin_content_activity();

drop trigger if exists admin_activity_resources on public.resources;
create trigger admin_activity_resources after insert or update or delete on public.resources
for each row execute function public.capture_admin_content_activity();

drop trigger if exists admin_activity_student_groups on public.student_groups;
create trigger admin_activity_student_groups after insert or update or delete on public.student_groups
for each row execute function public.capture_admin_content_activity();

drop trigger if exists admin_activity_student_profiles on public.student_profiles;
create trigger admin_activity_student_profiles after update on public.student_profiles
for each row execute function public.capture_admin_content_activity();

drop trigger if exists admin_activity_assignments on public.assignment_tasks;
create trigger admin_activity_assignments after insert or update or delete on public.assignment_tasks
for each row execute function public.capture_admin_content_activity();

drop trigger if exists admin_activity_blog_posts on public.blog_posts;
create trigger admin_activity_blog_posts after insert or update or delete on public.blog_posts
for each row execute function public.capture_admin_content_activity();

notify pgrst, 'reload schema';
