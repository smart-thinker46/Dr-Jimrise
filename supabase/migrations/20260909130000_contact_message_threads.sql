-- Conversation replies for WhatsApp-style student/admin message threads.
create table if not exists public.contact_message_replies (
  id uuid primary key default gen_random_uuid(),
  contact_message_id uuid not null references public.contact_messages(id) on delete cascade,
  sender_user_id uuid references auth.users(id) on delete set null,
  sender_role text not null check (sender_role in ('student', 'admin')),
  body text not null check (char_length(trim(body)) between 1 and 2000),
  created_at timestamptz not null default now()
);

create index if not exists contact_message_replies_thread_idx
  on public.contact_message_replies(contact_message_id, created_at);

alter table public.contact_message_replies enable row level security;
alter table public.contact_message_replies force row level security;

grant select, insert on public.contact_message_replies to authenticated;
grant all on public.contact_message_replies to service_role;

drop policy if exists "admins manage message replies" on public.contact_message_replies;
create policy "admins manage message replies"
on public.contact_message_replies
for all to authenticated
using (public.has_role(auth.uid(), 'admin'))
with check (public.has_role(auth.uid(), 'admin') and sender_role = 'admin');

drop policy if exists "students read own message replies" on public.contact_message_replies;
create policy "students read own message replies"
on public.contact_message_replies
for select to authenticated
using (exists (
  select 1 from public.contact_messages cm
  where cm.id = contact_message_replies.contact_message_id
    and cm.sender_user_id = auth.uid()
));

drop policy if exists "students send message replies" on public.contact_message_replies;
create policy "students send message replies"
on public.contact_message_replies
for insert to authenticated
with check (
  sender_role = 'student'
  and sender_user_id = auth.uid()
  and exists (
    select 1 from public.contact_messages cm
    where cm.id = contact_message_replies.contact_message_id
      and cm.sender_user_id = auth.uid()
  )
);

-- Preserve replies already stored on contact_messages.
insert into public.contact_message_replies (contact_message_id, sender_user_id, sender_role, body, created_at)
select cm.id, cm.replied_by, 'admin', trim(cm.admin_reply), coalesce(cm.replied_at, cm.created_at)
from public.contact_messages cm
where nullif(trim(cm.admin_reply), '') is not null
  and not exists (
    select 1 from public.contact_message_replies r
    where r.contact_message_id = cm.id
      and r.sender_role = 'admin'
      and r.body = trim(cm.admin_reply)
  );

do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    begin
      alter publication supabase_realtime add table public.contact_message_replies;
    exception when duplicate_object then null;
    end;
  end if;
end $$;

notify pgrst, 'reload schema';
