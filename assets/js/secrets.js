/**
 * Secrets & Interactions System
 * Handles cheat codes, mouse interactions, and other hidden gems.
 */

import { unlockAchievement, unlockAchievementCounter } from './achievements.js';

class SecretsSystem {
    constructor() {
        this.inputBuffer = '';
        this.bufferTimeout = null;
        this.init();
    }

    init() {
        this.setupKeyboard();
        this.setupMouse();
        this.setupKonami();
        console.log('🕵️ Secrets System Active');
    }

    setupKeyboard() {
        document.addEventListener('keydown', (e) => {
            // Buffer for typing codes
            this.inputBuffer += e.key.toLowerCase();

            if (this.bufferTimeout) clearTimeout(this.bufferTimeout);
            this.bufferTimeout = setTimeout(() => {
                this.inputBuffer = '';
            }, 2000); // Clear buffer after 2s of inactivity

            this.checkCodes();
        });
    }

    checkCodes() {
        // IDDQD (Doom)
        if (this.inputBuffer.includes('iddqd')) {
            unlockAchievement('doomSlayer');
            this.inputBuffer = '';
            alert('GOD MODE ACTIVATED (Not really, but nice try)');
        }

        // HESOYAM (GTA)
        if (this.inputBuffer.includes('hesoyam')) {
            unlockAchievement('sanAndreas');
            this.inputBuffer = '';
            this.rainMoney();
        }

        // SECRET (Typist)
        if (this.inputBuffer.includes('secret')) {
            unlockAchievement('typist');
            this.inputBuffer = '';
        }
    }

    setupMouse() {
        // Profile Spin (Dizzy)
        const profilePic = document.querySelector('.profile-img') || document.querySelector('.logo img') || document.querySelector('img');
        if (profilePic) {
            let clicks = 0;
            profilePic.addEventListener('click', () => {
                clicks++;
                if (clicks === 10) {
                    unlockAchievement('dizzy');
                    profilePic.style.transition = 'transform 1s';
                    profilePic.style.transform = 'rotate(720deg)';
                    setTimeout(() => {
                        profilePic.style.transform = 'none';
                        clicks = 0;
                    }, 1000);
                }
            });
        }

        // Copycat
        document.addEventListener('copy', () => {
            unlockAchievement('copycat');
        });

        // Inspector Gadget (DevTools detection attempt via resize)
        window.addEventListener('resize', () => {
            if (window.outerWidth - window.innerWidth > 160 || window.outerHeight - window.innerHeight > 160) {
                unlockAchievement('inspector');
            }
        });

        // Yo-Yo Scroll
        let lastScrollTop = 0;
        let directionChanges = 0;
        let lastDirection = null;

        window.addEventListener('scroll', () => {
            const st = window.pageYOffset || document.documentElement.scrollTop;
            const direction = st > lastScrollTop ? 'down' : 'up';

            if (direction !== lastDirection) {
                directionChanges++;
                if (directionChanges > 5) { // Quick changes
                    unlockAchievement('yoyo');
                    directionChanges = 0;
                }
                setTimeout(() => directionChanges = 0, 2000); // Reset if too slow
            }
            lastDirection = direction;
            lastScrollTop = st <= 0 ? 0 : st;
        });

        // Rebel (Right Click)
        document.addEventListener('contextmenu', () => {
            unlockAchievement('rebel');
        });

        // Copyright Police
        const footer = document.querySelector('footer');
        if (footer) {
            footer.addEventListener('dblclick', () => {
                unlockAchievement('copyrightPolice');
            });
        }
    }

    setupKonami() {
        // Hook into existing Konami if possible, or just listen
        // Assuming konami.js handles the sequence, we just want to ensure the achievement triggers
        // But we can also add a listener here just in case
    }

    rainMoney() {
        const money = ['💸', '💵', '💰', '💎'];
        for (let i = 0; i < 50; i++) {
            const el = document.createElement('div');
            el.textContent = money[Math.floor(Math.random() * money.length)];
            el.style.position = 'fixed';
            el.style.left = Math.random() * 100 + 'vw';
            el.style.top = '-20px';
            el.style.fontSize = '24px';
            el.style.zIndex = '10000';
            el.style.transition = 'top 2s linear';
            document.body.appendChild(el);

            setTimeout(() => {
                el.style.top = '110vh';
            }, 100);

            setTimeout(() => el.remove(), 2000);
        }
    }
}

// Initialize
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => new SecretsSystem());
} else {
    new SecretsSystem();
}
