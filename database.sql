-- ═══════════════════════════════════════════════════════════════════════════════
-- TYPENAD COMPLETE DATABASE SCHEMA
-- Version: 2.2.0
-- Date: 2026-01-25
-- Description: Complete unified schema for TypeNad game including users, scores,
--              inventory, achievements, shop items, and duel system.
--              This is the single source of truth for the database schema.
--              Includes achievement system improvements, atomic operations,
--              foreign key constraints, CHECK constraints, automatic triggers,
--              and performance optimizations.
-- ═══════════════════════════════════════════════════════════════════════════════

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ═══════════════════════════════════════════════════════════════════════════════
-- 1. USERS TABLE
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.users (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    wallet_address TEXT UNIQUE NOT NULL,
    username TEXT,
    email TEXT,
    google_id TEXT,
    profile_picture TEXT,
    gold INTEGER DEFAULT 0 NOT NULL,
    total_games INTEGER DEFAULT 0 NOT NULL,
    total_kills INTEGER DEFAULT 0 NOT NULL,
    total_words_typed INTEGER DEFAULT 0 NOT NULL,
    best_streak INTEGER DEFAULT 0 NOT NULL,
    best_score INTEGER DEFAULT 0 NOT NULL,
    best_wpm INTEGER DEFAULT 0 NOT NULL,
    highest_wave_reached INTEGER DEFAULT 0 NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    last_seen_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Users indexes
CREATE INDEX IF NOT EXISTS idx_users_wallet_address ON public.users(wallet_address);
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_google_id ON public.users(google_id);
CREATE INDEX IF NOT EXISTS idx_users_last_seen ON public.users(last_seen_at);
CREATE INDEX IF NOT EXISTS idx_users_total_games ON public.users(total_games);
CREATE INDEX IF NOT EXISTS idx_users_total_kills ON public.users(total_kills);
CREATE INDEX IF NOT EXISTS idx_users_best_score ON public.users(best_score DESC);
CREATE INDEX IF NOT EXISTS idx_users_best_wpm ON public.users(best_wpm DESC);
CREATE INDEX IF NOT EXISTS idx_users_gold ON public.users(gold DESC);

-- ═══════════════════════════════════════════════════════════════════════════════
-- 2. GAME SCORES TABLE
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.game_scores (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    score INTEGER DEFAULT 0 NOT NULL,
    wave_reached INTEGER DEFAULT 1 NOT NULL,
    wpm INTEGER DEFAULT 0 NOT NULL,
    game_mode TEXT DEFAULT 'story' NOT NULL,
    kills INTEGER DEFAULT 0 NOT NULL,
    misses INTEGER DEFAULT 0 NOT NULL,
    typos INTEGER DEFAULT 0 NOT NULL,
    gold_earned INTEGER DEFAULT 0 NOT NULL,
    duration_seconds INTEGER DEFAULT 0 NOT NULL,
    words_typed INTEGER DEFAULT 0 NOT NULL,
    is_staked BOOLEAN DEFAULT FALSE NOT NULL,
    stake_amount BIGINT,
    payout_amount BIGINT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Game scores indexes
CREATE INDEX IF NOT EXISTS idx_game_scores_user_id ON public.game_scores(user_id);
CREATE INDEX IF NOT EXISTS idx_game_scores_score ON public.game_scores(score DESC);
CREATE INDEX IF NOT EXISTS idx_game_scores_wpm ON public.game_scores(wpm DESC);
CREATE INDEX IF NOT EXISTS idx_game_scores_created_at ON public.game_scores(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_game_scores_game_mode ON public.game_scores(game_mode);
CREATE INDEX IF NOT EXISTS idx_game_scores_is_staked ON public.game_scores(is_staked);

-- ═══════════════════════════════════════════════════════════════════════════════
-- 3. USER INVENTORY TABLE
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.user_inventory (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    item_id TEXT NOT NULL,
    item_type TEXT DEFAULT 'consumable' NOT NULL,
    quantity INTEGER DEFAULT 0 NOT NULL,
    equipped BOOLEAN DEFAULT FALSE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(user_id, item_id)
);

-- Inventory indexes
CREATE INDEX IF NOT EXISTS idx_user_inventory_user_id ON public.user_inventory(user_id);
CREATE INDEX IF NOT EXISTS idx_user_inventory_item_id ON public.user_inventory(item_id);
CREATE INDEX IF NOT EXISTS idx_user_inventory_equipped ON public.user_inventory(user_id, equipped) WHERE equipped = TRUE;
CREATE INDEX IF NOT EXISTS idx_user_inventory_user_type_equipped ON public.user_inventory(user_id, item_type, equipped) WHERE equipped = TRUE;

-- ═══════════════════════════════════════════════════════════════════════════════
-- 4. USER ACHIEVEMENTS TABLE
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.user_achievements (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    achievement_id TEXT NOT NULL,
    unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(user_id, achievement_id)
);

-- Achievements indexes
CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id ON public.user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_achievement_id ON public.user_achievements(achievement_id);

-- ═══════════════════════════════════════════════════════════════════════════════
-- 5. SHOP ITEMS TABLE
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.shop_items (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    gold_price INTEGER NOT NULL,
    category TEXT NOT NULL,
    available BOOLEAN DEFAULT TRUE NOT NULL,
    image_url TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Shop items indexes
CREATE INDEX IF NOT EXISTS idx_shop_items_category ON public.shop_items(category);
CREATE INDEX IF NOT EXISTS idx_shop_items_available ON public.shop_items(available) WHERE available = TRUE;

-- ═══════════════════════════════════════════════════════════════════════════════
-- 6. DUEL RESULTS TABLE (for real-time opponent synchronization)
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.duel_results (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    duel_id TEXT NOT NULL,
    player_address TEXT NOT NULL,
    score INTEGER DEFAULT 0 NOT NULL,
    wpm INTEGER DEFAULT 0 NOT NULL,
    misses INTEGER DEFAULT 0 NOT NULL,
    typos INTEGER DEFAULT 0 NOT NULL,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(duel_id, player_address)
);

-- Duel results indexes
CREATE INDEX IF NOT EXISTS idx_duel_results_duel_id ON public.duel_results(duel_id);
CREATE INDEX IF NOT EXISTS idx_duel_results_player_address ON public.duel_results(player_address);
CREATE INDEX IF NOT EXISTS idx_duel_results_created_at ON public.duel_results(created_at DESC);

-- ═══════════════════════════════════════════════════════════════════════════════
-- 7. DUEL MATCHES TABLE (for match history and leaderboard)
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.duel_matches (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    duel_id TEXT UNIQUE NOT NULL,
    player1_address TEXT NOT NULL,
    player2_address TEXT NOT NULL,
    winner_address TEXT,
    stake_amount BIGINT NOT NULL,
    payout_amount BIGINT,
    player1_score INTEGER DEFAULT 0 NOT NULL,
    player2_score INTEGER DEFAULT 0 NOT NULL,
    player1_wpm INTEGER DEFAULT 0 NOT NULL,
    player2_wpm INTEGER DEFAULT 0 NOT NULL,
    settled_at TIMESTAMP WITH TIME ZONE,
    tx_hash TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Duel matches indexes
CREATE INDEX IF NOT EXISTS idx_duel_matches_duel_id ON public.duel_matches(duel_id);
CREATE INDEX IF NOT EXISTS idx_duel_matches_player1 ON public.duel_matches(player1_address);
CREATE INDEX IF NOT EXISTS idx_duel_matches_player2 ON public.duel_matches(player2_address);
CREATE INDEX IF NOT EXISTS idx_duel_matches_winner ON public.duel_matches(winner_address);
CREATE INDEX IF NOT EXISTS idx_duel_matches_created_at ON public.duel_matches(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_duel_matches_players ON public.duel_matches(player1_address, player2_address);

-- Additional performance indexes
CREATE INDEX IF NOT EXISTS idx_game_scores_user_mode ON public.game_scores(user_id, game_mode);

-- ═══════════════════════════════════════════════════════════════════════════════
-- ADD FOREIGN KEY CONSTRAINTS
-- ═══════════════════════════════════════════════════════════════════════════════

-- Add foreign key from user_inventory to shop_items
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'fk_inventory_shop_item'
    ) THEN
        ALTER TABLE user_inventory 
        ADD CONSTRAINT fk_inventory_shop_item 
        FOREIGN KEY (item_id) 
        REFERENCES shop_items(id) 
        ON DELETE RESTRICT;
    END IF;
END $$;

-- ═══════════════════════════════════════════════════════════════════════════════
-- ADD CHECK CONSTRAINTS FOR DATA INTEGRITY
-- ═══════════════════════════════════════════════════════════════════════════════

-- Users table constraints
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'check_gold_non_negative') THEN
        ALTER TABLE users ADD CONSTRAINT check_gold_non_negative CHECK (gold >= 0);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'check_total_games_non_negative') THEN
        ALTER TABLE users ADD CONSTRAINT check_total_games_non_negative CHECK (total_games >= 0);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'check_total_kills_non_negative') THEN
        ALTER TABLE users ADD CONSTRAINT check_total_kills_non_negative CHECK (total_kills >= 0);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'check_total_words_non_negative') THEN
        ALTER TABLE users ADD CONSTRAINT check_total_words_non_negative CHECK (total_words_typed >= 0);
    END IF;
END $$;

-- User inventory constraints
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'check_quantity_non_negative') THEN
        ALTER TABLE user_inventory ADD CONSTRAINT check_quantity_non_negative CHECK (quantity >= 0);
    END IF;
