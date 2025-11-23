# 🎨 VIVARIUM Creature Sprite Specifications

## Overview
We need sprite sheets for three creature species. Each sprite should be designed for a retro bio-lab aesthetic with glowing elements and clear silhouettes. The sprites will be displayed at small sizes (10-25 pixels) but should look good when scaled.

## General Requirements
- **Style**: Pixel art or clean vector style suitable for small sizes
- **Colors**: Vibrant, with slight glow/neon effect
- **Background**: Transparent (PNG format)
- **Views**: Top-down perspective (since creatures move in 2D space)
- **Size**: Approximately 64x64 pixels per frame (will be scaled down)

---

## Species 1: HERBIVORE 🟢

### Visual Concept
A gentle, round creature that looks peaceful and plant-like. Think of a mix between a turtle, a beetle, and a leaf.

### Color Palette
- Primary: `#4CAF50` (leaf green)
- Secondary: `#2ecc40` (bright green)
- Accent: `#81C784` (light green)
- Glow: Soft green bioluminescence

### Design Features
- Round, non-threatening body shape
- Large, curious eyes
- Plant-like features (leaf patterns, vines, or moss)
- Small legs or appendages for movement
- Defensive shell or carapace
- Slightly translucent or glowing edges

### Animation States Needed
1. **Idle**: Gentle breathing or swaying motion
2. **Walking**: Slow, steady movement (4 frames)
3. **Eating**: Nibbling on plants (2-3 frames)
4. **Fleeing**: Faster movement, eyes wide (4 frames)
5. **Sleeping**: Curled up, dimmer glow (1 frame)

### Personality
Should look: Curious, gentle, peaceful, herbaceous

---

## Species 2: CARNIVORE 🔴

### Visual Concept
A sleek, predatory creature. Sharp angles, focused eyes, built for speed and hunting. Like a mix between a lizard, a cat, and an insect predator.

### Color Palette
- Primary: `#F44336` (danger red)
- Secondary: `#D32F2F` (dark red)
- Accent: `#FF5252` (bright red)
- Glow: Intense red, especially eyes and edges

### Design Features
- Angular, streamlined body shape
- Sharp, focused eyes (possibly glowing)
- Visible teeth, claws, or spikes
- Muscular or segmented appearance
- Longer body for speed
- Aggressive posture

### Animation States Needed
1. **Idle**: Alert, scanning for prey (subtle head movement)
2. **Walking**: Prowling, stalking motion (4 frames)
3. **Hunting**: Fast sprint, focused forward (4 frames)
4. **Attacking**: Lunging or striking pose (2-3 frames)
5. **Eating**: Consuming prey (2 frames)

### Personality
Should look: Alert, dangerous, predatory, focused

---

## Species 3: SCAVENGER 🟡

### Visual Concept
A quirky, scrappy creature that's opportunistic and adaptable. Mix between a crow, a raccoon, and a hermit crab. Clever and resourceful.

### Color Palette
- Primary: `#FFC107` (amber/gold)
- Secondary: `#FFA000` (dark amber)
- Accent: `#FFD54F` (light yellow)
- Glow: Warm yellow, friendly

### Design Features
- Medium size, somewhere between herbivore and carnivore
- Clever, intelligent-looking eyes
- Possibly carrying tools or objects
- Feathers, fur, or shell elements
- Slightly hunched or skulking posture
- Asymmetric design (scavenged parts)

### Animation States Needed
1. **Idle**: Looking around, shifty movement
2. **Walking**: Quick, nervous gait (4 frames)
3. **Seeking**: Searching behavior, head down (3 frames)
4. **Eating**: Quick nibbling (2 frames)
5. **Fleeing**: Panicked escape, possibly dropping items (4 frames)

### Personality
Should look: Clever, opportunistic, scrappy, survivalist

---

## Additional Elements (Optional)

### Food/Plants 🌱
Simple plant sprites that look appetizing to herbivores:
- Small green bushes with berries
- Glowing mushrooms
- Crystal-like plants
- Simple flowers

Size: 16x16 pixels
Colors: Various greens with slight glow

---

## Technical Notes

### File Naming Convention
- `herbivore_idle.png`
- `herbivore_walk_01.png`, `herbivore_walk_02.png`, etc.
- `carnivore_attack_01.png`
- `scavenger_flee_01.png`
- `food_plant_01.png`

### Integration
- All sprites will be rendered on a dark background (`#0a0e1a` to `#1a1a2e`)
- Creatures rotate to face movement direction
- Glow effects will be added programmatically
- Energy bars appear above creatures

---

## Prompt for Nano Banana Pro

You can use this as a base prompt for each species:

```
Create a top-down pixel art sprite sheet for a [SPECIES] creature in a digital ecosystem simulator.

Species: [Herbivore/Carnivore/Scavenger]
Color palette: [INSERT COLORS]
Visual concept: [INSERT DESCRIPTION]
Features: [INSERT FEATURES]
Personality: [INSERT TRAITS]

Style: Retro bio-lab aesthetic, pixel art or clean vector, glowing edges, transparent background
Perspective: Top-down view for 2D movement
Size: 64x64 pixels per frame
States needed: [LIST STATES]

The creature should work well at small sizes (10-25 pixels when scaled) and look good against a dark background with green terminal-style UI elements.
```

---

## Priority Order

1. **Herbivore** - Most populous species, players will see this most
2. **Carnivore** - Most dramatic interactions
3. **Scavenger** - Adds ecosystem complexity
4. **Food/Plants** - Simple but important

Let me know when you're ready and I'll provide formatted prompts for each!
