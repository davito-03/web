/**
 * Mobile FAB: collapse floating shortcuts into one button.
 */
(function () {
  function t(key, fallback) {
    return (window.davitoT && window.davitoT(key, fallback)) || fallback;
  }

  function syncToggle(stack, toggle) {
    const open = stack.classList.contains("is-open");
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
    toggle.setAttribute("aria-label", open ? t("fab_close", "Cerrar menú") : t("fab_open", "Abrir menú"));
    const icon = toggle.querySelector("i");
    if (icon) icon.className = open ? "fas fa-times" : "fas fa-layer-group";
  }

  function close(stack, toggle) {
    stack.classList.remove("is-open");
    syncToggle(stack, toggle);
  }

  function init() {
    const stack = document.getElementById("fab-stack");
    const toggle = document.getElementById("fab-toggle");
    if (!stack || !toggle || toggle.dataset.bound) return;
    toggle.dataset.bound = "1";
    syncToggle(stack, toggle);

    toggle.addEventListener("click", function (e) {
      e.stopPropagation();
      stack.classList.toggle("is-open");
      syncToggle(stack, toggle);
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && stack.classList.contains("is-open")) {
        close(stack, toggle);
        toggle.focus();
      }
    });

    document.addEventListener("click", function (e) {
      if (!stack.contains(e.target)) close(stack, toggle);
    });

    window.addEventListener("languageChanged", function () {
      syncToggle(stack, toggle);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
