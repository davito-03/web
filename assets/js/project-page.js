/**
 * Project dossier pages: bilingual blocks + recon status bar.
 */
(function () {
  function lang() {
    return localStorage.getItem("site_lang") || "es";
  }

  function syncBlocks() {
    const current = lang();
    document.querySelectorAll("[data-lang-block]").forEach(function (el) {
      el.hidden = el.getAttribute("data-lang-block") !== current;
    });
  }

  function injectBanner() {
    if (document.querySelector(".hk-banner")) return;
    const wrap = document.querySelector(".projects-wrap");
    if (!wrap) return;
    const path = (location.pathname.replace(/\/+$/, "") || "/proyectos").replace(/^\//, "~/");
    const bar = document.createElement("div");
    bar.className = "hk-banner";
    bar.setAttribute("aria-hidden", "true");
    bar.innerHTML =
      '<span class="hk-ok">online</span>' +
      "<span>root@davito</span>:<span class=\"hk-path\">" + path + "</span>" +
      ' <span class="hk-muted">// public recon · secrets stay on the box</span>';
    const home = wrap.querySelector(".back-home, .davito-back-home");
    if (home && home.parentNode) {
      home.parentNode.insertBefore(bar, home.nextSibling);
    } else {
      wrap.insertBefore(bar, wrap.firstChild);
    }
  }

  function boot() {
    injectBanner();
    syncBlocks();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
  window.addEventListener("languageChanged", syncBlocks);
})();
