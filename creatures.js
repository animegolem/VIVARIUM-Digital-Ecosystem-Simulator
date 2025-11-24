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
        this.energy = this.maxEnergy * 0.7; // Start with good energy reserves
        this.age = 0;
        this.alive = true;
        this.direction = Math.random() * Math.PI * 2;
        this.state = 'idle'; // idle, seeking, eating, fleeing, hunting
        this.target = null;
        this.timeSinceReproduction = 0;
        
        // Eating behavior - creatures pause while eating
        this.eatingTimer = 0;
        this.eatingDuration = 40; // frames to spend eating (increased for visibility)
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

        // If currently eating, count down and stay in eating state
        if (this.eatingTimer > 0) {
            this.eatingTimer--;
            this.state = 'eating';
            // Log state changes
            if (oldState !== this.state && window.eventLog) {
                window.eventLog.log('creature', `${this.species.name} started eating`, {
                    frame: world.time,
                    species: this.species.name,
                    id: this.id
                });
            }
            return null; // Don't move or change behavior while eating
        }

        // Behavior based on species
        if (this.species.type === 'herbivore') {
            this.herbivoreAI(world);
        } else if (this.species.type === 'carnivore') {
            this.carnivoreAI(world);
        } else if (this.species.type === 'scavenger') {
            this.scavengerAI(world);
        }

        // Log state changes (but not for eating - that's handled above)
        if (oldState !== this.state && this.state !== 'eating' && window.eventLog) {
            window.eventLog.log('creature', `${this.species.name} ${oldState} → ${this.state}`, {
                frame: world.time,
                species: this.species.name,
                oldState,
                newState: this.state,
                energy: Math.round(this.energy),
                id: this.id
            });
        }

        // Move (only if not eating)
        if (this.state !== 'eating') {
            this.move(world);
        }

        // Try to reproduce if conditions are met
        if (this.canReproduce(world)) {
            return this.reproduce(world);
        }

        return null;
    }

    herbivoreAI(world) {
        // Flee from predators first - survival priority
        const nearbyPredators = this.findNearby(
            world.creatures.filter(c => c.alive && c.species.type === 'carnivore'),
            this.visionRange
        );

        if (nearbyPredators.length > 0) {
            this.state = 'fleeing';
            this.fleeFrom(nearbyPredators[0]);
            return;
        }

        // Look for food (plants) when hungry
        if (this.energy < this.maxEnergy * 0.75) {
            const nearbyFood = this.findNearby(world.food, this.visionRange);
            if (nearbyFood.length > 0) {
                this.state = 'seeking';
                this.target = nearbyFood[0];
                this.moveToward(this.target);

                // Eat if close enough
                if (this.distanceTo(this.target) < this.size + 5) {
                    this.eat(world, this.target);
                }
                return;
            }
        }

        // Wander randomly
        this.state = 'idle';
        this.wander();
    }

    carnivoreAI(world) {
        // Hunt herbivores primarily, scavengers as secondary prey
        const herbivores = world.creatures.filter(c => c.alive && c.species.type === 'herbivore');
        const scavengers = world.creatures.filter(c => c.alive && c.species.type === 'scavenger');
        
        // Prefer herbivores (they're meatier), but hunt scavengers if no herbivores around
        let prey = this.findNearby(herbivores, this.visionRange);
        if (prey.length === 0) {
            prey = this.findNearby(scavengers, this.visionRange);
        }

        if (prey.length > 0 && this.energy < this.maxEnergy * 0.85) {
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
        // Flee from carnivores first - survival priority (with full vision range now)
        const nearbyPredators = this.findNearby(
            world.creatures.filter(c => c.alive && c.species.type === 'carnivore'),
            this.visionRange
        );

        if (nearbyPredators.length > 0) {
            this.state = 'fleeing';
            this.fleeFrom(nearbyPredators[0]);
            return;
        }

        // Only look for food when hungry
        if (this.energy < this.maxEnergy * 0.7) {
            // Look for corpses or plants
            const nearbyCorpses = this.findNearbyCorpses(world.creatures, this.visionRange)
                .filter(c => !c.consumed);
            const nearbyFood = this.findNearby(world.food, this.visionRange);

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

            if (target) {
                this.state = 'seeking';
                this.target = target;
                this.moveToward(this.target);

                if (this.distanceTo(this.target) < this.size + 5) {
                    if (isCorpse) {
                        this.eatCorpse(world, target);
                    } else {
                        this.eat(world, this.target);
                    }
                }
                return;
            }
        }

        this.state = 'idle';
        this.wander();
    }

    findNearby(items, range) {
        return items
            .filter(item => item !== this && (item.alive !== false))
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

        // Wrap around edges
        if (this.x < 0) this.x = world.width;
        if (this.x > world.width) this.x = 0;
        if (this.y < 0) this.y = world.height;
        if (this.y > world.height) this.y = 0;
    }

    eat(world, food) {
        // Energy gained scales with food growth stage
        const growthBonus = 1 + (food.growth / 6) * 0.5; // Up to 50% bonus at full growth
        const baseEnergy = food.energy || 20;
        const energyGain = Math.floor(baseEnergy * growthBonus);
        
        this.energy = Math.min(this.energy + energyGain, this.maxEnergy);
        this.state = 'eating';
        this.eatingTimer = this.eatingDuration;

        // Remove food from world
        const foodIndex = world.food.indexOf(food);
        if (foodIndex > -1) {
            world.food.splice(foodIndex, 1);
        }
    }

    eatCorpse(world, corpse) {
        // Mark corpse as consumed so others can't eat it
        if (corpse.consumed) {
            return; // Already eaten by another scavenger
        }
        corpse.consumed = true;
        
        // Energy from corpse - reduced from before
        const energyGain = 30;
        this.energy = Math.min(this.energy + energyGain, this.maxEnergy);
        this.state = 'eating';
        this.eatingTimer = this.eatingDuration;
    }

    attack(world, prey) {
        const attackPower = this.genome.get('attackPower') || 25;
        prey.energy -= attackPower;
        
        // Attacking costs energy
        this.energy -= 3;

        if (prey.energy <= 0) {
            prey.die(world.time, 'predation');
            // Gain energy from kill
            const energyGain = 40;
            this.energy = Math.min(this.energy + energyGain, this.maxEnergy);
            this.state = 'eating';
            this.eatingTimer = this.eatingDuration;
        }
    }

    canReproduce(world) {
        // Check basic requirements
        if (this.energy < this.reproductionThreshold) return false;
        if (this.timeSinceReproduction < 200) return false; // Cooldown
        if (this.age < 100) return false; // Must be mature
        
        // Check population cap - soft limit
        const mySpeciesCount = world.creatures.filter(
            c => c.alive && c.species.type === this.species.type
        ).length;
        const cap = world.carryingCapacity[this.species.type] || 30;
        
        // Hard cap at 3x capacity
        if (mySpeciesCount >= cap * 3) return false;
        
        // Probabilistic reduction only when significantly over capacity
        if (mySpeciesCount > cap * 1.5) {
            const overCapRatio = (mySpeciesCount - cap) / cap;
            if (Math.random() < overCapRatio * 0.5) return false;
        }
        
        return true;
    }

    reproduce(world) {
        // Find nearby mate of same species
        const mates = world.creatures.filter(c =>
            c !== this &&
            c.alive &&
            c.species.name === this.species.name &&
            c.canReproduce(world) &&
            this.distanceTo(c) < this.visionRange / 2
        );

        if (mates.length > 0) {
            const mate = mates[0];

            // Create offspring
            const childGenome = this.genome.crossover(mate.genome).mutate();
            const angle = Math.random() * Math.PI * 2;
            const distance = 30 + Math.random() * 20;
            const child = new Creature(
                this.x + Math.cos(angle) * distance,
                this.y + Math.sin(angle) * distance,
                this.species,
                childGenome,
                Math.max(this.generation, mate.generation) + 1
            );

            // Reproduction cost - 50% of threshold
            const cost = this.reproductionThreshold * 0.5;
            this.energy -= cost;
            mate.energy -= cost;
            this.timeSinceReproduction = 0;
            mate.timeSinceReproduction = 0;

            return child;
        }

        return null;
    }

    die(worldTime, cause = 'unknown') {
        this.alive = false;
        this.state = 'dead';
        this.deathTime = worldTime || 0;
        this.consumed = false;
    }
}

