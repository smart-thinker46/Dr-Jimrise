alter table public.publications
add column if not exists article_url text,
add column if not exists pdf_url text,
add column if not exists pdf_download_allowed boolean not null default true;

update public.publications
set article_url = doi
where article_url is null
  and doi is not null
  and btrim(doi) <> '';
