-- ═══════════════════════════════════════════════════════════════════════════════
-- TYPENAD COMPLETE DATABASE SCHEMA
-- Version: 1.1.0
-- Description: Complete schema for TypeNad game including users, scores, 
--              inventory, achievements, and duel synchronization.
--              Includes idempotent column checks to fix "column does not exist" errors.
-- ═══════════════════════════════════════════════════════════════════════════════

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ═══════════════════════════════════════════════════════════════════════════════
-- 1. USERS TABLE
-- ═══════════════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.users (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    wallet_address TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Ensure all columns exist (Migration fix for existing tables)
DO $$
BEGIN
    -- Add columns if they don't exist
    BEGIN
        ALTER TABLE public.users ADD COLUMN username TEXT;
    EXCEPTION WHEN duplicate_column THEN END;

    BEGIN
        ALTER TABLE public.users ADD COLUMN email TEXT;
    EXCEPTION WHEN duplicate_column THEN END;

    BEGIN
        ALTER TABLE public.users ADD COLUMN google_id TEXT;
    EXCEPTION WHEN duplicate_column THEN END;

    BEGIN
        ALTER TABLE public.users ADD COLUMN profile_picture TEXT;
    EXCEPTION WHEN duplicate_column THEN END;

    BEGIN
        ALTER TABLE public.users ADD COLUMN gold INTEGER DEFAULT 0 NOT NULL;
    EXCEPTION WHEN duplicate_column THEN END;

    BEGIN
        ALTER TABLE public.users ADD COLUMN total_games INTEGER DEFAULT 0 NOT NULL;
    EXCEPTION WHEN duplicate_column THEN END;

    BEGIN
        ALTER TABLE public.users ADD COLUMN total_kills INTEGER DEFAULT 0 NOT NULL;
    EXCEPTION WHEN duplicate_column THEN END;

    BEGIN
        ALTER TABLE public.users ADD COLUMN total_words_typed INTEGER DEFAULT 0 NOT NULL;
    EXCEPTION WHEN duplicate_column THEN END;

    BEGIN
        ALTER TABLE public.users ADD COLUMN best_streak INTEGER DEFAULT 0 NOT NULL;
    EXCEPTION WHEN duplicate_column THEN END;

    BEGIN
        ALTER TABLE public.users ADD COLUMN best_score INTEGER DEFAULT 0 NOT NULL;
    EXCEPTION WHEN duplicate_column THEN END;

    BEGIN
        ALTER TABLE public.users ADD COLUMN best_wpm INTEGER DEFAULT 0 NOT NULL;
    EXCEPTION WHEN duplicate_column THEN END;

    BEGIN
        ALTER TABLE public.users ADD COLUMN last_seen_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW());
    EXCEPTION WHEN duplicate_column THEN END;
END $$;

-- Users indexes
CREATE INDEX IF NOT EXISTS idx_users_wallet_address ON public.users(wallet_address);
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_google_id ON public.users(google_id);
CREATE INDEX IF NOT EXISTS idx_users_last_seen ON public.users(last_seen_at);
CREATE INDEX IF NOT EXISTS idx_users_total_games ON public.users(total_games);
CREATE INDEX IF NOT EXISTS idx_users_total_kills ON public.users(total_kills);
CREATE INDEX IF NOT EXISTS idx_users_best_score ON public.users(best_score DESC);
CREATE INDEX IF NOT EXISTS idx_users_gold ON public.users(gold DESC);

-- ═══════════════════════════════════════════════════════════════════════════════
-- 2. GAME SCORES TABLE
-- ═══════════════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.game_scores (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Ensure all columns exist
DO $$
BEGIN
    BEGIN
        ALTER TABLE public.game_scores ADD COLUMN score INTEGER DEFAULT 0 NOT NULL;
    EXCEPTION WHEN duplicate_column THEN END;

    BEGIN
        ALTER TABLE public.game_scores ADD COLUMN wave_reached INTEGER DEFAULT 1 NOT NULL;
    EXCEPTION WHEN duplicate_column THEN END;

    BEGIN
        ALTER TABLE public.game_scores ADD COLUMN wpm INTEGER DEFAULT 0 NOT NULL;
    EXCEPTION WHEN duplicate_column THEN END;

    BEGIN
        ALTER TABLE public.game_scores ADD COLUMN game_mode TEXT DEFAULT 'story' NOT NULL;
    EXCEPTION WHEN duplicate_column THEN END;

    BEGIN
        ALTER TABLE public.game_scores ADD COLUMN kills INTEGER DEFAULT 0 NOT NULL;
    EXCEPTION WHEN duplicate_column THEN END;

    BEGIN
        ALTER TABLE public.game_scores ADD COLUMN misses INTEGER DEFAULT 0;
    EXCEPTION WHEN duplicate_column THEN END;

    BEGIN
        ALTER TABLE public.game_scores ADD COLUMN typos INTEGER DEFAULT 0;
    EXCEPTION WHEN duplicate_column THEN END;

    BEGIN
        ALTER TABLE public.game_scores ADD COLUMN gold_earned INTEGER DEFAULT 0;
    EXCEPTION WHEN duplicate_column THEN END;

    BEGIN
        ALTER TABLE public.game_scores ADD COLUMN duration_seconds INTEGER;
    EXCEPTION WHEN duplicate_column THEN END;

    BEGIN
        ALTER TABLE public.game_scores ADD COLUMN is_staked BOOLEAN DEFAULT FALSE;
    EXCEPTION WHEN duplicate_column THEN END;

    BEGIN
        ALTER TABLE public.game_scores ADD COLUMN stake_amount BIGINT;
    EXCEPTION WHEN duplicate_column THEN END;

    BEGIN
        ALTER TABLE public.game_scores ADD COLUMN payout_amount BIGINT;
    EXCEPTION WHEN duplicate_column THEN END;
END $$;

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
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(user_id, item_id)
);

