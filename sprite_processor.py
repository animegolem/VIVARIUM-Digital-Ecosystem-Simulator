#!/usr/bin/env python3
"""
VIVARIUM Sprite Sheet Processor
Automatically detects, centers, and crops sprites from sprite sheets.
"""

from PIL import Image, ImageDraw
import json
import sys
import os
from pathlib import Path


class SpriteProcessor:
    def __init__(self, image_path, background_threshold=240):
        """
        Initialize sprite processor

        Args:
            image_path: Path to sprite sheet
            background_threshold: Brightness threshold for background detection (0-255)
        """
        self.image_path = image_path
        self.image = Image.open(image_path).convert('RGB')
        self.background_threshold = background_threshold

    def get_sprite_bounds(self, x, y, w, h, padding=5):
        """
        Auto-detect tight bounds around sprite content within a region.
        Returns centered coordinates with equal padding on all sides.

        Args:
            x, y, w, h: Region to search
            padding: Extra pixels to add around sprite
        """
        # Crop region
        region = self.image.crop((x, y, x + w, y + h))
        pixels = region.load()

        # Find actual content bounds
        min_x, min_y = w, h
        max_x, max_y = 0, 0

        for py in range(h):
            for px in range(w):
                r, g, b = pixels[px, py]
                # Check if pixel is NOT background (not white/light colored)
                brightness = (r + g + b) / 3
                if brightness < self.background_threshold:
                    min_x = min(min_x, px)
                    min_y = min(min_y, py)
                    max_x = max(max_x, px)
                    max_y = max(max_y, py)

        # No content found
        if max_x == 0 and max_y == 0:
            return None

        # Calculate content size
        content_w = max_x - min_x + 1
        content_h = max_y - min_y + 1

        # Calculate centered bounds with padding
        # Add padding to content
        padded_w = content_w + padding * 2
        padded_h = content_h + padding * 2

        # Center the padded content within original region
        center_x = min_x + content_w // 2
        center_y = min_y + content_h // 2

        new_x = center_x - padded_w // 2
        new_y = center_y - padded_h // 2

        # Clamp to region bounds
        new_x = max(0, min(new_x, w - padded_w))
        new_y = max(0, min(new_y, h - padded_h))

        # Ensure dimensions fit within region
        final_w = min(padded_w, w - new_x)
        final_h = min(padded_h, h - new_y)

        # Convert back to full image coordinates
        return {
            'x': x + new_x,
            'y': y + new_y,
            'w': final_w,
            'h': final_h
        }

    def auto_detect_grid(self, rows, cols, margin=10):
        """
        Auto-detect sprites in a grid layout

        Args:
            rows: Number of rows in grid
            cols: Number of columns in grid
            margin: Margin between sprites
        """
        width, height = self.image.size
        cell_w = width // cols
        cell_h = height // rows

        sprites = []
        for row in range(rows):
            for col in range(cols):
                x = col * cell_w + margin
                y = row * cell_h + margin
                w = cell_w - margin * 2
                h = cell_h - margin * 2

                bounds = self.get_sprite_bounds(x, y, w, h)
                if bounds:
                    sprites.append(bounds)

        return sprites

    def detect_row_sprites(self, y, height, expected_count=None, margin=10):
        """
        Auto-detect sprites in a single row

        Args:
            y: Y position of row
            height: Height of row
            expected_count: Expected number of sprites (optional)
            margin: Margin between sprites
        """
        width = self.image.size[0]

        if expected_count:
            # Grid-based detection
            cell_w = width // expected_count
            sprites = []
            for i in range(expected_count):
                x = i * cell_w + margin
                w = cell_w - margin * 2
                bounds = self.get_sprite_bounds(x, y, w, height)
                if bounds:
                    sprites.append(bounds)
            return sprites
        else:
            # Auto-detect by scanning for content
            # This is more complex - for now use grid
            return []

    def extract_sprite(self, bounds, output_path=None, remove_bg=False):
        """
        Extract a single sprite and optionally remove background

        Args:
            bounds: Dictionary with x, y, w, h
            output_path: Where to save (optional)
            remove_bg: Convert white background to transparent
        """
        sprite = self.image.crop((
            bounds['x'],
            bounds['y'],
            bounds['x'] + bounds['w'],
            bounds['y'] + bounds['h']
        ))

        if remove_bg:
            sprite = sprite.convert('RGBA')
            pixels = sprite.load()
            for py in range(sprite.size[1]):
                for px in range(sprite.size[0]):
                    r, g, b, a = pixels[px, py]
                    brightness = (r + g + b) / 3
                    # Make bright pixels transparent
                    if brightness > self.background_threshold:
                        pixels[px, py] = (r, g, b, 0)

        if output_path:
            sprite.save(output_path)

        return sprite

    def visualize_bounds(self, sprites, output_path):
        """
        Create a visualization showing detected sprite bounds
        """
        vis_image = self.image.copy()
        draw = ImageDraw.Draw(vis_image)

        for i, sprite in enumerate(sprites):
            # Draw rectangle
            draw.rectangle([
                sprite['x'],
                sprite['y'],
                sprite['x'] + sprite['w'],
                sprite['y'] + sprite['h']
            ], outline='red', width=2)

            # Draw sprite number
            draw.text((sprite['x'] + 5, sprite['y'] + 5), str(i), fill='red')

        vis_image.save(output_path)
        print(f"✓ Visualization saved to {output_path}")


