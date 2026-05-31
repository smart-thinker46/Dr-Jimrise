alter table public.resources
  add column if not exists access_level text not null default 'public'
  check (access_level in ('public', 'authenticated'));

update public.resources
set access_level = 'public'
where access_level is null;
