

(function() {
    'use strict';

    const SecurityCore = {
        modules: {},
        isInitialized: false,
        securityLevel: 'NORMAL',
        
        init() {
            if (this.isInitialized) return;
            
            this.setupSecurityHeaders();
            this.initializeModules();
            this.setupGlobalProtections();
            this.startSecurityDashboard();
            
            this.isInitialized = true;
            console.log('🔒 Security Core inicializado');
        },
        
        setupSecurityHeaders() {
            // NOTE: Security headers (CSP, X-Frame-Options, HSTS, etc.) are enforced
            // by the Nginx server configuration (nginx_davito.conf).
            // Client-side meta tag injection is ineffective:
            //   - X-Frame-Options via <meta> is completely ignored by browsers per W3C spec
            //   - CSP via late JS injection runs after DOM parsing, missing early script loads
            //   - Both can be trivially stripped by an attacker modifying client-side code
            // No action needed here - server handles this correctly.
        },
        
        initializeModules() {

            this.registerModule('ThreatDetector', window.ThreatDetector);
            this.registerModule('SecurityMonitor', window.SecurityMonitor);
            this.registerModule('AdvancedSecurity', window.AdvancedSecurity);
            this.registerModule('BehaviorAnalyzer', window.BehaviorAnalyzer);
            this.registerModule('BackupSystem', window.BackupSystem);
            this.registerModule('CryptoSecurity', window.CryptoSecurity);

            Object.keys(this.modules).forEach(moduleName => {
                const module = this.modules[moduleName];
                if (module && typeof module.init === 'function' && !module.isInitialized) {
                    try {
                        module.init();
                        console.log(`✅ ${moduleName} inicializado`);
                    } catch (error) {
                        console.error(`❌ Error inicializando ${moduleName}:`, error);
                    }
                }
            });
        },
        
        registerModule(name, module) {
            if (module) {
                this.modules[name] = module;
                console.log(`📦 Módulo ${name} registrado`);
            } else {
                console.warn(`⚠️ Módulo ${name} no encontrado`);
            }
        },
        
        setupGlobalProtections() {

            this.setupAntiDebug();

            this.setupDOMProtection();

            this.setupGlobalVariableProtection();

            this.setupEventMonitoring();
        },
        
        setupAntiDebug() {

            let devtools = {open: false, orientation: null};
            
            setInterval(() => {
                if (window.outerHeight - window.innerHeight > 200 || 
                    window.outerWidth - window.innerWidth > 200) {
                    if (!devtools.open) {
                        devtools.open = true;
                        this.handleSecurityEvent('DEVTOOLS_DETECTED', {
                            windowDimensions: {
                                outer: { width: window.outerWidth, height: window.outerHeight },
                                inner: { width: window.innerWidth, height: window.innerHeight }
                            }
                        });
                    }
                } else {
                    devtools.open = false;
                }
            }, 1000);
        },
        
        setupDOMProtection() {

            const observer = new MutationObserver(mutations => {
                mutations.forEach(mutation => {
                    if (mutation.type === 'childList') {
                        mutation.addedNodes.forEach(node => {
                            if (node.nodeType === 1 && node.tagName === 'SCRIPT') {
                                this.validateScript(node);
                            }
                        });
                    }
                });
            });
            
            observer.observe(document.body, {
                childList: true,
                subtree: true
            });
        },
        
        validateScript(scriptElement) {
            const src = scriptElement.src;
            const content = scriptElement.textContent;

            if (src && !this.isAuthorizedSource(src)) {
                this.handleSecurityEvent('UNAUTHORIZED_SCRIPT', { src });
                scriptElement.remove();
                return;
            }

            if (content) {
                const maliciousPatterns = [
                    /eval\s*\(/,
                    /Function\s*\(/,
                    /discord\.com\/api/i,
                    /webhook/i,
                    /token.*steal/i
                ];
                
                if (maliciousPatterns.some(pattern => pattern.test(content))) {
                    this.handleSecurityEvent('MALICIOUS_SCRIPT_CONTENT', { 
                        content: content.substring(0, 200) 
                    });
                    scriptElement.remove();
                }
            }
        },
        
        isAuthorizedSource(src) {
            const authorizedDomains = [
                window.location.origin,
                'https://cdnjs.cloudflare.com',
                'https://assets.mixkit.co',
                'https://fonts.googleapis.com'
            ];
            
            return authorizedDomains.some(domain => src.startsWith(domain));
        },
        
        setupGlobalVariableProtection() {

            const criticalVars = ['SecurityCore', 'ThreatDetector', 'SecurityMonitor'];
            
            criticalVars.forEach(varName => {
                if (window[varName]) {
                    Object.freeze(window[varName]);
                }
            });
        },
        
        setupEventMonitoring() {

            const suspiciousEvents = [
                'beforeunload',
                'unload',
                'pagehide',
                'visibilitychange'
            ];
            
            suspiciousEvents.forEach(eventType => {
                document.addEventListener(eventType, (e) => {
                    this.handleSecurityEvent('SUSPICIOUS_EVENT', { 
                        type: eventType,
                        target: e.target.tagName || 'unknown'
                    });
                });
            });
        },
        
        startSecurityDashboard() {

            this.createSecurityIndicator();

            setInterval(() => {
                this.updateSecurityStatus();
            }, 30000);
        },
        
        createSecurityIndicator() {
            const indicator = document.createElement('div');
            indicator.id = 'security-indicator';
            indicator.innerHTML = `
                <div class="security-status">
                    <i class="fas fa-shield-alt"></i>
                    <span id="security-status-text">SEGURO</span>
                </div>
            `;

            const styles = document.createElement('style');
            styles.textContent = `
                #security-indicator {
                    position: fixed;
                    top: 10px;
                    left: 10px;
                    background: rgba(0, 255, 0, 0.8);
                    color: #000;
                    padding: 5px 10px;
                    border-radius: 15px;
                    font-size: 12px;
                    font-weight: bold;
                    z-index: 10000;
                    transition: background-color 0.3s;
                }
                
                #security-indicator.warning {
                    background: rgba(255, 165, 0, 0.8);
                }
                
                #security-indicator.danger {
                    background: rgba(255, 0, 0, 0.8);
                    color: #fff;
                }
                
                .security-status {
                    display: flex;
                    align-items: center;
                    gap: 5px;
                }
            `;
            
            document.head.appendChild(styles);
            document.body.appendChild(indicator);
        },
        
        updateSecurityStatus() {
            const indicator = document.getElementById('security-indicator');
            const statusText = document.getElementById('security-status-text');
            
            if (!indicator || !statusText) return;

            let threatLevel = 0;
            let activeThreats = 0;
            
            Object.values(this.modules).forEach(module => {
                if (module && typeof module.getSecurityReport === 'function') {
                    const report = module.getSecurityReport();
                    if (report.alertLevel === 'HIGH') threatLevel = Math.max(threatLevel, 3);
                    else if (report.alertLevel === 'MEDIUM') threatLevel = Math.max(threatLevel, 2);
                    else if (report.alertLevel === 'LOW') threatLevel = Math.max(threatLevel, 1);
                    
                    if (report.recentEvents) {
                        activeThreats += report.recentEvents.filter(e => 
                            e.timestamp > Date.now() - 300000 // Ášltimos 5 minutos
                        ).length;
                    }
                }
            });

            indicator.className = '';
            if (threatLevel >= 3 || activeThreats > 5) {
                indicator.className = 'danger';
                statusText.textContent = 'PELIGRO';
                this.securityLevel = 'HIGH';
            } else if (threatLevel >= 2 || activeThreats > 2) {
                indicator.className = 'warning';
                statusText.textContent = 'ALERTA';
                this.securityLevel = 'MEDIUM';
            } else {
                statusText.textContent = 'SEGURO';
                this.securityLevel = 'NORMAL';
            }
        },
        
        handleSecurityEvent(type, details = {}) {
            const event = {
                type,
                details,
                timestamp: new Date().toISOString(),
                source: 'SecurityCore'
            };
            
            console.warn('🔒 SECURITY CORE EVENT:', event);

            Object.values(this.modules).forEach(module => {
                if (module && typeof module.logThreat === 'function') {
                    module.logThreat(type, details);
                }
            });

            this.updateSecurityStatus();
        },
        
        getSystemReport() {
            const report = {
                securityLevel: this.securityLevel,
                isInitialized: this.isInitialized,
                modules: {},
                timestamp: new Date().toISOString()
            };

            Object.entries(this.modules).forEach(([name, module]) => {
                if (module && typeof module.getSecurityReport === 'function') {
                    try {
                        report.modules[name] = module.getSecurityReport();
                    } catch (error) {
                        report.modules[name] = { error: error.message };
                    }
                } else {
                    report.modules[name] = { status: 'not_available' };
                }
            });
            
            return report;
        },
        
        emergencyShutdown() {
            console.warn('🚨 EMERGENCY SHUTDOWN ACTIVATED');

            Object.values(this.modules).forEach(module => {
                if (module && typeof module.stop === 'function') {
                    module.stop();
                }
            });

            try {
                localStorage.clear();
                sessionStorage.clear();
            } catch (error) {
                console.error('Error clearing storage:', error);
            }

            setTimeout(() => {
                window.location.href = '/';
            }, 1000);
        }
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => SecurityCore.init());
    } else {
        SecurityCore.init();
    }

    // SecurityCore is available internally but not exposed to window for security
    // window.emergencyShutdown removed - was callable by any visitor from console
    
})();




