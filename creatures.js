// Creature definitions and behaviors for VIVARIUM
import { Genome } from './genetics.js';

export class Creature {
    constructor(x, y, species, genome, generation = 1) {
        this.id = Math.random().toString(36).substr(2, 9);
        this.x = x;
        this.y = y;
        this.species = species;
        this.genome = genome;
        this.generation = generation;

        // Derived stats from genome
        this.speed = this.genome.get('speed');
        this.size = this.genome.get('size');
        this.visionRange = this.genome.get('visionRange');
        this.metabolism = this.genome.get('metabolism');
        this.maxEnergy = this.genome.get('maxEnergy');
        this.reproductionThreshold = this.genome.get('reproductionThreshold');
        this.maxLifespan = this.genome.get('lifespan');

        // Current state
        this.energy = this.maxEnergy * 0.7;
        this.age = 0;
        this.alive = true;
        this.direction = Math.random() * Math.PI * 2;
        this.state = 'idle'; // idle, seeking, eating, fleeing, hunting
        this.target = null;
        this.timeSinceReproduction = 0;
    }

    update(world) {
        if (!this.alive) return;

        this.age++;
        this.energy -= this.metabolism;
        this.timeSinceReproduction++;

        // Die from old age or starvation
        if (this.age > this.maxLifespan || this.energy <= 0) {
            this.die();
            return;
        }

        // Behavior based on species
        if (this.species.type === 'herbivore') {
            this.herbivoreAI(world);
        } else if (this.species.type === 'carnivore') {
            this.carnivoreAI(world);
        } else if (this.species.type === 'scavenger') {
            this.scavengerAI(world);
        }

        // Move
        this.move(world);

        // Try to reproduce if conditions are met
        if (this.canReproduce()) {
            return this.reproduce(world);
        }

        return null;
    }

    herbivoreAI(world) {
        // Look for food (plants)
        const nearbyFood = this.findNearby(world.food, this.visionRange);

        if (nearbyFood.length > 0 && this.energy < this.maxEnergy * 0.8) {
            this.state = 'seeking';
            this.target = nearbyFood[0];
            this.moveToward(this.target);

            // Eat if close enough
            if (this.distanceTo(this.target) < this.size) {
                this.eat(world, this.target);
            }
        } else {
            // Wander randomly
            this.state = 'idle';
            this.wander();
        }

        // Flee from predators
        const nearbyPredators = this.findNearby(
            world.creatures.filter(c => c.species.type === 'carnivore'),
            this.visionRange
        );

        if (nearbyPredators.length > 0) {
            this.state = 'fleeing';
            this.fleeFrom(nearbyPredators[0]);
        }
    }

    carnivoreAI(world) {
        // Hunt herbivores or scavengers
        const prey = this.findNearby(
            world.creatures.filter(c =>
                c.species.type === 'herbivore' || c.species.type === 'scavenger'
            ),
            this.visionRange
        );

        if (prey.length > 0 && this.energy < this.maxEnergy * 0.7) {
            this.state = 'hunting';
            this.target = prey[0];
            this.moveToward(this.target);

            // Attack if close enough
            if (this.distanceTo(this.target) < this.size + this.target.size) {
                this.attack(world, this.target);
            }
        } else {
            // Wander
            this.state = 'idle';
            this.wander();
        }
    }

    scavengerAI(world) {
        // Look for corpses or plants
        const nearbyFood = this.findNearby(world.food, this.visionRange);

        if (nearbyFood.length > 0 && this.energy < this.maxEnergy * 0.8) {
            this.state = 'seeking';
            this.target = nearbyFood[0];
            this.moveToward(this.target);

            if (this.distanceTo(this.target) < this.size) {
                this.eat(world, this.target);
            }
        } else {
            this.state = 'idle';
            this.wander();
        }

        // Flee from carnivores
        const nearbyPredators = this.findNearby(
            world.creatures.filter(c => c.species.type === 'carnivore'),
            this.visionRange * 0.8
        );

        if (nearbyPredators.length > 0) {
            this.state = 'fleeing';
            this.fleeFrom(nearbyPredators[0]);
        }
    }

