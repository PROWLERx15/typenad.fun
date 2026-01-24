# Database Migrations

This directory contains SQL migration scripts for the TypeNad game database.

## Migration Files

### 001_add_missing_columns_and_tables.sql
**Purpose:** Adds missing columns and creates new tables for game data tracking

**Changes:**
- Adds `best_score` and `best_wpm` columns to `users` table
- Adds `misses`, `typos`, `gold_earned`, `duration_seconds`, `words_typed`, `is_staked`, `stake_amount`, `payout_amount` columns to `game_scores` table
- Adds `item_type` and `equipped` columns to `user_inventory` table
- Creates `shop_items` table for purchasable items
- Creates `duel_matches` table for duel history
- Creates all necessary indexes for performance

**Rollback:** Use `001_rollback.sql` to revert changes

### 002_seed_shop_items.sql
**Purpose:** Populates the shop_items table with initial items

**Items Added:**
- 8 Powerups (score multipliers, gold multipliers, gameplay modifiers)
- 5 Heroes (cosmetic skins)
- 5 Cosmetic items (weapon skins, ship skins)

## Running Migrations

### Option 1: Using Supabase CLI
```bash
# Run all pending migrations
supabase db push

# Or run specific migration
psql $DATABASE_URL < supabase/migrations/001_add_missing_columns_and_tables.sql
psql $DATABASE_URL < supabase/migrations/002_seed_shop_items.sql
```

### Option 2: Using psql directly
```bash
# Set your database URL
export DATABASE_URL="postgresql://user:password@host:port/database"

# Run migration 001
psql $DATABASE_URL -f supabase/migrations/001_add_missing_columns_and_tables.sql

# Run migration 002
psql $DATABASE_URL -f supabase/migrations/002_seed_shop_items.sql
```

### Option 3: Using Supabase Dashboard
1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Copy and paste the migration SQL
4. Click "Run"

## Verification

After running migrations, verify the changes:

```sql
-- Check users table columns
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'users'
ORDER BY ordinal_position;

-- Check game_scores table columns
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'game_scores'
ORDER BY ordinal_position;

-- Check shop_items count
SELECT COUNT(*) as total_items,
       COUNT(*) FILTER (WHERE category = 'powerup') as powerups,
       COUNT(*) FILTER (WHERE category = 'hero') as heroes,
       COUNT(*) FILTER (WHERE category = 'cosmetic') as cosmetics
FROM shop_items;

-- Check duel_matches table exists
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_name = 'duel_matches'
);
```

## Rollback

If you need to rollback migration 001:

```bash
psql $DATABASE_URL -f supabase/migrations/001_rollback.sql
```

**⚠️ WARNING:** Rollback will drop columns and tables. All data in those columns/tables will be lost!

## Migration Order

Migrations must be run in order:
1. `001_add_missing_columns_and_tables.sql` - Schema changes
2. `002_seed_shop_items.sql` - Initial data

## Troubleshooting

### Error: Column already exists
This is safe to ignore. The migrations use `IF NOT EXISTS` clauses to be idempotent.

### Error: Permission denied
Ensure you're using a database user with sufficient privileges (e.g., `postgres` user or service role).

### Error: Relation does not exist
Ensure you've run the base `database.sql` schema first, or that the tables exist in your database.

## Notes

- All migrations include verification queries that will raise errors if something goes wrong
- Migrations are designed to be idempotent (safe to run multiple times)
- Always backup your database before running migrations in production
- Test migrations on a development/staging database first
