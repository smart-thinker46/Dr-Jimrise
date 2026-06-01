alter table public.blog_posts
  add column if not exists cover_image_url text,
  add column if not exists author_id uuid references auth.users(id) on delete set null,
  add column if not exists author_name text not null default 'Dr. Jimrise Ochwach, PhD';

update public.blog_posts
set author_name = 'Dr. Jimrise Ochwach, PhD'
where author_name is null or trim(author_name) = '';

notify pgrst, 'reload schema';
