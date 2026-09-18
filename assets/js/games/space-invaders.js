import sfx from '/assets/js/sfx.js';

// Constants
const CANVAS_W = 800;
const CANVAS_H = 600;
const PLAYER_W = 40;
const PLAYER_H = 30;
const ALIEN_W = 32;
const ALIEN_H = 24;
const BULLET_W = 4;
const BULLET_H = 12;

// State
let canvas, ctx;
let player = { x: CANVAS_W / 2 - PLAYER_W / 2, y: CANVAS_H - 60, w: PLAYER_W, h: PLAYER_H, speed: 5 };
let aliens = [];
let bullets = [];
let enemyBullets = [];
let score = 0;
let lives = 3;
let wave = 1;
let alienDir = 1;
let alienSpeed = 1;
let alienDropTimer = 0;
let keys = { left: false, right: false, space: false };
let isRunning = false;
let canShoot = true;

// Elements
const scoreEl = document.getElementById('score');
const livesEl = document.getElementById('lives');
const waveEl = document.getElementById('wave');
const startScreen = document.getElementById('start-screen');
const gameOverModal = document.getElementById('game-over-modal');
const finalScoreEl = document.getElementById('final-score');
const finalWaveEl = document.getElementById('final-wave');

function init() {
    canvas = document.getElementById('game-canvas');
    ctx = canvas.getContext('2d');

    canvas.width = CANVAS_W;
    canvas.height = CANVAS_H;

    // Input
    window.addEventListener('keydown', handleKey);
    window.addEventListener('keyup', handleKey);

    document.getElementById('btn-left').addEventListener('touchstart', () => keys.left = true);
    document.getElementById('btn-left').addEventListener('touchend', () => keys.left = false);
    document.getElementById('btn-right').addEventListener('touchstart', () => keys.right = true);
    document.getElementById('btn-right').addEventListener('touchend', () => keys.right = false);
    document.getElementById('btn-shoot').addEventListener('touchstart', (e) => { e.preventDefault(); shoot(); });

    document.getElementById('start-btn').addEventListener('click', startGame);
    document.getElementById('restart-btn').addEventListener('click', startGame);
}

function handleKey(e) {
    const state = e.type === 'keydown';
    if (e.key === 'ArrowLeft' || e.key === 'a') keys.left = state;
    if (e.key === 'ArrowRight' || e.key === 'd') keys.right = state;
    if (e.key === ' ') {
        e.preventDefault();
        if (state && canShoot) shoot();
    }
}

function startGame() {
    startScreen.classList.remove('active');
    gameOverModal.classList.remove('active');

    score = 0;
    lives = 3;
    wave = 1;
    alienSpeed = 1;
    updateUI();

    resetLevel();
    isRunning = true;
    loop();
}

function resetLevel() {
    player.x = CANVAS_W / 2 - PLAYER_W / 2;
    bullets = [];
    enemyBullets = [];
    spawnAliens();
}

function spawnAliens() {
    aliens = [];
    const rows = 3 + Math.floor(wave / 3);
    const cols = 8 + Math.floor(wave / 2);

    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            aliens.push({
                x: 100 + col * 60,
                y: 50 + row * 50,
                w: ALIEN_W,
                h: ALIEN_H,
                alive: true,
                type: row % 3
            });
        }
    }
}

function shoot() {
    if (!isRunning) return;
    bullets.push({ x: player.x + PLAYER_W / 2 - 2, y: player.y, w: BULLET_W, h: BULLET_H });
    sfx.play('jump'); // Using jump sound as shoot placeholder
    canShoot = false;
    setTimeout(() => canShoot = true, 300);
}

function loop() {
    if (!isRunning) return;
    update();
    draw();
    requestAnimationFrame(loop);
}

