export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            users: {
                Row: {
                    id: string
                    wallet_address: string
                    username: string | null
                    email: string | null
                    google_id: string | null
                    profile_picture: string | null
                    gold: number
                    total_games: number
                    total_kills: number
                    total_words_typed: number
                    best_streak: number
                    created_at: string
                    last_seen_at: string
                }
                Insert: {
                    id?: string
                    wallet_address: string
                    username?: string | null
                    email?: string | null
                    google_id?: string | null
                    profile_picture?: string | null
                    gold?: number
                    total_games?: number
                    total_kills?: number
                    total_words_typed?: number
                    best_streak?: number
                    created_at?: string
                    last_seen_at?: string
                }
                Update: {
                    id?: string
                    wallet_address?: string
                    username?: string | null
                    email?: string | null
                    google_id?: string | null
                    profile_picture?: string | null
                    gold?: number
                    total_games?: number
                    total_kills?: number
                    total_words_typed?: number
                    best_streak?: number
                    created_at?: string
                    last_seen_at?: string
                }
            }
            game_scores: {
                Row: {
                    id: string
                    user_id: string
                    score: number
                    wave_reached: number
                    wpm: number
                    game_mode: string
                    kills: number
                    created_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    score: number
                    wave_reached: number
                    wpm: number
                    game_mode: string
                    kills: number
                    created_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    score?: number
                    wave_reached?: number
                    wpm?: number
                    game_mode?: string
                    kills?: number
                    created_at?: string
                }
            }
            user_inventory: {
                Row: {
                    id: string
                    user_id: string
                    item_id: string
                    quantity: number
                    updated_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    item_id: string
                    quantity: number
                    updated_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    item_id?: string
                    quantity?: number
                    updated_at?: string
                }
            }
            user_achievements: {
                Row: {
                    id: string
                    user_id: string
                    achievement_id: string
                    unlocked_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    achievement_id: string
                    unlocked_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    achievement_id?: string
                    unlocked_at?: string
                }
            }
        }
    }
}
