export const GAME_CONFIG = {
    MAX_HEALTH: 100,
    MAX_ENERGY: 100,
    STARTING_GOLD: 50,
    EXPERIENCE_MULTIPLIER: 100,
    SAVE_KEY: 'rpg_adventure_v2_save'
};

export const CLASSES = {
    'warrior': { name: 'Warrior', hp: 120, energy: 80, str: 10, int: 2, nice_name: 'Guerrero', icon: '⚔️' },
    'mage': { name: 'Mage', hp: 80, energy: 150, str: 2, int: 10, nice_name: 'Mago', icon: '🔮' },
    'rogue': { name: 'Rogue', hp: 100, energy: 100, str: 6, int: 6, nice_name: 'Pícaro', icon: '🗡️' }
};

export const ITEMS = {
    // Potions
    'potion_min_hp': { name: 'Poción Menor', type: 'consumable', heal: 30, value: 15, icon: '🍷' },
    'potion_hp': { name: 'Poción de Vida', type: 'consumable', heal: 60, value: 40, icon: '🧪' },
    'potion_max_hp': { name: 'Elixir de Vida', type: 'consumable', heal: 150, value: 100, icon: '🏺' },
    'potion_energy': { name: 'Bebida Energética', type: 'consumable', energy: 50, value: 30, icon: '⚡' },

    // Weapons
    'wd_sword': { name: 'Espada de Madera', type: 'weapon', damage: 5, value: 10, icon: '🪵' },
    'rn_sword': { name: 'Espada de Hierro', type: 'weapon', damage: 15, value: 100, icon: '⚔️' },
    'stl_sword': { name: 'Espada de Acero', type: 'weapon', damage: 25, value: 300, icon: '🗡️' },
    'myth_sword': { name: 'Espada Mítica', type: 'weapon', damage: 50, value: 1000, icon: '✨' },
    'drag_slayer': { name: 'Matadragones', type: 'weapon', damage: 80, value: 5000, icon: '🐉' },

    'old_staff': { name: 'Bastón Viejo', type: 'weapon', magic: 5, value: 10, icon: '🦯' },
    'mage_staff': { name: 'Bastón de Mago', type: 'weapon', magic: 15, value: 120, icon: '🔮' },
    'arch_staff': { name: 'Bastón Arcano', type: 'weapon', magic: 30, value: 400, icon: '🌟' },

    // Armor
    'leath_armor': { name: 'Armadura de Cuero', type: 'armor', defense: 5, value: 50, icon: '🦺' },
    'chain_mail': { name: 'Cota de Malla', type: 'armor', defense: 12, value: 200, icon: '⛓️' },
    'plate_armor': { name: 'Armadura de Placas', type: 'armor', defense: 25, value: 600, icon: '🛡️' },
    'drac_armor': { name: 'Armadura Dracónica', type: 'armor', defense: 50, value: 3000, icon: '🐲' },

    // Valuables / Quest
    'gold_ring': { name: 'Anillo de Oro', type: 'junk', value: 80, icon: '💍' },
    'goblin_ear': { name: 'Oreja de Goblin', type: 'quest', value: 5, icon: '👂' },
    'dragon_scale': { name: 'Escama de Dragón', type: 'quest', value: 500, icon: '🦎' }
};

export const ENEMIES = {
    'rat': { name: 'Rata Gigante', health: 15, damage: 4, xp: 10, gold: 3, icon: '🐀', drop: 'potion_min_hp' },
    'goblin': { name: 'Goblin', health: 35, damage: 8, xp: 25, gold: 12, icon: '👺', drop: 'goblin_ear' },
    'wolf': { name: 'Lobo', health: 50, damage: 12, xp: 40, gold: 8, icon: '🐺' },
    'bandit': { name: 'Bandido', health: 70, damage: 15, xp: 60, gold: 30, icon: '🥷', drop: 'rn_sword' },
    'orc_warrior': { name: 'Orco Guerrero', health: 120, damage: 20, xp: 100, gold: 45, icon: '👹', drop: 'chain_mail' },
    'wraith': { name: 'Espectro', health: 90, damage: 25, xp: 120, gold: 60, icon: '👻', drop: 'potion_energy' },
    'golem': { name: 'Gólem de Piedra', health: 250, damage: 30, xp: 300, gold: 100, icon: '🗿', drop: 'plate_armor' },
    'dragon': { name: 'Dragón Rojo', health: 500, damage: 55, xp: 1000, gold: 2000, icon: '🐲', drop: 'dragon_scale', unique: true }
};

