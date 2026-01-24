-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. USERS TABLE
create table public.users (
  id uuid default uuid_generate_v4() primary key,
  wallet_address text unique not null,
  username text,
  email text,
  google_id text,
  profile_picture text,
  gold integer default 0,
  total_games integer default 0,
  total_kills integer default 0,
  total_words_typed integer default 0,
  best_streak integer default 0,
  best_score integer default 0 not null,
  best_wpm integer default 0 not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  last_seen_at timestamp with time zone default timezone('utc'::text, now())
);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_google_id ON public.users(google_id);
CREATE INDEX IF NOT EXISTS idx_users_last_seen ON public.users(last_seen_at);
CREATE INDEX IF NOT EXISTS idx_users_total_games ON public.users(total_games);
CREATE INDEX IF NOT EXISTS idx_users_total_kills ON public.users(total_kills);
CREATE INDEX IF NOT EXISTS idx_users_best_score ON public.users(best_score DESC);
CREATE INDEX IF NOT EXISTS idx_users_best_wpm ON public.users(best_wpm DESC);
CREATE INDEX IF NOT EXISTS idx_users_wallet ON public.users(wallet_address);

-- 2. GAME SCORES TABLE
create table public.game_scores (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) not null,
  score integer default 0,
  wave_reached integer default 1,
  wpm integer default 0,
  game_mode text default 'story',
  kills integer default 0,
  misses integer default 0 not null,
  typos integer default 0 not null,
  gold_earned integer default 0 not null,
  duration_seconds integer default 0 not null,
  words_typed integer default 0 not null,
  is_staked boolean default false not null,
  stake_amount bigint,
  payout_amount bigint,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create indexes for game_scores
CREATE INDEX IF NOT EXISTS idx_game_scores_user ON public.game_scores(user_id);
CREATE INDEX IF NOT EXISTS idx_game_scores_mode ON public.game_scores(game_mode);
CREATE INDEX IF NOT EXISTS idx_game_scores_score ON public.game_scores(score DESC);
CREATE INDEX IF NOT EXISTS idx_game_scores_created ON public.game_scores(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_game_scores_is_staked ON public.game_scores(is_staked);

-- 3. USER INVENTORY TABLE
create table public.user_inventory (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) not null,
  item_id text not null,
  item_type text,
  quantity integer default 0,
  equipped boolean default false not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, item_id)
);

-- Create indexes for user_inventory
CREATE INDEX IF NOT EXISTS idx_user_inventory_user ON public.user_inventory(user_id);
CREATE INDEX IF NOT EXISTS idx_user_inventory_equipped ON public.user_inventory(user_id, equipped) WHERE equipped = true;

-- 4. USER ACHIEVEMENTS TABLE
create table public.user_achievements (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) not null,
  achievement_id text not null,
  unlocked_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, achievement_id)
);

-- 5. SHOP ITEMS TABLE
create table public.shop_items (
  id text primary key,
  name text not null,
  description text not null,
  gold_price integer not null,
  category text not null,
  available boolean default true not null,
  image_url text,
  metadata jsonb default '{}'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create indexes for shop_items
CREATE INDEX IF NOT EXISTS idx_shop_items_category ON public.shop_items(category);
CREATE INDEX IF NOT EXISTS idx_shop_items_available ON public.shop_items(available) WHERE available = true;

-- 6. DUEL MATCHES TABLE
create table public.duel_matches (
  id uuid default uuid_generate_v4() primary key,
  duel_id text unique not null,
  player1_address text not null,
  player2_address text not null,
  winner_address text not null,
  stake_amount bigint not null,
  payout_amount bigint not null,
  player1_score integer not null,
  player2_score integer not null,
  player1_wpm integer not null,
  player2_wpm integer not null,
  settled_at timestamp with time zone default timezone('utc'::text, now()) not null,
  tx_hash text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create indexes for duel_matches
CREATE INDEX IF NOT EXISTS idx_duel_matches_duel_id ON public.duel_matches(duel_id);
CREATE INDEX IF NOT EXISTS idx_duel_matches_player1 ON public.duel_matches(player1_address);
CREATE INDEX IF NOT EXISTS idx_duel_matches_player2 ON public.duel_matches(player2_address);
CREATE INDEX IF NOT EXISTS idx_duel_matches_winner ON public.duel_matches(winner_address);
CREATE INDEX IF NOT EXISTS idx_duel_matches_settled ON public.duel_matches(settled_at DESC);

-- ENABLE ROW LEVEL SECURITY (RLS)
alter table public.users enable row level security;
alter table public.game_scores enable row level security;
alter table public.user_inventory enable row level security;
alter table public.user_achievements enable row level security;
alter table public.shop_items enable row level security;
alter table public.duel_matches enable row level security;

-- CREATE POLICIES (OPEN ACCESS for Hackathon/Dev)
-- Note: In production, you would restrict this to authenticated users based on wallet ownership.

-- Users
create policy "Allow public read/write users"
on public.users for all
using (true)
with check (true);

-- Game Scores
create policy "Allow public read/write scores"
on public.game_scores for all
using (true)
with check (true);

-- Inventory
create policy "Allow public read/write inventory"
on public.user_inventory for all
using (true)
with check (true);

-- Achievements
create policy "Allow public read/write achievements"
on public.user_achievements for all
using (true)
with check (true);

-- Shop Items
create policy "Allow public read/write shop_items"
on public.shop_items for all
using (true)
with check (true);

-- Duel Matches
create policy "Allow public read/write duel_matches"
on public.duel_matches for all
using (true)
with check (true);

-- ═══════════════════════════════════════════════════════════════════════════════
-- FUNCTIONS
-- ═══════════════════════════════════════════════════════════════════════════════

-- Function to increment user stats atomically
CREATE OR REPLACE FUNCTION increment_user_stats(
  p_wallet_address text,
  p_games integer DEFAULT 0,
  p_kills integer DEFAULT 0,
  p_gold integer DEFAULT 0,
  p_words integer DEFAULT 0
) RETURNS void AS $$
BEGIN
  UPDATE users 
  SET 
    total_games = COALESCE(total_games, 0) + p_games,
    total_kills = COALESCE(total_kills, 0) + p_kills,
    gold = COALESCE(gold, 0) + p_gold,
    total_words_typed = COALESCE(total_words_typed, 0) + p_words,
    last_seen_at = NOW()
  WHERE wallet_address = p_wallet_address;
END;
$$ LANGUAGE plpgsql;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION increment_user_stats TO anon, authenticated;