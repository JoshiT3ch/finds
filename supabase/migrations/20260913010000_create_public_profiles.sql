create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null,
  created_at timestamptz not null default now(),
  constraint profiles_display_name_length
    check (char_length(btrim(display_name)) between 2 and 50)
);

alter table public.profiles enable row level security;

revoke all on table public.profiles from anon, authenticated;
grant select on table public.profiles to anon, authenticated;

create policy "Public profiles are readable"
on public.profiles
for select
to anon, authenticated
using (true);

create function public.handle_new_user_profile()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_display_name text := coalesce(
    nullif(btrim(new.raw_user_meta_data ->> 'display_name'), ''),
    nullif(btrim(new.raw_user_meta_data ->> 'full_name'), ''),
    nullif(btrim(new.raw_user_meta_data ->> 'name'), '')
  );
begin
  if v_display_name is not null and char_length(v_display_name) >= 2 then
    insert into public.profiles (id, display_name, created_at)
    values (new.id, left(v_display_name, 50), new.created_at)
    on conflict (id) do nothing;
  end if;

  return new;
end;
$$;

revoke all on function public.handle_new_user_profile()
  from public, anon, authenticated;

create trigger auth_user_create_profile
after insert on auth.users
for each row
execute function public.handle_new_user_profile();

insert into public.profiles (id, display_name, created_at)
select
  users.id,
  left(
    coalesce(
      nullif(btrim(users.raw_user_meta_data ->> 'display_name'), ''),
      nullif(btrim(users.raw_user_meta_data ->> 'full_name'), ''),
      nullif(btrim(users.raw_user_meta_data ->> 'name'), '')
    ),
    50
  ),
  users.created_at
from auth.users as users
where char_length(
  coalesce(
    nullif(btrim(users.raw_user_meta_data ->> 'display_name'), ''),
    nullif(btrim(users.raw_user_meta_data ->> 'full_name'), ''),
    nullif(btrim(users.raw_user_meta_data ->> 'name'), '')
  )
) >= 2
on conflict (id) do nothing;
