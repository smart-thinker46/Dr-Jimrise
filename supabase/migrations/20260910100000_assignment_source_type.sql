alter table public.assignment_tasks
add column if not exists source_type text not null default 'file'
check (source_type in ('file', 'link'));

update public.assignment_tasks
set source_type = case
  when (file_url ilike 'http://%' or file_url ilike 'https://%') and coalesce(file_name, '') = '' then 'link'
  else 'file'
end
where source_type = 'file';

notify pgrst, 'reload schema';
