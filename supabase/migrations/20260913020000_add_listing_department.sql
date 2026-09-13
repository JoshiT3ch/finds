-- Older listings remain unassigned; do not guess a department for them.
alter table public.listings
  add column if not exists department text
  check (department in ('Men', 'Women', 'Kids'));

notify pgrst, 'reload schema';
