-- ═══════════════════════════════════════════════════════════════════════════════
-- SCHEMA FIXES AND SEED DATA
-- Version: 1.0.0
-- Description: Fixes missing columns and seeds initial data
-- ═══════════════════════════════════════════════════════════════════════════════

-- Fix users table - add missing columns
DO $$
BEGIN
    BEGIN
        ALTER TABLE public.users ADD COLUMN best_score INTEGER DEFAULT 0 NOT NULL;
    EXCEPTION WHEN duplicate_column THEN END;

    BEGIN
        ALTER TABLE public.users ADD COLUMN best_wpm INTEGER DEFAULT 0 NOT NULL;
    EXCEPTION WHEN duplicate_column THEN END;
END $$;

-- Create index for best_score and best_wpm
CREATE INDEX IF NOT EXISTS idx_users_best_score ON public.users(best_score DESC);
CREATE INDEX IF NOT EXISTS idx_users_best_wpm ON public.users(best_wpm DESC);

-- ═══════════════════════════════════════════════════════════════════════════════
-- SEED SHOP ITEMS
-- ═══════════════════════════════════════════════════════════════════════════════

INSERT INTO public.shop_items (id, name, description, gold_price, category, available, image_url, metadata) VALUES
-- Powerups
('double-points', 'Double Points', 'Earn 2x points for one game', 100, 'powerup', true, '/images/powerups/double-points.png', '{"duration": "1 game", "multiplier": 2, "type": "score"}'),
('triple-points', 'Triple Points', 'Earn 3x points for one game', 250, 'powerup', true, '/images/powerups/triple-points.png', '{"duration": "1 game", "multiplier": 3, "type": "score"}'),
('double-gold', 'Double Gold', 'Earn 2x gold for one game', 150, 'powerup', true, '/images/powerups/double-gold.png', '{"duration": "1 game", "multiplier": 2, "type": "gold"}'),
('triple-gold', 'Triple Gold', 'Earn 3x gold for one game', 300, 'powerup', true, '/images/powerups/triple-gold.png', '{"duration": "1 game", "multiplier": 3, "type": "gold"}'),
('slow-enemies', 'Slow Enemies', 'Enemies move 50% slower for one game', 200, 'powerup', true, '/images/powerups/slow-enemies.png', '{"duration": "1 game", "effect": "speed_reduction", "value": 0.5}'),
('extra-life', 'Extra Life', 'Start with +1 health for one game', 175, 'powerup', true, '/images/powerups/extra-life.png', '{"duration": "1 game", "effect": "bonus_health", "value": 1}'),

-- Heroes (cosmetic)
('hero-astronaut', 'Astronaut Hero', 'Classic space explorer skin', 500, 'hero', true, '/images/heroes/astronaut.png', '{"type": "cosmetic", "category": "hero"}'),
('hero-cyborg', 'Cyborg Hero', 'Enhanced warrior skin', 750, 'hero', true, '/images/heroes/cyborg.png', '{"type": "cosmetic", "category": "hero"}'),
('hero-alien', 'Alien Hero', 'Mysterious visitor skin', 1000, 'hero', true, '/images/heroes/alien.png', '{"type": "cosmetic", "category": "hero"}')
ON CONFLICT (id) DO NOTHING;

-- ═══════════════════════════════════════════════════════════════════════════════
-- VERIFY INSTALLATION
-- ═══════════════════════════════════════════════════════════════════════════════

-- Check users table columns
DO $$
DECLARE
    col_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO col_count
    FROM information_schema.columns
    WHERE table_name = 'users' 
    AND column_name IN ('best_score', 'best_wpm');
    
    IF col_count = 2 THEN
        RAISE NOTICE 'SUCCESS: Users table has best_score and best_wpm columns';
    ELSE
        RAISE WARNING 'WARNING: Users table missing columns';
    END IF;
END $$;

-- Check shop items
DO $$
DECLARE
    item_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO item_count FROM shop_items;
    
    IF item_count >= 9 THEN
        RAISE NOTICE 'SUCCESS: Shop items seeded (% items)', item_count;
    ELSE
        RAISE WARNING 'WARNING: Shop items not fully seeded (% items)', item_count;
    END IF;
END $$;