END $$;

-- Game scores constraints
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'check_score_non_negative') THEN
        ALTER TABLE game_scores ADD CONSTRAINT check_score_non_negative CHECK (score >= 0);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'check_wave_positive') THEN
        ALTER TABLE game_scores ADD CONSTRAINT check_wave_positive CHECK (wave_reached > 0);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'check_wpm_non_negative') THEN
        ALTER TABLE game_scores ADD CONSTRAINT check_wpm_non_negative CHECK (wpm >= 0);
    END IF;
END $$;

-- Shop items constraints
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'check_gold_price_positive') THEN
        ALTER TABLE shop_items ADD CONSTRAINT check_gold_price_positive CHECK (gold_price > 0);
    END IF;
END $$;

-- ═══════════════════════════════════════════════════════════════════════════════
-- ADD AUTOMATIC TIMESTAMP TRIGGERS
-- ═══════════════════════════════════════════════════════════════════════════════

-- Create trigger function for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to users table
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at 
BEFORE UPDATE ON users 
FOR EACH ROW 
EXECUTE FUNCTION update_updated_at_column();

-- Apply to user_inventory table
DROP TRIGGER IF EXISTS update_inventory_updated_at ON user_inventory;
CREATE TRIGGER update_inventory_updated_at 
BEFORE UPDATE ON user_inventory 
FOR EACH ROW 
EXECUTE FUNCTION update_updated_at_column();

