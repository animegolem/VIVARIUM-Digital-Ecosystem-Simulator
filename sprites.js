// VIVARIUM Sprite Atlas System
// Maps sprite sheet coordinates to creature types and states

export class SpriteAtlas {
    constructor() {
        this.images = {};
        this.loaded = false;
        this.loadingPromises = [];
    }

    createImage(src, errorMessage) {
        const img = new Image();
        img.draggable = false;
        img.ondragstart = (e) => { e.preventDefault(); return false; };
        const promise = new Promise((resolve, reject) => {
            img.onload = () => resolve();
            img.onerror = () => reject(new Error(errorMessage));
        });
        img.src = src;
        this.loadingPromises.push(promise);
        return img;
    }

    async loadImages() {
        const imageFiles = {
            food: 'images/foods.jpg'
        };

        // Load sprite sheets for food only
        for (const [key, path] of Object.entries(imageFiles)) {
            this.images[key] = this.createImage(path, `Failed to load ${path}`);
        }

        // Load individual herbivore sprites
        this.images.herbivore = {
            walk: [],
            eating: [],
            heart: [],
            dead: []
        };

        // Load walk animations (6 frames)
        for (let i = 1; i <= 6; i++) {
            this.images.herbivore.walk[i - 1] = this.createImage(
                `images/grasseater/grass-eater-walk-${i}.png`,
                `Failed to load grass-eater-walk-${i}.png`
            );
        }

        // Load eating animations (2 frames)
        for (let i = 1; i <= 2; i++) {
            this.images.herbivore.eating[i - 1] = this.createImage(
                `images/grasseater/grass-eater-eating-${i}.png`,
                `Failed to load grass-eater-eating-${i}.png`
            );
        }

        // Load heart/mating animations (4 frames)
        for (let i = 1; i <= 4; i++) {
            this.images.herbivore.heart[i - 1] = this.createImage(
                `images/grasseater/grass-eater-heart-${i}.png`,
                `Failed to load grass-eater-heart-${i}.png`
            );
        }

        // Load dead animations (6 frames)
        for (let i = 1; i <= 6; i++) {
            this.images.herbivore.dead[i - 1] = this.createImage(
                `images/grasseater/grass-eater-ded-${i}.png`,
                `Failed to load grass-eater-ded-${i}.png`
            );
        }

        // Load individual carnivore sprites
        this.images.carnivore = {
            walk: [],
            eating: [],
            pounce: [],
            dead: []
        };

        // Load walk animations (5 frames)
        for (let i = 1; i <= 5; i++) {
            this.images.carnivore.walk[i - 1] = this.createImage(
                `images/meat-eats/meat-eater-walk-${i}.png`,
                `Failed to load meat-eater-walk-${i}.png`
            );
        }

        // Load eating animations (3 frames)
        for (let i = 1; i <= 3; i++) {
            this.images.carnivore.eating[i - 1] = this.createImage(
                `images/meat-eats/meat-eater-eating-${i}.png`,
                `Failed to load meat-eater-eating-${i}.png`
            );
        }

        // Load pounce/attack animations (4 frames)
        for (let i = 1; i <= 4; i++) {
            this.images.carnivore.pounce[i - 1] = this.createImage(
                `images/meat-eats/meat-eater-pounce-${i}.png`,
                `Failed to load meat-eater-pounce-${i}.png`
            );
        }

        // Load dead animations (3 frames)
        for (let i = 1; i <= 3; i++) {
            this.images.carnivore.dead[i - 1] = this.createImage(
                `images/meat-eats/meat-eater-ded-${i}.png`,
                `Failed to load meat-eater-ded-${i}.png`
            );
        }

        // Load individual scavenger sprites
        this.images.scavenger = {
            walk: [],
            scavenge: [],
            eating: [],
            dead: []
        };

        // Load walk animations (6 frames)
        for (let i = 1; i <= 6; i++) {
            this.images.scavenger.walk[i - 1] = this.createImage(
                `images/scavy/scavy-walks-${i}.png`,
                `Failed to load scavy-walks-${i}.png`
            );
        }

        // Load scavenge animations (4 frames)
        for (let i = 1; i <= 4; i++) {
            this.images.scavenger.scavenge[i - 1] = this.createImage(
                `images/scavy/scavy-scaving-${i}.png`,
                `Failed to load scavy-scaving-${i}.png`
            );
        }

        // Load eating animations (3 frames)
        for (let i = 1; i <= 3; i++) {
            this.images.scavenger.eating[i - 1] = this.createImage(
                `images/scavy/scavy-eating-${i}.png`,
                `Failed to load scavy-eating-${i}.png`
            );
        }

        // Load dead animations (3 frames)
        for (let i = 1; i <= 3; i++) {
            this.images.scavenger.dead[i - 1] = this.createImage(
                `images/scavy/scavy-ded-${i}.png`,
                `Failed to load scavy-ded-${i}.png`
            );
        }

        // Load individual grass sprites for food
        this.images.grass = [];
        for (let i = 1; i <= 7; i++) {
            this.images.grass[i - 1] = this.createImage(
                `images/food/grass${i}.png`,
                `Failed to load grass${i}.png`
            );
        }

        // Load individual mushroom sprites for food
        this.images.mushroom = [];
        for (let i = 1; i <= 7; i++) {
            this.images.mushroom[i - 1] = this.createImage(
                `images/food/shrooms${i}.png`,
                `Failed to load shrooms${i}.png`
            );
        }

        // Load individual crystal sprites for food
        this.images.crystal = [];
        for (let i = 1; i <= 7; i++) {
            this.images.crystal[i - 1] = this.createImage(
                `images/food/crystal${i}.png`,
                `Failed to load crystal${i}.png`
            );
        }

        await Promise.all(this.loadingPromises);
        this.loaded = true;
        return this;
    }