def process_herbivore_sheet():
    """Process grass_eaters.jpeg sprite sheet"""
    print("\n🐢 Processing Herbivore (Grass Eaters) Sprites...")
    processor = SpriteProcessor('images/grass_eaters.jpeg', background_threshold=220)

    sprites = {
        'walk': processor.detect_row_sprites(0, 130, expected_count=6),
        'mating': processor.detect_row_sprites(160, 140, expected_count=6),
        'sad': processor.detect_row_sprites(320, 130, expected_count=3),
        'sleep': processor.detect_row_sprites(320, 130, expected_count=3)
    }

    # Visualize
    all_sprites = []
    for state_sprites in sprites.values():
        all_sprites.extend(state_sprites)
    processor.visualize_bounds(all_sprites, 'images/herbivore_bounds.png')

    # Generate JavaScript code
    print("\nDetected sprites:")
    for state, state_sprites in sprites.items():
        print(f"  {state}: {len(state_sprites)} sprites")
        for i, s in enumerate(state_sprites):
            print(f"    [{i}] x:{s['x']}, y:{s['y']}, w:{s['w']}, h:{s['h']}")

    return sprites


def process_carnivore_sheet():
    """Process meats_eats.jpeg sprite sheet"""
    print("\n🦖 Processing Carnivore (Meat Eaters) Sprites...")
    processor = SpriteProcessor('images/meats_eats.jpeg', background_threshold=220)

    sprites = {
        'walk': processor.detect_row_sprites(0, 110, expected_count=5),
        'attack': processor.detect_row_sprites(120, 120, expected_count=4),
        'hunt': processor.detect_row_sprites(250, 110, expected_count=4),
        'crouch': processor.detect_row_sprites(370, 120, expected_count=3),
        'dying': processor.detect_row_sprites(500, 120, expected_count=3)
    }

    # Visualize
    all_sprites = []
    for state_sprites in sprites.values():
        all_sprites.extend(state_sprites)
    processor.visualize_bounds(all_sprites, 'images/carnivore_bounds.png')

    print("\nDetected sprites:")
    for state, state_sprites in sprites.items():
        print(f"  {state}: {len(state_sprites)} sprites")
        for i, s in enumerate(state_sprites):
            print(f"    [{i}] x:{s['x']}, y:{s['y']}, w:{s['w']}, h:{s['h']}")

    return sprites


def process_scavenger_sheet():
    """Process scavy.jpeg sprite sheet"""
    print("\n🦝 Processing Scavenger Sprites...")
    processor = SpriteProcessor('images/scavy.jpeg', background_threshold=220)

    sprites = {
        'walk': processor.detect_row_sprites(0, 110, expected_count=5),
        'walking': processor.detect_row_sprites(120, 110, expected_count=6),
        'scavenge': processor.detect_row_sprites(240, 110, expected_count=4),
        'eating': processor.detect_row_sprites(360, 110, expected_count=3),
        'dying': processor.detect_row_sprites(360, 110, expected_count=3)
    }

    # Visualize
    all_sprites = []
    for state_sprites in sprites.values():
        all_sprites.extend(state_sprites)
    processor.visualize_bounds(all_sprites, 'images/scavenger_bounds.png')

    print("\nDetected sprites:")
    for state, state_sprites in sprites.items():
        print(f"  {state}: {len(state_sprites)} sprites")
        for i, s in enumerate(state_sprites):
            print(f"    [{i}] x:{s['x']}, y:{s['y']}, w:{s['w']}, h:{s['h']}")

    return sprites


