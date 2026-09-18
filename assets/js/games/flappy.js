import sfx from '/assets/js/sfx.js';

// --- Constants ---
const GRAVITY = 0.25;
const FLAP = -4.5;
const SPAWN_RATE = 100; // Frames
const PIPE_WIDTH = 50;
const PIPE_GAP = 100;
const CANVAS_W = 320;
const CANVAS_H = 480;

// --- State ---
let canvas, ctx;
let frames = 0;
let score = 0;
let highScore = localStorage.getItem('flappy_highscore') || 0;
let isRunning = false;

// Entities
const bird = {
  x: 50,
  y: 150,
  w: 24,
  h: 24,
  radius: 12,
  velocity: 0,

  draw: function () {
    ctx.fillStyle = '#FFD700';
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#000';
    ctx.stroke();

    // Eye
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(this.x + 6, this.y - 6, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(this.x + 8, this.y - 6, 1, 0, Math.PI * 2);
    ctx.fill();
  },

  flap: function () {
    this.velocity = FLAP;
    sfx.createBeep(400, 0.1, 0.1); // Quick flap sound
  },

  update: function () {
    this.velocity += GRAVITY;
    this.y += this.velocity;

    // Floor Collision
    if (this.y + this.radius >= CANVAS_H - 20) { // Ground is at bottom 20px
      this.y = CANVAS_H - 20 - this.radius;
      gameOver();
    }

    // Ceiling
    if (this.y - this.radius <= 0) {
      this.y = this.radius;
      this.velocity = 0;
    }
  }
};

const pipes = {
  items: [],

  reset: function () {
    this.items = [];
  },

  update: function () {
    if (frames % SPAWN_RATE === 0) {
      // Position
      const maxY = CANVAS_H - 150;
      const topHeight = Math.floor(Math.random() * (maxY - PIPE_GAP)) + 20;

      this.items.push({
        x: CANVAS_W,
        y: topHeight, // Bottom of top pipe
        passed: false
      });
    }

    for (let i = 0; i < this.items.length; i++) {
      let p = this.items[i];
      p.x -= 2; // Speed

      // Collision Logic
      // Bird Box (simplified)
      const bx = bird.x - bird.radius;
      const by = bird.y - bird.radius;
      const bw = bird.radius * 2;
      const bh = bird.radius * 2;

      // Top Pipe
      if (
        bx < p.x + PIPE_WIDTH &&
        bx + bw > p.x &&
        by < p.y
      ) {
        gameOver();
      }
      // Bottom Pipe
      if (
        bx < p.x + PIPE_WIDTH &&
        bx + bw > p.x &&
        by + bh > p.y + PIPE_GAP
      ) {
        gameOver();
      }

      // Remove off screen
      if (p.x + PIPE_WIDTH < 0) {
        this.items.shift();
        i--;
      }

      // Score
      if (p.x + PIPE_WIDTH < bird.x && !p.passed) {
        score++;
        p.passed = true;
        scoreEl.innerHTML = score;
        sfx.play('score');
      }
    }
  },

  draw: function () {
    ctx.fillStyle = '#73BF2E';
    ctx.strokeStyle = '#558C22';
    ctx.lineWidth = 2;

    for (let i = 0; i < this.items.length; i++) {
      let p = this.items[i];

      // Top Pipe
      ctx.fillRect(p.x, 0, PIPE_WIDTH, p.y);
      ctx.strokeRect(p.x, 0, PIPE_WIDTH, p.y);

      // Bottom Pipe
      ctx.fillRect(p.x, p.y + PIPE_GAP, PIPE_WIDTH, CANVAS_H - p.y - PIPE_GAP);
      ctx.strokeRect(p.x, p.y + PIPE_GAP, PIPE_WIDTH, CANVAS_H - p.y - PIPE_GAP);
    }
  }
};

// --- Elements ---
const scoreEl = document.getElementById('score');
const startScreen = document.getElementById('start-screen');
const modal = document.getElementById('game-over-modal');
const finalScoreEl = document.getElementById('final-score');
const highScoreEl = document.getElementById('high-score');
const startBtn = document.getElementById('start-btn');
const restartBtn = document.getElementById('restart-btn');

function init() {
  canvas = document.getElementById('game-canvas');
  ctx = canvas.getContext('2d');

  // Controls
  startBtn.addEventListener('click', startGame);
  restartBtn.addEventListener('click', resetGame);

  // Tap/Click/Space
  window.addEventListener('keydown', (e) => {
    if (e.code === 'Space' || e.code === 'ArrowUp') {
      e.preventDefault();
      action();
    }
  });
  canvas.addEventListener('touchstart', (e) => { e.preventDefault(); action(); }, { passive: false });
  canvas.addEventListener('mousedown', (e) => { e.preventDefault(); action(); });
}

function action() {
  if (isRunning) {
    bird.flap();
  }
}

function startGame() {
  startScreen.classList.remove('active');
  resetGame();
}

function resetGame() {
  modal.classList.remove('active');
  bird.y = 150;
  bird.velocity = 0;
  pipes.reset();
  score = 0;
  scoreEl.innerHTML = score;
  frames = 0;
  isRunning = true;
  loop();
}

function loop() {
  if (!isRunning) return;

  update();
  draw();
  frames++;

  requestAnimationFrame(loop);
}

function update() {
  bird.update();
  pipes.update();
}

function draw() {
  // BG
  ctx.fillStyle = '#4EC0CA';
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

  pipes.draw();

  // Ground
  ctx.fillStyle = '#DED895';
  ctx.fillRect(0, CANVAS_H - 20, CANVAS_W, 20);
  ctx.beginPath();
  ctx.moveTo(0, CANVAS_H - 20);
  ctx.lineTo(CANVAS_W, CANVAS_H - 20);
  ctx.stroke();

  bird.draw();
}

function gameOver() {
  isRunning = false;
  finalScoreEl.innerHTML = score;
  if (score > highScore) {
    highScore = score;
    localStorage.setItem('flappy_highscore', highScore);
  }
  highScoreEl.innerHTML = highScore;

  if (window.LeaderboardSystem && window.LeaderboardSystem.isTopScore('Flappy', score) && score > 0) {
    setTimeout(() => {
      const playerName = prompt("¡Nuevo récord local! Ingresa tu nombre:") || "Anónimo";
      const position = window.LeaderboardSystem.addScore({
        game: 'Flappy',
        score: score,
        player: playerName,
        date: Date.now()
      });
      if (position && position <= 10) {
        alert(`¡Posición #${position} en el ranking local!`);
      }
    }, 500);
  }

  modal.classList.add('active');
  sfx.play('hit');
}

init();
