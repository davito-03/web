import sfx from '/assets/js/sfx.js';

// --- Constants ---
const CANVAS_W = 600;
const CANVAS_H = 400;
const PADDLE_W_DEFAULT = 80;
const PADDLE_H = 10;
const PADDLE_SPEED = 7;
const BALL_R = 6;
const BRICK_W = 65;
const BRICK_H = 20;
const BRICK_PADDING = 10;
const BRICK_OFFSET_TOP = 40;
const BRICK_OFFSET_LEFT = 35;

// Power-ups
const PU_W = 20;
const PU_H = 20;
const PU_TYPES = {
    WIDE: { color: '#00FF00', label: 'W' }, // Wide Paddle
    LIFE: { color: '#FF0000', label: '♥' }, // Extra Life
    SLOW: { color: '#00BFFF', label: 'S' }  // Slow Ball
};

// --- State ---
let canvas, ctx;
let paddle = { x: CANVAS_W / 2 - PADDLE_W_DEFAULT / 2, w: PADDLE_W_DEFAULT };
let ball = { x: 0, y: 0, dx: 0, dy: 0, active: false };
let bricks = [];
let powerups = [];
let score = 0;
let lives = 3;
let level = 1;
let isRunning = false;
let rightPressed = false;
let leftPressed = false;

// Elements
const scoreEl = document.getElementById('score');
const livesEl = document.getElementById('lives');
const levelEl = document.getElementById('level-display'); // Need to add this to HTML? or just use overlay
const startScreen = document.getElementById('start-screen');
const modal = document.getElementById('game-over-modal');
const finalScoreEl = document.getElementById('final-score');
const resultText = document.getElementById('result-text');
const startBtn = document.getElementById('start-btn');
const restartBtn = document.getElementById('restart-btn');

function init() {
    canvas = document.getElementById('game-canvas');
    ctx = canvas.getContext('2d');

    // Inputs
    document.addEventListener('keydown', leadKeyDown);
    document.addEventListener('keyup', leadKeyUp);
    document.addEventListener('mousemove', movePaddleMouse);

    // Touch
    canvas.addEventListener('touchstart', touchStart, { passive: false });
    canvas.addEventListener('touchmove', touchMove, { passive: false });

    // Mouse Click to Launch
    canvas.addEventListener('mousedown', launchBall);

    startBtn.addEventListener('click', startGame);
    restartBtn.addEventListener('click', resetGame);
}

function startGame() {
    startScreen.classList.remove('active');
    resetGame();
}

function resetGame() {
    modal.classList.remove('active');
    score = 0;
    lives = 3;
    level = 1;
    paddle.w = PADDLE_W_DEFAULT;

    loadLevel(level);
    resetBall();
    isRunning = true;
    requestAnimationFrame(loop);
}

function loadLevel(lvl) {
    bricks = [];
    powerups = [];

    // Increase rows/speed with level
    const rows = Math.min(3 + lvl, 8);
    const cols = 8;

    for (let c = 0; c < cols; c++) {
        bricks[c] = [];
        for (let r = 0; r < rows; r++) {
            // Chance for powerup
            let pu = null;
            if (Math.random() < 0.1) {
                const types = Object.keys(PU_TYPES);
                pu = types[Math.floor(Math.random() * types.length)];
            }

            bricks[c][r] = { x: 0, y: 0, status: 1, powerup: pu };
        }
    }
    updateUI();
}

function resetBall() {
    ball.active = false;
    ball.dy = 0;
    ball.dx = 0;
    // Position set in update() to follow paddle
}

function launchBall() {
    if (isRunning && !ball.active) {
        ball.active = true;
        ball.dy = -4 - (level * 0.5); // Faster per level
        ball.dx = 4 * (Math.random() > 0.5 ? 1 : -1);
    }
}

// Input Handlers
function leadKeyDown(e) {
    if (e.key === "Right" || e.key === "ArrowRight" || e.key === "d" || e.key === "D") rightPressed = true;
    else if (e.key === "Left" || e.key === "ArrowLeft" || e.key === "a" || e.key === "A") leftPressed = true;
    else if (e.code === "Space") launchBall();
}