export const LOCATIONS = {
    'start': {
        name: 'Plaza del Pueblo',
        description: 'El corazón de Villa Raíz. Hay actividad por todos lados.',
        icon: '🏠',
        exits: { norte: 'gate', este: 'shop', sur: 'tavern', oeste: 'healer' },
        npcs: ['old_man'],
        enemies: []
    },
    'shop': {
        name: 'Tienda de Objetos',
        description: 'Estantes llenos de pociones y equipo básico.',
        icon: '🏪',
        exits: { oeste: 'start' },
        npcs: ['merchant'],
        enemies: []
    },
    'healer': {
        name: 'Cabaña del Sanador',
        description: 'Huele a hierbas medicinales e incienso.',
        icon: '🏥',
        exits: { este: 'start' },
        npcs: ['healer'],
        enemies: []
    },
    'tavern': {
        name: 'Taberna El Jabalí',
        description: 'Música alegre y olor a cerveza rancia.',
        icon: '🍺',
        exits: { norte: 'start', abajo: 'cellar' },
        npcs: ['barkeep'],
        enemies: []
    },
    'cellar': {
        name: 'Sótano de la Taberna',
        description: 'Oscuro, húmedo y lleno de chillidos.',
        icon: '📦',
        exits: { arriba: 'tavern' },
        npcs: [],
        enemies: ['rat']
    },
    'gate': {
        name: 'Puerta Norte',
        description: 'La salida del pueblo hacia el mundo salvaje.',
        icon: '⛩️',
        exits: { sur: 'start', norte: 'forest_edge' },
        npcs: ['guard'],
        enemies: []
    },
    'forest_edge': {
        name: 'Linde del Bosque',
        description: 'Los árboles comienzan a cerrarse sobre el camino.',
        icon: '🌲',
        exits: { sur: 'gate', norte: 'deep_forest', este: 'lake' },
        npcs: [],
        enemies: ['goblin', 'wolf']
    },
    'lake': {
        name: 'Lago Cristal',
        description: 'Aguas tranquilas. Parece seguro, por ahora.',
        icon: '💧',
        exits: { oeste: 'forest_edge' },
        npcs: [],
        enemies: ['wolf']
    },
    'deep_forest': {
        name: 'Bosque Profundo',
        description: 'La luz apenas llega al suelo. Ojos te observan.',
        icon: '🌳',
        exits: { sur: 'forest_edge', norte: 'mountain_base', este: 'ruins' },
        npcs: [],
        enemies: ['orc_warrior', 'bandit']
    },
    'ruins': {
        name: 'Ruinas Antiguas',
        description: 'Piedras cubiertas de musgo y magia residual.',
        icon: '🏛️',
        exits: { oeste: 'deep_forest', abajo: 'crypt' },
        npcs: [],
        enemies: ['wraith', 'bandit']
    },
    'crypt': {
        name: 'Cripta Olvidada',
        description: 'El aire es frío como la muerte.',
        icon: '⚰️',
        exits: { arriba: 'ruins' },
        npcs: [],
        enemies: ['wraith', 'golem']
    },
    'mountain_base': {
        name: 'Base de la Montaña',
        description: 'El camino se vuelve empinado y rocoso.',
        icon: '🏔️',
        exits: { sur: 'deep_forest', arriba: 'mountain_peak' },
        npcs: [],
        enemies: ['golem', 'orc_warrior']
    },
    'mountain_peak': {
        name: 'Pico del Dragón',
        description: 'La cima del mundo. Un nido enorme domina la vista.',
        icon: '🌋',
        exits: { abajo: 'mountain_base' },
        npcs: [],
        enemies: ['dragon']
    }
};

export const QUESTS = {
    'rats_problem': {
        name: 'Plaga de Ratas',
        description: 'El tabernero quiere que limpies su sótano.',
        target: 'rat',
        count: 5,
        add_gold: 50,
        add_xp: 50
    },
    'lost_sword': {
        name: 'Recupera el Acero',
        description: 'Trae una Espada de Hierro a la guardia.',
        target_item: 'rn_sword',
        add_gold: 200,
        add_xp: 150
    }
};

export const SPELLS = {
    'fireball': { name: 'Bola de Fuego', damage: 30, cost: 20, icon: '🔥', type: 'dmg' },
    'heal': { name: 'Curación Menor', heal: 40, cost: 25, icon: '✨', type: 'heal' },
    'lightning': { name: 'Trueno', damage: 50, cost: 40, icon: '⚡', type: 'dmg' },
    'shield': { name: 'Escudo Mágico', effect: 'defense', duration: 3, cost: 30, icon: '🛡️', type: 'buff' }
};