import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Cache for shop items (5 minutes TTL)
let cachedItems: any[] | null = null;
let cacheTimestamp = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * GET /api/shop/items
 * 
 * Retrieves available shop items
 * Query params:
 * - category: 'powerup' | 'hero' | 'cosmetic' (optional)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');

    // Check cache
    const now = Date.now();
    if (cachedItems && now - cacheTimestamp < CACHE_TTL) {
      console.log('[shop/items] Returning cached items');
      const items = category
        ? cachedItems.filter((item) => item.category === category)
        : cachedItems;

      return NextResponse.json({
        success: true,
        data: { items },
      });
    }

    // Fetch from database
    let query = supabase
      .from('shop_items')
      .select('*')
      .eq('available', true)
      .order('category', { ascending: true })
      .order('gold_price', { ascending: true });

    if (category) {
      query = query.eq('category', category);
    }

    const { data: items, error } = await query;

    if (error) {
      console.error('[shop/items] Error fetching items:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch shop items' },
        { status: 500 }
      );
    }

    // Update cache (only if no category filter)
    if (!category) {
      cachedItems = items || [];
      cacheTimestamp = now;
    }

    console.log('[shop/items] Fetched', items?.length || 0, 'items');

    return NextResponse.json({
      success: true,
      data: { items: items || [] },
    });
  } catch (error) {
    console.error('[shop/items] Unexpected error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}
