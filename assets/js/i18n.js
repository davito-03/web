/**
 * Sistema de Internacionalización (i18n ES / EN) - davito.es
 */
class I18nEngine {
  constructor() {
    this.currentLang = localStorage.getItem('site_lang') || 'es';
    this.dictionary = {
      es: {
        bio_subtitle: "bienvenido a mi web ;)",
        bio_role: "Bots, webs y un VPS que mantengo yo.",
        visitas_label: "Visitas:",
        theme_dark: "Tema Oscuro",
        theme_cyberpunk: "Neón / Cyberpunk",
        theme_matrix: "Matrix Hacker",
        theme_light: "Modo Claro",
        bot_desc: "Bot multipropósito para Discord con IA integrada",
        status_online: "En línea",
        status_offline: "Sin conexión",
        status_checking: "Comprobando…",
        status_guilds: "servidores",
        bot_cta_title: "¿Listo para mejorar tu servidor?",
        bot_cta_desc: "Añade Dabot a tu servidor de Discord y experimenta todas estas funcionalidades",
        bot_invite: "Abrir dashboard",
        privacy_policy: "Política de Privacidad",
        terms_service: "Términos de Servicio",
        footer_hub: "Hub Personal",
        footer_privacy: "Privacidad",
        footer_terms: "Términos",
        lang_label: "Idioma",
        discord_status: "Estado de Discord",
        feat_title: "Características Principales",
        feat_mod_t: "Moderación Avanzada",
        feat_mod_p: "Sistema completo de moderación con auto-mod, warnings, kicks, bans y logs detallados",
        feat_fun_t: "Entretenimiento",
        feat_fun_p: "Juegos interactivos, memes, actividades grupales y comandos divertidos para tu servidor",
        feat_util_t: "Utilidades",
        feat_util_p: "Herramientas útiles para la gestión del servidor y productividad del usuario",
        feat_tick_t: "Sistema de Tickets",
        feat_tick_p: "Sistema profesional de soporte con categorías, transcripciones y gestión avanzada",
        bot_perms: "Permisos de administrador requeridos para el funcionamiento completo",
        bot_online: "24/7 Online",
        feat_mod_1: "Auto-moderación inteligente",
        feat_mod_2: "Sistema de advertencias",
        feat_mod_3: "Logs detallados",
        feat_fun_1: "Juegos interactivos",
        feat_fun_2: "Generador de memes",
        feat_fun_3: "Trivias y concursos",
        feat_util_1: "Gestión de roles",
        feat_util_2: "Recordatorios",
        feat_util_3: "Calculadora avanzada",
        feat_tick_1: "Tickets categorizados",
        feat_tick_2: "Transcripciones automáticas",
        feat_tick_3: "Panel de administración",
        footer_copy: "Hecho con ♥ y mucho café.",
        footer_blog: "Blog",
        footer_projects: "Proyectos",
        connected: "Conectado",
        offline: "Sin conexión",
        secret_close: "Cerrar"
      },
      en: {
        bio_subtitle: "welcome to my web ;)",
        bio_role: "Bots, sites, and a VPS I run myself.",
        visitas_label: "Visits:",
        theme_dark: "Dark Theme",
        theme_cyberpunk: "Neon / Cyberpunk",
        theme_matrix: "Matrix Hacker",
        theme_light: "Light Mode",
        bot_desc: "Multipurpose Discord bot with integrated AI",
        status_online: "Online",
        status_offline: "Offline",
        status_checking: "Checking…",
        status_guilds: "servers",
        bot_cta_title: "Ready to upgrade your server?",
        bot_cta_desc: "Add Dabot to your Discord server and experience all these features",
        bot_invite: "Open dashboard",
        privacy_policy: "Privacy Policy",
        terms_service: "Terms of Service",
        footer_hub: "Personal Hub",
        footer_privacy: "Privacy",
        footer_terms: "Terms",
        lang_label: "Language",
        discord_status: "Discord Status",
        feat_title: "Main Features",
        feat_mod_t: "Advanced Moderation",
        feat_mod_p: "Full moderation suite with automod, warnings, kicks, bans and detailed logs",
        feat_fun_t: "Entertainment",
        feat_fun_p: "Interactive games, memes, group activities and fun commands for your server",
        feat_util_t: "Utilities",
        feat_util_p: "Handy tools for server management and everyday productivity",
        feat_tick_t: "Ticket System",
        feat_tick_p: "Professional support with categories, transcripts and advanced management",
        bot_perms: "Administrator permission is required for full functionality",
        bot_online: "24/7 Online",
        feat_mod_1: "Smart auto-moderation",
        feat_mod_2: "Warning system",
        feat_mod_3: "Detailed logs",
        feat_fun_1: "Interactive games",
        feat_fun_2: "Meme generator",
        feat_fun_3: "Trivia and contests",
        feat_util_1: "Role management",
        feat_util_2: "Reminders",
        feat_util_3: "Advanced calculator",
        feat_tick_1: "Categorized tickets",
        feat_tick_2: "Automatic transcripts",
        feat_tick_3: "Admin panel",
        footer_copy: "Made with ♥ and lots of coffee.",
        footer_blog: "Blog",
        footer_projects: "Projects",
        connected: "Online",
        offline: "Offline",
        secret_close: "Close"
      }
    };

    this.init();
  }