function leadKeyUp(e) {
    if (e.key === "Right" || e.key === "ArrowRight" || e.key === "d" || e.key === "D") rightPressed = false;
    else if (e.key === "Left" || e.key === "ArrowLeft" || e.key === "a" || e.key === "A") leftPressed = false;
}

function movePaddleMouse(e) {
    if (!isRunning) return;
    const relativeX = e.clientX - canvas.offsetLeft;
    if (relativeX > 0 && relativeX < canvas.width) {
        paddle.x = relativeX - paddle.w / 2;
    }
}

function touchStart(e) {
    if (!isRunning) return;
    e.preventDefault();
    launchBall();
    touchMove(e);
}

function touchMove(e) {
    if (!isRunning) return;
    e.preventDefault();
    const relativeX = e.touches[0].clientX - canvas.offsetLeft;
    if (relativeX > 0 && relativeX < canvas.width) {
        paddle.x = relativeX - paddle.w / 2;
    }
}

function loop() {
    if (!isRunning) return;
    update();
    draw();
    requestAnimationFrame(loop);
}

function update() {
    // Paddle Movement (Keyboard)
    if (rightPressed && paddle.x < CANVAS_W - paddle.w) {
        paddle.x += PADDLE_SPEED;
    }
    else if (leftPressed && paddle.x > 0) {
        paddle.x -= PADDLE_SPEED;
    }

    // Ball Logic
    if (!ball.active) {
        ball.x = paddle.x + paddle.w / 2;
        ball.y = CANVAS_H - PADDLE_H - BALL_R - 2;
    } else {
        ball.x += ball.dx;
        ball.y += ball.dy;

        // Walls
        if (ball.x + ball.dx > CANVAS_W - BALL_R || ball.x + ball.dx < BALL_R) {
            ball.dx = -ball.dx;
            sfx.play('hit');
        }
        if (ball.y + ball.dy < BALL_R) {
            ball.dy = -ball.dy;
            sfx.play('hit');
        } else if (ball.y + ball.dy > CANVAS_H - BALL_R) {
            // Lost Life
            lives--;
            sfx.play('hit');
            if (!lives) {
                gameOver(false);
            } else {
                paddle.w = PADDLE_W_DEFAULT; // Reset paddle size
                updateUI();
                resetBall();
            }
        }

        // Paddle Collision
        // Check if ball is low enough to hit paddle
        if (ball.dy > 0 && ball.y + BALL_R >= CANVAS_H - PADDLE_H) {
            // Check horizontal overlap with some leniency
            if (ball.x + BALL_R >= paddle.x && ball.x - BALL_R <= paddle.x + paddle.w) {
                // Hit paddle!
                ball.dy = -Math.abs(ball.dy); // Ensure it goes UP
                ball.y = CANVAS_H - PADDLE_H - BALL_R - 1; // Snap out of paddle to prevent sticking

                // Spin / Angle based on hit position
                let hitPoint = ball.x - (paddle.x + paddle.w / 2);
                // Normalize hit point (-1 to 1)
                let normalizedHit = hitPoint / (paddle.w / 2);

                ball.dx = normalizedHit * 6; // slightly stronger angle control

                sfx.play('ping');
            }
        }

        // Bricks
        let activeBricks = 0;
        for (let c = 0; c < 8; c++) {
            for (let r = 0; r < bricks[c].length; r++) {
                let b = bricks[c][r];
                if (b.status == 1) {
                    activeBricks++;
                    let brickX = (c * (BRICK_W + BRICK_PADDING)) + BRICK_OFFSET_LEFT;
                    let brickY = (r * (BRICK_H + BRICK_PADDING)) + BRICK_OFFSET_TOP;
                    b.x = brickX;
                    b.y = brickY;

                    if (ball.x > b.x && ball.x < b.x + BRICK_W && ball.y > b.y && ball.y < b.y + BRICK_H) {
                        ball.dy = -ball.dy;
                        b.status = 0;
                        score += 10;
                        updateUI();
                        sfx.play('pop');

                        // Spawn Powerup
                        if (b.powerup) {
                            spawnPowerup(b.x + BRICK_W / 2, b.y + BRICK_H / 2, b.powerup);
                        }
                    }
                }
            }
        }

        if (activeBricks === 0) {
            nextLevel();
        }
    }

    // Update Powerups
    for (let i = powerups.length - 1; i >= 0; i--) {
        let p = powerups[i];
        p.y += 2; // Fall speed

        // Catch?
        if (p.y + PU_H >= CANVAS_H - PADDLE_H && p.x >= paddle.x && p.x <= paddle.x + paddle.w) {
            applyPowerup(p.type);
            powerups.splice(i, 1);
            sfx.play('score'); // Powerup sound
        } else if (p.y > CANVAS_H) {
            powerups.splice(i, 1);
        }
    }
}

