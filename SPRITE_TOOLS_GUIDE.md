# 🎨 VIVARIUM Sprite Processing Tools

Complete guide to centering, cropping, and extracting sprites from your sprite sheets!

## ✅ What's Been Created

1. **sprite_processor.py** - Core sprite processing engine
2. **process_with_config.py** - Easy-to-use config-based processor ⭐ RECOMMENDED
3. **sprite_config.json** - Configuration file for sprite sheets
4. **extract_demo.py** - Quick demo of extraction capabilities
5. Visualization images showing detected sprite bounds
6. Demo extracted sprites in `sprite_demo/`

## 🚀 Quick Start (Recommended)

### Option 1: Use Config-Based Processor (Easiest!)

```bash
# Generate updated JavaScript coordinates
python3 process_with_config.py --mode=analyze

# Create visualizations
python3 process_with_config.py --mode=visualize

# Extract all sprites with transparent backgrounds
python3 process_with_config.py --mode=extract --remove-bg
```

### Option 2: Use Original Processor

```bash
# Analyze and get coordinates
python3 sprite_processor.py --mode=analyze

# Visualize detection
python3 sprite_processor.py --mode=visualize

# Extract sprites
python3 sprite_processor.py --mode=extract --remove-bg
```

## 📝 Customizing Detection

Edit `sprite_config.json` to adjust sprite detection:

```json
{
  "herbivore": {
    "image": "images/grass_eaters.jpeg",
    "background_threshold": 220,  // Adjust if detection is wrong
    "states": {
      "walk": {
        "y": 0,           // Row Y position
        "height": 130,    // Row height
        "count": 6,       // Number of sprites in row
        "margin": 10,     // Space between sprites
        "start_x": 0      // Optional: start X position
      }
    }
  }
}
```

### Tuning Parameters:

- **background_threshold** (0-255): Brightness level for background detection
  - Lower = more sensitive (220 is good for most sprites)
  - Higher = only very bright pixels considered background

- **y**: Starting Y coordinate of the sprite row
- **height**: Height of the row
- **count**: Expected number of sprites in the row
- **margin**: Pixels of spacing between sprites
- **start_x**: Optional offset for rows that don't start at x=0

## 🎯 What the Tools Do

### 1. Auto-Detection
- Scans each sprite region for non-background pixels
- Finds tight bounding box around actual content
- Centers the sprite with padding

### 2. Background Removal
- Converts white/light backgrounds to transparent
- Uses threshold to determine what counts as background
- Creates PNG files with alpha channel

### 3. Coordinate Generation
- Produces centered, uniform sprite coordinates
- Outputs JavaScript code ready to paste into sprites.js
- Fixes uncentered cropping issues

## 📊 Understanding the Output

### Analyze Mode
Prints sprite coordinates and generates JavaScript:
```
herbivore walk: 6 sprites
  [0] x:10, y:0, w:214, h:110
  [1] x:244, y:0, w:214, h:110
  ...
```

Copy the JavaScript output directly into your `sprites.js` file!

### Visualize Mode
Creates PNG files showing red boxes around detected sprites:
- `images/herbivore_bounds_config.png`
- `images/carnivore_bounds_config.png`
- `images/scavenger_bounds_config.png`
- `images/food_bounds_config.png`

Open these to verify detection is correct!

### Extract Mode
Creates individual sprite files:
```
extracted_sprites/
  herbivore/
    herbivore_walk_00.png
    herbivore_walk_01.png
    herbivore_mating_00.png
    ...
  carnivore/
    carnivore_walk_00.png
    ...
```

## 🔧 Troubleshooting

### Problem: Sprites not detected correctly
**Solution**: Adjust `background_threshold` in sprite_config.json
- If too much is detected: Increase threshold (try 230-240)
- If too little is detected: Decrease threshold (try 200-210)

### Problem: Wrong number of sprites detected
**Solution**: Check `count` parameter matches actual sprite count

### Problem: Sprites cut off at edges
**Solution**: Adjust `y`, `height`, or `margin` in config

### Problem: Coordinates seem off
**Solution**: Check `start_x` for rows that don't start at x=0

## 📁 File Reference

### Demo Files
- `sprite_demo/` - Sample extracted sprites (with and without backgrounds)

### Visualization Files
- `images/*_bounds.png` - Red boxes showing detection
- `images/*_bounds_config.png` - Config-based detection results

### Extracted Sprites
- `extracted_sprites/` - All sprites as individual PNG files

## 💡 Pro Tips

1. **Always visualize first** - Run visualize mode to check detection before extracting
2. **Tune per sheet** - Each sprite sheet may need different threshold values
3. **Use config approach** - Much easier to tweak than editing Python code
4. **Check demo sprites** - Compare with_bg vs transparent versions
5. **Start with defaults** - The default config values are a good starting point

## 🎮 Next Steps

### To update your game:
1. Run: `python3 process_with_config.py --mode=analyze > new_sprites.txt`
2. Copy the JavaScript code from new_sprites.txt
3. Paste into `sprites.js`, replacing old coordinate arrays
4. Test your game!

### To work with individual sprites:
1. Run: `python3 process_with_config.py --mode=extract --remove-bg`
2. Use sprites from `extracted_sprites/` directory
3. Import into game, Photoshop, or other tools

### To refine detection:
1. Run: `python3 process_with_config.py --mode=visualize`
2. Check the visualization images
3. Edit `sprite_config.json` to adjust parameters
4. Repeat until detection looks perfect

---

## 🎉 Summary

✅ **Realistic?** Yes! The script successfully:
- Auto-detects sprite boundaries
- Centers sprites in bounding boxes
- Removes backgrounds (white → transparent)
- Extracts individual sprite files
- Generates updated coordinate code

✅ **Easy to use?** Yes!
- Config file approach is simple
- Three modes: analyze, visualize, extract
- Clear documentation and examples

✅ **Fixes your issue?** Yes!
- Solves uncentered crop problem
- Provides precise, centered coordinates
- Optional background removal

**You now have professional-grade sprite processing tools! 🚀**
