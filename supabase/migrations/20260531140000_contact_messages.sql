create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text not null,
  subject text not null,
  message text not null,
  status text not null default 'unread' check (status in ('unread', 'read')),
  created_at timestamptz not null default now()
);

grant insert on public.contact_messages to anon, authenticated;
grant select, update, delete on public.contact_messages to authenticated;
grant all on public.contact_messages to service_role;

alter table public.contact_messages enable row level security;

create policy "anyone can submit contact messages"
on public.contact_messages
for insert
to anon, authenticated
with check (true);

create policy "admins read contact messages"
on public.contact_messages
for select
to authenticated
using (public.has_role(auth.uid(), 'admin'));

create policy "admins update contact messages"
on public.contact_messages
for update
to authenticated
using (public.has_role(auth.uid(), 'admin'))
with check (public.has_role(auth.uid(), 'admin'));

create policy "admins delete contact messages"
on public.contact_messages
for delete
to authenticated
using (public.has_role(auth.uid(), 'admin'));