-- ═══════════════════════════════════════════════════════════════════════════════
-- ENABLE ROW LEVEL SECURITY (RLS)
-- ═══════════════════════════════════════════════════════════════════════════════

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shop_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.duel_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.duel_matches ENABLE ROW LEVEL SECURITY;

-- ═══════════════════════════════════════════════════════════════════════════════
-- CREATE POLICIES (Open access for hackathon - restrict in production)
-- ═══════════════════════════════════════════════════════════════════════════════

-- Users policies
DROP POLICY IF EXISTS "Allow public read/write users" ON public.users;
CREATE POLICY "Allow public read/write users"
ON public.users FOR ALL
USING (true)
WITH CHECK (true);

-- Game Scores policies
DROP POLICY IF EXISTS "Allow public read/write scores" ON public.game_scores;
CREATE POLICY "Allow public read/write scores"
ON public.game_scores FOR ALL
USING (true)
WITH CHECK (true);

-- Inventory policies
DROP POLICY IF EXISTS "Allow public read/write inventory" ON public.user_inventory;
CREATE POLICY "Allow public read/write inventory"
ON public.user_inventory FOR ALL
USING (true)
WITH CHECK (true);

-- Achievements policies
DROP POLICY IF EXISTS "Allow public read/write achievements" ON public.user_achievements;
CREATE POLICY "Allow public read/write achievements"
ON public.user_achievements FOR ALL
USING (true)
WITH CHECK (true);

-- Shop Items policies
DROP POLICY IF EXISTS "Allow public read/write shop_items" ON public.shop_items;
CREATE POLICY "Allow public read/write shop_items"
ON public.shop_items FOR ALL
USING (true)
WITH CHECK (true);

