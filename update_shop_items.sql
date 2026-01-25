-- ═══════════════════════════════════════════════════════════════════════════════
-- SHOP ITEMS UPDATE SCRIPT
-- Date: 2026-01-25
-- Description: Update shop items to match frontend fallback items
--              Run this script to update your existing database
-- ═══════════════════════════════════════════════════════════════════════════════

BEGIN;

-- Update powerup prices and descriptions to match frontend
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

-- Remove extra powerups that aren't in the fallback list
DELETE FROM public.shop_items WHERE id IN ('shield', 'time-warp');

-- Verification and summary
DO $$
DECLARE
    powerup_count INTEGER;
    hero_count INTEGER;
    cosmetic_count INTEGER;
    total_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO powerup_count FROM public.shop_items WHERE category = 'powerup';
    SELECT COUNT(*) INTO hero_count FROM public.shop_items WHERE category = 'hero';
    SELECT COUNT(*) INTO cosmetic_count FROM public.shop_items WHERE category = 'cosmetic';
    SELECT COUNT(*) INTO total_count FROM public.shop_items;
    
    RAISE NOTICE '═══════════════════════════════════════════════════════════════';
    RAISE NOTICE '✅ Shop Items Updated Successfully';
    RAISE NOTICE '═══════════════════════════════════════════════════════════════';
    RAISE NOTICE 'Total items: %', total_count;
    RAISE NOTICE '  - Powerups: % (6 items)', powerup_count;
    RAISE NOTICE '  - Heroes: %', hero_count;
    RAISE NOTICE '  - Cosmetics: %', cosmetic_count;
    RAISE NOTICE '';
    RAISE NOTICE 'Updated Powerup Prices:';
    RAISE NOTICE '  ✓ double-gold: 100 gold (was 150)';
    RAISE NOTICE '  ✓ triple-gold: 200 gold (was 300)';
    RAISE NOTICE '  ✓ double-points: 100 gold';
    RAISE NOTICE '  ✓ triple-points: 200 gold (was 250)';
    RAISE NOTICE '  ✓ extra-life: 150 gold (was 175)';
    RAISE NOTICE '  ✓ slow-enemies: 200 gold';
    RAISE NOTICE '';
    RAISE NOTICE 'Removed Items:';
    RAISE NOTICE '  ✗ shield (not in fallback list)';
    RAISE NOTICE '  ✗ time-warp (not in fallback list)';
    RAISE NOTICE '═══════════════════════════════════════════════════════════════';
END $$;

-- Display current powerup items
SELECT 
    id,
    name,
    gold_price,
    description,
    image_url
FROM public.shop_items 
WHERE category = 'powerup'
ORDER BY gold_price;

COMMIT;
