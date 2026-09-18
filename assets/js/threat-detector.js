
(function() {
  'use strict';

  const ThreatDetector = {
    init() {
      this.setupEventListeners();
      this.monitorDOMChanges();
      this.protectLocalStorage();
      this.detectSuspiciousActivity();
    },

    setupEventListeners() {

      document.addEventListener('keydown', this.detectKeyloggers.bind(this));
      document.addEventListener('paste', this.validatePasteContent.bind(this));

      document.addEventListener('submit', this.validateFormSubmission.bind(this));

      // DOM monitoring handled by MutationObserver in monitorDOMChanges()
    },

    detectKeyloggers(e) {

      const suspiciousKeys = ['F12', 'F10', 'Insert'];
      const suspiciousCombos = [
        ['Control', 'Shift', 'I'], // DevTools
        ['Control', 'Shift', 'J'], // Console
        ['Control', 'U'] // View Source
      ];

      if (suspiciousKeys.includes(e.key)) {
        this.logThreat('Suspicious key detected', { key: e.key });
      }

      suspiciousCombos.forEach(combo => {
        if (combo.every(key => e.getModifierState && e.getModifierState(key))) {
          this.logThreat('Suspicious key combination', { combo });
        }
      });
    },

    validatePasteContent(e) {
      const clipboardData = e.clipboardData || window.clipboardData;
      const pastedData = clipboardData.getData('text');

      const maliciousPatterns = [
        /<script/i,
        /javascript:/i,
        /eval\(/i,
        /document\.cookie/i,
        /localStorage/i,
        /sessionStorage/i
      ];

      if (maliciousPatterns.some(pattern => pattern.test(pastedData))) {
        e.preventDefault();
        this.logThreat('Malicious content in clipboard', { content: pastedData.substring(0, 100) });
        alert('Contenido sospechoso detectado y bloqueado');
      }
    },

    validateFormSubmission(e) {
      const form = e.target;
      const formData = new FormData(form);
      
      for (let [key, value] of formData.entries()) {
        if (typeof value === 'string') {

          const maliciousPatterns = [
            /(\bor\b|\band\b).*['"]/i,
            /<script/i,
            /javascript:/i,
            /onload=/i,
            /onerror=/i
          ];

          if (maliciousPatterns.some(pattern => pattern.test(value))) {
            e.preventDefault();
            this.logThreat('Malicious form submission attempt', { field: key, value: value.substring(0, 100) });
            alert('Contenido malicioso detectado en el formulario');
            return;
          }
        }
      }
    },

    monitorDOMChanges() {
      const observer = new MutationObserver(mutations => {
        mutations.forEach(mutation => {
          mutation.addedNodes.forEach(node => {
            if (node.nodeType === 1) { // Element node
              this.scanElement(node);
            }
          });
        });
      });

      observer.observe(document.body, {
        childList: true,
        subtree: true
      });
    },

    scanElement(element) {

      const suspiciousAttributes = ['onload', 'onerror', 'onclick', 'onmouseover'];
      const suspiciousTags = ['script', 'iframe', 'object', 'embed'];

      if (suspiciousTags.includes(element.tagName?.toLowerCase())) {
        this.logThreat('Suspicious element added', { 
          tag: element.tagName, 
          src: element.src,
          innerHTML: element.innerHTML?.substring(0, 100)
        });
      }

      suspiciousAttributes.forEach(attr => {
        if (element.hasAttribute(attr)) {
          this.logThreat('Element with suspicious attribute', {
            tag: element.tagName,
            attribute: attr,
            value: element.getAttribute(attr)?.substring(0, 100)
          });
        }
      });
    },

    protectLocalStorage() {

      const originalSetItem = localStorage.setItem;
      const originalGetItem = localStorage.getItem;

      localStorage.setItem = function(key, value) {
        if (ThreatDetector.isSuspiciousStorageAccess(key, value)) {
          ThreatDetector.logThreat('Suspicious localStorage write', { key, value: value?.substring(0, 100) });
          return;
        }
        return originalSetItem.call(this, key, value);
      };

      localStorage.getItem = function(key) {
        if (ThreatDetector.isSuspiciousStorageKey(key)) {
          ThreatDetector.logThreat('Suspicious localStorage read', { key });
          return null;
        }
        return originalGetItem.call(this, key);
      };
    },

    isSuspiciousStorageAccess(key, value) {

      const suspiciousKeys = [
        'token', 'password', 'auth', 'session', 'cookie',
        'discord_token', 'access_token', 'refresh_token'
      ];

      return suspiciousKeys.some(suspicious => 
        key.toLowerCase().includes(suspicious) && 
        value && value.length > 100 // Tokens largos
      );
    },

    isSuspiciousStorageKey(key) {
      const sensitiveKeys = ['discord_access_token', 'dabot_auth_token'];
      return sensitiveKeys.includes(key) && this.getCallStack().includes('unknown');
    },

    detectSuspiciousActivity() {

      let lastCPUCheck = Date.now();
      let highCPUCount = 0;

      setInterval(() => {
        const now = Date.now();
        const timeDiff = now - lastCPUCheck;

        const start = performance.now();
        for (let i = 0; i < 100000; i++) {} // Trabajo pequeño
        const end = performance.now();
        
        if (end - start > 10) { // Si tarda más de 10ms en algo trivial
          highCPUCount++;
          if (highCPUCount > 5) {
            this.logThreat('Possible cryptomining or CPU abuse detected');
            highCPUCount = 0;
          }
        } else {
          highCPUCount = Math.max(0, highCPUCount - 1);
        }
        
        lastCPUCheck = now;
      }, 5000);
    },

    getCallStack() {
      try {
        throw new Error();
      } catch (e) {
        return e.stack || '';
      }
    },

    logThreat(type, details = {}) {
      const threat = {
        type,
        details,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href
      };

      console.warn('🚨 THREAT DETECTED:', threat);

      if (window.securityEndpoint) {
        fetch(window.securityEndpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(threat)
        }).catch(() => {}); // Silenciar errores de red
      }

      const threats = JSON.parse(localStorage.getItem('security_threats') || '[]');
      threats.push(threat);

      if (threats.length > 50) threats.shift();
      localStorage.setItem('security_threats', JSON.stringify(threats));
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => ThreatDetector.init());
  } else {
    ThreatDetector.init();
  }

  window.ThreatDetector = ThreatDetector;

})();




