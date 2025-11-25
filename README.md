# 🔬 VIVARIUM - Digital Ecosystem Simulator

## i told claude he could make whatever he wanted and he made this 

An interactive, evolving ecosystem where digital creatures live, hunt, reproduce, and evolve through natural selection.


https://github.com/user-attachments/assets/7cc2f32d-6845-438c-8066-ff68d9c05036


## Features

### 🧬 Genetic Evolution
- Creatures inherit traits from parents through sexual reproduction
- Genes mutate over generations, leading to evolution
- Traits include: speed, size, vision range, metabolism, energy capacity, lifespan
- Watch as populations adapt to their environment over time

### 🌍 Three Species Ecosystem
- **🟢 Herbivores**: Peaceful plant-eaters that flee from predators
- **🔴 Carnivores**: Aggressive hunters that prey on herbivores and scavengers
- **🟡 Scavengers**: Opportunistic feeders that avoid carnivores

### 🎮 Interactive Controls
- Pause/resume simulation
- Adjust simulation speed (0.5x to 5x)
- Add food to the ecosystem
- Spawn new creatures
- Click creatures to view detailed stats
- Watch population dynamics in real-time

### 📊 Statistics & Metrics
- Population counts by species
- Generation tracking
- Birth and death statistics
- Individual creature inspection (age, energy, traits, state)
- Real-time FPS counter

### 🎨 Retro Bio-Lab Aesthetic
- Terminal green CRT-style interface
- Glowing effects and particle ambience
- Creature state indicators
- Vision range visualization
- Energy bars

## How It Works

### Creature Behaviors
Each creature has an AI that determines its actions:
- **Herbivores**: Seek plants, flee from carnivores, reproduce when well-fed
- **Carnivores**: Hunt prey, attack when close, reproduce after successful hunts
- **Scavengers**: Eat plants and corpses, flee from carnivores

### Genetics System
- Each creature has a genome containing genes for various traits
- Reproduction combines parent genes through crossover
- Mutations occur with each new generation
- Successful traits spread through the population

### Energy & Survival
- Creatures consume energy through metabolism
- Must eat to maintain energy levels
- Die from starvation or old age
- Can only reproduce when energy is above a threshold

### Natural Selection
- Faster creatures are better at hunting/fleeing
- Better vision helps find food/avoid danger
- Lower metabolism allows longer survival
- Traits that aid survival spread through generations

## Getting Started

### 🖥️ Desktop App (Recommended)

VIVARIUM is packaged as an Electron desktop app for easy standalone use:

```bash
# Install dependencies
npm install

# Run in development mode
npm start

# Build standalone app for your platform
./build.sh

# Build for specific platforms
./build.sh linux    # AppImage + deb
./build.sh win      # Windows installer + portable
./build.sh mac      # macOS dmg + zip
./build.sh all      # All platforms
```

After building, find your executable in the `dist/` directory!

### 🌐 Web Version (Alternative)

You can also run VIVARIUM in a web browser, but it requires a web server:

**Option 1: Python**
```bash
python3 -m http.server 8080
# Open http://localhost:8080
```

**Option 2: Node.js**
```bash
npx http-server -p 8080
# Open http://localhost:8080
```

**Option 3: VS Code Live Server**
- Install "Live Server" extension
- Right-click `index.html` → "Open with Live Server"

## Controls

- **⏸ Pause**: Pause/resume the simulation
- **🔄 Reset**: Start fresh with a new ecosystem
- **Speed Slider**: Control simulation speed
- **🌱 Add Plants**: Introduce more food to the ecosystem
- **➕ Add Creature**: Spawn a random creature
- **Click Creatures**: View detailed stats and genes

## Technical Details

- Pure JavaScript (no frameworks)
- Canvas-based rendering
- Real-time simulation with configurable speed
- Genetic algorithm implementation
- Modular architecture (genetics, creatures, renderer, world)

## Future Enhancements (Coming Soon!)

- 🎨 Sprite-based creature graphics
- 🌿 More diverse plant types
- 🏔️ Terrain and obstacles
- 💾 Save/load ecosystem states
- 📈 Population graphs over time
- 🎵 Ambient sound effects
- 🧪 Experimental mutations

## License

Created with creative freedom and tokens to spare! 🚀

---

**Watch evolution happen in real-time. Every ecosystem tells a unique story.**