  dictFor(lang) {
    return Object.assign(
      {},
      this.dictionary[lang] || this.dictionary.es,
      (window.DAVITO_I18N_EXTRA && window.DAVITO_I18N_EXTRA[lang]) || {},
      (window.DAVITO_I18N_PAGES && window.DAVITO_I18N_PAGES[lang]) || {}
    );
  }

  t(key, fallback) {
    const dict = this.dictFor(this.currentLang);
    return dict[key] || fallback || key;
  }

  init() {
    window.__davitoI18n = this;
    window.davitoT = (key, fallback) => this.t(key, fallback);
    this.injectLangSelector();
    this.applyLanguage(this.currentLang);
  }

  injectLangSelector() {
    if (document.getElementById('lang-selector')) {
      document.getElementById('lang-selector').addEventListener('change', (e) => {
        this.setLanguage(e.target.value);
      });
      return;
    }

    const themeSelector = document.getElementById('theme-selector');
    const host = themeSelector || document.body;

    const langWrapper = document.createElement('div');
    langWrapper.id = 'lang-wrapper';
    langWrapper.style.display = 'inline-flex';
    langWrapper.style.alignItems = 'center';
    langWrapper.style.gap = '6px';

    langWrapper.innerHTML = `
      <i class="fas fa-globe" style="opacity: 0.8; font-size: 0.9em;"></i>
      <select id="lang-selector" aria-label="Language">
        <option value="es"${this.currentLang === 'es' ? ' selected' : ''}>ES</option>
        <option value="en"${this.currentLang === 'en' ? ' selected' : ''}>EN</option>
      </select>
    `;

    host.appendChild(langWrapper);

    document.getElementById('lang-selector').addEventListener('change', (e) => {
      this.setLanguage(e.target.value);
    });
  }

  setLanguage(lang) {
    this.currentLang = lang;
    localStorage.setItem('site_lang', lang);
    this.applyLanguage(lang);
  }

  applyLanguage(lang) {
    document.documentElement.lang = lang;
    const dict = this.dictFor(lang);

    document.querySelectorAll('[data-i18n]').forEach((el) => {
      const key = el.getAttribute('data-i18n');
      if (!dict[key]) return;
      if (el.childElementCount === 0) {
        el.textContent = dict[key];
      } else {
        const textNode = Array.from(el.childNodes).find((n) => n.nodeType === 3 && n.textContent.trim());
        if (textNode) textNode.textContent = ' ' + dict[key];
        else el.appendChild(document.createTextNode(' ' + dict[key]));
      }
    });

    document.querySelectorAll('[data-i18n-placeholder]').forEach((el) => {
      const key = el.getAttribute('data-i18n-placeholder');
      if (dict[key]) el.setAttribute('placeholder', dict[key]);
    });

    document.querySelectorAll('[data-i18n-aria]').forEach((el) => {
      const key = el.getAttribute('data-i18n-aria');
      if (dict[key]) el.setAttribute('aria-label', dict[key]);
    });

    const titleKey = document.body.getAttribute('data-i18n-title');
    if (titleKey && dict[titleKey]) {
      document.title = dict[titleKey];
    }

    window.dispatchEvent(new CustomEvent('languageChanged', { detail: { lang } }));
  }
}

function loadScriptThen(src, done) {
  const s = document.createElement('script');
  s.src = src;
  s.onload = done;
  s.onerror = done;
  document.head.appendChild(s);
}

function startI18n() {
  const path = location.pathname;
  const needLegal = /privacy-policy|terms-of-service/.test(path);
  const extras = [];
  if (needLegal) extras.push('/assets/js/i18n-legal.js?v=1');
  if (!window.DAVITO_I18N_PAGES) extras.push('/assets/js/i18n-pages.js?v=5');

  const next = () => {
    if (extras.length) {
      loadScriptThen(extras.shift(), next);
    } else {
      new I18nEngine();
    }
  };
  next();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', startI18n);
} else {
  startI18n();
}
