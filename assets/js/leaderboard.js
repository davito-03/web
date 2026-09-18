/**
 * Leaderboard System - Sistema de Puntuaciones Globales
 * Almacena y gestiona las mejores puntuaciones de todos los juegos
 */

class LeaderboardSystem {
    constructor() {
        this.storageKey = 'davito_leaderboard';
        this.maxScoresPerGame = 10;
        this.init();
    }

    init() {
        // Crear estructura si no existe
        if (!localStorage.getItem(this.storageKey)) {
            localStorage.setItem(this.storageKey, JSON.stringify({}));
        }
    }

    /**
     * Añadir una nueva puntuación
     * @param {Object} scoreData - { game, score, player, date }
     * @returns {number} Posición en el ranking (1-10, o null si no entró)
     */
    addScore(scoreData) {
        const { game, score, player, date } = scoreData;

        if (!game || score === undefined || !player) {
            console.error('Datos de puntuación incompletos');
            return null;
        }

        const leaderboard = this.getLeaderboard();

        // Inicializar juego si no existe
        if (!leaderboard[game]) {
            leaderboard[game] = [];
        }

        // Añadir nueva puntuación
        leaderboard[game].push({
            score: parseInt(score),
            player: player.substring(0, 20), // Limitar nombre
            date: date || Date.now()
        });

        // Ordenar por puntuación (mayor a menor)
        leaderboard[game].sort((a, b) => b.score - a.score);

        // Mantener solo top 10
        leaderboard[game] = leaderboard[game].slice(0, this.maxScoresPerGame);

        // Guardar
        this.saveLeaderboard(leaderboard);

        // Sincronizar asíncronamente en la nube (Firestore)
        this.syncScoreToFirebase(game, score, player, date);

        // Encontrar posición de la puntuación añadida
        const position = leaderboard[game].findIndex(s =>
            s.score === parseInt(score) && s.player === player
        );

        return position !== -1 ? position + 1 : null;
    }

    /**
     * Obtener top puntuaciones de un juego
     * @param {string} game - Nombre del juego
     * @param {number} limit - Número de puntuaciones a devolver
     * @returns {Array} Array de puntuaciones
     */
    getTopScores(game, limit = 10) {
        const leaderboard = this.getLeaderboard();
        return (leaderboard[game] || []).slice(0, limit);
    }

    /**
     * Obtener posición que tendría una puntuación
     * @param {string} game - Nombre del juego
     * @param {number} score - Puntuación a evaluar
     * @returns {number} Posición (1-based) o null si no entra en top 10
     */
    getPlayerPosition(game, score) {
        const scores = this.getTopScores(game, this.maxScoresPerGame);

        // Si hay menos de 10 puntuaciones, siempre entra
        if (scores.length < this.maxScoresPerGame) {
            const position = scores.filter(s => s.score > score).length + 1;
            return position;
        }

        // Verificar si supera la puntuación más baja
        const lowestScore = scores[scores.length - 1].score;
        if (score <= lowestScore) {
            return null; // No entra en el top 10
        }

        // Calcular posición
        const position = scores.filter(s => s.score > score).length + 1;
        return position;
    }

    /**
     * Verificar si una puntuación entra en el top 10
     * @param {string} game - Nombre del juego
     * @param {number} score - Puntuación a verificar
     * @returns {boolean}
     */
    isTopScore(game, score) {
        const scores = this.getTopScores(game, this.maxScoresPerGame);

        if (scores.length < this.maxScoresPerGame) {
            return true;
        }

        return score > scores[scores.length - 1].score;
    }

    /**
     * Obtener todos los juegos con puntuaciones
     * @returns {Array} Array de nombres de juegos
     */
    getAllGames() {
        const leaderboard = this.getLeaderboard();
        return Object.keys(leaderboard).sort();
    }

    /**
     * Limpiar puntuaciones de un juego
     * @param {string} game - Nombre del juego
     */
    clearGame(game) {
        const leaderboard = this.getLeaderboard();
        delete leaderboard[game];
        this.saveLeaderboard(leaderboard);
    }

    /**
     * Limpiar todo el leaderboard
     */
    clearAll() {
        localStorage.setItem(this.storageKey, JSON.stringify({}));
    }

    /**
     * Obtener estadísticas de un juego
     * @param {string} game - Nombre del juego
     * @returns {Object} Estadísticas
     */
    getGameStats(game) {
        const scores = this.getTopScores(game, this.maxScoresPerGame);

        if (scores.length === 0) {
            return {
                totalPlayers: 0,
                highestScore: 0,
                averageScore: 0,
                lowestScore: 0
            };
        }

        const total = scores.reduce((sum, s) => sum + s.score, 0);

        return {
            totalPlayers: scores.length,
            highestScore: scores[0].score,
            averageScore: Math.round(total / scores.length),
            lowestScore: scores[scores.length - 1].score
        };
    }

    // Métodos privados
    getLeaderboard() {
        try {
            return JSON.parse(localStorage.getItem(this.storageKey)) || {};
        } catch (e) {
            console.error('Error al leer leaderboard:', e);
            return {};
        }
    }

    saveLeaderboard(data) {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(data));
        } catch (e) {
            console.error('Error al guardar leaderboard:', e);
        }
    }

    async syncScoreToFirebase(game, score, player, date) {
        try {
            const { initializeApp } = await import("https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js");
            const { getFirestore, collection, addDoc, serverTimestamp } = await import("https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js");
            
            const { firebaseConfig } = await import("/assets/js/firebase-config.js");
            const app = initializeApp(firebaseConfig);
            const db = getFirestore(app);
            const ref = collection(db, "game_leaderboard");

            await addDoc(ref, {
                game: game,
                player: player,
                score: parseInt(score),
                date: date ? new Date(date).toISOString() : new Date().toISOString(),
                serverDate: serverTimestamp()
            });
            console.log(`✅ Score synced to Firestore for ${game}: ${player} - ${score}`);
        } catch (e) {
            console.warn("Failed to sync score to cloud (offline or error):", e);
        }
    }
}

// Inicializar sistema global
window.LeaderboardSystem = new LeaderboardSystem();



console.log('🏆 Leaderboard System loaded');
