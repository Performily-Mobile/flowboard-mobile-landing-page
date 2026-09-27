/* ==========================================================================
   Flowboard · Landing Page
   i18n.js — cambio de idioma es_419 / en_US (US55)
   --------------------------------------------------------------------------
   · Cada sección registra sus textos con FlowboardI18n.register({ es, en }).
   · En el HTML:  data-i18n="clave"                    → textContent
                  data-i18n-attr="aria-label:clave"    → atributos (separados por ;)
   · El idioma elegido se guarda y se mantiene al navegar entre páginas.
   ========================================================================== */

(function () {
  "use strict";

  var STORAGE_KEY = "flowboard-lang";
  var SUPPORTED = ["es", "en"];
  var DEFAULT_LANG = "es";
  var HTML_LANG = { es: "es-419", en: "en-US" };

  var dictionaries = { es: {}, en: {} };
  var currentLang = DEFAULT_LANG;
  var listeners = [];

  function register(dict) {
    SUPPORTED.forEach(function (lang) {
      if (dict && dict[lang]) {
        Object.assign(dictionaries[lang], dict[lang]);
      }
    });
  }

  function t(key) {
    var value = dictionaries[currentLang][key];
    if (value === undefined) value = dictionaries[DEFAULT_LANG][key];
    return value === undefined ? null : value;
  }

  function readStoredLang() {
    try {
      var stored = window.localStorage.getItem(STORAGE_KEY);
      return SUPPORTED.indexOf(stored) !== -1 ? stored : null;
    } catch (e) {
      return null;
    }
  }

  function storeLang(lang) {
    try {
      window.localStorage.setItem(STORAGE_KEY, lang);
    } catch (e) {
      /* almacenamiento no disponible: el idioma vale solo para esta vista */
    }
  }

  function detectLang() {
    var stored = readStoredLang();
    if (stored) return stored;
    var nav = (navigator.language || "").toLowerCase();
    return nav.indexOf("en") === 0 ? "en" : DEFAULT_LANG;
  }

  function translateTree(root) {
    root.querySelectorAll("[data-i18n]").forEach(function (el) {
      var value = t(el.getAttribute("data-i18n"));
      if (value !== null) el.textContent = value;
    });

    root.querySelectorAll("[data-i18n-attr]").forEach(function (el) {
      el.getAttribute("data-i18n-attr").split(";").forEach(function (pair) {
        var parts = pair.split(":");
        if (parts.length !== 2) return;
        var value = t(parts[1].trim());
        if (value !== null) el.setAttribute(parts[0].trim(), value);
      });
    });
  }

  function apply(lang, options) {
    if (SUPPORTED.indexOf(lang) === -1) lang = DEFAULT_LANG;
    currentLang = lang;
    document.documentElement.lang = HTML_LANG[lang];

    var titleKey = document.documentElement.getAttribute("data-i18n-title") || "meta.title";
    var title = t(titleKey);
    if (title) document.title = title;
    var desc = document.querySelector('meta[name="description"]');
    var descText = t("meta.description");
    if (desc && descText) desc.setAttribute("content", descText);

    translateTree(document);

    if (!options || options.persist !== false) storeLang(lang);
    listeners.forEach(function (fn) { fn(lang); });
  }

  function onChange(fn) {
    listeners.push(fn);
  }

  window.FlowboardI18n = {
    register: register,
    apply: apply,
    onChange: onChange,
    t: t,
    get lang() { return currentLang; }
  };

  document.addEventListener("DOMContentLoaded", function () {
    apply(detectLang(), { persist: false });

    /* Cualquier botón con data-set-lang cambia el idioma */
    document.addEventListener("click", function (event) {
      var trigger = event.target.closest("[data-set-lang]");
      if (!trigger) return;
      apply(trigger.getAttribute("data-set-lang"));
    });
  });
})();
