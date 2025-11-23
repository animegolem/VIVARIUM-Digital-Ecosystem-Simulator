// Rendering system for VIVARIUM
import { SpriteAtlas, AnimationController } from './sprites.js';

export class Renderer {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.selectedCreature = null;
        this.spriteAtlas = null;
        this.animController = new AnimationController();
        this.ready = false;

        // Load sprites
        this.loadSprites();

        // Set canvas size
        this.resize();
        window.addEventListener('resize', () => this.resize());
    }

    async loadSprites() {
        this.spriteAtlas = new SpriteAtlas();
        await this.spriteAtlas.loadImages();
        this.ready = true;
        console.log('✓ Sprites loaded successfully');
    }

    resize() {
        const rect = this.canvas.getBoundingClientRect();
        this.canvas.width = rect.width;
        this.canvas.height = rect.height;
    }

    clear() {
        // Dark background with subtle gradient
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        gradient.addColorStop(0, '#0a0e1a');
        gradient.addColorStop(1, '#1a1a2e');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Add some ambient "particles" for atmosphere
        this.drawAmbience();
    }

    drawAmbience() {
        this.ctx.fillStyle = 'rgba(0, 255, 65, 0.1)';
        for (let i = 0; i < 20; i++) {
            const x = Math.random() * this.canvas.width;
            const y = Math.random() * this.canvas.height;
            this.ctx.fillRect(x, y, 1, 1);
        }
    }

    drawFood(food) {
        if (!this.ready) {
            // Fallback: Draw simple circle while sprites load
            this.ctx.shadowBlur = 10;
            this.ctx.shadowColor = '#2ecc40';
            this.ctx.fillStyle = '#2ecc40';
            this.ctx.beginPath();
            this.ctx.arc(food.x, food.y, 4, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.shadowBlur = 0;
            return;
        }

        // Use individual grass sprites
        const grassSprites = this.spriteAtlas.images.grass;
        if (grassSprites && grassSprites.length > 0) {
            // Pick a grass sprite based on growth stage (0-6)
            const growth = Math.floor(food.growth || 0);
            const spriteIndex = Math.min(growth, grassSprites.length - 1);
            const grassImage = grassSprites[spriteIndex];

            if (grassImage && grassImage.complete) {
                const scale = 0.3;
                const width = grassImage.width * scale;
                const height = grassImage.height * scale;
                this.ctx.drawImage(
                    grassImage,
                    food.x - width / 2,
                    food.y - height / 2,
                    width,
                    height
                );
            }
        }
    }

    drawCreature(creature) {
        const ctx = this.ctx;

        // Determine max frames based on species and state
        const state = this.getCreatureSpriteState(creature);
        const maxFrames = this.getMaxFramesForState(creature.species.type, state);
        this.animController.registerEntity(creature.id, maxFrames);

        if (!this.ready) {
            // Fallback: draw simple circles while sprites load
            const color = creature.alive ? creature.species.color : 'rgba(100, 100, 100, 0.3)';
            ctx.save();
            ctx.translate(creature.x, creature.y);
            if (creature.alive) {
                ctx.rotate(creature.direction);
            }
            ctx.shadowBlur = 5;
            ctx.shadowColor = color;
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.arc(0, 0, creature.size / 2, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
            if (creature.alive) {
                this.drawEnergyBar(creature);
            }
            return;
        }

        // Determine which sprite to use based on species and state
        const spriteType = creature.species.type;
        const state = this.getCreatureSpriteState(creature);
        const frame = this.animController.getFrame(creature.id);

        // Save context for rotation
        ctx.save();
        ctx.translate(creature.x, creature.y);

        // Flip sprite based on direction (only for living creatures)
        if (creature.alive) {
            const facingLeft = creature.direction > Math.PI / 2 && creature.direction < 3 * Math.PI / 2;
            if (facingLeft) {
                ctx.scale(-1, 1);
            }
        }

        // Draw sprite based on type
        const scale = 0.4;

        if (spriteType === 'herbivore' || spriteType === 'carnivore' || spriteType === 'scavenger') {
            // All creatures now use individual PNG files
            let spriteImage;
            if (spriteType === 'herbivore') {
                spriteImage = this.spriteAtlas.getHerbivoreSprite(state, frame);
            } else if (spriteType === 'carnivore') {
                spriteImage = this.spriteAtlas.getCarnivoreSprite(state, frame);
            } else {
                spriteImage = this.spriteAtlas.getScavengerSprite(state, frame);
            }

            if (spriteImage && spriteImage.complete) {
                const width = spriteImage.width * scale;
                const height = spriteImage.height * scale;
                // Add slight transparency to dead creatures
                if (!creature.alive) {
                    ctx.globalAlpha = 0.7;
                }
                ctx.drawImage(spriteImage, -width / 2, -height / 2, width, height);
                ctx.globalAlpha = 1.0;
            }
        } else {
            ctx.restore();
            return; // Unknown species
        }

        ctx.restore();

        // Draw selection highlight
        if (this.selectedCreature === creature) {
            this.drawSelectionRing(creature);
        }

        // Draw vision range if selected
        if (this.selectedCreature === creature && creature.alive) {
            this.drawVisionRange(creature);
        }

        // Draw energy bar for living creatures
        if (creature.alive) {
            this.drawEnergyBar(creature);
        }
    }

    getCreatureSpriteState(creature) {
        // Map creature state to sprite animation state
        const type = creature.species.type;

        switch (creature.state) {
            case 'seeking':
            case 'idle':
                return 'walk';
            case 'eating':
                // All creatures have eating animations now
                return 'eating';
            case 'fleeing':
                return 'walk';
            case 'hunting':
                return type === 'carnivore' ? 'hunting' : 'walk';
            case 'dead':
                return 'dead';
            default:
                return 'walk';
        }
    }

    getMaxFramesForState(speciesType, state) {
        // Return the correct number of frames for each species/state combination
        const frameCounts = {
            herbivore: {
                walk: 6,
                eating: 2,
                mating: 4,
                dead: 6
            },
            carnivore: {
                walk: 5,
                eating: 3,
                hunting: 4,
                dead: 3
            },
            scavenger: {
                walk: 6,
                eating: 3,
                scavenging: 4,
                dead: 3
            }
        };

        return frameCounts[speciesType]?.[state] || 6;
    }

    drawStateIndicator(creature) {
        const ctx = this.ctx;
        const symbols = {
            'seeking': '🍃',
            'eating': '🍽',
            'fleeing': '💨',
            'hunting': '🎯'
        };

        if (symbols[creature.state]) {
            ctx.font = '12px Arial';
            ctx.fillText(symbols[creature.state], creature.size / 2, -creature.size / 2);
        }
    }

    drawEnergyBar(creature) {
        const ctx = this.ctx;
        const barWidth = creature.size;
        const barHeight = 3;
        const x = creature.x - barWidth / 2;
        const y = creature.y - creature.size / 2 - 8;

        // Background
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(x, y, barWidth, barHeight);

        // Energy level
        const energyPercent = Math.max(0, creature.energy / creature.maxEnergy);
        const energyColor = energyPercent > 0.5 ? '#2ecc40' :
                           energyPercent > 0.25 ? '#FFC107' : '#F44336';
        ctx.fillStyle = energyColor;
        ctx.fillRect(x, y, barWidth * energyPercent, barHeight);
    }

    drawSelectionRing(creature) {
        const ctx = this.ctx;
        ctx.strokeStyle = '#00d4ff';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.arc(creature.x, creature.y, creature.size / 2 + 5, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
    }

    drawVisionRange(creature) {
        const ctx = this.ctx;
        ctx.strokeStyle = 'rgba(0, 212, 255, 0.2)';
        ctx.lineWidth = 1;
        ctx.setLineDash([3, 3]);
        ctx.beginPath();
        ctx.arc(creature.x, creature.y, creature.visionRange, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
    }

    drawCorpse(creature) {
        const ctx = this.ctx;
        ctx.fillStyle = 'rgba(100, 100, 100, 0.3)';
        ctx.beginPath();
        ctx.arc(creature.x, creature.y, creature.size / 2, 0, Math.PI * 2);
        ctx.fill();
    }

    drawStats(world) {
        const ctx = this.ctx;
        ctx.font = '12px Courier New';
        ctx.fillStyle = '#00ff41';

        const stats = [
            `FPS: ${Math.round(world.fps || 0)}`,
            `Creatures: ${world.creatures.filter(c => c.alive).length}`,
            `Food: ${world.food.length}`
        ];

        stats.forEach((stat, i) => {
            ctx.fillText(stat, 10, 20 + i * 15);
        });
    }

    getCreatureAtPosition(x, y, creatures) {
        // Convert canvas coordinates to world coordinates
        const rect = this.canvas.getBoundingClientRect();
        const worldX = (x - rect.left) * (this.canvas.width / rect.width);
        const worldY = (y - rect.top) * (this.canvas.height / rect.height);

        // Find creature at position (check from front to back)
        for (let i = creatures.length - 1; i >= 0; i--) {
            const creature = creatures[i];
            if (!creature.alive) continue;

            const dx = worldX - creature.x;
            const dy = worldY - creature.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < creature.size / 2) {
                return creature;
            }
        }

        return null;
    }

    setSelectedCreature(creature) {
        this.selectedCreature = creature;
    }

    render(world) {
        this.clear();

        // Update animations
        this.animController.update();

        // Draw food
        world.food.forEach(food => this.drawFood(food));

        // Draw dead creatures (corpses)
        world.creatures.filter(c => !c.alive).forEach(c => this.drawCreature(c));

        // Draw living creatures
        world.creatures.filter(c => c.alive).forEach(c => this.drawCreature(c));

        // Draw stats overlay
        this.drawStats(world);
    }
}
