/**
 * Shared chrome for inner pages: starfield, nebula, theme, language.
 */
(function () {
  if (window.__davitoShell) return;
  window.__davitoShell = true;

  (function muteProdConsole() {
    const host = location.hostname;
    if (host === "localhost" || host === "127.0.0.1" || host === "") return;
    const silent = function () {};
    console.log = silent;
    console.info = silent;
    console.debug = silent;
  })();

  function hasScript(name) {
    return !!document.querySelector('script[src*="' + name + '"]');
  }

  function loadScript(src) {
    const file = src.split("/").pop().split("?")[0];
    if (hasScript(file)) return;
    const s = document.createElement("script");
    s.src = src;
    s.defer = true;
    document.head.appendChild(s);
  }

  function loadCss(href) {
    const file = href.split("/").pop().split("?")[0];
    if (document.querySelector('link[href*="' + file + '"]')) return;
    const l = document.createElement("link");
    l.rel = "stylesheet";
    l.href = href;
    document.head.appendChild(l);
  }

  function injectBackHome() {
    const path = location.pathname;
    if (path === "/" || /\/index\.html$/.test(path)) return;
    if (document.querySelector(".davito-back-home, .back-home, .back-link")) return;
    const a = document.createElement("a");
    a.href = "/";
    a.className = "davito-back-home";
    a.innerHTML = '<i class="fas fa-arrow-left" aria-hidden="true"></i><span data-i18n="back_home">Volver al inicio</span>';
    document.body.prepend(a);
  }

  function boot() {
    document.body.classList.add("davito-shell");
    document.documentElement.style.background = "#0f172a";

    injectBackHome();

    if (!document.getElementById("starfield")) {
      const c = document.createElement("canvas");
      c.id = "starfield";
      c.setAttribute("aria-hidden", "true");
      document.body.prepend(c);
    }

    if (!document.querySelector(".ambient-background")) {
      const d = document.createElement("div");
      d.className = "ambient-background";
      document.body.prepend(d);
    }

    if (!document.getElementById("theme-selector")) {
      const bar = document.createElement("div");
      bar.id = "theme-selector";
      bar.innerHTML =
        '<i class="fas fa-palette" aria-hidden="true" style="opacity:.8"></i>' +
        '<select id="main-theme-selector" aria-label="Theme">' +
        '<option value="dark" data-i18n="theme_dark">Tema Oscuro</option>' +
        '<option value="cyberpunk" data-i18n="theme_cyberpunk">Neón / Cyberpunk</option>' +
        '<option value="matrix" data-i18n="theme_matrix">Matrix Hacker</option>' +
        '<option value="light" data-i18n="theme_light">Modo Claro</option>' +
        "</select>";
      document.body.appendChild(bar);
    }

    loadCss("/assets/fontawesome/css/all.min.css?v=6.5.1");
    loadCss("/assets/css/site-shell.css?v=3.1");
    loadCss("/assets/css/styles.css?v=3.6");
    loadScript("/assets/js/i18n-pages.js?v=4");
    loadScript("/assets/js/atmosphere.js?v=2");
    loadScript("/assets/js/themes.js?v=2.3");
    loadScript("/assets/js/i18n.js?v=3.2");
    if (!/\/games\//.test(location.pathname)) {
      loadScript("/assets/js/mascot.js?v=3");
    }
    loadScript("/assets/js/fab.js?v=2");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
