
import { createClient } from '@supabase/supabase-js';

// Note: The Supabase client uses the REST API over HTTPS, so it works seamlessly 
// with both IPv4 and IPv6 networks. The free tier IPv6 restriction only applies 
// to direct database connections (port 5432), not the API used here.

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseKey) {
    console.warn('Missing Supabase environment variables. Database features will be disabled.');
}

export const supabase = createClient(supabaseUrl, supabaseKey);

// Database types matching actual schema
export type UserProfile = {
    id: string;
    wallet_address: string;
    username: string | null;
    email: string | null;
    gold: number;
    total_games: number;
    total_kills: number;
    total_words_typed: number;
    best_score: number;
    best_wpm: number;
    best_streak: number;
    highest_wave_reached: number;
    created_at: string;
    updated_at: string;
    last_seen_at: string;
};
