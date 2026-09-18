/**
 * Content Sections — Dynamic content loader
 * Handles: Daily quote, Section reveal animations
 */

(function () {
  'use strict';



  // ========== DAILY QUOTE ==========
  function loadQuote() {
    const textEl = document.getElementById('quote-text');
    const authorEl = document.getElementById('quote-author');
    if (!textEl || !authorEl) return;

    // Wait for quote-bank.js to load (it's deferred)
    if (typeof window.getRandomQuote !== 'function') {
      setTimeout(loadQuote, 200);
      return;
    }

    showNewQuote(textEl, authorEl);

    const btn = document.getElementById('new-quote-btn');
    if (btn) {
      btn.addEventListener('click', () => {
        btn.classList.add('spinning');
        textEl.style.opacity = '0';
        authorEl.style.opacity = '0';

        setTimeout(() => {
          showNewQuote(textEl, authorEl);
          textEl.style.opacity = '1';
          authorEl.style.opacity = '1';
          btn.classList.remove('spinning');
        }, 400);
      });
    }
  }

  function showNewQuote(textEl, authorEl) {
    const raw = window.getRandomQuote();
    const parts = raw.split(' - ');
    const quote = parts.slice(0, -1).join(' - ');
    const author = parts[parts.length - 1] || '';

    textEl.textContent = `"${quote}"`;
    authorEl.textContent = author ? `— ${author}` : '';
  }


  // ========== REVEAL ON SCROLL ==========
  function setupRevealObserver() {
    const sections = document.querySelectorAll('.content-section.reveal');
    if (!sections.length) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

    sections.forEach(s => observer.observe(s));
  }


  // ========== INIT ==========
  function init() {

    loadQuote();
    setupRevealObserver();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
