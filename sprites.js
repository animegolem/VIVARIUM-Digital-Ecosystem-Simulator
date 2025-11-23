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
            herbivore: 'images/grass_eaters.jpeg',
            carnivore: 'images/meats_eats.jpeg',
            scavenger: 'images/scavy.jpeg',
            food: 'images/foods.jpg'
        };

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

        await Promise.all(this.loadingPromises);
        this.loaded = true;
        return this;
    }

    // Herbivore (Green Turtle) sprite definitions
    getHerbivoreSprite(state, frame = 0) {
        const sprites = {
            walk: [
                { x: 0, y: 0, w: 120, h: 120 },
                { x: 120, y: 0, w: 120, h: 120 },
                { x: 240, y: 0, w: 120, h: 120 },
                { x: 360, y: 0, w: 120, h: 120 },
                { x: 480, y: 0, w: 120, h: 120 },
                { x: 600, y: 0, w: 120, h: 120 }
            ],
            mating: [
                { x: 0, y: 160, w: 140, h: 140 },
                { x: 140, y: 160, w: 140, h: 140 },
                { x: 280, y: 160, w: 140, h: 140 },
                { x: 420, y: 160, w: 140, h: 140 },
                { x: 560, y: 160, w: 140, h: 140 },
                { x: 700, y: 160, w: 140, h: 140 }
            ],
            sad: [
                { x: 0, y: 320, w: 130, h: 130 },
                { x: 130, y: 320, w: 130, h: 130 },
                { x: 260, y: 320, w: 130, h: 130 }
            ],
            sleep: [
                { x: 450, y: 320, w: 130, h: 130 },
                { x: 600, y: 320, w: 130, h: 130 },
                { x: 750, y: 320, w: 130, h: 130 }
            ]
        };

        const stateSprites = sprites[state] || sprites.walk;
        return stateSprites[frame % stateSprites.length];
    }

    // Carnivore (Red Raptor) sprite definitions
    getCarnivoreSprite(state, frame = 0) {
        const sprites = {
            walk: [
                { x: 0, y: 0, w: 140, h: 110 },
                { x: 140, y: 0, w: 140, h: 110 },
                { x: 280, y: 0, w: 140, h: 110 },
                { x: 420, y: 0, w: 140, h: 110 },
                { x: 560, y: 0, w: 140, h: 110 }
            ],
            attack: [
                { x: 0, y: 120, w: 160, h: 120 },
                { x: 160, y: 120, w: 160, h: 120 },
                { x: 320, y: 120, w: 180, h: 120 },
                { x: 500, y: 120, w: 180, h: 120 }
            ],
            hunt: [
                { x: 0, y: 250, w: 140, h: 110 },
                { x: 140, y: 250, w: 140, h: 110 },
                { x: 280, y: 250, w: 140, h: 110 },
                { x: 420, y: 250, w: 140, h: 110 }
            ],
            crouch: [
                { x: 0, y: 370, w: 150, h: 120 },
                { x: 150, y: 370, w: 150, h: 120 },
                { x: 300, y: 370, w: 150, h: 120 }
            ],
            dying: [
                { x: 0, y: 500, w: 160, h: 120 },
                { x: 160, y: 500, w: 160, h: 120 },
                { x: 320, y: 500, w: 160, h: 120 }
            ]
        };

        const stateSprites = sprites[state] || sprites.walk;
        return stateSprites[frame % stateSprites.length];
    }

    // Scavenger (Orange Raccoon) sprite definitions
    getScavengerSprite(state, frame = 0) {
        const sprites = {
            walk: [
                { x: 0, y: 0, w: 110, h: 110 },
                { x: 110, y: 0, w: 110, h: 110 },
                { x: 220, y: 0, w: 110, h: 110 },
                { x: 330, y: 0, w: 110, h: 110 },
                { x: 440, y: 0, w: 110, h: 110 }
            ],
            walking: [
                { x: 0, y: 120, w: 110, h: 110 },
                { x: 110, y: 120, w: 110, h: 110 },
                { x: 220, y: 120, w: 110, h: 110 },
                { x: 330, y: 120, w: 110, h: 110 },
                { x: 440, y: 120, w: 110, h: 110 },
                { x: 550, y: 120, w: 110, h: 110 }
            ],
            scavenge: [
                { x: 0, y: 240, w: 120, h: 110 },
                { x: 120, y: 240, w: 120, h: 110 },
                { x: 240, y: 240, w: 120, h: 110 },
                { x: 360, y: 240, w: 140, h: 110 }
            ],
            eating: [
                { x: 0, y: 360, w: 110, h: 110 },
                { x: 110, y: 360, w: 110, h: 110 },
                { x: 220, y: 360, w: 110, h: 110 }
            ],
            dying: [
                { x: 330, y: 360, w: 120, h: 110 },
                { x: 450, y: 360, w: 130, h: 110 },
                { x: 580, y: 360, w: 130, h: 110 }
            ]
        };

        const stateSprites = sprites[state] || sprites.walk;
        return stateSprites[frame % stateSprites.length];
    }

    // Food resource sprite definitions
    getFoodSprite(type, growth = 0) {
        const sprites = {
            bush: [
                { x: 0, y: 0, w: 100, h: 100 },
                { x: 100, y: 0, w: 130, h: 110 },
                { x: 230, y: 0, w: 160, h: 120 },
                { x: 390, y: 0, w: 180, h: 130 },
                { x: 570, y: 0, w: 200, h: 130 },
                { x: 770, y: 0, w: 220, h: 130 },
                { x: 990, y: 0, w: 120, h: 100 } // stump (depleted)
            ],
            mushroom: [
                { x: 0, y: 220, w: 80, h: 100 },
                { x: 80, y: 200, w: 100, h: 120 },
                { x: 180, y: 180, w: 140, h: 140 },
                { x: 320, y: 160, w: 170, h: 160 },
                { x: 490, y: 170, w: 160, h: 150 },
                { x: 650, y: 180, w: 150, h: 140 },
                { x: 800, y: 190, w: 140, h: 130 }
            ],
            crystal: [
                { x: 0, y: 430, w: 70, h: 90 },
                { x: 70, y: 410, w: 100, h: 110 },
                { x: 170, y: 390, w: 130, h: 130 },
                { x: 300, y: 370, w: 160, h: 150 },
                { x: 460, y: 380, w: 150, h: 140 },
                { x: 610, y: 390, w: 140, h: 130 },
                { x: 750, y: 400, w: 150, h: 120 }
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
