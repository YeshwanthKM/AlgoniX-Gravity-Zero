class Game {
    constructor(canvas, ctx, ui) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.ui = ui;
        
        this.state = 'MENU';
        this.runState = 'SETUP'; // SETUP or RUNNING
        this.levelNum = 1;
        this.difficulty = 1;
        
        this.selectedGravity = 'down';
        
        this.gravityZones = [];
        this.platforms = [];
        this.hazards = [];
        this.goal = null;
        this.player = null;
        this.maxZones = 0;
        this.particles = [];
        
        // Track mouse for trajectory
        this.mouseX = 0;
        this.mouseY = 0;
        
        this.shakeIntensity = 0;
    }

    startGame() {
        this.levelNum = 1;
        this.difficulty = 1;
        this.loadLevel();
    }

    nextLevel() {
        this.levelNum++;
        this.difficulty += 1;
        this.loadLevel();
    }

    restartLevel() {
        if (this.player) this.player.reset();
        this.gravityZones = [];
        this.ui.zonesDisplay.innerText = this.maxZones;
        this.state = 'PLAYING';
        this.runState = 'SETUP';
        this.ui.endMenu.classList.remove('active');
        this.particles = [];
    }

    launchShift() {
        if (this.state === 'PLAYING' && this.runState === 'SETUP') {
            this.runState = 'RUNNING';
        }
    }

    quitGame() {
        this.state = 'MENU';
        this.ui.hud.classList.remove('active');
        this.ui.endMenu.classList.remove('active');
        if (this.ui.mainDock) this.ui.mainDock.classList.remove('active');
        if (this.ui.instructionsMenu) this.ui.instructionsMenu.classList.remove('active');
        this.ui.startMenu.classList.add('active');
        this.player = null;
        this.gravityZones = [];
        this.platforms = [];
        this.hazards = [];
        this.particles = [];
    }

    loadLevel() {
        const levelData = LevelGenerator.generate(this.levelNum, this.difficulty);
        
        this.platforms = levelData.platforms;
        this.hazards = levelData.hazards;
        this.goal = levelData.goalPos;
        this.maxZones = levelData.maxGravityZones;
        this.levelNumDisplay = levelData.levelId;
        
        this.player = new Player(levelData.startPos.x, levelData.startPos.y);
        this.gravityZones = [];
        this.particles = [];
        
        this.ui.levelDisplay.innerText = this.levelNum;
        this.ui.zonesDisplay.innerText = this.maxZones;
        
        this.state = 'PLAYING';
        this.runState = 'SETUP';
        this.ui.startMenu.classList.remove('active');
        this.ui.endMenu.classList.remove('active');
        this.ui.hud.classList.add('active');
        if (this.ui.mainDock) this.ui.mainDock.classList.add('active');
    }

    placeGravityZone(x, y) {
        if (this.runState !== 'SETUP') return;
        if (this.gravityZones.length >= this.maxZones) return;
        
        const zoneSize = 60;
        this.gravityZones.push({
            x: x - zoneSize/2,
            y: y - zoneSize/2,
            width: zoneSize,
            height: zoneSize,
            dir: this.selectedGravity
        });
        
        this.ui.zonesDisplay.innerText = this.maxZones - this.gravityZones.length;
        this.spawnParticles(x, y, this.selectedGravity);
    }
    
    spawnParticles(x, y, dir) {
        let colors = {'down':'#00f3ff', 'up':'#ff00c8', 'left':'#00ff66', 'right':'#ffbb00'};
        this.spawnExplosion(x, y, colors[dir]);
    }

    spawnExplosion(x, y, color) {
        for(let i=0; i<25; i++) {
            this.particles.push({
                x: x, y: y,
                vx: (Math.random()-0.5)*10,
                vy: (Math.random()-0.5)*10,
                life: 1.0,
                color: color,
                size: Math.random() * 5 + 2
            });
        }
    }

    update(dt) {
        if (this.state !== 'PLAYING') return;

        if (this.runState === 'RUNNING') {
            this.player.update(dt, this.platforms, this.hazards, this.goal, this.gravityZones);
        }

        // Update particles
        for(let p of this.particles) {
            p.x += p.vx;
            p.y += p.vy;
            p.life -= 0.02;
        }
        this.particles = this.particles.filter(p => p.life > 0);

        if (this.player.dead && this.state !== 'END') {
            this.spawnExplosion(this.player.x + this.player.width/2, this.player.y + this.player.height/2, '#ff00c8');
            this.shakeIntensity = 15;
            this.ui.endTitle.innerText = "Shift Failed";
            this.ui.endTitle.style.color = "var(--neon-pink)";
            this.state = 'END';
            this.ui.endMenu.classList.add('active');
            this.ui.btnNext.innerText = "Retry Level";
            this.ui.btnNext.onclick = () => this.restartLevel();
        } else if (this.player.won) {
            this.ui.endTitle.innerText = "Shift Complete";
            this.ui.endTitle.style.color = "var(--neon-green)";
            this.state = 'END';
            this.ui.endMenu.classList.add('active');
            this.ui.btnNext.innerText = "Next Level";
            this.ui.btnNext.onclick = () => this.nextLevel();
        }
    }

    draw() {
        this.ctx.save();
        if (this.shakeIntensity > 0) {
            let dx = (Math.random() - 0.5) * this.shakeIntensity;
            let dy = (Math.random() - 0.5) * this.shakeIntensity;
            this.ctx.translate(dx, dy);
            this.shakeIntensity *= 0.9;
            if (this.shakeIntensity < 0.1) this.shakeIntensity = 0;
        }
        this.ctx.clearRect(-20, -20, this.canvas.width + 40, this.canvas.height + 40);

        if (this.state === 'MENU') {
            this.ctx.restore();
            return;
        }

        // Subtle background pattern inside game area
        this.ctx.strokeStyle = 'rgba(0, 243, 255, 0.05)';
        this.ctx.lineWidth = 1;
        for(let i=0; i<this.canvas.width; i+=40) {
            this.ctx.beginPath();
            this.ctx.moveTo(i, 0);
            this.ctx.lineTo(i, this.canvas.height);
            this.ctx.stroke();
        }
        for(let j=0; j<this.canvas.height; j+=40) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, j);
            this.ctx.lineTo(this.canvas.width, j);
            this.ctx.stroke();
        }

        // Goal - Pulsing Portal Effect
        let time = Date.now() / 1000;
        let pulse = Math.sin(time * 5) * 5;
        this.ctx.fillStyle = '#00ff66';
        this.ctx.shadowBlur = 20 + pulse;
        this.ctx.shadowColor = '#00ff66';
        
        // Outer glow
        this.ctx.globalAlpha = 0.3;
        this.ctx.fillRect(this.goal.x - 5 - pulse/2, this.goal.y - 5 - pulse/2, this.goal.width + 10 + pulse, this.goal.height + 10 + pulse);
        
        // Inner core
        this.ctx.globalAlpha = 1.0;
        this.ctx.fillRect(this.goal.x, this.goal.y, this.goal.width, this.goal.height);
        
        // Inner detail lines
        this.ctx.strokeStyle = '#fff';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(this.goal.x + 5, this.goal.y + 5, this.goal.width - 10, this.goal.height - 10);
        this.ctx.shadowBlur = 0;

        // Platforms - Enhanced Visibility
        for (let p of this.platforms) {
            // Brighten fill for differentiation
            this.ctx.fillStyle = '#3a3a5a'; 
            this.ctx.fillRect(p.x, p.y, p.width, p.height);
            
            // Stronger glowing vibrant stroke
            this.ctx.shadowBlur = 15;
            this.ctx.shadowColor = 'rgba(0, 243, 255, 1)';
            this.ctx.strokeStyle = '#00f3ff';
            this.ctx.lineWidth = 2.5;
            this.ctx.strokeRect(p.x, p.y, p.width, p.height);
            this.ctx.shadowBlur = 0;
            
            // Sharper internal bevel highlights
            this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
            this.ctx.beginPath();
            this.ctx.moveTo(p.x + 2, p.y + p.height - 2);
            this.ctx.lineTo(p.x + 2, p.y + 2);
            this.ctx.lineTo(p.x + p.width - 2, p.y + 2);
            this.ctx.stroke();
            
            this.ctx.strokeStyle = 'rgba(0, 0, 0, 0.6)';
            this.ctx.beginPath();
            this.ctx.moveTo(p.x + 2, p.y + p.height - 2);
            this.ctx.lineTo(p.x + p.width - 2, p.y + p.height - 2);
            this.ctx.lineTo(p.x + p.width - 2, p.y + 2);
            this.ctx.stroke();
        }

        // Hazards - Electric/Pulsing Effect
        let hPulse = Math.sin(time * 10) * 0.2 + 0.8;
        this.ctx.shadowBlur = 20;
        this.ctx.shadowColor = 'rgba(255, 0, 0, 0.8)';
        for (let h of this.hazards) {
            let gradient = this.ctx.createLinearGradient(h.x, h.y, h.x + h.width, h.y + h.height);
            gradient.addColorStop(0, `rgba(255, 0, 0, ${hPulse})`);
            gradient.addColorStop(0.5, '#ff8800');
            gradient.addColorStop(1, `rgba(255, 0, 0, ${hPulse})`);
            
            this.ctx.fillStyle = gradient;
            this.ctx.fillRect(h.x, h.y, h.width, h.height);
            
            // Electric arc detail
            if (Math.random() > 0.7) {
                this.ctx.strokeStyle = 'white';
                this.ctx.lineWidth = 1.5;
                this.ctx.beginPath();
                this.ctx.moveTo(h.x + Math.random()*h.width, h.y);
                this.ctx.lineTo(h.x + Math.random()*h.width, h.y + h.height);
                this.ctx.stroke();
            }
        }
        this.ctx.shadowBlur = 0;

        // Target Preview
        if(this.state === 'PLAYING' && this.runState === 'SETUP' && this.gravityZones.length < this.maxZones) {
            this.ctx.strokeStyle = 'rgba(0, 243, 255, 0.6)';
            this.ctx.setLineDash([2, 4]);
            this.ctx.strokeRect(this.mouseX - 30, this.mouseY - 30, 60, 60);
            this.ctx.setLineDash([]);
        }

        // Zones - Geometric Arrows & Directed Flow
        for (let z of this.gravityZones) {
            let color = '#00f3ff';
            if (z.dir === 'up') color = '#ff00c8';
            if (z.dir === 'left') color = '#00ff66';
            if (z.dir === 'right') color = '#ffbb00';
            
            this.ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
            this.ctx.strokeStyle = color;
            this.ctx.lineWidth = 2;
            
            this.ctx.fillRect(z.x, z.y, z.width, z.height);
            this.ctx.strokeRect(z.x, z.y, z.width, z.height);
            
            // Primary Indicator: High-Contrast Geometric Arrow
            this.drawGeometricArrow(z.x + z.width/2, z.y + z.height/2, z.dir, color);

            // Secondary Indicator: Flow lines
            this.ctx.strokeStyle = color;
            this.ctx.globalAlpha = 0.4;
            let offset = (time * 120) % 20;
            this.ctx.beginPath();
            if (z.dir === 'down') {
                for(let lx = z.x + 5; lx < z.x + z.width; lx += 15) {
                    this.ctx.moveTo(lx, z.y + offset);
                    this.ctx.lineTo(lx, z.y + offset + 8);
                }
            } else if (z.dir === 'up') {
                for(let lx = z.x + 5; lx < z.x + z.width; lx += 15) {
                    this.ctx.moveTo(lx, z.y + z.height - offset);
                    this.ctx.lineTo(lx, z.y + z.height - offset - 8);
                }
            } else if (z.dir === 'right') {
                for(let ly = z.y + 5; ly < z.y + z.height; ly += 15) {
                    this.ctx.moveTo(z.x + offset, ly);
                    this.ctx.lineTo(z.x + offset + 8, ly);
                }
            } else if (z.dir === 'left') {
                for(let ly = z.y + 5; ly < z.y + z.height; ly += 15) {
                    this.ctx.moveTo(z.x + z.width - offset, ly);
                    this.ctx.lineTo(z.x + z.width - offset - 8, ly);
                }
            }
            this.ctx.stroke();
            this.ctx.globalAlpha = 1.0;
        }

        // Particles - Geometric Shrapnel
        for(let p of this.particles) {
            this.ctx.fillStyle = p.color;
            this.ctx.globalAlpha = p.life;
            this.ctx.save();
            this.ctx.translate(p.x, p.y);
            this.ctx.rotate(time * 5);
            this.ctx.fillRect(-2, -2, 4, 4);
            this.ctx.restore();
        }
        this.ctx.globalAlpha = 1.0;

        if (this.player && !this.player.dead) {
            this.player.draw(this.ctx);
        }
        this.ctx.restore();
    }

    drawGeometricArrow(cx, cy, dir, color) {
        this.ctx.save();
        this.ctx.translate(cx, cy);
        
        let rotation = 0;
        if(dir === 'up') rotation = Math.PI;
        if(dir === 'left') rotation = Math.PI/2;
        if(dir === 'right') rotation = -Math.PI/2;
        this.ctx.rotate(rotation);

        // Arrow shape
        this.ctx.beginPath();
        this.ctx.moveTo(0, 15);
        this.ctx.lineTo(12, -5);
        this.ctx.lineTo(6, -5);
        this.ctx.lineTo(6, -15);
        this.ctx.lineTo(-6, -15);
        this.ctx.lineTo(-6, -5);
        this.ctx.lineTo(-12, -5);
        this.ctx.closePath();

        // Outline for contrast
        this.ctx.strokeStyle = '#000';
        this.ctx.lineWidth = 4;
        this.ctx.stroke();

        // Main fill
        this.ctx.shadowBlur = 10;
        this.ctx.shadowColor = color;
        this.ctx.fillStyle = color;
        this.ctx.fill();

        // Bright tip
        this.ctx.fillStyle = '#fff';
        this.ctx.globalAlpha = 0.8;
        this.ctx.beginPath();
        this.ctx.moveTo(0, 15);
        this.ctx.lineTo(10, -2);
        this.ctx.lineTo(-10, -2);
        this.ctx.closePath();
        this.ctx.fill();

        this.ctx.restore();
    }
}
