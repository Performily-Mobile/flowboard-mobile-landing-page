(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var supportsObserver = "IntersectionObserver" in window;

  if (reduceMotion || !supportsObserver) return;

  document.documentElement.classList.add("js-anim");

  document.addEventListener("DOMContentLoaded", function () {

    var REVEAL_GROUPS = [
      { selector: ".section-head", type: "up" },
      { selector: ".sectors__title", type: "up" },
      { selector: ".hero__highlights > li", type: "up", stagger: true },
      { selector: ".sectors__list > li", type: "up", stagger: true },
      { selector: ".compare__card", type: "up", stagger: true },
      { selector: ".metrics__grid > li", type: "up", stagger: true },
      { selector: ".segment", type: "up", stagger: true },
      { selector: ".segments__access", type: "up" },
      { selector: ".feature__copy", type: "left" },
      { selector: ".feature__visual", type: "scale" },
      { selector: ".modules__grid > li", type: "up", stagger: true },
      { selector: ".module-wide", type: "up" },
      { selector: ".integrations__grid > li", type: "up", stagger: true },
      { selector: ".quote", type: "up", stagger: true },
      { selector: ".faq__intro", type: "left" },
      { selector: ".faq__item", type: "up", stagger: true },
      { selector: ".cta__band", type: "scale" },
      { selector: ".site-footer__grid > *", type: "up", stagger: true }
    ];

    var LIFT = ".hero__highlights > li, .sector, .compare__card, .metric, .segment, .module, .module-wide, .integration, .quote";
    document.querySelectorAll(LIFT).forEach(function (el) { el.classList.add("lift"); });

    var revealTargets = [];
    REVEAL_GROUPS.forEach(function (group) {
      var items = document.querySelectorAll(group.selector);
      items.forEach(function (el, index) {
        var step = window.innerWidth < 768 ? 50 : 90;
        var delay = group.stagger ? Math.min(index, 5) * step : 0;
        el.setAttribute("data-reveal", group.type === "up" ? "" : group.type);
        el.style.transitionDelay = delay + "ms";
        revealTargets.push(el);
      });
    });

    function finishReveal(el) {
      var done = false;
      function cleanup() {
        if (done) return;
        done = true;
        el.style.transitionDelay = "";
        el.removeAttribute("data-reveal");
        el.removeEventListener("transitionend", handler);
      }
      function handler(event) {
        if (event.target === el && event.propertyName === "transform") cleanup();
      }
      el.addEventListener("transitionend", handler);
      window.setTimeout(cleanup, 700 + (parseInt(el.style.transitionDelay, 10) || 0) + 150);
    }

    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        finishReveal(entry.target);
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });

    revealTargets.forEach(function (el) { revealObserver.observe(el); });

    var deviceObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        deviceObserver.unobserve(entry.target);
      });
    }, { threshold: 0.3 });
    document.querySelectorAll(".device").forEach(function (el) { deviceObserver.observe(el); });

    function animateNumber(el) {
      var original = el.textContent;
      var match = original.match(/(\d+(?:[.,]\d+)?)/);
      if (!match) return;
      var target = parseFloat(match[1].replace(",", "."));
      var prefix = original.slice(0, match.index);
      var suffix = original.slice(match.index + match[1].length);
      var duration = 1200;
      var start = null;

      el.style.display = "inline-block";
      el.style.minWidth = el.getBoundingClientRect().width + "px";

      function frame(time) {
        if (start === null) start = time;
        var progress = Math.min((time - start) / duration, 1);
        var eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = prefix + Math.round(target * eased) + suffix;
        if (progress < 1) {
          window.requestAnimationFrame(frame);
        } else {
          el.textContent = original;
        }
      }
      window.requestAnimationFrame(frame);
    }

    var counterObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        animateNumber(entry.target);
        counterObserver.unobserve(entry.target);
      });
    }, { threshold: 0.6 });
    document.querySelectorAll(".metric strong").forEach(function (el) { counterObserver.observe(el); });

    if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
      document.querySelectorAll(".feature__visual").forEach(function (visual) {
        var device = visual.querySelector(".device");
        if (!device) return;
        var frameId = null;

        visual.addEventListener("pointermove", function (event) {
          var rect = visual.getBoundingClientRect();
          var x = (event.clientX - rect.left) / rect.width - 0.5;
          var y = (event.clientY - rect.top) / rect.height - 0.5;
          if (frameId) window.cancelAnimationFrame(frameId);
          frameId = window.requestAnimationFrame(function () {
            device.style.transform =
              "perspective(900px) rotateY(" + (x * 10).toFixed(2) + "deg) rotateX(" + (-y * 8).toFixed(2) + "deg)";
          });
        });

        visual.addEventListener("pointerleave", function () {
          if (frameId) window.cancelAnimationFrame(frameId);
          device.style.transform = "";
        });
      });
    }

    var navLinks = Array.prototype.slice.call(document.querySelectorAll(".main-nav__list a[href^='#']"));
    var sections = navLinks
      .map(function (link) { return document.querySelector(link.getAttribute("href")); })
      .filter(Boolean);

    if (sections.length) {
      var sectionObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          var id = "#" + entry.target.id;
          navLinks.forEach(function (link) {
            var active = link.getAttribute("href") === id;
            link.classList.toggle("is-active", active);
            if (active) link.setAttribute("aria-current", "true");
            else link.removeAttribute("aria-current");
          });
        });
      }, { rootMargin: "-45% 0px -50% 0px" });
      sections.forEach(function (section) { sectionObserver.observe(section); });
    }
  });
})();
