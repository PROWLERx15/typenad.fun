# TypeDuel Pro Complete Theme Specification

> A pixel-perfect specification for transforming DeadKeys into TypeDuel Pro

---

## Table of Contents
1. [Brand Identity](#1-brand-identity)
2. [Color System](#2-color-system)
3. [Typography](#3-typography)
4. [Asset Specifications](#4-asset-specifications)
5. [File-by-File Code Changes](#5-file-by-file-code-changes)
6. [Text Content Updates](#6-text-content-updates)
7. [Implementation Checklist](#7-implementation-checklist)

---

## 1. Brand Identity

### Game Name
| Current | New |
|---------|-----|
| **TypeMonad** | **TypeDuel Pro** |

### Tagline
| Current | New |
|---------|-----|
| "The Microchain Zombie Apocalypse Starts Now" | "The Ultimate Typing Arena" |

### Tone
| Current | New |
|---------|-----|
| Horror, survival, spooky | Competitive, fast-paced, esports |

### Currency
| Current | New |
|---------|-----|
| Gold / Gold Coins | $DUEL Tokens |

---

## 2. Color System

### Primary Palette

```css
/* === OLD COLORS (TO REPLACE) === */
--old-primary: #FFD700;           /* Gold */
--old-secondary: #FFCC00;         /* Bright gold */
--old-orange: #FFA500;            /* Orange */
--old-base-dark: #1a1a1a;         /* Dark gray */
--old-danger: #FF6B6B;            /* Coral red */

/* === NEW COLORS (REPLACEMENT) === */
--new-primary: #00F5FF;           /* Cyber Cyan */
--new-secondary: #FF00FF;         /* Neon Magenta */
--new-tertiary: #9D00FF;          /* Electric Purple */
--new-base-dark: #0a0a1a;         /* Deep Space */
--new-success: #39FF14;           /* Neon Green */
--new-danger: #FF3131;            /* Hot Red */
--new-gray: #8888aa;              /* Purple-tinted Gray */
```

### Complete Color Mapping

| Usage | Old Value | New Value |
|-------|-----------|-----------|
| Primary text/buttons | `#FFD700` | `#00F5FF` |
| Primary rgba(0.5) | `rgba(255,215,0,0.5)` | `rgba(0,245,255,0.5)` |
| Primary rgba(0.3) | `rgba(255,215,0,0.3)` | `rgba(0,245,255,0.3)` |
| Primary rgba(0.2) | `rgba(255,215,0,0.2)` | `rgba(0,245,255,0.2)` |
| Primary rgba(0.1) | `rgba(255,215,0,0.1)` | `rgba(0,245,255,0.1)` |
| Secondary accent | `#FFA500` | `#FF00FF` |
| Headings | `#ffcc00` | `#00F5FF` |
| Body background | `#1a1a1a` | `#0a0a1a` |
| Game area border | `#ffcc00` | `#00F5FF` |
| Game area bg | `#333333` | `#0f0f2a` |
| Success/Win | `#4CAF50` | `#39FF14` |
| Error/Danger | `#FF6B6B` | `#FF3131` |
| PVP label | `#FF6B6B` | `#FF00FF` |
| Survival mode | `#FF6B35` | `#FF00FF` |
| Gray text | `#888` / `#aaa` | `#8888aa` |

### Gradient Definitions

```css
/* New background gradients */
.arena-gradient {
  background: linear-gradient(135deg, #0a0a1a 0%, #1a0030 50%, #0a0a1a 100%);
}

/* Neon border gradient */
.neon-border {
  border: 2px solid transparent;
  background: linear-gradient(#0a0a1a, #0a0a1a) padding-box,
              linear-gradient(135deg, #00F5FF, #FF00FF, #9D00FF) border-box;
}

/* Button hover glow */
.btn-hover-glow:hover {
  box-shadow: 0 0 20px rgba(0, 245, 255, 0.5),
              0 0 40px rgba(255, 0, 255, 0.3);
}

/* Victory/highlight glow */
.victory-glow {
  box-shadow: 0 0 30px rgba(0, 245, 255, 0.6),
              0 0 60px rgba(0, 245, 255, 0.3);
}
```

### Text Shadow Updates

```css
/* OLD text shadow */
text-shadow: 2px 4px 8px #000, 0 2px 0 #222;

/* NEW neon glow */
text-shadow: 0 0 10px rgba(0, 245, 255, 0.8),
             0 0 20px rgba(0, 245, 255, 0.5),
             0 0 40px rgba(0, 245, 255, 0.3);

/* Title mega glow (was gold glow) */
text-shadow: 0 0 20px rgba(0, 245, 255, 0.6),
             0 0 40px rgba(0, 245, 255, 0.4),
             0 0 80px rgba(255, 0, 255, 0.3);
```

---

## 3. Typography

### Font Stack (NO CHANGE)
```css
font-family: 'Press Start 2P', monospace;
```

The pixel font stays - it fits both themes perfectly.

### Font Import (NO CHANGE)
```css
@import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');
```

---

## 4. Asset Specifications

### 4.1 Backgrounds

| # | Filename | Dimensions | AI Generation Prompt |
|---|----------|------------|---------------------|
| 1 | [startscreen.png](file:///home/raj/Documents/CODING/Hackathon/LMN_Hacks/Zombie_type/deadkeys/frontend/public/images/startscreen.png) | 2560x1440 | "Futuristic cyber esports arena lobby, dark purple #1a0030 and cyan #00F5FF neon lights, holographic leaderboard displays floating in air, digital grid floor with glowing lines, central floating holographic keyboard, particle effects, pixel art retro game style, high detail" |
| 2 | [background.png](file:///home/raj/Documents/CODING/Hackathon/LMN_Hacks/Zombie_type/deadkeys/frontend/public/images/background.png) | 1920x1080 | "Digital cyber arena battlefield, glowing cyan grid floor lines, deep purple nebula sky, floating data particles and code fragments, pixel art game background, seamless" |
| 3 | [background-2.png](file:///home/raj/Documents/CODING/Hackathon/LMN_Hacks/Zombie_type/deadkeys/frontend/public/images/background-2.png) | 1920x1080 | "Data center arena interior, server racks with cyan and magenta neon lights, binary code rain falling, purple ambient glow, pixel art game background" |
| 4 | [background-4.png](file:///home/raj/Documents/CODING/Hackathon/LMN_Hacks/Zombie_type/deadkeys/frontend/public/images/background-4.png) | 1920x1080 | "Matrix-style digital void, green and cyan code rain streams, cyber grid extending to horizon, neon wireframe structures, pixel art" |
| 5 | [background-5.png](file:///home/raj/Documents/CODING/Hackathon/LMN_Hacks/Zombie_type/deadkeys/frontend/public/images/background-5.png) | 1920x1080 | "Cyberpunk neon cityscape at night, rooftop arena view, pink and cyan holographic billboards, night sky with data aurora, pixel art" |
| 6 | [background-7.png](file:///home/raj/Documents/CODING/Hackathon/LMN_Hacks/Zombie_type/deadkeys/frontend/public/images/background-7.png) | 1920x1080 | "Massive cyber stadium interior, holographic crowd silhouettes, neon purple spotlights, floating screens showing stats, pixel art esports arena" |
| 7 | [background-8.png](file:///home/raj/Documents/CODING/Hackathon/LMN_Hacks/Zombie_type/deadkeys/frontend/public/images/background-8.png) | 1920x1080 | "Final boss arena, giant holographic AI face looming, red warning lights pulsing, cyber throne platform, intense dramatic atmosphere, pixel art" |
| 8 | [gameover.png](file:///home/raj/Documents/CODING/Hackathon/LMN_Hacks/Zombie_type/deadkeys/frontend/public/images/gameover.png) | 1920x1080 | "Game results screen, 'DUEL COMPLETE' holographic text, winner podium with neon glow, stats display panels, purple and cyan theme, pixel art" |
| 9 | [wall.png](file:///home/raj/Documents/CODING/Hackathon/LMN_Hacks/Zombie_type/deadkeys/frontend/public/images/wall.png) | 512x200 | "Digital force field barrier, translucent energy wall with hex pattern, cyan neon glow edges, pixel art, seamless horizontal tile" |

### 4.2 Enemy Sprites (1024x1024, 3x2 grid = 6 frames)

| # | Filename | AI Generation Prompt |
|---|----------|---------------------|
| 1 | [zombie.png](file:///home/raj/Documents/CODING/Hackathon/LMN_Hacks/Zombie_type/deadkeys/frontend/public/images/zombie.png) | "Pixel art sprite sheet, 3 columns 2 rows grid, 6 animation frames, floating digital word block entity, glowing cyan edges, holographic text display surface, subtle hover animation, dark background transparent" |
| 2 | [mummy.png](file:///home/raj/Documents/CODING/Hackathon/LMN_Hacks/Zombie_type/deadkeys/frontend/public/images/mummy.png) | "Pixel art sprite sheet 3x2 grid, corrupted data entity made of glitchy pixels, magenta and purple static effects, fragmented code appearance, 6 frames floating animation" |
| 3 | [bat.png](file:///home/raj/Documents/CODING/Hackathon/LMN_Hacks/Zombie_type/deadkeys/frontend/public/images/bat.png) | "Pixel art sprite sheet 3x2 grid, fast-moving data byte orb, small glowing cyan sphere with trailing particle effects, 6 frames flying animation" |
| 4 | [deathrider.png](file:///home/raj/Documents/CODING/Hackathon/LMN_Hacks/Zombie_type/deadkeys/frontend/public/images/deathrider.png) | "Pixel art sprite sheet 3x2 grid, towering firewall boss guardian, red barrier shield effects, intimidating digital face, large imposing figure, 6 frames" |
| 5 | [frankenstein.png](file:///home/raj/Documents/CODING/Hackathon/LMN_Hacks/Zombie_type/deadkeys/frontend/public/images/frankenstein.png) | "Pixel art sprite sheet 3x2 grid, large virus titan monster, corrupted code body, purple glitch distortion effects, menacing appearance, 6 frames" |
| 6 | [werewolf.png](file:///home/raj/Documents/CODING/Hackathon/LMN_Hacks/Zombie_type/deadkeys/frontend/public/images/werewolf.png) | "Pixel art sprite sheet 3x2 grid, aggressive crypto beast, wolf form made of blockchain code, cyan and purple energy, 6 frames attack animation" |
| 7 | [dracula.png](file:///home/raj/Documents/CODING/Hackathon/LMN_Hacks/Zombie_type/deadkeys/frontend/public/images/dracula.png) | "Pixel art sprite sheet 3x2 grid, elegant AI overlord entity, digital cape flowing with data, glowing red eyes, sophisticated cyber vampire, 6 frames" |
| 8 | [bomb.png](file:///home/raj/Documents/CODING/Hackathon/LMN_Hacks/Zombie_type/deadkeys/frontend/public/images/bomb.png) | "Pixel art sprite sheet 3x2 grid, spherical logic bomb, digital countdown timer display, red warning glow, circuit board patterns, 6 frames pulsing" |
| 9 | [skeleton.png](file:///home/raj/Documents/CODING/Hackathon/LMN_Hacks/Zombie_type/deadkeys/frontend/public/images/skeleton.png) | "Pixel art sprite sheet 3x2 grid, terminated process skeleton, bones made of fading code, dissolving pixels effect, ghostly, 6 frames" |

### 4.3 Hero Sprites

| # | Filename | Dimensions | AI Generation Prompt |
|---|----------|------------|---------------------|
| 1 | [hero-1.png](file:///home/raj/Documents/CODING/Hackathon/LMN_Hacks/Zombie_type/deadkeys/frontend/public/images/hero-1.png) | 512x512 | "Pixel art cyber typing champion character, male, neon visor helmet, holographic keyboard projected from hands, purple and cyan bodysuit, confident stance" |
| 2 | [hero-1-sprite.png](file:///home/raj/Documents/CODING/Hackathon/LMN_Hacks/Zombie_type/deadkeys/frontend/public/images/hero-1-sprite.png) | 512x256 | "Pixel art sprite sheet, cyber champion intense typing animation, 4 frames horizontal, neon trails from fingertips, action poses" |
| 3 | [hero-2.png](file:///home/raj/Documents/CODING/Hackathon/LMN_Hacks/Zombie_type/deadkeys/frontend/public/images/hero-2.png) | 512x512 | "Pixel art female cyber typing champion, pink neon accent highlights, data gloves with glowing fingertips, fierce determined expression" |
| 4 | [hero-2-sprite.png](file:///home/raj/Documents/CODING/Hackathon/LMN_Hacks/Zombie_type/deadkeys/frontend/public/images/hero-2-sprite.png) | 512x256 | "Pixel art sprite sheet, female champion typing animation, 4 frames, energy bursts from fingers, dynamic poses" |

### 4.4 UI Icons (128x128 unless noted)

| # | Filename | AI Generation Prompt |
|---|----------|---------------------|
| 1 | [deadkeys-logo.png](file:///home/raj/Documents/CODING/Hackathon/LMN_Hacks/Zombie_type/deadkeys/frontend/public/images/deadkeys-logo.png) (512x512) | "TypeDuel Pro logo, stylized cyber font, integrated keyboard icon, purple to cyan gradient glow, pixel art, clean edges" |
| 2 | [heart.png](file:///home/raj/Documents/CODING/Hackathon/LMN_Hacks/Zombie_type/deadkeys/frontend/public/images/heart.png) | "Digital energy shield icon, glowing cyan battery or health bar, pixel art, neon glow effect" |
| 3 | [gold-coin.png](file:///home/raj/Documents/CODING/Hackathon/LMN_Hacks/Zombie_type/deadkeys/frontend/public/images/gold-coin.png) | "$DUEL token cryptocurrency icon, hexagonal coin shape, holographic rainbow shine, purple and cyan colors, pixel art" |
| 4 | [leaderboard.png](file:///home/raj/Documents/CODING/Hackathon/LMN_Hacks/Zombie_type/deadkeys/frontend/public/images/leaderboard.png) | "Cyber rankings trophy icon, holographic with data crown, neon cyan glow, pixel art" |
| 5 | [shop.png](file:///home/raj/Documents/CODING/Hackathon/LMN_Hacks/Zombie_type/deadkeys/frontend/public/images/shop.png) | "Digital power-up shop icon, cyber storefront with neon sign, pixel art" |
| 6 | [crypt.png](file:///home/raj/Documents/CODING/Hackathon/LMN_Hacks/Zombie_type/deadkeys/frontend/public/images/crypt.png) | "Player profile hub icon, holographic ID card with avatar, stats display, pixel art" |
| 7 | [settings.png](file:///home/raj/Documents/CODING/Hackathon/LMN_Hacks/Zombie_type/deadkeys/frontend/public/images/settings.png) | "Cyber settings cog icon, holographic gear with circuit patterns, pixel art" |
| 8 | [double-points.png](file:///home/raj/Documents/CODING/Hackathon/LMN_Hacks/Zombie_type/deadkeys/frontend/public/images/double-points.png) | "2X boost multiplier icon, neon '2X' text with energy ring, cyan glow, pixel art" |
| 9 | [triple-points.png](file:///home/raj/Documents/CODING/Hackathon/LMN_Hacks/Zombie_type/deadkeys/frontend/public/images/triple-points.png) | "3X boost multiplier icon, neon '3X' with lightning bolts, magenta glow, pixel art" |
| 10 | [slow-enemies.png](file:///home/raj/Documents/CODING/Hackathon/LMN_Hacks/Zombie_type/deadkeys/frontend/public/images/slow-enemies.png) | "Time slow power-up icon, hourglass with frozen particles, cyan ice crystals, pixel art" |
| 11 | [canons.png](file:///home/raj/Documents/CODING/Hackathon/LMN_Hacks/Zombie_type/deadkeys/frontend/public/images/canons.png) (1920x300) | "Holographic typing station, floating keyboard interface, cyan energy field barrier, pixel art, wide panoramic" |

### 4.5 Wave Banners (800x400)

| # | Filename | Title Text | AI Generation Prompt |
|---|----------|------------|---------------------|
| 1 | [wave_1.png](file:///home/raj/Documents/CODING/Hackathon/LMN_Hacks/Zombie_type/deadkeys/frontend/public/images/wave_1.png) | "ROUND 1: INITIALIZE" | "Cyber round banner, 'INITIALIZE' text, system startup sequence visuals, green loading bars, digital boot screen, pixel art" |
| 2 | [wave_2.png](file:///home/raj/Documents/CODING/Hackathon/LMN_Hacks/Zombie_type/deadkeys/frontend/public/images/wave_2.png) | "ROUND 2: DATA SURGE" | "Cyber round banner, 'DATA SURGE' text, increasing data streams, orange warning indicators, pixel art" |
| 3 | [wave_3.png](file:///home/raj/Documents/CODING/Hackathon/LMN_Hacks/Zombie_type/deadkeys/frontend/public/images/wave_3.png) | "SURVIVAL: ENDURANCE" | "Survival mode banner, 'ENDURANCE TEST' text, timer hologram, red intensity warning, pixel art" |
| 4 | [wave_4.png](file:///home/raj/Documents/CODING/Hackathon/LMN_Hacks/Zombie_type/deadkeys/frontend/public/images/wave_4.png) | "ROUND 4: VIRUS" | "Cyber round banner, 'VIRUS OUTBREAK' text, corrupted glitch visuals, purple distortion, pixel art" |
| 5 | [wave_5.png](file:///home/raj/Documents/CODING/Hackathon/LMN_Hacks/Zombie_type/deadkeys/frontend/public/images/wave_5.png) | "ROUND 5: BREACH" | "Cyber round banner, 'SYSTEM BREACH' text, alarm lights, high stakes atmosphere, pixel art" |
| 6 | [wave_6.png](file:///home/raj/Documents/CODING/Hackathon/LMN_Hacks/Zombie_type/deadkeys/frontend/public/images/wave_6.png) | "SURVIVAL: CHAOS" | "Survival mode banner, 'CHAOS MODE' text, maximum intensity visuals, all colors, pixel art" |
| 7 | [wave_7.png](file:///home/raj/Documents/CODING/Hackathon/LMN_Hacks/Zombie_type/deadkeys/frontend/public/images/wave_7.png) | "ROUND 7: ASSAULT" | "Cyber round banner, 'NETWORK ASSAULT' text, global threat map, serious tone, pixel art" |
| 8 | [wave_8.png](file:///home/raj/Documents/CODING/Hackathon/LMN_Hacks/Zombie_type/deadkeys/frontend/public/images/wave_8.png) | "ROUND 8: BOSS" | "Cyber round banner, 'BOSS PROTOCOL' text, intimidating boss silhouette, red glow, pixel art" |
| 9 | [wave_9.png](file:///home/raj/Documents/CODING/Hackathon/LMN_Hacks/Zombie_type/deadkeys/frontend/public/images/wave_9.png) | "FINAL: SHOWDOWN" | "Final round banner, 'ULTIMATE SHOWDOWN' text, maximum drama, all effects, pixel art" |
| 10 | [wave_attack.png](file:///home/raj/Documents/CODING/Hackathon/LMN_Hacks/Zombie_type/deadkeys/frontend/public/images/wave_attack.png) | "SURVIVE THE SWARM" | "Survival mode generic banner, 'SURVIVE THE SWARM' text, endless wave visual, intense, pixel art" |

---

## 5. File-by-File Code Changes

### 5.1 [src/styles/theme.ts](file:///home/raj/Documents/CODING/Hackathon/LMN_Hacks/Zombie_type/deadkeys/frontend/src/styles/theme.ts)

```diff
 export const COLORS = {
-  primary: 'yellow',
-  secondary: '#FFD700',
+  primary: '#00F5FF',
+  secondary: '#FF00FF',
+  tertiary: '#9D00FF',
   silver: '#C0C0C0',
   bronze: '#CD7F32',
   white: '#fff',
-  black: '#000',
-  red: 'red',
-  cyan: 'cyan',
-  magenta: 'magenta',
-  gray: '#aaa',
-  darkGray: '#555',
+  black: '#0a0a1a',
+  red: '#FF3131',
+  gray: '#8888aa',
+  darkGray: '#2a2a4a',
   transparent: 'transparent',
-  success: '#4CAF50',
-  error: '#FF6B6B',
-  timerGood: 'lime',
-  timerWarning: 'yellow',
-  timerDanger: 'red',
+  success: '#39FF14',
+  error: '#FF3131',
+  timerGood: '#39FF14',
+  timerWarning: '#00F5FF',
+  timerDanger: '#FF3131',
 };

 export const BUTTON_STYLES = {
   base: {
     fontFamily: FONTS.primary,
     fontSize: '20px',
     color: COLORS.primary,
     background: COLORS.transparent,
-    border: `2px solid ${COLORS.primary}`,
+    border: '2px solid #00F5FF',
     // ...
   },
   // Update all button variants similarly
 };
```

### 5.2 [src/styles/App.css](file:///home/raj/Documents/CODING/Hackathon/LMN_Hacks/Zombie_type/deadkeys/frontend/src/styles/App.css)

```diff
 body {
     font-family: 'Courier New', Courier, monospace;
-    background-color: #1a1a1a;
+    background-color: #0a0a1a;
     color: #ffffff;
     margin: 0;
     padding: 0;
 }

 h1, h2, h3 {
     text-align: center;
-    color: #ffcc00;
+    color: #00F5FF;
 }

 .game-area {
     width: 80%;
     height: 60vh;
-    border: 2px solid #ffcc00;
-    background-color: #333333;
+    border: 2px solid #00F5FF;
+    background-color: #0f0f2a;
     position: relative;
     overflow: hidden;
 }

 .button {
-    background-color: #ffcc00;
-    color: #1a1a1a;
+    background-color: #00F5FF;
+    color: #0a0a1a;
 }

 .button:hover {
-    background-color: #e6b800;
+    background-color: #00d4dd;
 }
```

### 5.3 [src/components/UI/StartScreen.module.css](file:///home/raj/Documents/CODING/Hackathon/LMN_Hacks/Zombie_type/deadkeys/frontend/src/components/UI/StartScreen.module.css)

Find and replace all instances:
- `#ffd700` → `#00F5FF`
- `rgba(255, 215, 0` → `rgba(0, 245, 255`
- `#ff9800` → `#FF00FF` (warning text)

### 5.4 [src/components/UI/StartScreen.tsx](file:///home/raj/Documents/CODING/Hackathon/LMN_Hacks/Zombie_type/deadkeys/frontend/src/components/UI/StartScreen.tsx)

```diff
- <h1 className={styles.title}>DeadKeys</h1>
+ <h1 className={styles.title}>TypeDuel Pro</h1>

- <p className={styles.welcomeText}>
-     The Microchain Zombie Apocalypse Starts Now.
- </p>
+ <p className={styles.welcomeText}>
+     The Ultimate Typing Arena Awaits.
+ </p>
```

### 5.5 [src/components/Game/hooks/useWaveSystem.ts](file:///home/raj/Documents/CODING/Hackathon/LMN_Hacks/Zombie_type/deadkeys/frontend/src/components/Game/hooks/useWaveSystem.ts)

Update wave config names:
```typescript
const WAVE_DATA = {
    1: {
-       title: "The Graveyard Awakens",
-       description: "The dead stir from their rest. Type to survive the night."
+       title: "System Initialize",
+       description: "Boot sequence initiated. Type to engage."
    },
    2: {
-       title: "Curse of the Ancients",
-       description: "Ancient tombs crack open. The mummies join the hunt."
+       title: "Data Surge",
+       description: "Incoming data flood. Process to survive."
    },
    3: {
-       title: "Survival Mode",
-       description: "Survive the endless horde for 45 seconds."
+       title: "Endurance Test",
+       description: "Survive the data storm for 45 seconds."
    },
    // ... continue for all 9 waves
};
```

### 5.6 All [.styles.ts](file:///home/raj/Documents/CODING/Hackathon/LMN_Hacks/Zombie_type/deadkeys/frontend/src/components/UI/Quest.styles.ts) Files

Global find/replace across all style files:
```
#FFD700 → #00F5FF
#ffd700 → #00F5FF
#FFCC00 → #00F5FF
#ffcc00 → #00F5FF
#FFA500 → #FF00FF
#ffa500 → #FF00FF
rgba(255, 215, 0 → rgba(0, 245, 255
rgba(255,215,0 → rgba(0,245,255
#FF6B6B → #FF3131
#ff6b6b → #FF3131
#FF6B35 → #FF00FF
#1a1a1a → #0a0a1a
#333333 → #0f0f2a
```

---

## 6. Text Content Updates

### UI Labels

| Location | Old Text | New Text |
|----------|----------|----------|
| Title | DeadKeys | TypeDuel Pro |
| Tagline | Microchain Zombie Apocalypse | Ultimate Typing Arena |
| Shop header | Shop | Power Shop |
| Currency label | Gold | $DUEL |
| Crypt header | The Crypt | Player Hub |
| Wave 1 title | The Graveyard Awakens | System Initialize |
| Wave 2 title | Curse of the Ancients | Data Surge |
| Wave 3 title | Survival Mode | Endurance Test |
| Wave 4 title | Monster's Awakening | Virus Outbreak |
| Wave 5 title | Moonlight Terror | System Breach |
| Wave 6 title | Survival Mode | Chaos Mode |
| Wave 7 title | Death's Cavalry | Network Assault |
| Wave 8 title | Lord of Darkness | Boss Protocol |
| Wave 9 title | Time Attack | Ultimate Showdown |
| Enemy types | Zombie Slayer | Block Crusher |
| Enemy types | Mummy Hunter | Glitch Terminator |
| Enemy types | Bat Destroyer | Byte Blaster |

### Quest Names Update

| Old | New |
|-----|-----|
| First Blood | First Process |
| Zombie Slayer | Block Crusher |
| Bat Swatter | Byte Blaster |
| Wave Crusher | Round Master |
| Undead Army | Data Army |

---

## 7. Implementation Checklist

### Phase 1: Preparation
- [ ] Create backup of current `/public/images/` folder
- [ ] Export list of all image filenames for reference
- [ ] Set up AI image generation tool (Midjourney/DALL-E)

### Phase 2: Color Updates
- [ ] Update [src/styles/theme.ts](file:///home/raj/Documents/CODING/Hackathon/LMN_Hacks/Zombie_type/deadkeys/frontend/src/styles/theme.ts) with new colors
- [ ] Update [src/styles/App.css](file:///home/raj/Documents/CODING/Hackathon/LMN_Hacks/Zombie_type/deadkeys/frontend/src/styles/App.css) with new colors
- [ ] Update [src/components/UI/StartScreen.module.css](file:///home/raj/Documents/CODING/Hackathon/LMN_Hacks/Zombie_type/deadkeys/frontend/src/components/UI/StartScreen.module.css)
- [ ] Update [src/components/UI/PVPModeScreen.module.css](file:///home/raj/Documents/CODING/Hackathon/LMN_Hacks/Zombie_type/deadkeys/frontend/src/components/UI/PVPModeScreen.module.css)
- [ ] Update [src/components/UI/SettingsScreen.module.css](file:///home/raj/Documents/CODING/Hackathon/LMN_Hacks/Zombie_type/deadkeys/frontend/src/components/UI/SettingsScreen.module.css)
- [ ] Update [src/components/UI/OnboardingScreen.module.css](file:///home/raj/Documents/CODING/Hackathon/LMN_Hacks/Zombie_type/deadkeys/frontend/src/components/UI/OnboardingScreen.module.css)
- [ ] Update [src/components/UI/SoloModeScreen.module.css](file:///home/raj/Documents/CODING/Hackathon/LMN_Hacks/Zombie_type/deadkeys/frontend/src/components/UI/SoloModeScreen.module.css)
- [ ] Update [src/components/UI/MultiplayerModeScreen.module.css](file:///home/raj/Documents/CODING/Hackathon/LMN_Hacks/Zombie_type/deadkeys/frontend/src/components/UI/MultiplayerModeScreen.module.css)
- [ ] Update [src/components/GameStateManager.styles.ts](file:///home/raj/Documents/CODING/Hackathon/LMN_Hacks/Zombie_type/deadkeys/frontend/src/components/GameStateManager.styles.ts)
- [ ] Update [src/components/Game/GameCanvas.styles.ts](file:///home/raj/Documents/CODING/Hackathon/LMN_Hacks/Zombie_type/deadkeys/frontend/src/components/Game/GameCanvas.styles.ts)
- [ ] Update [src/components/Game/Zombie.styles.ts](file:///home/raj/Documents/CODING/Hackathon/LMN_Hacks/Zombie_type/deadkeys/frontend/src/components/Game/Zombie.styles.ts)
- [ ] Update [src/components/UI/ShopScreen.styles.ts](file:///home/raj/Documents/CODING/Hackathon/LMN_Hacks/Zombie_type/deadkeys/frontend/src/components/UI/ShopScreen.styles.ts)
- [ ] Update [src/components/UI/CryptScreen.styles.ts](file:///home/raj/Documents/CODING/Hackathon/LMN_Hacks/Zombie_type/deadkeys/frontend/src/components/UI/CryptScreen.styles.ts)
- [ ] Update [src/components/UI/Leaderboard.styles.ts](file:///home/raj/Documents/CODING/Hackathon/LMN_Hacks/Zombie_type/deadkeys/frontend/src/components/UI/Leaderboard.styles.ts)
- [ ] Update [src/components/UI/WavePreparing.styles.ts](file:///home/raj/Documents/CODING/Hackathon/LMN_Hacks/Zombie_type/deadkeys/frontend/src/components/UI/WavePreparing.styles.ts)
- [ ] Update [src/components/UI/WaveComplete.styles.ts](file:///home/raj/Documents/CODING/Hackathon/LMN_Hacks/Zombie_type/deadkeys/frontend/src/components/UI/WaveComplete.styles.ts)
- [ ] Update [src/components/UI/WaveVictory.styles.ts](file:///home/raj/Documents/CODING/Hackathon/LMN_Hacks/Zombie_type/deadkeys/frontend/src/components/UI/WaveVictory.styles.ts)
- [ ] Update [src/components/UI/ShareableRankCard.styles.ts](file:///home/raj/Documents/CODING/Hackathon/LMN_Hacks/Zombie_type/deadkeys/frontend/src/components/UI/ShareableRankCard.styles.ts)
- [ ] Update [src/components/UI/Quest.styles.ts](file:///home/raj/Documents/CODING/Hackathon/LMN_Hacks/Zombie_type/deadkeys/frontend/src/components/UI/Quest.styles.ts)

### Phase 3: Text Updates
- [ ] Update title in [StartScreen.tsx](file:///home/raj/Documents/CODING/Hackathon/LMN_Hacks/Zombie_type/deadkeys/frontend/src/components/UI/StartScreen.tsx)
- [ ] Update tagline in [StartScreen.tsx](file:///home/raj/Documents/CODING/Hackathon/LMN_Hacks/Zombie_type/deadkeys/frontend/src/components/UI/StartScreen.tsx)
- [ ] Update wave names in [WavePreparing.tsx](file:///home/raj/Documents/CODING/Hackathon/LMN_Hacks/Zombie_type/deadkeys/frontend/src/components/UI/WavePreparing.tsx)
- [ ] Update shop labels in [ShopScreen.tsx](file:///home/raj/Documents/CODING/Hackathon/LMN_Hacks/Zombie_type/deadkeys/frontend/src/components/UI/ShopScreen.tsx)
- [ ] Update crypt labels in [CryptScreen.tsx](file:///home/raj/Documents/CODING/Hackathon/LMN_Hacks/Zombie_type/deadkeys/frontend/src/components/UI/CryptScreen.tsx)
- [ ] Update quest names in [constants/quests.ts](file:///home/raj/Documents/CODING/Hackathon/LMN_Hacks/Zombie_type/deadkeys/frontend/src/constants/quests.ts)
- [ ] Update enemy type names in `constants/enemyTypes.ts`

### Phase 4: Asset Generation
- [ ] Generate 9 background images
- [ ] Generate 9 enemy sprite sheets
- [ ] Generate 4 hero sprites
- [ ] Generate 11 UI icons
- [ ] Generate 10 wave banners
- [ ] Verify all dimensions match originals
- [ ] Replace files in `/public/images/`

### Phase 5: Testing
- [ ] Run `npm run dev`
- [ ] Test StartScreen appearance
- [ ] Test gameplay colors and visuals
- [ ] Test all modals (Shop, Crypt, Settings)
- [ ] Test wave transitions
- [ ] Test game over screen
- [ ] Test PVP mode appearance
- [ ] Verify all functionality works
- [ ] Mobile responsiveness check

### Phase 6: Finalization
- [ ] Build production: `npm run build`
- [ ] Test production build
- [ ] Document any issues found
- [ ] Create before/after screenshots

---

## Quick Reference: Search & Replace Commands

Run these in your code editor (VS Code) with Ctrl+Shift+H:

```
Search: #FFD700
Replace: #00F5FF
Files: *.ts, *.tsx, *.css

Search: #ffd700
Replace: #00F5FF
Files: *.ts, *.tsx, *.css

Search: rgba(255, 215, 0
Replace: rgba(0, 245, 255
Files: *.ts, *.tsx, *.css

Search: rgba(255,215,0
Replace: rgba(0,245,255
Files: *.ts, *.tsx, *.css

Search: #FFA500
Replace: #FF00FF
Files: *.ts, *.tsx, *.css

Search: #FF6B6B
Replace: #FF3131
Files: *.ts, *.tsx, *.css

Search: #1a1a1a
Replace: #0a0a1a
Files: *.ts, *.tsx, *.css

Search: yellow
Replace: #00F5FF
Files: theme.ts (CAREFUL - only in COLORS object)
```

---

*Document Version: 1.0 | Created for DeadKeys → TypeDuel Pro transformation*