def process_food_sheet():
    """Process foods.jpg sprite sheet"""
    print("\n🌿 Processing Food Sprites...")
    processor = SpriteProcessor('images/foods.jpg', background_threshold=230)

    # Food has multiple types in rows
    sprites = {
        'bush': processor.detect_row_sprites(0, 140, expected_count=7),
        'mushroom': processor.detect_row_sprites(180, 180, expected_count=7),
        'crystal': processor.detect_row_sprites(380, 170, expected_count=7)
    }

    # Visualize
    all_sprites = []
    for state_sprites in sprites.values():
        all_sprites.extend(state_sprites)
    processor.visualize_bounds(all_sprites, 'images/food_bounds.png')

    print("\nDetected sprites:")
    for food_type, type_sprites in sprites.items():
        print(f"  {food_type}: {len(type_sprites)} sprites")
        for i, s in enumerate(type_sprites):
            print(f"    [{i}] x:{s['x']}, y:{s['y']}, w:{s['w']}, h:{s['h']}")

    return sprites


def extract_individual_sprites(output_dir='extracted_sprites', remove_bg=True):
    """
    Extract all sprites as individual PNG files with optional background removal
    """
    print(f"\n📦 Extracting individual sprites to {output_dir}/")
    os.makedirs(output_dir, exist_ok=True)

    sheets = {
        'herbivore': ('images/grass_eaters.jpeg', process_herbivore_sheet),
        'carnivore': ('images/meats_eats.jpeg', process_carnivore_sheet),
        'scavenger': ('images/scavy.jpeg', process_scavenger_sheet),
        'food': ('images/foods.jpg', process_food_sheet)
    }

    for sheet_name, (image_path, detector) in sheets.items():
        processor = SpriteProcessor(image_path, background_threshold=220)
        sprites = detector()

        sheet_dir = os.path.join(output_dir, sheet_name)
        os.makedirs(sheet_dir, exist_ok=True)

        for state, state_sprites in sprites.items():
            for i, sprite_bounds in enumerate(state_sprites):
                filename = f"{sheet_name}_{state}_{i:02d}.png"
                output_path = os.path.join(sheet_dir, filename)
                processor.extract_sprite(sprite_bounds, output_path, remove_bg=remove_bg)

        print(f"  ✓ Extracted {sheet_name} sprites")


def generate_updated_coordinates():
    """
    Generate updated sprite coordinates for sprites.js
    """
    print("\n📝 Generating updated sprite coordinates...")

    # Process all sheets
    herbivore = process_herbivore_sheet()
    carnivore = process_carnivore_sheet()
    scavenger = process_scavenger_sheet()
    food = process_food_sheet()

    # Generate JavaScript code
    print("\n" + "="*60)
    print("UPDATED SPRITE COORDINATES FOR sprites.js")
    print("="*60)
    print("\nCopy and paste these into your sprites.js file:\n")

    print("// Herbivore sprites:")
    print("getHerbivoreSprite(state, frame = 0) {")
    print("    const sprites = {")
    for state, sprites_list in herbivore.items():
        print(f"        {state}: [")
        for s in sprites_list:
            print(f"            {{ x: {s['x']}, y: {s['y']}, w: {s['w']}, h: {s['h']} }},")
        print("        ],")
    print("    };")
    print("    // ... rest of function")
    print("}\n")


if __name__ == '__main__':
    import argparse

    parser = argparse.ArgumentParser(description='VIVARIUM Sprite Processor')
    parser.add_argument('--mode', choices=['analyze', 'extract', 'visualize'],
                       default='analyze',
                       help='Processing mode: analyze (show coords), extract (save PNGs), visualize (show bounds)')
    parser.add_argument('--remove-bg', action='store_true',
                       help='Remove white background when extracting')

    args = parser.parse_args()

    print("="*60)
    print("🎮 VIVARIUM SPRITE PROCESSOR")
    print("="*60)

    if args.mode == 'analyze':
        generate_updated_coordinates()
    elif args.mode == 'extract':
        extract_individual_sprites(remove_bg=args.remove_bg)
    elif args.mode == 'visualize':
        process_herbivore_sheet()
        process_carnivore_sheet()
        process_scavenger_sheet()
        process_food_sheet()
        print("\n✓ Visualization images saved to images/ directory")

    print("\n✅ Done!")
