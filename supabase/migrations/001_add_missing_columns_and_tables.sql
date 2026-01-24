-- Migration: Add missing columns and tables for game data tracking
-- Date: 2026-01-25
-- Description: Adds missing columns to users, game_scores, user_inventory tables
--              and creates shop_items and duel_matches tables

-- ═══════════════════════════════════════════════════════════════════════════════
-- 1. ADD MISSING COLUMNS TO USERS TABLE
-- ═══════════════════════════════════════════════════════════════════════════════

ALTER TABLE public.users 
  ADD COLUMN IF NOT EXISTS best_score INTEGER DEFAULT 0 NOT NULL,
  ADD COLUMN IF NOT EXISTS best_wpm INTEGER DEFAULT 0 NOT NULL;

-- Create indexes for new columns
CREATE INDEX IF NOT EXISTS idx_users_best_score ON public.users(best_score DESC);
CREATE INDEX IF NOT EXISTS idx_users_best_wpm ON public.users(best_wpm DESC);
CREATE INDEX IF NOT EXISTS idx_users_wallet ON public.users(wallet_address);

-- ═══════════════════════════════════════════════════════════════════════════════
-- 2. ADD MISSING COLUMNS TO GAME_SCORES TABLE
-- ═══════════════════════════════════════════════════════════════════════════════

ALTER TABLE public.game_scores
  ADD COLUMN IF NOT EXISTS misses INTEGER DEFAULT 0 NOT NULL,
  ADD COLUMN IF NOT EXISTS typos INTEGER DEFAULT 0 NOT NULL,
  ADD COLUMN IF NOT EXISTS gold_earned INTEGER DEFAULT 0 NOT NULL,
  ADD COLUMN IF NOT EXISTS duration_seconds INTEGER DEFAULT 0 NOT NULL,
  ADD COLUMN IF NOT EXISTS words_typed INTEGER DEFAULT 0 NOT NULL,
  ADD COLUMN IF NOT EXISTS is_staked BOOLEAN DEFAULT FALSE NOT NULL,
  ADD COLUMN IF NOT EXISTS stake_amount BIGINT,
  ADD COLUMN IF NOT EXISTS payout_amount BIGINT;

