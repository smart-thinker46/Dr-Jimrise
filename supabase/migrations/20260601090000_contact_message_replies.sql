alter table public.contact_messages
add column if not exists sender_user_id uuid references auth.users(id) on delete set null,
add column if not exists admin_reply text,
add column if not exists replied_at timestamptz,
add column if not exists replied_by uuid references auth.users(id) on delete set null;

alter table public.contact_messages
alter column sender_user_id set default auth.uid();

drop policy if exists "students read own contact messages" on public.contact_messages;

create policy "students read own contact messages"
on public.contact_messages
for select
to authenticated
using (sender_user_id = auth.uid());

notify pgrst, 'reload schema';
