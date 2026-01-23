import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/db';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('⚠️ Supabase URL or Anon Key is missing. Database features will be disabled.');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
