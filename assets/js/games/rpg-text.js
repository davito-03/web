import { GAME_CONFIG, ITEMS, ENEMIES, LOCATIONS, SPELLS, CLASSES, QUESTS } from './rpg-constants.js';
import sfx from '/assets/js/sfx.js';

class RPGGame {
    constructor() {
        this.resetState();

        this.elements = {
            story: document.getElementById('story-display'),
            input: document.getElementById('cmd-input'),
            sendBtn: document.getElementById('send-btn'),

            // Sidebar
            hpText: document.getElementById('hp-text'),
            hpBar: document.getElementById('hp-bar'),
            enText: document.getElementById('en-text'),
            enBar: document.getElementById('en-bar'),
            xpBar: document.getElementById('xp-bar'),
            lvlText: document.getElementById('lvl-text'),
            goldText: document.getElementById('gold-text'),
            locText: document.getElementById('loc-text'),

            // Interactive Areas
            suggestions: document.getElementById('suggestions'),
            invModal: document.getElementById('inv-modal'),
            invGrid: document.getElementById('inv-grid'),
            itemDesc: document.getElementById('item-desc'),
            useBtn: document.getElementById('use-btn'),

            // Start Screen
            startScreen: document.getElementById('start-screen'),
            startGameBtn: document.getElementById('start-game-btn')
        };

        this.selectedItemIndex = -1;
        this.init();
    }

    resetState() {
        this.player = {
            name: 'Hero',
            class: 'warrior',
            level: 1,
            health: 100,
            maxHealth: 100,
            energy: 100,
            maxEnergy: 100,
            strength: 10,
            intellect: 5,
            experience: 0,
            gold: 50,
            currentLocation: 'start',
            inventory: ['potion_min_hp', 'wd_sword'],
            equipment: { weapon: null, armor: null },
            activeQuests: {},
            completedQuests: []
        };

        this.gameState = {
            inCombat: false,
            currentEnemy: null,
            charCreation: true,
            awaitingName: false
        };
    }

