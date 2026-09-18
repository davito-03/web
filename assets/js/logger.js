/**
 * Sistema de Logging Centralizado
 * Diferencia entre entorno de desarrollo y producción
 * Niveles: ERROR, WARN, INFO, DEBUG
 */

(function muteProductionConsole() {
    try {
        const host = window.location.hostname;
        const isDev = host === 'localhost' || host === '127.0.0.1' || host === '' || window.location.protocol === 'file:';
        if (isDev) return;
        const silent = function () {};
        console.log = silent;
        console.info = silent;
        console.debug = silent;
    } catch (e) {}
})();

class Logger {
    constructor() {
        // Detectar entorno
        this.isDevelopment = this.detectEnvironment();
        
        // Configuración de niveles
        this.levels = {
            ERROR: 0,
            WARN: 1,
            INFO: 2,
            DEBUG: 3
        };
        
        // Nivel actual (en producción solo ERROR y WARN)
        this.currentLevel = this.isDevelopment ? this.levels.DEBUG : this.levels.WARN;
        
        // Estilos para consola
        this.styles = {
            ERROR: 'color: #ff4444; font-weight: bold; font-size: 12px;',
            WARN: 'color: #ffaa00; font-weight: bold; font-size: 12px;',
            INFO: 'color: #00aaff; font-weight: normal; font-size: 12px;',
            DEBUG: 'color: #888888; font-weight: normal; font-size: 11px;'
        };
        
        // Contador de errores
        this.errorCount = 0;
        this.warnCount = 0;
    }
    
    /**
     * Detecta si estamos en desarrollo o producción
     */
    detectEnvironment() {
        const hostname = window.location.hostname;
        
        // Desarrollo: localhost, 127.0.0.1, o file://
        const isDev = hostname === 'localhost' || 
                     hostname === '127.0.0.1' || 
                     hostname === '' ||
                     window.location.protocol === 'file:';
        
        return isDev;
    }
    
    /**
     * Método interno para logging
     */
    _log(level, message, ...args) {
        // Solo mostrar si el nivel es suficiente
        if (this.levels[level] > this.currentLevel) {
            return;
        }
        
        const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
        const prefix = `[${timestamp}] [${level}]`;
        
        // En desarrollo, usar estilos de consola
        if (this.isDevelopment) {
            console.log(`%c${prefix}`, this.styles[level], message, ...args);
        } else {
            // En producción, solo errores y warnings críticos
            if (level === 'ERROR' || level === 'WARN') {
                console[level.toLowerCase()](prefix, message, ...args);
            }
        }
        
        // Incrementar contadores
        if (level === 'ERROR') this.errorCount++;
        if (level === 'WARN') this.warnCount++;
        
        // Enviar a sistema de monitoreo (opcional)
        this._sendToMonitoring(level, message, args);
    }
    
    /**
     * Enviar logs a sistema de monitoreo externo (placeholder)
     */
    _sendToMonitoring(level, message, args) {
        // Solo en producción y solo errores críticos
        if (!this.isDevelopment && level === 'ERROR') {
            // Aquí podrías enviar a un servicio como Sentry, LogRocket, etc.
            // Por ahora solo guardamos en localStorage para análisis
            try {
                const logs = JSON.parse(localStorage.getItem('error_logs') || '[]');
                logs.push({
                    timestamp: new Date().toISOString(),
                    level,
                    message,
                    args: JSON.stringify(args),
                    url: window.location.href,
                    userAgent: navigator.userAgent
                });
                
                // Mantener solo los últimos 50 errores
                if (logs.length > 50) {
                    logs.shift();
                }
                
                localStorage.setItem('error_logs', JSON.stringify(logs));
            } catch (e) {
                // Silenciar errores del sistema de logging
            }
        }
    }
    
    /**
     * Métodos públicos de logging
     */
    error(message, ...args) {
        this._log('ERROR', message, ...args);
    }
    
    warn(message, ...args) {
        this._log('WARN', message, ...args);
    }
    
    info(message, ...args) {
        this._log('INFO', message, ...args);
    }
    
    debug(message, ...args) {
        this._log('DEBUG', message, ...args);
    }
    
    /**
     * Obtener estadísticas de logging
     */
    getStats() {
        return {
            environment: this.isDevelopment ? 'development' : 'production',
            errorCount: this.errorCount,
            warnCount: this.warnCount,
            currentLevel: Object.keys(this.levels).find(
                key => this.levels[key] === this.currentLevel
            )
        };
    }
    
    /**
     * Limpiar logs almacenados
     */
    clearStoredLogs() {
        localStorage.removeItem('error_logs');
        this.info('Logs almacenados eliminados');
    }
    
    /**
     * Obtener logs almacenados
     */
    getStoredLogs() {
        try {
            return JSON.parse(localStorage.getItem('error_logs') || '[]');
        } catch (e) {
            return [];
        }
    }
}

// Crear instancia global
const logger = new Logger();

// Mensaje de inicialización
if (logger.isDevelopment) {
    logger.info('🔧 Sistema de logging inicializado en modo DESARROLLO');
    logger.debug('Todos los niveles de log están habilitados');
} else {
    logger.info('🛡️ Sistema de logging inicializado en modo PRODUCCIÓN');
}

// Exportar para uso global
window.logger = logger;

// También crear alias para compatibilidad
window.log = {
    error: (...args) => logger.error(...args),
    warn: (...args) => logger.warn(...args),
    info: (...args) => logger.info(...args),
    debug: (...args) => logger.debug(...args)
};

// Capturar errores globales no manejados
window.addEventListener('error', (event) => {
    logger.error('Error global no manejado:', event.message, {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        error: event.error
    });
});

// Capturar promesas rechazadas no manejadas
window.addEventListener('unhandledrejection', (event) => {
    logger.error('Promise rechazada no manejada:', event.reason);
});

if (logger.isDevelopment) {
    console.log('%c✅ Logger cargado correctamente', 'color: #00ff88; font-weight: bold;');
}
