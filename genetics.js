// Genetics and Evolution System for VIVARIUM

export class Gene {
    constructor(value, mutationRate = 0.1, mutationAmount = 0.2) {
        this.value = value;
        this.mutationRate = mutationRate;
        this.mutationAmount = mutationAmount;
    }

    mutate() {
        if (Math.random() < this.mutationRate) {
            const change = (Math.random() - 0.5) * 2 * this.mutationAmount;
            return new Gene(
                this.value + change,
                this.mutationRate,
                this.mutationAmount
            );
        }
        return new Gene(this.value, this.mutationRate, this.mutationAmount);
    }

    crossover(other) {
        const mix = Math.random();
        const newValue = this.value * mix + other.value * (1 - mix);
        return new Gene(newValue, this.mutationRate, this.mutationAmount);
    }
}

export class Genome {
    constructor(genes = {}) {
        this.genes = genes;
    }

    get(name) {
        return this.genes[name]?.value ?? 0;
    }

    mutate() {
        const mutatedGenes = {};
        for (const [name, gene] of Object.entries(this.genes)) {
            mutatedGenes[name] = gene.mutate();
        }
        return new Genome(mutatedGenes);
    }

    crossover(other) {
        const childGenes = {};
        const allGeneNames = new Set([
            ...Object.keys(this.genes),
            ...Object.keys(other.genes)
        ]);

        for (const name of allGeneNames) {
            const gene1 = this.genes[name];
            const gene2 = other.genes[name];

            if (gene1 && gene2) {
                childGenes[name] = gene1.crossover(gene2);
            } else {
                childGenes[name] = (gene1 || gene2).mutate();
            }
        }

        return new Genome(childGenes);
    }

    static createRandom(template) {
        const genes = {};
        for (const [name, config] of Object.entries(template)) {
            const value = config.min + Math.random() * (config.max - config.min);
            genes[name] = new Gene(
                value,
                config.mutationRate || 0.1,
                config.mutationAmount || 0.2
            );
        }
        return new Genome(genes);
    }
}

// Genome templates - balanced for ecosystem stability
export const GenomeTemplates = {
    herbivore: {
        speed: { min: 0.8, max: 2.0, mutationRate: 0.12, mutationAmount: 0.25 },
        size: { min: 10, max: 18, mutationRate: 0.1, mutationAmount: 0.2 },
        visionRange: { min: 60, max: 120, mutationRate: 0.12, mutationAmount: 0.2 },
        metabolism: { min: 0.03, max: 0.08, mutationRate: 0.1, mutationAmount: 0.15 },
        maxEnergy: { min: 120, max: 200, mutationRate: 0.1, mutationAmount: 0.2 },
        reproductionThreshold: { min: 110, max: 150, mutationRate: 0.08, mutationAmount: 0.15 },
        lifespan: { min: 1500, max: 2500, mutationRate: 0.1, mutationAmount: 0.2 }
    },

    carnivore: {
        speed: { min: 1.5, max: 3.0, mutationRate: 0.12, mutationAmount: 0.25 },
        size: { min: 12, max: 22, mutationRate: 0.1, mutationAmount: 0.2 },
        visionRange: { min: 100, max: 180, mutationRate: 0.12, mutationAmount: 0.2 },
        metabolism: { min: 0.06, max: 0.12, mutationRate: 0.1, mutationAmount: 0.15 },
        maxEnergy: { min: 150, max: 250, mutationRate: 0.1, mutationAmount: 0.2 },
        reproductionThreshold: { min: 140, max: 200, mutationRate: 0.08, mutationAmount: 0.15 },
        lifespan: { min: 1200, max: 2000, mutationRate: 0.1, mutationAmount: 0.2 },
        attackPower: { min: 20, max: 35, mutationRate: 0.15, mutationAmount: 0.25 }
    },

    scavenger: {
        // Scavengers: slower, higher metabolism, shorter lives - they're opportunists not dominators
        speed: { min: 0.6, max: 1.8, mutationRate: 0.12, mutationAmount: 0.25 },
        size: { min: 8, max: 14, mutationRate: 0.1, mutationAmount: 0.2 },
        visionRange: { min: 70, max: 140, mutationRate: 0.12, mutationAmount: 0.2 },
        metabolism: { min: 0.05, max: 0.10, mutationRate: 0.1, mutationAmount: 0.15 }, // Higher metabolism
        maxEnergy: { min: 100, max: 160, mutationRate: 0.1, mutationAmount: 0.2 }, // Lower max energy
        reproductionThreshold: { min: 120, max: 160, mutationRate: 0.08, mutationAmount: 0.15 }, // Higher threshold
        lifespan: { min: 1000, max: 1800, mutationRate: 0.1, mutationAmount: 0.2 } // Shorter lives
    }
};
