-- Security hardening without OTP:
-- - remove client-side admin bootstrapping
-- - make protected resource files enforce access through Storage RLS
-- - tighten message validation and RLS boundaries

revoke execute on function public.bootstrap_admin() from public, anon, authenticated;

alter table public.user_roles force row level security;
alter table public.app_user_status force row level security;
alter table public.student_profiles force row level security;
alter table public.contact_messages force row level security;
alter table public.resources force row level security;
alter table public.resource_group_access force row level security;
alter table public.assignment_tasks force row level security;
alter table public.assignment_task_groups force row level security;
alter table public.assignment_task_users force row level security;
alter table public.assignment_submissions force row level security;

alter table public.contact_messages
  drop constraint if exists contact_messages_email_valid,
  drop constraint if exists contact_messages_name_length,
  drop constraint if exists contact_messages_message_length,
  add constraint contact_messages_email_valid
    check (email ~* '^[A-Z0-9._%+\-]+@[A-Z0-9.\-]+\.[A-Z]{2,}$'),
  add constraint contact_messages_name_length
    check (char_length(trim(name)) between 2 and 120),
  add constraint contact_messages_message_length
    check (char_length(trim(message)) between 2 and 5000);

update storage.buckets
set public = false
where id = 'resources';

drop policy if exists "public read resources bucket" on storage.objects;
drop policy if exists "secure read resources bucket" on storage.objects;
create policy "secure read resources bucket"
on storage.objects
for select
to anon, authenticated
using (
  bucket_id = 'resources'
  and exists (
    select 1
    from public.resources r
    where r.id::text = split_part(storage.objects.name, '/', 1)
      and (
        r.access_level = 'public'
        or public.has_role(auth.uid(), 'admin')
        or (
          auth.uid() is not null
          and coalesce((select s.status from public.app_user_status s where s.user_id = auth.uid()), 'active') = 'active'
          and public.user_has_resource_group_access(r.id, auth.uid())
        )
      )
  )
);

drop policy if exists "admin write resources bucket" on storage.objects;
drop policy if exists "admin update resources bucket" on storage.objects;
drop policy if exists "admin delete resources bucket" on storage.objects;

create policy "admin write resources bucket"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'resources'
  and public.has_role(auth.uid(), 'admin')
  and storage.objects.name !~ '(^|/)\.\.(/|$)'
);

create policy "admin update resources bucket"
on storage.objects
for update
to authenticated
using (bucket_id = 'resources' and public.has_role(auth.uid(), 'admin'))
with check (
  bucket_id = 'resources'
  and public.has_role(auth.uid(), 'admin')
  and storage.objects.name !~ '(^|/)\.\.(/|$)'
);

create policy "admin delete resources bucket"
on storage.objects
for delete
to authenticated
using (bucket_id = 'resources' and public.has_role(auth.uid(), 'admin'));

drop policy if exists "authenticated upload assignments bucket" on storage.objects;
drop policy if exists "authenticated update assignments bucket" on storage.objects;

create policy "secure upload assignments bucket"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'assignments'
  and storage.objects.name !~ '(^|/)\.\.(/|$)'
  and (
    (public.has_role(auth.uid(), 'admin') and storage.objects.name like 'tasks/%')
    or storage.objects.name like ('submissions/' || auth.uid()::text || '/%')
  )
);

create policy "secure update assignments bucket"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'assignments'
  and (
    public.has_role(auth.uid(), 'admin')
    or storage.objects.name like ('submissions/' || auth.uid()::text || '/%')
  )
)
with check (
  bucket_id = 'assignments'
  and storage.objects.name !~ '(^|/)\.\.(/|$)'
  and (
    public.has_role(auth.uid(), 'admin')
    or storage.objects.name like ('submissions/' || auth.uid()::text || '/%')
  )
);

notify pgrst, 'reload schema';
