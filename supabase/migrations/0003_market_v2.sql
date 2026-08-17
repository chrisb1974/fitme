-- FitMe Market v2 — threaded chat + offers (price & swap) + realtime

-- ---------------------------------------------------------------------------
-- 1) message type (merged timeline: plain text vs system notices)
-- ---------------------------------------------------------------------------
alter table public.market_message
  add column if not exists type text default 'text';   -- 'text' | 'system'

-- ---------------------------------------------------------------------------
-- 2) Offers — price or swap, tied to a listing + buyer/seller pair
-- ---------------------------------------------------------------------------
create table if not exists public.market_offer (
  id                  uuid primary key default gen_random_uuid(),
  listing_id          uuid references public.market_listing (id) on delete cascade,
  from_user           uuid not null default auth.uid() references auth.users (id) on delete cascade, -- buyer
  to_user             uuid not null references auth.users (id) on delete cascade,                     -- seller
  type                text not null default 'price',   -- 'price' | 'swap'
  offered_price       numeric,
  offered_item_id     text,
  offered_item_title  text,
  offered_item_emoji  text,
  message             text,
  from_name           text,
  listing_title       text,
  status              text not null default 'pending', -- 'pending' | 'accepted' | 'declined' | 'cancelled'
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);
alter table public.market_offer enable row level security;

-- Both parties can read; buyer creates; either party can update status
-- (seller accepts/declines, buyer cancels).
create policy "offer_select_party" on public.market_offer
  for select using (auth.uid() = from_user or auth.uid() = to_user);
create policy "offer_insert_sender" on public.market_offer
  for insert with check (auth.uid() = from_user);
create policy "offer_update_party" on public.market_offer
  for update using (auth.uid() = from_user or auth.uid() = to_user)
  with check (auth.uid() = from_user or auth.uid() = to_user);

create trigger market_offer_set_updated_at
  before update on public.market_offer
  for each row execute function public.set_updated_at();

create index if not exists market_offer_parties_idx
  on public.market_offer (listing_id, from_user, to_user);

-- ---------------------------------------------------------------------------
-- 3) Realtime — stream message + offer changes (RLS still applies per user)
-- ---------------------------------------------------------------------------
do $$
begin
  if not exists (select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'market_message') then
    alter publication supabase_realtime add table public.market_message;
  end if;
  if not exists (select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'market_offer') then
    alter publication supabase_realtime add table public.market_offer;
  end if;
end $$;
