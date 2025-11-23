// Rendering system for VIVARIUM

class Renderer {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.selectedCreature = null;

        // Set canvas size
        this.resize();
        window.addEventListener('resize', () => this.resize());
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
        // Draw plants as small green circles with glow
        this.ctx.shadowBlur = 10;
        this.ctx.shadowColor = '#2ecc40';
        this.ctx.fillStyle = '#2ecc40';
        this.ctx.beginPath();
        this.ctx.arc(food.x, food.y, 4, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.shadowBlur = 0;

        // Add a small stem
        this.ctx.strokeStyle = '#27ae60';
        this.ctx.lineWidth = 1;
        this.ctx.beginPath();
        this.ctx.moveTo(food.x, food.y + 4);
        this.ctx.lineTo(food.x, food.y + 8);
        this.ctx.stroke();
    }

    drawCreature(creature) {
        if (!creature.alive) {
            // Draw corpse
            this.drawCorpse(creature);
            return;
        }

        const ctx = this.ctx;
        const color = creature.species.color;

        // Save context
        ctx.save();
        ctx.translate(creature.x, creature.y);
        ctx.rotate(creature.direction);

        // Glow effect based on energy
        const energyPercent = creature.energy / creature.maxEnergy;
        ctx.shadowBlur = 5 + energyPercent * 10;
        ctx.shadowColor = color;

        // Draw body (simple circle for now - will be replaced with sprites)
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(0, 0, creature.size / 2, 0, Math.PI * 2);
        ctx.fill();

        // Draw direction indicator
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.beginPath();
        ctx.arc(creature.size / 3, 0, creature.size / 6, 0, Math.PI * 2);
        ctx.fill();

        // Draw state indicator
        ctx.shadowBlur = 0;
        this.drawStateIndicator(creature);

        ctx.restore();

        // Draw selection highlight
        if (this.selectedCreature === creature) {
            this.drawSelectionRing(creature);
        }

        // Draw vision range if selected
        if (this.selectedCreature === creature) {
            this.drawVisionRange(creature);
        }

        // Draw energy bar
        this.drawEnergyBar(creature);
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
