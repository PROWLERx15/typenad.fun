import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Database } from '../types/db';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('⚠️ Supabase URL or Anon Key is missing. Database features will be disabled.');
}

// Typed client - use for type-safe operations when DB types are up-to-date
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

// Untyped client - use when DB types may not be synchronized
// This avoids TypeScript errors when the database schema doesn't match types/db.ts
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const supabaseUntyped: SupabaseClient<any, any, any> = supabase as SupabaseClient<any, any, any>;
