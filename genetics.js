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
        // Average of parent genes with some randomness
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
                // If only one parent has the gene, inherit it with mutation
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

    clone() {
        const clonedGenes = {};
        for (const [name, gene] of Object.entries(this.genes)) {
            clonedGenes[name] = new Gene(
                gene.value,
                gene.mutationRate,
                gene.mutationAmount
            );
        }
        return new Genome(clonedGenes);
    }
}

// Standard genome templates for different species
export const GenomeTemplates = {
    herbivore: {
        speed: { min: 0.5, max: 2.5, mutationRate: 0.15, mutationAmount: 0.3 },
        size: { min: 8, max: 20, mutationRate: 0.1, mutationAmount: 0.2 },
        visionRange: { min: 50, max: 150, mutationRate: 0.12, mutationAmount: 0.25 },
        metabolism: { min: 0.05, max: 0.3, mutationRate: 0.1, mutationAmount: 0.2 },
        maxEnergy: { min: 80, max: 200, mutationRate: 0.1, mutationAmount: 0.2 },
        reproductionThreshold: { min: 120, max: 180, mutationRate: 0.08, mutationAmount: 0.15 },
        lifespan: { min: 300, max: 600, mutationRate: 0.1, mutationAmount: 0.2 }
    },

    carnivore: {
        speed: { min: 1.5, max: 4, mutationRate: 0.15, mutationAmount: 0.3 },
        size: { min: 10, max: 25, mutationRate: 0.1, mutationAmount: 0.2 },
        visionRange: { min: 80, max: 200, mutationRate: 0.12, mutationAmount: 0.25 },
        metabolism: { min: 0.1, max: 0.4, mutationRate: 0.1, mutationAmount: 0.2 },
        maxEnergy: { min: 100, max: 250, mutationRate: 0.1, mutationAmount: 0.2 },
        reproductionThreshold: { min: 150, max: 220, mutationRate: 0.08, mutationAmount: 0.15 },
        lifespan: { min: 250, max: 500, mutationRate: 0.1, mutationAmount: 0.2 },
        attackPower: { min: 15, max: 40, mutationRate: 0.15, mutationAmount: 0.3 }
    },

    scavenger: {
        speed: { min: 1, max: 3, mutationRate: 0.15, mutationAmount: 0.3 },
        size: { min: 6, max: 15, mutationRate: 0.1, mutationAmount: 0.2 },
        visionRange: { min: 60, max: 180, mutationRate: 0.12, mutationAmount: 0.25 },
        metabolism: { min: 0.03, max: 0.2, mutationRate: 0.1, mutationAmount: 0.2 },
        maxEnergy: { min: 90, max: 180, mutationRate: 0.1, mutationAmount: 0.2 },
        reproductionThreshold: { min: 100, max: 160, mutationRate: 0.08, mutationAmount: 0.15 },
        lifespan: { min: 350, max: 700, mutationRate: 0.1, mutationAmount: 0.2 }
    }
};
