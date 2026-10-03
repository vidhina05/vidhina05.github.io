/* Vidhina Singhal — portfolio interactions & motion system */
(function () {
  "use strict";
  var doc = document, root = doc.documentElement, body = doc.body;
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  /* ---------- Page entrance ---------- */
  body.classList.add("page-enter");
  function loaded() { requestAnimationFrame(function () { body.classList.add("is-loaded"); }); }
  if (doc.readyState === "complete") loaded(); else window.addEventListener("load", loaded);
  setTimeout(loaded, 1200); // never hold the page hostage to slow assets

  /* ---------- Page transitions (internal links) ---------- */
  var veil = doc.createElement("div"); veil.className = "page-veil"; veil.setAttribute("aria-hidden", "true"); body.appendChild(veil);
  doc.addEventListener("click", function (e) {
    var a = e.target.closest && e.target.closest("a[href]");
    if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
    if (a.target === "_blank" || a.hasAttribute("download")) return;
    var href = a.getAttribute("href");
    if (!href || href.charAt(0) === "#" || /^(mailto:|tel:|https?:)/i.test(href)) return;
    if (href.indexOf("#") > -1 && href.split("#")[0] === "") return;
    if (reduce || ("startViewTransition" in doc && CSS.supports && CSS.supports("view-transition-name: none"))) return; // native cross-doc transition handles it
    e.preventDefault();
    body.classList.add("is-leaving");
    setTimeout(function () { window.location.href = href; }, 320);
  });
  window.addEventListener("pageshow", function (e) { if (e.persisted) body.classList.remove("is-leaving"); });

  /* ---------- Scroll reveals ---------- */
  var revealEls = [].slice.call(doc.querySelectorAll(".reveal, .reveal-img, .line-mask.solo, [data-stagger]"));
  doc.querySelectorAll("[data-stagger]").forEach(function (group) {
    var step = parseFloat(group.getAttribute("data-stagger")) || 0.08;
    [].slice.call(group.children).forEach(function (child, i) {
      if (!child.classList.contains("reveal") && !child.classList.contains("reveal-img")) child.classList.add("reveal");
      child.style.setProperty("--delay", (i * step).toFixed(2) + "s");
      revealEls.push(child);
    });
  });
  if (reduce || !("IntersectionObserver" in window)) {
    revealEls.forEach(function (el) { el.classList.add("is-in"); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("is-in"); io.unobserve(en.target); }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    revealEls.forEach(function (el) { io.observe(el); });
    /* Safety net: reveal anything on screen even if the observer misses it
       (inline wrappers, Safari quirks, background tabs, bfcache restores). */
    var pending = true, ticking = false;
    function sweep() {
      ticking = false;
      if (!pending) return;
      var vh = window.innerHeight || root.clientHeight, left = 0;
      revealEls.forEach(function (el) {
        if (el.classList.contains("is-in")) return;
        var r = el.getBoundingClientRect();
        if ((!r.width && !r.height) && el.firstElementChild) r = el.firstElementChild.getBoundingClientRect();
        if (r.top < vh * 0.95 && r.bottom > 0) { el.classList.add("is-in"); io.unobserve(el); } else left++;
      });
      pending = left > 0;
    }
    function queue() { if (!ticking) { ticking = true; requestAnimationFrame(sweep); } }
    window.addEventListener("scroll", queue, { passive: true });
    window.addEventListener("resize", queue);
    window.addEventListener("load", queue);
    window.addEventListener("pageshow", queue);
    setTimeout(sweep, 1500);
  }

  /* ---------- Header state, progress, parallax (one rAF loop) ---------- */
  var nav = doc.querySelector(".site-nav, .cs-bar");
  var prog = doc.querySelector(".progress");
  var parallax = reduce ? [] : [].slice.call(doc.querySelectorAll("[data-parallax]"));
  var ticking = false;
  function onScroll() {
    var y = window.scrollY || window.pageYOffset;
    if (nav) nav.classList.toggle("is-scrolled", y > 40);
    if (prog) {
      var max = doc.documentElement.scrollHeight - window.innerHeight;
      prog.style.transform = "scaleX(" + (max > 0 ? Math.min(1, y / max) : 0) + ")";
    }
    if (parallax.length && window.innerWidth > 900) {
      var vh = window.innerHeight;
      parallax.forEach(function (el) {
        var r = el.getBoundingClientRect();
        if (r.bottom < -200 || r.top > vh + 200) return;
        var f = parseFloat(el.getAttribute("data-parallax")) || 0.08;
        var c = (r.top + r.height / 2 - vh / 2);
        el.style.transform = "translate3d(0," + (-c * f).toFixed(1) + "px,0)";
      });
    }
    ticking = false;
  }
  window.addEventListener("scroll", function () { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  window.addEventListener("resize", onScroll);
  onScroll();

  /* ---------- Active section in nav ---------- */
  var navLinks = [].slice.call(doc.querySelectorAll(".site-nav .links a[href^='#'], .cs-links a[href^='#']"));
  if (navLinks.length && "IntersectionObserver" in window) {
    var map = {};
    navLinks.forEach(function (a) { var id = a.getAttribute("href").slice(1); var s = doc.getElementById(id); if (s) map[id] = a; });
    var secObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting && map[en.target.id]) {
          navLinks.forEach(function (a) { a.classList.remove("is-active"); a.removeAttribute("aria-current"); });
          map[en.target.id].classList.add("is-active"); map[en.target.id].setAttribute("aria-current", "true");
        }
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    Object.keys(map).forEach(function (id) { secObs.observe(doc.getElementById(id)); });
  }

  /* ---------- Mobile menu ---------- */
  var menuBtn = doc.querySelector(".menu-btn"), menu = doc.getElementById("mobile-menu");
  function setMenu(open) {
    body.classList.toggle("nav-open", open);
    if (menuBtn) { menuBtn.setAttribute("aria-expanded", open ? "true" : "false"); menuBtn.setAttribute("aria-label", open ? "Close menu" : "Open menu"); }
    if (menu) {
      menu.setAttribute("aria-hidden", open ? "false" : "true");
      if (open) { var f = menu.querySelector("a"); if (f) setTimeout(function () { f.focus(); }, 120); }
    }
  }
  if (menuBtn && menu) {
    menuBtn.addEventListener("click", function () { setMenu(!body.classList.contains("nav-open")); });
    menu.addEventListener("click", function (e) { if (e.target.closest("a")) setMenu(false); });
    doc.addEventListener("keydown", function (e) {
      if (!body.classList.contains("nav-open")) return;
      if (e.key === "Escape") { setMenu(false); menuBtn.focus(); }
      if (e.key === "Tab") { // focus trap
        var items = [menuBtn].concat([].slice.call(menu.querySelectorAll("a")));
        var first = items[0], last = items[items.length - 1];
        if (e.shiftKey && doc.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && doc.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });
    window.addEventListener("resize", function () { if (window.innerWidth > 1180) setMenu(false); });
  }

  /* ---------- Whole-card click (keeps a single real link for a11y) ---------- */
  doc.querySelectorAll("[data-card-link]").forEach(function (card) {
    card.addEventListener("click", function (e) {
      if (e.target.closest("a")) return;
      var a = card.querySelector("a[href]"); if (a) a.click();
    });
  });

  /* ---------- Custom cursor (desktop only) ---------- */
  if (fine && !reduce) {
    var cur = doc.createElement("div"); cur.className = "cursor"; cur.setAttribute("aria-hidden", "true");
    cur.innerHTML = "<span>VIEW PROJECT</span>"; body.appendChild(cur);
    var label = cur.firstChild, tx = -100, ty = -100, cx = -100, cy = -100;
    doc.addEventListener("mousemove", function (e) { tx = e.clientX; ty = e.clientY; cur.classList.add("is-on"); });
    doc.addEventListener("mouseleave", function () { cur.classList.remove("is-on"); });
    (function loop() { cx += (tx - cx) * 0.22; cy += (ty - cy) * 0.22; cur.style.transform = "translate3d(" + cx + "px," + cy + "px,0)"; requestAnimationFrame(loop); })();
    doc.addEventListener("mouseover", function (e) {
      var v = e.target.closest("[data-cursor]");
      var l = e.target.closest("a, button, .zoomable");
      cur.classList.toggle("is-view", !!v);
      cur.classList.toggle("is-link", !v && !!l);
      if (v) label.textContent = v.getAttribute("data-cursor");
    });
  }

  /* ---------- Lightbox ---------- */
  var zoomables = [].slice.call(doc.querySelectorAll(".zoomable"));
  if (zoomables.length) {
    var lb = doc.createElement("div");
    lb.className = "lightbox"; lb.setAttribute("role", "dialog"); lb.setAttribute("aria-modal", "true"); lb.setAttribute("aria-label", "Image viewer"); lb.setAttribute("aria-hidden", "true");
    lb.innerHTML = '<button class="lb-close" type="button" aria-label="Close image viewer"><span class="mi" aria-hidden="true">close</span></button><figure><img alt=""><figcaption></figcaption></figure>';
    body.appendChild(lb);
    var lbImg = lb.querySelector("img"), lbCap = lb.querySelector("figcaption"), lbClose = lb.querySelector(".lb-close"), lastFocus = null;
    function openLb(el) {
      var img = el.tagName === "IMG" ? el : el.querySelector("img");
      if (!img) return;
      lastFocus = doc.activeElement;
      lbImg.src = el.getAttribute("data-full") || img.currentSrc || img.src;
      lbImg.alt = img.alt || "";
      lbCap.textContent = el.getAttribute("data-caption") || img.alt || "";
      lb.classList.add("is-open"); lb.setAttribute("aria-hidden", "false"); body.style.overflow = "hidden";
      setTimeout(function () { lbClose.focus(); }, 50);
    }
    function closeLb() {
      lb.classList.remove("is-open"); lb.setAttribute("aria-hidden", "true"); body.style.overflow = "";
      if (lastFocus) lastFocus.focus();
    }
    zoomables.forEach(function (el) {
      if (!el.hasAttribute("tabindex") && el.tagName !== "BUTTON" && el.tagName !== "A") { el.setAttribute("tabindex", "0"); el.setAttribute("role", "button"); }
      if (!el.hasAttribute("aria-label")) { var im = el.tagName === "IMG" ? el : el.querySelector("img"); el.setAttribute("aria-label", "Enlarge image" + (im && im.alt ? ": " + im.alt : "")); }
      el.addEventListener("click", function (e) { e.preventDefault(); openLb(el); });
      el.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openLb(el); } });
    });
    lbClose.addEventListener("click", closeLb);
    lb.addEventListener("click", function (e) { if (e.target === lb || e.target.tagName === "FIGURE") closeLb(); });
    doc.addEventListener("keydown", function (e) {
      if (!lb.classList.contains("is-open")) return;
      if (e.key === "Escape") closeLb();
      if (e.key === "Tab") { e.preventDefault(); lbClose.focus(); }
    });
  }

  /* ---------- Smooth anchor scroll w/ focus management ---------- */
  doc.addEventListener("click", function (e) {
    var a = e.target.closest && e.target.closest("a[href^='#']");
    if (!a) return;
    var id = a.getAttribute("href").slice(1); if (!id) return;
    var t = doc.getElementById(id); if (!t) return;
    e.preventDefault();
    t.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
    if (!t.hasAttribute("tabindex")) t.setAttribute("tabindex", "-1");
    t.focus({ preventScroll: true });
    history.replaceState(null, "", "#" + id);
  });

  /* ---------- Count-up numbers ---------- */
  var counters = [].slice.call(doc.querySelectorAll("[data-count]"));
  if (counters.length && !reduce && "IntersectionObserver" in window) {
    var co = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var el = en.target, end = parseFloat(el.getAttribute("data-count")), suf = el.getAttribute("data-suffix") || "", t0 = null;
        co.unobserve(el);
        (function step(ts) { if (!t0) t0 = ts; var p = Math.min(1, (ts - t0) / 1200); var v = Math.round(end * (1 - Math.pow(1 - p, 3))); el.textContent = v + suf; if (p < 1) requestAnimationFrame(step); })(performance.now());
      });
    }, { threshold: 0.6 });
    counters.forEach(function (c) { co.observe(c); });
  }

  /* year */
  doc.querySelectorAll("[data-year]").forEach(function (el) { el.textContent = new Date().getFullYear(); });
})();
