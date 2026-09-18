import sfx from '/assets/js/sfx.js';

// --- Constants ---
const ROWS = 6;
const COLS = 7;
const PLAYER = 1; // Red
const CPU = 2;    // Yellow
const EMPTY = 0;

// --- State ---
let grid = [];
let currentPlayer = PLAYER;
let isGameOver = false;
let isThinking = false;

// Elements
const boardEl = document.getElementById('game-board');
const statusText = document.getElementById('status-text');
const startScreen = document.getElementById('start-screen');
const modal = document.getElementById('game-over-modal');
const resultText = document.getElementById('result-text');
const startBtn = document.getElementById('start-btn');
const restartBtn = document.getElementById('restart-btn');

function init() {
    startBtn.addEventListener('click', startGame);
    restartBtn.addEventListener('click', startGame);

    // Generate empty slots purely for visual structure initially?
    // Actually startGame does createBoard which makes slots.
}

function startGame() {
    startScreen.classList.remove('active');
    modal.classList.remove('active');

    resetGame();
}

function resetGame() {
    grid = Array.from({ length: ROWS }, () => Array(COLS).fill(EMPTY));
    currentPlayer = PLAYER;
    isGameOver = false;
    isThinking = false;
    statusText.innerText = "YOUR TURN";

    createBoard();
}

function createBoard() {
    boardEl.innerHTML = '';

    // We create columns interaction
    for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
            const slot = document.createElement('div');
            slot.classList.add('slot');
            slot.dataset.r = r;
            slot.dataset.c = c;

            // Interaction per column
            slot.addEventListener('click', () => handleColumnClick(c));

            boardEl.appendChild(slot);
        }
    }
}

function handleColumnClick(col) {
    if (isGameOver || isThinking || currentPlayer !== PLAYER) return;

    if (dropPiece(col, PLAYER)) {
        sfx.play('click'); // Drop sound
        if (checkWin(PLAYER)) {
            gameOver(PLAYER);
        } else {
            currentPlayer = CPU;
            statusText.innerText = "CPU THINKING...";
            isThinking = true;
            setTimeout(cpuMove, 800);
        }
    } else {
        sfx.play('hit'); // Invalid move sound
    }
}

function dropPiece(col, player) {
    // Find lowest empty row
    for (let r = ROWS - 1; r >= 0; r--) {
        if (grid[r][col] === EMPTY) {
            grid[r][col] = player;

            // Visual
            const index = r * COLS + col;
            const slot = boardEl.children[index];
            const piece = document.createElement('div');
            piece.classList.add('piece', player === PLAYER ? 'red' : 'yellow');
            slot.appendChild(piece);

            return true;
        }
    }
    return false;
}

function checkWin(player) {
    // Horizontal
    for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS - 3; c++) {
            if (grid[r][c] === player && grid[r][c + 1] === player && grid[r][c + 2] === player && grid[r][c + 3] === player) {
                highlightWin([[r, c], [r, c + 1], [r, c + 2], [r, c + 3]]);
                return true;
            }
        }
    }
    // Vertical
    for (let r = 0; r < ROWS - 3; r++) {
        for (let c = 0; c < COLS; c++) {
            if (grid[r][c] === player && grid[r + 1][c] === player && grid[r + 2][c] === player && grid[r + 3][c] === player) {
                highlightWin([[r, c], [r + 1, c], [r + 2, c], [r + 3, c]]);
                return true;
            }
        }
    }
    // Diagonal \
    for (let r = 0; r < ROWS - 3; r++) {
        for (let c = 0; c < COLS - 3; c++) {
            if (grid[r][c] === player && grid[r + 1][c + 1] === player && grid[r + 2][c + 2] === player && grid[r + 3][c + 3] === player) {
                highlightWin([[r, c], [r + 1, c + 1], [r + 2, c + 2], [r + 3, c + 3]]);
                return true;
            }
        }
    }
    // Diagonal /
    for (let r = 3; r < ROWS; r++) {
        for (let c = 0; c < COLS - 3; c++) {
            if (grid[r][c] === player && grid[r - 1][c + 1] === player && grid[r - 2][c + 2] === player && grid[r - 3][c + 3] === player) {
                highlightWin([[r, c], [r - 1, c + 1], [r - 2, c + 2], [r - 3, c + 3]]);
                return true;
            }
        }
    }
    return false;
}

