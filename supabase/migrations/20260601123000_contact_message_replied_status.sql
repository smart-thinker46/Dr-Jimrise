alter table public.contact_messages
drop constraint if exists contact_messages_status_check;

alter table public.contact_messages
add constraint contact_messages_status_check
check (status in ('unread', 'read', 'replied'));

update public.contact_messages
set status = 'replied'
where admin_reply is not null
  and length(trim(admin_reply)) > 0;

notify pgrst, 'reload schema';
