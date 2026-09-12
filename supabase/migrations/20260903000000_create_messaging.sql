create table public.conversations (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid references public.listings(id) on delete set null,
  listing_title text not null,
  seller_id uuid not null references auth.users(id) on delete cascade,
  buyer_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint conversations_distinct_participants check (seller_id <> buyer_id),
  constraint conversations_listing_participants_unique unique (
    listing_id,
    buyer_id,
    seller_id
  )
);

create table public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  sender_id uuid not null references auth.users(id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now(),
  constraint messages_body_length check (
    char_length(btrim(body)) between 1 and 1000
  )
);

create index conversations_seller_updated_idx
  on public.conversations (seller_id, updated_at desc);

create index conversations_buyer_updated_idx
  on public.conversations (buyer_id, updated_at desc);

create index messages_conversation_created_idx
  on public.messages (conversation_id, created_at asc);

alter table public.conversations enable row level security;
alter table public.messages enable row level security;

revoke all on table public.conversations from anon, authenticated;
revoke all on table public.messages from anon, authenticated;

grant select on table public.conversations to authenticated;
grant select on table public.messages to authenticated;
grant insert (conversation_id, sender_id, body)
  on table public.messages to authenticated;

create policy "Conversation participants can read conversations"
on public.conversations
for select
to authenticated
using (
  (select auth.uid()) = seller_id
  or (select auth.uid()) = buyer_id
);

create policy "Conversation participants can read messages"
on public.messages
for select
to authenticated
using (
  exists (
    select 1
    from public.conversations
    where conversations.id = messages.conversation_id
      and (
        conversations.seller_id = (select auth.uid())
        or conversations.buyer_id = (select auth.uid())
      )
  )
);

create policy "Conversation participants can send messages"
on public.messages
for insert
to authenticated
with check (
  sender_id = (select auth.uid())
  and exists (
    select 1
    from public.conversations
    where conversations.id = messages.conversation_id
      and (
        conversations.seller_id = (select auth.uid())
        or conversations.buyer_id = (select auth.uid())
      )
  )
);

create function public.start_listing_conversation(p_listing_id uuid)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_buyer_id uuid := auth.uid();
  v_seller_id uuid;
  v_listing_title text;
  v_conversation_id uuid;
begin
  if v_buyer_id is null then
    raise exception 'Authentication required';
  end if;

  select listings.seller_id, listings.title
    into v_seller_id, v_listing_title
  from public.listings
  where listings.id = p_listing_id
    and listings.status = 'available';

  if not found or v_seller_id is null then
    raise exception 'Listing is unavailable';
  end if;

  if v_seller_id = v_buyer_id then
    raise exception 'Sellers cannot message themselves';
  end if;

  insert into public.conversations (
    listing_id,
    listing_title,
    seller_id,
    buyer_id
  )
  values (
    p_listing_id,
    coalesce(nullif(btrim(v_listing_title), ''), 'Untitled listing'),
    v_seller_id,
    v_buyer_id
  )
  on conflict (listing_id, buyer_id, seller_id)
  do update set listing_title = excluded.listing_title
  returning id into v_conversation_id;

  return v_conversation_id;
end;
$$;

revoke all on function public.start_listing_conversation(uuid)
  from public, anon;
grant execute on function public.start_listing_conversation(uuid)
  to authenticated;

create function public.touch_conversation_after_message()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.conversations
  set updated_at = new.created_at
  where id = new.conversation_id;

  return new;
end;
$$;

revoke all on function public.touch_conversation_after_message()
  from public, anon, authenticated;

create trigger messages_touch_conversation
after insert on public.messages
for each row
execute function public.touch_conversation_after_message();
