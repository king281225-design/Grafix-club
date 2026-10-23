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

  /** Font chips grouped by style; each chip is drawn in its own font. */
  function fontGroupsHtml() {
    const groups = [];
    N.FONTS.forEach(ft => { let g = groups.find(x => x.name === ft.group); if (!g) groups.push(g = { name: ft.group, items: [] }); g.items.push(ft); });
    let first = true;
    return groups.map(g => '<div class="chip-group" role="group" aria-label="' + esc(g.name) + '"><p class="group-h">' + esc(g.name) + '</p><div class="chips">' + g.items.map(ft => {
      const html = '<label class="ochip chip-font"><input type="radio" name="font" value="' + ft.key + '"' + (first ? " checked" : "") + '><span class="chip-body"><span class="chip-t"' + (ft.deva ? ' lang="hi"' : "") + ' style="font-family:' + ft.css + '">' + esc(ft.label) + "</span></span></label>";
      first = false; return html;
    }).join("") + "</div></div>").join("");
  }

  const stepH = (n, t) => '<h4 class="step"><span class="step-n" aria-hidden="true">' + n + "</span>" + t + "</h4>";
  const SIZES = [{ w: 2, label: "Regular" }, { w: 3, label: "Medium" }, { w: 4, label: "Large" }, { w: 5, label: "Extra large" }];
  const sizeCardsHtml = () => '<div class="chips size-cards">' + SIZES.map(z =>
    '<label class="ochip size-card"><input type="radio" name="sizepreset" value="' + z.w + '"><span class="chip-body"><span class="chip-t">' + z.label + '</span><small class="chip-h" id="sz-dim-' + z.w + '"></small><b class="sz-price" id="sz-price-' + z.w + '"></b></span></label>').join("") + "</div>";

  const formHtml =
    stepH(1, "Type your text") +
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
    stepH(2, "Pick your font") +
    fieldset('Style: <b id="fontName"></b>', fontGroupsHtml()) +
    stepH(3, "Select your colour") +
    fieldset('Colour: <b id="colorName"></b>', '<div class="swatches">' + N.COLORS.map((c, i) =>
      '<label class="swatch" style="--c:' + c.hex + '"><input type="radio" name="color" value="' + c.key + '"' + (i === 0 ? " checked" : "") + '><span class="sw-dot" aria-hidden="true"></span><span class="sr-only">' + esc(c.label) + "</span></label>").join("") +
      '<label class="swatch swatch-custom" id="customSwatch" style="--c:#ff2e93"><input type="radio" name="color" value="custom"><span class="sw-dot" aria-hidden="true"></span><span class="sr-only">Custom colour</span></label>' +
      '<label class="custom-pick" for="f-custom">Pick your own <input type="color" id="f-custom" name="custom" value="#ff2e93"></label></div>' +
      '<p class="msg" id="m-color" aria-live="polite"></p>') +
    '<div class="field" id="c2Field" hidden>' +
      '<label for="f-c2">Line 2 colour <em class="opt">(optional, for a two-colour sign)</em></label>' +
      '<select id="f-c2" name="c2"><option value="">Same as line 1</option>' + N.COLORS.map(c => '<option value="' + c.key + '">' + esc(c.label) + "</option>").join("") + "</select>" +
    "</div>" +
    stepH(4, "Select your size") +
    fieldset('Size: <b id="sizeName"></b>', sizeCardsHtml() + '<p class="hint">Heights are approximate: they depend on your lettering style and number of lines. The price on each card is the estimate for your text at that width.</p>') +
    '<div class="field">' +
      '<div class="field-row"><label for="f-w">Exact width <em class="opt">(or pick a size above)</em></label><output id="widthOut" for="f-w"></output></div>' +
      '<input type="range" id="f-w" name="width" min="' + N.LIMITS.wMin + '" max="' + N.LIMITS.wMax + '" step="' + N.LIMITS.wStep + '" value="3" aria-describedby="h-w">' +
      '<p class="hint" id="h-w">From ' + N.LIMITS.wMin + " to " + N.LIMITS.wMax + " feet. Height follows from the style and number of lines.</p>" +
    "</div>" +
    stepH(5, "Add-ons") +
    fieldset("Backing", '<div class="chips col">' + radios("backing", N.BACKINGS) + "</div>") +
    fieldset("Where will it be used?", '<div class="chips">' + radios("use", N.USES) + "</div>") +
    fieldset("Mounting and fitting", '<div class="chips">' + radios("fit", N.FITTINGS) + "</div>") +
    fieldset("Symbol (optional)", '<div class="chips">' + radios("icon", N.ICONS, o => (o.d ? '<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="' + o.d + '" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>' : "") + '<span class="chip-t">' + esc(o.label) + "</span>") + "</div>") +
    '<div class="own-design"><b>Have your own logo or design?</b><p>Send it to us on WhatsApp and we will reply with a mock-up and a price.</p><a class="btn btn-ghost btn-sm" id="ownDesign" target="_blank" rel="noopener">WhatsApp us your design<span class="sr-only"> (opens in a new tab)</span></a></div>' +
    stepH(6, "Make it yours") +
    fieldset("Preview background", '<div class="chips bg-chips">' +
      radios("bg", N.BACKDROPS.concat([{ key: "custom", label: "Your colour", c: "" }, { key: "photo", label: "Your wall photo", c: "" }]), o =>
        '<span class="bg-dot' + (o.key === "custom" ? " bg-custom" : o.key === "photo" ? " bg-photo" : "") + '" style="--b:' + (o.c || "#888") + '" aria-hidden="true"></span><span class="chip-t">' + esc(o.label) + "</span>") + "</div>" +
      '<div class="bg-extra" id="bgCustomRow" hidden><label class="custom-pick" for="f-bgcolor">Wall colour <input type="color" id="f-bgcolor" name="bgcolor" value="#1b1b2f"></label></div>' +
      '<div class="bg-extra" id="bgPhotoRow" hidden>' +
        '<label for="f-bgfile">Photo of your wall <em class="opt">(PNG, JPG or WebP)</em></label>' +
        '<input type="file" id="f-bgfile" accept="image/png,image/jpeg,image/webp" aria-describedby="h-bgfile m-bg">' +
        '<p class="hint" id="h-bgfile">Up to ' + CONFIG.maxUploadMB + " MB. It stays on your device and is only used for this preview, so it is not sent or saved. If you want us to see your wall, attach the same photo in the chat.</p>" +
        '<p class="msg" id="m-bg" aria-live="polite"></p>' +
        '<div class="field-row" id="dimRow" hidden><label for="f-dim">Darken photo</label><output id="dimOut" for="f-dim"></output></div>' +
        '<input type="range" id="f-dim" name="dim" min="0" max="70" step="5" value="35" hidden>' +
        '<button type="button" class="btn btn-ghost btn-sm" id="bgRemove" hidden>Remove wall photo</button>' +
      "</div>" +
      '<p class="hint">Only changes how the preview looks, so you can imagine the sign on your own wall. It never changes the price.</p>') +
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
    '<div class="form-actions"><button type="button" class="btn btn-ghost" id="resetBtn">Reset design</button></div>';

  const form = $("#studioForm");
  form.innerHTML = formHtml;
  const f = form.elements;
  const preview = $("#preview"), svg = $("#neonSvg"), fallback = $("#neonFallback");
  const el = id => document.getElementById(id);

  /* ---------------- state ---------------- */
  let bgUrl = "", bgImg = null, file = null, fileUrl = "", lastCfg = N.normalize(N.DEFAULTS).config, valid = true, touchedSend = false, restoredNote = "";

  const readRaw = () => ({ t: [f.l1.value, f.l2.value], f: f.font.value, c: f.color.value === "custom" ? f.custom.value : f.color.value, c2: f.c2.value, g: f.bg.value, gc: f.bgcolor.value, w: f.width.value, b: f.backing.value, u: f.use.value, x: f.fit.value, i: f.icon.value, n: f.notes.value });
  function writeCfg(cfg) {
    f.l1.value = cfg.t[0]; f.l2.value = cfg.t[1] || ""; f.font.value = cfg.f;
    if (/^#/.test(cfg.c)) { f.color.value = "custom"; f.custom.value = cfg.c; } else f.color.value = cfg.c;
    f.c2.value = cfg.c2 || ""; f.bg.value = cfg.g || "night"; if (cfg.gc) f.bgcolor.value = cfg.gc; f.width.value = cfg.w;
    f.backing.value = cfg.b; f.use.value = cfg.u; f.fit.value = cfg.x; f.icon.value = cfg.i; f.notes.value = cfg.n || "";
  }
  f.custom.addEventListener("input", () => { f.color.value = "custom"; });
  f.bgcolor.addEventListener("input", () => { f.bg.value = "custom"; });
  const baseUrl = () => location.href.split(/[?#]/)[0];
  const designUrl = cfg => (location.protocol === "file:" ? "" : baseUrl() + "?design=" + N.encode(cfg) + "#studio");

  /* ---------------- lazy font loading ----------------
     1) one small request with only the glyphs the style buttons need (so every button shows in its own font), and
     2) the full font for whichever style is selected, loaded when it is first chosen. */
  let fontsRequested = false; const loadedFonts = new Set();
  const gfFamily = ft => "family=" + encodeURIComponent(ft.gf).replace(/%20/g, "+");
  const addCss = href => { const link = document.createElement("link"); link.rel = "stylesheet"; link.href = href; document.head.appendChild(link); };
  function needFont(key) {
    if (!fontsRequested) return;
    const ft = N.find(N.FONTS, key); if (loadedFonts.has(ft.gf)) return; loadedFonts.add(ft.gf);
    addCss("https://fonts.googleapis.com/css2?" + gfFamily(ft) + "&display=swap");
    if (document.fonts) document.fonts.load('48px "' + ft.gf + '"').catch(() => {});
  }
  function ensureFonts() {
    if (fontsRequested) return; fontsRequested = true;
    const glyphs = Array.from(new Set(N.FONTS.map(ft => ft.label).join(""))).join("");
    addCss("https://fonts.googleapis.com/css2?" + N.FONTS.map(gfFamily).join("&") + "&text=" + encodeURIComponent(glyphs) + "&display=swap");
    if (document.fonts) document.fonts.addEventListener("loadingdone", () => draw(lastCfg, photoOpt()));
    needFont(lastCfg.f);
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

  function measureWidth(text, fontCss, size) {
    const t = node("text", { "font-family": fontCss, "font-size": size, x: 0, y: 0, visibility: "hidden" }, svg);
    t.textContent = text || " ";
    let w = 0;
    try { w = t.getBBox().width; } catch (e) { w = 0; }
    svg.removeChild(t);
    return w || text.length * size * 0.58;   // rough width if the browser cannot measure yet
  }

  const photoOpt = () => (f.bg.value === "photo" && bgImg ? { url: bgUrl, dim: +f.dim.value } : null);
  /** Fills <defs> with the chosen wall (pattern or gradient) under the id gcWall. */
  function paintWall(defs, cfg) {
    const pat = (w, h) => node("pattern", { id: "gcWall", width: w, height: h, patternUnits: "userSpaceOnUse" }, defs);
    const grad = (c1, c2) => { const g = node("linearGradient", { id: "gcWall", x1: 0, y1: 0, x2: 0.6, y2: 1 }, defs); node("stop", { offset: "0", "stop-color": c1 }, g); node("stop", { offset: "1", "stop-color": c2 }, g); };
    const dots = (p, color, pts) => pts.forEach(q => node("circle", { cx: q[0], cy: q[1], r: q[2] || 1.2, fill: color }, p));
    switch (cfg.g) {
      case "brick": { const p = pat(120, 60); node("rect", { width: 120, height: 60, fill: "#2d1713" }, p); node("path", { d: "M0 0h120M0 30h120M0 60h120M0 0v30M60 0v30M30 30v30M90 30v30", stroke: "#1b0e0c", "stroke-width": 3, fill: "none" }, p); break; }
      case "wood": { const p = pat(90, 24); node("rect", { width: 90, height: 24, fill: "#2a1c12" }, p); node("path", { d: "M0 0v24M45 0v24", stroke: "#150e08", "stroke-width": 3, fill: "none" }, p); node("path", { d: "M18 0v24M66 0v24", stroke: "#36251a", "stroke-width": 1.5, fill: "none" }, p); break; }
      case "light": { const p = pat(40, 40); node("rect", { width: 40, height: 40, fill: "#ddd7cd" }, p); dots(p, "#cfc8bc", [[12, 14], [29, 31]]); break; }
      case "cream": { const p = pat(50, 50); node("rect", { width: 50, height: 50, fill: "#efe6d2" }, p); dots(p, "#e2d7bd", [[10, 12], [34, 20], [22, 40], [44, 44]]); break; }
      case "marble": { const p = pat(400, 300); node("rect", { width: 400, height: 300, fill: "#e9e9ec" }, p); node("path", { d: "M-10 60C80 90 120 20 210 70S330 130 410 80M60 300C100 220 190 230 230 150S320 60 360 -10", stroke: "#c4c4cc", "stroke-width": 2.4, fill: "none", opacity: 0.8 }, p); node("path", { d: "M-10 200C60 170 150 210 220 190S340 230 410 190", stroke: "#d4d4da", "stroke-width": 1.4, fill: "none" }, p); break; }
      case "concrete": { const p = pat(60, 60); node("rect", { width: 60, height: 60, fill: "#3b3e44" }, p); node("path", { d: "M0 59h60M59 0v59", stroke: "#2f3237", "stroke-width": 2, fill: "none" }, p); dots(p, "#45484f", [[9, 11], [38, 17], [22, 42], [51, 49], [15, 29]]); dots(p, "#34373c", [[28, 8], [45, 33], [6, 50]]); break; }
      case "terracotta": { const p = pat(50, 50); node("rect", { width: 50, height: 50, fill: "#6a3524" }, p); dots(p, "#783d2a", [[10, 12], [34, 20], [22, 40], [44, 44]]); dots(p, "#5d2e1f", [[28, 6], [6, 34], [40, 8]]); break; }
      case "black": { const p = pat(80, 80); node("rect", { width: 80, height: 80, fill: "#050507" }, p); break; }
      case "navy": grad("#0b1330", "#16306a"); break;
      case "purple": grad("#1b0833", "#4d1263"); break;
      case "green": grad("#0a1f16", "#17452f"); break;
      case "custom": { const p = pat(40, 40); node("rect", { width: 40, height: 40, fill: cfg.gc }, p); break; }
      default: { const p = pat(80, 40); node("rect", { width: 80, height: 40, fill: "#100e17" }, p); node("path", { d: "M0 39h80M40 0v39", stroke: "#1a1724", "stroke-width": 2, fill: "none" }, p); }
    }
  }

  function draw(cfg, bgPhoto) {
    const font = N.find(N.FONTS, cfg.f), color = N.colorOf(cfg.c);
    const color2 = cfg.t[1] && cfg.c2 ? N.colorOf(cfg.c2) : color, light = !bgPhoto && N.isLightWall(cfg);
    const lineColor = i => (i === 1 ? color2 : color);
    const lines = (cfg.t[1] ? [cfg.t[0], cfg.t[1]] : [cfg.t[0]]);
    const show = lines.map(s => s || "");
    const placeholder = !show[0];
    if (placeholder) show[0] = "Your text";
    const W = 800, signX = 80, signW = 600, y0 = 56;
    const signH = Math.round(signW * font.ratio * lines.length), band = signH / lines.length;
    const H = y0 + signH + 96;
    const icon = N.find(N.ICONS, cfg.i);
    const iconSize = icon.d ? Math.min(band * 0.7, 150) : 0, gap = icon.d ? 36 : 0;
    const textLeft = signX + iconSize + gap, textW = signW - iconSize - gap, cx = textLeft + textW / 2;

    while (svg.firstChild) svg.removeChild(svg.firstChild);
    svg.setAttribute("viewBox", "0 0 " + W + " " + H);
    const defs = node("defs", {}, svg);
    const mkFilter = (id, dev) => { const fl = node("filter", { id, x: "-30%", y: "-60%", width: "160%", height: "220%" }, defs); node("feGaussianBlur", { stdDeviation: dev }, fl); };
    mkFilter("gcGlowWide", 17); mkFilter("gcGlowTight", 5);
    paintWall(defs, cfg);
    node("rect", { x: 0, y: 0, width: W, height: H, fill: "url(#gcWall)" }, svg);
    if (bgPhoto) {
      const clip = node("clipPath", { id: "gcBgClip" }, defs); node("rect", { x: 0, y: 0, width: W, height: H }, clip);
      node("image", { href: bgPhoto.url, x: 0, y: 0, width: W, height: H, preserveAspectRatio: "xMidYMid slice", "clip-path": "url(#gcBgClip)" }, svg);
      node("rect", { x: 0, y: 0, width: W, height: H, fill: "#000", opacity: bgPhoto.dim / 100 }, svg);
    }

    // font size: fit the widest line to the available width, never taller than the line band
    const probe = 100;
    const widest = Math.max.apply(null, show.map(s => measureWidth(s, font.css, probe)));
    const fs = Math.max(18, Math.min(probe * textW / widest, band * 0.92));

    // sign area outline (what the estimate is based on)
    node("rect", { x: signX, y: y0, width: signW, height: signH, rx: 10, fill: "none", stroke: light ? "rgba(0,0,0,.3)" : "rgba(255,255,255,.22)", "stroke-width": 2, "stroke-dasharray": "10 8" }, svg);

    const drawLines = (parent, attrsIn) => {
      const attrsFor = i => (typeof attrsIn === "function" ? attrsIn(i) : attrsIn), attrs = attrsFor(0);
      show.forEach((s, i) => {
        const t = node("text", Object.assign({ x: cx, y: y0 + band * (i + 0.5), "text-anchor": "middle", "dominant-baseline": "central", "font-family": font.css, "font-size": fs }, attrsFor(i)), parent);
        t.textContent = s;
      });
      if (icon.d) {
        const sc = iconSize / 24, cyI = y0 + signH / 2;
        const p = node("path", Object.assign({ d: icon.d, transform: "translate(" + signX + " " + (cyI - iconSize / 2) + ") scale(" + sc + ")", "stroke-linejoin": "round", "stroke-linecap": "round" }, attrs), parent);
        if (attrs.fill !== "none") p.setAttribute("fill", "none");
        p.setAttribute("stroke-width", String(((+attrs["stroke-width"] || 2) * 0.9) / sc));
      }
    };

    // backing
    if (cfg.b === "rect") {
      const pad = 34;
      node("rect", { x: signX - pad, y: y0 - pad, width: signW + pad * 2, height: signH + pad * 2, rx: 22, fill: light ? "rgba(255,255,255,.45)" : "rgba(190,225,255,.07)", stroke: light ? "rgba(0,0,0,.3)" : "rgba(255,255,255,.4)", "stroke-width": 2 }, svg);
      [[-pad + 16, -pad + 16], [signW + pad - 16, -pad + 16], [-pad + 16, signH + pad - 16], [signW + pad - 16, signH + pad - 16]].forEach(p => node("circle", { cx: signX + p[0], cy: y0 + p[1], r: 5, fill: "rgba(255,255,255,.3)" }, svg));
    } else if (cfg.b === "shape") {
      const g = node("g", { "stroke-linejoin": "round" }, svg);
      drawLines(g, { fill: "rgba(190,225,255,.13)", stroke: "rgba(190,225,255,.2)", "stroke-width": 42, "stroke-linejoin": "round", opacity: placeholder ? 0.5 : 1 });
    }

    const wrap = node("g", { opacity: placeholder ? 0.35 : 1 }, svg);
    drawLines(node("g", { filter: "url(#gcGlowWide)", opacity: light ? 0.55 : 0.95 }, wrap), i => ({ fill: lineColor(i).hex, stroke: lineColor(i).hex, "stroke-width": 9 }));
    drawLines(node("g", { filter: "url(#gcGlowTight)" }, wrap), i => ({ fill: lineColor(i).hex, stroke: lineColor(i).hex, "stroke-width": 5 }));
    drawLines(node("g", {}, wrap), i => ({ fill: light ? lineColor(i).hex : tint(lineColor(i).hex), stroke: lineColor(i).hex, "stroke-width": 2.4, "paint-order": "stroke" }));

    // dimension marks
    const dim = node("g", { stroke: light ? "#4b465f" : "#a9a3c0", "stroke-width": 2, fill: "none", "stroke-linecap": "round" }, svg);
    const yB = y0 + signH + 46;
    node("path", { d: "M" + signX + " " + yB + "H" + (signX + signW) + "M" + signX + " " + (yB - 8) + "v16M" + (signX + signW) + " " + (yB - 8) + "v16" }, dim);
    const xR = signX + signW + 42;
    node("path", { d: "M" + xR + " " + y0 + "V" + (y0 + signH) + "M" + (xR - 8) + " " + y0 + "h16M" + (xR - 8) + " " + (y0 + signH) + "h16" }, dim);
    const est = N.estimate(cfg, RATES);
    const lab = (x, y, txt, rot) => { const t = node("text", { x, y, fill: "#c9c4de", stroke: "none", "font-family": "Inter, Arial, sans-serif", "font-size": 27, "font-weight": 600, "text-anchor": "middle", "dominant-baseline": "central" }, svg); if (rot) t.setAttribute("transform", "rotate(-90 " + x + " " + y + ")"); t.textContent = txt; };
    // labels sit on a small dark plate so the line never crosses the text
    node("rect", { x: signX + signW / 2 - 62, y: yB - 18, width: 124, height: 36, rx: 8, fill: "#0a0910" }, svg);
    lab(signX + signW / 2, yB, cfg.w + " ft");
    node("rect", { x: xR - 18, y: y0 + signH / 2 - 90, width: 36, height: 180, rx: 8, fill: "#0a0910" }, svg);
    lab(xR, y0 + signH / 2, "about " + est.size.h + " ft", true);
    return est;
  }

  function showFallbackPreview(cfg) {
    const color = N.colorOf(cfg.c), font = N.find(N.FONTS, cfg.f);
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
    el("c2Field").hidden = !cfg.t[1];
    el("customSwatch").style.setProperty("--c", f.custom.value);
    const cm = el("m-color"); cm.textContent = r.warnings.color || ""; cm.className = "msg" + (r.warnings.color ? " warn" : "");
    needFont(cfg.f);
    const bgMode = f.bg.value;
    el("bgCustomRow").hidden = bgMode !== "custom"; el("bgPhotoRow").hidden = bgMode !== "photo";
    el("dimRow").hidden = el("f-dim").hidden = el("bgRemove").hidden = !bgImg;
    el("dimOut").textContent = f.dim.value + "%";
    el("widthOut").textContent = cfg.w + " ft";
    f.width.setAttribute("aria-valuetext", cfg.w + (cfg.w === 1 ? " foot" : " feet"));
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
    const sizeTxt = "Approx. " + est.size.w + " ft wide × " + est.size.h + " ft high (" + est.size.area + " sq ft)";
    el("sizeTag").textContent = sizeTxt;
    svg.setAttribute("aria-label", cfg.t[0]
      ? 'Preview of your sign: "' + cfg.t.filter(Boolean).join(" / ") + '" in ' + N.colorOf(cfg.c).label.toLowerCase() + (cfg.t[1] && cfg.c2 ? " and " + N.colorOf(cfg.c2).label.toLowerCase() : "") + ", " + N.find(N.FONTS, cfg.f).label.toLowerCase() + " style, about " + cfg.w + " feet wide. Visual approximation only."
      : "Preview placeholder. Enter your text to see the sign.");

    updateSizeCards(cfg);
    renderEstimate(cfg, est);
    updateLinks(cfg, est);
    scheduleAutosave(cfg);
  }

  /* ---------------- size cards: width x height and price for each size, for the current text and style ---------------- */
  const inch = ft => Math.max(1, Math.round(ft * 12));
  function updateSizeCards(cfg) {
    let matched = "";
    SIZES.forEach(z => {
      const e = N.estimate(Object.assign({}, cfg, { w: z.w }), RATES);
      el("sz-dim-" + z.w).textContent = inch(z.w) + " \u00D7 " + inch(e.size.h) + " in";
      el("sz-price-" + z.w).textContent = valid ? N.money(e.total) : "";
      if (cfg.w === z.w) matched = String(z.w);
    });
    form.querySelectorAll("input[name=sizepreset]").forEach(r => { r.checked = r.value === matched; });
    const lab = SIZES.find(z => z.w === cfg.w);
    el("sizeName").textContent = lab ? lab.label : "Custom (" + cfg.w + " ft wide)";
  }
  Array.from(form.querySelectorAll("input[name=sizepreset]")).forEach(r => r.addEventListener("input", () => { if (r.checked) f.width.value = r.value; }));
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
    if (f.bg.value === "photo") f.bg.value = "night";
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
    let t = "The neon price is the sign's width multiplied by its estimated height, charged at " + N.money(RATES.neonRatePerSqFt) + " per sq ft and rounded to the nearest ₹100. " +
      "Height is estimated from the style: roughly " + Math.min.apply(null, N.FONTS.map(x => x.ratio)) + " to " + Math.max.apply(null, N.FONTS.map(x => x.ratio)) + " × the width per line, depending on the lettering (tall block letters are the smallest, flowing scripts the largest). " +
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
