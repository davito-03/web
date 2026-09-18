import sfx from '/assets/js/sfx.js';

const COLS = 10;
const ROWS = 20;
const BLOCK_SIZE = 24;

// Shapes
const SHAPES = [
    [],
    [[1, 1, 1, 1]],             // I
    [[1, 1, 1], [0, 0, 1]],     // J
    [[1, 1, 1], [1, 0, 0]],     // L
    [[1, 1], [1, 1]],           // O
    [[0, 1, 1], [1, 1, 0]],     // S
    [[0, 1, 0], [1, 1, 1]],     // T
    [[1, 1, 0], [0, 1, 1]]      // Z
];

const COLORS = [
    'none',
    '#00f0f0', // I (Cyan)
    '#0000f0', // J (Blue)
    '#f0a000', // L (Orange)
    '#f0f000', // O (Yellow)
    '#00f000', // S (Green)
    '#a000f0', // T (Purple)
    '#f00000'  // Z (Red)
];

let canvas, ctx, nextCanvas, nextCtx;
let grid = [];
let bag = [];
let currentPiece = null;
let nextPieceIdx = 0;
let score = 0;
let linesCleared = 0;
let level = 1;
let dropCounter = 0;
let dropInterval = 1000;
let lastTime = 0;
let isRunning = false;

// Elements
const scoreEl = document.getElementById('score');
const levelEl = document.getElementById('level');
const startScreen = document.getElementById('start-screen');
const gameOverModal = document.getElementById('game-over-modal');
const finalScoreEl = document.getElementById('final-score');
const startBtn = document.getElementById('start-btn');
const restartBtn = document.getElementById('restart-btn');

function init() {
    canvas = document.getElementById('game-canvas');
    ctx = canvas.getContext('2d');
    nextCanvas = document.getElementById('next-piece-canvas');
    nextCtx = nextCanvas.getContext('2d');

    startBtn.addEventListener('click', startGame);
    restartBtn.addEventListener('click', resetGame);

    // Keyboard
    document.addEventListener('keydown', handleKey);

    // Virtual Buttons
    bindButton('btn-left', () => move(-1));
    bindButton('btn-right', () => move(1));
    bindButton('btn-down', () => drop());
    bindButton('btn-rotate', () => rotate());
    bindButton('btn-drop', () => hardDrop());
}

function bindButton(id, action) {
    const btn = document.getElementById(id);
    if (btn) {
        btn.addEventListener('touchstart', (e) => { e.preventDefault(); action(); });
        btn.addEventListener('mousedown', (e) => { e.preventDefault(); action(); });
    }
}

function startGame() {
    startScreen.classList.remove('active');
    resetGame();
}

function resetGame() {
    gameOverModal.classList.remove('active');
    grid = Array.from({ length: ROWS }, () => Array(COLS).fill(0));
    score = 0;
    linesCleared = 0;
    level = 1;
    dropInterval = 1000;
    isRunning = true;

    bag = [];
    nextPieceIdx = getRandomShapeIndex(); // Fix: Prime the queue first
    currentPiece = spawnPiece();
    // spawnPiece will use the primed nextPieceIdx and generate a new one for next spawn

    updateUI();
    drawNextPiece();

    lastTime = 0;
    requestAnimationFrame(update);
}

function update(time = 0) {
    if (!isRunning) return;

    const deltaTime = time - lastTime;
    lastTime = time;

    dropCounter += deltaTime;
    if (dropCounter > dropInterval) {
        drop();
    }

    draw();
    requestAnimationFrame(update);
}

function draw() {
    // Clear
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Grid
    for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
            if (grid[r][c] !== 0) {
                drawBlock(ctx, c, r, grid[r][c]);
            }
        }
    }

    // Piece
    if (currentPiece) {
        currentPiece.shape.forEach((row, y) => {
            row.forEach((val, x) => {
                if (val !== 0) {
                    drawBlock(ctx, currentPiece.x + x, currentPiece.y + y, currentPiece.type);
                }
            });
        });
    }
}

function drawBlock(context, x, y, typeId) {
    context.fillStyle = COLORS[typeId];
    context.fillRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);

    // simple bevel
    context.fillStyle = 'rgba(255,255,255,0.2)';
    context.fillRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, 2);
    context.fillRect(x * BLOCK_SIZE, y * BLOCK_SIZE, 2, BLOCK_SIZE);

    context.fillStyle = 'rgba(0,0,0,0.2)';
    context.fillRect(x * BLOCK_SIZE + BLOCK_SIZE - 2, y * BLOCK_SIZE, 2, BLOCK_SIZE);
    context.fillRect(x * BLOCK_SIZE, y * BLOCK_SIZE + BLOCK_SIZE - 2, BLOCK_SIZE, 2);
}

