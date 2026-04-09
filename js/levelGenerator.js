const LevelGenerator = {
    generate(levelNum, difficulty) {
        let maxZones = Math.min(6, Math.floor(2 + difficulty * 0.5));
        
        let levelData = {
            levelId: "gen_" + levelNum,
            difficulty: difficulty,
            startPos: { x: 50, y: 50 },
            goalPos: { x: 700, y: 50, width: 40, height: 40 },
            maxGravityZones: maxZones,
            platforms: [
                { x: 0, y: 0, width: 800, height: 20 },
                { x: 0, y: 580, width: 800, height: 20 },
                { x: 0, y: 0, width: 20, height: 600 },
                { x: 780, y: 0, width: 20, height: 600 }
            ],
            hazards: []
        };

        if (levelNum === 1) {
            // Level 1: Easy - Basic Obstacle, jump over a wall
            levelData.startPos = { x: 50, y: 400 };
            levelData.goalPos = { x: 700, y: 400, width: 40, height: 40 };
            levelData.platforms.push({ x: 380, y: 250, width: 40, height: 350 });
            levelData.maxGravityZones = 4;
        } else if (levelNum === 2) {
            // Level 2: Moderate - Shift across gaps
            levelData.startPos = { x: 60, y: 500 };
            levelData.goalPos = { x: 700, y: 100, width: 40, height: 40 };
            
            // Starting platform
            levelData.platforms.push({ x: 20, y: 540, width: 150, height: 20 });
            
            // Middle obstacle
            levelData.platforms.push({ x: 300, y: 300, width: 200, height: 20 });
            
            // Hazards
            levelData.hazards.push({ x: 170, y: 550, width: 600, height: 30 }); // Dangerous floor
            levelData.maxGravityZones = 4;
        } else if (levelNum === 3) {
            // Level 3: Hard - Center Block with hazards
            levelData.startPos = { x: 50, y: 250 };
            levelData.goalPos = { x: 700, y: 250, width: 40, height: 40 };
            levelData.platforms.push({ x: 300, y: 150, width: 200, height: 300 });
            levelData.hazards.push({ x: 300, y: 130, width: 200, height: 20 });
            levelData.hazards.push({ x: 300, y: 450, width: 200, height: 20 });
            levelData.maxGravityZones = 4;
        } else if (levelNum === 4) {
            // Level 4: Expert - Tower Climb
            levelData.startPos = { x: 50, y: 500 };
            levelData.goalPos = { x: 50, y: 50, width: 40, height: 40 };
            levelData.platforms.push({ x: 150, y: 150, width: 20, height: 450 });
            levelData.platforms.push({ x: 350, y: 0, width: 20, height: 450 });
            levelData.platforms.push({ x: 550, y: 150, width: 20, height: 450 });
            levelData.maxGravityZones = 6;
        } else {
            // Level 5+ Procedural Generation Scaling
            const type = Math.floor(Math.random() * 3);
            if (type === 0) {
                levelData.startPos = { x: 50, y: 50 };
                levelData.goalPos = { x: 50, y: 500, width: 40, height: 40 };
                levelData.platforms.push({ x: 20, y: 250, width: 600, height: 20 });
                levelData.hazards.push({ x: 200 + Math.random()*200, y: 230, width: 60, height: 20 });
            } else if (type === 1) {
                levelData.startPos = { x: 50, y: 500 };
                levelData.goalPos = { x: 50, y: 50, width: 40, height: 40 };
                levelData.platforms.push({ x: 150, y: 150, width: 20, height: 450 });
                levelData.platforms.push({ x: 350, y: 0, width: 20, height: 450 });
                levelData.platforms.push({ x: 550, y: 150, width: 20, height: 450 });
            } else {
                levelData.startPos = { x: 50, y: 250 };
                levelData.goalPos = { x: 700, y: 250, width: 40, height: 40 };
                levelData.platforms.push({ x: 300, y: 150, width: 200, height: 300 });
                levelData.hazards.push({ x: 300, y: 130, width: 200, height: 20 });
                levelData.hazards.push({ x: 300, y: 450, width: 200, height: 20 });
            }

            let noiseCount = Math.floor(difficulty);
            for(let i=0; i<noiseCount; i++){
                levelData.platforms.push({
                    x: 100 + Math.random() * 600,
                    y: 100 + Math.random() * 400,
                    width: 50 + Math.random() * 100,
                    height: 20
                });
            }
        }

        return levelData;
    }
};