DO $$
BEGIN
    BEGIN
        ALTER TABLE public.user_inventory ADD COLUMN quantity INTEGER DEFAULT 0 NOT NULL;
    EXCEPTION WHEN duplicate_column THEN END;

    BEGIN
        ALTER TABLE public.user_inventory ADD COLUMN item_type TEXT DEFAULT 'consumable' NOT NULL;
    EXCEPTION WHEN duplicate_column THEN END;

    BEGIN
        ALTER TABLE public.user_inventory ADD COLUMN equipped BOOLEAN DEFAULT FALSE NOT NULL;
    EXCEPTION WHEN duplicate_column THEN END;
END $$;

-- Inventory indexes
CREATE INDEX IF NOT EXISTS idx_user_inventory_user_id ON public.user_inventory(user_id);
CREATE INDEX IF NOT EXISTS idx_user_inventory_item_id ON public.user_inventory(item_id);

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
-- 5. DUEL RESULTS TABLE (for real-time opponent synchronization)
-- ═══════════════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.duel_results (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    duel_id TEXT NOT NULL,
    player_address TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(duel_id, player_address)
);

DO $$
BEGIN
    BEGIN
        ALTER TABLE public.duel_results ADD COLUMN score INTEGER DEFAULT 0 NOT NULL;
    EXCEPTION WHEN duplicate_column THEN END;

    BEGIN
        ALTER TABLE public.duel_results ADD COLUMN wpm INTEGER DEFAULT 0 NOT NULL;
    EXCEPTION WHEN duplicate_column THEN END;

    BEGIN
        ALTER TABLE public.duel_results ADD COLUMN misses INTEGER DEFAULT 0 NOT NULL;
    EXCEPTION WHEN duplicate_column THEN END;

    BEGIN
        ALTER TABLE public.duel_results ADD COLUMN typos INTEGER DEFAULT 0 NOT NULL;
    EXCEPTION WHEN duplicate_column THEN END;

    BEGIN
        ALTER TABLE public.duel_results ADD COLUMN submitted_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL;
    EXCEPTION WHEN duplicate_column THEN END;
END $$;

-- Duel results indexes
CREATE INDEX IF NOT EXISTS idx_duel_results_duel_id ON public.duel_results(duel_id);
CREATE INDEX IF NOT EXISTS idx_duel_results_player_address ON public.duel_results(player_address);
CREATE INDEX IF NOT EXISTS idx_duel_results_created_at ON public.duel_results(created_at DESC);

