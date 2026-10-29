/* =========================================================
   GRAFIX CLUB – home page behaviour
   (price tabs, gallery lightbox, counters, pointer effects).
   Shared behaviour lives in common.js, the neon designer on
   custom-neon-sign.html (studio.js), site settings in config.js.
   ========================================================= */
(function () {
  "use strict";
  /* design links shared before the designer had its own page (index.html?design=... or ?preset=...) open the designer */
  (function oldStudioLinks() {
    const sp = new URLSearchParams(location.search);
    if (sp.has("design") || sp.has("preset")) location.replace("custom-neon-sign.html" + location.search);
  })();
  const { $, $$, reduce } = GC;
  const motionOff = () => reduce || document.documentElement.classList.contains("motion-off");

  /* ---------- price tabs: the lists are real HTML; this only adds tab behaviour ---------- */
  (function priceTabs() {
    const bar = $("#priceTabs"), panels = $$(".price-panel");
    if (!bar || !panels.length) return;
    bar.textContent = "";
    const tabs = panels.map((p, i) => {
      const b = document.createElement("button");
      b.type = "button"; b.className = "tab"; b.setAttribute("role", "tab");
      b.id = "tab-" + p.dataset.slug; b.setAttribute("aria-controls", p.id);
      b.textContent = p.dataset.name; b.dataset.i = i;
      p.setAttribute("role", "tabpanel"); p.setAttribute("aria-labelledby", b.id); p.tabIndex = 0;
      bar.appendChild(b); return b;
    });
    bar.hidden = false;
    const select = (i, focus) => {
      tabs.forEach((t, j) => { const on = i === j; t.setAttribute("aria-selected", String(on)); t.tabIndex = on ? 0 : -1; panels[j].hidden = !on; });
      if (focus) tabs[i].focus();
    };
    bar.addEventListener("click", e => { const b = e.target.closest(".tab"); if (b) select(+b.dataset.i); });
    bar.addEventListener("keydown", e => {
      const cur = tabs.findIndex(t => t.getAttribute("aria-selected") === "true");
      let n = -1;
      if (e.key === "ArrowRight") n = (cur + 1) % tabs.length;
      else if (e.key === "ArrowLeft") n = (cur - 1 + tabs.length) % tabs.length;
      else if (e.key === "Home") n = 0;
      else if (e.key === "End") n = tabs.length - 1;
      if (n >= 0) { e.preventDefault(); select(n, true); }
    });
    select(0);
  })();

  /* ---------- gallery lightbox (focus is trapped and restored) ---------- */
  (function lightbox() {
    const items = $$(".g-item"), lb = $("#lightbox");
    if (!items.length || !lb) return;
    const img = $("#lbImg"), cap = $("#lbCap"), closeBtn = $("#lbClose"), prev = $("#lbPrev"), next = $("#lbNext");
    const background = $$("body > :not(#lightbox):not(script):not(#liveStatus)");
    let cur = 0, last = null;
    const show = i => {
      cur = (i + items.length) % items.length;
      img.src = items[cur].dataset.src; img.alt = items[cur].dataset.alt; cap.textContent = items[cur].dataset.alt;
      lb.setAttribute("aria-label", "Photo " + (cur + 1) + " of " + items.length);
    };
    const open = i => {
      last = document.activeElement; show(i); lb.hidden = false; document.body.style.overflow = "hidden";
      background.forEach(n => n.setAttribute("inert", ""));
      closeBtn.focus();
    };
    const close = () => {
      lb.hidden = true; document.body.style.overflow = ""; background.forEach(n => n.removeAttribute("inert"));
      img.removeAttribute("src"); if (last) last.focus();
    };
    items.forEach((b, i) => b.addEventListener("click", () => open(i)));
    closeBtn.addEventListener("click", close);
    prev.addEventListener("click", () => show(cur - 1));
    next.addEventListener("click", () => show(cur + 1));
    lb.addEventListener("click", e => { if (e.target === lb) close(); });
    document.addEventListener("keydown", e => {
      if (lb.hidden) return;
      if (e.key === "Escape") { e.preventDefault(); close(); }
      else if (e.key === "ArrowLeft") show(cur - 1);
      else if (e.key === "ArrowRight") show(cur + 1);
      else if (e.key === "Tab") {
        const f = [closeBtn, prev, next], i = f.indexOf(document.activeElement);
        if (i === -1) { e.preventDefault(); closeBtn.focus(); }
        else if (e.shiftKey && i === 0) { e.preventDefault(); f[f.length - 1].focus(); }
        else if (!e.shiftKey && i === f.length - 1) { e.preventDefault(); f[0].focus(); }
      }
    });
    let sx = 0;
    lb.addEventListener("touchstart", e => { sx = e.touches[0].clientX; }, { passive: true });
    lb.addEventListener("touchend", e => { const d = e.changedTouches[0].clientX - sx; if (Math.abs(d) > 50) show(cur + (d < 0 ? 1 : -1)); });
  })();

  /* ---------- counters: the real numbers are in the HTML; this only animates them ---------- */
  (function counters() {
    const els = $$("[data-count]");
    if (!els.length || reduce || !("IntersectionObserver" in window)) return;
    const run = el => {
      const to = +el.dataset.count, dec = +(el.dataset.dec || 0), suf = el.dataset.suffix || "", plain = el.dataset.plain;
      const final = (plain ? to : to.toFixed(dec)) + suf;
      if (motionOff()) { el.textContent = final; return; }
      const t0 = performance.now(), dur = 1400;
      const tick = t => {
        const p = Math.min(1, (t - t0) / dur), v = to * (1 - Math.pow(1 - p, 3));
        el.textContent = p < 1 ? (plain ? Math.round(v) : v.toFixed(dec)) + suf : final;
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    };
    const io = new IntersectionObserver(es => es.forEach(en => { if (en.isIntersecting) { run(en.target); io.unobserve(en.target); } }), { threshold: .6 });
    els.forEach(e => io.observe(e));
  })();

  /* ---------- pointer effects: card spotlight + tilt, cursor glow ---------- */
  (function pointer() {
    if (reduce || !matchMedia("(hover:hover) and (pointer:fine)").matches) return;
    const glow = $("#cursorGlow");
    addEventListener("pointermove", e => {
      if (motionOff()) return;
      document.body.classList.add("has-mouse");
      glow.style.transform = "translate(" + e.clientX + "px," + e.clientY + "px)";
    }, { passive: true });
    $$(".tilt").forEach(el => {
      el.addEventListener("pointermove", e => {
        if (motionOff()) return;
        const r = el.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
        el.style.setProperty("--mx", x * 100 + "%"); el.style.setProperty("--my", y * 100 + "%");
        if (el.id === "heroCard") return;
        el.style.transform = "perspective(900px) rotateX(" + (.5 - y) * 6 + "deg) rotateY(" + (x - .5) * 8 + "deg) translateY(-4px)";
      });
      el.addEventListener("pointerleave", () => { if (el.id !== "heroCard") el.style.transform = ""; });
    });
  })();

  /* ---------- neon flicker on the hero heading ---------- */
  if (!reduce) setTimeout(() => $$("[data-flicker]").forEach((e, i) => { e.style.animationDelay = (i * .9) + "s"; e.classList.add("flick"); }), 1600);

  /* ---------- map: if the page's security policy blocks the Google frame, show the address card instead of an empty box ---------- */
  (function mapFallback() {
    const box = $("#mapBox"); if (!box) return;
    document.addEventListener("securitypolicyviolation", e => { if (/frame/.test(e.effectiveDirective || e.violatedDirective || "")) box.classList.add("no-frame"); });
  })();

  const yr = $("#yr"); if (yr) yr.textContent = new Date().getFullYear();
})();
