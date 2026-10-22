/* =========================================================
   GRAFIX CLUB – shared behaviour for every page
   (links, header, open/closed status, motion toggle, search
   suggestions, reveal-on-scroll). Needs config.js + catalogue.js.
   ========================================================= */
(function () {
  "use strict";
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const waUrl = msg => "https://wa.me/" + CONFIG.whatsapp + "?text=" + encodeURIComponent(msg || CONFIG.defaultMsg);
  /* "Write a Google review": with CONFIG.googlePlaceId set, the button opens Google's review box for the shop directly
     (the customer only picks stars and types). Otherwise it uses CONFIG.links.googleReview (e.g. a g.page/r/.../review link). */
  const PLACE_ID = /^ChIJ[A-Za-z0-9_-]{15,}$/;
  const social = k => (k === "googleReview" && PLACE_ID.test(String(CONFIG.googlePlaceId || ""))
    ? "https://search.google.com/local/writereview?placeid=" + encodeURIComponent(CONFIG.googlePlaceId)
    : CONFIG.links[k] || CONFIG.fallback[k]);
  const safeStore = {
    get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); return true; } catch (e) { return false; } },
    del(k) { try { localStorage.removeItem(k); } catch (e) { /* storage unavailable */ } }
  };
  document.documentElement.classList.add("js");

  /* ---------- polite announcements for screen readers ---------- */
  let announceTimer = 0;
  function announce(msg) {
    const box = $("#liveStatus"); if (!box) return;
    clearTimeout(announceTimer);
    box.textContent = "";
    announceTimer = setTimeout(() => { box.textContent = msg; }, 60);
  }

  /* ---------- link wiring ---------- */
  $$("[data-wa]").forEach(a => { a.href = waUrl(a.dataset.msg); });
  $$("[data-link]").forEach(a => { a.href = social(a.dataset.link); });
  $$(".cta-email").forEach(a => { a.href = "mailto:" + CONFIG.email; });

  /* ---------- social icons ---------- */
  const SOCIALS = [
    ["WhatsApp", "i-wa", () => waUrl(), "#25d366"],
    ["Instagram", "i-ig", () => social("instagram"), "#ff2e93"],
    ["Facebook", "i-fb", () => social("facebook"), "#4c8dff"],
    ["Google reviews", "i-g", () => CONFIG.links.google, "#ffc933"],
    ["Justdial", "i-jd", () => CONFIG.links.justdial, "#ff8a1f"],
    ["Call", "i-phone", () => "tel:" + CONFIG.phone, "#27e6ff"]
  ];
  ["socialsVisit", "socialsFoot"].forEach(id => {
    const box = document.getElementById(id); if (!box) return;
    SOCIALS.forEach(([name, icon, url, color]) => {
      const a = document.createElement("a");
      a.className = "soc"; a.style.setProperty("--c", color); a.href = url();
      if (name !== "Call") { a.target = "_blank"; a.rel = "noopener"; }
      a.setAttribute("aria-label", name + (name !== "Call" ? " (opens in a new tab)" : "")); a.title = name;
      a.innerHTML = '<svg class="ic" aria-hidden="true"><use href="#' + icon + '"/></svg>';
      box.appendChild(a);
    });
  });

  /* ---------- open / closed (India time) ---------- */
  (function openStatus() {
    const parts = new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Kolkata", hour: "numeric", minute: "numeric", hour12: false }).formatToParts(new Date());
    const h = +parts.find(p => p.type === "hour").value % 24, m = +parts.find(p => p.type === "minute").value;
    const mins = h * 60 + m, open = mins >= 600 && mins < 1200;
    const cls = open ? "status-open" : "status-closed";
    const top = $("#openStatus");
    if (top) { top.lastChild.textContent = open ? "Open now · closes 8 PM" : "Closed now · opens 10 AM"; top.classList.add(cls); }
    const s2 = $("#openStatus2");
    if (s2) { s2.textContent = open ? "● Open now" : "● Closed now"; s2.classList.add(cls); }
  })();

  /* ---------- header: scroll state, progress bar, mobile menu, active link ---------- */
  (function header() {
    const hd = $("#header"), bar = $("#progress"), nav = $("#nav"), burger = $("#burger");
    if (!hd) return;
    const setH = () => document.documentElement.style.setProperty("--hh", hd.offsetHeight + "px");
    setH(); addEventListener("resize", setH);
    const onScroll = () => {
      hd.classList.toggle("scrolled", scrollY > 40);
      if (bar) { const max = document.documentElement.scrollHeight - innerHeight; bar.style.width = (max > 0 ? scrollY / max * 100 : 0) + "%"; }
    };
    addEventListener("scroll", onScroll, { passive: true }); onScroll();
    const toggle = open => {
      nav.classList.toggle("open", open); burger.setAttribute("aria-expanded", String(open));
      burger.setAttribute("aria-label", open ? "Close menu" : "Open menu"); setH();
    };
    burger.addEventListener("click", () => toggle(!nav.classList.contains("open")));
    nav.addEventListener("click", e => { if (e.target.closest("a")) toggle(false); });
    document.addEventListener("keydown", e => {
      if (e.key !== "Escape" || !nav.classList.contains("open")) return;
      const inside = nav.contains(document.activeElement); toggle(false); if (inside) burger.focus();
    });
    const links = $$('.nav a[href^="#"]');
    const secs = links.map(a => $(a.getAttribute("href"))).filter(Boolean);
    if (secs.length && "IntersectionObserver" in window) {
      const io = new IntersectionObserver(es => es.forEach(en => {
        if (en.isIntersecting) links.forEach(l => { const on = l.getAttribute("href") === "#" + en.target.id; l.classList.toggle("active", on); if (on) l.setAttribute("aria-current", "location"); else l.removeAttribute("aria-current"); });
      }), { rootMargin: "-45% 0px -50% 0px" });
      secs.forEach(s => io.observe(s));
    }
  })();

  /* ---------- pause animations (WCAG 2.2.2) ---------- */
  (function motionToggle() {
    const btn = $("#motionToggle"); if (!btn) return;
    if (reduce) { btn.hidden = true; return; }      // the OS setting already turns motion off in CSS
    const set = off => {
      document.documentElement.classList.toggle("motion-off", off);
      btn.setAttribute("aria-pressed", String(off));
      btn.querySelector("span").textContent = off ? "Play animations" : "Pause animations";
    };
    set(safeStore.get("gc.motion") === "off");
    btn.addEventListener("click", () => {
      const off = !document.documentElement.classList.contains("motion-off");
      set(off); if (off) safeStore.set("gc.motion", "off"); else safeStore.del("gc.motion");
      announce(off ? "Animations paused" : "Animations playing");
    });
  })();

  /* ---------- reveal on scroll ---------- */
  (function reveal() {
    const els = $$(".reveal");
    if (reduce || !("IntersectionObserver" in window)) { els.forEach(e => e.classList.add("in")); return; }
    const io = new IntersectionObserver(es => es.forEach(en => {
      if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
    }), { threshold: .12, rootMargin: "0px 0px -6% 0px" });
    els.forEach(e => io.observe(e));
    // Safety net: anything still hidden after a few seconds is shown (e.g. an observer that never fires).
    setTimeout(() => els.forEach(e => e.classList.add("in")), 6000);
  })();

  /* =======================================================
     Search suggestions: ARIA 1.2 combobox with a listbox popup.
     attachSuggest(input, list, opts) -> { close }
     ======================================================= */
  function attachSuggest(input, list, opts) {
    opts = opts || {};
    let items = [], active = -1, isOpen = false, announceT = 0;
    const optId = i => list.id + "-opt-" + i;
    const go = href => (opts.navigate ? opts.navigate(href) : location.assign(href));
    function setActive(i) {
      const prev = list.children[active]; if (prev) prev.setAttribute("aria-selected", "false");
      active = i;
      const cur = list.children[i];
      if (cur) { cur.setAttribute("aria-selected", "true"); input.setAttribute("aria-activedescendant", cur.id); cur.scrollIntoView({ block: "nearest" }); }
      else input.removeAttribute("aria-activedescendant");
    }
    function close() {
      if (!isOpen) return;
      isOpen = false; list.hidden = true; input.setAttribute("aria-expanded", "false"); setActive(-1);
    }
    function open() {
      items = GCCatalogue.suggest(input.value, 6);
      list.textContent = "";
      items.forEach((it, i) => {
        const li = document.createElement("li");
        li.id = optId(i); li.setAttribute("role", "option"); li.setAttribute("aria-selected", "false");
        li.className = "sg sg-" + it.type;
        const main = document.createElement("span"); main.className = "sg-main"; main.textContent = it.label;
        li.appendChild(main);
        if (it.sub) { const sub = document.createElement("span"); sub.className = "sg-sub"; sub.textContent = it.sub; li.appendChild(sub); }
        li.addEventListener("mousedown", e => e.preventDefault());   // keep focus in the input
        li.addEventListener("click", () => { close(); go(it.href); });
        list.appendChild(li);
      });
      isOpen = true; list.hidden = false; input.setAttribute("aria-expanded", "true"); setActive(-1);
      clearTimeout(announceT);
      announceT = setTimeout(() => announce(items.length + (items.length === 1 ? " suggestion" : " suggestions") + " available. Use the up and down arrow keys, then Enter."), 350);
    }
    input.setAttribute("role", "combobox");
    input.setAttribute("aria-autocomplete", "list");
    input.setAttribute("aria-expanded", "false");
    input.setAttribute("aria-controls", list.id);
    input.setAttribute("autocomplete", "off");
    list.setAttribute("role", "listbox"); list.hidden = true;
    input.addEventListener("input", () => { if (input.value.trim()) open(); else close(); });
    input.addEventListener("keydown", e => {
      if (e.key === "ArrowDown") { e.preventDefault(); if (!isOpen) open(); setActive(active + 1 >= items.length ? 0 : active + 1); }
      else if (e.key === "ArrowUp") { e.preventDefault(); if (!isOpen) open(); setActive(active <= 0 ? items.length - 1 : active - 1); }
      else if (e.key === "Enter" && isOpen && active >= 0) { e.preventDefault(); const it = items[active]; close(); go(it.href); }
      else if (e.key === "Escape") { if (isOpen) { e.preventDefault(); e.stopPropagation(); close(); } else if (input.value) { input.value = ""; } }
      else if (e.key === "Tab") close();
    });
    input.addEventListener("blur", () => setTimeout(() => { if (document.activeElement !== input) close(); }, 120));
    return { close };
  }

  /* ---------- header search panel ---------- */
  (function headerSearch() {
    const toggle = $("#searchToggle"), panel = $("#searchPanel"), form = $("#headerSearchForm"), input = $("#headerSearch"), list = $("#headerSuggest");
    if (!toggle) return;
    // On the results page the big search box is already on screen: the header button just jumps to it.
    if ($("#pageSearch")) { toggle.addEventListener("click", () => { $("#pageSearch").focus(); $("#pageSearch").scrollIntoView({ block: "center" }); }); return; }
    if (!panel) return;
    const sg = attachSuggest(input, list);
    const setOpen = open => {
      panel.hidden = !open; toggle.setAttribute("aria-expanded", String(open));
      document.documentElement.style.setProperty("--hh", $("#header").offsetHeight + "px");
      if (open) input.focus(); else sg.close();
    };
    toggle.addEventListener("click", () => setOpen(panel.hidden));
    panel.addEventListener("keydown", e => { if (e.key === "Escape" && !panel.hidden) { setOpen(false); toggle.focus(); } });
    form.addEventListener("submit", e => { e.preventDefault(); sg.close(); location.assign(GCCatalogue.searchHref({ q: GCCatalogue.cleanQuery(input.value) })); });
  })();

  const yr = $("#yr"); if (yr) yr.textContent = new Date().getFullYear();

  window.GC = { $, $$, reduce, waUrl, social, announce, attachSuggest, safeStore };
})();
