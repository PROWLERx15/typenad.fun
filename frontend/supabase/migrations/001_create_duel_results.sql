-- Migration: Create duel_results table for PvP duel score tracking
-- This table stores individual player results for each duel session

CREATE TABLE IF NOT EXISTS duel_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    duel_id TEXT NOT NULL,
    player_address TEXT NOT NULL,
    score INTEGER NOT NULL DEFAULT 0,
    wpm INTEGER NOT NULL DEFAULT 0,
    misses INTEGER NOT NULL DEFAULT 0,
    typos INTEGER NOT NULL DEFAULT 0,
    submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Ensure each player can only submit once per duel
    UNIQUE(duel_id, player_address)
);

-- Index for faster lookups by duel_id
CREATE INDEX IF NOT EXISTS idx_duel_results_duel_id ON duel_results(duel_id);

-- Index for player history lookups
CREATE INDEX IF NOT EXISTS idx_duel_results_player_address ON duel_results(player_address);

-- Enable Row Level Security
ALTER TABLE duel_results ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read duel results (needed for opponent sync)
CREATE POLICY "Allow public read access to duel_results" 
    ON duel_results 
    FOR SELECT 
    USING (true);

-- Policy: Authenticated users can insert their own results
CREATE POLICY "Allow authenticated users to insert own duel results" 
    ON duel_results 
    FOR INSERT 
    WITH CHECK (true);

-- Policy: Users can update their own results (for retry scenarios)
CREATE POLICY "Allow users to update own duel results" 
    ON duel_results 
    FOR UPDATE 
    USING (true);

-- Enable realtime for this table
ALTER PUBLICATION supabase_realtime ADD TABLE duel_results;

-- Comments for documentation
COMMENT ON TABLE duel_results IS 'Stores individual player results for PvP duels';
COMMENT ON COLUMN duel_results.duel_id IS 'Unique identifier for the duel session (matches contract duelId)';
COMMENT ON COLUMN duel_results.player_address IS 'Wallet address of the player (lowercase)';
COMMENT ON COLUMN duel_results.score IS 'Final score achieved in the duel';
COMMENT ON COLUMN duel_results.wpm IS 'Words per minute achieved';
COMMENT ON COLUMN duel_results.misses IS 'Number of enemies that reached the bottom';
COMMENT ON COLUMN duel_results.typos IS 'Number of typing errors made';
COMMENT ON COLUMN duel_results.submitted_at IS 'When the result was submitted';
