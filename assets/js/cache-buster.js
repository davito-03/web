

console.log('🚀 Cache Buster System v2.0 iniciado');

const CacheBuster = {
    version: '2.0.0',
    enabled: true,
    timestamp: Date.now(),
    randomId: Math.random().toString(36).substr(2, 9),

    generateId() {
        return `${this.timestamp}${this.randomId}`;
    },

    applyCacheBusting(element, attribute = 'src') {
        if (!this.enabled) return element;
        
        const url = element.getAttribute(attribute);
        if (!url) return element;

        if (url.startsWith('http') || url.startsWith('//')) {
            return element;
        }

        if (url.includes('?v=') || url.includes('&v=')) {
            return element;
        }
        
        const separator = url.includes('?') ? '&' : '?';
        const newUrl = `${url}${separator}v=${this.generateId()}`;
        element.setAttribute(attribute, newUrl);
        
        console.log(`âœ… Cache busting aplicado: ${url} -> ${newUrl}`);
        return element;
    },

    loadScript(src, options = {}) {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');

            Object.assign(script, options);

            script.src = this.addCacheBuster(src);

            script.onload = () => {
                console.log(`âœ… Script cargado: ${script.src}`);
                resolve(script);
            };
            
            script.onerror = () => {
                console.error(`âŒ Error cargando script: ${script.src}`);
                reject(new Error(`Failed to load script: ${src}`));
            };

            document.head.appendChild(script);
        });
    },

    loadCSS(href, options = {}) {
        return new Promise((resolve, reject) => {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.type = 'text/css';

            Object.assign(link, options);

            link.href = this.addCacheBuster(href);

            link.onload = () => {
                console.log(`âœ… CSS cargado: ${link.href}`);
                resolve(link);
            };
            
            link.onerror = () => {
                console.error(`âŒ Error cargando CSS: ${link.href}`);
                reject(new Error(`Failed to load CSS: ${href}`));
            };

            document.head.appendChild(link);
        });
    },

    addCacheBuster(url) {
        if (!this.enabled) return url;
        if (!url || url.startsWith('http') || url.startsWith('//')) return url;
        if (url.includes('?v=') || url.includes('&v=')) return url;
        
        const separator = url.includes('?') ? '&' : '?';
        return `${url}${separator}v=${this.generateId()}`;
    },

    applyToExistingElements() {
        // Do not rewrite src/href of scripts and styles already in the document.
        // Changing a deferred script's src before it runs cancels execution in
        // several browsers, which left the splash screen up and the page blank.
    },

    observeNewElements() {
        if (typeof MutationObserver === 'undefined') return;
        
        const observer = new MutationObserver(mutations => {
            mutations.forEach(mutation => {
                mutation.addedNodes.forEach(node => {
                    if (node.nodeType === Node.ELEMENT_NODE) {

                        if (node.tagName === 'SCRIPT' && node.hasAttribute('src')) {
                            this.applyCacheBusting(node, 'src');
                        }

                        if (node.tagName === 'LINK' && node.rel === 'stylesheet' && node.hasAttribute('href')) {
                            this.applyCacheBusting(node, 'href');
                        }

                        if (node.querySelectorAll) {
                            node.querySelectorAll('script[src], link[rel="stylesheet"][href]').forEach(element => {
                                const attr = element.tagName === 'SCRIPT' ? 'src' : 'href';
                                this.applyCacheBusting(element, attr);
                            });
                        }
                    }
                });
            });
        });
        
        observer.observe(document.documentElement, {
            childList: true,
            subtree: true
        });
        
        console.log('âœ… Observer de cache busting iniciado');
    },

    init() {
        console.log(`🚀 Inicializando Cache Buster v${this.version}`);

        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this.applyToExistingElements();
            });
        } else {
            this.applyToExistingElements();
        }

        this.observeNewElements();
        
        console.log('âœ… Cache Buster inicializado correctamente');
    }
};

window.CacheBuster = CacheBuster;

CacheBuster.init();

console.log('âœ… Cache Buster System v2.0 listo');



