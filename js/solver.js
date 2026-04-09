const Solver = {
    getHint(game) {
        if (!game.player) return null;
        
        const px = game.player.x;
        const py = game.player.y;
        const pd = game.player.gravityDir;
        
        let dx = 0, dy = 0;
        if (pd === 'down') { dx = game.player.runDir * 150; dy = 0; }
        if (pd === 'up') { dx = game.player.runDir * 150; dy = 0; }
        if (pd === 'right') { dx = 0; dy = game.player.runDir * 150; }
        if (pd === 'left') { dx = 0; dy = game.player.runDir * 150; }

        let hintX = px + dx + game.player.width/2;
        let hintY = py + dy + game.player.height/2;

        const dirs = ['up', 'down', 'left', 'right'];
        const possibleDirs = dirs.filter(d => d !== pd);
        // Suggest a random direction that is not the current direction to redirect player towards center roughly
        const randomDir = possibleDirs[Math.floor(Math.random() * possibleDirs.length)];

        return {
            x: Math.max(0, Math.min(800, hintX)),
            y: Math.max(0, Math.min(600, hintY)),
            dir: randomDir
        };
    }
};