-- Create indexes for game_scores
CREATE INDEX IF NOT EXISTS idx_game_scores_user ON public.game_scores(user_id);
CREATE INDEX IF NOT EXISTS idx_game_scores_mode ON public.game_scores(game_mode);
CREATE INDEX IF NOT EXISTS idx_game_scores_score ON public.game_scores(score DESC);
CREATE INDEX IF NOT EXISTS idx_game_scores_created ON public.game_scores(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_game_scores_is_staked ON public.game_scores(is_staked);

-- ═══════════════════════════════════════════════════════════════════════════════
-- 3. ADD MISSING COLUMNS TO USER_INVENTORY TABLE
-- ═══════════════════════════════════════════════════════════════════════════════

ALTER TABLE public.user_inventory
  ADD COLUMN IF NOT EXISTS item_type TEXT,
  ADD COLUMN IF NOT EXISTS equipped BOOLEAN DEFAULT FALSE NOT NULL;

-- Create indexes for user_inventory
CREATE INDEX IF NOT EXISTS idx_user_inventory_user ON public.user_inventory(user_id);
CREATE INDEX IF NOT EXISTS idx_user_inventory_equipped ON public.user_inventory(user_id, equipped) WHERE equipped = TRUE;

-- ═══════════════════════════════════════════════════════════════════════════════
-- 4. CREATE SHOP_ITEMS TABLE
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.shop_items (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  gold_price INTEGER NOT NULL,
  category TEXT NOT NULL, -- 'powerup', 'hero', 'cosmetic'
  available BOOLEAN DEFAULT TRUE NOT NULL,
  image_url TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create indexes for shop_items
CREATE INDEX IF NOT EXISTS idx_shop_items_category ON public.shop_items(category);
CREATE INDEX IF NOT EXISTS idx_shop_items_available ON public.shop_items(available) WHERE available = TRUE;

-- Enable RLS for shop_items
ALTER TABLE public.shop_items ENABLE ROW LEVEL SECURITY;

-- Create policy for shop_items (open access for hackathon)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'shop_items' 
    AND policyname = 'Allow public read/write shop_items'
  ) THEN
    CREATE POLICY "Allow public read/write shop_items"
    ON public.shop_items FOR ALL
    USING (true)
    WITH CHECK (true);
  END IF;
END $$;

-- ═══════════════════════════════════════════════════════════════════════════════
-- 5. CREATE DUEL_MATCHES TABLE
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.duel_matches (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  duel_id TEXT UNIQUE NOT NULL,
  player1_address TEXT NOT NULL,
  player2_address TEXT NOT NULL,
  winner_address TEXT NOT NULL,
  stake_amount BIGINT NOT NULL,
  payout_amount BIGINT NOT NULL,
  player1_score INTEGER NOT NULL,
  player2_score INTEGER NOT NULL,
  player1_wpm INTEGER NOT NULL,
  player2_wpm INTEGER NOT NULL,
  settled_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  tx_hash TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create indexes for duel_matches
CREATE INDEX IF NOT EXISTS idx_duel_matches_duel_id ON public.duel_matches(duel_id);
CREATE INDEX IF NOT EXISTS idx_duel_matches_player1 ON public.duel_matches(player1_address);
CREATE INDEX IF NOT EXISTS idx_duel_matches_player2 ON public.duel_matches(player2_address);
CREATE INDEX IF NOT EXISTS idx_duel_matches_winner ON public.duel_matches(winner_address);
CREATE INDEX IF NOT EXISTS idx_duel_matches_settled ON public.duel_matches(settled_at DESC);

-- Enable RLS for duel_matches
ALTER TABLE public.duel_matches ENABLE ROW LEVEL SECURITY;

-- Create policy for duel_matches (open access for hackathon)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'duel_matches' 
    AND policyname = 'Allow public read/write duel_matches'
  ) THEN
    CREATE POLICY "Allow public read/write duel_matches"
    ON public.duel_matches FOR ALL
    USING (true)
    WITH CHECK (true);
  END IF;
END $$;

-- ═══════════════════════════════════════════════════════════════════════════════
-- 6. VERIFICATION QUERIES
-- ═══════════════════════════════════════════════════════════════════════════════

-- Verify users table columns
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'best_score'
  ) THEN
    RAISE EXCEPTION 'Migration failed: best_score column not added to users table';
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'best_wpm'
  ) THEN
    RAISE EXCEPTION 'Migration failed: best_wpm column not added to users table';
  END IF;
  
  RAISE NOTICE 'Users table migration successful';
END $$;

-- Verify game_scores table columns
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'game_scores' AND column_name = 'misses'
  ) THEN
    RAISE EXCEPTION 'Migration failed: misses column not added to game_scores table';
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'game_scores' AND column_name = 'duration_seconds'
  ) THEN
    RAISE EXCEPTION 'Migration failed: duration_seconds column not added to game_scores table';
  END IF;
  
  RAISE NOTICE 'Game_scores table migration successful';
END $$;

-- Verify user_inventory table columns
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_inventory' AND column_name = 'item_type'
  ) THEN
    RAISE EXCEPTION 'Migration failed: item_type column not added to user_inventory table';
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_inventory' AND column_name = 'equipped'
  ) THEN
    RAISE EXCEPTION 'Migration failed: equipped column not added to user_inventory table';
  END IF;
  
  RAISE NOTICE 'User_inventory table migration successful';
END $$;

-- Verify shop_items table exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_name = 'shop_items'
  ) THEN
    RAISE EXCEPTION 'Migration failed: shop_items table not created';
  END IF;
  
  RAISE NOTICE 'Shop_items table created successfully';
END $$;

-- Verify duel_matches table exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_name = 'duel_matches'
  ) THEN
    RAISE EXCEPTION 'Migration failed: duel_matches table not created';
  END IF;
  
  RAISE NOTICE 'Duel_matches table created successfully';
END $$;

-- ═══════════════════════════════════════════════════════════════════════════════
-- MIGRATION COMPLETE
-- ═══════════════════════════════════════════════════════════════════════════════

-- Log completion
DO $$
BEGIN
  RAISE NOTICE '✅ Migration 001 completed successfully';
  RAISE NOTICE 'Added columns: users (best_score, best_wpm)';
  RAISE NOTICE 'Added columns: game_scores (misses, typos, gold_earned, duration_seconds, words_typed, is_staked, stake_amount, payout_amount)';
  RAISE NOTICE 'Added columns: user_inventory (item_type, equipped)';
  RAISE NOTICE 'Created tables: shop_items, duel_matches';
  RAISE NOTICE 'Created indexes for performance optimization';
END $$;
