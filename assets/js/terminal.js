/**
 * Global Terminal System - Quake Style
 * Access with Ctrl+Shift+X or ~
 */

class TerminalSystem {
    constructor() {
        this.isOpen = false;
        this.history = [];
        this.historyIndex = -1;
        this.commands = {};
        this.init();
    }

    init() {
        this.createDOM();
        this.registerCommands();
        this.setupListeners();
        console.log('%c 🐰 Easter Eggs System Loaded ', 'background: #222; color: #bada55');
    }

    createDOM() {
        // Create Terminal HTML
        const terminalHTML = `
            <div id="terminal-overlay">
                <div class="terminal-header">
                    <span>DAVITO_TERM_V1.0</span>
                    <span>SYSTEM_READY</span>
                </div>
                <div class="terminal-content" id="terminal-output">
                    <div class="terminal-line system">Welcome to Davito Terminal. Type 'help' for commands.</div>
                </div>
                <div class="terminal-input-area">
                    <span class="terminal-prompt">user@davito:~$</span>
                    <input type="text" id="terminal-input" autocomplete="off" spellcheck="false">
                </div>
            </div>
            <canvas id="matrix-canvas"></canvas>
        `;

        const div = document.createElement('div');
        div.innerHTML = terminalHTML;
        document.body.appendChild(div);

        this.overlay = document.getElementById('terminal-overlay');
        this.output = document.getElementById('terminal-output');
        this.input = document.getElementById('terminal-input');
        this.matrixCanvas = document.getElementById('matrix-canvas');
    }