function drop() {
    currentPiece.y++;
    if (collide(grid, currentPiece)) {
        currentPiece.y--;
        merge(grid, currentPiece);
        sweep();
        currentPiece = spawnPiece();
        if (collide(grid, currentPiece)) {
            gameOver();
        }
        dropCounter = 0;
    } else {
        dropCounter = 0;
    }
}

function hardDrop() {
    while (!collide(grid, currentPiece)) {
        currentPiece.y++;
    }
    currentPiece.y--;
    merge(grid, currentPiece);
    sweep();
    currentPiece = spawnPiece();
    if (collide(grid, currentPiece)) {
        gameOver();
    }
    dropCounter = 0;
    sfx.play('hit');
}

function move(dir) {
    currentPiece.x += dir;
    if (collide(grid, currentPiece)) {
        currentPiece.x -= dir;
    }
}

function rotate() {
    const piece = currentPiece;
    const prevShape = piece.shape;

    // Transpose + Reverse = Rotate
    const shape = piece.shape;
    const newShape = shape[0].map((val, index) => shape.map(row => row[index]).reverse());

    piece.shape = newShape;
    if (collide(grid, piece)) {
        // Wall kick attempt (simple)
        if (piece.x < COLS / 2) piece.x++; // Try right
        if (collide(grid, piece)) {
            piece.x--;
            piece.x--; // Try left
            if (collide(grid, piece)) {
                piece.x++;
                piece.shape = prevShape; // Revert
            }
        }
    }
}

function collide(scene, piece) {
    const m = piece.shape;
    const o = piece;
    for (let r = 0; r < m.length; ++r) {
        for (let c = 0; c < m[r].length; ++c) {
            if (m[r][c] !== 0 &&
                (scene[r + o.y] && scene[r + o.y][c + o.x]) !== 0) {
                return true;
            }
        }
    }
    return false;
}

function merge(scene, piece) {
    piece.shape.forEach((row, y) => {
        row.forEach((val, x) => {
            if (val !== 0) {
                scene[y + piece.y][x + piece.x] = piece.type;
            }
        });
    });
    sfx.play('pop');
}

function sweep() {
    let rowCount = 0;
    outer: for (let r = ROWS - 1; r > 0; --r) {
        for (let c = 0; c < COLS; ++c) {
            if (grid[r][c] === 0) {
                continue outer;
            }
        }

        const row = grid.splice(r, 1)[0].fill(0);
        grid.unshift(row);
        ++r;
        rowCount++;
    }

    if (rowCount > 0) {
        score += rowCount * 100 * level;
        linesCleared += rowCount;
        level = Math.floor(linesCleared / 10) + 1;
        dropInterval = Math.max(100, 1000 - (level - 1) * 100);

        updateUI();
        sfx.play('score');
    }
}

function spawnPiece() {
    // Determine type from nextPieceIdx, then generate new next
    const type = nextPieceIdx;

    // Generate new next
    nextPieceIdx = getRandomShapeIndex();
    drawNextPiece();

    return {
        x: (COLS / 2 | 0) - 2,
        y: 0,
        type: type,
        shape: SHAPES[type]
    };
}

function getRandomShapeIndex() {
    if (bag.length === 0) {
        bag = [1, 2, 3, 4, 5, 6, 7];
        for (let i = bag.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [bag[i], bag[j]] = [bag[j], bag[i]];
        }
    }
    return bag.pop();
}

function drawNextPiece() {
    nextCtx.fillStyle = '#000';
    nextCtx.fillRect(0, 0, nextCanvas.width, nextCanvas.height);

    const type = nextPieceIdx;
    const shape = SHAPES[type];
    const color = COLORS[type];

    nextCtx.fillStyle = color;
    shape.forEach((row, y) => {
        row.forEach((val, x) => {
            if (val !== 0) {
                const s = 12; // smaller block
                nextCtx.fillRect(x * s + 10, y * s + 10, s, s);
                nextCtx.strokeStyle = '#fff';
                nextCtx.strokeRect(x * s + 10, y * s + 10, s, s);
            }
        });
    });
}

function updateUI() {
    scoreEl.textContent = score;
    levelEl.textContent = level;
}

function gameOver() {
    isRunning = false;
    finalScoreEl.textContent = score;
    gameOverModal.classList.add('active');
    sfx.play('hit');
}

function handleKey(e) {
    if (!isRunning) return;

    // Prevent scrolling
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) e.preventDefault();

    switch (e.key) {
        case 'ArrowLeft': move(-1); break;
        case 'ArrowRight': move(1); break;
        case 'ArrowDown': drop(); break;
        case 'ArrowUp': rotate(); break; // Standard rotate
        case ' ': hardDrop(); break;
    }
}

init();
