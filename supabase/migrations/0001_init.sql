-- FitMe — initial schema (migrated from Base44 entities)
-- Conventions:
--   id          uuid primary key
--   created_by  uuid -> auth.users (owner, drives RLS)
--   created_at / updated_at  timestamptz
-- All tables are owner-scoped via RLS: a user only sees their own rows.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Shared helpers
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- profiles  (mirrors the Base44 built-in User entity)
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  email       text,
  full_name   text,
  avatar_url  text,
  location    text,
  role        text not null default 'user',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);
create policy "profiles_insert_own" on public.profiles
  for insert with check (auth.uid() = id);

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- Auto-create a profile row when a new auth user signs up.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'),
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- wardrobe_item
-- ---------------------------------------------------------------------------
create table if not exists public.wardrobe_item (
  id             uuid primary key default gen_random_uuid(),
  created_by     uuid not null default auth.uid() references auth.users (id) on delete cascade,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  name           text not null,
  category       text not null,
  color          text,
  brand          text,
  size           text,
  tags           text[] default '{}',
  style_tags     text[] default '{}',
  photo_url      text,
  extra_photos   text[] default '{}',
  emoji          text,
  times_worn     integer default 0,
  last_worn_date date,
  date_added     date,
  is_for_sale    boolean default false,
  season         text[] default '{}',
  notes          text
);

-- ---------------------------------------------------------------------------
-- saved_look
-- ---------------------------------------------------------------------------
create table if not exists public.saved_look (
  id                uuid primary key default gen_random_uuid(),
  created_by        uuid not null default auth.uid() references auth.users (id) on delete cascade,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  outfit_name       text not null,
  style_description text,
  styling_tip       text,
  item_ids          text[] default '{}',
  item_snapshots    jsonb default '[]',
  match_score       numeric,
  occasion_prompt   text,
  date_saved        date,
  season            text,
  is_favourite      boolean default false,
  is_manual         boolean default false,
  tags              text[] default '{}',
  times_worn        integer default 0,
  last_worn_date    date
);

-- ---------------------------------------------------------------------------
-- market_listing
-- ---------------------------------------------------------------------------
create table if not exists public.market_listing (
  id               uuid primary key default gen_random_uuid(),
  created_by       uuid not null default auth.uid() references auth.users (id) on delete cascade,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  wardrobe_item_id text not null,
  title            text not null,
  description      text,
  price            numeric,
  condition        text,
  size             text,
  category         text,
  brand            text,
  color            text,
  season           text[] default '{}',
  cover_photo      text,
  photos           text[] default '{}',
  status           text default 'active'
);

-- ---------------------------------------------------------------------------
-- outfit_log
-- ---------------------------------------------------------------------------
create table if not exists public.outfit_log (
  id             uuid primary key default gen_random_uuid(),
  created_by     uuid not null default auth.uid() references auth.users (id) on delete cascade,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  date           date not null,
  occasion       text,
  item_ids       text[] default '{}',
  item_snapshots jsonb default '[]',
  outfit_name    text,
  saved_look_id  text,
  notes          text
);

-- ---------------------------------------------------------------------------
-- trip
-- ---------------------------------------------------------------------------
create table if not exists public.trip (
  id            uuid primary key default gen_random_uuid(),
  created_by    uuid not null default auth.uid() references auth.users (id) on delete cascade,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  destination   text not null,
  date_from     date not null,
  date_to       date not null,
  trip_types    text[] default '{}',
  special_event text,
  trip_name     text,
  packing_list  jsonb default '[]',
  missing_items jsonb default '[]',
  packing_tips  text[] default '{}'
);

-- ---------------------------------------------------------------------------
-- user_settings
-- ---------------------------------------------------------------------------
create table if not exists public.user_settings (
  id                  uuid primary key default gen_random_uuid(),
  created_by          uuid not null default auth.uid() references auth.users (id) on delete cascade,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  language            text default 'en',
  "weatherSuggestions" boolean default true,
  "dailyReminder"     boolean default false,
  "reminderTime"      text default '08:00',
  "rotationReminders" boolean default true,
  "shareStyleData"    boolean default false
);

-- ---------------------------------------------------------------------------
-- RLS + updated_at triggers for all owner-scoped tables
-- ---------------------------------------------------------------------------
do $$
declare
  t text;
begin
  foreach t in array array[
    'wardrobe_item','saved_look','market_listing','outfit_log','trip','user_settings'
  ]
  loop
    execute format('alter table public.%I enable row level security;', t);

    execute format($p$create policy "%1$s_select_own" on public.%1$I
      for select using (auth.uid() = created_by);$p$, t);
    execute format($p$create policy "%1$s_insert_own" on public.%1$I
      for insert with check (auth.uid() = created_by);$p$, t);
    execute format($p$create policy "%1$s_update_own" on public.%1$I
      for update using (auth.uid() = created_by) with check (auth.uid() = created_by);$p$, t);
    execute format($p$create policy "%1$s_delete_own" on public.%1$I
      for delete using (auth.uid() = created_by);$p$, t);

    execute format('create trigger %1$s_set_updated_at before update on public.%1$I
      for each row execute function public.set_updated_at();', t);

    execute format('create index %1$s_created_by_idx on public.%1$I (created_by);', t);
  end loop;
end;
$$;

-- ---------------------------------------------------------------------------
-- Storage: public bucket for wardrobe / listing photos & avatars
-- (public read so <img> tags and the Vision/Claude edge functions can fetch)
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('uploads', 'uploads', true)
on conflict (id) do nothing;

create policy "uploads_public_read" on storage.objects
  for select using (bucket_id = 'uploads');
create policy "uploads_auth_insert" on storage.objects
  for insert to authenticated with check (bucket_id = 'uploads');
create policy "uploads_auth_update" on storage.objects
  for update to authenticated using (bucket_id = 'uploads');
create policy "uploads_owner_delete" on storage.objects
  for delete to authenticated using (bucket_id = 'uploads' and owner = auth.uid());
