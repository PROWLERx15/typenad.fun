
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

export type PlayerStats = {
    wallet_address: string;
    high_score: number;
    total_kills: number;
    credits: number;
    inventory: string[]; // JSON string of powerup IDs
    games_played: number;
    last_played_at: string;
};
