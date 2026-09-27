/* ==========================================================================
   main.js — comportamiento del header: menú móvil, selector de idioma,
   sombra al hacer scroll. Navegable con teclado (US57).
   Rama: feature/landing-header-navbar
   ========================================================================== */

(function () {
  "use strict";

  document.addEventListener("DOMContentLoaded", function () {
    var header = document.querySelector(".site-header");
    var menuToggle = document.querySelector(".menu-toggle");
    var mobileMenu = document.getElementById("mobile-menu");
    var langSelect = document.querySelector("[data-lang-select]");
    var langTrigger = langSelect ? langSelect.querySelector(".lang-select__trigger") : null;
    var langMenu = document.getElementById("lang-menu");

    /* ---------- Sombra del header al hacer scroll ---------- */
    function onScroll() {
      if (header) header.classList.toggle("is-scrolled", window.scrollY > 8);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    /* ---------- Menú móvil ---------- */
    function setMenu(open) {
      if (!menuToggle || !mobileMenu) return;
      menuToggle.setAttribute("aria-expanded", String(open));
      mobileMenu.hidden = !open;
      var key = open ? "header.closeMenu" : "header.openMenu";
      var label = window.FlowboardI18n && window.FlowboardI18n.t(key);
      if (label) menuToggle.setAttribute("aria-label", label);
      menuToggle.setAttribute("data-i18n-attr", "aria-label:" + key);
    }

    if (menuToggle) {
      menuToggle.addEventListener("click", function () {
        setMenu(menuToggle.getAttribute("aria-expanded") !== "true");
      });
    }
    if (mobileMenu) {
      mobileMenu.addEventListener("click", function (event) {
        if (event.target.closest("a")) setMenu(false);
      });
    }

    /* ---------- Selector de idioma ---------- */
    function setLangMenu(open) {
      if (!langTrigger || !langMenu) return;
      langTrigger.setAttribute("aria-expanded", String(open));
      langMenu.hidden = !open;
      if (open) {
        var checked = langMenu.querySelector('[aria-checked="true"]') || langMenu.querySelector("button");
        if (checked) checked.focus();
      }
    }

    if (langTrigger) {
      langTrigger.addEventListener("click", function () {
        setLangMenu(langTrigger.getAttribute("aria-expanded") !== "true");
      });
    }
    if (langMenu) {
      langMenu.addEventListener("click", function (event) {
        if (event.target.closest("[data-set-lang]")) {
          setLangMenu(false);
          langTrigger.focus();
        }
      });
      /* Flechas arriba/abajo dentro del menú */
      langMenu.addEventListener("keydown", function (event) {
        if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
        event.preventDefault();
        var items = Array.prototype.slice.call(langMenu.querySelectorAll("button"));
        var index = items.indexOf(document.activeElement);
        var next = event.key === "ArrowDown" ? index + 1 : index - 1;
        items[(next + items.length) % items.length].focus();
      });
    }

    /* Cerrar con clic fuera */
    document.addEventListener("click", function (event) {
      if (langSelect && !langSelect.contains(event.target)) setLangMenu(false);
    });

    /* Cerrar con Escape y devolver el foco al botón que abrió */
    document.addEventListener("keydown", function (event) {
      if (event.key !== "Escape") return;
      if (langTrigger && langTrigger.getAttribute("aria-expanded") === "true") {
        setLangMenu(false);
        langTrigger.focus();
      }
      if (menuToggle && menuToggle.getAttribute("aria-expanded") === "true") {
        setMenu(false);
        menuToggle.focus();
      }
    });

    /* Cerrar el menú móvil si la pantalla pasa a escritorio */
    window.matchMedia("(min-width: 1024px)").addEventListener("change", function (mq) {
      if (mq.matches) setMenu(false);
    });

    /* ---------- Reflejar el idioma activo en los controles ---------- */
    function syncLangControls(lang) {
      document.querySelectorAll("[data-lang-current]").forEach(function (el) {
        el.textContent = lang.toUpperCase();
      });
      document.querySelectorAll('.lang-select__menu [data-set-lang]').forEach(function (btn) {
        btn.setAttribute("aria-checked", String(btn.getAttribute("data-set-lang") === lang));
      });
      document.querySelectorAll('.lang-toggle [data-set-lang]').forEach(function (btn) {
        btn.setAttribute("aria-pressed", String(btn.getAttribute("data-set-lang") === lang));
      });
    }

    if (window.FlowboardI18n) {
      window.FlowboardI18n.onChange(syncLangControls);
      syncLangControls(window.FlowboardI18n.lang);
    }
  });
})();
