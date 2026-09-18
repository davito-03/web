import sfx from '/assets/js/sfx.js';

// --- Constants ---
const GRAVITY = 0.6;
const JUMP_FORCE = -12;
const SPEED = 5;
const PLAYER_W = 32;
const PLAYER_H = 32;

// --- State ---
let canvas, ctx;
let player = { x: 100, y: 0, vx: 0, vy: 0, grounded: false, dead: false };
let platforms = [];
let coins = [];
let spikes = [];
let particles = [];
let score = 0;
let lives = 3;
let cameraX = 0;
let keys = { left: false, right: false, up: false };
let isRunning = false;
let animationFrame;

// Elements
const scoreEl = document.getElementById('score');
const livesEl = document.getElementById('lives');
const startScreen = document.getElementById('start-screen');
const modal = document.getElementById('game-over-modal');
const finalScoreEl = document.getElementById('final-score');
const startBtn = document.getElementById('start-btn');
const restartBtn = document.getElementById('restart-btn');

function init() {
    canvas = document.getElementById('game-canvas');
    ctx = canvas.getContext('2d');

    // Resize
    window.addEventListener('resize', resize);
    resize();

    // Inputs
    window.addEventListener('keydown', handleKey);
    window.addEventListener('keyup', handleKey);

    // Valid Touch controls implementation
    const btnLeft = document.getElementById('btn-left');
    const btnRight = document.getElementById('btn-right');
    const btnJump = document.getElementById('btn-jump');

    bindTouch(btnLeft, 'left');
    bindTouch(btnRight, 'right');
    bindTouch(btnJump, 'up');

    startBtn.addEventListener('click', startGame);
    restartBtn.addEventListener('click', startGame);
}

function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

function bindTouch(el, key) {
    el.addEventListener('touchstart', (e) => { e.preventDefault(); keys[key] = true; });
    el.addEventListener('touchend', (e) => { e.preventDefault(); keys[key] = false; });
}

function handleKey(e) {
    const state = e.type === 'keydown';
    if (e.key === 'ArrowRight' || e.key === 'd') keys.right = state;
    if (e.key === 'ArrowLeft' || e.key === 'a') keys.left = state;
    if (e.key === 'ArrowUp' || e.key === ' ' || e.key === 'w') keys.up = state;
}

function startGame() {
    startScreen.classList.remove('active');
    modal.classList.remove('active');

    score = 0;
    lives = 3;
    updateUI();

    resetLevel();
    isRunning = true;
    loop();
}

function resetLevel() {
    player = { x: 100, y: canvas.height / 2, vx: 0, vy: 0, grounded: false, dead: false };
    platforms = [];
    coins = [];
    spikes = [];
    particles = [];
    cameraX = 0;

    // Starting platform
    platforms.push({ x: 0, y: canvas.height - 100, w: 1000, h: 50 });

    generateWorld(2000);
}

function generateWorld(offset) {
    let x = offset || 1000;
    for (let i = 0; i < 20; i++) {
        const w = 100 + Math.random() * 200;
        const gap = 50 + Math.random() * 120;
        const h = 50;
        const y = canvas.height - 100 - (Math.random() * 200 - 100);

        platforms.push({ x, y, w, h });

        // Coins?
        if (Math.random() > 0.3) {
            coins.push({ x: x + w / 2, y: y - 50, taken: false });
        }

        // Spikes?
        if (Math.random() > 0.7) {
            spikes.push({ x: x + w / 2 - 10, y: y - 20, w: 20, h: 20 });
        }

        x += w + gap;
    }
}

function loop() {
    if (!isRunning) return;
    update();
    draw();
    animationFrame = requestAnimationFrame(loop);
}

