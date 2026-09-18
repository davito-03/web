// Dashboard de Analytics - Visualización
console.log('📊 Cargando dashboard de analytics...');

class AnalyticsDashboard {
    constructor() {
        this.refreshInterval = 5000; // 5 segundos
        this.charts = {};
        this.init();
    }

    init() {
        this.render();
        this.startAutoRefresh();
        console.log('✅ Dashboard inicializado');
    }

    async render() {
        const stats = await window.analyticsTracker.getStats();
        if (!stats) return;

        this.renderOverview(stats);
        this.renderTopPages(stats.topPages);
        this.renderTopGames(stats.topGames);
        this.renderTopAchievements(stats.topAchievements);
        this.renderHourlyChart(stats.hourlyDistribution);
        this.renderDailyChart(stats.dailyDistribution);
        this.renderGameStats(stats.gameStats);
    }

    renderOverview(stats) {
        const container = document.getElementById('analytics-overview');
        if (!container) return;

        container.innerHTML = `
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-icon">👥</div>
                    <div class="stat-value">${stats.activeSessions}</div>
                    <div class="stat-label">En línea ahora</div>
                </div>
                
                <div class="stat-card">
                    <div class="stat-icon">📄</div>
                    <div class="stat-value">${stats.pageViewsToday.toLocaleString()}</div>
                    <div class="stat-label">Visitas hoy</div>
                </div>
                
                <div class="stat-card">
                    <div class="stat-icon">📅</div>
                    <div class="stat-value">${stats.pageViewsWeek.toLocaleString()}</div>
                    <div class="stat-label">Visitas esta semana</div>
                </div>
                
                <div class="stat-card">
                    <div class="stat-icon">📊</div>
                    <div class="stat-value">${stats.totalPageViews.toLocaleString()}</div>
                    <div class="stat-label">Visitas totales</div>
                </div>
                
                <div class="stat-card">
                    <div class="stat-icon">⏱️</div>
                    <div class="stat-value">${this.formatDuration(stats.avgSessionDuration)}</div>
                    <div class="stat-label">Tiempo promedio</div>
                </div>
                
                <div class="stat-card">
                    <div class="stat-icon">🎮</div>
                    <div class="stat-value">${Object.keys(stats.gameStats).length}</div>
                    <div class="stat-label">Juegos jugados</div>
                </div>
            </div>
        `;
    }

    renderTopPages(topPages) {
        const container = document.getElementById('top-pages');
        if (!container) return;

        const total = topPages.reduce((sum, page) => sum + page.count, 0);

        container.innerHTML = `
            <h3>📄 Páginas Más Visitadas</h3>
            <div class="top-list">
                ${topPages.map((page, index) => {
            const percentage = ((page.count / total) * 100).toFixed(1);
            return `
                        <div class="top-item">
                            <div class="top-rank">#${index + 1}</div>
                            <div class="top-info">
                                <div class="top-name">${this.formatPageName(page.page)}</div>
                                <div class="top-bar-container">
                                    <div class="top-bar" style="width: ${percentage}%"></div>
                                </div>
                            </div>
                            <div class="top-value">${page.count}</div>
                        </div>
                    `;
        }).join('')}
            </div>
        `;
    }

