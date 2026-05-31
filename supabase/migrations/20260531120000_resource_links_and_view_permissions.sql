alter table public.resources
  add column if not exists source_type text not null default 'file' check (source_type in ('file', 'link')),
  add column if not exists link_url text,
  add column if not exists allow_download boolean not null default true;

update public.resources
set source_type = 'file',
    allow_download = true
where source_type is null;