function highlightWin(coords) {
    coords.forEach(([r, c]) => {
        const index = r * COLS + c;
        const slot = boardEl.children[index];
        const piece = slot.querySelector('.piece');
        if (piece) piece.classList.add('win');
    });
}

function cpuMove() {
    if (isGameOver) return;

    // VERY Basic AI for now (random + block immediate threat if easy to detect, later minimax if task demands)
    // Let's implement at least "try to win" and "block win" logic

    let bestCol = -1;

    // 1. Check for winning move
    for (let c = 0; c < COLS; c++) {
        if (canPlay(c)) {
            makeMove(c, CPU);
            if (checkWinLogic(CPU)) {
                undoMove(c);
                bestCol = c;
                break;
            }
            undoMove(c);
        }
    }

    // 2. Block player win
    if (bestCol === -1) {
        for (let c = 0; c < COLS; c++) {
            if (canPlay(c)) {
                makeMove(c, PLAYER);
                if (checkWinLogic(PLAYER)) {
                    undoMove(c);
                    bestCol = c;
                    break;
                }
                undoMove(c);
            }
        }
    }

    // 3. Random valid
    if (bestCol === -1) {
        const validCols = [];
        for (let c = 0; c < COLS; c++) {
            if (canPlay(c)) validCols.push(c);
        }
        if (validCols.length > 0) {
            bestCol = validCols[Math.floor(Math.random() * validCols.length)];
        }
    }

    if (bestCol !== -1) {
        dropPiece(bestCol, CPU);
        sfx.play('click');
        if (checkWin(CPU)) {
            gameOver(CPU);
        } else {
            currentPlayer = PLAYER;
            statusText.innerText = "YOUR TURN";
            isThinking = false;
        }
    }
}

// Helper functions for AI simulation (non-visual)
function canPlay(col) {
    return grid[0][col] === EMPTY;
}
function makeMove(col, player) {
    for (let r = ROWS - 1; r >= 0; r--) {
        if (grid[r][col] === EMPTY) {
            grid[r][col] = player;
            return;
        }
    }
}
function undoMove(col) {
    for (let r = 0; r < ROWS; r++) {
        if (grid[r][col] !== EMPTY) {
            grid[r][col] = EMPTY;
            return;
        }
    }
}
function checkWinLogic(player) {
    // Clone of checkWin but without visual highlight calls
    // Horizontal
    for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS - 3; c++) {
            if (grid[r][c] === player && grid[r][c + 1] === player && grid[r][c + 2] === player && grid[r][c + 3] === player) return true;
        }
    }
    // Vertical
    for (let r = 0; r < ROWS - 3; r++) {
        for (let c = 0; c < COLS; c++) {
            if (grid[r][c] === player && grid[r + 1][c] === player && grid[r + 2][c] === player && grid[r + 3][c] === player) return true;
        }
    }
    // Diagonals
    for (let r = 0; r < ROWS - 3; r++) {
        for (let c = 0; c < COLS - 3; c++) {
            if (grid[r][c] === player && grid[r + 1][c + 1] === player && grid[r + 2][c + 2] === player && grid[r + 3][c + 3] === player) return true;
        }
    }
    for (let r = 3; r < ROWS; r++) {
        for (let c = 0; c < COLS - 3; c++) {
            if (grid[r][c] === player && grid[r - 1][c + 1] === player && grid[r - 2][c + 2] === player && grid[r - 3][c + 3] === player) return true;
        }
    }
    return false;
}

function gameOver(winner) {
    isGameOver = true;
    if (winner === PLAYER) {
        resultText.innerText = "YOU WIN!";
        resultText.style.color = "#00ff00";
        sfx.play('score');

        let winScore = 100;
        if (window.LeaderboardSystem && window.LeaderboardSystem.isTopScore('Connect4', winScore)) {
            setTimeout(() => {
                const playerName = prompt("¡Nuevo récord local! Ingresa tu nombre:") || "Anónimo";
                window.LeaderboardSystem.addScore({ game: 'Connect4', score: winScore, player: playerName, date: Date.now() });
            }, 500);
        }
    } else {
        resultText.innerText = "CPU WINS!";
        resultText.style.color = "#ffdd00";
        sfx.play('hit');
    }
    setTimeout(() => {
        modal.classList.add('active');
    }, 1500);
}

init();
