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
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  last_seen_at timestamp with time zone default timezone('utc'::text, now())
);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_google_id ON public.users(google_id);
CREATE INDEX IF NOT EXISTS idx_users_last_seen ON public.users(last_seen_at);
CREATE INDEX IF NOT EXISTS idx_users_total_games ON public.users(total_games);
CREATE INDEX IF NOT EXISTS idx_users_total_kills ON public.users(total_kills);

-- 2. GAME SCORES TABLE
create table public.game_scores (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) not null,
  score integer default 0,
  wave_reached integer default 1,
  wpm integer default 0,
  game_mode text default 'story',
  kills integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. USER INVENTORY TABLE
create table public.user_inventory (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) not null,
  item_id text not null,
  quantity integer default 0,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, item_id)
);

-- 4. USER ACHIEVEMENTS TABLE
create table public.user_achievements (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) not null,
  achievement_id text not null,
  unlocked_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, achievement_id)
);

-- ENABLE ROW LEVEL SECURITY (RLS)
alter table public.users enable row level security;
alter table public.game_scores enable row level security;
alter table public.user_inventory enable row level security;
alter table public.user_achievements enable row level security;

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