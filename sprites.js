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
            img.onload = async () => {
                // Wait for the image to be fully decoded before resolving
                // This prevents rendering artifacts during the decode phase
                try {
                    await img.decode();
                    resolve();
                } catch (e) {
                    // decode() can fail on some images, but if onload fired
                    // the image should still be usable
                    resolve();
                }
            };
            img.onerror = () => reject(new Error(errorMessage));
        });
        img.src = src;
        this.loadingPromises.push(promise);
        return img;
    }

    async loadImages() {
        // Individual sprites are now used instead of sprite sheets
        // The old foods.jpg sprite sheet is no longer needed
        
        // Expected max dimensions for individual sprites
        // Sprite sheets are much larger, so this helps detect accidentally included sheets
        const MAX_SPRITE_WIDTH = 300;
        const MAX_SPRITE_HEIGHT = 300;
        
        const validateSpriteSize = (img, name) => {
            if (img.naturalWidth > MAX_SPRITE_WIDTH || img.naturalHeight > MAX_SPRITE_HEIGHT) {
                console.warn(`WARNING: ${name} is unusually large (${img.naturalWidth}x${img.naturalHeight}). ` +
                    `May be a sprite sheet instead of individual sprite!`);
            }
        };

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
        
        // Validate all loaded sprites to detect accidentally included sprite sheets
        console.log('Validating sprite sizes...');
        const validateArray = (arr, name) => {
            if (!Array.isArray(arr)) return;
            arr.forEach((img, i) => {
                if (img && img.naturalWidth && img.naturalHeight) {
                    if (img.naturalWidth > 300 || img.naturalHeight > 300) {
                        console.error(`SPRITE SIZE ERROR: ${name}[${i}] is ${img.naturalWidth}x${img.naturalHeight} - likely a sprite sheet!`);
                    }
                }
            });
        };
        
        // Validate creature sprites
        ['herbivore', 'carnivore', 'scavenger'].forEach(type => {
            const creature = this.images[type];
            if (creature) {
                Object.entries(creature).forEach(([state, arr]) => {
                    validateArray(arr, `${type}.${state}`);
                });
            }
        });
        
        // Validate food sprites
        ['grass', 'mushroom', 'crystal'].forEach(type => {
            validateArray(this.images[type], type);
        });
        
        this.loaded = true;
        return this;
    }

    // Herbivore sprite getter - returns individual PNG images
    getHerbivoreSprite(state, frame = 0) {
        // Guard: ensure sprites are loaded
        if (!this.loaded || !this.images.herbivore) {
            return null;
        }
        
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

        if (!animArray || !Array.isArray(animArray) || animArray.length === 0) {
            const fallback = this.images.herbivore.walk;
            return (fallback && fallback[0]) ? fallback[0] : null;
        }

        // Ensure frame is a valid number
        const safeFrame = (typeof frame === 'number' && !isNaN(frame)) ? Math.floor(frame) : 0;
        const index = ((safeFrame % animArray.length) + animArray.length) % animArray.length;
        
        const result = animArray[index];
        
        // Validate we're returning a single Image, not an array or object
        if (result && result instanceof Image) {
            return result;
        }
        
        return null;
    }

    // Carnivore sprite getter - returns individual PNG images
    getCarnivoreSprite(state, frame = 0) {
        // Guard: ensure sprites are loaded
        if (!this.loaded || !this.images.carnivore) {
            return null;
        }
        
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

        if (!animArray || !Array.isArray(animArray) || animArray.length === 0) {
            const fallback = this.images.carnivore.walk;
            return (fallback && fallback[0]) ? fallback[0] : null;
        }

        // Ensure frame is a valid number
        const safeFrame = (typeof frame === 'number' && !isNaN(frame)) ? Math.floor(frame) : 0;
        const index = ((safeFrame % animArray.length) + animArray.length) % animArray.length;
        
        const result = animArray[index];
        
        // Validate we're returning a single Image, not an array or object
        if (result && result instanceof Image) {
            return result;
        }
        
        return null;
    }

    // Scavenger sprite getter - returns individual PNG images
    getScavengerSprite(state, frame = 0) {
        // Guard: ensure sprites are loaded
        if (!this.loaded || !this.images.scavenger) {
            return null;
        }
        
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

        if (!animArray || !Array.isArray(animArray) || animArray.length === 0) {
            const fallback = this.images.scavenger.walk;
            return (fallback && fallback[0]) ? fallback[0] : null;
        }

        // Ensure frame is a valid number
        const safeFrame = (typeof frame === 'number' && !isNaN(frame)) ? Math.floor(frame) : 0;
        const index = ((safeFrame % animArray.length) + animArray.length) % animArray.length;
        
        const result = animArray[index];
        
        // Validate we're returning a single Image, not an array or object
        if (result && result instanceof Image) {
            return result;
        }
        
        return null;
    }

    // Food sprite getter - returns individual PNG images
    getFoodSpriteImage(type, growth = 0) {
        // Guard: ensure sprites are loaded
        if (!this.loaded) {
            return null;
        }
        
        // Get the correct food array based on type
        const foodArray = this.images[type];
        
        if (!foodArray || !Array.isArray(foodArray) || foodArray.length === 0) {
            // Try grass as fallback
            const fallback = this.images.grass;
            return (fallback && fallback[0] instanceof Image) ? fallback[0] : null;
        }

        // Ensure growth is a valid number
        const safeGrowth = (typeof growth === 'number' && !isNaN(growth)) ? Math.floor(growth) : 0;
        const index = Math.max(0, Math.min(safeGrowth, foodArray.length - 1));
        
        const result = foodArray[index];
        
        // Validate we're returning a single Image, not an array or object
        if (result && result instanceof Image) {
            return result;
        }
        
        // Log unexpected value for debugging
        console.error('getFoodSpriteImage: unexpected value at index', index, 'for type', type, ':', result);
        return null;
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
