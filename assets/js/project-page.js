/**
 * Project dossier pages: bilingual long-form blocks + language sync.
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

  document.addEventListener("DOMContentLoaded", syncBlocks);
  window.addEventListener("languageChanged", syncBlocks);
})();
