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

    ui.btnPlay.addEventListener('click', () => game.startGame());
    
    ui.btnInstructions.addEventListener('click', () => {
        ui.startMenu.classList.remove('active');
        ui.instructionsMenu.classList.add('active');
    });

    ui.btnPlayFromInst.addEventListener('click', () => {
        ui.instructionsMenu.classList.remove('active');
        game.startGame();
    });

    // Re-bind restart and launch to the new floating HUD buttons
    ui.btnRestart.addEventListener('click', () => game.restartLevel());
    if (ui.btnLaunch) {
        ui.btnLaunch.addEventListener('click', () => game.launchShift());
    }
    ui.btnQuit.addEventListener('click', () => game.quitGame());
    if (ui.btnQuitEnd) {
        ui.btnQuitEnd.addEventListener('click', () => game.quitGame());
    }

    // Keyboard and Button Gravity Selection
    ui.gravBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            ui.gravBtns.forEach(b => b.classList.remove('selected'));
            e.currentTarget.classList.add('selected');
            game.selectedGravity = e.currentTarget.dataset.dir;
        });
    });

    canvas.addEventListener('click', (e) => {
        if(game.state === 'PLAYING') {
            const rect = canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            game.placeGravityZone(x, y);
        }
    });

    canvas.addEventListener('mousemove', (e) => {
        if(game.state === 'PLAYING') {
            const rect = canvas.getBoundingClientRect();
            game.mouseX = e.clientX - rect.left;
            game.mouseY = e.clientY - rect.top;
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
