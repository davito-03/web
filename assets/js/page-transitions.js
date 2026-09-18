// page-transitions.js — Smooth fade transitions between pages
(function () {
    // Create the overlay element
    const overlay = document.createElement('div');
    overlay.id = 'page-transition-overlay';
    overlay.style.cssText = `
        position: fixed;
        inset: 0;
        background: #0a0a0a;
        z-index: 99998;
        pointer-events: none;
        opacity: 0;
        transition: opacity 0.35s cubic-bezier(0.4, 0, 0.2, 1);
    `;
    document.body.appendChild(overlay);

    // Intercept internal link clicks for fade OUT
    document.addEventListener('click', (e) => {
        const link = e.target.closest('a');
        if (!link) return;

        const href = link.getAttribute('href');
        if (!href) return;

        // Skip external, new-tab, anchor, and mailto links
        const isExternal = link.target === '_blank' || href.startsWith('http') || href.startsWith('//') || href.startsWith('mailto:');
        const isAnchor = href.startsWith('#');
        const isJavascript = href.startsWith('javascript:');
        const isFab = link.classList.contains('floating-button') || link.closest('#fab-stack');

        if (isExternal || isAnchor || isJavascript || isFab) return;

        e.preventDefault();

        overlay.style.transition = 'opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
        overlay.style.opacity = '1';

        setTimeout(() => {
            window.location.href = href;
        }, 320);
    });
})();
