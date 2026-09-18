import sfx from '/assets/js/sfx.js';

// --- Configuration ---
const PRESETS = {
    easy: { rows: 9, cols: 9, mines: 10 },
    medium: { rows: 16, cols: 16, mines: 40 },
    hard: { rows: 16, cols: 30, mines: 99 } // Limited by screen width on mobile usually, might need resize
};

// --- State ---
let config = PRESETS.easy;
let grid = [];
let minesFound = 0;
let flagsPlaced = 0;
let isGameOver = false;
let isFirstClick = true;
let timer = 0;
let timerInterval = null;
let mode = 'dig'; // 'dig' or 'flag' for mobile

// Elements
const boardEl = document.getElementById('game-board');
const bombCountEl = document.getElementById('bomb-count');
const timerEl = document.getElementById('timer');
const faceBtn = document.getElementById('face-btn');
const startScreen = document.getElementById('start-screen');
const modal = document.getElementById('game-over-modal');
const resultText = document.getElementById('result-text');
const finalTimeEl = document.getElementById('final-time');
const restartBtn = document.getElementById('restart-btn');

const modeDigBtn = document.getElementById('mode-dig');
const modeFlagBtn = document.getElementById('mode-flag');

function init() {
    // Difficulty Selection
    document.querySelectorAll('.diff-select').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const diff = e.target.dataset.diff;
            // Adjustable hard mode for mobile
            if (diff === 'hard' && window.innerWidth < 600) {
                config = { rows: 16, cols: 16, mines: 40 }; // Force medium on small screens
            } else {
                config = PRESETS[diff];
            }
            startGame();
        });
    });

    restartBtn.addEventListener('click', () => {
        modal.classList.remove('active');
        startScreen.classList.add('active'); // Back to diff select
    });

    faceBtn.addEventListener('click', () => {
        if (!startScreen.classList.contains('active')) startGame();
    });

    // Mobile Toggle
    if (modeDigBtn) {
        modeDigBtn.addEventListener('click', () => setMode('dig'));
        modeFlagBtn.addEventListener('click', () => setMode('flag'));
    }
}

function setMode(newMode) {
    mode = newMode;
    if (mode === 'dig') {
        modeDigBtn.classList.add('active');
        modeFlagBtn.classList.remove('active');
    } else {
        modeFlagBtn.classList.add('active');
        modeDigBtn.classList.remove('active');
    }
}

function startGame() {
    startScreen.classList.remove('active');
    resetGame();
}

function resetGame() {
    clearInterval(timerInterval);
    timer = 0;
    isGameOver = false;
    isFirstClick = true;
    minesFound = 0;
    flagsPlaced = 0;

    timerEl.innerText = '000';
    bombCountEl.innerText = String(config.mines).padStart(3, '0');
    faceBtn.innerText = '😊';

    createBoard();
}

function createBoard() {
    boardEl.style.gridTemplateColumns = `repeat(${config.cols}, 25px)`;
    boardEl.style.gridTemplateRows = `repeat(${config.rows}, 25px)`;
    boardEl.innerHTML = '';

    grid = [];

    for (let r = 0; r < config.rows; r++) {
        let row = [];
        for (let c = 0; c < config.cols; c++) {
            const cell = document.createElement('div');
            cell.classList.add('cell');
            cell.dataset.r = r;
            cell.dataset.c = c;

            // Interaction
            cell.addEventListener('mousedown', (e) => handleInput(e, r, c));
            cell.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                handleFlag(r, c);
            });

            boardEl.appendChild(cell);
            row.push({
                el: cell,
                isMine: false,
                isRevealed: false,
                isFlagged: false,
                neighbors: 0
            });
        }
        grid.push(row);
    }
}

function handleInput(e, r, c) {
    if (isGameOver) return;

    // Mouse input
    if (e.button === 2) { // Right click
        // Handled by contextmenu, but just in case
        return;
    }

    // Left click
    if (mode === 'flag' && isTouchDevice()) {
        handleFlag(r, c);
    } else {
        handleDig(r, c);
    }
}

function isTouchDevice() {
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
}

function handleDig(r, c) {
    const cell = grid[r][c];
    if (cell.isFlagged || cell.isRevealed) return;

    if (isFirstClick) {
        placeMines(r, c);
        startTimer();
        isFirstClick = false;
    }

    if (cell.isMine) {
        gameOver(false);
    } else {
        reveal(r, c);
        checkWin();
        faceBtn.innerText = '😮';
        setTimeout(() => { if (!isGameOver) faceBtn.innerText = '😊'; }, 200);
        sfx.play('click');
    }
}

