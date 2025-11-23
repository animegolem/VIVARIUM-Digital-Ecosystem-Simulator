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
            const beforeCount = this.food.length;
            this.spawnFood(1);
            if (window.eventLog && this.food.length > beforeCount) {
                const newFood = this.food[this.food.length - 1];
                window.eventLog.log('food', `New ${newFood.type || 'food'} spawned`, {
                    frame: this.time,
                    foodType: newFood.type,
                    position: { x: Math.round(newFood.x), y: Math.round(newFood.y) }
                });
            }
        }

        // Remove corpses after some time (300 frames for scavengers to find them)
        this.creatures = this.creatures.filter(c => {
            if (!c.alive && c.deathTime !== undefined) {
                const timeSinceDeath = this.time - c.deathTime;
                if (timeSinceDeath > 300) {
                    this.stats.totalDeaths++;
                    if (window.eventLog) {
                        window.eventLog.log('corpse', `${c.species.name} corpse decayed`, {
                            frame: this.time,
                            species: c.species.name,
                            age: c.age,
                            timeSinceDeath,
                            id: c.id
                        });
                    }
                    return false; // Remove corpse
                }
            }
            return true; // Keep creature
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
        // Prevent drag events on canvas
        this.canvas.addEventListener('dragstart', (e) => {
            e.preventDefault();
            return false;
        });
        this.canvas.addEventListener('drag', (e) => {
            e.preventDefault();
            return false;
        });

        // Pause button
        document.getElementById('pause-btn').addEventListener('click', () => {
            this.togglePause();
        });

        // Reset button
        document.getElementById('reset-btn').addEventListener('click', () => {
            if (confirm('Are you sure you want to reset the ecosystem?')) {
                this.world.reset();
                if (window.eventLog) {
                    window.eventLog.clear();
                    window.eventLog.log('system', 'World reset', { frame: this.world.time });
                }
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
            if (window.eventLog) {
                window.eventLog.log('food', 'Manually spawned 10 food items', { frame: this.world.time });
            }
        });

        // Add creature button
        document.getElementById('add-creature-btn').addEventListener('click', () => {
            // Cycle through species
            const species = [SPECIES.HERBIVORE, SPECIES.CARNIVORE, SPECIES.SCAVENGER];
            const randomSpecies = species[Math.floor(Math.random() * species.length)];
            this.world.addCreature(randomSpecies);
            if (window.eventLog) {
                window.eventLog.log('creature', `Manually added ${randomSpecies.name}`, {
                    frame: this.world.time,
                    species: randomSpecies.name
                });
            }
        });

        // Canvas click for creature selection
        this.canvas.addEventListener('click', (e) => {
            const creature = this.renderer.getCreatureAtPosition(e.clientX, e.clientY, this.world.creatures);
            this.renderer.setSelectedCreature(creature);
            this.updateInfoPanel(creature);
        });

        // Event log controls
        document.getElementById('toggle-log-btn').addEventListener('click', () => {
            const enabled = window.eventLog.toggle();
            document.getElementById('toggle-log-btn').textContent = enabled ? '⏸ Pause Log' : '▶ Resume Log';
        });

        document.getElementById('clear-log-btn').addEventListener('click', () => {
            window.eventLog.clear();
            this.updateEventLog();
        });

        document.getElementById('export-log-btn').addEventListener('click', () => {
            const logData = window.eventLog.export();
            const blob = new Blob([logData], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `vivarium-log-${Date.now()}.json`;
            a.click();
            URL.revokeObjectURL(url);
        });

        // Event log filters
        document.querySelectorAll('.log-filter').forEach(checkbox => {
            checkbox.addEventListener('change', () => {
                this.updateEventLog();
            });
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

    updateEventLog() {
        if (!window.eventLog) return;

        const logContainer = document.getElementById('event-log');

        // Get active filters
        const activeFilters = Array.from(document.querySelectorAll('.log-filter:checked'))
            .map(cb => cb.value);

        // Get recent events
        const events = window.eventLog.getRecent(100, activeFilters);

        // Display events (most recent at bottom)
        logContainer.innerHTML = events.map(event => {
            const time = new Date(event.timestamp).toLocaleTimeString();
            return `<div class="event-entry ${event.type}">
                <span class="event-time">${time}</span>
                <span class="event-frame">F${event.frame}</span>
                ${event.message}
            </div>`;
        }).join('');

        // Auto-scroll to bottom
        logContainer.scrollTop = logContainer.scrollHeight;
    }

    start() {
        this.updateSpeciesGuide();
        if (window.eventLog) {
            window.eventLog.log('system', 'Vivarium initialized', { frame: this.world.time });
        }
        this.loop();
    }

    loop() {
        this.world.update();
        this.renderer.render(this.world);
        this.updateUI();
        this.updateEventLog();

        requestAnimationFrame(() => this.loop());
    }
}

// Initialize the application when the page loads
window.addEventListener('DOMContentLoaded', () => {
    const vivarium = new Vivarium();
    console.log('🔬 VIVARIUM initialized');
    console.log('Watch as creatures evolve, hunt, flee, and reproduce!');
});