    renderTopGames(topGames) {
        const container = document.getElementById('top-games');
        if (!container) return;

        container.innerHTML = `
            <h3>🎮 Juegos Más Jugados</h3>
            <div class="top-list">
                ${topGames.map((game, index) => `
                    <div class="top-item">
                        <div class="top-rank">#${index + 1}</div>
                        <div class="top-info">
                            <div class="top-name">${game.game}</div>
                            <div class="top-meta">
                                Record: ${game.highScore.toLocaleString()} | 
                                Promedio: ${Math.round(game.totalScore / game.plays).toLocaleString()}
                            </div>
                        </div>
                        <div class="top-value">${game.plays} partidas</div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    renderTopAchievements(topAchievements) {
        const container = document.getElementById('top-achievements');
        if (!container) return;

        container.innerHTML = `
            <h3>🏆 Logros Más Desbloqueados</h3>
            <div class="top-list">
                ${topAchievements.map((achievement, index) => `
                    <div class="top-item">
                        <div class="top-rank">#${index + 1}</div>
                        <div class="top-info">
                            <div class="top-name">${this.formatAchievementName(achievement.achievement)}</div>
                            <div class="top-meta">
                                Última vez: ${this.formatDate(achievement.lastUnlock)}
                            </div>
                        </div>
                        <div class="top-value">${achievement.unlockedCount}×</div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    renderHourlyChart(hourlyData) {
        const container = document.getElementById('hourly-chart');
        if (!container) return;

        const max = Math.max(...hourlyData);

        container.innerHTML = `
            <h3>⏰ Distribución por Hora</h3>
            <div class="chart-container">
                <div class="bar-chart">
                    ${hourlyData.map((count, hour) => {
            const height = max > 0 ? (count / max) * 100 : 0;
            return `
                            <div class="bar-wrapper" title="${count} visitas a las ${hour}:00">
                                <div class="bar" style="height: ${height}%">
                                    <span class="bar-value">${count}</span>
                                </div>
                                <div class="bar-label">${hour}h</div>
                            </div>
                        `;
        }).join('')}
                </div>
            </div>
        `;
    }

    renderDailyChart(dailyData) {
        const container = document.getElementById('daily-chart');
        if (!container) return;

        const entries = Object.entries(dailyData);
        const max = Math.max(...entries.map(([_, count]) => count));

        container.innerHTML = `
            <h3>📅 Últimos 7 Días</h3>
            <div class="chart-container">
                <div class="bar-chart daily">
                    ${entries.map(([date, count]) => {
            const height = max > 0 ? (count / max) * 100 : 0;
            const dayName = this.getDayName(date);
            return `
                            <div class="bar-wrapper" title="${count} visitas el ${date}">
                                <div class="bar" style="height: ${height}%">
                                    <span class="bar-value">${count}</span>
                                </div>
                                <div class="bar-label">${dayName}</div>
                            </div>
                        `;
        }).join('')}
                </div>
            </div>
        `;
    }

    renderGameStats(gameStats) {
        const container = document.getElementById('game-stats');
        if (!container) return;

        const games = Object.entries(gameStats).sort((a, b) => b[1].plays - a[1].plays);

        container.innerHTML = `
            <h3>🎮 Estadísticas Detalladas de Juegos</h3>
            <div class="game-stats-grid">
                ${games.map(([game, stats]) => `
                    <div class="game-stat-card">
                        <h4>${game}</h4>
                        <div class="game-stat-details">
                            <div class="game-stat-row">
                                <span>Partidas jugadas:</span>
                                <strong>${stats.plays.toLocaleString()}</strong>
                            </div>
                            <div class="game-stat-row">
                                <span>Puntuación máxima:</span>
                                <strong>${stats.highScore.toLocaleString()}</strong>
                            </div>
                            <div class="game-stat-row">
                                <span>Puntuación promedio:</span>
                                <strong>${Math.round(stats.totalScore / stats.plays).toLocaleString()}</strong>
                            </div>
                            <div class="game-stat-row">
                                <span>Última partida:</span>
                                <strong>${this.formatDate(stats.lastPlayed)}</strong>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    formatPageName(page) {
        const names = {
            '/': 'Inicio',
            '/index.html': 'Inicio',
            '/laboratorio.html': 'Laboratorio',
            '/blog.html': 'Blog',
            '/messages.html': 'Mensajes',
            '/analytics.html': 'Analytics',
            '/leaderboard.html': 'Leaderboard',
            '/media/': 'Galería',
            '/media/index.html': 'Galería'
        };
        return names[page] || page.replace('.html', '').replace('/', '');
    }

    formatAchievementName(id) {
        const names = {
            'explorador': 'Explorador',
            'curioso': 'Curioso',
            'lector': 'Lector',
            'gamer': 'Gamer',
            'cientifico': 'Científico',
            'social': 'Social',
            'konami': 'Konami Master',
            'time_traveler': 'Viajero del Tiempo',
            'speed_demon': 'Demonio de Velocidad',
            'night_owl': 'Búho Nocturno',
            'collector': 'Coleccionista',
            'developer': 'Desarrollador',
            'persistent': 'Persistente'
        };
        return names[id] || id;
    }

    formatDuration(seconds) {
        if (seconds < 60) return `${seconds}s`;
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return `${minutes}m`;
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return `${hours}h ${mins}m`;
    }

    formatDate(timestamp) {
        if (!timestamp) return 'Nunca';
        const date = new Date(timestamp);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);

        if (diffMins < 1) return 'Ahora mismo';
        if (diffMins < 60) return `Hace ${diffMins}m`;

        const diffHours = Math.floor(diffMins / 60);
        if (diffHours < 24) return `Hace ${diffHours}h`;

        const diffDays = Math.floor(diffHours / 24);
        if (diffDays < 7) return `Hace ${diffDays}d`;

        return date.toLocaleDateString('es-ES');
    }

    getDayName(dateStr) {
        const date = new Date(dateStr);
        const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
        return days[date.getDay()];
    }

    startAutoRefresh() {
        setInterval(() => {
            this.render();
        }, this.refreshInterval);
    }
}

// Inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.analyticsDashboard = new AnalyticsDashboard();
    });
} else {
    window.analyticsDashboard = new AnalyticsDashboard();
}

console.log('✅ Dashboard de analytics listo');
