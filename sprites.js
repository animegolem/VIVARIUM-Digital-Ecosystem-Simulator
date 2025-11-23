// VIVARIUM Sprite Atlas System
// Maps sprite sheet coordinates to creature types and states

export class SpriteAtlas {
    constructor() {
        this.images = {};
        this.loaded = false;
        this.loadingPromises = [];
    }

    async loadImages() {
        const imageFiles = {
            carnivore: 'images/meats_eats.jpeg',
            scavenger: 'images/scavy.jpeg',
            food: 'images/foods.jpg'
        };

        // Load sprite sheets for carnivore and scavenger
        for (const [key, path] of Object.entries(imageFiles)) {
            const img = new Image();
            const promise = new Promise((resolve, reject) => {
                img.onload = () => resolve();
                img.onerror = () => reject(new Error(`Failed to load ${path}`));
            });
            img.src = path;
            this.images[key] = img;
            this.loadingPromises.push(promise);
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
            const img = new Image();
            const promise = new Promise((resolve, reject) => {
                img.onload = () => resolve();
                img.onerror = () => reject(new Error(`Failed to load grass-eater-walk-${i}.png`));
            });
            img.src = `images/grasseater/grass-eater-walk-${i}.png`;
            this.images.herbivore.walk[i - 1] = img;
            this.loadingPromises.push(promise);
        }

        // Load eating animations (2 frames)
        for (let i = 1; i <= 2; i++) {
            const img = new Image();
            const promise = new Promise((resolve, reject) => {
                img.onload = () => resolve();
                img.onerror = () => reject(new Error(`Failed to load grass-eater-eating-${i}.png`));
            });
            img.src = `images/grasseater/grass-eater-eating-${i}.png`;
            this.images.herbivore.eating[i - 1] = img;
            this.loadingPromises.push(promise);
        }

        // Load heart/mating animations (4 frames)
        for (let i = 1; i <= 4; i++) {
            const img = new Image();
            const promise = new Promise((resolve, reject) => {
                img.onload = () => resolve();
                img.onerror = () => reject(new Error(`Failed to load grass-eater-heart-${i}.png`));
            });
            img.src = `images/grasseater/grass-eater-heart-${i}.png`;
            this.images.herbivore.heart[i - 1] = img;
            this.loadingPromises.push(promise);
        }

        // Load dead animations (6 frames)
        for (let i = 1; i <= 6; i++) {
            const img = new Image();
            const promise = new Promise((resolve, reject) => {
                img.onload = () => resolve();
                img.onerror = () => reject(new Error(`Failed to load grass-eater-ded-${i}.png`));
            });
            img.src = `images/grasseater/grass-eater-ded-${i}.png`;
            this.images.herbivore.dead[i - 1] = img;
            this.loadingPromises.push(promise);
        }

        // Load individual grass sprites for food
        this.images.grass = [];
        for (let i = 1; i <= 7; i++) {
            const img = new Image();
            const promise = new Promise((resolve, reject) => {
                img.onload = () => resolve();
                img.onerror = () => reject(new Error(`Failed to load grass${i}.png`));
            });
            img.src = `images/food/grass${i}.png`;
            this.images.grass[i - 1] = img;
            this.loadingPromises.push(promise);
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

    // Carnivore (Red Raptor) sprite definitions - Auto-detected centered coordinates
    getCarnivoreSprite(state, frame = 0) {
        const sprites = {
            walk: [
                { x: 10, y: 0, w: 261, h: 90 },
                { x: 291, y: 0, w: 261, h: 90 },
                { x: 572, y: 0, w: 261, h: 90 },
                { x: 853, y: 0, w: 261, h: 90 },
                { x: 1134, y: 0, w: 261, h: 90 }
            ],
            attack: [
                { x: 10, y: 120, w: 332, h: 100 },
                { x: 362, y: 120, w: 332, h: 100 },
                { x: 714, y: 120, w: 332, h: 100 },
                { x: 1066, y: 120, w: 332, h: 100 }
            ],
            hunt: [
                { x: 10, y: 250, w: 332, h: 90 },
                { x: 362, y: 250, w: 332, h: 90 },
                { x: 714, y: 250, w: 332, h: 90 },
                { x: 1066, y: 250, w: 332, h: 90 }
            ],
            crouch: [
                { x: 10, y: 370, w: 449, h: 100 },
                { x: 479, y: 370, w: 449, h: 100 },
                { x: 948, y: 370, w: 449, h: 100 }
            ],
            dying: [
                { x: 10, y: 500, w: 449, h: 100 },
                { x: 479, y: 500, w: 449, h: 100 },
                { x: 948, y: 500, w: 449, h: 100 }
            ]
        };

        const stateSprites = sprites[state] || sprites.walk;
        return stateSprites[frame % stateSprites.length];
    }

    // Scavenger (Orange Raccoon) sprite definitions - Auto-detected centered coordinates
    getScavengerSprite(state, frame = 0) {
        const sprites = {
            walk: [
                { x: 10, y: 0, w: 261, h: 90 },
                { x: 291, y: 0, w: 261, h: 90 },
                { x: 572, y: 0, w: 261, h: 90 },
                { x: 853, y: 0, w: 261, h: 90 },
                { x: 1134, y: 0, w: 261, h: 90 }
            ],
            walking: [
                { x: 10, y: 120, w: 214, h: 90 },
                { x: 244, y: 120, w: 214, h: 90 },
                { x: 478, y: 120, w: 214, h: 90 },
                { x: 712, y: 120, w: 214, h: 90 },
                { x: 946, y: 120, w: 214, h: 90 },
                { x: 1180, y: 120, w: 214, h: 90 }
            ],
            scavenge: [
                { x: 10, y: 240, w: 332, h: 90 },
                { x: 362, y: 240, w: 332, h: 90 },
                { x: 714, y: 240, w: 332, h: 90 },
                { x: 1066, y: 240, w: 332, h: 90 }
            ],
            eating: [
                { x: 10, y: 360, w: 449, h: 90 },
                { x: 479, y: 360, w: 449, h: 90 },
                { x: 948, y: 360, w: 449, h: 90 }
            ],
            dying: [
                { x: 340, y: 360, w: 339, h: 90 },
                { x: 699, y: 360, w: 339, h: 90 },
                { x: 1058, y: 360, w: 339, h: 90 }
            ]
        };

        const stateSprites = sprites[state] || sprites.walk;
        return stateSprites[frame % stateSprites.length];
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
