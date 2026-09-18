import sfx from '/assets/js/sfx.js';

let sequence = [];
let playerSequence = [];
let level = 1;
let isPlayerTurn = false;
let isPlaying = false;

const buttons = document.querySelectorAll('.simon-btn');
const levelEl = document.getElementById('level');
const statusEl = document.getElementById('status');
const messageEl = document.getElementById('message');
const startScreen = document.getElementById('start-screen');
const gameOverModal = document.getElementById('game-over-modal');
const finalLevelEl = document.getElementById('final-level');
const finalSeqEl = document.getElementById('final-seq');

// Audio frequencies for each color
const TONES = [261.63, 329.63, 392.00, 493.88]; // C, E, G, B

function init() {
    document.getElementById('start-btn').addEventListener('click', startGame);
    document.getElementById('restart-btn').addEventListener('click', startGame);

    buttons.forEach((btn, i) => {
        btn.addEventListener('click', () => handleButtonClick(i));
    });
}

function startGame() {
    startScreen.classList.remove('active');
    gameOverModal.classList.remove('active');

    sequence = [];
    playerSequence = [];
    level = 1;
    isPlaying = true;

    levelEl.textContent = level;
    statusEl.textContent = 'WATCH';

    buttons.forEach(btn => btn.classList.add('disabled'));

    setTimeout(() => nextRound(), 1000);
}

function nextRound() {
    playerSequence = [];
    isPlayerTurn = false;

    // Add random color to sequence
    sequence.push(Math.floor(Math.random() * 4));

    statusEl.textContent = 'WATCH';
    buttons.forEach(btn => btn.classList.add('disabled'));

    playSequence();
}

function playSequence() {
    let i = 0;
    const interval = setInterval(() => {
        if (i < sequence.length) {
            flashButton(sequence[i]);
            i++;
        } else {
            clearInterval(interval);
            enablePlayerInput();
        }
    }, 600);
}

function flashButton(index) {
    const btn = buttons[index];
    btn.classList.add('flash');
    playTone(TONES[index]);

    setTimeout(() => {
        btn.classList.remove('flash');
    }, 300);
}

function playTone(frequency) {
    // Simple beep using sfx or just visual for now
    sfx.play('click');
}

function enablePlayerInput() {
    isPlayerTurn = true;
    statusEl.textContent = 'YOUR TURN';
    buttons.forEach(btn => btn.classList.remove('disabled'));
}

function handleButtonClick(index) {
    if (!isPlayerTurn || !isPlaying) return;

    flashButton(index);
    playerSequence.push(index);

    // Check if correct
    const currentIndex = playerSequence.length - 1;

    if (playerSequence[currentIndex] !== sequence[currentIndex]) {
        gameOver();
        return;
    }

    // Check if sequence complete
    if (playerSequence.length === sequence.length) {
        isPlayerTurn = false;
        buttons.forEach(btn => btn.classList.add('disabled'));

        level++;
        levelEl.textContent = level;

        showMessage('CORRECT!');

        setTimeout(() => nextRound(), 1500);
    }
}

function showMessage(text) {
    messageEl.textContent = text;
    messageEl.classList.add('show');
    setTimeout(() => {
        messageEl.classList.remove('show');
    }, 1000);
}

function gameOver() {
    isPlaying = false;
    isPlayerTurn = false;
    buttons.forEach(btn => btn.classList.add('disabled'));
    statusEl.textContent = 'WRONG!';

    // Flash all buttons red
    buttons.forEach(btn => {
        btn.style.filter = 'brightness(0.5) hue-rotate(180deg)';
    });

    sfx.play('hit');

    let score = sequence.length - 1;
    if (window.LeaderboardSystem && window.LeaderboardSystem.isTopScore('Simon', score) && score > 0) {
        setTimeout(() => {
            const playerName = prompt("¡Nuevo récord local! Ingresa tu nombre:") || "Anónimo";
            window.LeaderboardSystem.addScore({ game: 'Simon', score: score, player: playerName, date: Date.now() });
        }, 1500);
    }

    setTimeout(() => {
        buttons.forEach(btn => {
            btn.style.filter = '';
        });

        finalLevelEl.textContent = level;
        finalSeqEl.textContent = sequence.length;
        gameOverModal.classList.add('active');
    }, 1000);
}

init();
