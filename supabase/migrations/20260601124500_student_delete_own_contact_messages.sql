drop policy if exists "students delete own contact messages" on public.contact_messages;

create policy "students delete own contact messages"
on public.contact_messages
for delete
to authenticated
using (
  sender_user_id = auth.uid()
  or lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
);

notify pgrst, 'reload schema';