function update() {
    // Player Movement
    if (keys.left && player.x > 0) player.x -= player.speed;
    if (keys.right && player.x < CANVAS_W - player.w) player.x += player.speed;

    // Bullets
    bullets = bullets.filter(b => {
        b.y -= 8;
        return b.y > 0;
    });

    // Enemy Bullets
    enemyBullets = enemyBullets.filter(b => {
        b.y += 5;

        // Hit player?
        if (boxCollision(b, player)) {
            loseLife();
            return false;
        }

        return b.y < CANVAS_H;
    });

    // Alien Movement
    let hitEdge = false;
    aliens.forEach(a => {
        if (!a.alive) return;
        a.x += alienDir * alienSpeed;
        if (a.x <= 0 || a.x >= CANVAS_W - ALIEN_W) hitEdge = true;
    });

    if (hitEdge) {
        alienDir *= -1;
        aliens.forEach(a => {
            if (a.alive) a.y += 20;
        });
        alienSpeed += 0.1;
    }

    // Alien Shooting
    if (Math.random() < 0.01 * Math.min(wave, 5)) {
        const aliveAliens = aliens.filter(a => a.alive);
        if (aliveAliens.length > 0) {
            const shooter = aliveAliens[Math.floor(Math.random() * aliveAliens.length)];
            enemyBullets.push({ x: shooter.x + ALIEN_W / 2, y: shooter.y + ALIEN_H, w: BULLET_W, h: BULLET_H });
        }
    }

    // Collisions
    bullets.forEach(b => {
        aliens.forEach(a => {
            if (a.alive && boxCollision(b, a)) {
                a.alive = false;
                b.y = -100; // Remove bullet
                score += 10;
                scoreEl.textContent = score;
                sfx.play('coin');
            }
        });
    });

    // Check Win
    if (aliens.every(a => !a.alive)) {
        wave++;
        waveEl.textContent = wave;
        resetLevel();
    }

    // Check Alien Reached Bottom
    aliens.forEach(a => {
        if (a.alive && a.y > CANVAS_H - 100) {
            gameOver();
        }
    });
}

function boxCollision(a, b) {
    return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

function loseLife() {
    lives--;
    livesEl.textContent = lives;
    sfx.play('hit');
    if (lives <= 0) {
        gameOver();
    }
}

function gameOver() {
    isRunning = false;
    finalScoreEl.textContent = score;
    finalWaveEl.textContent = wave;

    if (window.LeaderboardSystem && window.LeaderboardSystem.isTopScore('Space Invaders', score) && score > 0) {
        setTimeout(() => {
            const playerName = prompt("¡Nuevo récord local! Ingresa tu nombre:") || "Anónimo";
            window.LeaderboardSystem.addScore({ game: 'Space Invaders', score: score, player: playerName, date: Date.now() });
        }, 500);
    }

    gameOverModal.classList.add('active');
}

function updateUI() {
    scoreEl.textContent = score;
    livesEl.textContent = lives;
    waveEl.textContent = wave;
}

function draw() {
    // Background
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

    // Stars
    ctx.fillStyle = '#fff';
    for (let i = 0; i < 50; i++) {
        const x = (i * 137) % CANVAS_W;
        const y = (i * 211) % CANVAS_H;
        ctx.fillRect(x, y, 2, 2);
    }

    // Player
    ctx.fillStyle = '#0f0';
    ctx.fillRect(player.x, player.y, player.w, player.h);
    // Cockpit
    ctx.fillStyle = '#0ff';
    ctx.fillRect(player.x + 15, player.y + 5, 10, 10);

    // Bullets
    ctx.fillStyle = '#ff0';
    bullets.forEach(b => ctx.fillRect(b.x, b.y, b.w, b.h));

    // Enemy Bullets
    ctx.fillStyle = '#f0f';
    enemyBullets.forEach(b => ctx.fillRect(b.x, b.y, b.w, b.h));

    // Aliens
    aliens.forEach(a => {
        if (!a.alive) return;

        const colors = ['#f00', '#ff0', '#0ff'];
        ctx.fillStyle = colors[a.type];
        ctx.fillRect(a.x, a.y, a.w, a.h);

        // Eyes
        ctx.fillStyle = '#000';
        ctx.fillRect(a.x + 8, a.y + 6, 6, 6);
        ctx.fillRect(a.x + 18, a.y + 6, 6, 6);
    });
}

init();
