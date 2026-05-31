create or replace function public.list_student_groups()
returns table (
  id uuid,
  group_name text,
  description text,
  created_at timestamptz
)
language sql
stable
security definer
set search_path = public
as $$
  select
    sg.id,
    sg.group_name::text,
    coalesce(sg.description, '')::text as description,
    sg.created_at
  from public.student_groups sg
  order by sg.group_name asc;
$$;

grant execute on function public.list_student_groups() to anon, authenticated;
