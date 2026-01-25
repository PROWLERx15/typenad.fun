# TypeNad Database Migrations

## Current Schema

**File:** `000_complete_schema.sql`  
**Version:** 2.0.0  
**Date:** 2026-01-25

This is the **single source of truth** for the TypeNad database schema.

## What's Included

### Tables (7)
1. **users** - Player profiles and statistics
2. **game_scores** - Individual game session records
3. **user_inventory** - Player items and equipment
4. **user_achievements** - Unlocked achievements
5. **shop_items** - Available items for purchase (pre-seeded with 18 items)
6. **duel_results** - Real-time duel synchronization
7. **duel_matches** - Completed duel match history

### Functions (7)
- `increment_user_stats()` - Atomic stat updates
- `update_user_best_scores()` - Update personal bests
- `add_user_gold()` - Safe gold transactions
- `get_leaderboard()` - Ranked leaderboards with time filters
- `save_game_score()` - Complete game session save
- `record_duel_match()` - Record duel outcomes
- `cleanup_old_duel_results()` - Maintenance function

### Features
- ✅ All indexes for optimal performance
- ✅ Row Level Security (RLS) enabled
- ✅ Open policies for hackathon (ready to restrict for production)
- ✅ Realtime enabled for duel synchronization
- ✅ 18 shop items pre-seeded (8 powerups, 5 heroes, 5 cosmetics)
- ✅ Verification checks included

## Deployment

### Fresh Installation
```bash
# Run the complete schema on your Supabase instance
psql -h your-db-host -U postgres -d postgres -f 000_complete_schema.sql
```

### Via Supabase Dashboard
1. Go to SQL Editor in your Supabase dashboard
2. Copy the contents of `000_complete_schema.sql`
3. Paste and run
4. Verify the success message shows all 7 tables and 18 shop items

### Verification
After running, you should see:
```
✅ TypeNad Database Schema Initialized Successfully
Tables created: 7
Shop items seeded: 18 total
  - Powerups: 8
  - Heroes: 5
  - Cosmetics: 5
Functions created: 7
RLS enabled on all tables
Realtime enabled for duel sync
```

## Schema Verification

The schema has been verified against the complete frontend codebase. See `DATABASE_SCHEMA_ANALYSIS.md` in the root directory for detailed verification report.

## Production Considerations

Before deploying to production:

1. **Update RLS Policies** - Restrict access based on wallet ownership
2. **Add Authentication** - Implement proper auth checks
3. **Set up Monitoring** - Track query performance and database metrics
4. **Schedule Maintenance** - Run `cleanup_old_duel_results()` periodically
5. **Configure Backups** - Set up automated backup strategy

## Support

For issues or questions about the database schema, refer to:
- `DATABASE_SCHEMA_ANALYSIS.md` - Complete schema verification report
- Frontend API routes in `frontend/src/app/api/` - Usage examples
