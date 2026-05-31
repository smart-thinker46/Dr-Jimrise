insert into public.site_content (key, value)
values (
  'home_stats',
  '{
    "journal_articles": 21,
    "phd_supervision": 1,
    "msc_completed": 2,
    "msc_ongoing": 5
  }'::jsonb
)
on conflict (key) do nothing;