function spawnPowerup(x, y, type) {
    powerups.push({ x, y, type });
}

function applyPowerup(type) {
    if (type === 'WIDE') {
        paddle.w = Math.min(paddle.w + 20, 200);
    } else if (type === 'LIFE') {
        lives++;
        updateUI();
    } else if (type === 'SLOW') {
        ball.dx *= 0.7;
        ball.dy *= 0.7;
    }
}

function nextLevel() {
    level++;
    sfx.play('score'); // Victory sound
    paddle.w = PADDLE_W_DEFAULT; // Reset paddle size for new level? Or keep it? keeping it is fun.
    loadLevel(level);
    resetBall();
}

function draw() {
    // Clear
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

    // Bricks
    for (let c = 0; c < 8; c++) {
        for (let r = 0; r < bricks[c].length; r++) {
            if (bricks[c][r].status == 1) {
                let brickX = (c * (BRICK_W + BRICK_PADDING)) + BRICK_OFFSET_LEFT;
                let brickY = (r * (BRICK_H + BRICK_PADDING)) + BRICK_OFFSET_TOP;

                const colors = ['#FF0000', '#FF7F00', '#FFFF00', '#00FF00', '#0000FF', '#4B0082', '#9400D3'];
                ctx.fillStyle = colors[r % colors.length];
                ctx.fillRect(brickX, brickY, BRICK_W, BRICK_H);
            }
        }
    }

    // Powerups
    powerups.forEach(p => {
        let meta = PU_TYPES[p.type];
        ctx.fillStyle = meta.color;
        ctx.fillRect(p.x - 10, p.y - 10, 20, 20);
        ctx.fillStyle = '#000';
        ctx.font = '10px Arial';
        ctx.fillText(meta.label, p.x - 4, p.y + 4);
    });

    // Ball
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, BALL_R, 0, Math.PI * 2);
    ctx.fillStyle = "#fff";
    ctx.fill();
    ctx.closePath();

    // Paddle
    ctx.fillStyle = "#00BFFF";
    ctx.fillRect(paddle.x, CANVAS_H - PADDLE_H, paddle.w, PADDLE_H);
}

function updateUI() {
    scoreEl.textContent = score;
    livesEl.textContent = lives;
    if (document.getElementById('level-num')) document.getElementById('level-num').textContent = level;
}

function gameOver(win) {
    isRunning = false;
    finalScoreEl.textContent = score;
    resultText.innerHTML = win ? "YOU WIN!" : "GAME OVER";
    resultText.style.color = win ? "#00FF00" : "#FF0000";

    if (window.LeaderboardSystem && window.LeaderboardSystem.isTopScore('Breakout', score) && score > 0) {
        setTimeout(() => {
            const playerName = prompt("¡Nuevo récord local! Ingresa tu nombre:") || "Anónimo";
            window.LeaderboardSystem.addScore({ game: 'Breakout', score: score, player: playerName, date: Date.now() });
        }, 500);
    }

    modal.classList.add('active');
}

init();
