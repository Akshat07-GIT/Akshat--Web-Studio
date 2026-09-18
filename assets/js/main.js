/* ============================================================
   Akshat Web Studio — site interactions
   Vanilla JS, no dependencies
   ============================================================ */
(function () {
  "use strict";

  var doc = document;
  var root = doc.documentElement;
  root.classList.add("js");

  var prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Loader ---------- */
  function initLoader() {
    var loader = doc.getElementById("loader");
    if (!loader) return;
    var bar = loader.querySelector(".loader-bar span");
    var pct = loader.querySelector("[data-loader-pct]");
    var progress = 0;
    var done = false;

    var timer = window.setInterval(function () {
      progress = Math.min(progress + Math.random() * 18 + 6, 96);
      if (bar) bar.style.width = progress + "%";
      if (pct) pct.textContent = Math.round(progress) + "%";
    }, 160);

    function finish() {
      if (done) return;
      done = true;
      window.clearInterval(timer);
      if (bar) bar.style.width = "100%";
      if (pct) pct.textContent = "100%";
      window.setTimeout(function () {
        loader.classList.add("is-done");
        doc.body.classList.add("is-ready");
        window.setTimeout(function () {
          if (loader && loader.parentNode) loader.parentNode.removeChild(loader);
        }, 800);
      }, prefersReduced ? 0 : 420);
    }

    if (doc.readyState === "complete") {
      finish();
    } else {
      window.addEventListener("load", finish, { once: true });
      window.setTimeout(finish, 2600);
    }
  }

  /* ---------- Header scroll state + scroll progress ---------- */
  function initScrollUI() {
    var header = doc.getElementById("siteHeader");
    var bar = doc.querySelector(".scroll-progress");
    var ticking = false;

    function update() {
      var y = window.scrollY || window.pageYOffset;
      if (header) header.classList.toggle("is-scrolled", y > 24);
      if (bar) {
        var h = doc.documentElement.scrollHeight - window.innerHeight;
        bar.style.width = (h > 0 ? (y / h) * 100 : 0) + "%";
      }
      ticking = false;
    }

    window.addEventListener("scroll", function () {
      if (!ticking) {
        ticking = true;
        window.requestAnimationFrame(update);
      }
    }, { passive: true });
    update();
  }

  /* ---------- Mobile navigation ---------- */
  function initNav() {
    var toggle = doc.getElementById("navToggle");
    var nav = doc.getElementById("primaryNav");
    if (!toggle || !nav) return;

    function setOpen(open) {
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
      nav.classList.toggle("is-open", open);
      doc.body.classList.toggle("nav-open", open);
    }

    toggle.addEventListener("click", function () {
      setOpen(toggle.getAttribute("aria-expanded") !== "true");
    });

    nav.addEventListener("click", function (e) {
      if (e.target.closest("a")) setOpen(false);
    });

    doc.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && toggle.getAttribute("aria-expanded") === "true") {
        setOpen(false);
        toggle.focus();
      }
    });

    window.addEventListener("resize", function () {
      if (window.innerWidth > 900 && nav.classList.contains("is-open")) setOpen(false);
    });
  }

  /* ---------- Smooth anchor scrolling ---------- */
  function initSmoothScroll() {
    doc.addEventListener("click", function (e) {
      var link = e.target.closest('a[href^="#"]');
      if (!link) return;
      var id = link.getAttribute("href");
      if (!id || id === "#" || id.length < 2) return;
      var target = doc.getElementById(id.slice(1));
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: prefersReduced ? "auto" : "smooth", block: "start" });
      if (history.replaceState) history.replaceState(null, "", id);
    });
  }

  /* ---------- Reveal on scroll ---------- */
  function initReveal() {
    var items = doc.querySelectorAll("[data-reveal]");
    if (!items.length) return;

    if (prefersReduced || !("IntersectionObserver" in window)) {
      items.forEach(function (el) { el.classList.add("is-visible"); });
      return;
    }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -60px 0px" });

    items.forEach(function (el) { io.observe(el); });
  }

  /* ---------- Animated counters ---------- */
  function initCounters() {
    var counters = doc.querySelectorAll("[data-count]");
    if (!counters.length) return;

    function run(el) {
      var target = parseFloat(el.getAttribute("data-count"));
      var suffix = el.getAttribute("data-suffix") || "";
      var decimals = (el.getAttribute("data-decimals") | 0);
      if (prefersReduced) {
        el.textContent = target.toFixed(decimals) + suffix;
        return;
      }
      var start = null;
      var duration = 1600;
      function frame(ts) {
        if (start === null) start = ts;
        var p = Math.min((ts - start) / duration, 1);
        var eased = 1 - Math.pow(1 - p, 3);
        el.textContent = (target * eased).toFixed(decimals) + suffix;
        if (p < 1) window.requestAnimationFrame(frame);
      }
      window.requestAnimationFrame(frame);
    }

    if (!("IntersectionObserver" in window)) {
      counters.forEach(run);
      return;
    }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          run(entry.target);
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });

    counters.forEach(function (el) { io.observe(el); });
  }

  /* ---------- Card spotlight ---------- */
  function initSpotlight() {
    if (prefersReduced || window.matchMedia("(pointer: coarse)").matches) return;
    doc.querySelectorAll(".card, .price-card").forEach(function (card) {
      card.addEventListener("pointermove", function (e) {
        var r = card.getBoundingClientRect();
        card.style.setProperty("--mx", (e.clientX - r.left) + "px");
        card.style.setProperty("--my", (e.clientY - r.top) + "px");
      });
    });
  }

  /* ---------- Project filters ---------- */
  function initFilters() {
    var buttons = doc.querySelectorAll("[data-filter]");
    var cards = doc.querySelectorAll("[data-category]");
    if (!buttons.length || !cards.length) return;

    buttons.forEach(function (btn) {
      btn.addEventListener("click", function () {
        var filter = btn.getAttribute("data-filter");
        buttons.forEach(function (b) {
          var active = b === btn;
          b.classList.toggle("is-active", active);
          b.setAttribute("aria-pressed", active ? "true" : "false");
        });
        cards.forEach(function (card) {
          var cats = (card.getAttribute("data-category") || "").split(/\s+/);
          var show = filter === "all" || cats.indexOf(filter) !== -1;
          card.classList.toggle("is-hidden", !show);
        });
      });
    });
  }

  /* ---------- FAQ accordion ---------- */
  function initFaq() {
    doc.querySelectorAll(".faq-item").forEach(function (item) {
      var q = item.querySelector(".faq-q");
      var a = item.querySelector(".faq-a");
      if (!q || !a) return;
      q.setAttribute("aria-expanded", "false");
      q.addEventListener("click", function () {
        var open = item.classList.contains("is-open");
        doc.querySelectorAll(".faq-item.is-open").forEach(function (other) {
          if (other !== item) {
            other.classList.remove("is-open");
            var oq = other.querySelector(".faq-q");
            var oa = other.querySelector(".faq-a");
            if (oq) oq.setAttribute("aria-expanded", "false");
            if (oa) oa.style.maxHeight = "0px";
          }
        });
        item.classList.toggle("is-open", !open);
        q.setAttribute("aria-expanded", open ? "false" : "true");
        a.style.maxHeight = open ? "0px" : a.scrollHeight + "px";
      });
    });

    window.addEventListener("resize", function () {
      doc.querySelectorAll(".faq-item.is-open .faq-a").forEach(function (a) {
        a.style.maxHeight = a.scrollHeight + "px";
      });
    });
  }

  /* ---------- Active nav link ---------- */
  function initActiveNav() {
    var here = window.location.pathname.split("/").pop() || "index.html";
    var current = here.indexOf("project-") === 0 ? "projects.html" : here;
    doc.querySelectorAll(".nav-list a").forEach(function (a) {
      var href = a.getAttribute("href") || "";
      if (href === current) a.setAttribute("aria-current", "page");
    });
    if (here === "contact.html") {
      var cta = doc.querySelector(".nav-cta");
      if (cta) cta.setAttribute("aria-current", "page");
    }
  }

  /* ---------- Contact package prefill ---------- */
  function initContactPackage() {
    if (typeof URLSearchParams === "undefined") return;
    var pkg = new URLSearchParams(window.location.search).get("package");
    if (!pkg) return;
    var labels = {
      basic: "Basic Website (999)",
      professional: "Professional Website (1,499)",
      premium: "Premium Website (2,999)",
      app: "App Package (from 3,999)"
    };
    var label = labels[pkg];
    if (!label) return;
    var subject = "Project enquiry: " + label;
    var body = "Hi Akshat,\n\nI'm interested in the " + label + " package.\n\nProject details:\n";
    doc.querySelectorAll('a[href^="mailto:akshatwebstudio@gmail.com"]').forEach(function (a) {
      var base = a.getAttribute("href").split("?")[0];
      a.setAttribute("href", base + "?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(body));
    });
  }

  /* ---------- Footer year ---------- */
  function initYear() {
    doc.querySelectorAll("[data-year]").forEach(function (el) {
      el.textContent = new Date().getFullYear();
    });
  }

  /* ---------- Boot ---------- */
  function boot() {
    initLoader();
    initScrollUI();
    initNav();
    initSmoothScroll();
    initReveal();
    initCounters();
    initSpotlight();
    initFilters();
    initFaq();
    initActiveNav();
    initContactPackage();
    initYear();
  }

  if (doc.readyState === "loading") {
    doc.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
