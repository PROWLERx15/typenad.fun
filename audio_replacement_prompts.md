# TypeMonad Audio Replacement Plan: Spaced Theme

This document outlines the strategy for replacing the existing zombie-themed audio assets with a premium, cinematic "Spaced Theme". All audio should fit a **Dark, Heavy, Cinematic, Retro-Futuristic** aesthetic.

## 1. Background Music (BGM)

### [start.mp3](file:///home/raj/Documents/CODING/Hackathon/LMN_Hacks/Zombie_type/typemonad/frontend/public/sounds/start.mp3)
*   **Current Usage:** Start Screen / Menu / Intro.
*   **New Concept:** "The Void Awaits". A mysterious, atmospheric track that sets a dark sci-fi tone. Not too aggressive, but ominous.
*   **Audio Description:** Deep oscillating synth drones, intermittent crushed bit-crushed bleeps like a distress signal, and a slow, swelling cinematic pad.
*   **Generation Prompt:**
    > Cinematic sci-fi menu music, deep space atmosphere, dark ambient, analog synth pads, slow tempo, ominous drone, subtle glitch artifacts, high production value, Hans Zimmer style space soundscape, 1-minute loopable.

### [game-1.mp3](file:///home/raj/Documents/CODING/Hackathon/LMN_Hacks/Zombie_type/typemonad/frontend/public/sounds/game-1.mp3)
*   **Current Usage:** Main Gameplay Loop (Standard intensity).
*   **New Concept:** "Nebula Run". Driving, rhythmic, focused. Keeps the player in the "flow state" for typing.
*   **Audio Description:** Arpeggiated basslines (Synthwave/Outrun style but darker), consistent electronic kick drum, expansive reverb-heavy leads that don't distract.
*   **Generation Prompt:**
    > Dark synthwave gameplay music, driving steady beat, 120 BPM, deep analog bass arpeggio, retro-futuristic, neon noir atmosphere, electronic, focus music for gaming, seamless loop, crisp production.

### [game-2.mp3](file:///home/raj/Documents/CODING/Hackathon/LMN_Hacks/Zombie_type/typemonad/frontend/public/sounds/game-2.mp3)
*   **Current Usage:** Main Gameplay Loop (Higher intensity / Danger).
*   **New Concept:** "Event Horizon". Urgent, chaotic, faster.
*   **Audio Description:** Faster tempo, introduction of breakbeats or industrial percussion, rising synth Shepard tones to create tension.
*   **Generation Prompt:**
    > Intense industrial sci-fi action music, high tempo, urgent cyberpunk atmosphere, heavy distorted bass, aggressive electronic percussion, tension rising, boss fight style, cinematic production, loopable.

### [end.mp3](file:///home/raj/Documents/CODING/Hackathon/LMN_Hacks/Zombie_type/typemonad/frontend/public/sounds/end.mp3)
*   **Current Usage:** Game Over.
*   **New Concept:** "Signal Lost". The feeling of drifting into space after a mission failure (or success).
*   **Audio Description:** A sudden drop in energy. A slowing down "tape stop" effect followed by a melancholic, lonely synth melody fading into silence.
*   **Generation Prompt:**
    > Sci-fi game over sound, cinematic swell to silence, melancholic synth pad fade out, tape stop effect, mission failed soundscape, dark ambient ending, dramatic resolution.

---

## 2. Player Sound Effects (SFX)

### [gunshot.mp3](file:///home/raj/Documents/CODING/Hackathon/LMN_Hacks/Zombie_type/typemonad/frontend/public/sounds/gunshot.mp3)
*   **Current Usage:** Typing a correct letter / Shooting the enemy.
*   **New Concept:** "Plasma Bolt".
*   **Audio Description:** Quick, snappy, high-frequency energy discharge. Not a realistic gun, but a digital projectile.
*   **Generation Prompt:**
    > Sci-fi laser shot, plasma blaster sound effect, short snappy pew, retro arcade laser, high quality, futuristic weapon fire, sharp transient.

### [explode.mp3](file:///home/raj/Documents/CODING/Hackathon/LMN_Hacks/Zombie_type/typemonad/frontend/public/sounds/explode.mp3)
*   **Current Usage:** Enemy destruction / Impact.
*   **New Concept:** "Matter Disintegration".
*   **Audio Description:** A bass-heavy impact followed by a crystallized "shattering" sound, as if the enemy is breaking into pixels or glass.
*   **Generation Prompt:**
    > Sci-fi explosion, digital disintegration sound, sub-bass impact with glass shattering texture, holographic destruction, glitchy explosion, heavy cinematic release.

