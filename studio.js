/* =========================================================
   GRAFIX CLUB – Neon Studio (custom neon sign designer, custom-neon-sign.html)
   Needs: config.js, neon-model.js, common.js (catalogue.js optional).
   The customer types text, picks a font and a colour; everything else
   (size, mounting) is confirmed by the shop on the mock-up.
   The neon is always fitted into the same area of the preview and the
   tube and glow are drawn at a fixed on-screen size, so changing the
   font never changes how big the light looks.
   Nothing typed here leaves the browser until the customer taps
   WhatsApp / e-mail / Share / Download.
   ========================================================= */
(function () {
  "use strict";
  const root = document.getElementById("studioApp");
  if (!root || typeof GCNeon === "undefined") return;
  const N = GCNeon, { $, announce, waUrl, safeStore } = GC;
  const SVGNS = "http://www.w3.org/2000/svg";
  const RATES = { neonRatePerSqFt: CONFIG.neonRatePerSqFt, neonBackboardRatePerSqFt: CONFIG.neonBackboardRatePerSqFt, neonMinPrice: CONFIG.neonMinPrice };
  const LS_DRAFT = "gc.studio.draft", LS_SAVED = "gc.studio.saved", MAX_SAVED = 6;
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const el = id => document.getElementById(id);

  /* ---------------- form markup ---------------- */
  const radios = (name, opts) => opts.map((o, i) =>
    '<label class="ochip"><input type="radio" name="' + name + '" value="' + o.key + '"' + (i === 0 ? " checked" : "") + '><span class="chip-body"><span class="chip-t">' + esc(o.label) + "</span>" + (o.hint ? '<small class="chip-h">' + esc(o.hint) + "</small>" : "") + "</span></label>").join("");
  const fontButtonsHtml = () => '<div class="font-grid">' + N.FONTS.map((ft, i) =>
    '<label class="fbtn"><input type="radio" name="font" value="' + ft.key + '"' + (i === 0 ? " checked" : "") + '><span class="fbtn-t' + (ft.thin ? " thin" : "") + '" style="font-family:' + ft.css + (ft.bs ? ";font-size:" + (1.3 * ft.bs).toFixed(2) + "rem" : "") + '">' + esc(ft.label) + "</span></label>").join("") + "</div>";
  const head = (id, title, nameId) => '<div class="cfg-head"><h3 id="' + id + '">' + title + "</h3>" + (nameId ? '<b class="sel-name" id="' + nameId + '"></b>' : "") + "</div>";

  const form = $("#studioForm");
  form.innerHTML =
    '<div class="field cfg-sec">' + head("h-text", "Type Your Text") +
      '<div class="field-row"><label for="f-text" class="sr-only">Your sign text</label><span class="hint" id="h-text-hint">Press Enter for a new line. Up to ' + N.LIMITS.maxLines + " lines, " + N.LIMITS.line + ' letters each.</span><span class="count" id="c-text" aria-hidden="true"></span></div>' +
      '<textarea id="f-text" name="text" rows="3" maxlength="80" autocomplete="off" spellcheck="false" aria-describedby="h-text-hint m-text"></textarea>' +
      '<p class="msg" id="m-text" aria-live="polite"></p>' +
    "</div>" +
    '<fieldset class="field cfg-sec" aria-labelledby="h-font"><legend class="sr-only">Pick Your Font</legend>' + head("h-font", "Pick Your Font", "fontName") + fontButtonsHtml() + "</fieldset>" +
    '<fieldset class="field cfg-sec" aria-labelledby="h-colour"><legend class="sr-only">Select Your Colour</legend>' + head("h-colour", "Select Your Colour", "colorName") +
      '<div class="swatches">' + N.COLORS.map((c, i) =>
        '<label class="swatch" style="--c:' + c.hex + '"><input type="radio" name="color" value="' + c.key + '"' + (i === 1 ? " checked" : "") + '><span class="sw-dot" aria-hidden="true"></span><span class="sr-only">' + esc(c.label) + "</span></label>").join("") + "</div>" +
    "</fieldset>" +
    '<div class="buy-box">' +
      '<p class="buy-price"><span id="buyPrefix"></span> <b id="buyTotal">–</b> <small class="design-id">Design ID <b id="designId">–</b></small></p>' +
      '<a class="btn btn-wa btn-lg buy-wa" id="sendWaTop" href="#studio-form-start" target="_blank" rel="noopener"><svg class="ic" aria-hidden="true"><use href="#i-wa"/></svg>Order on WhatsApp<span class="sr-only"> (opens in a new tab)</span></a>' +
      '<p class="hint">We send you a free mock-up with the exact size and final price before anything is made. No payment on this website.</p>' +
    "</div>" +
    '<div class="own-design"><b>Have your own logo or design?</b><p>Send it on WhatsApp and our designer replies with a neon mock-up and price.</p><a class="btn btn-ghost btn-sm" id="ownDesign" target="_blank" rel="noopener">WhatsApp Now<span class="sr-only"> (opens in a new tab)</span></a></div>' +
    '<details class="cfg-more" id="cfgMore"><summary>Add details: indoor or outdoor, fitting, quantity, notes</summary>' +
      '<fieldset class="field"><legend>Where will it be used?</legend><div class="chips">' + radios("use", N.USES) + "</div></fieldset>" +
      '<fieldset class="field"><legend>Mounting and fitting</legend><div class="chips">' + radios("fit", N.FITTINGS) + "</div></fieldset>" +
      '<div class="field"><div class="field-row"><label for="f-q">Quantity</label></div><input type="number" id="f-q" name="q" min="1" max="' + N.LIMITS.maxQty + '" step="1" value="1" inputmode="numeric" aria-describedby="m-q"><p class="msg" id="m-q" aria-live="polite"></p></div>' +
      '<div class="field"><div class="field-row"><label for="f-n">Notes for our team <em class="opt">(optional)</em></label><span class="count" id="c-n" aria-hidden="true"></span></div>' +
        '<textarea id="f-n" name="notes" rows="3" maxlength="400" aria-describedby="m-n"></textarea><p class="msg" id="m-n" aria-live="polite"></p></div>' +
      '<div class="field"><label for="f-file">Logo or reference image <em class="opt">(optional)</em></label>' +
        '<input type="file" id="f-file" accept="image/png,image/jpeg,image/webp,application/pdf" aria-describedby="h-file m-file">' +
        '<p class="hint" id="h-file">PNG, JPG, WebP or PDF, up to ' + CONFIG.maxUploadMB + " MB. It stays on your device; attach the same file in the WhatsApp chat.</p>" +
        '<p class="msg" id="m-file" aria-live="polite"></p><div class="file-chip" id="fileChip" hidden></div></div>' +
    "</details>" +
    '<div class="form-actions"><button type="button" class="btn btn-ghost" id="resetBtn">Reset design</button></div>';
  const f = form.elements;
  const preview = $("#preview"), svg = $("#neonSvg"), fallback = $("#neonFallback");

  /* ---------------- state ---------------- */
  let file = null, fileUrl = "", lastCfg = N.normalize(N.DEFAULTS).config, valid = true, lastEst = null;
  const textLines = () => f.text.value.replace(/\r/g, "").split("\n");
  const readRaw = () => {
    const ls = textLines();
    return { t: ls.length > 2 ? ls.slice(0, 3) : [ls[0] || "", ls[1] || ""], f: f.font.value, c: f.color.value, z: "regular", b: "none", u: f.use.value, x: f.fit.value, i: "none", n: f.notes.value, q: f.q.value === "" ? "" : Number(f.q.value) };
  };
  function writeCfg(cfg) {
    f.text.value = cfg.t.filter(Boolean).join("\n"); f.font.value = cfg.f; f.color.value = cfg.c;
    f.use.value = cfg.u; f.fit.value = cfg.x; f.notes.value = cfg.n || ""; f.q.value = cfg.q || 1;
    if (cfg.u !== "indoor" || cfg.x !== "pickup" || cfg.n || cfg.q > 1) el("cfgMore").open = true;
  }
  /* the shop confirms size, backing and symbols on the mock-up, so a design from an older link keeps only text, font, colour and details */
  const simplify = cfg => N.normalize(Object.assign({}, cfg, { z: "regular", b: "none", i: "none", g: "mauve", p: "std", c2: "", c3: "" })).config;
  const baseUrl = () => location.href.split(/[?#]/)[0];
  const designUrl = cfg => (location.protocol === "file:" ? "" : baseUrl() + "?design=" + N.encode(cfg));

  /* ---------------- font loading ---------------- */
  let fontsRequested = false; const loadedFonts = new Set();
  const gfFamily = ft => "family=" + encodeURIComponent(ft.gf).replace(/%20/g, "+");
  const addCss = href => { const link = document.createElement("link"); link.rel = "stylesheet"; link.href = href; document.head.appendChild(link); };
  /* fullReady: styles whose complete font file has loaded (the small style-button file only has the label letters) */
  const fullReady = new Set();
  function needFont(ft) {
    if (!fontsRequested || loadedFonts.has(ft.gf)) return; loadedFonts.add(ft.gf);
    const link = document.createElement("link"); link.rel = "stylesheet"; link.href = "https://fonts.googleapis.com/css2?" + gfFamily(ft) + "&display=swap";
    link.addEventListener("load", () => {
      const done = () => { fullReady.add(ft.gf); delete capCache[ft.css]; stemCache.clear(); try { draw(lastCfg); } catch (e) { /* fallback stays */ } };
      if (document.fonts) document.fonts.load('48px "' + ft.gf + '"', "Hello Rajat ABCxyz").then(done, done); else done();
    });
    link.addEventListener("error", () => fullReady.add(ft.gf));
    document.head.appendChild(link);
  }
  function ensureFonts() {
    if (fontsRequested) return; fontsRequested = true;
    const glyphs = Array.from(new Set(N.FONTS.map(ft => ft.label).join(""))).join("");
    addCss("https://fonts.googleapis.com/css2?" + N.FONTS.map(gfFamily).join("&") + "&text=" + encodeURIComponent(glyphs) + "&display=swap");
    if (document.fonts) document.fonts.addEventListener("loadingdone", () => { try { draw(lastCfg); } catch (e) { /* fallback stays */ } });
    needFont(drawFont(lastCfg));
  }

  /* ---------------- live preview (SVG) ---------------- */
  function node(name, attrs, parent) {
    const n = document.createElementNS(SVGNS, name);
    Object.keys(attrs || {}).forEach(k => n.setAttribute(k, attrs[k]));
    if (parent) parent.appendChild(n);
    return n;
  }
  const mix = (hex, toward, t) => { const n = parseInt(hex.slice(1), 16), o = parseInt(toward.slice(1), 16); const m = (a, b) => Math.round(a + (b - a) * t); return "rgb(" + m(n >> 16, o >> 16) + "," + m((n >> 8) & 255, (o >> 8) & 255) + "," + m(n & 255, o & 255) + ")"; };
  const tint = hex => mix(hex, "#FFFFFF", 0.85);
  /** Dark colours (blue, green) get a lighter glow so they still read as light; the tube itself keeps the exact hex. */
  const glowOf = hex => { const l = N.luminance(hex); return l >= 0.5 ? hex : mix(hex, "#FFFFFF", Math.min(0.5, (0.5 - l) * 1.1)); };
  const DEVA = /[ऀ-ॿ]/;
  /** Hindi letters need a font that has them: each style has a look-alike Hindi font (ft.hi). */
  const drawFont = cfg => { const ft = N.fontOf(cfg.f); return (DEVA.test(cfg.t.join("")) && !ft.deva && ft.hi) ? Object.assign({}, ft, { gf: ft.hi.gf, css: ft.hi.css, deva: true }) : ft; };

  const capCache = {};
  function capRatio(font) {
    if (capCache[font.css]) return capCache[font.css];
    let r = 0.7, loaded = true;
    try {
      if (font.gf) loaded = fullReady.has(font.gf);
      const c = document.createElement("canvas").getContext("2d");
      c.font = "100px " + font.css;
      const a = c.measureText("H").actualBoundingBoxAscent;
      if (a > 20 && a < 140) r = a / 100;
    } catch (e) { /* keep the default */ }
    if (loaded) capCache[font.css] = r;
    return r;
  }
  /* Average stroke thickness of the letters, measured from pixels, so every font can be drawn with the same tube. 0 = not measurable yet. */
  const stemCache = new Map();
  function inkStem(font, lines, fs) {
    try {
      if (font.gf && !fullReady.has(font.gf)) return 0;   // wait for the complete font file
      const key = font.css + "|" + Math.round(fs) + "|" + lines.join("\n");
      if (stemCache.has(key)) return stemCache.get(key);
      const c = document.createElement("canvas"), x = c.getContext("2d", { willReadFrequently: true });
      x.font = fs + "px " + font.css;
      const pad = 24, lineH = Math.ceil(fs * 1.6);
      const w = Math.ceil(Math.max.apply(null, lines.map(l => x.measureText(l || " ").width))) + pad * 2, h = lineH * lines.length + pad;
      if (w * h > 3000000) return 0;
      c.width = w; c.height = h; x.font = fs + "px " + font.css; x.fillStyle = "#000";
      lines.forEach((l, i) => x.fillText(l, pad, pad / 2 + lineH * (i + 0.8)));
      const d = x.getImageData(0, 0, w, h).data;
      const on = (i, j) => i >= 0 && j >= 0 && i < w && j < h && d[(j * w + i) * 4 + 3] > 127;
      let area = 0, edge = 0;
      for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) if (on(i, j)) { area++; if (!on(i - 1, j) || !on(i + 1, j) || !on(i, j - 1) || !on(i, j + 1)) edge++; }
      const st = edge ? (2 * area) / edge : 0;
      if (stemCache.size > 200) stemCache.clear();
      stemCache.set(key, st); return st;
    } catch (e) { return 0; }
  }
  function measure(text, fontCss, size) {
    const t = node("text", { "font-family": fontCss, "font-size": size, x: 0, y: 0, visibility: "hidden" }, svg);
    t.textContent = text || " ";
    let w = 0; try { w = t.getBBox().width; } catch (e) { w = 0; }
    svg.removeChild(t);
    return w || text.length * size * 0.58;
  }

  /* The dark room: a soft-lit wall and a dim sofa, drawn here (no photo), with a little of the neon colour falling on it. */
  function paintRoom(defs, g, W, H, glowHex) {
    const wall = node("radialGradient", { id: "gcWall", cx: 0.5, cy: 0.32, r: 0.9 }, defs);
    node("stop", { offset: "0", "stop-color": "#1b1820" }, wall); node("stop", { offset: "0.55", "stop-color": "#0d0b10" }, wall); node("stop", { offset: "1", "stop-color": "#050406" }, wall);
    node("rect", { x: 0, y: 0, width: W, height: H, fill: "url(#gcWall)" }, g);
    const gr = node("filter", { id: "gcGrain", x: 0, y: 0, width: "100%", height: "100%" }, defs);
    node("feTurbulence", { type: "fractalNoise", baseFrequency: 0.8, numOctaves: 3, seed: 5 }, gr);
    node("feColorMatrix", { type: "matrix", values: "0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.35 0" }, gr);
    node("rect", { x: 0, y: 0, width: W, height: H, filter: "url(#gcGrain)" }, g);
    // floor and sofa, in the dark lower part of the room
    node("rect", { x: 0, y: 900, width: W, height: H - 900, fill: "#060507" }, g);
    const sofa = node("g", { opacity: 0.95 }, g);
    const sf = node("linearGradient", { id: "gcSofa", x1: 0, y1: 0, x2: 0, y2: 1 }, defs);
    node("stop", { offset: "0", "stop-color": "#2e2a1c" }, sf); node("stop", { offset: "1", "stop-color": "#15130d" }, sf);
    node("rect", { x: 150, y: 715, width: 700, height: 120, rx: 26, fill: "url(#gcSofa)" }, sofa);            // back
    node("rect", { x: 110, y: 800, width: 780, height: 92, rx: 22, fill: "#1f1c13" }, sofa);                 // seat
    node("rect", { x: 92, y: 760, width: 74, height: 136, rx: 30, fill: "#25211a" }, sofa);                  // arms
    node("rect", { x: 834, y: 760, width: 74, height: 136, rx: 30, fill: "#25211a" }, sofa);
    [[205, 735], [345, 728], [500, 724], [655, 728], [795, 735]].forEach(p => node("rect", { x: p[0] - 62, y: p[1], width: 124, height: 90, rx: 30, fill: "#383221" }, sofa));   // cushions
    node("rect", { x: 130, y: 892, width: 16, height: 18, fill: "#0e0c08" }, sofa); node("rect", { x: 854, y: 892, width: 16, height: 18, fill: "#0e0c08" }, sofa);
    // neon light falling on the sofa top
    const lit = node("linearGradient", { id: "gcLit", x1: 0, y1: 0, x2: 0, y2: 1 }, defs);
    node("stop", { offset: "0", "stop-color": glowHex, "stop-opacity": 0.16 }, lit); node("stop", { offset: "1", "stop-color": glowHex, "stop-opacity": 0 }, lit);
    node("rect", { x: 92, y: 715, width: 816, height: 180, rx: 26, fill: "url(#gcLit)", style: "mix-blend-mode:screen" }, sofa);
  }

  /* Layout constants, in preview units (the preview is 1000 x 1000). */
  const W = 1000, H = 1000, BOX = { cx: 500, cy: 330, maxW: 640, maxH: 360, maxCap: 120 };
  const TUBE = 3.6, GLOW = { wide: 14, mid: 5.5, tight: 2 };   // fixed on-screen sizes: the light looks the same in every font

  function draw(cfg) {
    const font = drawFont(cfg), color = N.colorOf(cfg.c), hex = color.hex, gHex = glowOf(hex);
    const lines = cfg.t.filter(Boolean);
    const show = lines.length ? lines : ["Text Preview"];
    const placeholder = !lines.length;
    const CAP = 100, fs = CAP / capRatio(font), band = CAP * 2.15;
    const widths = show.map(s => measure(s, font.css, fs));
    const textW = Math.max.apply(null, widths), textH = band * (show.length - 1) + CAP * 1.6;
    /* Same place, same light: the text is scaled to fit one box, and the tube and glow are divided by that scale so they keep their size on screen. */
    const s = Math.min(BOX.maxCap / CAP, BOX.maxW / textW, BOX.maxH / textH);
    const TUBEu = TUBE / s;
    /* Every layer is set to an exact width ON SCREEN. "base" is how thick the letter strokes already are on screen
       (thin fonts are thickened by the stroke; heavier ones are first thinned to the tube width by an erode filter). */
    const stem = inkStem(font, show, fs) || TUBEu;
    const mode = font.lines ? "grow" : stem <= TUBEu + 0.5 ? "grow" : stem <= TUBEu * 3.2 ? "thin" : "outline";
    const shrink = mode === "thin" ? (stem - TUBEu) / 2 : 0;
    const base = mode === "thin" ? TUBE : mode === "outline" ? 0 : stem * s;
    const T = font.lines ? Math.min(TUBE, Math.max(base, 2.2)) : TUBE;      // outline-style fonts keep their double lines apart
    const strokeFor = screenW => (Math.max(0, screenW - base) / s);
    const CORE = T * 0.45, coreErode = base > CORE ? (base - CORE) / 2 / s : 0;   // the white core is the same thin line in every font
    while (svg.firstChild) svg.removeChild(svg.firstChild);
    svg.setAttribute("viewBox", "0 0 " + W + " " + H);
    const defs = node("defs", {}, svg);
    const mkFilter = (id, dev) => {
      const fl = node("filter", { id, x: "-50%", y: "-100%", width: "200%", height: "300%" }, defs);
      if (shrink > 0) node("feMorphology", { operator: "erode", radius: shrink.toFixed(2), in: "SourceGraphic", result: "thin" }, fl);
      if (dev > 0) node("feGaussianBlur", { stdDeviation: (dev / s).toFixed(2), in: shrink > 0 ? "thin" : "SourceGraphic" }, fl);
    };
    mkFilter("gcGlowWide", GLOW.wide); mkFilter("gcGlowMid", GLOW.mid); mkFilter("gcGlowTight", GLOW.tight); mkFilter("gcShadow", 6);
    if (shrink > 0) mkFilter("gcTube", 0);
    if (shrink + coreErode > 0.01) { const fl = node("filter", { id: "gcCore", x: "-50%", y: "-100%", width: "200%", height: "300%" }, defs); node("feMorphology", { operator: "erode", radius: (shrink + coreErode).toFixed(3), in: "SourceGraphic" }, fl); }

    const bg = node("g", { class: "gc-bg" }, svg);
    paintRoom(defs, bg, W, H, gHex);

    // soft pool of light on the wall around the sign (screen units, so it never changes with the font)
    const sp = node("radialGradient", { id: "gcSpill" }, defs);
    node("stop", { offset: "0", "stop-color": gHex, "stop-opacity": placeholder ? 0.12 : 0.32 }, sp); node("stop", { offset: "0.5", "stop-color": gHex, "stop-opacity": placeholder ? 0.04 : 0.12 }, sp); node("stop", { offset: "1", "stop-color": gHex, "stop-opacity": 0 }, sp);
    node("ellipse", { cx: BOX.cx, cy: BOX.cy, rx: Math.max(260, textW * s * 0.75), ry: Math.max(170, textH * s * 0.9), fill: "url(#gcSpill)", style: "mix-blend-mode:screen" }, svg);

    const sign = node("g", { class: "gc-sign", transform: "translate(" + BOX.cx + " " + BOX.cy + ") scale(" + s.toFixed(4) + ")" }, svg);
    const y0 = -((show.length - 1) * band) / 2;
    const drawLines = (parent, attrs) => show.forEach((txt, i) => {
      const t = node("text", Object.assign({ x: 0, y: y0 + band * i, "text-anchor": "middle", "dominant-baseline": "central", "font-family": font.css, "font-size": fs }, attrs), parent);
      t.textContent = txt;
    });
    const art = node("g", { class: "gc-art", opacity: placeholder ? 0.55 : 1 }, sign);
    const lay = (c, screenW, extra) => Object.assign({ fill: mode === "outline" ? "none" : c, stroke: c, "stroke-width": strokeFor(screenW).toFixed(3) }, extra || {});
    drawLines(node("g", { filter: "url(#gcShadow)", transform: "translate(" + (5 / s).toFixed(1) + " " + (9 / s).toFixed(1) + ")", opacity: 0.55 }, art), lay("#000", T + 2));
    drawLines(node("g", { filter: "url(#gcGlowWide)", opacity: 0.6 }, art), lay(gHex, T + 6));
    drawLines(node("g", { filter: "url(#gcGlowMid)", opacity: 0.85 }, art), lay(gHex, T + 3));
    drawLines(node("g", { filter: "url(#gcGlowTight)", opacity: 0.95 }, art), lay(hex, T + 1.2));
    drawLines(node("g", Object.assign({ class: "gc-tube" }, shrink > 0 ? { filter: "url(#gcTube)" } : {}), art), lay(hex, T));
    const coreGroup = node("g", Object.assign({ class: "gc-core" }, shrink + coreErode > 0.01 ? { filter: "url(#gcCore)" } : {}), art);
    drawLines(coreGroup, coreErode > 0 ? { fill: mode === "outline" ? "none" : tint(hex), stroke: mode === "outline" ? tint(hex) : "none", "stroke-width": mode === "outline" ? (CORE / s).toFixed(3) : 0, "data-hex": hex } : Object.assign(lay(tint(hex), CORE), { "data-hex": hex }));
    coreGroup.setAttribute("data-core", CORE.toFixed(2)); coreGroup.setAttribute("data-tube", T.toFixed(2));
    return N.estimate(cfg, RATES);
  }

  function showFallbackPreview(cfg) {
    const font = drawFont(cfg);
    preview.classList.add("is-fallback");
    fallback.hidden = false; svg.setAttribute("hidden", "");
    fallback.style.setProperty("--neon", N.colorOf(cfg.c).hex); fallback.style.fontFamily = font.css;
    fallback.textContent = "";
    (cfg.t[0] ? cfg.t.filter(Boolean) : ["Text Preview"]).forEach(s => { const d = document.createElement("div"); d.textContent = s; fallback.appendChild(d); });
  }

  /* ---------------- render ---------------- */
  const setMsg = (id, field, text, kind) => {
    const m = el("m-" + id), inp = el(field); if (!m) return;
    m.textContent = text || ""; m.className = "msg" + (text ? " " + (kind || "err") : "");
    if (!inp) return;
    if (kind === "warn" || !text) inp.removeAttribute("aria-invalid"); else inp.setAttribute("aria-invalid", "true");
  };
  function render() {
    const raw = readRaw(), r = N.normalize(raw), cfg = r.config; lastCfg = cfg;
    const ls = textLines(), tooMany = ls.filter((x, i) => i >= N.LIMITS.maxLines && x.trim()).length > 0;
    valid = r.ok && !tooMany;
    el("colorName").textContent = N.colorOf(cfg.c).label;
    el("fontName").textContent = N.find(N.FONTS, cfg.f).label;
    needFont(drawFont(cfg));
    const longest = Math.max.apply(null, ls.map(x => Array.from(x.trim()).length));
    const c = el("c-text"); c.textContent = longest + "/" + N.LIMITS.line; c.classList.toggle("over", longest > N.LIMITS.line);
    const cn = el("c-n"); cn.textContent = Array.from(f.notes.value.trim()).length + "/" + N.LIMITS.notes;
    const textErr = tooMany ? "Up to " + N.LIMITS.maxLines + " lines, please." : (r.errors.line1 || r.errors.line2 || r.errors.line3 || "").replace(/^Use line 1 first.*$/, "Start with your first line.").replace("Use line 2 before line 3.", "Please remove the empty line between your lines.");
    setMsg("text", "f-text", textErr || r.warnings.line1, textErr ? "err" : "warn");
    setMsg("q", "f-q", r.errors.q, "err");
    setMsg("n", "f-n", r.errors.notes, "err");

    let est = N.estimate(cfg, RATES);
    if (!preview.classList.contains("is-fallback")) {
      try { if (window.__gcForcePreviewFail) throw new Error("forced"); est = draw(cfg); }
      catch (e) { showFallbackPreview(cfg); }
    } else showFallbackPreview(cfg);
    lastEst = est;
    svg.setAttribute("aria-label", cfg.t[0]
      ? 'Preview of your neon sign: "' + cfg.t.filter(Boolean).join(" / ") + '" in ' + N.colorOf(cfg.c).label.toLowerCase() + ", " + N.find(N.FONTS, cfg.f).label.toLowerCase() + " style. Visual approximation only."
      : "Preview placeholder. Type your text to see the sign.");
    el("designId").textContent = valid ? N.designId(cfg) : "–";
    if (valid) { el("buyPrefix").textContent = "Estimated from"; el("buyTotal").textContent = N.money(est.total); }
    else { el("buyPrefix").textContent = ""; el("buyTotal").textContent = "–"; }
    renderEstimate(est);
    updateLinks(cfg, est);
    scheduleAutosave(cfg);
  }

  function renderEstimate(est) {
    const body = el("estBody"), totalEl = el("estTotal"), conf = el("estConfirm");
    if (!body) return;
    if (!valid) { totalEl.textContent = "–"; el("estPrefix").textContent = ""; body.innerHTML = '<tr><td colspan="2">Type your text to see an estimate.</td></tr>'; conf.innerHTML = ""; return; }
    el("estPrefix").textContent = "Estimated from"; totalEl.textContent = N.money(est.total);
    body.innerHTML = est.rows.map(r => '<tr><th scope="row">' + esc(r.label.replace(/, Regular letters, about [^(]+/, ", standard size ")) + "</th><td>" + N.money(r.amount) + "</td></tr>").join("") +
      '<tr class="sum"><th scope="row">Estimated total</th><td>' + N.money(est.total) + "</td></tr>";
    const extra = est.toConfirm.filter(t => !/Custom size/.test(t));
    conf.innerHTML = '<div class="callout"><b>Price on confirmation</b><p>The estimate uses our standard letter size. We confirm the exact size and final price on your free mock-up' + (extra.length ? ", including:" : ".") + "</p>" + (extra.length ? "<ul>" + extra.map(t => "<li>" + esc(t) + "</li>").join("") + "</ul>" : "") + "</div>";
  }

  /* ---------------- enquiry links ---------------- */
  const message = (cfg, est, withUrl, extra) => N.buildMessage(cfg, est, Object.assign({ designUrl: withUrl ? designUrl(cfg) : "", hasFile: !!file }, extra || {}))
    .replace(/\nSize: [^\n]*/, "\nSize: please suggest (estimate uses the standard size)").replace(/\nBackground \(preview only\)[^\n]*/, "").replace(/\nBacking: [^\n]*/, "").replace(/\nType: Standard neon/, "");
  function updateLinks(cfg, est) {
    const msg = valid ? message(cfg, est, true) : "";
    const href = valid ? waUrl(msg) : "#studio-form-start";
    ["sendWa", "sendWaTop"].forEach(id => { const a = el(id); if (a) { a.href = href; a.setAttribute("aria-disabled", String(!valid)); } });
    const mail = el("sendMail");
    if (mail) { mail.href = valid ? "mailto:" + CONFIG.email + "?subject=" + encodeURIComponent("Neon sign design " + N.designId(cfg) + ": " + cfg.t.filter(Boolean).join(" ")) + "&body=" + encodeURIComponent(msg) : "#studio-form-start"; mail.setAttribute("aria-disabled", String(!valid)); }
    const u = valid ? designUrl(cfg) : "";
    if (el("designUrl")) { el("designUrl").value = u || (valid ? "Link sharing needs the live website address" : ""); el("copyLink").disabled = !valid || !u; }
    if (el("saveBtn")) el("saveBtn").disabled = !valid;
    if (el("dlBtn")) el("dlBtn").disabled = !valid;
    const share = el("shareBtn"); if (share && navigator.share) { share.hidden = false; share.disabled = !valid; }
    el("ownDesign").href = waUrl("Hi Grafix Club, I have my own logo/design and would like a custom neon sign quote. I will attach it here." + (valid ? "\nMy design so far: " + N.designId(cfg) + (u ? "\n" + u : "") : ""));
    updateQuote();
  }
  let guard = 0;
  function guardSend(e, label) {
    if (!valid) { e.preventDefault(); render(); f.text.focus(); announce("Please type your text first."); return false; }
    if (Date.now() - guard < 1500) { e.preventDefault(); return false; }
    guard = Date.now(); announce(label); return true;
  }
  ["sendWa", "sendWaTop"].forEach(id => { const a = el(id); if (a) a.addEventListener("click", e => guardSend(e, "Opening WhatsApp with your design.")); });
  if (el("sendMail")) el("sendMail").addEventListener("click", e => guardSend(e, "Opening your e-mail app with your design."));
  if (el("shareBtn")) el("shareBtn").addEventListener("click", async e => {
    if (!guardSend(e, "Opening the share sheet.")) return;
    const data = { title: "My neon sign design " + N.designId(lastCfg), text: message(lastCfg, lastEst, false) };
    const u = designUrl(lastCfg); if (u) data.url = u;
    try { if (file && navigator.canShare && navigator.canShare({ files: [file] })) data.files = [file]; await navigator.share(data); }
    catch (err) { if (err && err.name !== "AbortError") announce("Sharing is not available here. Use WhatsApp or e-mail instead."); }
  });
  if (el("copyLink")) {
    el("copyLink").addEventListener("click", async () => {
      const box = el("designUrl");
      try { await navigator.clipboard.writeText(box.value); announce("Design link copied."); el("copyNote").textContent = "Link copied."; }
      catch (e) { box.focus(); box.select(); el("copyNote").textContent = "Press Ctrl+C (or long-press) to copy the selected link."; announce("Link selected. Copy it manually."); }
      setTimeout(() => { el("copyNote").textContent = ""; }, 4000);
    });
    el("designUrl").addEventListener("focus", e => e.target.select());
  }

  /* ---------------- quote request (sent as a WhatsApp message; nothing stored on a server) ---------------- */
  const QF = id => el("q-" + id);
  const PHONE = /^(?:\+?91[\s-]?)?[6-9]\d{9}$/, EMAIL = /^[^\s@]{1,64}@[^\s@]{1,190}\.[^\s@]{2,24}$/;
  function readQuote() {
    const clean = (v, max) => String(v || "").replace(/[\u0000-\u001F\u007F]/g, " ").replace(/\s+/g, " ").trim().slice(0, max);
    const d = { name: clean(QF("name").value, 60), phone: clean(QF("phone").value, 20), email: clean(QF("email").value, 120), business: clean(QF("business").value, 60) };
    const errs = {};
    if (d.name.length < 2) errs.name = "Please enter your name.";
    if (!PHONE.test(d.phone.replace(/[\s()-]/g, ""))) errs.phone = "Please enter a 10-digit Indian mobile number.";
    if (d.email && !EMAIL.test(d.email)) errs.email = "That e-mail address does not look right.";
    return { d, errs };
  }
  let quoteTouched = false;
  function updateQuote() {
    const a = QF("send"); if (!a) return;
    const { d, errs } = readQuote();
    ["name", "phone", "email"].forEach(k => {
      const m = el("qm-" + k), inp = QF(k), show = quoteTouched && errs[k];
      m.textContent = show ? errs[k] : ""; m.className = "msg" + (show ? " err" : "");
      if (show) inp.setAttribute("aria-invalid", "true"); else inp.removeAttribute("aria-invalid");
    });
    const ok = valid && !Object.keys(errs).length;
    const ref = "Q-" + N.designId(lastCfg).slice(3) + "-" + Date.now().toString(36).slice(-4).toUpperCase();
    a.dataset.ref = ref;
    a.href = ok ? waUrl(message(lastCfg, lastEst || N.estimate(lastCfg, RATES), true, { heading: "Hi Grafix Club, I would like a quote for this neon sign.", customer: d, ref })) : "#quote";
  }
  if (QF("send")) {
    el("quoteForm").addEventListener("input", updateQuote);
    el("quoteForm").addEventListener("submit", e => e.preventDefault());
    QF("send").addEventListener("click", e => {
      quoteTouched = true; updateQuote();
      const { errs } = readQuote();
      if (!valid) { guardSend(e, ""); return; }
      if (Object.keys(errs).length) { e.preventDefault(); QF(Object.keys(errs)[0]).focus(); announce("Please check the highlighted details."); return; }
      if (Date.now() - guard < 1500) { e.preventDefault(); return; }
      guard = Date.now();
      const ref = QF("send").dataset.ref;
      el("quoteDone").hidden = false;
      el("quoteDone").textContent = "Your quote request " + ref + " is ready in WhatsApp. Press send there to reach us" + (file ? ", and attach your logo file in the chat" : "") + ". Keep this reference for any follow-up.";
      announce("Opening WhatsApp with your quote request " + ref + ".");
    });
  }

  /* ---------------- download a PNG of the preview (fonts embedded so the picture matches the screen) ---------------- */
  const blobToData = b => new Promise((res, rej) => { const r = new FileReader(); r.onload = () => res(r.result); r.onerror = rej; r.readAsDataURL(b); });
  async function fontFaceCss(family, text) {
    const css = await (await fetch("https://fonts.googleapis.com/css2?family=" + encodeURIComponent(family).replace(/%20/g, "+") + "&text=" + encodeURIComponent(text))).text();
    const srcs = [...css.matchAll(/url\((https:\/\/fonts\.gstatic\.com\/[^)]+)\)/g)].map(m => m[1]).slice(0, 4);
    let out = ""; for (const u of srcs) out += "@font-face{font-family:'" + family + "';src:url(" + await blobToData(await (await fetch(u)).blob()) + ");}";
    return out;
  }
  if (el("dlBtn")) el("dlBtn").addEventListener("click", async () => {
    if (!valid) return;
    const btn = el("dlBtn"); btn.disabled = true; const old = btn.textContent; btn.textContent = "Preparing image…";
    const urls = [];
    try {
      const clone = svg.cloneNode(true), scale = 1.2, PW = W * scale, PH = H * scale;
      clone.setAttribute("xmlns", SVGNS); clone.setAttribute("width", PW); clone.setAttribute("height", PH);
      let note = "";
      try { const st = document.createElementNS(SVGNS, "style"); st.textContent = await fontFaceCss(drawFont(lastCfg).gf, Array.from(new Set(lastCfg.t.join(""))).join("")); clone.insertBefore(st, clone.firstChild); }
      catch (e) { note = " The lettering may use a standard font because the style font could not be added."; }
      const src = URL.createObjectURL(new Blob([new XMLSerializer().serializeToString(clone)], { type: "image/svg+xml" })); urls.push(src);
      const img = await new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = () => rej(new Error("render")); i.src = src; });
      const c = document.createElement("canvas"); c.width = PW; c.height = PH;
      const x = c.getContext("2d"); x.drawImage(img, 0, 0, PW, PH);
      x.font = "600 18px Inter, Arial, sans-serif"; x.fillStyle = "rgba(255,255,255,.7)"; x.textAlign = "right";
      x.fillText("Grafix Club · " + N.designId(lastCfg) + " · visual approximation", PW - 18, PH - 18);
      const blob = await new Promise(res => c.toBlob(res, "image/png")); if (!blob) throw new Error("png");
      const href = URL.createObjectURL(blob); urls.push(href);
      const a = document.createElement("a"); a.href = href; a.download = "grafix-neon-" + N.designId(lastCfg) + ".png"; document.body.appendChild(a); a.click(); a.remove();
      announce("Preview image downloaded." + note); el("dlNote").textContent = "Image downloaded." + note;
    } catch (e) {
      announce("Could not create the image in this browser. Send the design link instead."); el("dlNote").textContent = "Could not create the image here. Use the design link instead.";
    } finally {
      setTimeout(() => urls.forEach(u => URL.revokeObjectURL(u)), 4000);
      btn.textContent = old; btn.disabled = !valid; setTimeout(() => { el("dlNote").textContent = ""; }, 6000);
    }
  });

  /* ---------------- reference / logo file ---------------- */
  function clearFile() {
    if (fileUrl) URL.revokeObjectURL(fileUrl);
    file = null; fileUrl = ""; el("f-file").value = "";
    el("fileChip").hidden = true; el("fileChip").textContent = ""; setMsg("file", "f-file", "");
  }
  el("f-file").addEventListener("change", async e => {
    const picked = e.target.files && e.target.files[0];
    if (!picked) { clearFile(); render(); return; }
    let headBytes = new Uint8Array(0);
    try { headBytes = new Uint8Array(await picked.slice(0, 16).arrayBuffer()); } catch (err) { /* rejected below */ }
    const res = N.checkFile({ type: picked.type, size: picked.size, name: picked.name }, headBytes, CONFIG.maxUploadMB);
    if (!res.ok) { clearFile(); setMsg("file", "f-file", res.message, "err"); announce(res.message); render(); return; }
    clearFile(); file = picked;
    const chip = el("fileChip"); chip.hidden = false; chip.textContent = "";
    if (res.type !== "application/pdf") { fileUrl = URL.createObjectURL(picked); const im = document.createElement("img"); im.src = fileUrl; im.alt = "Preview of your logo or reference image"; im.width = 56; im.height = 56; chip.appendChild(im); }
    const name = document.createElement("span"); name.className = "fname"; name.textContent = picked.name + " (" + Math.max(1, Math.round(picked.size / 1024)) + " KB)"; chip.appendChild(name);
    const rm = document.createElement("button"); rm.type = "button"; rm.className = "btn btn-ghost btn-sm"; rm.textContent = "Remove"; rm.setAttribute("aria-label", "Remove file " + picked.name);
    rm.addEventListener("click", () => { clearFile(); render(); announce("File removed."); el("f-file").focus(); });
    chip.appendChild(rm); announce("File added: " + picked.name + "."); render();
  });

  /* ---------------- saved designs ---------------- */
  const loadSaved = () => { try { const a = JSON.parse(safeStore.get(LS_SAVED) || "[]"); return Array.isArray(a) ? a.filter(s => s && typeof s.d === "string" && N.decode(s.d)).slice(0, MAX_SAVED) : []; } catch (e) { return []; } };
  function renderSaved() {
    const list = el("savedList"); if (!list) return;
    const items = loadSaved(); list.textContent = ""; el("savedEmpty").hidden = items.length > 0;
    items.forEach((s, i) => {
      const cfg = simplify(N.decode(s.d)), li = document.createElement("li");
      const load = document.createElement("button"); load.type = "button"; load.className = "saved-load"; load.textContent = N.designId(cfg) + " · " + cfg.t.filter(Boolean).join(" ") + " · " + N.colorOf(cfg.c).label + " · " + N.find(N.FONTS, cfg.f).label;
      load.addEventListener("click", () => { clearFile(); writeCfg(cfg); render(); announce("Loaded saved design."); f.text.focus(); });
      const del = document.createElement("button"); del.type = "button"; del.className = "saved-del"; del.textContent = "Delete"; del.setAttribute("aria-label", "Delete saved design " + cfg.t.filter(Boolean).join(" "));
      del.addEventListener("click", () => { safeStore.set(LS_SAVED, JSON.stringify(loadSaved().filter((_, j) => j !== i))); renderSaved(); announce("Saved design deleted."); (list.querySelector("button") || el("saveBtn")).focus(); });
      li.append(load, del); list.appendChild(li);
    });
  }
  if (el("saveBtn")) el("saveBtn").addEventListener("click", () => {
    if (!valid) return;
    const enc = N.encode(lastCfg), cur = loadSaved().filter(s => s.d !== enc);
    cur.unshift({ d: enc, t: Date.now() });
    const ok = safeStore.set(LS_SAVED, JSON.stringify(cur.slice(0, MAX_SAVED)));
    renderSaved();
    announce(ok ? "Design saved on this device (" + N.designId(lastCfg) + ")." : "Could not save: your browser is blocking storage. Use Copy design link instead.");
    el("savedNote").textContent = ok ? "Saved on this device only." : "Saving is blocked in this browser. Use the link instead.";
  });
  let saveTimer = 0;
  function scheduleAutosave(cfg) { clearTimeout(saveTimer); if (valid) saveTimer = setTimeout(() => safeStore.set(LS_DRAFT, N.encode(cfg)), 500); }

  /* ---------------- events ---------------- */
  form.addEventListener("input", render);
  form.addEventListener("submit", e => e.preventDefault());
  el("resetBtn").addEventListener("click", () => { clearFile(); writeCfg(N.normalize(N.DEFAULTS).config); safeStore.del(LS_DRAFT); render(); announce("Design reset."); f.text.focus(); });
  if (el("howText")) el("howText").textContent = "The estimate uses our standard letter size (" + N.SIZES[0].w + " in wide and " + N.SIZES[0].h + " in high per letter, per line), charged at " + N.money(RATES.neonRatePerSqFt) + " per sq ft and rounded to the nearest ₹100, with a minimum of " + N.money(RATES.neonMinPrice) + " per sign. Quantity multiplies the price of one sign. The exact size, acrylic backing, outdoor use and fitting are confirmed on your free mock-up. GST extra where applicable. This is an estimate, not an offer, and no payment is taken on this website.";

  /* ---------------- start: link > preset > draft > default ---------------- */
  (function init() {
    const sp = new URLSearchParams(location.search);
    const shared = sp.get("design");
    let status = "";
    if (shared !== null) {
      const cfg = N.decode(shared);
      if (cfg) { writeCfg(simplify(cfg)); status = "Design restored from the link you opened."; }
      else { writeCfg(N.normalize(N.DEFAULTS).config); status = "That design link could not be read, so we are showing the starting sign instead."; }
    } else if (sp.get("preset") && N.PRESETS.some(p => p.key === sp.get("preset"))) {
      writeCfg(simplify(Object.assign({}, N.DEFAULTS, N.PRESETS.find(p => p.key === sp.get("preset")).cfg)));
    } else {
      const draft = N.decode(safeStore.get(LS_DRAFT));
      writeCfg(draft ? simplify(draft) : N.normalize(N.DEFAULTS).config);
      if (draft) status = "Restored the design you were working on last time.";
    }
    ensureFonts(); render(); renderSaved();
    if (status) { const n = el("restoreNote"); if (n) { n.textContent = status; n.hidden = false; } announce(status); }
  })();
})();
