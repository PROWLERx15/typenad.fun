// Lightweight tier thresholds and helper to compute a player's Aura tier.
// Keep values simple and easy to tune.
export const AURA_TIERS = [
  { name: 'Cadet',    minPoints: 0,    minWpm: 0,  color: '#FF7A59' },
  { name: 'Space',    minPoints: 2000, minWpm: 25, color: '#FFA94D' },
  { name: 'Galactic', minPoints: 8000, minWpm: 40, color: '#FF3B88' },
];

export type AuraTier = (typeof AURA_TIERS)[number];

// Return the highest tier the player qualifies for based on points and wpm.
export function computeAuraTier(points: number, wpm: number): AuraTier {
  let tier = AURA_TIERS[0];
  for (const t of AURA_TIERS) {
    if (points >= t.minPoints && wpm >= t.minWpm) {
      tier = t;
    }
  }
  return tier;
}
