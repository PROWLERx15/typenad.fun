import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { isAddress } from 'viem';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

/**
 * GET /api/shop/items
 * 
 * Gets all shop items available for purchase
 */
export async function GET() {
  try {
    const { data, error } = await supabase
      .from('shop_items')
      .select('*')
      .eq('available', true)
      .order('category', { ascending: true })
      .order('gold_price', { ascending: true });

    if (error) throw error;

    return NextResponse.json({
      success: true,
      data: { items: data || [] },
    });
  } catch (error) {
    console.error('[shop/items] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