    init() {
        this.elements.startGameBtn.addEventListener('click', () => {
            this.elements.startScreen.classList.remove('active');
            if (localStorage.getItem(GAME_CONFIG.SAVE_KEY)) {
                this.loadGame();
            } else {
                this.startCharacterCreation();
            }
        });

        this.elements.sendBtn.addEventListener('click', () => this.handleCommand());
        this.elements.input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') this.handleCommand();
        });

        document.querySelectorAll('.pad-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const cmd = btn.dataset.cmd;
                if (cmd) this.processCommand(cmd);
            });
        });

        // Inventory UI
        const toggleInv = () => this.toggleInventory();
        document.getElementById('toggle-inv-btn').addEventListener('click', toggleInv);
        document.getElementById('mob-inv-btn')?.addEventListener('click', toggleInv);
        document.getElementById('close-inv').addEventListener('click', toggleInv);
        this.elements.useBtn.addEventListener('click', () => this.useSelectedItem());
    }

    log(text, icon = null, color = '#ddd') {
        const div = document.createElement('div');
        div.className = 'story-entry';
        div.style.color = color;
        const iconHtml = icon ? `<span class="narrator-icon">${icon}</span>` : '';
        div.innerHTML = `${iconHtml}<span class="story-text">${text}</span>`;
        this.elements.story.appendChild(div);
        this.elements.story.scrollTop = this.elements.story.scrollHeight;
    }

    handleCommand() {
        const cmd = this.elements.input.value.trim();
        if (!cmd) return;
        this.elements.input.value = '';

        // Handle Character Creation Input
        if (this.gameState.charCreation) {
            this.handleCharCreationInput(cmd);
            return;
        }

        this.log(cmd, ">", "#33ff33");
        this.processCommand(cmd.toLowerCase());
    }

    startCharacterCreation() {
        this.log("⚠️ SYSTEM INITIALIZED ⚠️", "🤖", "#33ff33");
        this.log("Choose your CLASS:", "👤", "#fff");
        this.log("1. WARRIOR (⚔️) - High HP, Strong Attacks", " ", "#faa");
        this.log("2. MAGE (🔮) - High Energy, Powerful Spells", " ", "#aaf");
        this.log("3. ROGUE (🗡️) - Balanced, Critical Hits", " ", "#afa");
        this.log("Type 1, 2, or 3 to select.", "⌨️");
        this.gameState.charCreation = true;
        this.gameState.awaitingName = false;
        this.updateSuggestions(['1', '2', '3']);
    }

    handleCharCreationInput(cmd) {
        if (!this.gameState.awaitingName) {
            // Selecting Class
            let cls = null;
            if (cmd === '1' || cmd === 'warrior') cls = 'warrior';
            if (cmd === '2' || cmd === 'mage') cls = 'mage';
            if (cmd === '3' || cmd === 'rogue') cls = 'rogue';

            if (cls) {
                const cData = CLASSES[cls];
                this.player.class = cls;
                this.player.maxHealth = cData.hp;
                this.player.health = cData.hp;
                this.player.maxEnergy = cData.energy;
                this.player.energy = cData.energy;
                this.player.strength = cData.str;
                this.player.intellect = cData.int;
                this.player.activeQuests = {};

                this.log(`Selected: ${cData.name.toUpperCase()}`, cData.icon, "#0f0");
                this.log("Enter your NAME:", "🏷️");
                this.gameState.awaitingName = true;
                this.updateSuggestions([]);
            } else {
                this.log("Invalid selection. Type 1, 2, or 3.", "❌");
            }
        } else {
            // Setting Name
            this.player.name = cmd.substring(0, 15);
            this.gameState.charCreation = false;
            this.gameState.awaitingName = false;
            this.log(`Welcome, ${this.player.name}! Your adventure begins now.`, "🚀", "#fff");
            this.log("--------------------------------", "");
            this.look();
            this.updateUI();
            this.saveGame();
        }
    }

    processCommand(cmd) {
        if (this.gameState.inCombat) {
            this.combatRound(cmd);
            return;
        }

        const parts = cmd.split(' ');
        const verb = parts[0];
        const noun = parts.slice(1).join(' ');

        switch (verb) {
            case 'n': case 'north': case 'norte': this.move('norte'); break;
            case 's': case 'south': case 'sur': this.move('sur'); break;
            case 'e': case 'east': case 'este': this.move('este'); break;
            case 'w': case 'west': case 'oeste': this.move('oeste'); break;
            case 'u': case 'up': case 'arriba': this.move('arriba'); break;
            case 'd': case 'down': case 'abajo': this.move('abajo'); break;
            case 'move': case 'ir': this.move(noun); break;

            case 'look': case 'mirar': case 'examinar': this.look(); break;
            case 'inv': case 'inventory': case 'i': this.toggleInventory(); break;
            case 'help': case 'ayuda': this.help(); break;
            case 'stats': this.showStats(); break;

            case 'talk': case 'hablar': this.talk(noun); break;
            case 'buy': case 'comprar': this.buy(noun); break;

            case 'equip': this.equip(noun); break;
            case 'unequip': this.unequip(noun); break;
            case 'heal': if (this.player.class === 'mage') this.castSpell('heal'); else this.log("You don't know magic.", "❌"); break;

            case 'reset':
                if (noun === 'game') {
                    localStorage.removeItem(GAME_CONFIG.SAVE_KEY);
                    location.reload();
                }
                break;

            default: this.log("Unknown command.", "❓");
        }
    }

    // --- Actions ---

    move(dir) {
        const loc = LOCATIONS[this.player.currentLocation];
        const map = {
            north: 'norte', south: 'sur', east: 'este', west: 'oeste', up: 'arriba', down: 'abajo',
            n: 'norte', s: 'sur', e: 'este', w: 'oeste', u: 'arriba', d: 'abajo'
        };
        dir = map[dir] || dir;

        if (loc.exits[dir]) {
            this.player.currentLocation = loc.exits[dir];
            this.log(`Heading ${dir}...`, "🚶");
            sfx.play('click'); // Footstep sound placeholder
            setTimeout(() => {
                this.look();
                this.checkEncounter();
                this.updateUI();
                this.saveGame();
            }, 400);
        } else {
            this.log("You can't go that way.", "🚫", "#f55");
        }
    }

    look() {
        const loc = LOCATIONS[this.player.currentLocation];
        this.updateSuggestions();
        this.log(`LOCATION: ${loc.name}`, loc.icon, "#fa0");
        this.log(loc.description, "👁️");

        if (loc.npcs.length > 0) {
            const names = loc.npcs.join(', ').replace('_', ' '); // simple format
            this.log(`NPCs: ${names}`, "👤", "#aaf");
        }

        const exits = Object.keys(loc.exits).map(k => k.toUpperCase()).join(', ');
        this.log(`EXITS: ${exits}`, "🚪");
    }

    talk(target) {
        // Find NPC
        const loc = LOCATIONS[this.player.currentLocation];
        // Very basic NPC logic for now
        if (loc.npcs.some(n => target.includes(n) || n.includes(target))) {
            if (target.includes('healer')) {
                this.log("Healer: 'I can cure you for 20 gold.' (Type 'buy heal')", "💊");
            } else if (target.includes('barkeep')) {
                this.log("Barkeep: 'Got a rat problem downstairs. 50 gold if you fix it.'", "🍺");
                this.acceptQuest('rats_problem');
            } else if (target.includes('merchant')) {
                this.log("Merchant: 'I sell potions and swords. Type 'buy potion_hp' or 'buy rn_sword'.", "💰");
            } else {
                this.log("They grunt in acknowledgement.", "💬");
            }
        } else {
            this.log("Nobody here by that name.", "🤷");
        }
    }

    buy(item) {
        // Simplified shop logic
        if (item === 'heal' && LOCATIONS[this.player.currentLocation].npcs.includes('healer')) {
            if (this.player.gold >= 20) {
                this.player.gold -= 20;
                this.player.health = this.player.maxHealth;
                this.log("You are fully healed!", "✨", "#0f0");
                this.updateUI();
            } else {
                this.log("Not enough gold.", "💸");
            }
            return;
        }

        if (ITEMS[item] && this.player.gold >= ITEMS[item].value) {
            this.player.gold -= ITEMS[item].value;
            this.player.inventory.push(item);
            this.log(`Bought ${ITEMS[item].name}!`, "🛒", "#0f0");
            this.updateUI();
        } else if (ITEMS[item]) {
            this.log(`Costs ${ITEMS[item].value} gold. You have ${this.player.gold}.`, "💸");
        } else {
            this.log("Item not found.", "❌");
        }
    }

    acceptQuest(id) {
        if (!this.player.activeQuests[id] && !this.player.completedQuests.includes(id)) {
            this.player.activeQuests[id] = { progress: 0 };
            this.log(`Quest Accepted: ${QUESTS[id].name}`, "📜", "#ff0");
        }
    }

    // --- Combat ---

    checkEncounter() {
        const loc = LOCATIONS[this.player.currentLocation];
        if (loc.enemies && loc.enemies.length > 0 && Math.random() < 0.35) {
            const enemyId = loc.enemies[Math.floor(Math.random() * loc.enemies.length)];
            this.startCombat(enemyId);
        }
    }

    startCombat(enemyId = null) {
        if (!enemyId) return; // Command usage not implemented yet

        this.gameState.inCombat = true;
        const template = ENEMIES[enemyId];
        this.gameState.currentEnemy = {
            id: enemyId,
            ...template,
            maxHealth: template.health
        };

        sfx.play('hit'); // Alert sound
        this.log("--------------------------------", "");
        this.log(`⚠️ COMBAT: ${template.name} (${template.health} HP) ⚠️`, template.icon, "#f55");
        this.updateSuggestions();
    }

    combatRound(cmd) {
        const enemy = this.gameState.currentEnemy;

        // Player Action
        let playerDmg = 0;
        let pMsg = "";

        if (cmd === 'run') {
            if (Math.random() > 0.4) {
                this.log("You fled safely!", "💨", "#0f0");
                this.gameState.inCombat = false;
                this.updateSuggestions();
                return;
            } else {
                this.log("Failed to escape!", "🔒", "#f55");
            }
        } else if (cmd === 'attack') {
            // Calculate Damage based on Weapon + Stats
            let base = this.player.strength;
            if (this.player.equipment.weapon) base += ITEMS[this.player.equipment.weapon].damage;

            // Crit?
            let mult = 1;
            if (Math.random() < 0.1) { mult = 2; pMsg += " CRITICAL!"; }

            playerDmg = Math.floor(base * (0.8 + Math.random() * 0.4) * mult);
            enemy.health -= playerDmg;
            this.log(`You hit for ${playerDmg} damage! ${pMsg}`, "⚔️", "#ff0");
            sfx.play('hit');

        } else if (SPELLS[cmd] && this.player.class === 'mage') {
            // Magic logic (simplified)
            const spell = SPELLS[cmd];
            if (this.player.energy >= spell.cost) {
                this.player.energy -= spell.cost;
                if (spell.type === 'dmg') {
                    const dmg = Math.floor(spell.damage + this.player.intellect * 1.5);
                    enemy.health -= dmg;
                    this.log(`Cast ${spell.name} for ${dmg} damage!`, spell.icon, "#0ff");
                } else if (spell.type === 'heal') {
                    const heal = spell.heal + this.player.intellect;
                    this.player.health = Math.min(this.player.maxHealth, this.player.health + heal);
                    this.log(`Healed for ${heal} HP.`, spell.icon, "#0f0");
                }
            } else {
                this.log("Not enough mana!", "💧");
            }
        } else {
            this.log("Valid actions: attack, run" + (this.player.class === 'mage' ? ", fireball" : ""), "❓");
            return; // Don't let enemy attack if invalid cmd
        }

        // Enemy Defeated?
        if (enemy.health <= 0) {
            this.winCombat();
            return;
        }

        // Enemy Turn
        const enemyDmg = Math.max(0, Math.floor(enemy.damage * (0.8 + Math.random() * 0.4)) - this.getDefense());
        if (enemyDmg > 0) {
            this.player.health -= enemyDmg;
            this.log(`${enemy.name} hits you for ${enemyDmg} damage!`, "🩸", "#faa");
        } else {
            this.log(`${enemy.name}'s attack glanced off your armor!`, "🛡️", "#aaa");
        }

        if (this.player.health <= 0) {
            this.log("YOU HAVE DIED", "💀", "#f00");

            let score = this.player.gold + (this.player.level * 100);
            if (window.LeaderboardSystem && window.LeaderboardSystem.isTopScore('RPG', score) && score > 0) {
                setTimeout(() => {
                    const playerName = prompt("¡Nuevo récord local! Ingresa tu nombre:") || "Anónimo";
                    window.LeaderboardSystem.addScore({ game: 'RPG', score: score, player: playerName, date: Date.now() });
                }, 500);
            }

            this.respawn();
        } else {
            this.updateUI();
        }
    }

    getDefense() {
        let def = 0;
        if (this.player.equipment.armor) def += ITEMS[this.player.equipment.armor].defense;
        return def;
    }

    winCombat() {
        const enemy = this.gameState.currentEnemy;
        this.log(`Defeated ${enemy.name}!`, "🏆", "#0f0");
        this.log(`+${enemy.xp} XP | +${enemy.gold} Gold`, "💰");

        this.player.experience += enemy.xp;
        this.player.gold += enemy.gold;

        // Quest update
        Object.keys(this.player.activeQuests).forEach(qId => {
            const q = QUESTS[qId];
            if (q.target === enemy.id) {
                this.player.activeQuests[qId].progress++;
                if (this.player.activeQuests[qId].progress >= q.count) {
                    this.completeQuest(qId);
                }
            }
        });

        // Drop?
        if (enemy.drop && Math.random() < 0.4) {
            this.player.inventory.push(enemy.drop);
            this.log(`Looted: ${ITEMS[enemy.drop].name}`, "🎁", "#fa0");
        }

        this.gameState.inCombat = false;

        // Level Up
        if (this.player.experience >= this.player.level * 100) {
            this.levelUp();
        }

        this.updateSuggestions();
        this.updateUI();
        this.saveGame();
    }

    completeQuest(id) {
        const q = QUESTS[id];
        this.log(`QUEST COMPLETE: ${q.name}`, "🏁", "#ffd700");
        this.player.gold += q.add_gold;
        this.player.experience += q.add_xp;
        delete this.player.activeQuests[id];
        this.player.completedQuests.push(id);
    }

    levelUp() {
        this.player.level++;
        this.player.experience = 0;
        this.player.maxHealth += 20;
        this.player.health = this.player.maxHealth;
        this.player.strength += 2;
        this.log(`LEVEL UP! You are now level ${this.player.level}`, "🆙", "#fff");
        sfx.play('score');
    }

    respawn() {
        this.player.health = Math.floor(this.player.maxHealth / 2);
        this.player.currentLocation = 'healer';
        this.gameState.inCombat = false;
        this.log("You were dragged to the healer...", "🤕");
        this.log("Lost some gold.", "💸");
        this.player.gold = Math.floor(this.player.gold * 0.8);
        this.updateUI();
        this.saveGame();
        setTimeout(() => this.look(), 2000);
    }

    // --- Inventory & UI ---

    toggleInventory() {
        this.elements.invModal.classList.toggle('active');
        if (this.elements.invModal.classList.contains('active')) {
            this.renderInventory();
        }
    }

    renderInventory() {
        const grid = this.elements.invGrid;
        grid.innerHTML = '';
        this.selectedItemIndex = -1;
        this.elements.itemDesc.innerHTML = '';
        this.elements.useBtn.disabled = true;

        this.player.inventory.forEach((id, idx) => {
            const item = ITEMS[id];
            const div = document.createElement('div');
            div.className = 'inv-slot';
            div.textContent = item.icon;
            div.onclick = () => this.selectItem(idx);
            grid.appendChild(div);
        });

        // Show equipment slots too? For now just inventory list
    }

    selectItem(idx) {
        this.selectedItemIndex = idx;
        const id = this.player.inventory[idx];
        const item = ITEMS[id];
        this.elements.itemDesc.innerHTML = `<b style="color:#fff">${item.name}</b><br>${item.type}`;
        this.elements.useBtn.disabled = (item.type === 'junk' || item.type === 'quest');
        this.elements.useBtn.textContent = (item.type === 'weapon' || item.type === 'armor') ? 'EQUIP' : 'USE';

        document.querySelectorAll('.inv-slot').forEach(s => s.style.borderColor = '#336633');
        document.querySelectorAll('.inv-slot')[idx].style.borderColor = '#ffff00';
    }

    useSelectedItem() {
        if (this.selectedItemIndex === -1) return;
        const idx = this.selectedItemIndex;
        const id = this.player.inventory[idx];
        const item = ITEMS[id];

        if (item.type === 'consumable') {
            if (item.heal) {
                this.player.health = Math.min(this.player.maxHealth, this.player.health + item.heal);
                this.log(`Used ${item.name}.`, "🍷");
            }
            if (item.energy) {
                this.player.energy = Math.min(this.player.maxEnergy, this.player.energy + item.energy);
            }
            this.player.inventory.splice(idx, 1);
        } else if (item.type === 'weapon') {
            if (this.player.equipment.weapon) this.player.inventory.push(this.player.equipment.weapon); // Swap
            this.player.equipment.weapon = id;
            this.player.inventory.splice(idx, 1);
            this.log(`Equipped ${item.name}.`, "⚔️");
        } else if (item.type === 'armor') {
            if (this.player.equipment.armor) this.player.inventory.push(this.player.equipment.armor);
            this.player.equipment.armor = id;
            this.player.inventory.splice(idx, 1);
            this.log(`Equipped ${item.name}.`, "🛡️");
        }

        this.renderInventory();
        this.updateUI();
        this.saveGame();
    }

    updateUI() {
        const p = this.player;
        this.elements.hpText.textContent = `${p.health}/${p.maxHealth}`;
        this.elements.hpBar.style.width = `${(p.health / p.maxHealth) * 100}%`;
        this.elements.enText.textContent = `${p.energy}/${p.maxEnergy}`;
        this.elements.enBar.style.width = `${(p.energy / p.maxEnergy) * 100}%`;
        this.elements.lvlText.textContent = p.level;
        this.elements.goldText.textContent = p.gold;

        const xpNeeded = p.level * 100;
        this.elements.xpBar.style.width = `${(p.experience / xpNeeded) * 100}%`;

        const locName = LOCATIONS[p.currentLocation]?.name || "Unknown";
        this.elements.locText.textContent = locName;
    }

    updateSuggestions(custom = null) {
        this.elements.suggestions.innerHTML = '';
        let opts = custom;

        if (!opts) {
            if (this.gameState.charCreation) return;
            if (this.gameState.inCombat) {
                opts = ['attack', 'run'];
                if (this.player.class === 'mage') opts.push('fireball', 'heal');
            } else {
                opts = ['look', 'inv', 'stats', 'help'];
                const loc = LOCATIONS[this.player.currentLocation];
                if (loc) {
                    opts = [...opts, ...Object.keys(loc.exits)];
                    if (loc.npcs.length > 0) opts.push('talk');
                }
            }
        }

        opts.forEach(opt => {
            const chip = document.createElement('div');
            chip.className = 'chip';
            chip.textContent = opt;
            chip.onclick = () => {
                if (this.gameState.charCreation) this.handleCharCreationInput(opt);
                else this.processCommand(opt);
            };
            this.elements.suggestions.appendChild(chip);
        });
    }

    showStats() {
        const p = this.player;
        this.log("=== STATS ===", "📊", "#fff");
        this.log(`Name: ${p.name} | Class: ${CLASSES[p.class].nice_name}`, "👤");
        this.log(`STR: ${p.strength} | INT: ${p.intellect}`, "💪");
        this.log(`Weapon: ${p.equipment.weapon ? ITEMS[p.equipment.weapon].name : 'Fists'}`, "⚔️");
        this.log(`Armor: ${p.equipment.armor ? ITEMS[p.equipment.armor].name : 'Clothes'}`, "🦺");
    }

    help() {
        this.log("COMMANDS:", "❓");
        this.log("move [n/s/e/w], look, inv, talk [name], buy [item], attack", "⌨️");
    }

    saveGame() {
        if (!this.player.name) return;
        localStorage.setItem(GAME_CONFIG.SAVE_KEY, JSON.stringify(this.player));
    }

    loadGame() {
        const saved = localStorage.getItem(GAME_CONFIG.SAVE_KEY);
        if (saved) {
            this.gameState.charCreation = false;
            this.player = { ...this.player, ...JSON.parse(saved) };
            this.log(`Welcome back, ${this.player.name}.`, "💾");
            this.look();
            this.updateUI();
        }
    }
}

new RPGGame();
