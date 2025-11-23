# VIVARIUM Sprite Processor

Automatically center, crop, and extract sprites from your sprite sheets!

## Features

✅ **Auto-detect sprite boundaries** - Finds actual sprite content automatically
✅ **Center sprites** - Creates perfectly centered bounding boxes
✅ **Remove backgrounds** - Converts white backgrounds to transparent
✅ **Extract individual files** - Saves each sprite as a separate PNG
✅ **Visualize detection** - Shows red boxes over detected sprites
✅ **Generate coordinates** - Creates updated sprite coordinates for sprites.js

## Usage

### 1. Visualize Detected Sprites
Shows red boxes around detected sprites:
```bash
python3 sprite_processor.py --mode=visualize
```
Output: `images/*_bounds.png` files showing detection boxes

### 2. Analyze and Get Coordinates
Get updated sprite coordinates for your sprites.js file:
```bash
python3 sprite_processor.py --mode=analyze
```
Copy the output and paste into sprites.js

### 3. Extract Individual Sprites
Save each sprite as a separate PNG file:
```bash
# Without background removal
python3 sprite_processor.py --mode=extract

# With background removal (white → transparent)
python3 sprite_processor.py --mode=extract --remove-bg
```
Output: `extracted_sprites/` directory with all sprites

## How It Works

The script:
1. Loads each sprite sheet (herbivore, carnivore, scavenger, food)
2. Divides the sheet into rows based on animation states
3. For each expected sprite position:
   - Scans pixels to find non-background content
   - Calculates tight bounds around the actual sprite
   - Centers the sprite with padding
   - Generates coordinates or extracts the image

## Configuration

You can adjust the background detection threshold in the code:
- Default: `background_threshold=220` (0-255)
- Lower = more sensitive (detects lighter backgrounds as content)
- Higher = less sensitive (only very bright pixels are background)

## Troubleshooting

**Negative coordinates?** - The script now clamps values to prevent this

**Sprites not detected?** - Try lowering the background_threshold value

**Wrong sprite count?** - Check the `expected_count` parameter for each row

**Background not removed?** - Increase background_threshold or use --remove-bg

## Files Generated

- `images/herbivore_bounds.png` - Visualization of herbivore sprite detection
- `images/carnivore_bounds.png` - Visualization of carnivore sprite detection
- `images/scavenger_bounds.png` - Visualization of scavenger sprite detection
- `images/food_bounds.png` - Visualization of food sprite detection
- `extracted_sprites/` - Individual sprite PNG files (if using --mode=extract)

## Next Steps

After running the processor:
1. Check the visualization images to verify detection is correct
2. Use analyze mode to get new coordinates
3. Update sprites.js with the new centered coordinates
4. Or use extract mode to work with individual sprite files instead!