    setupListeners() {
        // Toggle Key
        document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'x') || e.key === '~' || e.key === '`') {
                e.preventDefault();
                this.toggle();
            }

            // History navigation
            if (this.isOpen) {
                if (e.key === 'ArrowUp') {
                    e.preventDefault();
                    this.navigateHistory('up');
                } else if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    this.navigateHistory('down');
                }
            }
        });

        // Input handling
        this.input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                const cmd = this.input.value.trim();
                if (cmd) {
                    this.execute(cmd);
                    this.history.push(cmd);
                    this.historyIndex = this.history.length;
                    this.input.value = '';
                }
            }
        });
    }

    toggle() {
        this.isOpen = !this.isOpen;
        this.overlay.classList.toggle('open', this.isOpen);
        if (this.isOpen) {
            this.input.focus();
        }
    }

    print(text, type = '') {
        const line = document.createElement('div');
        line.className = `terminal-line ${type}`;
        line.textContent = text;
        this.output.appendChild(line);
        this.output.scrollTop = this.output.scrollHeight;
    }

    navigateHistory(direction) {
        if (this.history.length === 0) return;

        if (direction === 'up') {
            this.historyIndex = Math.max(0, this.historyIndex - 1);
        } else {
            this.historyIndex = Math.min(this.history.length, this.historyIndex + 1);
        }

        if (this.historyIndex < this.history.length) {
            this.input.value = this.history[this.historyIndex];
        } else {
            this.input.value = '';
        }
    }

    registerCommands() {
        this.commands = {
            'help': () => {
                this.print('Available commands:', 'system');
                this.print('  help     - Show this list');
                this.print('  clear    - Clear terminal');
                this.print('  matrix   - Toggle Matrix effect');
                this.print('  hack     - Simulate hacking');
                this.print('  stats    - Show system stats');
                this.print('  credits  - Show secret credits');
                this.print('  snake    - Play Snake');
                this.print('  home     - Go to homepage');
            },
            'clear': () => {
                this.output.innerHTML = '';
            },
            'sudo': () => {
                this.print('Permission denied: you are not root.', 'error');
                this.unlockAchievement('hackerWannabe');
            },
            'rm': (args) => {
                if (args[0] === '-rf' && args[1] === '/') {
                    this.print('I\'m sorry, Dave. I\'m afraid I can\'t do that.', 'error');
                    this.unlockAchievement('destructor');
                } else {
                    this.print('Usage: rm -rf / (Don\'t actually do it)', 'system');
                }
            },
            'whoami': () => {
                this.print('You are The Chosen One.', 'success');
                this.unlockAchievement('existential');
            },
            'cat': () => {
                this.print('Summoning a cat...', 'system');
                const img = document.createElement('img');
                img.src = `https://cataas.com/cat?t=${Date.now()}`;
                img.style.maxWidth = '300px';
                img.style.maxHeight = '300px';
                img.style.borderRadius = '5px';
                img.style.marginTop = '10px';
                img.onload = () => {
                    this.output.appendChild(img);
                    this.output.scrollTop = this.output.scrollHeight;
                    this.print('Meow.', 'success');
                };
                img.onerror = () => {
                    this.print('Error summoning cat. It must be sleeping.', 'error');
                };
                this.unlockAchievement('catLover');
            },
            'ls': () => {
                this.print('top_secret.txt', 'system');
                this.print('world_domination_plan.pdf', 'system');
                this.print('cat_videos_collection', 'system');
                this.unlockAchievement('snoop');
            },
            'party': () => {
                this.print('🎉 PARTY TIME! 🎉', 'success');
                this.triggerConfetti();
                this.unlockAchievement('partyTime');
            },
            'gravity': () => {
                this.print('Gravity enabled. Watch out!', 'error');
                this.enableGravity();
                this.unlockAchievement('newton');
            },
            'date': () => {
                this.print('Time is an illusion. Lunchtime doubly so.', 'system');
                this.unlockAchievement('philosopher');
            },
            '42': () => {
                this.print('The Answer to the Ultimate Question of Life, the Universe, and Everything.', 'success');
                this.unlockAchievement('hitchhiker');
            },
            'achievements': () => {
                import('./achievements.js').then(module => {
                    module.showTrophyRoom();
                });
                this.print('Opening Trophy Room...', 'system');
            }
        };
    }

    execute(cmdString) {
        this.print(`$ ${cmdString}`);
        const args = cmdString.split(' ');
        const cmd = args[0].toLowerCase();

        if (this.commands[cmd]) {
            this.commands[cmd](args.slice(1));
        } else {
            this.print(`Command not found: ${cmd}`, 'error');
        }
    }

    // --- Effects ---

    toggleMatrix() {
        const canvas = this.matrixCanvas;
        if (canvas.classList.contains('active')) {
            canvas.classList.remove('active');
            this.print('Matrix effect disabled.');
            return;
        }

        canvas.classList.add('active');
        this.print('Matrix effect enabled. Follow the white rabbit.', 'success');
        this.runMatrix(canvas);
        this.toggle(); // Close terminal to see effect
    }

    runMatrix(canvas) {
        const ctx = canvas.getContext('2d');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        const katakana = 'アァカサタナハマヤャラワガザダバパイィキシチニヒミリヰギジヂビピウゥクスツヌフムユュルグズブヅプエェケセテネヘメレヱゲゼデベペオォコソトノホモヨョロヲゴゾドボポヴッン';
        const latin = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        const nums = '0123456789';
        const alphabet = katakana + latin + nums;

        const fontSize = 16;
        const columns = canvas.width / fontSize;
        const drops = [];

        for (let x = 0; x < columns; x++) {
            drops[x] = 1;
        }

        const draw = () => {
            if (!canvas.classList.contains('active')) return;

            ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            ctx.fillStyle = '#0F0';
            ctx.font = fontSize + 'px monospace';

            for (let i = 0; i < drops.length; i++) {
                const text = alphabet.charAt(Math.floor(Math.random() * alphabet.length));
                ctx.fillText(text, i * fontSize, drops[i] * fontSize);

                if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
                    drops[i] = 0;
                }
                drops[i]++;
            }
            requestAnimationFrame(draw);
        };
        draw();
    }

    simulateHack() {
        const steps = [
            'Connecting to server...',
            'Bypassing firewall...',
            'Accessing mainframe...',
            'Downloading secret data...',
            'Decrypting files...',
            'ACCESS GRANTED'
        ];

        let i = 0;
        const interval = setInterval(() => {
            if (i < steps.length) {
                this.print(steps[i], i === steps.length - 1 ? 'success' : 'system');
                i++;
            } else {
                clearInterval(interval);
                this.print('Just kidding. Don\'t hack people.', 'error');
            }
        }, 800);
    }

    unlockAchievement(id) {
        import('./achievements.js').then(module => {
            module.unlockAchievement(id);
        });
    }

    triggerConfetti() {
        // Simple confetti effect using canvas or DOM
        const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff'];
        for (let i = 0; i < 100; i++) {
            const conf = document.createElement('div');
            conf.style.position = 'fixed';
            conf.style.left = Math.random() * 100 + 'vw';
            conf.style.top = '-10px';
            conf.style.width = '10px';
            conf.style.height = '10px';
            conf.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            conf.style.zIndex = '10000';
            conf.style.transition = 'top 3s linear, transform 3s linear';
            document.body.appendChild(conf);

            setTimeout(() => {
                conf.style.top = '110vh';
                conf.style.transform = `rotate(${Math.random() * 360}deg)`;
            }, 100);

            setTimeout(() => conf.remove(), 3000);
        }
    }

    enableGravity() {
        const elements = document.querySelectorAll('div, p, h1, h2, h3, button, img');
        elements.forEach(el => {
            el.style.transition = 'transform 2s ease-in';
            el.style.transform = `translateY(${window.innerHeight}px) rotate(${Math.random() * 90 - 45}deg)`;
        });

        setTimeout(() => {
            elements.forEach(el => {
                el.style.transform = 'none';
            });
            this.print('Gravity restored.', 'system');
        }, 3000);
    }
}

// Initialize
window.addEventListener('DOMContentLoaded', () => {
    window.Terminal = new TerminalSystem();
});
