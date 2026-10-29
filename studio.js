/* =========================================================
   GRAFIX CLUB – Neon Studio (custom neon builder UI)
   Needs: config.js, neon-model.js, common.js.
   No server is involved: nothing typed or uploaded here leaves the
   browser until the customer taps WhatsApp / e-mail / Share.
   ========================================================= */
(function () {
  "use strict";
  const root = document.getElementById("studioApp");
  if (!root || typeof GCNeon === "undefined") return;
  const N = GCNeon, { $, $$, announce, waUrl, safeStore } = GC;
  const SVGNS = "http://www.w3.org/2000/svg";
  const RATES = { neonRatePerSqFt: CONFIG.neonRatePerSqFt, neonBackboardRatePerSqFt: CONFIG.neonBackboardRatePerSqFt, neonMinPrice: CONFIG.neonMinPrice };
  const LS_DRAFT = "gc.studio.draft", LS_SAVED = "gc.studio.saved", MAX_SAVED = 6;
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  /* ---------------- form markup (option lists come from the model) ---------------- */
  const radios = (name, opts, extra) => opts.map((o, i) => {
    const inner = extra ? extra(o) : '<span class="chip-t">' + esc(o.label) + "</span>" + (o.hint ? '<small class="chip-h">' + esc(o.hint) + "</small>" : "");
    return '<label class="ochip' + (extra ? " ochip-small" : "") + '"><input type="radio" name="' + name + '" value="' + o.key + '"' + (i === 0 ? " checked" : "") + '><span class="chip-body">' + inner + "</span></label>";
  }).join("");
  const fieldset = (legend, body, id, cls) => '<fieldset class="field' + (cls ? " " + cls : "") + '"' + (id ? ' id="' + id + '"' : "") + "><legend>" + legend + "</legend>" + body + "</fieldset>";

  /** The 15 style buttons, each drawn in its own font. */
  const fontButtonsHtml = () => '<div class="font-grid">' + N.FONTS.map((ft, i) =>
    '<label class="fbtn"><input type="radio" name="font" value="' + ft.key + '"' + (i === 0 ? " checked" : "") + '><span class="fbtn-t" style="font-family:' + ft.css + '">' + esc(ft.label) + "</span></label>").join("") + "</div>";

  const head = (id, title, nameId, extra) => '<div class="cfg-head"><h4 id="' + id + '">' + title + "</h4>" + (nameId ? '<b class="sel-name" id="' + nameId + '"></b>' : "") + (extra || "") + "</div>";
  const sizeCardsHtml = () => '<div class="size-grid">' + N.SIZES.map((z, i) =>
    '<label class="szc"><input type="radio" name="size" value="' + z.key + '"' + (i === 0 ? " checked" : "") + '><span class="szc-body"><span class="szc-head">' + z.label + "</span>" +
    '<span class="szc-row"><span>Width</span><b>' + z.w + ' inches</b></span><span class="szc-row"><span>Height</span><b>' + z.h + ' inches</b></span><span class="szc-note">per letter</span></span></label>').join("") + "</div>";
  const WALL_LABEL = { photo: "Custom Background" };
  const bgThumbsHtml = () => '<div class="bg-grid">' + N.BACKDROPS.concat([{ key: "photo", label: WALL_LABEL.photo }]).map((o, i) =>
    '<label class="bgc"><input type="radio" name="bg" value="' + o.key + '"' + (i === 0 ? " checked" : "") + '><span class="bgc-body"><span class="bgt bgt-' + o.key + '" aria-hidden="true">' + (o.key === "photo" ? '<svg viewBox="0 0 24 24" width="22" height="22"><path d="M12 16V5m0 0l-4 4m4-4l4 4M5 19h14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>' : "") + '</span><span class="bgc-t">' + esc(o.label) + "</span></span></label>").join("") + "</div>";

  const formHtml =
    head("h-text", "Your Text") +
    '<div class="field">' +
      '<div class="field-row"><label for="f-l1">Line 1 <em class="req">(required)</em></label><span class="count" id="c-l1" aria-hidden="true"></span></div>' +
      '<input type="text" id="f-l1" name="l1" maxlength="60" autocomplete="off" spellcheck="false" aria-describedby="m-l1" value="">' +
      '<p class="msg" id="m-l1" aria-live="polite"></p>' +
    "</div>" +
    '<div class="field">' +
      '<div class="field-row"><label for="f-l2">Line 2 <em class="opt">(optional)</em></label><span class="count" id="c-l2" aria-hidden="true"></span></div>' +
      '<input type="text" id="f-l2" name="l2" maxlength="60" autocomplete="off" spellcheck="false" aria-describedby="m-l2" value="">' +
      '<p class="msg" id="m-l2" aria-live="polite"></p>' +
    "</div>" +
    '<fieldset class="field cfg-sec" aria-labelledby="h-font"><legend class="sr-only">Pick Your Font</legend>' + head("h-font", "Pick Your Font", "fontName") + fontButtonsHtml() + "</fieldset>" +
    '<fieldset class="field cfg-sec" aria-labelledby="h-colour"><legend class="sr-only">Select Your Colour</legend>' + head("h-colour", "Select Your Colour", "colorName") +
      '<div class="swatches">' + N.COLORS.map((c, i) =>
        '<label class="swatch" style="--c:' + c.hex + '"><input type="radio" name="color" value="' + c.key + '"' + (i === 1 ? " checked" : "") + '><span class="sw-dot" aria-hidden="true"></span><span class="sr-only">' + esc(c.label) + "</span></label>").join("") + "</div>" +
      '<div class="field c2-field" id="c2Field" hidden><label for="f-c2">Line 2 colour <em class="opt">(optional, for a two-colour sign)</em></label>' +
      '<select id="f-c2" name="c2"><option value="">Same as line 1</option>' + N.COLORS.map(c => '<option value="' + c.key + '">' + esc(c.label) + "</option>").join("") + "</select></div>" +
      '<p class="msg" id="m-color" aria-live="polite"></p></fieldset>' +
    '<fieldset class="field cfg-sec" aria-labelledby="h-size"><legend class="sr-only">Select Size</legend>' +
      head("h-size", "Select Size", "sizeName", '<button type="button" class="help-btn" id="sizeHelpBtn" aria-expanded="false" aria-controls="sizeHelp"><span aria-hidden="true">?</span><span class="sr-only">What do these sizes mean?</span></button>') +
      '<p class="help-pop" id="sizeHelp" role="note" hidden>These dimensions are the physical size of the lettering for each option, in inches. The full sign gets longer as you add more text. The sign you see on screen is a proportional representation, not an exact measurement, and we confirm the final size on your mock-up.</p>' +
      sizeCardsHtml() + "</fieldset>" +
    '<fieldset class="field cfg-sec" aria-labelledby="h-bg"><legend class="sr-only">Choose Your Background</legend>' + head("h-bg", "Choose Your Background", "bgName") + bgThumbsHtml() +
      '<div class="bg-extra" id="bgPhotoRow" hidden>' +
        '<label for="f-bgfile">Upload a photo of your wall or room <em class="opt">(PNG, JPG or WebP)</em></label>' +
        '<input type="file" id="f-bgfile" accept="image/png,image/jpeg,image/webp" aria-describedby="h-bgfile m-bg">' +
        '<p class="hint" id="h-bgfile">Up to ' + CONFIG.maxUploadMB + " MB. It stays on your device and is only used for this preview, so it is not sent or saved. If you want us to see your wall, attach the same photo in the chat.</p>" +
        '<p class="msg" id="m-bg" aria-live="polite"></p>' +
        '<div class="field-row" id="dimRow" hidden><label for="f-dim">Darken photo</label><output id="dimOut" for="f-dim"></output></div>' +
        '<input type="range" id="f-dim" name="dim" min="0" max="70" step="5" value="35" hidden>' +
        '<button type="button" class="btn btn-ghost btn-sm" id="bgRemove" hidden>Remove wall photo</button>' +
      "</div>" +
      '<p class="hint">Only changes how the preview looks, so you can imagine the sign on your own wall. It never changes the price.</p></fieldset>' +
    '<details class="cfg-more" id="cfgMore"><summary>More options: backing, outdoor use, fitting, symbol, notes</summary>' +
      fieldset("Backing", '<div class="chips col">' + radios("backing", N.BACKINGS) + "</div>") +
      fieldset("Where will it be used?", '<div class="chips">' + radios("use", N.USES) + "</div>") +
      fieldset("Mounting and fitting", '<div class="chips">' + radios("fit", N.FITTINGS) + "</div>") +
      fieldset("Symbol (optional)", '<div class="chips">' + radios("icon", N.ICONS, o => (o.d ? '<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="' + o.d + '" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>' : "") + '<span class="chip-t">' + esc(o.label) + "</span>") + "</div>") +
      '<div class="field">' +
        '<div class="field-row"><label for="f-n">Notes for our team <em class="opt">(optional)</em></label><span class="count" id="c-n" aria-hidden="true"></span></div>' +
        '<textarea id="f-n" name="notes" rows="3" maxlength="400" aria-describedby="m-n"></textarea>' +
        '<p class="msg" id="m-n" aria-live="polite"></p>' +
      "</div>" +
      '<div class="field">' +
        '<label for="f-file">Reference image or PDF <em class="opt">(optional)</em></label>' +
        '<input type="file" id="f-file" accept="image/png,image/jpeg,image/webp,application/pdf" aria-describedby="h-file m-file">' +
        '<p class="hint" id="h-file">PNG, JPG, WebP or PDF, up to ' + CONFIG.maxUploadMB + " MB. It stays on your device. WhatsApp links cannot attach files, so after the chat opens, attach the same file there.</p>" +
        '<p class="msg" id="m-file" aria-live="polite"></p>' +
        '<div class="file-chip" id="fileChip" hidden></div>' +
      "</div>" +
    "</details>" +
    '<div class="own-design"><b>Have your own logo or design?</b><p>Send it to us on WhatsApp and we will reply with a mock-up and a price.</p><a class="btn btn-ghost btn-sm" id="ownDesign" target="_blank" rel="noopener">WhatsApp us your design<span class="sr-only"> (opens in a new tab)</span></a></div>' +
    '<div class="form-actions"><button type="button" class="btn btn-ghost" id="resetBtn">Reset design</button></div>';

  const form = $("#studioForm");
  form.innerHTML = formHtml;
  const f = form.elements;
  const preview = $("#preview"), svg = $("#neonSvg"), fallback = $("#neonFallback");
  const el = id => document.getElementById(id);

  /* ---------------- state ---------------- */
  let bgUrl = "", bgImg = null, file = null, fileUrl = "", lastCfg = N.normalize(N.DEFAULTS).config, valid = true, touchedSend = false, restoredNote = "";

  const readRaw = () => ({ t: [f.l1.value, f.l2.value], f: f.font.value, c: f.color.value, c2: f.c2.value, g: f.bg.value, z: f.size.value, b: f.backing.value, u: f.use.value, x: f.fit.value, i: f.icon.value, n: f.notes.value });
  function writeCfg(cfg) {
    f.l1.value = cfg.t[0]; f.l2.value = cfg.t[1] || ""; f.font.value = cfg.f; f.color.value = cfg.c;
    f.c2.value = cfg.c2 || ""; f.bg.value = cfg.g || "mauve"; f.size.value = cfg.z;
    f.backing.value = cfg.b; f.use.value = cfg.u; f.fit.value = cfg.x; f.icon.value = cfg.i; f.notes.value = cfg.n || "";
    if (cfg.b !== "none" || cfg.u !== "indoor" || cfg.x !== "pickup" || cfg.i !== "none" || cfg.n) el("cfgMore").open = true;
  }
  const baseUrl = () => location.href.split(/[?#]/)[0];
  const designUrl = cfg => (location.protocol === "file:" ? "" : baseUrl() + "?design=" + N.encode(cfg) + "#studio");

  /* ---------------- lazy font loading ----------------
     1) one small request with only the glyphs the style buttons need (so every button shows in its own font), and
     2) the full font for whichever style is selected, loaded when it is first chosen. */
  let fontsRequested = false; const loadedFonts = new Set();
  const gfFamily = ft => "family=" + encodeURIComponent(ft.gf).replace(/%20/g, "+");
  const addCss = href => { const link = document.createElement("link"); link.rel = "stylesheet"; link.href = href; document.head.appendChild(link); };
  function needFont(ft) {
    if (!fontsRequested) return;
    if (loadedFonts.has(ft.gf)) return; loadedFonts.add(ft.gf);
    addCss("https://fonts.googleapis.com/css2?" + gfFamily(ft) + "&display=swap");
    if (document.fonts) document.fonts.load('48px "' + ft.gf + '"').catch(() => {});
  }
  function ensureFonts() {
    if (fontsRequested) return; fontsRequested = true;
    const glyphs = Array.from(new Set(N.FONTS.map(ft => ft.label).join(""))).join("");
    addCss("https://fonts.googleapis.com/css2?" + N.FONTS.map(gfFamily).join("&") + "&text=" + encodeURIComponent(glyphs) + "&display=swap");
    if (document.fonts) document.fonts.addEventListener("loadingdone", () => draw(lastCfg, photoOpt()));
    needFont(drawFont(lastCfg));
  }
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(es => { if (es.some(e => e.isIntersecting)) { ensureFonts(); io.disconnect(); } }, { rootMargin: "700px 0px" });
    io.observe(root);
  } else ensureFonts();
  root.addEventListener("focusin", ensureFonts);

  /* ---------------- live preview (SVG) ---------------- */
  function node(name, attrs, parent) {
    const n = document.createElementNS(SVGNS, name);
    Object.keys(attrs || {}).forEach(k => n.setAttribute(k, attrs[k]));
    if (parent) parent.appendChild(n);
    return n;
  }
  const tint = hex => { const n = parseInt(hex.slice(1), 16); const m = c => Math.round(c + (255 - c) * 0.82); return "rgb(" + m(n >> 16) + "," + m((n >> 8) & 255) + "," + m(n & 255) + ")"; };
  /** Dark colours (blue, green) get a lighter glow so they still read as light; the tube itself keeps the exact hex. */
  const glowOf = hex => {
    const l = N.luminance(hex); if (l >= 0.5) return hex;
    const n = parseInt(hex.slice(1), 16), t = Math.min(0.5, (0.5 - l) * 1.1), m = c => Math.round(c + (255 - c) * t);
    return "rgb(" + m(n >> 16) + "," + m((n >> 8) & 255) + "," + m(n & 255) + ")";
  };
  /** Hindi letters need a font that has them; a style without Hindi letters uses its own look-alike Hindi font (ft.hi), so every style still changes the preview. */
  const DEVA = /[ऀ-ॿ]/;
  const drawFont = cfg => { const ft = N.fontOf(cfg.f); return (DEVA.test(cfg.t.join("")) && !ft.deva && ft.hi) ? Object.assign({}, ft, { gf: ft.hi.gf, css: ft.hi.css, deva: true }) : ft; };
  const SCALE = { regular: 0.74, medium: 0.87, large: 1 };

  /* height of a capital letter as a share of the font size (measured, so every font gets the same letter height) */
  const capCache = {};
  function capRatio(font) {
    if (capCache[font.css]) return capCache[font.css];
    let r = 0.7, loaded = true;
    try {
      if (document.fonts && font.gf) loaded = document.fonts.check('100px "' + font.gf + '"');
      const c = document.createElement("canvas").getContext("2d");
      c.font = "100px " + font.css;
      const a = c.measureText("H").actualBoundingBoxAscent;
      if (a > 25 && a < 120) r = a / 100;
    } catch (e) { /* keep the default */ }
    if (loaded) capCache[font.css] = r;
    return r;
  }

  /* Average stroke thickness of the letters, in sign units, measured from the pixels of the typed text in its font.
     Used to give every font the same neon-tube thickness. Returns 0 when it cannot be measured yet (font still loading). */
  const stemCache = new Map();
  function inkStem(font, lines, fs) {
    try {
      if (document.fonts && font.gf && !document.fonts.check('100px "' + font.gf + '"')) return 0;
      const key = font.css + "|" + Math.round(fs) + "|" + lines.join("\n");
      if (stemCache.has(key)) return stemCache.get(key);
      const c = document.createElement("canvas"), x = c.getContext("2d", { willReadFrequently: true });
      x.font = fs + "px " + font.css;
      const pad = 24, lineH = Math.ceil(fs * 1.5);
      const w = Math.ceil(Math.max.apply(null, lines.map(l => x.measureText(l || " ").width))) + pad * 2, h = lineH * lines.length + pad;
      if (w * h > 3000000) return 0;
      c.width = w; c.height = h;
      x.font = fs + "px " + font.css; x.fillStyle = "#000";
      lines.forEach((l, i) => x.fillText(l, pad, pad / 2 + lineH * (i + 0.8)));
      const d = x.getImageData(0, 0, w, h).data;
      const on = (i, j) => i >= 0 && j >= 0 && i < w && j < h && d[(j * w + i) * 4 + 3] > 127;
      let area = 0, edge = 0;
      for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) if (on(i, j)) { area++; if (!on(i - 1, j) || !on(i + 1, j) || !on(i, j - 1) || !on(i, j + 1)) edge++; }
      const st = edge ? (2 * area) / edge : 0;
      if (stemCache.size > 200) stemCache.clear();
      stemCache.set(key, st);
      return st;
    } catch (e) { return 0; }
  }

  function measureWidth(text, fontCss, size) {
    const t = node("text", { "font-family": fontCss, "font-size": size, x: 0, y: 0, visibility: "hidden" }, svg);
    t.textContent = text || " ";
    let w = 0;
    try { w = t.getBBox().width; } catch (e) { w = 0; }
    svg.removeChild(t);
    return w || text.length * size * 0.58;   // rough width if the browser cannot measure yet
  }

  const photoOpt = () => (f.bg.value === "photo" && bgImg ? { url: bgUrl, dim: +f.dim.value } : null);
  /** Fills <defs> with the chosen wall under the id gcWall (a pattern or gradient) and returns extra overlay nodes to draw on top (texture). */
  function paintWall(defs, cfg, W, H) {
    const pat = (w, h) => node("pattern", { id: "gcWall", width: w, height: h, patternUnits: "userSpaceOnUse" }, defs);
    const grad = (c1, c2, id) => { const g = node("radialGradient", { id: id || "gcWall", cx: 0.5, cy: 0.42, r: 0.85 }, defs); node("stop", { offset: "0", "stop-color": c1 }, g); node("stop", { offset: "1", "stop-color": c2 }, g); };
    const dots = (p, color, pts) => pts.forEach(q => node("circle", { cx: q[0], cy: q[1], r: q[2] || 1.2, fill: color }, p));
    // grain: fractal noise tinted by a colour matrix, drawn over the wall at a low opacity
    const grain = (id, freq, alpha, rgb) => { const fl = node("filter", { id, x: 0, y: 0, width: "100%", height: "100%" }, defs); node("feTurbulence", { type: "fractalNoise", baseFrequency: freq, numOctaves: 3, seed: 7, result: "n" }, fl); node("feColorMatrix", { type: "matrix", values: "0 0 0 0 " + rgb[0] + " 0 0 0 0 " + rgb[1] + " 0 0 0 0 " + rgb[2] + " 0 0 0 " + alpha + " 0" }, fl); };
    const overlays = [];
    switch (cfg.g) {
      case "brick": {
        const p = pat(160, 80);
        node("rect", { width: 160, height: 80, fill: "#1b0e0b" }, p);
        [["#3d1c15", 2, 2, 74, 34], ["#34170f", 82, 2, 76, 34], ["#40201a", -38, 42, 74, 34], ["#351810", 42, 42, 74, 34], ["#3b1d16", 122, 42, 74, 34]].forEach(b => node("rect", { x: b[1], y: b[2], width: b[3], height: b[4], rx: 2, fill: b[0] }, p));
        node("path", { d: "M8 8h50M90 10h60M52 48h56M10 66h40", stroke: "rgba(255,255,255,.05)", "stroke-width": 2, fill: "none" }, p);
        grain("gcGrain", 0.9, 0.5, [0, 0, 0]); overlays.push("gcGrain"); break;
      }
      case "wood": {
        const p = pat(240, 56);
        node("rect", { width: 240, height: 56, fill: "#6b4423" }, p);
        [["#7a4e29", 0, 26], ["#5f3b1d", 26, 30]].forEach(b => node("rect", { x: 0, y: b[1], width: 240, height: b[2], fill: b[0] }, p));
        node("path", { d: "M0 25.5h240M0 55.5h240", stroke: "#2c1a0c", "stroke-width": 2.5, fill: "none" }, p);
        node("path", { d: "M0 8c40-6 70 6 110 0s80-6 130 0M0 17c50 4 90-4 140 1s70 2 100-1M0 38c30-5 80 5 120 0s70-4 120 1M0 47c60 3 100-3 150 0s60 2 90 0", stroke: "rgba(40,22,8,.45)", "stroke-width": 1.2, fill: "none" }, p);
        node("path", { d: "M70 3v22M170 30v24", stroke: "rgba(0,0,0,.35)", "stroke-width": 1.5 }, p);
        grain("gcGrain", "0.02 0.6", 0.35, [0, 0, 0]); overlays.push("gcGrain"); break;
      }
      case "concrete": {
        grad("#7b7e84", "#4a4d53");
        grain("gcGrain", 0.65, 0.55, [0, 0, 0]); overlays.push("gcGrain");
        const pores = pat(97, 83); node("rect", { width: 97, height: 83, fill: "none" }, pores); dots(pores, "rgba(30,30,34,.55)", [[9, 11, 1.1], [41, 23, 1.5], [70, 7, 0.9], [22, 58, 1.3], [84, 66, 1.1], [58, 74, 0.8], [33, 40, 0.8]]); dots(pores, "rgba(255,255,255,.12)", [[15, 30, 1.2], [63, 49, 1], [48, 12, 0.9]]);
        pores.setAttribute("id", "gcPores"); overlays.push("pores"); break;
      }
      case "white": {
        grad("#f4f1ec", "#d8d3ca");
        grain("gcGrain", 0.8, 0.22, [0.35, 0.3, 0.25]); overlays.push("gcGrain"); break;
      }
      default: {   // mauve: dark purple plaster with a soft vignette
        grad("#4a2a52", "#1c0d22");
        grain("gcGrain", 0.75, 0.38, [0, 0, 0]); overlays.push("gcGrain");
      }
    }
    return overlays;
  }

  function draw(cfg, bgPhoto) {
    const font = drawFont(cfg), color = N.colorOf(cfg.c);
    const color2 = cfg.t[1] && cfg.c2 ? N.colorOf(cfg.c2) : color, light = !bgPhoto && N.isLightWall(cfg);
    const lineColor = i => (i === 1 ? color2 : color);
    const lines = (cfg.t[1] ? [cfg.t[0], cfg.t[1]] : [cfg.t[0]]);
    const show = lines.map(s => s || "");
    const placeholder = !show[0];
    if (placeholder) show[0] = "Your text";
    const W = 800, y0 = 70;
    /* Same letter height for every font: only the Size card (and the number of lines) changes how tall the letters are.
       The sign is as wide as the letters need, so a wider font or a longer word gives a longer sign, never a bigger one. */
    const CAP = 118, band = 190, signH = band * lines.length;
    const H = y0 + signH + 110;
    const fs = CAP / capRatio(font);
    const icon = N.find(N.ICONS, cfg.i);
    const iconSize = icon.d ? Math.min(band * 0.7, 150) : 0, gap = icon.d ? 36 : 0, padX = 46;
    const textW = Math.max.apply(null, show.map(s => measureWidth(s, font.css, fs)));
    const signW = Math.round(textW + iconSize + gap + padX * 2), signX = (W - signW) / 2;
    const textLeft = signX + padX + iconSize + gap, cx = textLeft + textW / 2;

    /* Every font gets exactly the same neon-tube thickness (TUBE). Thin letters are thickened, medium ones thinned,
       and very heavy ones are drawn as a tube round the outline, so the tube is the same in every font. */
    const TUBE = 7, stem = inkStem(font, show, fs) || TUBE;
    const mode = stem <= TUBE + 0.5 ? "grow" : stem <= TUBE * 3.2 ? "thin" : "outline";
    const grow = mode === "grow" ? Math.max(0, TUBE - stem) : 0, shrink = mode === "thin" ? (stem - TUBE) / 2 : 0;
    const tubeW = w => (mode === "grow" ? grow + w : mode === "thin" ? w : TUBE + w);

    while (svg.firstChild) svg.removeChild(svg.firstChild);
    svg.setAttribute("viewBox", "0 0 " + W + " " + H);
    const defs = node("defs", {}, svg);
    const mkFilter = (id, dev) => {
      const fl = node("filter", { id, x: "-40%", y: "-80%", width: "180%", height: "260%" }, defs);
      if (shrink > 0) node("feMorphology", { operator: "erode", radius: shrink.toFixed(2), in: "SourceGraphic", result: "thin" }, fl);
      if (dev > 0) node("feGaussianBlur", { stdDeviation: dev, in: shrink > 0 ? "thin" : "SourceGraphic" }, fl);
    };
    mkFilter("gcGlowWide", 26); mkFilter("gcGlowMid", 11); mkFilter("gcGlowTight", 4); mkFilter("gcShadow", 7);
    if (shrink > 0) mkFilter("gcCore", 0);
    const overlays = paintWall(defs, cfg, W, H);
    node("rect", { x: 0, y: 0, width: W, height: H, fill: "url(#gcWall)" }, svg);
    if (bgPhoto) {
      const clip = node("clipPath", { id: "gcBgClip" }, defs); node("rect", { x: 0, y: 0, width: W, height: H }, clip);
      node("image", { href: bgPhoto.url, x: 0, y: 0, width: W, height: H, preserveAspectRatio: "xMidYMid slice", "clip-path": "url(#gcBgClip)" }, svg);
      node("rect", { x: 0, y: 0, width: W, height: H, fill: "#000", opacity: bgPhoto.dim / 100 }, svg);
    } else {
      overlays.forEach(o => { if (o === "pores") node("rect", { x: 0, y: 0, width: W, height: H, fill: "url(#gcPores)" }, svg); else node("rect", { x: 0, y: 0, width: W, height: H, filter: "url(#" + o + ")", opacity: 1 }, svg); });
    }

    // the whole sign (spill, tubes, hardware, dimension marks) scales with the chosen size, around the middle of the wall
    const k = Math.min(SCALE[cfg.z] || 1, 720 / signW), midY = y0 + signH / 2;   /* the Size card scales the sign; very long text is shrunk to stay on screen */
    const sign = node("g", { transform: "translate(" + W / 2 + " " + midY + ") scale(" + k + ") translate(" + (-W / 2) + " " + (-midY) + ")" }, svg);

    // light spilling onto the wall: a soft pool of the neon colour behind the sign
    const spill = (id, hex, op) => { const g = node("radialGradient", { id }, defs); node("stop", { offset: "0", "stop-color": hex, "stop-opacity": op }, g); node("stop", { offset: "0.55", "stop-color": hex, "stop-opacity": op * 0.35 }, g); node("stop", { offset: "1", "stop-color": hex, "stop-opacity": 0 }, g); };
    const gA = glowOf(color.hex), gB = glowOf(color2.hex);
    spill("gcSpillA", gA, light ? 0.35 : 0.62); spill("gcSpillB", gB, light ? 0.3 : 0.55);
    const two = cfg.t[1] && gA !== gB;
    const spillStyle = light ? "" : "mix-blend-mode:screen";
    node("ellipse", { cx: two ? W / 2 - 110 : W / 2, cy: midY, rx: signW * (two ? 0.62 : 0.78), ry: signH * 1.15 + 60, fill: "url(#gcSpillA)", style: spillStyle, opacity: placeholder ? 0.3 : 1 }, sign);
    if (two) node("ellipse", { cx: W / 2 + 110, cy: midY, rx: signW * 0.62, ry: signH * 1.15 + 60, fill: "url(#gcSpillB)", style: spillStyle }, sign);

    // sign area outline (what the estimate is based on)
    node("rect", { x: signX, y: y0, width: signW, height: signH, rx: 10, fill: "none", stroke: light ? "rgba(0,0,0,.28)" : "rgba(255,255,255,.2)", "stroke-width": 2, "stroke-dasharray": "10 8" }, sign);

    const drawLines = (parent, attrsIn) => {
      const attrsFor = i => (typeof attrsIn === "function" ? attrsIn(i) : attrsIn), attrs = attrsFor(0);
      const textAttrs = i => { const o = Object.assign({}, attrsFor(i)); delete o.iw; return o; };
      show.forEach((s, i) => {
        const t = node("text", Object.assign({ x: cx, y: y0 + band * (i + 0.5), "text-anchor": "middle", "dominant-baseline": "central", "font-family": font.css, "font-size": fs }, textAttrs(i)), parent);
        t.textContent = s;
      });
      if (icon.d) {
        const sc = iconSize / 24, cyI = y0 + signH / 2;
        const p = node("path", Object.assign({ d: icon.d, transform: "translate(" + signX + " " + (cyI - iconSize / 2) + ") scale(" + sc + ")", "stroke-linejoin": "round", "stroke-linecap": "round" }, textAttrs(0)), parent);
        if (attrs.fill !== "none") p.setAttribute("fill", "none");
        p.setAttribute("stroke-width", String(((+attrs.iw || +attrs["stroke-width"] || 2) * 0.9) / sc));
      }
    };

    // backing
    if (cfg.b === "rect") {
      const pad = 34;
      node("rect", { x: signX - pad, y: y0 - pad, width: signW + pad * 2, height: signH + pad * 2, rx: 22, fill: light ? "rgba(255,255,255,.45)" : "rgba(190,225,255,.07)", stroke: light ? "rgba(0,0,0,.3)" : "rgba(255,255,255,.4)", "stroke-width": 2 }, sign);
    } else if (cfg.b === "shape") {
      const g = node("g", { "stroke-linejoin": "round" }, sign);
      drawLines(g, { fill: "rgba(190,225,255,.13)", stroke: "rgba(190,225,255,.2)", "stroke-width": 42, "stroke-linejoin": "round", opacity: placeholder ? 0.5 : 1 });
    }

    // soft shadow the sign throws on the wall, then the wide, medium and tight glow layers and the tube itself
    const wrap = node("g", { opacity: placeholder ? 0.35 : 1 }, sign);
    const lay = (fillC, strokeC, w, extra) => Object.assign({ fill: mode === "outline" ? "none" : fillC, stroke: strokeC, "stroke-width": tubeW(w), iw: w }, extra || {});
    drawLines(node("g", { filter: "url(#gcShadow)", transform: "translate(7 12)", opacity: light ? 0.38 : 0.5 }, wrap), lay("#000", "#000", 6));
    drawLines(node("g", { filter: "url(#gcGlowWide)", opacity: light ? 0.3 : 0.9 }, wrap), i => lay(glowOf(lineColor(i).hex), glowOf(lineColor(i).hex), 18));
    drawLines(node("g", { filter: "url(#gcGlowMid)", opacity: light ? 0.35 : 0.95 }, wrap), i => lay(glowOf(lineColor(i).hex), glowOf(lineColor(i).hex), 12));
    if (!light) drawLines(node("g", { filter: "url(#gcGlowTight)" }, wrap), i => lay(lineColor(i).hex, lineColor(i).hex, 6));
    const coreAttrs = shrink > 0 ? { filter: "url(#gcCore)" } : {};
    drawLines(node("g", coreAttrs, wrap), i => lay(light ? lineColor(i).hex : tint(lineColor(i).hex), lineColor(i).hex, 2.6, { "paint-order": "stroke" }));
    if (mode === "outline") drawLines(node("g", {}, wrap), i => ({ fill: "none", stroke: light ? lineColor(i).hex : tint(lineColor(i).hex), "stroke-width": TUBE - 2.4, iw: 2 }));

    // mounting hardware: four small standoffs at the corners of the sign
    const hw = node("g", {}, sign);
    [[signX - 14, y0 - 14], [signX + signW + 14, y0 - 14], [signX - 14, y0 + signH + 14], [signX + signW + 14, y0 + signH + 14]].forEach(q => {
      node("circle", { cx: q[0] + 2, cy: q[1] + 3, r: 7, fill: "rgba(0,0,0,.4)" }, hw);
      node("circle", { cx: q[0], cy: q[1], r: 6.5, fill: light ? "#8b8782" : "#6d6a73", stroke: light ? "#5b5853" : "#35333b", "stroke-width": 1.5 }, hw);
      node("circle", { cx: q[0] - 1.8, cy: q[1] - 1.8, r: 2, fill: "rgba(255,255,255,.7)" }, hw);
    });

    // dimension marks (overall size of the sign for the chosen letters, in inches)
    const dim = node("g", { stroke: light ? "#4b465f" : "#c9c4de", "stroke-width": 2, fill: "none", "stroke-linecap": "round", opacity: 0.9 }, sign);
    const yB = y0 + signH + 52;
    node("path", { d: "M" + signX + " " + yB + "H" + (signX + signW) + "M" + signX + " " + (yB - 8) + "v16M" + (signX + signW) + " " + (yB - 8) + "v16" }, dim);
    const xR = signX + signW + 46;
    node("path", { d: "M" + xR + " " + y0 + "V" + (y0 + signH) + "M" + (xR - 8) + " " + y0 + "h16M" + (xR - 8) + " " + (y0 + signH) + "h16" }, dim);
    const est = N.estimate(cfg, RATES);
    const lab = (x, y, txt, rot) => { const t = node("text", { x, y, fill: light ? "#2d2a3a" : "#e4e0f2", stroke: "none", "font-family": "Inter, Arial, sans-serif", "font-size": 24 / k, "font-weight": 600, "text-anchor": "middle", "dominant-baseline": "central" }, sign); if (rot) t.setAttribute("transform", "rotate(-90 " + x + " " + y + ")"); t.textContent = txt; };
    const plate = light ? "#f4f1ec" : "#0a0910";
    node("rect", { x: signX + signW / 2 - 78 / k, y: yB - 18 / k, width: 156 / k, height: 36 / k, rx: 9, fill: plate }, sign);
    lab(signX + signW / 2, yB, "about " + est.size.w + " in");
    node("rect", { x: xR - 18 / k, y: y0 + signH / 2 - 78 / k, width: 36 / k, height: 156 / k, rx: 9, fill: plate }, sign);
    lab(xR, y0 + signH / 2, "about " + est.size.h + " in", true);
    return est;
  }

  function showFallbackPreview(cfg) {
    const color = N.colorOf(cfg.c), font = drawFont(cfg);
    preview.classList.add("is-fallback");
    fallback.hidden = false; svg.setAttribute("hidden", "");
    fallback.style.setProperty("--neon", color.hex); fallback.style.fontFamily = font.css;
    fallback.textContent = "";
    (cfg.t[0] ? cfg.t.filter(Boolean) : ["Your text"]).forEach(s => { const d = document.createElement("div"); d.textContent = s; fallback.appendChild(d); });
  }

  /* ---------------- rendering the whole panel ---------------- */
  const setMsg = (id, field, text, kind) => {
    const m = el("m-" + id), inp = el(field);
    m.textContent = text || ""; m.className = "msg" + (text ? " " + (kind || "err") : "");
    if (kind === "warn" || !text) inp.removeAttribute("aria-invalid"); else inp.setAttribute("aria-invalid", "true");
  };

  function render() {
    const raw = readRaw();
    const r = N.normalize(raw);
    const cfg = r.config; lastCfg = cfg; valid = r.ok;

    // labels / counters
    el("colorName").textContent = N.colorOf(cfg.c).label;
    el("fontName").textContent = N.find(N.FONTS, cfg.f).label;
    el("sizeName").textContent = N.sizeOf(cfg.z).label;
    el("c2Field").hidden = !cfg.t[1];
    needFont(drawFont(cfg));
    const bgMode = f.bg.value;
    el("bgName").textContent = bgMode === "photo" ? "Custom Background" : N.find(N.BACKDROPS, cfg.g).label;
    el("bgPhotoRow").hidden = bgMode !== "photo";
    el("dimRow").hidden = el("f-dim").hidden = el("bgRemove").hidden = !bgImg;
    el("dimOut").textContent = f.dim.value + "%";
    const len = s => Array.from(String(s).trim()).length;
    const cnt = (id, n, max) => { const c = el(id); c.textContent = n + "/" + max; c.classList.toggle("over", n > max); };
    cnt("c-l1", len(raw.t[0]), N.LIMITS.line); cnt("c-l2", len(raw.t[1]), N.LIMITS.line); cnt("c-n", len(raw.n), N.LIMITS.notes);

    // validation messages (text, not colour alone)
    setMsg("l1", "f-l1", r.errors.line1 || r.warnings.line1, r.errors.line1 ? "err" : "warn");
    setMsg("l2", "f-l2", r.errors.line2, "err");
    setMsg("n", "f-n", r.errors.notes, "err");

    // preview
    let est = N.estimate(cfg, RATES);
    if (!preview.classList.contains("is-fallback")) {
      try { if (window.__gcForcePreviewFail) throw new Error("forced"); est = draw(cfg, photoOpt()); }
      catch (e) { showFallbackPreview(cfg); }
    } else showFallbackPreview(cfg);
    el("sizeTag").textContent = est.size.label + " letters (" + est.size.letterW + " in wide, " + est.size.letterH + " in high each): the whole sign is about " + est.size.w + " × " + est.size.h + " in.";
    svg.setAttribute("aria-label", cfg.t[0]
      ? 'Preview of your sign: "' + cfg.t.filter(Boolean).join(" / ") + '" in ' + N.colorOf(cfg.c).label.toLowerCase() + (cfg.t[1] && cfg.c2 ? " and " + N.colorOf(cfg.c2).label.toLowerCase() : "") + ", " + N.find(N.FONTS, cfg.f).label.toLowerCase() + " style, " + N.sizeOf(cfg.z).label.toLowerCase() + " size, about " + est.size.w + " by " + est.size.h + " inches, on the " + (f.bg.value === "photo" ? "custom background" : N.find(N.BACKDROPS, cfg.g).label.toLowerCase()) + ". Visual approximation only."
      : "Preview placeholder. Enter your text to see the sign.");

    renderEstimate(cfg, est);
    updateLinks(cfg, est);
    scheduleAutosave(cfg);
  }

  /* ---------------- size help (the ? button beside "Select Size") ---------------- */
  (function sizeHelp() {
    const btn = el("sizeHelpBtn"), pop = el("sizeHelp");
    const set = open => { pop.hidden = !open; btn.setAttribute("aria-expanded", String(open)); };
    btn.addEventListener("click", () => set(pop.hidden));
    pop.addEventListener("click", () => set(false));
    form.addEventListener("keydown", e => { if (e.key === "Escape" && !pop.hidden) { set(false); btn.focus(); } });
  })();
  el("ownDesign").href = waUrl("Hi Grafix Club, I have my own logo/design and would like a neon sign. I will send it here.");

  function renderEstimate(cfg, est) {
    const body = el("estBody"), totalEl = el("estTotal"), conf = el("estConfirm");
    if (!valid) {
      totalEl.textContent = "–"; el("buyTotal").textContent = "–"; el("buyPrefix").textContent = ""; body.innerHTML = '<tr><td colspan="2">Fix the highlighted fields to see an estimate.</td></tr>'; conf.innerHTML = "";
      el("estPrefix").textContent = ""; return;
    }
    el("estPrefix").textContent = "Estimated from";
    totalEl.textContent = N.money(est.total);
    el("buyPrefix").textContent = "Estimated from"; el("buyTotal").textContent = N.money(est.total);
    body.innerHTML = est.rows.map(r => "<tr><th scope=\"row\">" + esc(r.label) + "</th><td>" + N.money(r.amount) + "</td></tr>").join("") +
      '<tr class="sum"><th scope="row">Estimated total</th><td>' + N.money(est.total) + "</td></tr>";
    if (est.toConfirm.length) {
      conf.innerHTML = '<div class="callout"><b>Needs a manual quote</b><p>These choices are not in the number above. We price them by hand after checking your design:</p><ul>' +
        est.toConfirm.map(t => "<li>" + esc(t) + "</li>").join("") + "</ul></div>";
    } else {
      conf.innerHTML = '<p class="hint">Based on the published per-sq-ft rate. We confirm the final price after a design check.</p>';
    }
  }

  /* ---------------- enquiry links ---------------- */
  function message(cfg, est, withUrl) {
    return N.buildMessage(cfg, est, { designUrl: withUrl ? designUrl(cfg) : "", hasFile: !!file });
  }
  function updateLinks(cfg, est) {
    const wa = el("sendWa"), mail = el("sendMail");
    const msg = valid ? message(cfg, est, true) : "";
    wa.href = valid ? waUrl(msg) : "#studio-form-start";
    mail.href = valid ? "mailto:" + CONFIG.email + "?subject=" + encodeURIComponent("Neon sign design: " + cfg.t.filter(Boolean).join(" ")) + "&body=" + encodeURIComponent(msg) : "#studio-form-start";
    const top = el("sendWaTop"); top.href = wa.href;
    [wa, mail, top].forEach(a => a.setAttribute("aria-disabled", String(!valid)));
    const u = valid ? designUrl(cfg) : "";
    el("designUrl").value = u || (valid ? "Link sharing needs the live website address" : "");
    el("copyLink").disabled = !valid || !u;
    el("saveBtn").disabled = !valid;
    const share = el("shareBtn");
    if (navigator.share) { share.hidden = false; share.disabled = !valid; }
  }

  let guard = 0;
  function guardSend(e, label) {
    if (!valid) { e.preventDefault(); touchedSend = true; render(); (f.l1.getAttribute("aria-invalid") ? f.l1 : f.l2.getAttribute("aria-invalid") ? f.l2 : f.notes).focus(); announce("Please fix the highlighted fields first."); return false; }
    if (Date.now() - guard < 1500) { e.preventDefault(); return false; }
    guard = Date.now(); announce(label); return true;
  }
  el("sendWa").addEventListener("click", e => guardSend(e, "Opening WhatsApp with your design."));
  el("sendWaTop").addEventListener("click", e => guardSend(e, "Opening WhatsApp with your design."));
  el("sendMail").addEventListener("click", e => guardSend(e, "Opening your e-mail app with your design."));

  el("shareBtn").addEventListener("click", async e => {
    if (!guardSend(e, "Opening the share sheet.")) return;
    const cfg = lastCfg, est = N.estimate(cfg, RATES);
    const data = { title: "My neon sign design", text: message(cfg, est, false) };
    const u = designUrl(cfg); if (u) data.url = u;
    try {
      if (file && navigator.canShare && navigator.canShare({ files: [file] })) data.files = [file];
      await navigator.share(data);
    } catch (err) { if (err && err.name !== "AbortError") announce("Sharing is not available here. Use WhatsApp or e-mail instead."); }
  });

  el("copyLink").addEventListener("click", async () => {
    const box = el("designUrl");
    try { await navigator.clipboard.writeText(box.value); announce("Design link copied."); el("copyNote").textContent = "Link copied."; }
    catch (e) { box.focus(); box.select(); el("copyNote").textContent = "Press Ctrl+C (or long-press) to copy the selected link."; announce("Link selected. Copy it manually."); }
    setTimeout(() => { el("copyNote").textContent = ""; }, 4000);
  });
  el("designUrl").addEventListener("focus", e => e.target.select());

  /* ---------------- reset / presets ---------------- */
  function resetAll() {
    clearFile(); dropBg(); writeCfg(N.normalize(N.DEFAULTS).config); safeStore.del(LS_DRAFT); render();
    announce("Design reset to the starting sign."); f.l1.focus();
  }
  el("resetBtn").addEventListener("click", resetAll);
  el("presets").innerHTML = N.PRESETS.map(p => '<button type="button" class="btn btn-ghost btn-sm" data-preset="' + p.key + '">' + esc(p.label) + "</button>").join("");
  function applyPreset(key, silent) {
    const p = N.PRESETS.find(x => x.key === key); if (!p) return false;
    writeCfg(N.normalize(Object.assign({}, N.DEFAULTS, p.cfg)).config); render();
    if (!silent) announce("Started from the " + p.label + " example.");
    return true;
  }
  el("presets").addEventListener("click", e => { const b = e.target.closest("[data-preset]"); if (b) applyPreset(b.dataset.preset); });

  /* ---------------- reference file ---------------- */
  function clearFile() {
    if (fileUrl) URL.revokeObjectURL(fileUrl);
    file = null; fileUrl = ""; el("f-file").value = "";
    el("fileChip").hidden = true; el("fileChip").textContent = ""; setMsg("file", "f-file", "");
  }
  el("f-file").addEventListener("change", async e => {
    const picked = e.target.files && e.target.files[0];
    if (!picked) { clearFile(); render(); return; }
    let head = new Uint8Array(0);
    try { head = new Uint8Array(await picked.slice(0, 16).arrayBuffer()); } catch (err) { /* unreadable file is rejected below */ }
    const res = N.checkFile({ type: picked.type, size: picked.size, name: picked.name }, head, CONFIG.maxUploadMB);
    if (!res.ok) { clearFile(); setMsg("file", "f-file", res.message, "err"); announce(res.message); render(); return; }
    clearFile(); file = picked; setMsg("file", "f-file", "");
    const chip = el("fileChip"); chip.hidden = false; chip.textContent = "";
    if (res.type !== "application/pdf") { fileUrl = URL.createObjectURL(picked); const im = document.createElement("img"); im.src = fileUrl; im.alt = "Preview of your reference image"; im.width = 56; im.height = 56; chip.appendChild(im); }
    const name = document.createElement("span"); name.className = "fname"; name.textContent = picked.name + " (" + Math.max(1, Math.round(picked.size / 1024)) + " KB)"; chip.appendChild(name);
    const rm = document.createElement("button"); rm.type = "button"; rm.className = "btn btn-ghost btn-sm"; rm.textContent = "Remove"; rm.setAttribute("aria-label", "Remove reference file " + picked.name);
    rm.addEventListener("click", () => { clearFile(); render(); announce("Reference file removed."); el("f-file").focus(); });
    chip.appendChild(rm);
    announce("Reference file added: " + picked.name + ".");
    render();
  });

  /* ---------------- own wall photo for the preview (never uploaded, never saved) ---------------- */
  function dropBg() {
    if (bgUrl) URL.revokeObjectURL(bgUrl);
    bgUrl = ""; bgImg = null; el("f-bgfile").value = ""; setMsg("bg", "f-bgfile", "");
    if (f.bg.value === "photo") f.bg.value = "mauve";
  }
  el("f-bgfile").addEventListener("change", async e => {
    const picked = e.target.files && e.target.files[0];
    const fail = msg => { el("f-bgfile").value = ""; setMsg("bg", "f-bgfile", msg, "err"); announce(msg); render(); };
    if (!picked) return;
    let head = new Uint8Array(0);
    try { head = new Uint8Array(await picked.slice(0, 16).arrayBuffer()); } catch (err) { /* rejected below */ }
    const res = N.checkFile({ type: picked.type, size: picked.size, name: picked.name }, head, CONFIG.maxUploadMB);
    if (!res.ok) return fail(res.message);
    if (res.type === "application/pdf") return fail("Please choose a PNG, JPG or WebP photo for the background.");
    const url = URL.createObjectURL(picked), img = new Image();
    img.onload = () => {
      if (bgUrl) URL.revokeObjectURL(bgUrl);
      bgUrl = url; bgImg = img; setMsg("bg", "f-bgfile", ""); f.bg.value = "photo";
      announce("Wall photo added to the preview."); render();
    };
    img.onerror = () => { URL.revokeObjectURL(url); fail("We could not read that image. Please try another photo."); };
    img.src = url;
  });
  el("bgRemove").addEventListener("click", () => { dropBg(); render(); announce("Wall photo removed."); const r = form.querySelector("input[name=bg][value=photo]"); if (r) r.focus(); });

  /* ---------------- saved designs ---------------- */
  const loadSaved = () => {
    try { const a = JSON.parse(safeStore.get(LS_SAVED) || "[]"); return Array.isArray(a) ? a.filter(s => s && typeof s.d === "string" && N.decode(s.d)).slice(0, MAX_SAVED) : []; } catch (e) { return []; }
  };
  function renderSaved() {
    const list = el("savedList"), items = loadSaved();
    list.textContent = "";
    el("savedEmpty").hidden = items.length > 0;
    items.forEach((s, i) => {
      const cfg = N.decode(s.d), li = document.createElement("li");
      const load = document.createElement("button"); load.type = "button"; load.className = "saved-load"; load.textContent = N.summary(cfg);
      load.addEventListener("click", () => { clearFile(); writeCfg(cfg); render(); announce("Loaded saved design: " + N.summary(cfg)); el("f-l1").focus(); });
      const del = document.createElement("button"); del.type = "button"; del.className = "saved-del"; del.textContent = "Delete"; del.setAttribute("aria-label", "Delete saved design " + N.summary(cfg));
      del.addEventListener("click", () => {
        const next = loadSaved().filter((_, j) => j !== i); safeStore.set(LS_SAVED, JSON.stringify(next)); renderSaved(); announce("Saved design deleted.");
        (list.querySelector("button") || el("saveBtn")).focus();
      });
      li.append(load, del); list.appendChild(li);
    });
  }
  el("saveBtn").addEventListener("click", () => {
    if (!valid) return;
    const enc = N.encode(lastCfg), cur = loadSaved().filter(s => s.d !== enc);
    cur.unshift({ d: enc, t: Date.now() });
    const ok = safeStore.set(LS_SAVED, JSON.stringify(cur.slice(0, MAX_SAVED)));
    renderSaved();
    announce(ok ? "Design saved on this device. You can have up to " + MAX_SAVED + "." : "Could not save: your browser is blocking storage. Use Copy design link instead.");
    el("savedNote").textContent = ok ? "Saved on this device only." : "Saving is blocked in this browser. Use the link instead.";
  });

  let saveTimer = 0;
  function scheduleAutosave(cfg) {
    clearTimeout(saveTimer);
    if (!valid) return;
    saveTimer = setTimeout(() => safeStore.set(LS_DRAFT, N.encode(cfg)), 500);
  }

  /* ---------------- events ---------------- */
  // "input" fires for typing, the slider and radio buttons, so one listener covers every control.
  form.addEventListener("input", render);
  form.addEventListener("submit", e => e.preventDefault());

  /* ---------------- "how is this estimated" text, built from the live settings ---------------- */
  (function howText() {
    let t = "The sign's length comes from your text: each letter takes the width of the size you pick (" + N.SIZES.map(z => z.label + " " + z.w + " in").join(", ") + "), and its height is the size's letter height (" + N.SIZES.map(z => z.h + " in").join(", ") + ") for each line. " +
      "The neon price is that width multiplied by that height, charged at " + N.money(RATES.neonRatePerSqFt) + " per sq ft and rounded to the nearest ₹100. " +
      "An acrylic backing adds the difference between our neon-with-backboard rate (" + N.money(RATES.neonBackboardRatePerSqFt) + " per sq ft) and the neon rate. " +
      "Orders that come to less than " + N.money(RATES.neonMinPrice) + " are shown at " + N.money(RATES.neonMinPrice) + ". " +
      "Outdoor use, fitting, symbols and your notes are quoted by hand. GST extra where applicable. This is an estimate, not an offer, and no payment is taken on this website.";
    if (typeof GCCatalogue !== "undefined") {
      const ref = GCCatalogue.byId.get("neon-name-sign");
      if (ref && RATES.neonMinPrice < ref.price) t += " Our price list shows a custom neon name sign (up to 2 ft wide) from " + N.money(ref.price) + ", while this builder prices by area, so a small sign can show a lower number here. We confirm which price applies when we quote.";
    }
    el("howText").textContent = t;
  })();

  /* lets the Design collection open a ready-made design in this studio */
  window.GCStudio = { load(cfg, title) {
    const c = N.normalize(Object.assign({}, N.DEFAULTS, cfg)).config;
    writeCfg(c); render();
    const n = el("restoreNote"); n.textContent = "Started from the \u201C" + (title || "collection") + "\u201D design. Change anything you like."; n.hidden = false; announce(n.textContent);
    const s = el("studio"); if (s) s.scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
    setTimeout(() => f.l1.focus({ preventScroll: true }), 400);
  } };

  /* ---------------- initial state: link > preset > draft > default ---------------- */
  (function init() {
    const sp = new URLSearchParams(location.search);
    const shared = sp.get("design");
    let status = "";
    if (shared !== null) {
      const cfg = N.decode(shared);
      if (cfg) { writeCfg(cfg); status = "Design restored from the link you opened."; }
      else { writeCfg(N.normalize(N.DEFAULTS).config); status = "That design link could not be read, so we are showing the starting sign instead."; }
    } else if (sp.get("preset") && N.PRESETS.some(p => p.key === sp.get("preset"))) {
      applyPreset(sp.get("preset"), true);
    } else {
      const draft = N.decode(safeStore.get(LS_DRAFT));
      if (draft) { writeCfg(draft); status = "Restored the design you were working on last time."; }
      else writeCfg(N.normalize(N.DEFAULTS).config);
    }
    render(); renderSaved();
    if (status) { const n = el("restoreNote"); n.textContent = status; n.hidden = false; announce(status); }
    if (shared !== null && cfgIsValidLink(shared)) { const s = el("studio"); if (s && !location.hash) s.scrollIntoView(); }
  })();
  function cfgIsValidLink(s) { return !!N.decode(s); }
})();
