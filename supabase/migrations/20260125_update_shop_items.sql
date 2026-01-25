-- ═══════════════════════════════════════════════════════════════════════════════
-- SHOP ITEMS UPDATE MIGRATION
-- Date: 2026-01-25
-- Description: Update shop items to match frontend fallback items with correct
--              prices, descriptions, and image URLs
-- ═══════════════════════════════════════════════════════════════════════════════

-- Update existing powerup items with correct prices and descriptions
UPDATE public.shop_items SET
    name = 'Double Credits',
    description = 'Earn 2x credits for one game',
    gold_price = 100,
    image_url = '/images/gold-coin.png',
    metadata = '{"duration": "1 game", "multiplier": 2, "type": "gold"}'::jsonb
WHERE id = 'double-gold';

UPDATE public.shop_items SET
    name = 'Triple Credits',
    description = 'Earn 3x credits for one game',
    gold_price = 200,
    image_url = '/images/gold-coin.png',
    metadata = '{"duration": "1 game", "multiplier": 3, "type": "gold"}'::jsonb
WHERE id = 'triple-gold';

UPDATE public.shop_items SET
    name = 'Double Points',
    description = 'Double your score for one game',
    gold_price = 100,
    image_url = '/images/double-points.png',
    metadata = '{"duration": "1 game", "multiplier": 2, "type": "score"}'::jsonb
WHERE id = 'double-points';

UPDATE public.shop_items SET
    name = 'Triple Points',
    description = 'Triple your score for one game',
    gold_price = 200,
    image_url = '/images/triple-points.png',
    metadata = '{"duration": "1 game", "multiplier": 3, "type": "score"}'::jsonb
WHERE id = 'triple-points';

UPDATE public.shop_items SET
    name = 'Extra Shield',
    description = 'Start with 4 shields instead of 3',
    gold_price = 150,
    image_url = '/images/heart.png',
    metadata = '{"duration": "1 game", "effect": "bonus_health", "value": 1}'::jsonb
WHERE id = 'extra-life';

UPDATE public.shop_items SET
    name = 'Slow Motion',
    description = 'Enemies move 50% slower',
    gold_price = 200,
    image_url = '/images/slow-enemies.png',
    metadata = '{"duration": "1 game", "effect": "speed_reduction", "value": 0.5}'::jsonb
WHERE id = 'slow-enemies';

-- Verification
DO $$
DECLARE
    updated_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO updated_count
    FROM public.shop_items
    WHERE id IN ('double-gold', 'triple-gold', 'double-points', 'triple-points', 'extra-life', 'slow-enemies');
    
    RAISE NOTICE '═══════════════════════════════════════════════════════════════';
    RAISE NOTICE '✅ Shop Items Updated Successfully';
    RAISE NOTICE '═══════════════════════════════════════════════════════════════';
    RAISE NOTICE 'Updated items: %', updated_count;
    RAISE NOTICE '';
    RAISE NOTICE 'Updated Powerups:';
    RAISE NOTICE '  - double-gold: 100 gold (was 150)';
    RAISE NOTICE '  - triple-gold: 200 gold (was 300)';
    RAISE NOTICE '  - double-points: 100 gold (unchanged)';
    RAISE NOTICE '  - triple-points: 200 gold (was 250)';
    RAISE NOTICE '  - extra-life: 150 gold (was 175)';
    RAISE NOTICE '  - slow-enemies: 200 gold (unchanged)';
    RAISE NOTICE '═══════════════════════════════════════════════════════════════';
END $$;
