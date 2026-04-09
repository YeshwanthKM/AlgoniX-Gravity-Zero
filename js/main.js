let game;

window.onload = () => {
    const canvas = document.getElementById('game-canvas');
    const ctx = canvas.getContext('2d');
    
    // UI mapping for the floating HUD
    const ui = {
        startMenu: document.getElementById('start-menu'),
        hud: document.getElementById('hud'),
        endMenu: document.getElementById('end-menu'),
        btnPlay: document.getElementById('btn-play'),
        btnNext: document.getElementById('btn-next'),
        btnRestart: document.getElementById('btn-restart'),
        btnLaunch: document.getElementById('btn-launch'),
        btnQuit: document.getElementById('btn-quit'),
        btnQuitEnd: document.getElementById('btn-quit-end'),
        btnInstructions: document.getElementById('btn-instructions'),
        btnPlayFromInst: document.getElementById('btn-play-from-inst'),
        instructionsMenu: document.getElementById('instructions-menu'),
        levelDisplay: document.getElementById('level-display'),
        zonesDisplay: document.getElementById('zones-display'),
        endTitle: document.getElementById('end-title'),
        gravBtns: document.querySelectorAll('.grav-btn'),
        mainDock: document.querySelector('.main-dock')
    };

    game = new Game(canvas, ctx, ui);

    ui.btnPlay.addEventListener('click', (e) => {
        e.stopPropagation(); // Prevent the click from placing a tile immediately
        console.log("Action: Start Game");
        game.startGame();
    });
    
    ui.btnInstructions.addEventListener('click', () => {
        ui.startMenu.classList.remove('active');
        ui.instructionsMenu.classList.add('active');
    });

    ui.btnPlayFromInst.addEventListener('click', () => {
        ui.instructionsMenu.classList.remove('active');
        game.startGame();
    });

    // Centralized Navigation Listeners
    if (ui.btnNext) {
        ui.btnNext.addEventListener('click', (e) => {
            e.stopPropagation();
            console.log("Action: Next Level");
            game.nextLevel();
        });
    }

    ui.btnRestart.addEventListener('click', (e) => {
        e.stopPropagation();
        console.log("Action: Restart Level");
        game.restartLevel();
    });

    if (ui.btnLaunch) {
        ui.btnLaunch.addEventListener('click', () => {
            console.log("Action: Launch Shift");
            game.launchShift();
        });
    }

    ui.btnQuit.addEventListener('click', () => {
        console.log("Action: Quit Game (HUD)");
        game.quitGame();
    });

    if (ui.btnQuitEnd) {
        ui.btnQuitEnd.addEventListener('click', (e) => {
            e.stopPropagation();
            console.log("Action: Quit Game (End Menu)");
            game.quitGame();
        });
    }

    // Keyboard and Button Gravity Selection
    ui.gravBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            ui.gravBtns.forEach(b => b.classList.remove('selected'));
            e.currentTarget.classList.add('selected');
            game.selectedGravity = e.currentTarget.dataset.dir;
        });
    });

    const gameContainer = document.getElementById('game-container');

    gameContainer.addEventListener('click', (e) => {
        console.log("Container Clicked:", e.clientX, e.clientY);
        if(game.state === 'PLAYING') {
            const rect = canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            // Only place if inside canvas bounds
            if (x >= 0 && x <= 800 && y >= 0 && y <= 600) {
                console.log("Placement Coords:", x, y);
                game.placeGravityZone(x, y);
            }
        }
    });

    gameContainer.addEventListener('mousemove', (e) => {
        if(game.state === 'PLAYING') {
            const rect = canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            if (x >= 0 && x <= 800 && y >= 0 && y <= 600) {
                game.mouseX = x;
                game.mouseY = y;
            }
        }
    });

    let lastTime = 0;
    function gameLoop(timestamp) {
        let deltaTime = timestamp - lastTime;
        lastTime = timestamp;
        
        game.update(deltaTime);
        game.draw();
        
        requestAnimationFrame(gameLoop);
    }
    
    requestAnimationFrame(gameLoop);
};
