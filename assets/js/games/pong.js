import sfx from '/assets/js/sfx.js';

// --- Constants ---
const CANVAS_WIDTH = 600;
const CANVAS_HEIGHT = 400;
const PADDLE_WIDTH = 10;
const PADDLE_HEIGHT = 80;
const BALL_SIZE = 10;
const WIN_SCORE = 5;

// --- State ---
let canvas, ctx;
let player = { x: 0, y: 160, score: 0 };
let cpu = { x: 590, y: 160, score: 0, speed: 4 }; // CPU starts slower
let ball = { x: 300, y: 200, dx: 5, dy: 5 };
let isRunning = false;
let gameInterval;
let difficultyMultiplier = 1;

// --- Elements ---
const playerScoreEl = document.getElementById('player-score');
const cpuScoreEl = document.getElementById('cpu-score');
const startScreen = document.getElementById('start-screen');
const gameOverModal = document.getElementById('game-over-modal');
const resultTitle = document.getElementById('result-title');
const restartBtn = document.getElementById('restart-btn');

function init() {
  canvas = document.getElementById('game-canvas');
  ctx = canvas.getContext('2d');

  // Input Handling
  canvas.addEventListener('mousemove', movePlayer);
  canvas.addEventListener('touchmove', movePlayerTouch, { passive: false });

  // Difficulty Buttons
  document.querySelectorAll('.diff-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const speed = parseFloat(e.target.dataset.speed);
      startGame(speed);
    });
  });

  restartBtn.addEventListener('click', resetGame);
}

function startGame(cpuSpeed) {
  if (cpuSpeed) cpu.speed = cpuSpeed;
  startScreen.classList.remove('active');
  resetRound();
  isRunning = true;
  gameInterval = requestAnimationFrame(gameLoop);
}

function resetGame() {
  gameOverModal.classList.remove('active');
  player.score = 0;
  cpu.score = 0;
  difficultyMultiplier = 1;
  updateScoreBoard();

  // Go back to difficulty select
  startScreen.classList.add('active');
  isRunning = false;
}

function resetRound() {
  ball.x = CANVAS_WIDTH / 2;
  ball.y = CANVAS_HEIGHT / 2;
  // Random direction
  ball.dx = (Math.random() > 0.5 ? 5 : -5) * (1 + (player.score + cpu.score) * 0.05); // Speed up slightly over match
  ball.dy = (Math.random() * 6 - 3);
}

function movePlayer(e) {
  const rect = canvas.getBoundingClientRect();
  const root = document.documentElement;
  let mouseY = e.clientY - rect.top - root.scrollTop;

  // Center paddle on mouse
  player.y = mouseY - PADDLE_HEIGHT / 2;
  clampPlayer();
}

function movePlayerTouch(e) {
  e.preventDefault();
  const rect = canvas.getBoundingClientRect();
  const touch = e.touches[0];
  let touchY = touch.clientY - rect.top;

  player.y = touchY - PADDLE_HEIGHT / 2;
  clampPlayer();
}

function clampPlayer() {
  if (player.y < 0) player.y = 0;
  if (player.y > CANVAS_HEIGHT - PADDLE_HEIGHT) player.y = CANVAS_HEIGHT - PADDLE_HEIGHT;
}

function update() {
  if (!isRunning) return;

  // Move Ball
  ball.x += ball.dx;
  ball.y += ball.dy;

  // Wall Bounce (Top/Bottom)
  if (ball.y <= 0 || ball.y + BALL_SIZE >= CANVAS_HEIGHT) {
    ball.dy *= -1;
    sfx.play('hit');
  }

  // Paddle Collision - Player
  if (ball.x <= player.x + PADDLE_WIDTH &&
    ball.y + BALL_SIZE >= player.y &&
    ball.y <= player.y + PADDLE_HEIGHT) {

    ball.dx *= -1;
    // Add spin based on where it hit paddle
    let deltaY = ball.y - (player.y + PADDLE_HEIGHT / 2);
    ball.dy = deltaY * 0.3;

    // Push ball out to prevent sticking
    ball.x = player.x + PADDLE_WIDTH;

    sfx.play('ping');
  }

  // Paddle Collision - CPU
  if (ball.x + BALL_SIZE >= cpu.x &&
    ball.y + BALL_SIZE >= cpu.y &&
    ball.y <= cpu.y + PADDLE_HEIGHT) {

    ball.dx *= -1;
    let deltaY = ball.y - (cpu.y + PADDLE_HEIGHT / 2);
    ball.dy = deltaY * 0.3;

    ball.x = cpu.x - BALL_SIZE;

    sfx.play('ping');
  }

  // CPU Logic (Simple tracking with delay)
  let targetY = ball.y - PADDLE_HEIGHT / 2;
  // CPU makes mistakes or responds slower
  if (Math.random() < 0.9) {
    if (cpu.y < targetY) cpu.y += cpu.speed;
    else cpu.y -= cpu.speed;
  }

  // Clamp CPU
  if (cpu.y < 0) cpu.y = 0;
  if (cpu.y > CANVAS_HEIGHT - PADDLE_HEIGHT) cpu.y = CANVAS_HEIGHT - PADDLE_HEIGHT;

  // Scoring
  if (ball.x < 0) {
    // CPU Point
    cpu.score++;
    playScoreSound();
    checkWin();
  } else if (ball.x > CANVAS_WIDTH) {
    // Player Point
    player.score++;
    playScoreSound();
    checkWin();
  }
}

function playScoreSound() {
  sfx.play('score');
  updateScoreBoard();
  if (isRunning) resetRound();
}

function checkWin() {
  if (player.score >= WIN_SCORE || cpu.score >= WIN_SCORE) {
    isRunning = false;

    if (player.score >= WIN_SCORE && window.LeaderboardSystem && window.LeaderboardSystem.isTopScore('Pong', player.score)) {
      setTimeout(() => {
        const playerName = prompt("¡Nuevo récord local! Ingresa tu nombre:") || "Anónimo";
        window.LeaderboardSystem.addScore({ game: 'Pong', score: player.score, player: playerName, date: Date.now() });
      }, 500);
    }

    gameOverModal.classList.add('active');
    resultTitle.textContent = player.score >= WIN_SCORE ? "YOU WIN!" : "CPU WINS!";
    resultTitle.style.color = player.score >= WIN_SCORE ? "#0f0" : "#f00";
  }
}

function updateScoreBoard() {
  playerScoreEl.textContent = player.score;
  cpuScoreEl.textContent = cpu.score;
}

function draw() {
  // Clear
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  // Net
  ctx.strokeStyle = '#333';
  ctx.setLineDash([10, 15]);
  ctx.beginPath();
  ctx.moveTo(CANVAS_WIDTH / 2, 0);
  ctx.lineTo(CANVAS_WIDTH / 2, CANVAS_HEIGHT);
  ctx.stroke();

  // Ball
  ctx.fillStyle = '#fff';
  ctx.fillRect(ball.x, ball.y, BALL_SIZE, BALL_SIZE);

  // Player Paddle
  ctx.fillStyle = '#fff';
  ctx.fillRect(player.x, player.y, PADDLE_WIDTH, PADDLE_HEIGHT);

  // CPU Paddle
  ctx.fillStyle = '#ccc';
  ctx.fillRect(cpu.x, cpu.y, PADDLE_WIDTH, PADDLE_HEIGHT);
}

function gameLoop() {
  if (isRunning) {
    update();
    draw();
    requestAnimationFrame(gameLoop);
  }
}

init();
