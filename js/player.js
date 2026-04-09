class Player {
    constructor(x, y) {
        this.width = 24;
        this.height = 24;
        this.startX = x;
        this.startY = y;
        this.trail = [];
        this.reset();
    }

    reset() {
        this.x = this.startX;
        this.y = this.startY;
        this.vx = 0;
        this.vy = 0;
        this.speed = 7;
        this.gravityValue = 0.6;
        this.maxFallSpeed = 14;
        
        this.gravityDir = 'down'; // up, down, left, right
        this.runDir = 1; // 1 or -1
        
        this.dead = false;
        this.won = false;
        this.trail = [];
    }

    update(deltaTime, platforms, hazards, goal, gravityZones) {
        if(this.dead || this.won) return;

        // Trail for effect
        this.trail.unshift({x: this.x, y: this.y, age: 0, dir: this.gravityDir});
        if (this.trail.length > 15) this.trail.pop();
        for(let t of this.trail) t.age++;

        // Check Zones
        for (let zone of gravityZones) {
            if (Physics.checkCollision(this, zone)) {
                this.setGravity(zone.dir);
            }
        }

        // Apply velocities based on gravity
        if (this.gravityDir === 'down') {
            this.vx = this.runDir * this.speed;
            this.vy += this.gravityValue;
            if(this.vy > this.maxFallSpeed) this.vy = this.maxFallSpeed;
        } else if (this.gravityDir === 'up') {
            this.vx = this.runDir * this.speed;
            this.vy -= this.gravityValue;
            if(this.vy < -this.maxFallSpeed) this.vy = -this.maxFallSpeed;
        } else if (this.gravityDir === 'right') {
            this.vy = this.runDir * this.speed;
            this.vx += this.gravityValue;
            if(this.vx > this.maxFallSpeed) this.vx = this.maxFallSpeed;
        } else if (this.gravityDir === 'left') {
            this.vy = this.runDir * this.speed;
            this.vx -= this.gravityValue;
            if(this.vx < -this.maxFallSpeed) this.vx = -this.maxFallSpeed;
        }

        // Move X and resolve
        this.x += this.vx;
        for (let p of platforms) {
            if (Physics.checkCollision(this, p)) {
                if (this.vx > 0) {
                    this.x = p.x - this.width;
                    if (this.gravityDir === 'down' || this.gravityDir === 'up') this.runDir = -1;
                    this.vx = 0;
                } else if (this.vx < 0) {
                    this.x = p.x + p.width;
                    if (this.gravityDir === 'down' || this.gravityDir === 'up') this.runDir = 1;
                    this.vx = 0;
                }
            }
        }

        // Move Y and resolve
        this.y += this.vy;
        for (let p of platforms) {
            if (Physics.checkCollision(this, p)) {
                if (this.vy > 0) {
                    this.y = p.y - this.height;
                    if (this.gravityDir === 'left' || this.gravityDir === 'right') this.runDir = -1;
                    this.vy = 0;
                } else if (this.vy < 0) {
                    this.y = p.y + p.height;
                    if (this.gravityDir === 'left' || this.gravityDir === 'right') this.runDir = 1;
                    this.vy = 0;
                }
            }
        }

        // Check hazards
        for (let h of hazards) {
            let shrink = 6;
            let hBox = { x: h.x + shrink, y: h.y + shrink, width: h.width - shrink*2, height: h.height - shrink*2 };
            if (Physics.checkCollision(this, hBox)) {
                this.dead = true;
            }
        }

        // Check Goal
        if (Physics.checkCollision(this, goal)) {
            this.won = true;
        }
    }

    setGravity(dir) {
        if (this.gravityDir === dir) return;
        this.gravityDir = dir;
    }

    draw(ctx) {
        let time = Date.now() / 1000;
        
        // Draw pulse trail
        this.trail.forEach((t, i) => {
            let alpha = (1 - i / this.trail.length) * 0.4;
            let size = this.width * (1 - i / this.trail.length * 0.5);
            let offset = (this.width - size) / 2;
            
            // Neon pink/blue alternate based on gravity
            ctx.fillStyle = (t.dir === 'down' || t.dir === 'up') ? `rgba(255, 0, 200, ${alpha})` : `rgba(0, 243, 255, ${alpha})`;
            ctx.fillRect(t.x + offset, t.y + offset, size, size);
        });

        // Main Player Body
        ctx.shadowBlur = 15;
        ctx.shadowColor = '#ff00c8';
        ctx.fillStyle = '#ff00c8';
        
        // Slightly pulsing body
        let pulse = Math.sin(time * 10) * 2;
        ctx.fillRect(this.x - pulse/2, this.y - pulse/2, this.width + pulse, this.height + pulse);
        
        // Inner detail
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 1;
        ctx.strokeRect(this.x + 4, this.y + 4, this.width - 8, this.height - 8);
        
        ctx.shadowBlur = 0;
        
        // Draw "eyes" indicating forward direction
        ctx.fillStyle = '#fff';
        let eyeSize = 4;
        let eyeOffX = this.width/2;
        let eyeOffY = this.height/2;

        if(this.gravityDir === 'down') {
            ctx.fillRect(this.x + eyeOffX + (this.runDir * 6) - eyeSize/2, this.y + 4, eyeSize, eyeSize);
        } else if (this.gravityDir === 'up') {
            ctx.fillRect(this.x + eyeOffX + (this.runDir * 6) - eyeSize/2, this.y + this.height - 8, eyeSize, eyeSize);
        } else if (this.gravityDir === 'right') {
            ctx.fillRect(this.x + 4, this.y + eyeOffY + (this.runDir * 6) - eyeSize/2, eyeSize, eyeSize);
        } else if (this.gravityDir === 'left') {
            ctx.fillRect(this.x + this.width - 8, this.y + eyeOffY + (this.runDir * 6) - eyeSize/2, eyeSize, eyeSize);
        }
    }
}
