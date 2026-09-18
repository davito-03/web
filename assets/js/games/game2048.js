import sfx from '/assets/js/sfx.js';

// --- Constants ---
const SIZE = 4;
let grid = [];
let score = 0;
let isRunning = false;

// --- Elements ---
const board = document.getElementById('game-board');
const scoreEl = document.getElementById('score');
const startScreen = document.getElementById('start-screen');
const modal = document.getElementById('game-over-modal');
const finalScoreEl = document.getElementById('final-score');
const startBtn = document.getElementById('start-btn');
const restartBtn = document.getElementById('restart-btn');

function init() {
  startBtn.addEventListener('click', startGame);
  restartBtn.addEventListener('click', resetGame);

  // Keyboard
  window.addEventListener('keydown', handleKey);

  // Touch (Swipe)
  let touchStartX = 0, touchStartY = 0;
  document.addEventListener('touchstart', e => {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
  }, { passive: false });

  document.addEventListener('touchend', e => {
    if (!isRunning) return;
    const dx = e.changedTouches[0].clientX - touchStartX;
    const dy = e.changedTouches[0].clientY - touchStartY;
    const absX = Math.abs(dx);
    const absY = Math.abs(dy);

    if (Math.max(absX, absY) > 30) { // Threshold
      if (absX > absY) {
        if (dx > 0) moveRight(); else moveLeft();
      } else {
        if (dy > 0) moveDown(); else moveUp();
      }
    }
  }, { passive: false });
}

function startGame() {
  startScreen.classList.remove('active');
  resetGame();
}

function resetGame() {
  modal.classList.remove('active');
  grid = Array.from({ length: SIZE }, () => Array(SIZE).fill(0));
  score = 0;
  isRunning = true;
  updateScore();
  spawn();
  spawn();
  render();
}

function spawn() {
  const empty = [];
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      if (grid[r][c] === 0) empty.push({ r, c });
    }
  }
  if (empty.length === 0) return;

  const { r, c } = empty[Math.floor(Math.random() * empty.length)];
  grid[r][c] = Math.random() < 0.9 ? 2 : 4;
}

function render() {
  board.innerHTML = '';
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      const val = grid[r][c];
      const tile = document.createElement('div');
      tile.className = `tile tile-${val}`;
      tile.textContent = val > 0 ? val : '';
      board.appendChild(tile);
    }
  }
}

function updateScore() {
  scoreEl.textContent = score;
}

// --- Logic ---
function compress(row) {
  let newRow = row.filter(val => val !== 0);
  while (newRow.length < SIZE) newRow.push(0);
  return newRow;
}

function merge(row) {
  for (let i = 0; i < SIZE - 1; i++) {
    if (row[i] !== 0 && row[i] === row[i + 1]) {
      row[i] *= 2;
      score += row[i];
      row[i + 1] = 0;
      sfx.play('pop');
    }
  }
  return row;
}

function moveLeft() {
  if (!isRunning) return;
  let moved = false;
  for (let r = 0; r < SIZE; r++) {
    let row = grid[r];
    let original = JSON.stringify(row);

    row = compress(row);
    row = merge(row);
    row = compress(row);

    grid[r] = row;
    if (JSON.stringify(row) !== original) moved = true;
  }
  finalizeMove(moved);
}

function moveRight() {
  if (!isRunning) return;
  let moved = false;
  for (let r = 0; r < SIZE; r++) {
    let row = grid[r].reverse();
    let original = JSON.stringify(row);

    row = compress(row);
    row = merge(row);
    row = compress(row);

    grid[r] = row.reverse();
    if (JSON.stringify(row) !== original) moved = true;
  }
  finalizeMove(moved);
}

function moveUp() {
  if (!isRunning) return;
  let moved = false;
  for (let c = 0; c < SIZE; c++) {
    let row = [grid[0][c], grid[1][c], grid[2][c], grid[3][c]];
    let original = JSON.stringify(row);

    row = compress(row);
    row = merge(row);
    row = compress(row);

    for (let r = 0; r < SIZE; r++) grid[r][c] = row[r];
    if (JSON.stringify(row) !== original) moved = true;
  }
  finalizeMove(moved);
}

function moveDown() {
  if (!isRunning) return;
  let moved = false;
  for (let c = 0; c < SIZE; c++) {
    let row = [grid[0][c], grid[1][c], grid[2][c], grid[3][c]].reverse();
    let original = JSON.stringify(row);

    row = compress(row);
    row = merge(row);
    row = compress(row);
    row = row.reverse();

    for (let r = 0; r < SIZE; r++) grid[r][c] = row[r];
    if (JSON.stringify(row) !== original) moved = true;
  }
  finalizeMove(moved);
}

function finalizeMove(moved) {
  if (moved) {
    spawn();
    render();
    updateScore();
    if (isGameOver()) {
      gameOver();
    }
  }
}

function isGameOver() {
  // Check empty
  for (let r = 0; r < SIZE; r++)
    for (let c = 0; c < SIZE; c++)
      if (grid[r][c] === 0) return false;

  // Check merges
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      if (c < SIZE - 1 && grid[r][c] === grid[r][c + 1]) return false;
      if (r < SIZE - 1 && grid[r][c] === grid[r + 1][c]) return false;
    }
  }
  return true;
}

function gameOver() {
  isRunning = false;
  finalScoreEl.textContent = score;

  if (window.LeaderboardSystem && window.LeaderboardSystem.isTopScore('2048', score) && score > 0) {
    setTimeout(() => {
      const playerName = prompt("¡Nuevo récord local! Ingresa tu nombre:") || "Anónimo";
      window.LeaderboardSystem.addScore({ game: '2048', score: score, player: playerName, date: Date.now() });
    }, 500);
  }

  modal.classList.add('active');
  sfx.play('hit');
}

function handleKey(e) {
  if (!isRunning) return;
  if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) e.preventDefault();

  switch (e.key) {
    case 'ArrowUp': moveUp(); break;
    case 'ArrowDown': moveDown(); break;
    case 'ArrowLeft': moveLeft(); break;
    case 'ArrowRight': moveRight(); break;
  }
}

init();
