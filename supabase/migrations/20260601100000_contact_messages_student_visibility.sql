update public.contact_messages cm
set sender_user_id = u.id
from auth.users u
where cm.sender_user_id is null
  and lower(cm.email) = lower(u.email);

drop policy if exists "students read own contact messages" on public.contact_messages;

create policy "students read own contact messages"
on public.contact_messages
for select
to authenticated
using (
  sender_user_id = auth.uid()
  or lower(email) = lower(coalesce(auth.jwt()->>'email', ''))
);

notify pgrst, 'reload schema';
