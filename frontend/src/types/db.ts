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
                    best_score: number
                    best_wpm: number
                    best_streak: number
                    highest_wave_reached: number
                    created_at: string
                    updated_at: string
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
                    best_score?: number
                    best_wpm?: number
                    best_streak?: number
                    highest_wave_reached?: number
                    created_at?: string
                    updated_at?: string
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
                    best_score?: number
                    best_wpm?: number
                    best_streak?: number
                    highest_wave_reached?: number
                    created_at?: string
                    updated_at?: string
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
                    misses: number
                    typos: number
                    gold_earned: number
                    duration_seconds: number
                    words_typed: number
                    is_staked: boolean
                    stake_amount: string | null
                    payout_amount: string | null
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
                    misses?: number
                    typos?: number
                    gold_earned?: number
                    duration_seconds?: number
                    words_typed?: number
                    is_staked?: boolean
                    stake_amount?: string | null
                    payout_amount?: string | null
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
                    misses?: number
                    typos?: number
                    gold_earned?: number
                    duration_seconds?: number
                    words_typed?: number
                    is_staked?: boolean
                    stake_amount?: string | null
                    payout_amount?: string | null
                    created_at?: string
                }
            }
            user_inventory: {
                Row: {
                    id: string
                    user_id: string
                    item_id: string
                    item_type: string
                    quantity: number
                    equipped: boolean
                    updated_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    item_id: string
                    item_type?: string
                    quantity?: number
                    equipped?: boolean
                    updated_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    item_id?: string
                    item_type?: string
                    quantity?: number
                    equipped?: boolean
                    updated_at?: string
                }
            }
            shop_items: {
                Row: {
                    id: string
                    name: string
                    description: string
                    gold_price: number
                    category: string
                    available: boolean
                    image_url: string | null
                    metadata: Json
                    created_at: string
                }
                Insert: {
                    id: string
                    name: string
                    description: string
                    gold_price: number
                    category: string
                    available?: boolean
                    image_url?: string | null
                    metadata?: Json
                    created_at?: string
                }
                Update: {
                    id?: string
                    name?: string
                    description?: string
                    gold_price?: number
                    category?: string
                    available?: boolean
                    image_url?: string | null
                    metadata?: Json
                    created_at?: string
                }
            }
            duel_matches: {
                Row: {
                    id: string
                    duel_id: string
                    player1_address: string
                    player2_address: string
                    winner_address: string | null
                    stake_amount: string
                    payout_amount: string | null
                    player1_score: number
                    player2_score: number
                    player1_wpm: number
                    player2_wpm: number
                    settled_at: string | null
                    tx_hash: string | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    duel_id: string
                    player1_address: string
                    player2_address: string
                    winner_address?: string | null
                    stake_amount: string
                    payout_amount?: string | null
                    player1_score?: number
                    player2_score?: number
                    player1_wpm?: number
                    player2_wpm?: number
                    settled_at?: string | null
                    tx_hash?: string | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    duel_id?: string
                    player1_address?: string
                    player2_address?: string
                    winner_address?: string | null
                    stake_amount?: string
                    payout_amount?: string | null
                    player1_score?: number
                    player2_score?: number
                    player1_wpm?: number
                    player2_wpm?: number
                    settled_at?: string | null
                    tx_hash?: string | null
                    created_at?: string
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
            duel_results: {
                Row: {
                    id: string
                    duel_id: string
                    player_address: string
                    score: number
                    wpm: number
                    misses: number
                    typos: number
                    submitted_at: string
                    created_at: string
                }
                Insert: {
                    id?: string
                    duel_id: string
                    player_address: string
                    score?: number
                    wpm?: number
                    misses?: number
                    typos?: number
                    submitted_at?: string
                    created_at?: string
                }
                Update: {
                    id?: string
                    duel_id?: string
                    player_address?: string
                    score?: number
                    wpm?: number
                    misses?: number
                    typos?: number
                    submitted_at?: string
                    created_at?: string
                }
            }
        }
    }
}