-- ═══════════════════════════════════════════════════════════════════════════════
-- 6. SHOP ITEMS TABLE (static item catalog)
-- ═══════════════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.shop_items (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    gold_price INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

DO $$
BEGIN
    BEGIN
        ALTER TABLE public.shop_items ADD COLUMN description TEXT;
    EXCEPTION WHEN duplicate_column THEN END;

    BEGIN
        ALTER TABLE public.shop_items ADD COLUMN category TEXT NOT NULL DEFAULT 'hero';
    EXCEPTION WHEN duplicate_column THEN END;

    BEGIN
        ALTER TABLE public.shop_items ADD COLUMN available BOOLEAN DEFAULT TRUE;
    EXCEPTION WHEN duplicate_column THEN END;

    BEGIN
        ALTER TABLE public.shop_items ADD COLUMN image_url TEXT;
    EXCEPTION WHEN duplicate_column THEN END;

    BEGIN
        ALTER TABLE public.shop_items ADD COLUMN metadata JSONB DEFAULT '{}';
    EXCEPTION WHEN duplicate_column THEN END;
END $$;

-- Shop items indexes
CREATE INDEX IF NOT EXISTS idx_shop_items_category ON public.shop_items(category);
CREATE INDEX IF NOT EXISTS idx_shop_items_available ON public.shop_items(available);

-- ═══════════════════════════════════════════════════════════════════════════════
-- 7. DUEL MATCHES TABLE (for match history and leaderboard)
-- ═══════════════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.duel_matches (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    duel_id TEXT UNIQUE NOT NULL,
    player1_address TEXT NOT NULL,
    player2_address TEXT NOT NULL,
    stake_amount BIGINT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

DO $$
BEGIN
    BEGIN
        ALTER TABLE public.duel_matches ADD COLUMN winner_address TEXT;
    EXCEPTION WHEN duplicate_column THEN END;

    BEGIN
        ALTER TABLE public.duel_matches ADD COLUMN payout_amount BIGINT;
    EXCEPTION WHEN duplicate_column THEN END;

    BEGIN
        ALTER TABLE public.duel_matches ADD COLUMN player1_score INTEGER DEFAULT 0;
    EXCEPTION WHEN duplicate_column THEN END;

    BEGIN
        ALTER TABLE public.duel_matches ADD COLUMN player2_score INTEGER DEFAULT 0;
    EXCEPTION WHEN duplicate_column THEN END;

    BEGIN
        ALTER TABLE public.duel_matches ADD COLUMN player1_wpm INTEGER DEFAULT 0;
    EXCEPTION WHEN duplicate_column THEN END;

    BEGIN
        ALTER TABLE public.duel_matches ADD COLUMN player2_wpm INTEGER DEFAULT 0;
    EXCEPTION WHEN duplicate_column THEN END;

    BEGIN
        ALTER TABLE public.duel_matches ADD COLUMN settled_at TIMESTAMP WITH TIME ZONE;
    EXCEPTION WHEN duplicate_column THEN END;

    BEGIN
        ALTER TABLE public.duel_matches ADD COLUMN tx_hash TEXT;
    EXCEPTION WHEN duplicate_column THEN END;
END $$;

-- Duel matches indexes
CREATE INDEX IF NOT EXISTS idx_duel_matches_duel_id ON public.duel_matches(duel_id);
CREATE INDEX IF NOT EXISTS idx_duel_matches_player1 ON public.duel_matches(player1_address);
CREATE INDEX IF NOT EXISTS idx_duel_matches_player2 ON public.duel_matches(player2_address);
CREATE INDEX IF NOT EXISTS idx_duel_matches_winner ON public.duel_matches(winner_address);
CREATE INDEX IF NOT EXISTS idx_duel_matches_created_at ON public.duel_matches(created_at DESC);

-- ═══════════════════════════════════════════════════════════════════════════════
-- ENABLE ROW LEVEL SECURITY (RLS)
-- ═══════════════════════════════════════════════════════════════════════════════
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.duel_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.duel_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shop_items ENABLE ROW LEVEL SECURITY;

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

-- Shop Items policies (read only for public)
DROP POLICY IF EXISTS "Allow public read shop_items" ON public.shop_items;
CREATE POLICY "Allow public read shop_items"
ON public.shop_items FOR SELECT
USING (true);

-- ═══════════════════════════════════════════════════════════════════════════════
-- ENABLE REALTIME FOR DUEL SYNC
-- ═══════════════════════════════════════════════════════════════════════════════

-- Add tables to realtime publication (check existence first not to error)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'duel_results') THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.duel_results;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'duel_matches') THEN
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

-- Function to get leaderboard (with caching potential)
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
        gold_earned, misses, typos, is_staked, stake_amount, payout_amount
    )
    VALUES (
        v_user_id, p_score, p_wave, p_wpm, p_kills, p_game_mode,
        p_gold_earned, p_misses, p_typos, p_is_staked, p_stake_amount, p_payout_amount
    )
    RETURNING id INTO v_score_id;
    
    -- Update user stats
    UPDATE users SET
        total_games = COALESCE(total_games, 0) + 1,
        total_kills = COALESCE(total_kills, 0) + p_kills,
        total_words_typed = COALESCE(total_words_typed, 0) + p_kills, -- Approximate words = kills
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

-- ═══════════════════════════════════════════════════════════════════════════════
-- GRANT PERMISSIONS
-- ═══════════════════════════════════════════════════════════════════════════════

-- Grant execute permissions on functions
GRANT EXECUTE ON FUNCTION increment_user_stats TO anon, authenticated;
GRANT EXECUTE ON FUNCTION update_user_best_scores TO anon, authenticated;
GRANT EXECUTE ON FUNCTION add_user_gold TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_leaderboard TO anon, authenticated;
GRANT EXECUTE ON FUNCTION save_game_score TO anon, authenticated;
GRANT EXECUTE ON FUNCTION record_duel_match TO anon, authenticated;
GRANT EXECUTE ON FUNCTION cleanup_old_duel_results TO anon, authenticated;

-- ═══════════════════════════════════════════════════════════════════════════════
-- DONE
-- ═══════════════════════════════════════════════════════════════════════════════
