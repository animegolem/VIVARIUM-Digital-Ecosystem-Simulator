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

        const oldState = this.state;
        this.age++;
        this.energy -= this.metabolism;
        this.timeSinceReproduction++;

        // Die from old age or starvation
        if (this.age > this.maxLifespan || this.energy <= 0) {
            const cause = this.age > this.maxLifespan ? 'old age' : 'starvation';
            this.die(world.time, cause);
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

        // Log state changes
        if (oldState !== this.state && window.eventLog) {
            window.eventLog.log('creature', `${this.species.name} ${oldState} → ${this.state}`, {
                frame: world.time,
                species: this.species.name,
                oldState,
                newState: this.state,
                energy: Math.round(this.energy),
                id: this.id
            });
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
        const nearbyCorpses = this.findNearbyCorpses(world.creatures, this.visionRange);

        // Prefer corpses over plants (more energy)
        let target = null;
        let isCorpse = false;
        if (nearbyCorpses.length > 0) {
            target = nearbyCorpses[0];
            isCorpse = true;
        } else if (nearbyFood.length > 0) {
            target = nearbyFood[0];
            isCorpse = false;
        }

        if (target && this.energy < this.maxEnergy * 0.8) {
            this.state = 'seeking';
            this.target = target;
            this.moveToward(this.target);

            if (this.distanceTo(this.target) < this.size) {
                if (isCorpse) {
                    // Eating a corpse
                    this.eatCorpse(target);
                } else {
                    // Eating plants
                    this.eat(world, this.target);
                }
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

    findNearbyCorpses(items, range) {
        return items
            .filter(item => item !== this && !item.alive)
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

        if (window.eventLog) {
            window.eventLog.log('food', `${this.species.name} ate ${food.type || 'food'}`, {
                frame: world.time,
                species: this.species.name,
                energyGain,
                foodType: food.type,
                id: this.id
            });
        }

        // Remove food from world
        const foodIndex = world.food.indexOf(food);
        if (foodIndex > -1) {
            world.food.splice(foodIndex, 1);
        }
    }

    eatCorpse(corpse) {
        // Gain more energy from corpses (40 energy)
        const energyGain = 40;
        this.energy = Math.min(this.energy + energyGain, this.maxEnergy);
        this.state = 'eating';

        if (window.eventLog) {
            window.eventLog.log('corpse', `${this.species.name} scavenged ${corpse.species.name} corpse`, {
                frame: window.world?.time || 0,
                scavenger: this.species.name,
                corpseSpecies: corpse.species.name,
                energyGain,
                id: this.id,
                corpseId: corpse.id
            });
        }

        // Note: corpse remains in world to be cleaned up by the decay system
    }

    attack(world, prey) {
        const attackPower = this.genome.get('attackPower') || 20;
        prey.energy -= attackPower;

        if (window.eventLog) {
            window.eventLog.log('creature', `${this.species.name} attacked ${prey.species.name}`, {
                frame: world.time,
                attacker: this.species.name,
                prey: prey.species.name,
                damage: attackPower,
                preyEnergy: Math.round(prey.energy),
                id: this.id,
                preyId: prey.id
            });
        }

        if (prey.energy <= 0) {
            prey.die(world.time, 'predation');
            // Gain energy from kill
            this.energy = Math.min(this.energy + 50, this.maxEnergy);

            if (window.eventLog) {
                window.eventLog.log('energy', `${this.species.name} gained 50 energy from kill`, {
                    frame: world.time,
                    species: this.species.name,
                    energyGain: 50,
                    newEnergy: Math.round(this.energy),
                    id: this.id
                });
            }
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
            // Spawn child with better spacing to avoid clustering
            const angle = Math.random() * Math.PI * 2;
            const distance = 30 + Math.random() * 20; // 30-50 pixels away
            const child = new Creature(
                this.x + Math.cos(angle) * distance,
                this.y + Math.sin(angle) * distance,
                this.species,
                childGenome,
                Math.max(this.generation, mate.generation) + 1
            );

            // Reproduction cost
            this.energy -= this.reproductionThreshold * 0.5;
            mate.energy -= mate.reproductionThreshold * 0.5;
            this.timeSinceReproduction = 0;
            mate.timeSinceReproduction = 0;

            if (window.eventLog) {
                window.eventLog.log('reproduction', `${this.species.name} reproduced (Gen ${child.generation})`, {
                    frame: world.time,
                    species: this.species.name,
                    generation: child.generation,
                    parent1: this.id,
                    parent2: mate.id,
                    childId: child.id
                });
            }

            return child;
        }

        return null;
    }

    die(worldTime, cause = 'unknown') {
        this.alive = false;
        this.state = 'dead';
        this.deathTime = worldTime || 0; // Track when creature died (world time)

        if (window.eventLog) {
            window.eventLog.log('creature', `${this.species.name} died from ${cause}`, {
                frame: worldTime,
                species: this.species.name,
                cause,
                age: this.age,
                generation: this.generation,
                id: this.id
            });
        }
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
    constructor(x, y, energy = 30, type = null) {
        this.x = x;
        this.y = y;
        this.alive = true;
        this.age = 0;

        // Food types: grass, mushroom, crystal
        const foodTypes = ['grass', 'mushroom', 'crystal'];
        this.type = type || foodTypes[Math.floor(Math.random() * foodTypes.length)];

        // Set energy based on type
        if (!energy || energy === 30) {
            this.energy = this.type === 'grass' ? 25 : this.type === 'mushroom' ? 30 : 40;
        } else {
            this.energy = energy;
        }

        // Growth stage (0-6)
        this.growth = 0;
    }

    update() {
        this.age++;

        // Grow over time up to max stage
        if (this.growth < 6) {
            this.growth = Math.min(this.age / 150, 6);
        }

        // Food decays after a while
        if (this.age > 1000) {
            this.alive = false;
        }
    }
}
