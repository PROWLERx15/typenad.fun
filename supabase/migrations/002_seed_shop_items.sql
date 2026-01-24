-- Migration: Seed shop items data
-- Date: 2026-01-25
-- Description: Populates the shop_items table with powerups and cosmetic items

-- ═══════════════════════════════════════════════════════════════════════════════
-- SEED SHOP ITEMS
-- ═══════════════════════════════════════════════════════════════════════════════

-- Clear existing items (if any)
TRUNCATE TABLE public.shop_items;

-- Insert Powerup Items
INSERT INTO public.shop_items (id, name, description, gold_price, category, available, image_url, metadata) VALUES
-- Score Multipliers
('double-points', 'Double Points', 'Earn 2x points for one game', 100, 'powerup', true, '/images/powerups/double-points.png', '{"duration": "1 game", "multiplier": 2, "type": "score"}'),
('triple-points', 'Triple Points', 'Earn 3x points for one game', 250, 'powerup', true, '/images/powerups/triple-points.png', '{"duration": "1 game", "multiplier": 3, "type": "score"}'),

-- Gold Multipliers
('double-gold', 'Double Gold', 'Earn 2x gold for one game', 150, 'powerup', true, '/images/powerups/double-gold.png', '{"duration": "1 game", "multiplier": 2, "type": "gold"}'),
('triple-gold', 'Triple Gold', 'Earn 3x gold for one game', 300, 'powerup', true, '/images/powerups/triple-gold.png', '{"duration": "1 game", "multiplier": 3, "type": "gold"}'),

-- Gameplay Modifiers
('slow-enemies', 'Slow Enemies', 'Enemies move 50% slower for one game', 200, 'powerup', true, '/images/powerups/slow-enemies.png', '{"duration": "1 game", "effect": "speed_reduction", "value": 0.5}'),
('extra-life', 'Extra Life', 'Start with +1 health for one game', 175, 'powerup', true, '/images/powerups/extra-life.png', '{"duration": "1 game", "effect": "bonus_health", "value": 1}'),

-- Advanced Powerups
('shield', 'Energy Shield', 'Absorb one hit without losing health', 225, 'powerup', true, '/images/powerups/shield.png', '{"duration": "1 game", "effect": "damage_immunity", "value": 1}'),
('time-warp', 'Time Warp', 'Freeze all enemies for 5 seconds', 275, 'powerup', true, '/images/powerups/time-warp.png', '{"duration": "1 use", "effect": "freeze", "value": 5}');

-- Insert Hero/Cosmetic Items
INSERT INTO public.shop_items (id, name, description, gold_price, category, available, image_url, metadata) VALUES
-- Basic Heroes
('hero-astronaut', 'Astronaut Hero', 'Classic space explorer skin', 500, 'hero', true, '/images/heroes/astronaut.png', '{"type": "cosmetic", "rarity": "common"}'),
('hero-cyborg', 'Cyborg Hero', 'Enhanced warrior with cybernetic upgrades', 750, 'hero', true, '/images/heroes/cyborg.png', '{"type": "cosmetic", "rarity": "rare"}'),
('hero-alien', 'Alien Hero', 'Mysterious visitor from distant galaxies', 1000, 'hero', true, '/images/heroes/alien.png', '{"type": "cosmetic", "rarity": "epic"}'),

-- Premium Heroes
('hero-mech', 'Mech Pilot', 'Pilot a powerful combat mech', 1500, 'hero', true, '/images/heroes/mech.png', '{"type": "cosmetic", "rarity": "legendary"}'),
('hero-quantum', 'Quantum Warrior', 'Harness the power of quantum mechanics', 2000, 'hero', true, '/images/heroes/quantum.png', '{"type": "cosmetic", "rarity": "legendary"}'),

-- Weapon Skins
('weapon-laser-blue', 'Blue Laser', 'Cool blue laser beam effect', 300, 'cosmetic', true, '/images/weapons/laser-blue.png', '{"type": "weapon_skin", "effect": "blue_beam"}'),
('weapon-laser-red', 'Red Laser', 'Fierce red laser beam effect', 300, 'cosmetic', true, '/images/weapons/laser-red.png', '{"type": "weapon_skin", "effect": "red_beam"}'),
('weapon-laser-rainbow', 'Rainbow Laser', 'Spectacular rainbow laser effect', 600, 'cosmetic', true, '/images/weapons/laser-rainbow.png', '{"type": "weapon_skin", "effect": "rainbow_beam", "rarity": "rare"}'),

-- Ship Skins
('ship-stealth', 'Stealth Fighter', 'Sleek black stealth ship design', 800, 'cosmetic', true, '/images/ships/stealth.png', '{"type": "ship_skin", "rarity": "rare"}'),
('ship-golden', 'Golden Cruiser', 'Luxurious golden ship', 1200, 'cosmetic', true, '/images/ships/golden.png', '{"type": "ship_skin", "rarity": "epic"}');

-- ═══════════════════════════════════════════════════════════════════════════════
-- VERIFICATION
-- ═══════════════════════════════════════════════════════════════════════════════

-- Verify items were inserted
DO $$
DECLARE
  item_count INTEGER;
  powerup_count INTEGER;
  hero_count INTEGER;
  cosmetic_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO item_count FROM public.shop_items;
  SELECT COUNT(*) INTO powerup_count FROM public.shop_items WHERE category = 'powerup';
  SELECT COUNT(*) INTO hero_count FROM public.shop_items WHERE category = 'hero';
  SELECT COUNT(*) INTO cosmetic_count FROM public.shop_items WHERE category = 'cosmetic';
  
  IF item_count = 0 THEN
    RAISE EXCEPTION 'Seed failed: No items inserted';
  END IF;
  
  RAISE NOTICE '✅ Shop items seeded successfully';
  RAISE NOTICE 'Total items: %', item_count;
  RAISE NOTICE 'Powerups: %', powerup_count;
  RAISE NOTICE 'Heroes: %', hero_count;
  RAISE NOTICE 'Cosmetics: %', cosmetic_count;
END $$;

-- Display all seeded items
SELECT 
  id,
  name,
  category,
  gold_price,
  available
FROM public.shop_items
ORDER BY category, gold_price;