    // Herbivore sprite getter - returns individual PNG images
    getHerbivoreSprite(state, frame = 0) {
        // Map states to animation arrays
        const stateMap = {
            walk: 'walk',
            idle: 'walk',
            seeking: 'walk',
            fleeing: 'walk',
            eating: 'eating',
            mating: 'heart',
            dead: 'dead'
        };

        const animState = stateMap[state] || 'walk';
        const animArray = this.images.herbivore[animState];

        if (!animArray || animArray.length === 0) {
            return this.images.herbivore.walk[0]; // Fallback to first walk frame
        }

        return animArray[frame % animArray.length];
    }

    // Carnivore sprite getter - returns individual PNG images
    getCarnivoreSprite(state, frame = 0) {
        // Map states to animation arrays
        const stateMap = {
            walk: 'walk',
            idle: 'walk',
            seeking: 'walk',
            fleeing: 'walk',
            eating: 'eating',
            hunting: 'pounce',
            attack: 'pounce',
            dead: 'dead'
        };

        const animState = stateMap[state] || 'walk';
        const animArray = this.images.carnivore[animState];

        if (!animArray || animArray.length === 0) {
            return this.images.carnivore.walk[0]; // Fallback to first walk frame
        }

        return animArray[frame % animArray.length];
    }

    // Scavenger sprite getter - returns individual PNG images
    getScavengerSprite(state, frame = 0) {
        // Map states to animation arrays
        const stateMap = {
            walk: 'walk',
            idle: 'walk',
            seeking: 'walk',
            fleeing: 'walk',
            eating: 'eating',
            scavenging: 'scavenge',
            dead: 'dead'
        };

        const animState = stateMap[state] || 'walk';
        const animArray = this.images.scavenger[animState];

        if (!animArray || animArray.length === 0) {
            return this.images.scavenger.walk[0]; // Fallback to first walk frame
        }

        return animArray[frame % animArray.length];
    }

    // Food resource sprite definitions - Auto-detected centered coordinates
    getFoodSprite(type, growth = 0) {
        const sprites = {
            bush: [
                { x: 10, y: 0, w: 181, h: 120 },
                { x: 211, y: 0, w: 181, h: 120 },
                { x: 412, y: 0, w: 181, h: 120 },
                { x: 613, y: 0, w: 181, h: 120 },
                { x: 814, y: 0, w: 181, h: 120 },
                { x: 1015, y: 0, w: 181, h: 120 },
                { x: 1216, y: 0, w: 181, h: 120 }
            ],
            mushroom: [
                { x: 10, y: 200, w: 181, h: 120 },
                { x: 211, y: 200, w: 181, h: 120 },
                { x: 412, y: 200, w: 181, h: 120 },
                { x: 613, y: 200, w: 181, h: 120 },
                { x: 814, y: 200, w: 181, h: 120 },
                { x: 1015, y: 200, w: 181, h: 120 },
                { x: 1216, y: 200, w: 181, h: 120 }
            ],
            crystal: [
                { x: 10, y: 410, w: 181, h: 120 },
                { x: 211, y: 410, w: 181, h: 120 },
                { x: 412, y: 410, w: 181, h: 120 },
                { x: 613, y: 410, w: 181, h: 120 },
                { x: 814, y: 410, w: 181, h: 120 },
                { x: 1015, y: 410, w: 181, h: 120 },
                { x: 1216, y: 410, w: 181, h: 120 }
            ]
        };

        const typeSprites = sprites[type] || sprites.bush;
        const index = Math.min(Math.floor(growth), typeSprites.length - 1);
        return typeSprites[index];
    }

    drawSprite(ctx, image, sprite, x, y, scale = 1) {
        if (!this.loaded || !sprite) return;

        const drawWidth = sprite.w * scale;
        const drawHeight = sprite.h * scale;

        ctx.drawImage(
            image,
            sprite.x, sprite.y, sprite.w, sprite.h,
            x - drawWidth / 2, y - drawHeight / 2, drawWidth, drawHeight
        );
    }
}

// Animation controller for managing frame timing
export class AnimationController {
    constructor() {
        this.animations = new Map();
        this.frameRate = 8; // frames per second for animations
        this.lastUpdate = Date.now();
    }

    update() {
        const now = Date.now();
        const delta = now - this.lastUpdate;

        if (delta >= 1000 / this.frameRate) {
            this.animations.forEach((anim, id) => {
                anim.frame = (anim.frame + 1) % anim.maxFrames;
            });
            this.lastUpdate = now;
        }
    }

    registerEntity(id, maxFrames) {
        if (!this.animations.has(id)) {
            this.animations.set(id, {
                frame: Math.floor(Math.random() * maxFrames), // Start at random frame
                maxFrames: maxFrames
            });
        } else {
            // Update maxFrames if it changed (e.g., creature changed state)
            const anim = this.animations.get(id);
            if (anim.maxFrames !== maxFrames) {
                anim.maxFrames = maxFrames;
                // Clamp current frame to valid range
                anim.frame = anim.frame % maxFrames;
            }
        }
    }

    getFrame(id) {
        const anim = this.animations.get(id);
        return anim ? anim.frame : 0;
    }

    removeEntity(id) {
        this.animations.delete(id);
    }

    clear() {
        this.animations.clear();
    }
}
