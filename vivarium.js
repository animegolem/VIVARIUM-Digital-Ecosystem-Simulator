// Main VIVARIUM simulation engine
import { Genome, GenomeTemplates } from './genetics.js';
import { Creature, Species, SPECIES, Food } from './creatures.js';
import { Renderer } from './renderer.js';

class World {
    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.creatures = [];
        this.food = [];
        this.time = 0;
        this.generation = 1;
        this.paused = false;
        this.speed = 1;
        this.fps = 0;
        this.lastFrameTime = Date.now();

        // Statistics
        this.stats = {
            herbivoreCount: 0,
            carnivoreCount: 0,
            scavengerCount: 0,
            foodCount: 0,
            totalBirths: 0,
            totalDeaths: 0
        };
    }

    initialize() {
        // Spawn initial creatures
        this.spawnCreatures(SPECIES.HERBIVORE, 15);
        this.spawnCreatures(SPECIES.CARNIVORE, 5);
        this.spawnCreatures(SPECIES.SCAVENGER, 8);

        // Spawn initial food
        this.spawnFood(30);
    }

    spawnCreatures(species, count) {
        const template = GenomeTemplates[species.type];
        for (let i = 0; i < count; i++) {
            const genome = Genome.createRandom(template);
            const creature = new Creature(
                Math.random() * this.width,
                Math.random() * this.height,
                species,
                genome
            );
            this.creatures.push(creature);
        }
    }

    spawnFood(count) {
        for (let i = 0; i < count; i++) {
            this.food.push(new Food(
                Math.random() * this.width,
                Math.random() * this.height
            ));
        }
    }

    update() {
        if (this.paused) return;

        // Update multiple times based on speed
        for (let i = 0; i < this.speed; i++) {
            this.singleUpdate();
        }
    }

    singleUpdate() {
        this.time++;

        // Update all creatures
        const newborns = [];
        for (const creature of this.creatures) {
            const child = creature.update(this);
            if (child) {
                newborns.push(child);
                this.stats.totalBirths++;
                this.generation = Math.max(this.generation, child.generation);
            }
        }

        // Add newborns
        this.creatures.push(...newborns);

        // Update food
        for (const food of this.food) {
            food.update();
        }

        // Remove dead food
        this.food = this.food.filter(f => f.alive);

        // Randomly spawn new food (2% chance per frame)
        if (Math.random() < 0.02 && this.food.length < 100) {
            this.spawnFood(1);
        }

        // Remove corpses after some time (increased to 300 frames for scavengers)
        const deadCreatures = this.creatures.filter(c => !c.alive);
        deadCreatures.forEach(c => {
            if (this.time - c.age > 300) {
                const index = this.creatures.indexOf(c);
                if (index > -1) {
                    this.creatures.splice(index, 1);
                    this.stats.totalDeaths++;
                }
            }
        });

        // Update statistics
        this.updateStats();

        // Calculate FPS
        const now = Date.now();
        this.fps = 1000 / (now - this.lastFrameTime);
        this.lastFrameTime = now;
    }

    updateStats() {
        this.stats.herbivoreCount = this.creatures.filter(
            c => c.alive && c.species.type === 'herbivore'
        ).length;
        this.stats.carnivoreCount = this.creatures.filter(
            c => c.alive && c.species.type === 'carnivore'
        ).length;
        this.stats.scavengerCount = this.creatures.filter(
            c => c.alive && c.species.type === 'scavenger'
        ).length;
        this.stats.foodCount = this.food.length;
    }

    reset() {
        this.creatures = [];
        this.food = [];
        this.time = 0;
        this.generation = 1;
        this.stats = {
            herbivoreCount: 0,
            carnivoreCount: 0,
            scavengerCount: 0,
            foodCount: 0,
            totalBirths: 0,
            totalDeaths: 0
        };
        this.initialize();
    }

    addCreature(species) {
        const template = GenomeTemplates[species.type];
        const genome = Genome.createRandom(template);
        const creature = new Creature(
            Math.random() * this.width,
            Math.random() * this.height,
            species,
            genome
        );
        this.creatures.push(creature);
    }
}

// Main application
class Vivarium {
    constructor() {
        this.canvas = document.getElementById('ecosystem-canvas');
        this.renderer = new Renderer(this.canvas);
        this.world = new World(this.canvas.width, this.canvas.height);

        this.setupEventListeners();
        this.world.initialize();
        this.start();
    }

