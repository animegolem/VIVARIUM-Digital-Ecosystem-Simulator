#!/usr/bin/env python3
"""
Quick demo to show sprite extraction with background removal
"""
from PIL import Image
from sprite_processor import SpriteProcessor

# Create demo directory
import os
os.makedirs('sprite_demo', exist_ok=True)

print("🎨 Creating sprite extraction demo...\n")

# Extract one sprite from each type
demos = [
    ('images/grass_eaters.jpeg', 0, 0, 120, 120, 'herbivore_walk_0', 220),
    ('images/meats_eats.jpeg', 0, 0, 140, 110, 'carnivore_walk_0', 220),
    ('images/scavy.jpeg', 0, 0, 110, 110, 'scavenger_walk_0', 220),
    ('images/foods.jpg', 100, 0, 130, 110, 'food_bush_1', 230),
]

for image_path, x, y, w, h, name, threshold in demos:
    processor = SpriteProcessor(image_path, background_threshold=threshold)

    # Get centered bounds
    bounds = processor.get_sprite_bounds(x, y, w, h, padding=10)

    if bounds:
        # Extract with background
        sprite_with_bg = processor.extract_sprite(bounds,
            f'sprite_demo/{name}_with_bg.png',
            remove_bg=False)

        # Extract without background (transparent)
        sprite_no_bg = processor.extract_sprite(bounds,
            f'sprite_demo/{name}_transparent.png',
            remove_bg=True)

        print(f"✅ {name}")
        print(f"   With BG:     sprite_demo/{name}_with_bg.png")
        print(f"   Transparent: sprite_demo/{name}_transparent.png")
        print(f"   Bounds: x={bounds['x']}, y={bounds['y']}, w={bounds['w']}, h={bounds['h']}\n")

print("✨ Demo complete! Check sprite_demo/ directory")
print("\nCompare the _with_bg and _transparent versions to see background removal in action!")