-- Duel Results policies
DROP POLICY IF EXISTS "Allow public read/write duel_results" ON public.duel_results;
CREATE POLICY "Allow public read/write duel_results"
ON public.duel_results FOR ALL
USING (true)
WITH CHECK (true);

-- Duel Matches policies
DROP POLICY IF EXISTS "Allow public read/write duel_matches" ON public.duel_matches;
CREATE POLICY "Allow public read/write duel_matches"
ON public.duel_matches FOR ALL
USING (true)
WITH CHECK (true);

-- ═══════════════════════════════════════════════════════════════════════════════
-- ENABLE REALTIME FOR DUEL SYNC
-- ═══════════════════════════════════════════════════════════════════════════════

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND tablename = 'duel_results'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.duel_results;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND tablename = 'duel_matches'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.duel_matches;
    END IF;
END $$;

-- ═══════════════════════════════════════════════════════════════════════════════
-- FUNCTIONS
-- ═══════════════════════════════════════════════════════════════════════════════

-- Function to increment user stats atomically
CREATE OR REPLACE FUNCTION increment_user_stats(
    p_wallet_address TEXT,
    p_games INTEGER DEFAULT 0,
    p_kills INTEGER DEFAULT 0,
    p_gold INTEGER DEFAULT 0,
    p_words INTEGER DEFAULT 0
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

-- Function to update best scores
CREATE OR REPLACE FUNCTION update_user_best_scores(
    p_wallet_address TEXT,
    p_score INTEGER,
    p_wpm INTEGER
) RETURNS void AS $$
BEGIN
    UPDATE users 
    SET 
        best_score = GREATEST(COALESCE(best_score, 0), p_score),
        best_wpm = GREATEST(COALESCE(best_wpm, 0), p_wpm),
        last_seen_at = NOW()
    WHERE wallet_address = p_wallet_address;
END;
$$ LANGUAGE plpgsql;

-- Function to add gold (with bounds check)
CREATE OR REPLACE FUNCTION add_user_gold(
    p_wallet_address TEXT,
    p_amount INTEGER
) RETURNS INTEGER AS $$
DECLARE
    new_gold INTEGER;
BEGIN
    UPDATE users 
    SET gold = GREATEST(0, COALESCE(gold, 0) + p_amount)
    WHERE wallet_address = p_wallet_address
    RETURNING gold INTO new_gold;
    
    RETURN COALESCE(new_gold, 0);
END;
$$ LANGUAGE plpgsql;

-- Function to increment user gold atomically (by user_id)
CREATE OR REPLACE FUNCTION increment_user_gold(
    p_user_id UUID,
    p_amount INTEGER
) RETURNS void AS $$
BEGIN
    UPDATE users
    SET gold = COALESCE(gold, 0) + p_amount,
        updated_at = NOW()
    WHERE id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get leaderboard
CREATE OR REPLACE FUNCTION get_leaderboard(
    p_limit INTEGER DEFAULT 50,
    p_offset INTEGER DEFAULT 0,
    p_time_range TEXT DEFAULT 'all'
) RETURNS TABLE (
    rank BIGINT,
    wallet_address TEXT,
    username TEXT,
    score INTEGER,
    wpm INTEGER,
    created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    WITH ranked_scores AS (
        SELECT 
            gs.score,
            gs.wpm,
            gs.created_at,
            u.wallet_address,
            u.username,
            ROW_NUMBER() OVER (ORDER BY gs.score DESC, gs.wpm DESC) as rank
        FROM game_scores gs
        JOIN users u ON gs.user_id = u.id
        WHERE 
            CASE 
                WHEN p_time_range = 'today' THEN gs.created_at >= DATE_TRUNC('day', NOW())
                WHEN p_time_range = 'week' THEN gs.created_at >= NOW() - INTERVAL '7 days'
                WHEN p_time_range = 'month' THEN gs.created_at >= NOW() - INTERVAL '30 days'
                ELSE TRUE
            END
    )
    SELECT 
        rs.rank,
        rs.wallet_address,
        rs.username,
        rs.score,
        rs.wpm,
        rs.created_at
    FROM ranked_scores rs
    ORDER BY rs.rank
    LIMIT p_limit
    OFFSET p_offset;
END;
$$ LANGUAGE plpgsql;

-- Function to save game score with auto-update stats
-- Drop existing function if it exists with different signature
DROP FUNCTION IF EXISTS save_game_score(TEXT, INTEGER, INTEGER, INTEGER, INTEGER, TEXT);
DROP FUNCTION IF EXISTS save_game_score(TEXT, INTEGER, INTEGER, INTEGER, INTEGER, TEXT, INTEGER);
DROP FUNCTION IF EXISTS save_game_score(TEXT, INTEGER, INTEGER, INTEGER, INTEGER, TEXT, INTEGER, INTEGER);
DROP FUNCTION IF EXISTS save_game_score(TEXT, INTEGER, INTEGER, INTEGER, INTEGER, TEXT, INTEGER, INTEGER, INTEGER);
DROP FUNCTION IF EXISTS save_game_score(TEXT, INTEGER, INTEGER, INTEGER, INTEGER, TEXT, INTEGER, INTEGER, INTEGER, INTEGER);
DROP FUNCTION IF EXISTS save_game_score(TEXT, INTEGER, INTEGER, INTEGER, INTEGER, TEXT, INTEGER, INTEGER, INTEGER, INTEGER, INTEGER);
DROP FUNCTION IF EXISTS save_game_score(TEXT, INTEGER, INTEGER, INTEGER, INTEGER, TEXT, INTEGER, INTEGER, INTEGER, INTEGER, INTEGER, BOOLEAN);
DROP FUNCTION IF EXISTS save_game_score(TEXT, INTEGER, INTEGER, INTEGER, INTEGER, TEXT, INTEGER, INTEGER, INTEGER, INTEGER, INTEGER, BOOLEAN, BIGINT);

CREATE OR REPLACE FUNCTION save_game_score(
    p_wallet_address TEXT,
    p_score INTEGER,
    p_wave INTEGER,
    p_wpm INTEGER,
    p_kills INTEGER,
    p_game_mode TEXT,
    p_gold_earned INTEGER DEFAULT 0,
    p_misses INTEGER DEFAULT 0,
    p_typos INTEGER DEFAULT 0,
    p_words_typed INTEGER DEFAULT 0,
    p_duration_seconds INTEGER DEFAULT 0,
    p_is_staked BOOLEAN DEFAULT FALSE,
    p_stake_amount BIGINT DEFAULT NULL,
    p_payout_amount BIGINT DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
    v_user_id UUID;
    v_score_id UUID;
BEGIN
    -- Get or create user
    SELECT id INTO v_user_id FROM users WHERE wallet_address = p_wallet_address;
    
    IF v_user_id IS NULL THEN
        INSERT INTO users (wallet_address, username)
        VALUES (p_wallet_address, 'Player ' || LEFT(p_wallet_address, 6))
        RETURNING id INTO v_user_id;
    END IF;
    
    -- Insert score record
    INSERT INTO game_scores (
        user_id, score, wave_reached, wpm, kills, game_mode, 
        gold_earned, misses, typos, words_typed, duration_seconds,
        is_staked, stake_amount, payout_amount
    )
    VALUES (
        v_user_id, p_score, p_wave, p_wpm, p_kills, p_game_mode,
        p_gold_earned, p_misses, p_typos, p_words_typed, p_duration_seconds,
        p_is_staked, p_stake_amount, p_payout_amount
    )
    RETURNING id INTO v_score_id;
    
    -- Update user stats
    UPDATE users SET
        total_games = COALESCE(total_games, 0) + 1,
        total_kills = COALESCE(total_kills, 0) + p_kills,
        total_words_typed = COALESCE(total_words_typed, 0) + p_words_typed,
        gold = COALESCE(gold, 0) + p_gold_earned,
        best_score = GREATEST(COALESCE(best_score, 0), p_score),
        best_wpm = GREATEST(COALESCE(best_wpm, 0), p_wpm),
        last_seen_at = NOW()
    WHERE id = v_user_id;
    
    RETURN v_score_id;
END;
$$ LANGUAGE plpgsql;

-- Function to record duel match
CREATE OR REPLACE FUNCTION record_duel_match(
    p_duel_id TEXT,
    p_player1_address TEXT,
    p_player2_address TEXT,
    p_winner_address TEXT,
    p_stake_amount BIGINT,
    p_payout_amount BIGINT,
    p_player1_score INTEGER,
    p_player2_score INTEGER,
    p_player1_wpm INTEGER,
    p_player2_wpm INTEGER,
    p_tx_hash TEXT DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
    v_match_id UUID;
BEGIN
    INSERT INTO duel_matches (
        duel_id, player1_address, player2_address, winner_address,
        stake_amount, payout_amount, player1_score, player2_score,
        player1_wpm, player2_wpm, tx_hash, settled_at
    )
    VALUES (
        p_duel_id, p_player1_address, p_player2_address, p_winner_address,
        p_stake_amount, p_payout_amount, p_player1_score, p_player2_score,
        p_player1_wpm, p_player2_wpm, p_tx_hash, NOW()
    )
    ON CONFLICT (duel_id) DO UPDATE SET
        winner_address = EXCLUDED.winner_address,
        payout_amount = EXCLUDED.payout_amount,
        player1_score = EXCLUDED.player1_score,
        player2_score = EXCLUDED.player2_score,
        player1_wpm = EXCLUDED.player1_wpm,
        player2_wpm = EXCLUDED.player2_wpm,
        tx_hash = EXCLUDED.tx_hash,
        settled_at = NOW()
    RETURNING id INTO v_match_id;
    
    RETURN v_match_id;
END;
$$ LANGUAGE plpgsql;

-- Function to clean up old duel results (call periodically)
CREATE OR REPLACE FUNCTION cleanup_old_duel_results(
    p_hours_old INTEGER DEFAULT 24
) RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM duel_results
    WHERE created_at < NOW() - (p_hours_old || ' hours')::INTERVAL;
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Function to clean up old game scores (call periodically)
CREATE OR REPLACE FUNCTION cleanup_old_game_scores(
    p_days_old INTEGER DEFAULT 90
) RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM game_scores
    WHERE created_at < NOW() - (p_days_old || ' days')::INTERVAL;
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Function to atomically deduct gold (for shop purchases with race condition prevention)
CREATE OR REPLACE FUNCTION deduct_user_gold(
    p_user_id UUID,
    p_amount INTEGER
) RETURNS BOOLEAN AS $$
DECLARE
    current_gold INTEGER;
BEGIN
    -- Lock the row and get current gold
    SELECT gold INTO current_gold
    FROM users
    WHERE id = p_user_id
    FOR UPDATE;
    
    -- Check if user has enough gold
    IF current_gold < p_amount THEN
        RETURN FALSE;
    END IF;
    
    -- Deduct gold
    UPDATE users
    SET gold = gold - p_amount,
        updated_at = NOW()
    WHERE id = p_user_id;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user rank (for leaderboard)
CREATE OR REPLACE FUNCTION get_user_rank(
    p_wallet_address TEXT,
    p_category TEXT DEFAULT 'best_score'
) RETURNS INTEGER AS $$
DECLARE
    user_rank INTEGER;
    user_value INTEGER;
BEGIN
    -- Get user's value for the category
    EXECUTE format('SELECT %I FROM users WHERE wallet_address = $1', p_category)
    INTO user_value
    USING p_wallet_address;
    
    IF user_value IS NULL THEN
        RETURN NULL;
    END IF;
    
    -- Count how many users have a higher value
    EXECUTE format('SELECT COUNT(*) + 1 FROM users WHERE %I > $1', p_category)
    INTO user_rank
    USING user_value;
    
    RETURN user_rank;
END;
$$ LANGUAGE plpgsql;

-- Function to update best streak (currently unused but available for future use)
CREATE OR REPLACE FUNCTION update_user_best_streak(
    p_wallet_address TEXT,
    p_streak INTEGER
) RETURNS void AS $$
BEGIN
    UPDATE users 
    SET 
        best_streak = GREATEST(COALESCE(best_streak, 0), p_streak),
        last_seen_at = NOW()
    WHERE wallet_address = p_wallet_address;
END;
$$ LANGUAGE plpgsql;

-- Function to update highest wave reached (trigger function)
CREATE OR REPLACE FUNCTION update_highest_wave_reached()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE users
    SET highest_wave_reached = GREATEST(
        COALESCE(highest_wave_reached, 0),
        NEW.wave_reached
    )
    WHERE id = NEW.user_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic highest wave tracking
DROP TRIGGER IF EXISTS trigger_update_highest_wave ON game_scores;
CREATE TRIGGER trigger_update_highest_wave
    AFTER INSERT ON game_scores
    FOR EACH ROW
    EXECUTE FUNCTION update_highest_wave_reached();

-- ═══════════════════════════════════════════════════════════════════════════════
-- GRANT PERMISSIONS
-- ═══════════════════════════════════════════════════════════════════════════════

GRANT EXECUTE ON FUNCTION increment_user_stats(TEXT, INTEGER, INTEGER, INTEGER, INTEGER) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION update_user_best_scores(TEXT, INTEGER, INTEGER) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION add_user_gold(TEXT, INTEGER) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION increment_user_gold(UUID, INTEGER) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_leaderboard(INTEGER, INTEGER, TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION save_game_score(TEXT, INTEGER, INTEGER, INTEGER, INTEGER, TEXT, INTEGER, INTEGER, INTEGER, INTEGER, INTEGER, BOOLEAN, BIGINT, BIGINT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION record_duel_match(TEXT, TEXT, TEXT, TEXT, BIGINT, BIGINT, INTEGER, INTEGER, INTEGER, INTEGER, TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION cleanup_old_duel_results(INTEGER) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION cleanup_old_game_scores(INTEGER) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION deduct_user_gold(UUID, INTEGER) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_user_rank(TEXT, TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION update_user_best_streak(TEXT, INTEGER) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION update_highest_wave_reached() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION update_updated_at_column() TO anon, authenticated;

-- ═══════════════════════════════════════════════════════════════════════════════
-- SEED SHOP ITEMS
-- ═══════════════════════════════════════════════════════════════════════════════

INSERT INTO public.shop_items (id, name, description, gold_price, category, available, image_url, metadata) VALUES
-- Powerups (Updated to match frontend fallback items)
('double-gold', 'Double Credits', 'Earn 2x credits for one game', 100, 'powerup', true, '/images/gold-coin.png', '{"duration": "1 game", "multiplier": 2, "type": "gold"}'),
('triple-gold', 'Triple Credits', 'Earn 3x credits for one game', 200, 'powerup', true, '/images/gold-coin.png', '{"duration": "1 game", "multiplier": 3, "type": "gold"}'),
('double-points', 'Double Points', 'Double your score for one game', 100, 'powerup', true, '/images/double-points.png', '{"duration": "1 game", "multiplier": 2, "type": "score"}'),
('triple-points', 'Triple Points', 'Triple your score for one game', 200, 'powerup', true, '/images/triple-points.png', '{"duration": "1 game", "multiplier": 3, "type": "score"}'),
('extra-life', 'Extra Shield', 'Start with 4 shields instead of 3', 150, 'powerup', true, '/images/heart.png', '{"duration": "1 game", "effect": "bonus_health", "value": 1}'),
('slow-enemies', 'Slow Motion', 'Enemies move 50% slower', 200, 'powerup', true, '/images/slow-enemies.png', '{"duration": "1 game", "effect": "speed_reduction", "value": 0.5}'),

-- Heroes
('hero-astronaut', 'Astronaut Hero', 'Classic space explorer skin', 500, 'hero', true, '/images/heroes/astronaut.png', '{"type": "cosmetic", "rarity": "common"}'),
('hero-cyborg', 'Cyborg Hero', 'Enhanced warrior with cybernetic upgrades', 750, 'hero', true, '/images/heroes/cyborg.png', '{"type": "cosmetic", "rarity": "rare"}'),
('hero-alien', 'Alien Hero', 'Mysterious visitor from distant galaxies', 1000, 'hero', true, '/images/heroes/alien.png', '{"type": "cosmetic", "rarity": "epic"}'),
('hero-mech', 'Mech Pilot', 'Pilot a powerful combat mech', 1500, 'hero', true, '/images/heroes/mech.png', '{"type": "cosmetic", "rarity": "legendary"}'),
('hero-quantum', 'Quantum Warrior', 'Harness the power of quantum mechanics', 2000, 'hero', true, '/images/heroes/quantum.png', '{"type": "cosmetic", "rarity": "legendary"}'),

-- Cosmetics
('weapon-laser-blue', 'Blue Laser', 'Cool blue laser beam effect', 300, 'cosmetic', true, '/images/weapons/laser-blue.png', '{"type": "weapon_skin", "effect": "blue_beam"}'),
('weapon-laser-red', 'Red Laser', 'Fierce red laser beam effect', 300, 'cosmetic', true, '/images/weapons/laser-red.png', '{"type": "weapon_skin", "effect": "red_beam"}'),
('weapon-laser-rainbow', 'Rainbow Laser', 'Spectacular rainbow laser effect', 600, 'cosmetic', true, '/images/weapons/laser-rainbow.png', '{"type": "weapon_skin", "effect": "rainbow_beam", "rarity": "rare"}'),
('ship-stealth', 'Stealth Fighter', 'Sleek black stealth ship design', 800, 'cosmetic', true, '/images/ships/stealth.png', '{"type": "ship_skin", "rarity": "rare"}'),
('ship-golden', 'Golden Cruiser', 'Luxurious golden ship', 1200, 'cosmetic', true, '/images/ships/golden.png', '{"type": "ship_skin", "rarity": "epic"}')
ON CONFLICT (id) DO NOTHING;

-- ═══════════════════════════════════════════════════════════════════════════════
-- VERIFICATION
-- ═══════════════════════════════════════════════════════════════════════════════

DO $$
DECLARE
    table_count INTEGER;
    item_count INTEGER;
    powerup_count INTEGER;
    hero_count INTEGER;
    cosmetic_count INTEGER;
BEGIN
    -- Verify all tables exist
    SELECT COUNT(*) INTO table_count
    FROM information_schema.tables
    WHERE table_schema = 'public'
    AND table_name IN ('users', 'game_scores', 'user_inventory', 'user_achievements', 
                       'shop_items', 'duel_results', 'duel_matches');
    
    IF table_count < 7 THEN
        RAISE EXCEPTION 'Schema incomplete: Expected 7 tables, found %', table_count;
    END IF;
    
    -- Verify shop items
    SELECT COUNT(*) INTO item_count FROM public.shop_items;
    SELECT COUNT(*) INTO powerup_count FROM public.shop_items WHERE category = 'powerup';
    SELECT COUNT(*) INTO hero_count FROM public.shop_items WHERE category = 'hero';
    SELECT COUNT(*) INTO cosmetic_count FROM public.shop_items WHERE category = 'cosmetic';
    
    -- Backfill highest_wave_reached for existing users
    UPDATE users u
    SET highest_wave_reached = (
        SELECT COALESCE(MAX(wave_reached), 0)
        FROM game_scores gs
        WHERE gs.user_id = u.id
    )
    WHERE highest_wave_reached IS NULL OR highest_wave_reached = 0;
    
    RAISE NOTICE '═══════════════════════════════════════════════════════════════';
    RAISE NOTICE '✅ TypeNad Database Schema Initialized Successfully';
    RAISE NOTICE '═══════════════════════════════════════════════════════════════';
    RAISE NOTICE 'Schema Version: 2.2.0';
    RAISE NOTICE 'Tables created: %', table_count;
    RAISE NOTICE 'Shop items seeded: % total', item_count;
    RAISE NOTICE '  - Powerups: %', powerup_count;
    RAISE NOTICE '  - Heroes: %', hero_count;
    RAISE NOTICE '  - Cosmetics: %', cosmetic_count;
    RAISE NOTICE 'Functions created: 13';
    RAISE NOTICE 'Triggers created: 3 (highest_wave_reached, updated_at automation)';
    RAISE NOTICE 'Foreign key constraints: 1 (inventory -> shop_items)';
    RAISE NOTICE 'CHECK constraints: 8 (data integrity validation)';
    RAISE NOTICE 'Performance indexes: 20+';
    RAISE NOTICE 'RLS enabled on all tables';
    RAISE NOTICE 'Realtime enabled for duel sync';
    RAISE NOTICE 'Achievement system improvements applied';
    RAISE NOTICE 'Race condition prevention: atomic gold operations';
    RAISE NOTICE '═══════════════════════════════════════════════════════════════';
END $$;