    setupEventListeners() {
        // Pause button
        document.getElementById('pause-btn').addEventListener('click', () => {
            this.togglePause();
        });

        // Reset button
        document.getElementById('reset-btn').addEventListener('click', () => {
            if (confirm('Are you sure you want to reset the ecosystem?')) {
                this.world.reset();
            }
        });

        // Speed slider
        const speedSlider = document.getElementById('speed-slider');
        speedSlider.addEventListener('input', (e) => {
            this.world.speed = parseFloat(e.target.value);
            document.getElementById('speed-display').textContent = `${this.world.speed}x`;
        });

        // Add food button
        document.getElementById('add-food-btn').addEventListener('click', () => {
            this.world.spawnFood(10);
        });

        // Add creature button
        document.getElementById('add-creature-btn').addEventListener('click', () => {
            // Cycle through species
            const species = [SPECIES.HERBIVORE, SPECIES.CARNIVORE, SPECIES.SCAVENGER];
            const randomSpecies = species[Math.floor(Math.random() * species.length)];
            this.world.addCreature(randomSpecies);
        });

        // Canvas click for creature selection
        this.canvas.addEventListener('click', (e) => {
            const creature = this.renderer.getCreatureAtPosition(e.clientX, e.clientY, this.world.creatures);
            this.renderer.setSelectedCreature(creature);
            this.updateInfoPanel(creature);
        });

        // Window resize
        window.addEventListener('resize', () => {
            this.world.width = this.canvas.width;
            this.world.height = this.canvas.height;
        });
    }

    togglePause() {
        this.world.paused = !this.world.paused;
        const pauseBtn = document.getElementById('pause-btn');
        const pauseIndicator = document.getElementById('pause-indicator');

        if (this.world.paused) {
            pauseBtn.textContent = '▶ Resume';
            pauseIndicator.classList.remove('hidden');
        } else {
            pauseBtn.textContent = '⏸ Pause';
            pauseIndicator.classList.add('hidden');
        }
    }

    updateUI() {
        // Update population stats
        const statsContainer = document.getElementById('population-stats');
        statsContainer.innerHTML = `
            <div class="stat-item">
                <span>🟢 Herbivores:</span>
                <span>${this.world.stats.herbivoreCount}</span>
            </div>
            <div class="stat-item">
                <span>🔴 Carnivores:</span>
                <span>${this.world.stats.carnivoreCount}</span>
            </div>
            <div class="stat-item">
                <span>🟡 Scavengers:</span>
                <span>${this.world.stats.scavengerCount}</span>
            </div>
            <div class="stat-item">
                <span>Total Births:</span>
                <span>${this.world.stats.totalBirths}</span>
            </div>
            <div class="stat-item">
                <span>Total Deaths:</span>
                <span>${this.world.stats.totalDeaths}</span>
            </div>
        `;

        // Update environment stats
        document.getElementById('food-count').textContent = this.world.stats.foodCount;
        document.getElementById('generation-count').textContent = this.world.generation;
        document.getElementById('time-elapsed').textContent = `${Math.floor(this.world.time / 60)}s`;

        // Update species guide
        this.updateSpeciesGuide();
    }

    updateSpeciesGuide() {
        const guideContainer = document.getElementById('species-guide');
        const speciesArray = [SPECIES.HERBIVORE, SPECIES.CARNIVORE, SPECIES.SCAVENGER];

        guideContainer.innerHTML = speciesArray.map(species => `
            <div class="species-item" style="border-color: ${species.color}">
                <div class="species-name" style="color: ${species.color}">${species.name}</div>
                <div class="species-desc">${species.description}</div>
            </div>
        `).join('');
    }

    updateInfoPanel(creature) {
        const infoPanel = document.getElementById('info-panel');

        if (!creature) {
            infoPanel.innerHTML = 'Click on creatures to see their stats!';
            return;
        }

        const energyPercent = Math.round((creature.energy / creature.maxEnergy) * 100);
        const agePercent = Math.round((creature.age / creature.maxLifespan) * 100);

        infoPanel.innerHTML = `
            <div class="creature-info">
                <strong style="color: ${creature.species.color}">${creature.species.name}</strong><br>
                <div><strong>Generation:</strong> ${creature.generation}</div>
                <div><strong>Age:</strong> ${creature.age} / ${Math.round(creature.maxLifespan)} (${agePercent}%)</div>
                <div><strong>Energy:</strong> ${Math.round(creature.energy)} / ${Math.round(creature.maxEnergy)} (${energyPercent}%)</div>
                <div><strong>State:</strong> ${creature.state}</div>
                <hr style="border-color: #00ff41; margin: 10px 0;">
                <div><strong>Speed:</strong> ${creature.speed.toFixed(2)}</div>
                <div><strong>Size:</strong> ${creature.size.toFixed(1)}</div>
                <div><strong>Vision:</strong> ${Math.round(creature.visionRange)}</div>
                <div><strong>Metabolism:</strong> ${creature.metabolism.toFixed(3)}</div>
            </div>
        `;
    }

    start() {
        this.updateSpeciesGuide();
        this.loop();
    }

    loop() {
        this.world.update();
        this.renderer.render(this.world);
        this.updateUI();

        requestAnimationFrame(() => this.loop());
    }
}

// Initialize the application when the page loads
window.addEventListener('DOMContentLoaded', () => {
    const vivarium = new Vivarium();
    console.log('🔬 VIVARIUM initialized');
    console.log('Watch as creatures evolve, hunt, flee, and reproduce!');
});
