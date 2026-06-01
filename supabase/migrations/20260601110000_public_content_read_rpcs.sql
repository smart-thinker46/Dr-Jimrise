create or replace function public.get_site_content_value(content_key text)
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select sc.value
  from public.site_content sc
  where sc.key = content_key
  limit 1;
$$;

grant execute on function public.get_site_content_value(text) to anon, authenticated;

create or replace function public.list_public_publications()
returns table (
  id uuid,
  kind text,
  title text,
  authors text,
  venue text,
  year integer,
  doi text,
  article_url text,
  pdf_url text,
  pdf_download_allowed boolean,
  sort_order integer
)
language sql
stable
security definer
set search_path = public
as $$
  select
    p.id,
    p.kind::text,
    p.title::text,
    p.authors::text,
    p.venue::text,
    p.year,
    p.doi::text,
    p.article_url::text,
    p.pdf_url::text,
    coalesce(p.pdf_download_allowed, true) as pdf_download_allowed,
    p.sort_order
  from public.publications p
  order by p.sort_order asc nulls last, p.year desc nulls last, p.created_at desc;
$$;

grant execute on function public.list_public_publications() to anon, authenticated;

insert into public.site_content (key, value)
values (
  'contact',
  jsonb_build_object(
    'email', 'jochwach@example.ac.ke',
    'institution_line1', 'Mama Ngina University College',
    'institution_line2', 'Dept. of Computing and Information Technology',
    'linkedin', '#',
    'scholar', '#',
    'researchgate', '#',
    'x_url', '#',
    'instagram', '#',
    'facebook', '#',
    'whatsapp', '#'
  )
)
on conflict (key) do nothing;

notify pgrst, 'reload schema';
