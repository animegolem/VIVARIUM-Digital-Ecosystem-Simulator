#!/usr/bin/env python3
"""
Configuration-based sprite processor
Uses sprite_config.json for easy parameter tuning
"""

import json
from sprite_processor import SpriteProcessor
from PIL import Image
import os


def load_config(config_file='sprite_config.json'):
    """Load sprite configuration from JSON file"""
    with open(config_file, 'r') as f:
        return json.load(f)


def process_from_config(config, mode='analyze', remove_bg=True):
    """
    Process sprites using configuration file

    Args:
        config: Configuration dictionary
        mode: 'analyze', 'extract', or 'visualize'
        remove_bg: Remove background when extracting
    """

    all_results = {}

    for sheet_name, sheet_config in config.items():
        print(f"\n{'='*60}")
        print(f"Processing: {sheet_name.upper()}")
        print('='*60)

        image_path = sheet_config['image']
        threshold = sheet_config['background_threshold']
        processor = SpriteProcessor(image_path, background_threshold=threshold)

        image_width = processor.image.size[0]
        sheet_results = {}

        # Process each animation state
        for state_name, state_config in sheet_config['states'].items():
            y = state_config['y']
            height = state_config['height']
            count = state_config['count']
            margin = state_config.get('margin', 10)
            start_x = state_config.get('start_x', 0)

            # Calculate cell width
            available_width = image_width - start_x
            cell_w = available_width // count

            sprites = []
            for i in range(count):
                x = start_x + (i * cell_w) + margin
                w = cell_w - margin * 2
                h = height - margin * 2

                bounds = processor.get_sprite_bounds(x, y, w, h, padding=5)
                if bounds:
                    sprites.append(bounds)

                    # Extract mode
                    if mode == 'extract':
                        output_dir = f'extracted_sprites/{sheet_name}'
                        os.makedirs(output_dir, exist_ok=True)
                        filename = f"{sheet_name}_{state_name}_{i:02d}.png"
                        output_path = os.path.join(output_dir, filename)
                        processor.extract_sprite(bounds, output_path, remove_bg=remove_bg)

            sheet_results[state_name] = sprites

            # Print results
            if mode == 'analyze' or mode == 'visualize':
                print(f"\n  {state_name}: {len(sprites)} sprites")
                for i, s in enumerate(sprites):
                    print(f"    [{i}] x:{s['x']}, y:{s['y']}, w:{s['w']}, h:{s['h']}")

        # Visualize mode
        if mode == 'visualize':
            all_sprites = []
            for sprites in sheet_results.values():
                all_sprites.extend(sprites)
            vis_path = f'images/{sheet_name}_bounds_config.png'
            processor.visualize_bounds(all_sprites, vis_path)

        # Extract mode
        if mode == 'extract':
            total = sum(len(sprites) for sprites in sheet_results.values())
            print(f"  ✓ Extracted {total} sprites to extracted_sprites/{sheet_name}/")

        all_results[sheet_name] = sheet_results

    return all_results


def generate_javascript_code(results):
    """Generate JavaScript sprite coordinate code"""

    print("\n" + "="*60)
    print("JAVASCRIPT CODE FOR sprites.js")
    print("="*60 + "\n")

    for sheet_name, states in results.items():
        func_name = f"get{sheet_name.capitalize()}Sprite"

        print(f"// {sheet_name.capitalize()} sprite definitions")
        print(f"{func_name}(state, frame = 0) {{")
        print("    const sprites = {")

        for state_name, sprites in states.items():
            print(f"        {state_name}: [")
            for sprite in sprites:
                print(f"            {{ x: {sprite['x']}, y: {sprite['y']}, w: {sprite['w']}, h: {sprite['h']} }},")
            print("        ],")

        print("    };")
        print("")
        print("    const stateSprites = sprites[state] || sprites.walk;")
        print("    return stateSprites[frame % stateSprites.length];")
        print("}\n")


if __name__ == '__main__':
    import argparse

    parser = argparse.ArgumentParser(description='Config-based sprite processor')
    parser.add_argument('--mode', choices=['analyze', 'extract', 'visualize'],
                       default='analyze',
                       help='Processing mode')
    parser.add_argument('--config', default='sprite_config.json',
                       help='Configuration file')
    parser.add_argument('--remove-bg', action='store_true',
                       help='Remove background when extracting')

    args = parser.parse_args()

    print("🎮 CONFIG-BASED SPRITE PROCESSOR")
    print(f"📄 Using config: {args.config}")
    print(f"🔧 Mode: {args.mode}")
    if args.mode == 'extract':
        print(f"🎨 Background removal: {'ON' if args.remove_bg else 'OFF'}")

    # Load config
    config = load_config(args.config)

    # Process
    results = process_from_config(config, mode=args.mode, remove_bg=args.remove_bg)

    # Generate code if in analyze mode
    if args.mode == 'analyze':
        generate_javascript_code(results)

    print("\n✅ Done!")
