
// Sistema de Analytics - Tracker con Firebase
console.log('📊 Cargando sistema de analytics (Firebase)...');

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import {
    getFirestore,
    collection,
    addDoc,
    doc,
    getDoc,
    updateDoc,
    increment,
    serverTimestamp,
    setDoc,
    query,
    orderBy,
    limit,
    getDocs
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { firebaseConfig } from './firebase-config.js';

class AnalyticsTracker {
    constructor() {
        this.app = initializeApp(firebaseConfig);
        this.db = getFirestore(this.app);
        this.sessionKey = 'davito_session_v2';
        this.sessionId = this.getOrCreateSession();
        this.init();
    }

    init() {
        this.trackPageView();
        this.setupEventListeners();
        console.log('✅ Analytics tracker (Firebase) inicializado');
    }

    getOrCreateSession() {
        let session = sessionStorage.getItem(this.sessionKey);
        if (!session) {
            session = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
            sessionStorage.setItem(this.sessionKey, session);
        }
        return session;
    }

    async trackPageView() {
        try {
            // Registrar page view individual
            const pageViewData = {
                type: 'page_view',
                page: window.location.pathname,
                title: document.title,
                referrer: document.referrer,
                sessionId: this.sessionId,
                timestamp: serverTimestamp(),
                userAgent: navigator.userAgent
            };

            await addDoc(collection(this.db, 'analytics_events'), pageViewData);

            // Actualizar contador global
            const statsRef = doc(this.db, 'analytics_stats', 'global');

            // Verificar si existe el documento de stats, si no, crearlo
            const statsSnap = await getDoc(statsRef);
            if (!statsSnap.exists()) {
                await setDoc(statsRef, {
                    total_page_views: 1,
                    last_updated: serverTimestamp()
                });
            } else {
                await updateDoc(statsRef, {
                    total_page_views: increment(1),
                    last_updated: serverTimestamp()
                });
            }

            console.log('📊 PageView tracked en Firebase:', window.location.pathname);
        } catch (e) {
            console.error('❌ Error tracking page view:', e);
        }
    }

    async trackEvent(category, action, label = '', value = 0) {
        try {
            const eventData = {
                type: 'event',
                category,
                action,
                label,
                value,
                page: window.location.pathname,
                sessionId: this.sessionId,
                timestamp: serverTimestamp()
            };

            await addDoc(collection(this.db, 'analytics_events'), eventData);
            console.log('📊 Event tracked en Firebase:', { category, action });
        } catch (e) {
            console.error('❌ Error tracking event:', e);
        }
    }

    async trackGameStart(gameName) {
        this.trackEvent('Game', 'Start', gameName);
    }

    async trackGameEnd(gameName, score) {
        this.trackEvent('Game', 'End', gameName, score);
    }

    setupEventListeners() {
        // Track clicks en botones sociales
        document.querySelectorAll('.social-button').forEach(button => {
            button.addEventListener('click', (e) => {
                const label = button.querySelector('.label')?.textContent || 'Unknown';
                this.trackEvent('Social', 'Click', label);
            });
        });

        // Track clicks en juegos
        document.querySelectorAll('.game-card').forEach(card => {
            card.addEventListener('click', (e) => {
                const gameName = card.querySelector('h2')?.textContent || 'Unknown';
                this.trackEvent('Navigation', 'Game Click', gameName);
            });
        });
    }

    // API pública para obtener estadísticas rápidas
    async getGlobalStats() {
        try {
            const statsRef = doc(this.db, 'analytics_stats', 'global');
            const statsSnap = await getDoc(statsRef);

            if (statsSnap.exists()) {
                const data = statsSnap.data();
                return {
                    totalPageViews: data.total_page_views || 0
                };
            }
            return { totalPageViews: 0 };
        } catch (e) {
            console.error('❌ Error fetching stats:', e);
            return { totalPageViews: 0 };
        }
    }

    async getStats() {
        try {
            // 1. Get Global Counters
            const globalStats = await this.getGlobalStats();

            // 2. Get Recent Events for detailed stats (last 500)
            const eventsRef = collection(this.db, 'analytics_events');
            const q = query(eventsRef, orderBy('timestamp', 'desc'), limit(500));
            const querySnapshot = await getDocs(q);

            const pageViews = [];
            const events = [];

            querySnapshot.forEach(doc => {
                const data = doc.data();
                if (data.type === 'page_view') pageViews.push(data);
                else events.push(data);
            });

            // 3. Process data locally
            const now = Date.now();
            const oneDayAgo = now - (24 * 60 * 60 * 1000);
            const oneWeekAgo = now - (7 * 24 * 60 * 60 * 1000);

            // Helper to parsing timestamps which might be Firestore Timestamps or dates
            const getTime = (t) => t?.toMillis ? t.toMillis() : (new Date(t)).getTime();

            const stats = {
                totalPageViews: globalStats.totalPageViews, // Authoritative source
                pageViewsToday: pageViews.filter(pv => getTime(pv.timestamp) > oneDayAgo).length,
                pageViewsWeek: pageViews.filter(pv => getTime(pv.timestamp) > oneWeekAgo).length,

                // Estimate active users from recent pageviews (last 5 mins)
                activeSessions: new Set(pageViews.filter(pv => getTime(pv.timestamp) > now - 5 * 60000).map(pv => pv.sessionId)).size,

                topPages: this.processTopPages(pageViews),
                topGames: this.processTopGames(events),
                hourlyDistribution: this.processHourly(pageViews),
                dailyDistribution: this.processDaily(pageViews),

                // Mocks for now to prevent errors
                topAchievements: [],
                gameStats: {},
                avgSessionDuration: 0
            };

            return stats;

        } catch (e) {
            console.error('Error calculating stats:', e);
            return null;
        }
    }

    processTopPages(pageViews) {
        const counts = {};
        pageViews.forEach(pv => {
            const page = pv.page || '/';
            counts[page] = (counts[page] || 0) + 1;
        });
        return Object.entries(counts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([page, count]) => ({ page, count }));
    }

    processTopGames(events) {
        const gamePlays = events.filter(e => e.category === 'Game' && e.action === 'Start');
        const counts = {};
        gamePlays.forEach(e => {
            const game = e.label || e.game || 'Unknown';
            counts[game] = (counts[game] || 0) + 1;
        });
        return Object.entries(counts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([game, plays]) => ({
                game,
                plays,
                highScore: 0,
                totalScore: 0
            }));
    }

    processHourly(pageViews) {
        const hours = new Array(24).fill(0);
        pageViews.forEach(pv => {
            const t = pv.timestamp?.toMillis ? pv.timestamp.toMillis() : Date.now();
            const hour = new Date(t).getHours();
            hours[hour]++;
        });
        return hours;
    }

    processDaily(pageViews) {
        const days = {};
        pageViews.forEach(pv => {
            const t = pv.timestamp?.toMillis ? pv.timestamp.toMillis() : Date.now();
            const date = new Date(t).toISOString().split('T')[0];
            days[date] = (days[date] || 0) + 1;
        });
        return days;
    }
}

// Inicializar tracker global
window.analyticsTracker = new AnalyticsTracker();

// Exponer funciones globales para compatibilidad
window.trackEvent = (c, a, l, v) => window.analyticsTracker.trackEvent(c, a, l, v);
window.trackGameStart = (g) => window.analyticsTracker.trackGameStart(g);
window.trackGameEnd = (g, s) => window.analyticsTracker.trackGameEnd(g, s);
