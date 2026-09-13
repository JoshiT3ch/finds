alter table public.listings
  add column image_urls text[] not null default '{}'::text[];

update public.listings
set image_urls = array[image_url]
where cardinality(image_urls) = 0
  and nullif(btrim(image_url), '') is not null;

alter table public.listings
  add constraint listings_image_urls_max_five
  check (cardinality(image_urls) <= 5);