// Species definitions
export class Species {
    constructor(name, type, color, description) {
        this.name = name;
        this.type = type;
        this.color = color;
        this.description = description;
    }
}

export const SPECIES = {
    HERBIVORE: new Species(
        'Herbivore',
        'herbivore',
        '#4CAF50',
        'Peaceful grazers that eat plants and flee from predators.'
    ),
    CARNIVORE: new Species(
        'Carnivore',
        'carnivore',
        '#F44336',
        'Apex predators that hunt herbivores and scavengers.'
    ),
    SCAVENGER: new Species(
        'Scavenger',
        'scavenger',
        '#FFC107',
        'Opportunists that eat plants and corpses while avoiding carnivores.'
    )
};

// Food sources
export class Food {
    constructor(x, y, energy = null, type = null) {
        this.x = x;
        this.y = y;
        this.alive = true;
        this.age = 0;

        // Food types: grass, mushroom, crystal
        const foodTypes = ['grass', 'mushroom', 'crystal'];
        this.type = type || foodTypes[Math.floor(Math.random() * foodTypes.length)];

        // Base energy by type (before growth bonus)
        this.energy = energy || (this.type === 'grass' ? 15 : this.type === 'mushroom' ? 20 : 30);

        // Growth stage (0-6)
        this.growth = 0;
    }

    update() {
        this.age++;

        // Grow over time
        if (this.growth < 6) {
            this.growth = Math.min(this.age / 120, 6);
        }

        // Food decays after a while
        if (this.age > 800) {
            this.alive = false;
        }
    }
}