---

## 3. Enemy Sound Effects (The "Invaders")

### [zomb-attack.mp3](file:///home/raj/Documents/CODING/Hackathon/LMN_Hacks/Zombie_type/typemonad/frontend/public/sounds/zomb-attack.mp3)
*   **Current Usage:** Enemy attacking the player/base.
*   **New Concept:** "Void Glitch". The sound of an anomaly tearing at the hull.
*   **Audio Description:** A harsh, digital screech combined with a static burst.
*   **Generation Prompt:**
    > Alien creature attack screech, digital static glitch, harsh cybernetic noise, aggressive sci-fi monster sound, sudden impact, scary mechanism.

### [zombie-die.mp3](file:///home/raj/Documents/CODING/Hackathon/LMN_Hacks/Zombie_type/typemonad/frontend/public/sounds/zombie-die.mp3) (Standard Enemy)
*   **Current Usage:** Standard enemy death.
*   **New Concept:** "Drone Down".
*   **Audio Description:** A robotic power-down sound, descending pitch "bwoop" with a metallic clank.
*   **Generation Prompt:**
    > Robot powering down sound, sci-fi droid death, pitch drop malfunction, metallic collision, short digital failure noise.

### [mummy-die.mp3](file:///home/raj/Documents/CODING/Hackathon/LMN_Hacks/Zombie_type/typemonad/frontend/public/sounds/mummy-die.mp3) (Special Enemy 1)
*   **Current Usage:** Special enemy death.
*   **New Concept:** "Energy Wraith Dissolve".
*   **Audio Description:** A wispy, airy "whoosh" combined with an electrical crackle.
*   **Generation Prompt:**
    > Energy being dissipating sound, magical sci-fi dissolve, electrical arc fading, ghost-like whisper, high frequency shimmering fade.

### [bat-die.mp3](file:///home/raj/Documents/CODING/Hackathon/LMN_Hacks/Zombie_type/typemonad/frontend/public/sounds/bat-die.mp3) (Flying Enemy)
*   **Current Usage:** Fast enemy death.
*   **New Concept:** "Sentry Malfunction".
*   **Audio Description:** High-pitched servo whir breaking down.
*   **Generation Prompt:**
    > Flying drone destruction, high pitched servo motor failure, cybernetic insect dying, zap sound affect, quick tech glitch.

### [bone-die.mp3](file:///home/raj/Documents/CODING/Hackathon/LMN_Hacks/Zombie_type/typemonad/frontend/public/sounds/bone-die.mp3) (Hard Enemy)
*   **Current Usage:** Tough enemy death.
*   **New Concept:** "Mech Hulk Collapse".
*   **Audio Description:** Heavy metallic crumbling, rocks crushing, deep thud.
*   **Generation Prompt:**
    > Heavy mech destruction, metal crunching sound, deep impact, robot explosion, massive structure collapsing, industrial sound effect.

### [horse-die.mp3](file:///home/raj/Documents/CODING/Hackathon/LMN_Hacks/Zombie_type/typemonad/frontend/public/sounds/horse-die.mp3) (Fast/Beast Enemy)
*   **Current Usage:** Beast death.
*   **New Concept:** "Cosmic Beast Howl".
*   **Audio Description:** A distorted, processed animal roar that cuts off abruptly.
*   **Generation Prompt:**
    > Alien beast dying roar, distorted creature sound, sci-fi monster vocalization, heavy reverb, sudden silence.

---

## 4. UI Sound Effects

### [mouse-over.mp3](file:///home/raj/Documents/CODING/Hackathon/LMN_Hacks/Zombie_type/typemonad/frontend/public/sounds/mouse-over.mp3)
*   **Current Usage:** Button Hover / UI Interaction.
*   **New Concept:** "Holo-Focus".
*   **Audio Description:** Very short, subtle clean sine wave blip. Modern and unintrusive.
*   **Generation Prompt:**
    > Sci-fi UI interface beep, holographic menu hover sound, subtle high-tech chirp, hud interaction, clean digital blip.