function update() {
    // Player Physics
    if (keys.right) player.vx = SPEED;
    else if (keys.left) player.vx = -SPEED;
    else player.vx *= 0.8;

    if (keys.up && player.grounded) {
        player.vy = JUMP_FORCE;
        player.grounded = false;
        sfx.play('jump'); // Assuming sfx exists or add placeholder
    }

    player.vy += GRAVITY;
    player.x += player.vx;
    player.y += player.vy;

    // Fall Death
    if (player.y > canvas.height) {
        die();
    }

    // Collisions
    player.grounded = false;
    platforms.forEach(p => {
        if (player.x + PLAYER_W > p.x && player.x < p.x + p.w &&
            player.y + PLAYER_H > p.y && player.y + PLAYER_H < p.y + p.h + 20 && // tolerance down
            player.vy > 0) {
            // Landed
            player.grounded = true;
            player.vy = 0;
            player.y = p.y - PLAYER_H;
        }
    });

    // Coins
    coins.forEach(c => {
        if (!c.taken && dist(player, c) < 30) {
            c.taken = true;
            score += 10;
            scoreEl.textContent = score;
            spawnParticles(c.x, c.y, '#ffd700');
            sfx.play('coin');
        }
    });

    // Spikes
    spikes.forEach(s => {
        if (player.x + PLAYER_W > s.x && player.x < s.x + s.w &&
            player.y + PLAYER_H > s.y && player.y < s.y + s.h) {
            die();
        }
    });

    // Camera
    cameraX = player.x - 200;

    // Endless Gen
    const lastPlat = platforms[platforms.length - 1];
    if (lastPlat.x - cameraX < canvas.width + 500) {
        generateWorld(lastPlat.x + lastPlat.w + 100);
    }

    // Pruning
    if (platforms.length > 50) {
        platforms.shift();
        coins = coins.filter(c => !c.taken && c.x - cameraX > -500);
        spikes = spikes.filter(s => s.x - cameraX > -500);
    }

    updateParticles();
}

function die() {
    lives--;
    updateUI();
    sfx.play('hit');

    if (lives <= 0) {
        gameOver();
    } else {
        // Respawn safely
        player.vy = 0;
        player.y = 0;
        // Find nearest safe platform behind
        const safe = platforms.find(p => p.x < player.x && p.x + p.w > player.x) || platforms[0];
        player.x = safe.x + 20;
        player.y = safe.y - 100;
    }
}

function updateUI() {
    livesEl.textContent = '❤️'.repeat(lives);
    scoreEl.textContent = score;
}

function gameOver() {
    isRunning = false;
    finalScoreEl.textContent = score;

    if (window.LeaderboardSystem && window.LeaderboardSystem.isTopScore('Platformer', score) && score > 0) {
        setTimeout(() => {
            const playerName = prompt("¡Nuevo récord local! Ingresa tu nombre:") || "Anónimo";
            window.LeaderboardSystem.addScore({ game: 'Platformer', score: score, player: playerName, date: Date.now() });
        }, 500);
    }

    modal.classList.add('active');
}

function spawnParticles(x, y, color) {
    for (let i = 0; i < 5; i++) {
        particles.push({
            x, y, vx: (Math.random() - 0.5) * 5, vy: (Math.random() - 0.5) * 5,
            life: 30, color
        });
    }
}

function updateParticles() {
    for (let i = particles.length - 1; i >= 0; i--) {
        let p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life--;
        if (p.life <= 0) particles.splice(i, 1);
    }
}

function dist(p1, p2) {
    return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
}

function draw() {
    // Sky
    const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
    grad.addColorStop(0, '#87CEEB');
    grad.addColorStop(1, '#E0F7FA');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    ctx.translate(-cameraX, 0);

    // Platforms
    ctx.fillStyle = '#654321';
    platforms.forEach(p => {
        ctx.fillRect(p.x, p.y, p.w, p.h);
        // Grass top
        ctx.fillStyle = '#228B22';
        ctx.fillRect(p.x, p.y, p.w, 10);
        ctx.fillStyle = '#654321';
    });

    // Coins
    ctx.fillStyle = '#FFD700';
    coins.forEach(c => {
        if (!c.taken) {
            ctx.beginPath();
            ctx.arc(c.x, c.y, 10, 0, Math.PI * 2);
            ctx.fill();
            // Shine
            ctx.fillStyle = '#FFF';
            ctx.beginPath();
            ctx.arc(c.x - 3, c.y - 3, 3, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#FFD700';
        }
    });

    // Spikes
    ctx.fillStyle = '#555';
    spikes.forEach(s => {
        ctx.beginPath();
        ctx.moveTo(s.x, s.y + s.h);
        ctx.lineTo(s.x + s.w / 2, s.y);
        ctx.lineTo(s.x + s.w, s.y + s.h);
        ctx.fill();
    });

    // Player
    ctx.fillStyle = '#e74c3c';
    ctx.fillRect(player.x, player.y, PLAYER_W, PLAYER_H);
    // Eyes
    ctx.fillStyle = '#fff';
    ctx.fillRect(player.x + (keys.left ? 4 : 18), player.y + 6, 8, 8);

    // Particles
    particles.forEach(p => {
        ctx.fillStyle = p.color;
        ctx.fillRect(p.x, p.y, 4, 4);
    });

    ctx.restore();
}

init();