function handleFlag(r, c) {
    const cell = grid[r][c];
    if (cell.isRevealed) return;

    cell.isFlagged = !cell.isFlagged;
    cell.el.innerHTML = cell.isFlagged ? '<i class="fas fa-flag"></i>' : '';
    cell.el.classList.toggle('flag', cell.isFlagged);

    flagsPlaced += cell.isFlagged ? 1 : -1;
    bombCountEl.innerText = String(Math.max(0, config.mines - flagsPlaced)).padStart(3, '0');
    sfx.play('click'); // maybe a different sound?
}

function placeMines(imgR, imgC) {
    let minesToPlace = config.mines;
    while (minesToPlace > 0) {
        const r = Math.floor(Math.random() * config.rows);
        const c = Math.floor(Math.random() * config.cols);

        // Safety zone radius 1 around first click
        if (!grid[r][c].isMine && Math.abs(r - imgR) > 1 || Math.abs(c - imgC) > 1) {
            grid[r][c].isMine = true;
            minesToPlace--;
        }
    }

    // Calc neighbors
    for (let r = 0; r < config.rows; r++) {
        for (let c = 0; c < config.cols; c++) {
            if (!grid[r][c].isMine) {
                grid[r][c].neighbors = countMines(r, c);
            }
        }
    }
}

function countMines(r, c) {
    let count = 0;
    for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
            const nr = r + dr;
            const nc = c + dc;
            if (nr >= 0 && nr < config.rows && nc >= 0 && nc < config.cols) {
                if (grid[nr][nc].isMine) count++;
            }
        }
    }
    return count;
}

function reveal(r, c) {
    const cell = grid[r][c];
    if (cell.isRevealed || cell.isFlagged) return;

    cell.isRevealed = true;
    cell.el.classList.add('revealed');

    if (cell.neighbors > 0) {
        cell.el.innerText = cell.neighbors;
        cell.el.classList.add(`c${cell.neighbors}`);
    } else {
        // Flood fill
        for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
                const nr = r + dr;
                const nc = c + dc;
                if (nr >= 0 && nr < config.rows && nc >= 0 && nc < config.cols) {
                    reveal(nr, nc);
                }
            }
        }
    }
}

function startTimer() {
    timerInterval = setInterval(() => {
        timer++;
        timerEl.innerText = String(Math.min(timer, 999)).padStart(3, '0');
    }, 1000);
}

function checkWin() {
    let safeRemaining = 0;
    grid.forEach(row => row.forEach(cell => {
        if (!cell.isMine && !cell.isRevealed) safeRemaining++;
    }));

    if (safeRemaining === 0) {
        gameOver(true);
    }
}

function gameOver(win) {
    isGameOver = true;
    clearInterval(timerInterval);

    let calculatedScore = win ? Math.max(0, (config.mines * 1000) - timer) : 0;
    if (win && window.LeaderboardSystem && window.LeaderboardSystem.isTopScore('Buscaminas', calculatedScore) && calculatedScore > 0) {
        setTimeout(() => {
            const playerName = prompt("¡Nuevo récord local! Ingresa tu nombre:") || "Anónimo";
            window.LeaderboardSystem.addScore({ game: 'Buscaminas', score: calculatedScore, player: playerName, date: Date.now() });
        }, 500);
    }

    if (win) {
        faceBtn.innerText = '😎';
        resultText.innerText = 'YOU WIN!';
        resultText.style.color = '#00f000';
        sfx.play('score');
    } else {
        faceBtn.innerText = '😵';
        resultText.innerText = 'GAME OVER';
        resultText.style.color = '#f00';
        revealAllMines();
        sfx.play('hit');
    }

    finalTimeEl.innerText = timer;
    setTimeout(() => modal.classList.add('active'), 1000);
}

function revealAllMines() {
    grid.forEach(row => row.forEach(cell => {
        if (cell.isMine) {
            cell.el.classList.add('bomb');
            cell.el.innerHTML = '<i class="fas fa-bomb"></i>';
        } else if (cell.isFlagged && !cell.isMine) {
            cell.el.innerHTML = '<i class="fas fa-times" style="color:red"></i>'; // Wrong flag
        }
    }));
}

init();
