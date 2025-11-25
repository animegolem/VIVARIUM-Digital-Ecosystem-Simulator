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

        // Ecosystem carrying capacity - hard limits
        this.carryingCapacity = {
            herbivore: 35,
            carnivore: 12,
            scavenger: 20,
            total: 60
        };
        this.maxFood = 70;

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
        // Spawn initial creatures - healthy starting population
        this.spawnCreatures(SPECIES.HERBIVORE, 18);
        this.spawnCreatures(SPECIES.CARNIVORE, 5);
        this.spawnCreatures(SPECIES.SCAVENGER, 8);

        // Spawn plenty of initial food
        this.spawnFood(35);
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
            if (this.food.length < this.maxFood) {
                this.food.push(new Food(
                    Math.random() * this.width,
                    Math.random() * this.height
                ));
            }
        }
    }

    // Ensure all entities stay within current world bounds
    clampToBounds() {
        for (const creature of this.creatures) {
            if (creature.x < 0) creature.x = 0;
            if (creature.x > this.width) creature.x = this.width;
            if (creature.y < 0) creature.y = 0;
            if (creature.y > this.height) creature.y = this.height;
        }
        for (const food of this.food) {
            if (food.x < 0) food.x = 0;
            if (food.x > this.width) food.x = this.width;
            if (food.y < 0) food.y = 0;
            if (food.y > this.height) food.y = this.height;
        }
    }

    update() {
        if (this.paused) return;

        for (let i = 0; i < this.speed; i++) {
            this.singleUpdate();
        }
    }

    singleUpdate() {
        this.time++;

        // Calculate population stress
        const stress = this.calculateStress();

        // Update all creatures
        const newborns = [];
        for (const creature of this.creatures) {
            if (!creature.alive) continue;
            
            // Apply population stress - creatures in overpopulated species burn more energy
            // But keep it gentle so populations can recover
            const speciesStress = stress[creature.species.type] || 0;
            if (speciesStress > 0.5) { // Only apply stress when significantly over capacity
                const stressPenalty = creature.metabolism * speciesStress * 0.5;
                creature.energy -= stressPenalty;
            }
            
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

        // Spawn new food - faster when depleted
        const foodRatio = this.food.length / this.maxFood;
        const spawnChance = foodRatio < 0.3 ? 0.08 : foodRatio < 0.5 ? 0.05 : 0.025;
        if (Math.random() < spawnChance && this.food.length < this.maxFood) {
            this.spawnFood(1);
        }

        // Clean up old corpses
        this.creatures = this.creatures.filter(c => {
            if (!c.alive && c.deathTime !== undefined) {
                const timeSinceDeath = this.time - c.deathTime;
                if (timeSinceDeath > 180) {
                    this.stats.totalDeaths++;
                    return false;
                }
            }
            return true;
        });

        // Population recovery - respawn creatures if species goes extinct or very low
        // This represents "immigration" and keeps the ecosystem alive
        const minPop = { herbivore: 3, carnivore: 2, scavenger: 2 };
        for (const [type, species] of [['herbivore', SPECIES.HERBIVORE], ['carnivore', SPECIES.CARNIVORE], ['scavenger', SPECIES.SCAVENGER]]) {
            const count = this.creatures.filter(c => c.alive && c.species.type === type).length;
            if (count < minPop[type]) {
                // Chance each frame to spawn a new creature
                if (Math.random() < 0.03) {
                    this.spawnCreatures(species, 1);
                }
            }
        }

        // Soft population control - only cull at extreme overpopulation (4x capacity)
        for (const type of ['herbivore', 'carnivore', 'scavenger']) {
            const cap = this.carryingCapacity[type];
            const alive = this.creatures.filter(c => c.alive && c.species.type === type);
            if (alive.length > cap * 4) {
                const toKill = alive.length - cap * 3;
                for (let i = 0; i < toKill; i++) {
                    const victim = alive[Math.floor(Math.random() * alive.length)];
                    if (victim && victim.alive) {
                        victim.die(this.time, 'overcrowding');
                    }
                }
            }
        }

        this.updateStats();

        // Calculate FPS
        const now = Date.now();
        this.fps = 1000 / (now - this.lastFrameTime);
        this.lastFrameTime = now;
    }

    calculateStress() {
        const stress = {};
        
        for (const type of ['herbivore', 'carnivore', 'scavenger']) {
            const count = this.creatures.filter(c => c.alive && c.species.type === type).length;
            const capacity = this.carryingCapacity[type];
            // Stress starts at 0 when under capacity, grows as population exceeds capacity
            stress[type] = Math.max(0, (count - capacity) / capacity);
        }
        
        const totalCount = this.creatures.filter(c => c.alive).length;
        stress.total = Math.max(0, (totalCount - this.carryingCapacity.total) / this.carryingCapacity.total);
        
        return stress;
    }

    updateStats() {
        this.stats.herbivoreCount = this.creatures.filter(c => c.alive && c.species.type === 'herbivore').length;
        this.stats.carnivoreCount = this.creatures.filter(c => c.alive && c.species.type === 'carnivore').length;
        this.stats.scavengerCount = this.creatures.filter(c => c.alive && c.species.type === 'scavenger').length;
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
        this.canvas.addEventListener('dragstart', e => e.preventDefault());
        this.canvas.addEventListener('drag', e => e.preventDefault());

        // Pause button
        document.getElementById('pause-btn').addEventListener('click', () => this.togglePause());

        // Reset button
        document.getElementById('reset-btn').addEventListener('click', () => {
            if (confirm('Reset the ecosystem?')) {
                this.world.reset();
            }
        });

        // Speed slider
        document.getElementById('speed-slider').addEventListener('input', (e) => {
            this.world.speed = parseFloat(e.target.value);
            document.getElementById('speed-display').textContent = `${this.world.speed}x`;
        });

        // Add food button
        document.getElementById('add-food-btn').addEventListener('click', () => {
            this.world.spawnFood(5);
        });

        // Add creature button
        document.getElementById('add-creature-btn').addEventListener('click', () => {
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

        pauseBtn.textContent = this.world.paused ? '▶ Resume' : '⏸ Pause';
        pauseIndicator.classList.toggle('hidden', !this.world.paused);
    }

    updateUI() {
        // Population stats
        const statsContainer = document.getElementById('population-stats');
        const h = this.world.stats.herbivoreCount;
        const c = this.world.stats.carnivoreCount;
        const s = this.world.stats.scavengerCount;
        
        statsContainer.innerHTML = `
            <div class="stat-item herbivore">
                <span>🌿 Herbivores</span>
                <span>${h}</span>
            </div>
            <div class="stat-item carnivore">
                <span>🔴 Carnivores</span>
                <span>${c}</span>
            </div>
            <div class="stat-item scavenger">
                <span>🟡 Scavengers</span>
                <span>${s}</span>
            </div>
            <div class="stat-item">
                <span>Generation</span>
                <span>${this.world.generation}</span>
            </div>
        `;

        // Environment stats
        document.getElementById('food-count').textContent = this.world.stats.foodCount;
        document.getElementById('time-elapsed').textContent = `${Math.floor(this.world.time / 60)}s`;
    }

    updateInfoPanel(creature) {
        const infoPanel = document.getElementById('info-panel');

        if (!creature) {
            infoPanel.innerHTML = '<p class="hint">Click a creature to inspect it</p>';
            return;
        }

        const energyPercent = Math.round((creature.energy / creature.maxEnergy) * 100);
        const agePercent = Math.round((creature.age / creature.maxLifespan) * 100);
        const energyClass = energyPercent > 50 ? 'good' : energyPercent > 25 ? 'warn' : 'danger';

        infoPanel.innerHTML = `
            <div class="creature-info">
                <div class="creature-header" style="color: ${creature.species.color}">
                    ${creature.species.name} <span class="gen">Gen ${creature.generation}</span>
                </div>
                <div class="stat-row">
                    <span>State</span>
                    <span class="state-${creature.state}">${creature.state}</span>
                </div>
                <div class="stat-row">
                    <span>Energy</span>
                    <span class="${energyClass}">${Math.round(creature.energy)}/${Math.round(creature.maxEnergy)}</span>
                </div>
                <div class="stat-row">
                    <span>Age</span>
                    <span>${creature.age}/${Math.round(creature.maxLifespan)}</span>
                </div>
                <div class="stat-row">
                    <span>Speed</span>
                    <span>${creature.speed.toFixed(1)}</span>
                </div>
                <div class="stat-row">
                    <span>Vision</span>
                    <span>${Math.round(creature.visionRange)}</span>
                </div>
            </div>
        `;
    }

    async start() {
        console.log('⏳ Loading sprites...');
        await this.renderer.waitForSprites();
        console.log('✓ Starting simulation');
        this.loop();
    }

    loop() {
        // Sync world bounds with actual canvas size each frame
        const dims = this.renderer.getDimensions();
        this.world.width = dims.width;
        this.world.height = dims.height;
        
        // Clamp all entities to current bounds (handles window resize)
        this.world.clampToBounds();
        
        this.world.update();
        this.renderer.render(this.world);
        this.updateUI();
        requestAnimationFrame(() => this.loop());
    }
}

// Initialize
window.addEventListener('DOMContentLoaded', () => {
    window.vivarium = new Vivarium();
    console.log('🔬 VIVARIUM ready');
});
