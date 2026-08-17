-- FitMe Market v1 — real peer-to-peer marketplace
-- Enriches market_listing, opens public read of active listings,
-- adds favorites + a simple contact-message table.

-- ---------------------------------------------------------------------------
-- 1) Enrich market_listing with seller (denormalized) + market metadata
--    Denormalized seller fields let buyers browse without reading the
--    seller's private profile row (profiles stays owner-only).
-- ---------------------------------------------------------------------------
alter table public.market_listing
  add column if not exists listing_type    text default 'sale',   -- 'sale' | 'swap' | 'both'
  add column if not exists emoji           text,
  add column if not exists likes_count     integer default 0,
  add column if not exists views_count     integer default 0,
  add column if not exists seller_name     text,
  add column if not exists seller_handle   text,
  add column if not exists seller_location text,
  add column if not exists seller_style_dna text;

-- ---------------------------------------------------------------------------
-- 2) Public read of ACTIVE listings — any signed-in member can browse.
--    (The owner-only policies from 0001 remain, so sellers still see their
--     own listings in any status. RLS combines permissive policies with OR.)
-- ---------------------------------------------------------------------------
drop policy if exists "market_listing_public_read" on public.market_listing;
create policy "market_listing_public_read" on public.market_listing
  for select to authenticated using (status = 'active');

create index if not exists market_listing_status_idx on public.market_listing (status);
create index if not exists market_listing_seller_handle_idx on public.market_listing (seller_handle);

-- ---------------------------------------------------------------------------
-- 3) Favorites (heart) — per-user, one row per (user, listing)
-- ---------------------------------------------------------------------------
create table if not exists public.market_favorite (
  id         uuid primary key default gen_random_uuid(),
  created_by uuid not null default auth.uid() references auth.users (id) on delete cascade,
  listing_id uuid not null references public.market_listing (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (created_by, listing_id)
);
alter table public.market_favorite enable row level security;
create policy "fav_select_own" on public.market_favorite
  for select using (auth.uid() = created_by);
create policy "fav_insert_own" on public.market_favorite
  for insert with check (auth.uid() = created_by);
create policy "fav_delete_own" on public.market_favorite
  for delete using (auth.uid() = created_by);

-- ---------------------------------------------------------------------------
-- 4) Contact messages (v1: buyer -> seller inquiry; no threaded chat yet)
-- ---------------------------------------------------------------------------
create table if not exists public.market_message (
  id            uuid primary key default gen_random_uuid(),
  listing_id    uuid references public.market_listing (id) on delete set null,
  from_user     uuid not null default auth.uid() references auth.users (id) on delete cascade,
  to_user       uuid not null references auth.users (id) on delete cascade,
  body          text not null,
  listing_title text,
  from_name     text,
  is_read       boolean default false,
  created_at    timestamptz not null default now()
);
alter table public.market_message enable row level security;
-- Sender may insert; both parties may read; recipient may mark read.
create policy "msg_insert_sender" on public.market_message
  for insert with check (auth.uid() = from_user);
create policy "msg_select_party" on public.market_message
  for select using (auth.uid() = from_user or auth.uid() = to_user);
create policy "msg_update_recipient" on public.market_message
  for update using (auth.uid() = to_user) with check (auth.uid() = to_user);

create index if not exists market_message_to_user_idx on public.market_message (to_user, created_at desc);
