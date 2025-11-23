# VIVARIUM Setup Guide

## Prerequisites

Before building VIVARIUM as a desktop app, you need:

1. **Node.js** (v16 or higher)
   - Download from: https://nodejs.org/
   - Verify installation: `node --version` and `npm --version`

## Installation Steps

### 1. Clone or Download the Repository

```bash
git clone <repository-url>
cd vivarium
```

### 2. Install Dependencies

```bash
npm install
```

This will download Electron and other build tools (~200MB). It may take a few minutes.

### 3. Run in Development Mode

```bash
npm start
```

This launches VIVARIUM as a desktop app with DevTools enabled for debugging.

## Building Standalone Executables

### Linux

```bash
./build.sh linux
```

Creates:
- `dist/VIVARIUM-*.AppImage` - Universal Linux app
- `dist/vivarium_*.deb` - Debian/Ubuntu package

### Windows

```bash
./build.sh win
# Or on Windows:
build.bat
```

Creates:
- `dist/VIVARIUM Setup *.exe` - Installer
- `dist/VIVARIUM *.exe` - Portable executable

### macOS

```bash
./build.sh mac
```

Creates:
- `dist/VIVARIUM-*.dmg` - Disk image
- `dist/VIVARIUM-*.zip` - Zipped app bundle

### All Platforms

```bash
./build.sh all
```

Builds for Linux, Windows, and macOS in one command.

## Alternative: Run in Browser

If you prefer not to build an Electron app, you can run VIVARIUM in a web browser:

### Using Python

```bash
python3 -m http.server 8080
```

Then open http://localhost:8080 in your browser.

### Using Node.js

```bash
npx http-server -p 8080
```

Then open http://localhost:8080 in your browser.

## Troubleshooting

### `npm install` fails

**Problem**: Electron download blocked by firewall/proxy

**Solution**: Configure npm to use your proxy:
```bash
npm config set proxy http://proxy.company.com:8080
npm config set https-proxy http://proxy.company.com:8080
```

Or try using a mirror:
```bash
npm config set electron_mirror https://npmmirror.com/mirrors/electron/
```

### Build fails on Linux

**Problem**: Missing dependencies for app packaging

**Solution**: Install required packages:
```bash
# Ubuntu/Debian
sudo apt-get install -y rpm

# Fedora/RHEL
sudo yum install -y rpm-build
```

### App won't start

**Problem**: JavaScript console shows module errors

**Solution**: Make sure all `.js` files are in the same directory as `index.html`. Check browser console (F12) for specific errors.

### Sprites don't load

**Problem**: Images not found

**Solution**: Verify the `images/` directory contains:
- grass_eaters.jpeg
- meats_eats.jpeg
- scavy.jpeg
- foods.jpg

## Development Tips

### Enable DevTools

Run with the `--dev` flag:
```bash
npm start -- --dev
```

Or modify `main.js` to always open DevTools.

### Hot Reload

For rapid development, use the browser version with Live Server or similar tools that support hot reload.

### Custom Window Size

Edit `main.js` and modify the `BrowserWindow` settings:
```javascript
mainWindow = new BrowserWindow({
    width: 1920,  // Change width
    height: 1080, // Change height
    // ...
});
```

## File Structure

```
vivarium/
├── index.html          # Main HTML file
├── main.js            # Electron main process
├── package.json       # Node.js dependencies
├── build.sh           # Linux/Mac build script
├── build.bat          # Windows build script
├── styles.css         # All CSS styles
├── vivarium.js        # Main simulation engine
├── creatures.js       # Creature behaviors
├── genetics.js        # Genetic evolution system
├── renderer.js        # Canvas rendering
├── sprites.js         # Sprite atlas system
└── images/            # Sprite sheets
    ├── grass_eaters.jpeg
    ├── meats_eats.jpeg
    ├── scavy.jpeg
    └── foods.jpg
```

## Next Steps

Once you have VIVARIUM running:

1. Click **▶ Pause** to pause/resume
2. Adjust **Speed** to control simulation rate
3. Click **🌱 Add Plants** to feed creatures
4. Click **➕ Add Creature** to add random creatures
5. **Click creatures** to inspect their stats
6. Watch the population evolve over generations!

Enjoy your digital ecosystem! 🔬🌍
