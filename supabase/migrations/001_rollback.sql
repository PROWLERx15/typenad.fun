-- Rollback Migration: Remove added columns and tables
-- Date: 2026-01-25
-- Description: Rollback script for migration 001
-- WARNING: This will drop columns and tables. Data will be lost!

-- ═══════════════════════════════════════════════════════════════════════════════
-- ROLLBACK: DROP TABLES
-- ═══════════════════════════════════════════════════════════════════════════════

-- Drop duel_matches table
DROP TABLE IF EXISTS public.duel_matches CASCADE;

-- Drop shop_items table
DROP TABLE IF EXISTS public.shop_items CASCADE;

-- ═══════════════════════════════════════════════════════════════════════════════
-- ROLLBACK: REMOVE COLUMNS FROM USER_INVENTORY
-- ═══════════════════════════════════════════════════════════════════════════════

ALTER TABLE public.user_inventory
  DROP COLUMN IF EXISTS item_type,
  DROP COLUMN IF EXISTS equipped;

-- Drop indexes
DROP INDEX IF EXISTS idx_user_inventory_user;
DROP INDEX IF EXISTS idx_user_inventory_equipped;

-- ═══════════════════════════════════════════════════════════════════════════════
-- ROLLBACK: REMOVE COLUMNS FROM GAME_SCORES
-- ═══════════════════════════════════════════════════════════════════════════════

ALTER TABLE public.game_scores
  DROP COLUMN IF EXISTS misses,
  DROP COLUMN IF EXISTS typos,
  DROP COLUMN IF EXISTS gold_earned,
  DROP COLUMN IF EXISTS duration_seconds,
  DROP COLUMN IF EXISTS words_typed,
  DROP COLUMN IF EXISTS is_staked,
  DROP COLUMN IF EXISTS stake_amount,
  DROP COLUMN IF EXISTS payout_amount;

-- Drop indexes
DROP INDEX IF EXISTS idx_game_scores_user;
DROP INDEX IF EXISTS idx_game_scores_mode;
DROP INDEX IF EXISTS idx_game_scores_score;
DROP INDEX IF EXISTS idx_game_scores_created;
DROP INDEX IF EXISTS idx_game_scores_is_staked;

-- ═══════════════════════════════════════════════════════════════════════════════
-- ROLLBACK: REMOVE COLUMNS FROM USERS
-- ═══════════════════════════════════════════════════════════════════════════════

ALTER TABLE public.users
  DROP COLUMN IF EXISTS best_score,
  DROP COLUMN IF EXISTS best_wpm;

-- Drop indexes
DROP INDEX IF EXISTS idx_users_best_score;
DROP INDEX IF EXISTS idx_users_best_wpm;
DROP INDEX IF EXISTS idx_users_wallet;

-- ═══════════════════════════════════════════════════════════════════════════════
-- ROLLBACK COMPLETE
-- ═══════════════════════════════════════════════════════════════════════════════

DO $$
BEGIN
  RAISE NOTICE '⚠️  Rollback 001 completed';
  RAISE NOTICE 'Removed columns from users, game_scores, user_inventory';
  RAISE NOTICE 'Dropped tables: shop_items, duel_matches';
  RAISE NOTICE 'Dropped all related indexes';
END $$;
