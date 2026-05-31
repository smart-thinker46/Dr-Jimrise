create or replace function public.list_resource_directory()
returns table (
  id uuid,
  title text,
  course text,
  type text,
  date text,
  description text,
  sort_order int,
  created_at timestamptz,
  source_type text,
  allow_download boolean,
  access_level text,
  file_url text,
  link_url text,
  can_access boolean,
  allowed_groups text[]
)
language sql
stable
security definer
set search_path = public
as $$
  select
    r.id,
    r.title,
    r.course,
    r.type,
    r.date,
    r.description,
    r.sort_order,
    r.created_at,
    r.source_type,
    r.allow_download,
    r.access_level,
    case
      when r.access_level = 'public'
        or public.has_role(auth.uid(), 'admin')
        or (
          auth.uid() is not null
          and coalesce((select s.status from public.app_user_status s where s.user_id = auth.uid()), 'active') = 'active'
          and public.user_has_resource_group_access(r.id, auth.uid())
        )
      then r.file_url
      else null
    end as file_url,
    case
      when r.access_level = 'public'
        or public.has_role(auth.uid(), 'admin')
        or (
          auth.uid() is not null
          and coalesce((select s.status from public.app_user_status s where s.user_id = auth.uid()), 'active') = 'active'
          and public.user_has_resource_group_access(r.id, auth.uid())
        )
      then r.link_url
      else null
    end as link_url,
    (
      r.access_level = 'public'
      or public.has_role(auth.uid(), 'admin')
      or (
        auth.uid() is not null
        and coalesce((select s.status from public.app_user_status s where s.user_id = auth.uid()), 'active') = 'active'
        and public.user_has_resource_group_access(r.id, auth.uid())
      )
    ) as can_access,
    coalesce(
      array_agg(g.group_name order by g.group_name) filter (where g.group_name is not null),
      array[]::text[]
    ) as allowed_groups
  from public.resources r
  left join public.resource_group_access rga on rga.resource_id = r.id
  left join public.student_groups g on g.id = rga.group_id
  group by r.id
  order by r.sort_order asc, r.created_at desc;
$$;

grant execute on function public.list_resource_directory() to anon, authenticated;
