import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getFirestore, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";
import sfx from '/assets/js/sfx.js';

import { firebaseConfig } from '../firebase-config.js';
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// --- Game Constants ---
const CANVAS_SIZE = 400;
const GRID_SIZE = 20;
const TILE_COUNT = CANVAS_SIZE / GRID_SIZE;
const SPEED = 100;

// --- State ---
let canvas, ctx;
let snake = [];
let apple = { x: 5, y: 5 };
let velocity = { x: 0, y: 0 };
let score = 0;
let gameInterval;
let isRunning = false;
let inputQueue = []; // Prevent conflicting key presses in same frame

// --- Elements ---
const scoreEl = document.getElementById('score');
const finalScoreEl = document.getElementById('final-score');
const modal = document.getElementById('game-over-modal');
const startScreen = document.getElementById('start-screen');
const nameForm = document.getElementById('submit-score-form');
const restartBtn = document.getElementById('restart-btn');
const startBtn = document.getElementById('start-btn');

function init() {
    canvas = document.getElementById('game-canvas');
    ctx = canvas.getContext('2d');

    // Bind Controls
    document.addEventListener('keydown', handleKey);

    // Touch Controls
    document.getElementById('btn-up').addEventListener('touchstart', (e) => { e.preventDefault(); pushDirection(0, -1); });
    document.getElementById('btn-down').addEventListener('touchstart', (e) => { e.preventDefault(); pushDirection(0, 1); });
    document.getElementById('btn-left').addEventListener('touchstart', (e) => { e.preventDefault(); pushDirection(-1, 0); });
    document.getElementById('btn-right').addEventListener('touchstart', (e) => { e.preventDefault(); pushDirection(1, 0); });

    // Mouse Clicks (for desktop testing of buttons)
    document.getElementById('btn-up').addEventListener('mousedown', () => pushDirection(0, -1));
    document.getElementById('btn-down').addEventListener('mousedown', () => pushDirection(0, 1));
    document.getElementById('btn-left').addEventListener('mousedown', () => pushDirection(-1, 0));
    document.getElementById('btn-right').addEventListener('mousedown', () => pushDirection(1, 0));

    restartBtn.addEventListener('click', resetGame);
    nameForm.addEventListener('submit', submitScore);

    // Start Screen Logic
    startBtn.addEventListener('click', () => {
        startScreen.classList.remove('active');
        resetGame();
    });
}

function resetGame() {
    snake = [{ x: 10, y: 10 }, { x: 10, y: 11 }, { x: 10, y: 12 }];
    velocity = { x: 0, y: -1 }; // Start moving up
    inputQueue = [];
    score = 0;
    scoreEl.textContent = score;
    modal.classList.remove('active');
    isRunning = true;

    placeApple();

    if (gameInterval) clearInterval(gameInterval);
    gameInterval = setInterval(gameLoop, SPEED);
}

function gameLoop() {
    if (!isRunning) return;

    // Process Input
    if (inputQueue.length > 0) {
        const nextDir = inputQueue.shift();
        // Prevent 180 degree turns
        if (nextDir.x !== -velocity.x && nextDir.y !== -velocity.y) {
            velocity = nextDir;
        }
    }

    // Move Head
    const head = { x: snake[0].x + velocity.x, y: snake[0].y + velocity.y };

    // Wall Collision
    if (head.x < 0 || head.x >= TILE_COUNT || head.y < 0 || head.y >= TILE_COUNT) {
        gameOver();
        return;
    }

    // Self Collision
    for (let i = 0; i < snake.length; i++) {
        if (head.x === snake[i].x && head.y === snake[i].y) {
            gameOver();
            return;
        }
    }

    snake.unshift(head);

    // Apple Collision
    if (head.x === apple.x && head.y === apple.y) {
        score += 10;
        scoreEl.textContent = score;
        sfx.play('pop'); // Using existing sfx lib
        placeApple();
    } else {
        snake.pop(); // Remove tail
    }

    draw();
}

function draw() {
    // Clear
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    // Apple
    ctx.fillStyle = '#ff0055';
    ctx.shadowBlur = 15;
    ctx.shadowColor = '#ff0055';
    ctx.fillRect(apple.x * GRID_SIZE, apple.y * GRID_SIZE, GRID_SIZE - 2, GRID_SIZE - 2);
    ctx.shadowBlur = 0;

    // Snake
    ctx.fillStyle = '#00ff00';
    snake.forEach((part, index) => {
        // Head color slightly different
        if (index === 0) ctx.fillStyle = '#ccffcc';
        else ctx.fillStyle = '#00ff00';

        ctx.fillRect(part.x * GRID_SIZE, part.y * GRID_SIZE, GRID_SIZE - 2, GRID_SIZE - 2);
    });
}

function placeApple() {
    apple = {
        x: Math.floor(Math.random() * TILE_COUNT),
        y: Math.floor(Math.random() * TILE_COUNT)
    };
    // Don't spawn on snake
    for (let part of snake) {
        if (part.x === apple.x && part.y === apple.y) placeApple();
    }
}

function gameOver() {
    isRunning = false;
    clearInterval(gameInterval);
    sfx.play('hit');
    finalScoreEl.textContent = score;
    modal.classList.add('active');
}

function handleKey(e) {
    switch (e.key) {
        case 'ArrowUp': pushDirection(0, -1); break;
        case 'ArrowDown': pushDirection(0, 1); break;
        case 'ArrowLeft': pushDirection(-1, 0); break;
        case 'ArrowRight': pushDirection(1, 0); break;
    }
}

function pushDirection(x, y) {
    // Add to queue to process in next frame (prevents rapid key presses causing death)
    inputQueue.push({ x, y });
}

async function submitScore(e) {
    e.preventDefault();
    const name = document.getElementById('player-name').value;
    if (!name) return;

    // Leaderboard Global (Local Storage)
    if (window.LeaderboardSystem) {
        window.LeaderboardSystem.addScore({
            game: 'Snake',
            score: score,
            player: name,
            date: Date.now()
        });
    }

    try {
        await addDoc(collection(db, "snake_scores"), {
            name: name,
            score: score,
            timestamp: serverTimestamp()
        });
        alert('Score Saved!');
        modal.classList.remove('active');
        // Optionally redirect to leaderboard or restart
        resetGame();
    } catch (err) {
        console.error("Error adding score: ", err);
        alert('Error saving score.');
    }
}

// Start
init();