    findNearby(items, range) {
        return items
            .filter(item => item !== this && item.alive)
            .filter(item => this.distanceTo(item) < range)
            .sort((a, b) => this.distanceTo(a) - this.distanceTo(b));
    }

    distanceTo(target) {
        const dx = target.x - this.x;
        const dy = target.y - this.y;
        return Math.sqrt(dx * dx + dy * dy);
    }

    moveToward(target) {
        const dx = target.x - this.x;
        const dy = target.y - this.y;
        this.direction = Math.atan2(dy, dx);
    }

    fleeFrom(threat) {
        const dx = this.x - threat.x;
        const dy = this.y - threat.y;
        this.direction = Math.atan2(dy, dx);
    }

    wander() {
        // Slightly adjust direction randomly
        this.direction += (Math.random() - 0.5) * 0.3;
    }

    move(world) {
        this.x += Math.cos(this.direction) * this.speed;
        this.y += Math.sin(this.direction) * this.speed;

        // Wrap around edges or bounce
        if (this.x < 0) this.x = world.width;
        if (this.x > world.width) this.x = 0;
        if (this.y < 0) this.y = world.height;
        if (this.y > world.height) this.y = 0;
    }

    eat(world, food) {
        const energyGain = food.energy || 30;
        this.energy = Math.min(this.energy + energyGain, this.maxEnergy);
        this.state = 'eating';

        // Remove food from world
        const foodIndex = world.food.indexOf(food);
        if (foodIndex > -1) {
            world.food.splice(foodIndex, 1);
        }
    }

    attack(world, prey) {
        const attackPower = this.genome.get('attackPower') || 20;
        prey.energy -= attackPower;

        if (prey.energy <= 0) {
            prey.die();
            // Gain energy from kill
            this.energy = Math.min(this.energy + 50, this.maxEnergy);
        }
    }

    canReproduce() {
        return (
            this.energy >= this.reproductionThreshold &&
            this.timeSinceReproduction > 100 &&
            this.age > 50
        );
    }

    reproduce(world) {
        // Find nearby mate of same species
        const mates = world.creatures.filter(c =>
            c !== this &&
            c.alive &&
            c.species.name === this.species.name &&
            c.canReproduce() &&
            this.distanceTo(c) < this.visionRange / 2
        );

        if (mates.length > 0) {
            const mate = mates[0];

            // Create offspring
            const childGenome = this.genome.crossover(mate.genome).mutate();
            const child = new Creature(
                this.x + (Math.random() - 0.5) * 20,
                this.y + (Math.random() - 0.5) * 20,
                this.species,
                childGenome,
                Math.max(this.generation, mate.generation) + 1
            );

            // Reproduction cost
            this.energy -= this.reproductionThreshold * 0.5;
            mate.energy -= mate.reproductionThreshold * 0.5;
            this.timeSinceReproduction = 0;
            mate.timeSinceReproduction = 0;

            return child;
        }

        return null;
    }

    die() {
        this.alive = false;
        this.state = 'dead';
    }
}

// Species definitions
export class Species {
    constructor(name, type, color, description) {
        this.name = name;
        this.type = type; // herbivore, carnivore, scavenger
        this.color = color;
        this.description = description;
    }
}

export const SPECIES = {
    HERBIVORE: new Species(
        'Herbivore',
        'herbivore',
        '#4CAF50',
        'Peaceful plant-eaters. They seek food, flee from predators, and reproduce when well-fed.'
    ),
    CARNIVORE: new Species(
        'Carnivore',
        'carnivore',
        '#F44336',
        'Aggressive hunters. They chase and attack herbivores and scavengers for food.'
    ),
    SCAVENGER: new Species(
        'Scavenger',
        'scavenger',
        '#FFC107',
        'Opportunistic feeders. They eat plants and corpses, and avoid carnivores.'
    )
};

// Food sources
export class Food {
    constructor(x, y, energy = 30) {
        this.x = x;
        this.y = y;
        this.energy = energy;
        this.alive = true;
        this.age = 0;
    }

    update() {
        this.age++;
        // Food decays after a while
        if (this.age > 1000) {
            this.alive = false;
        }
    }
}
