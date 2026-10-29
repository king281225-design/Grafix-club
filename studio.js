/* =========================================================
   GRAFIX CLUB – Neon Studio (custom neon sign designer, custom-neon-sign.html)
   Needs: config.js, neon-model.js, common.js (catalogue.js optional).
   No server is involved: nothing typed or uploaded here leaves the
   browser until the customer taps WhatsApp / e-mail / Share / Download.
   The editable design (text, font, colours, size, symbol, options) is the
   config object from neon-model.js; the SVG preview is drawn from it on
   every change and is never stored.
   ========================================================= */
(function () {
  "use strict";
  const root = document.getElementById("studioApp");
  if (!root || typeof GCNeon === "undefined") return;
  const N = GCNeon, { $, announce, waUrl, safeStore } = GC;
  const SVGNS = "http://www.w3.org/2000/svg";
  const RATES = { neonRatePerSqFt: CONFIG.neonRatePerSqFt, neonBackboardRatePerSqFt: CONFIG.neonBackboardRatePerSqFt, neonMinPrice: CONFIG.neonMinPrice, neonRgbRatePerSqFt: CONFIG.neonRgbRatePerSqFt };
  const LS_DRAFT = "gc.studio.draft", LS_SAVED = "gc.studio.saved", LS_VIEW = "gc.studio.view", MAX_SAVED = 6;
  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  /* ---------------- form markup (option lists come from the model) ---------------- */
  const radios = (name, opts, extra, checkedKey) => opts.map((o, i) => {
    const inner = extra ? extra(o) : '<span class="chip-t">' + esc(o.label) + "</span>" + (o.hint ? '<small class="chip-h">' + esc(o.hint) + "</small>" : "");
    const on = checkedKey === undefined ? i === 0 : o.key === checkedKey;
    return '<label class="ochip' + (extra ? " ochip-small" : "") + '"><input type="radio" name="' + name + '" value="' + o.key + '"' + (on ? " checked" : "") + '><span class="chip-body">' + inner + "</span></label>";
  }).join("");
  const fieldset = (legend, body, id, cls) => '<fieldset class="field' + (cls ? " " + cls : "") + '"' + (id ? ' id="' + id + '"' : "") + "><legend>" + legend + "</legend>" + body + "</fieldset>";
  const iconSvg = d => '<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="' + d + '" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round"/></svg>';
  const colourOptions = first => '<option value="">' + first + "</option>" + N.COLORS.map(c => '<option value="' + c.key + '">' + esc(c.label) + "</option>").join("");

  /** The style buttons, each drawn in its own font. */
  const fontButtonsHtml = () => '<div class="font-grid">' + N.FONTS.map((ft, i) =>
    '<label class="fbtn"><input type="radio" name="font" value="' + ft.key + '"' + (i === 0 ? " checked" : "") + '><span class="fbtn-t' + (ft.thin ? " thin" : "") + '" style="font-family:' + ft.css + (ft.bs ? ";font-size:" + (1.3 * ft.bs).toFixed(2) + "rem" : "") + '">' + esc(ft.label) + "</span></label>").join("") + "</div>";

  const head = (id, title, nameId, extra) => '<div class="cfg-head"><h3 id="' + id + '">' + title + "</h3>" + (nameId ? '<b class="sel-name" id="' + nameId + '"></b>' : "") + (extra || "") + "</div>";
  const sizeCardsHtml = () => '<div class="size-grid">' + N.SIZES.map((z, i) =>
    '<label class="szc"><input type="radio" name="size" value="' + z.key + '"' + (i === 0 ? " checked" : "") + '><span class="szc-body"><span class="szc-head">' + z.label + "</span>" +
    '<span class="szc-row"><span>Width</span><b>' + z.w + ' inches</b></span><span class="szc-row"><span>Height</span><b>' + z.h + ' inches</b></span><span class="szc-note">per letter</span></span></label>').join("") +
    '<label class="szc"><input type="radio" name="size" value="custom"><span class="szc-body"><span class="szc-head">Custom</span><span class="szc-row"><span>Width</span><b>you choose</b></span><span class="szc-row"><span>Height</span><b>follows text</b></span><span class="szc-note">whole sign</span></span></label></div>' +
    '<div class="field custom-w" id="customWRow" hidden><div class="field-row"><label for="f-cw">Whole sign width, in inches (' + N.CUSTOM_SIZE.minW + "–" + N.CUSTOM_SIZE.maxW + ')</label></div>' +
    '<input type="number" id="f-cw" name="cw" min="' + N.CUSTOM_SIZE.minW + '" max="' + N.CUSTOM_SIZE.maxW + '" step="1" inputmode="numeric" value="' + N.DEFAULTS.cw + '" aria-describedby="m-cw h-cw">' +
    '<p class="hint" id="h-cw">The height follows your text and the number of lines. Dimensions are approximate until we approve the final design.</p><p class="msg" id="m-cw" aria-live="polite"></p></div>';
  const WALL_LABEL = { photo: "Custom Background" };
  const bgThumbsHtml = () => '<div class="bg-grid">' + N.BACKDROPS.concat([{ key: "photo", label: WALL_LABEL.photo }]).map((o, i) =>
    '<label class="bgc"><input type="radio" name="bg" value="' + o.key + '"' + (i === 0 ? " checked" : "") + '><span class="bgc-body"><span class="bgt bgt-' + o.key + '" aria-hidden="true">' + (o.key === "photo" ? '<svg viewBox="0 0 24 24" width="22" height="22"><path d="M12 16V5m0 0l-4 4m4-4l4 4M5 19h14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>' : "") + '</span><span class="bgc-t">' + esc(o.label) + "</span></span></label>").join("") + "</div>";
  const lineField = (n, label, removable) =>
    '<div class="field line-field" id="row-l' + n + '"' + (n === 3 ? " hidden" : "") + '>' +
      '<div class="field-row"><label for="f-l' + n + '">' + label + "</label>" +
        (removable ? '<button type="button" class="link-btn line-del" data-del="' + n + '">Remove<span class="sr-only"> line ' + n + "</span></button>" : "") +
        '<span class="count" id="c-l' + n + '" aria-hidden="true"></span></div>' +
      '<input type="text" id="f-l' + n + '" name="l' + n + '" maxlength="60" autocomplete="off" spellcheck="false" aria-describedby="m-l' + n + '" value="">' +
      '<p class="msg" id="m-l' + n + '" aria-live="polite"></p>' +
    "</div>";

  const formHtml =
    '<fieldset class="field cfg-sec" aria-labelledby="h-type"><legend class="sr-only">Sign type</legend>' + head("h-type", "Sign Type", "typeName") +
      '<div class="chips type-chips">' + radios("ptype", N.PRODUCT_TYPES) + "</div></fieldset>" +
    head("h-text", "Your Text") +
    lineField(1, 'Line 1 <em class="req">(required)</em>', false) +
    lineField(2, 'Line 2 <em class="opt">(optional)</em>', true) +
    lineField(3, 'Line 3 <em class="opt">(optional)</em>', true) +
    '<div class="text-tools">' +
      '<button type="button" class="btn btn-ghost btn-sm" id="addLine">+ Add another line</button>' +
      '<div class="case-btns" role="group" aria-label="Change letter case"><span class="tools-l" aria-hidden="true">Case</span>' +
        '<button type="button" class="tool-btn" data-case="upper" aria-label="All capitals">AA</button><button type="button" class="tool-btn" data-case="title" aria-label="Capital first letters">Aa</button><button type="button" class="tool-btn" data-case="lower" aria-label="All small letters">aa</button></div>' +
    "</div>" +
    fieldset("Alignment", '<div class="chips seg">' + radios("al", N.ALIGNS) + "</div>", "alignField", "mini-field") +
    fieldset("Line spacing", '<div class="chips seg">' + radios("lh", N.LINE_HEIGHTS, undefined, "normal") + "</div>", "lhField", "mini-field") +
    '<div class="field mini-field"><div class="field-row"><label for="f-sp">Letter spacing</label><output id="spOut" for="f-sp"></output></div><input type="range" id="f-sp" name="sp" min="0" max="4" step="1" value="0"></div>' +
    '<div class="form-actions inline"><button type="button" class="link-btn" id="resetText">Reset text</button></div>' +
    '<fieldset class="field cfg-sec" aria-labelledby="h-font"><legend class="sr-only">Pick Your Font</legend>' + head("h-font", "Pick Your Font", "fontName") + fontButtonsHtml() + "</fieldset>" +
    '<fieldset class="field cfg-sec" id="colourSec" aria-labelledby="h-colour"><legend class="sr-only">Select Your Colour</legend>' + head("h-colour", "Select Your Colour", "colorName") +
      '<div class="swatches" id="stdSwatches">' + N.COLORS.map((c, i) =>
        '<label class="swatch" style="--c:' + c.hex + '"><input type="radio" name="color" value="' + c.key + '"' + (i === 1 ? " checked" : "") + '><span class="sw-dot" aria-hidden="true"></span><span class="sr-only">' + esc(c.label) + "</span></label>").join("") + "</div>" +
      '<div class="field c2-field" id="c2Field" hidden><label for="f-c2">Line 2 colour <em class="opt">(optional, for a two-colour sign)</em></label><select id="f-c2" name="c2">' + colourOptions("Same as line 1") + "</select></div>" +
      '<div class="field c2-field" id="c3Field" hidden><label for="f-c3">Line 3 colour <em class="opt">(optional)</em></label><select id="f-c3" name="c3">' + colourOptions("Same as line 1") + "</select></div>" +
      '<div id="rgbBox" hidden><div class="rgb-grid" role="radiogroup" aria-label="RGB colour preview">' + N.RGB_STYLES.map((r, i) =>
        '<label class="rgbc"><input type="radio" name="rs" value="' + r.key + '"' + (i === 0 ? " checked" : "") + '><span class="rgbc-body"><span class="rgb-bar" style="background:linear-gradient(90deg,' + r.stops.join(",") + ')" aria-hidden="true"></span><span>' + esc(r.label) + "</span></span></label>").join("") + "</div>" +
        '<p class="hint">RGB neon changes colour. These are preview looks: the real colour modes depend on the controller we supply, and we confirm them with your quote.</p></div>' +
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
      '<p class="hint">Only changes how the preview looks, so you can imagine the sign on your own wall. Rooms are illustrations and not drawn to scale. It never changes the price.</p></fieldset>' +
    '<fieldset class="field cfg-sec" aria-labelledby="h-sym"><legend class="sr-only">Add a symbol</legend>' + head("h-sym", "Add a Symbol", "symName") +
      '<div class="chips icon-chips">' + radios("icon", N.ICONS, o => (o.d ? iconSvg(o.d) : "") + '<span class="chip-t">' + esc(o.label) + "</span>") + "</div>" +
      '<div class="sym-opts" id="symOpts" hidden>' +
        fieldset("Position", '<div class="chips seg">' + radios("ip", N.ICON_POSITIONS) + "</div>", "", "mini-field") +
        fieldset("Symbol size", '<div class="chips seg">' + radios("is", N.ICON_SIZES, undefined, "m") + "</div>", "", "mini-field") +
        '<div class="field mini-field" id="icField"><label for="f-ic">Symbol colour</label><select id="f-ic" name="ic">' + colourOptions("Same as line 1") + "</select></div>" +
      "</div>" +
      '<p class="hint">Symbols are made in neon like the letters and add length; we confirm their price on the mock-up.</p></fieldset>' +
    '<section class="field cfg-sec own-design" aria-labelledby="h-own">' + head("h-own", "Have Your Own Logo or Design?") +
      '<p>Add your logo or a picture of the sign you want. Our designer draws the neon version and sends you a mock-up and price.</p>' +
      '<div class="drop" id="dropZone"><span class="drop-t" aria-hidden="true"><b>Drop a file here</b> or <u>choose a file</u></span><span class="hint" aria-hidden="true">PNG, JPG, WebP or PDF, up to ' + CONFIG.maxUploadMB + ' MB</span>' +
      '<input type="file" id="f-file" class="drop-input" accept="image/png,image/jpeg,image/webp,application/pdf" aria-label="Upload your logo or design: PNG, JPG, WebP or PDF, up to ' + CONFIG.maxUploadMB + ' MB" aria-describedby="h-file m-file"></div>' +
      '<p class="hint" id="h-file">It stays on your device: we do not upload it, and WhatsApp links cannot carry files, so attach the same file in the chat after it opens. We never turn a picture into a sign automatically; a designer checks every logo.</p>' +
      '<p class="msg" id="m-file" aria-live="polite"></p>' +
      '<div class="file-chip" id="fileChip" hidden></div>' +
      '<a class="btn btn-ghost btn-sm" id="ownDesign" target="_blank" rel="noopener">Request a custom design quote on WhatsApp<span class="sr-only"> (opens in a new tab)</span></a>' +
    "</section>" +
    '<details class="cfg-more" id="cfgMore"><summary>More options: backing, outdoor use, fitting, dimmer, quantity, notes</summary>' +
      fieldset("Backing", '<div class="chips col">' + radios("backing", N.BACKINGS) + "</div>") +
      fieldset("Where will it be used?", '<div class="chips">' + radios("use", N.USES) + "</div>") +
      fieldset("Mounting and fitting", '<div class="chips">' + radios("fit", N.FITTINGS) + "</div>") +
      '<div class="field"><label class="check"><input type="checkbox" id="f-dm" name="dm" value="1"> <span>Add a dimmer switch <small class="hint">(price on confirmation)</small></span></label></div>' +
      '<div class="field"><div class="field-row"><label for="f-q">Quantity</label></div><input type="number" id="f-q" name="q" min="1" max="' + N.LIMITS.maxQty + '" step="1" value="1" inputmode="numeric" aria-describedby="m-q"><p class="msg" id="m-q" aria-live="polite"></p></div>' +
      '<div class="field">' +
        '<div class="field-row"><label for="f-n">Notes for our team <em class="opt">(optional)</em></label><span class="count" id="c-n" aria-hidden="true"></span></div>' +
        '<textarea id="f-n" name="notes" rows="3" maxlength="400" aria-describedby="m-n"></textarea>' +
        '<p class="msg" id="m-n" aria-live="polite"></p>' +
      "</div>" +
    "</details>" +
    '<div class="form-actions"><button type="button" class="btn btn-ghost" id="resetBtn">Reset design</button></div>';

  const form = $("#studioForm");
  form.innerHTML = formHtml;
  const f = form.elements;
  const preview = $("#preview"), svg = $("#neonSvg"), fallback = $("#neonFallback");
  const el = id => document.getElementById(id);

  /* ---------------- state ---------------- */
  let bgUrl = "", bgImg = null, file = null, fileUrl = "", lastCfg = N.normalize(N.DEFAULTS).config, valid = true, lastEst = null;
  const VIEW_DEFAULT = { mode: "life", light: true, glow: 100, zoom: 1, anim: true };
  const view = Object.assign({}, VIEW_DEFAULT, (() => { try { const v = JSON.parse(safeStore.get(LS_VIEW) || "{}"); return v && typeof v === "object" ? { mode: v.mode === "design" ? "design" : "life", light: v.light !== false, glow: Math.min(160, Math.max(40, +v.glow || 100)), anim: v.anim !== false } : {}; } catch (e) { return {}; } })());
  const saveView = () => safeStore.set(LS_VIEW, JSON.stringify({ mode: view.mode, light: view.light, glow: view.glow, anim: view.anim }));
  const line3Shown = () => !el("row-l3").hidden;

  const readRaw = () => ({
    t: [f.l1.value, f.l2.value].concat(line3Shown() ? [f.l3.value] : []), f: f.font.value, c: f.color.value, c2: f.c2.value, c3: f.c3.value,
    g: f.bg.value, z: f.size.value, cw: f.cw.value, b: f.backing.value, u: f.use.value, x: f.fit.value, i: f.icon.value, n: f.notes.value,
    p: f.ptype.value, rs: f.rs.value, al: f.al.value, lh: f.lh.value, sp: Number(f.sp.value), ip: f.ip.value, is: f.is.value, ic: f.ic.value,
    q: f.q.value === "" ? "" : Number(f.q.value), dm: f.dm.checked ? 1 : 0
  });
  function writeCfg(cfg) {
    f.l1.value = cfg.t[0]; f.l2.value = cfg.t[1] || ""; f.l3.value = cfg.t[2] || ""; el("row-l3").hidden = !cfg.t[2];
    f.font.value = cfg.f; f.color.value = cfg.c; f.c2.value = cfg.c2 || ""; f.c3.value = cfg.c3 || "";
    f.bg.value = cfg.g || "mauve"; f.size.value = cfg.z; f.cw.value = cfg.cw;
    f.backing.value = cfg.b; f.use.value = cfg.u; f.fit.value = cfg.x; f.icon.value = cfg.i; f.notes.value = cfg.n || "";
    f.ptype.value = cfg.p; f.rs.value = cfg.rs; f.al.value = cfg.al; f.lh.value = cfg.lh; f.sp.value = cfg.sp; f.ip.value = cfg.ip; f.is.value = cfg.is; f.ic.value = cfg.ic || "";
    f.q.value = cfg.q; f.dm.checked = !!cfg.dm;
    if (cfg.b !== "none" || cfg.u !== "indoor" || cfg.x !== "pickup" || cfg.n || cfg.q > 1 || cfg.dm) el("cfgMore").open = true;
  }
  const baseUrl = () => location.href.split(/[?#]/)[0];
  const designUrl = cfg => (location.protocol === "file:" ? "" : baseUrl() + "?design=" + N.encode(cfg));

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

  /* ---------------- live preview (SVG) ---------------- */
  function node(name, attrs, parent) {
    const n = document.createElementNS(SVGNS, name);
    Object.keys(attrs || {}).forEach(k => n.setAttribute(k, attrs[k]));
    if (parent) parent.appendChild(n);
    return n;
  }
  const mix = (hex, toward, t) => { const n = parseInt(hex.slice(1), 16), o = parseInt(toward.slice(1), 16); const m = (a, b) => Math.round(a + (b - a) * t); return "rgb(" + m(n >> 16, o >> 16) + "," + m((n >> 8) & 255, (o >> 8) & 255) + "," + m(n & 255, o & 255) + ")"; };
  const tint = hex => mix(hex, "#FFFFFF", 0.82);
  /** Dark colours (blue, green) get a lighter glow so they still read as light; the tube itself keeps the exact hex. */
  const glowOf = hex => { const l = N.luminance(hex); return l >= 0.5 ? hex : mix(hex, "#FFFFFF", Math.min(0.5, (0.5 - l) * 1.1)); };
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

  function measureWidth(text, fontCss, size, spacing) {
    const t = node("text", { "font-family": fontCss, "font-size": size, "letter-spacing": spacing || 0, x: 0, y: 0, visibility: "hidden" }, svg);
    t.textContent = text || " ";
    let w = 0;
    try { w = t.getBBox().width; } catch (e) { w = 0; }
    svg.removeChild(t);
    return w || text.length * (size * 0.58 + (spacing || 0));   // rough width if the browser cannot measure yet
  }

  const photoOpt = () => (f.bg.value === "photo" && bgImg ? { url: bgUrl, dim: +f.dim.value } : null);
  const isRoom = key => !!(N.BACKDROPS.find(b => b.key === key) || {}).room;

  /** Fills <defs> with the chosen wall under the id gcWall (a pattern or gradient) and returns extra overlay nodes to draw on top (texture). */
  function paintWall(defs, key) {
    const pat = (w, h) => node("pattern", { id: "gcWall", width: w, height: h, patternUnits: "userSpaceOnUse" }, defs);
    const grad = (c1, c2, id) => { const g = node("radialGradient", { id: id || "gcWall", cx: 0.5, cy: 0.42, r: 0.85 }, defs); node("stop", { offset: "0", "stop-color": c1 }, g); node("stop", { offset: "1", "stop-color": c2 }, g); };
    const dots = (p, color, pts) => pts.forEach(q => node("circle", { cx: q[0], cy: q[1], r: q[2] || 1.2, fill: color }, p));
    // grain: fractal noise tinted by a colour matrix, drawn over the wall at a low opacity
    const grain = (id, freq, alpha, rgb) => { const fl = node("filter", { id, x: 0, y: 0, width: "100%", height: "100%" }, defs); node("feTurbulence", { type: "fractalNoise", baseFrequency: freq, numOctaves: 3, seed: 7, result: "n" }, fl); node("feColorMatrix", { type: "matrix", values: "0 0 0 0 " + rgb[0] + " 0 0 0 0 " + rgb[1] + " 0 0 0 0 " + rgb[2] + " 0 0 0 " + alpha + " 0" }, fl); };
    const overlays = [];
    switch (key) {
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
      case "white": { grad("#f4f1ec", "#d8d3ca"); grain("gcGrain", 0.8, 0.22, [0.35, 0.3, 0.25]); overlays.push("gcGrain"); break; }
      case "bedroom": { grad("#3b3550", "#17141f"); grain("gcGrain", 0.75, 0.32, [0, 0, 0]); overlays.push("gcGrain"); break; }
      case "cafe": { const p = pat(60, 600); node("rect", { width: 60, height: 600, fill: "#2a1d14" }, p); node("rect", { width: 28, height: 600, fill: "#33231a" }, p); node("path", { d: "M29.5 0v600M59.5 0v600", stroke: "#1a110b", "stroke-width": 2 }, p); grain("gcGrain", "0.02 0.5", 0.3, [0, 0, 0]); overlays.push("gcGrain"); break; }
      case "office": { grad("#d9dde3", "#aab0b9"); grain("gcGrain", 0.8, 0.18, [0.2, 0.22, 0.26]); overlays.push("gcGrain"); break; }
      case "gaming": { grad("#1d1838", "#07060f"); grain("gcGrain", 0.8, 0.35, [0, 0, 0]); overlays.push("gcGrain"); break; }
      default: { grad("#4a2a52", "#1c0d22"); grain("gcGrain", 0.75, 0.38, [0, 0, 0]); overlays.push("gcGrain"); }   // mauve: dark purple plaster
    }
    return overlays;
  }

  /** Room scenes: simple furniture silhouettes in a band under the sign, so the sign can be judged at room scale. Never overlaps the sign. */
  function drawRoom(parent, key, W, floorY, H) {
    const g = node("g", { "aria-hidden": "true" }, parent);
    const r = (x, y, w, h, fill, rx) => node("rect", { x, y, width: w, height: h, rx: rx || 0, fill }, g);
    const p = (d, fill, extra) => node("path", Object.assign({ d, fill }, extra || {}), g);
    const light = key === "office";
    r(0, floorY, W, H - floorY, light ? "#8d8378" : key === "cafe" ? "#1a120c" : "#100d16");
    node("line", { x1: 0, y1: floorY, x2: W, y2: floorY, stroke: light ? "rgba(0,0,0,.25)" : "rgba(255,255,255,.08)", "stroke-width": 2 }, g);
    if (key === "bedroom") {
      r(170, floorY - 92, 460, 70, "#2b2538", 18); r(150, floorY - 30, 500, 54, "#3a3350", 10); r(150, floorY + 20, 500, 16, "#221d2e");
      r(200, floorY - 52, 120, 30, "#d9d2e6", 14); r(480, floorY - 52, 120, 30, "#d9d2e6", 14);
      r(60, floorY - 20, 60, 56, "#2b2538", 6); p("M76 " + (floorY - 20) + "l14-40 14 40z", "#f3d9a8", { opacity: 0.9 });
    } else if (key === "cafe") {
      r(110, floorY - 40, 580, 26, "#5a3b26", 4); r(130, floorY - 14, 540, 70, "#3c2819");
      [190, 320, 450, 580].forEach(x => { r(x, floorY + 56, 42, 8, "#222", 3); r(x + 18, floorY + 64, 6, 40, "#222"); });
      [220, 400, 580].forEach(x => { node("line", { x1: x, y1: 0, x2: x, y2: 34, stroke: "#111", "stroke-width": 2 }, g); p("M" + (x - 18) + " 52 a18 18 0 0 1 36 0z", "#e9c27a"); });
    } else if (key === "office") {
      r(180, floorY - 46, 440, 30, "#f4f4f2", 6); r(200, floorY - 16, 400, 86, "#e2e2df"); r(200, floorY - 16, 400, 8, "#c9c9c5");
      r(640, floorY - 30, 46, 70, "#ece8e2", 8); p("M663 " + (floorY - 30) + "c-30-40-20-80 0-90c20 10 30 50 0 90z", "#4f7d4a"); p("M663 " + (floorY - 30) + "c-40-20-50-60-30-70c20 10 40 40 30 70z", "#3f6b3b");
    } else if (key === "gaming") {
      r(170, floorY - 30, 460, 18, "#1a1824", 4); r(190, floorY - 12, 12, 90, "#1a1824"); r(598, floorY - 12, 12, 90, "#1a1824");
      r(300, floorY - 110, 200, 74, "#0b0a12", 6); r(306, floorY - 104, 188, 62, "#1b2a6b"); r(392, floorY - 36, 16, 8, "#0b0a12");
      p("M590 " + (floorY + 70) + "v-120c0-14 30-14 30 0v60h20v60z", "#2a2440");
      node("rect", { x: 160, y: floorY - 30, width: 480, height: 4, fill: "#7b5cff", opacity: 0.8 }, g);
    }
    return g;
  }

  function draw(cfg, bgPhoto) {
    const font = drawFont(cfg), rgb = cfg.p === "rgb", design = view.mode === "design", lit = view.light;
    const room = !bgPhoto && !design && isRoom(cfg.g);
    const light = !bgPhoto && !design && N.isLightWall(cfg);
    const glowK = view.glow / 100;
    const lineHex = i => N.colorOf(i === 0 ? cfg.c : i === 1 ? (cfg.c2 || cfg.c) : (cfg.c3 || cfg.c)).hex;
    const lines = cfg.t.filter(Boolean);
    const show = lines.length ? lines.slice() : ["Your text"];
    const placeholder = !lines.length;
    const W = 800, y0 = 70;
    const lhK = (N.LINE_HEIGHTS.find(o => o.key === cfg.lh) || { k: 1 }).k;
    /* Same letter height for every font: only the Size card (and the number of lines) changes how tall the letters are.
       The sign is as wide as the letters need, so a wider font or a longer word gives a longer sign, never a bigger one. */
    const CAP = 118, band = Math.round(190 * (show.length > 1 ? lhK : 1));
    const fs = CAP / capRatio(font), spacing = (cfg.sp || 0) * fs * 0.045;
    const icon = N.find(N.ICONS, cfg.i), iconK = (N.ICON_SIZES.find(o => o.key === cfg.is) || { k: 1 }).k;
    const top = icon.d && cfg.ip === "top";
    const iconSize = icon.d ? Math.min(190 * 0.7, 150) * iconK : 0, gap = icon.d ? 36 : 0, padX = 46;
    const textH = band * show.length, signH = textH + (top ? iconSize + gap * 0.6 : 0);
    const roomExtra = room ? 190 : 0;
    const H = y0 + signH + 110 + roomExtra;
    const widths = show.map(s => measureWidth(s, font.css, fs, spacing));
    const textW = Math.max.apply(null, widths);
    const sideIcon = icon.d && !top ? iconSize + gap : 0;
    const innerW = Math.max(textW + sideIcon, top ? iconSize : 0);
    const signW = Math.round(innerW + padX * 2), signX = (W - signW) / 2;
    const textLeft = signX + padX + (icon.d && cfg.ip === "left" ? iconSize + gap : 0) + (top ? (innerW - textW) / 2 : 0);
    const textTop = y0 + (top ? iconSize + gap * 0.6 : 0);
    const anchor = cfg.al === "left" ? "start" : cfg.al === "right" ? "end" : "middle";
    const lineX = () => (cfg.al === "left" ? textLeft : cfg.al === "right" ? textLeft + textW : textLeft + textW / 2);

    /* Every font gets exactly the same neon-tube thickness (TUBE). Thin letters are thickened, medium ones thinned,
       and very heavy ones are drawn as a tube round the outline, so the tube is the same in every font. */
    const TUBE = 7, stem = inkStem(font, show, fs) || TUBE;
    const mode = stem <= TUBE + 0.5 ? "grow" : stem <= TUBE * 3.2 ? "thin" : "outline";
    const grow = mode === "grow" ? Math.max(0, TUBE - stem) : 0, shrink = mode === "thin" ? (stem - TUBE) / 2 : 0;
    const tubeW = w => (mode === "grow" ? grow + w : mode === "thin" ? w : TUBE + w);

    while (svg.firstChild) svg.removeChild(svg.firstChild);
    svg.setAttribute("viewBox", "0 0 " + W + " " + H);
    svg.classList.toggle("is-design", design);
    const defs = node("defs", {}, svg);
    const mkFilter = (id, dev) => {
      const fl = node("filter", { id, x: "-40%", y: "-80%", width: "180%", height: "260%" }, defs);
      if (shrink > 0) node("feMorphology", { operator: "erode", radius: shrink.toFixed(2), in: "SourceGraphic", result: "thin" }, fl);
      if (dev > 0) node("feGaussianBlur", { stdDeviation: dev, in: shrink > 0 ? "thin" : "SourceGraphic" }, fl);
    };
    mkFilter("gcGlowWide", 26 * glowK); mkFilter("gcGlowMid", 11 * glowK); mkFilter("gcGlowTight", 4); mkFilter("gcShadow", 7);
    if (shrink > 0) mkFilter("gcCore", 0);

    // ---- background layer
    const bgLayer = node("g", { class: "gc-bg" }, svg);
    if (design) {
      const p = node("pattern", { id: "gcWall", width: 40, height: 40, patternUnits: "userSpaceOnUse" }, defs);
      node("rect", { width: 40, height: 40, fill: "#141219" }, p); node("path", { d: "M40 0H0V40", fill: "none", stroke: "rgba(255,255,255,.05)", "stroke-width": 1 }, p);
      node("rect", { x: 0, y: 0, width: W, height: H, fill: "url(#gcWall)" }, bgLayer);
    } else {
      const overlays = paintWall(defs, cfg.g);
      node("rect", { x: 0, y: 0, width: W, height: H, fill: "url(#gcWall)" }, bgLayer);
      if (bgPhoto) {
        const clip = node("clipPath", { id: "gcBgClip" }, defs); node("rect", { x: 0, y: 0, width: W, height: H }, clip);
        node("image", { href: bgPhoto.url, x: 0, y: 0, width: W, height: H, preserveAspectRatio: "xMidYMid slice", "clip-path": "url(#gcBgClip)", class: "gc-photo" }, bgLayer);
        node("rect", { x: 0, y: 0, width: W, height: H, fill: "#000", opacity: bgPhoto.dim / 100 }, bgLayer);
      } else {
        overlays.forEach(o => { if (o === "pores") node("rect", { x: 0, y: 0, width: W, height: H, fill: "url(#gcPores)" }, bgLayer); else node("rect", { x: 0, y: 0, width: W, height: H, filter: "url(#" + o + ")", opacity: 1 }, bgLayer); });
        if (room) drawRoom(bgLayer, cfg.g, W, H - roomExtra + 30, H);
      }
    }

    // the whole sign (spill, tubes, hardware, dimension marks) scales with the chosen size, around the middle of the sign
    const sizeK = cfg.z === "custom" ? Math.min(1, 0.6 + cfg.cw / 150) : (SCALE[cfg.z] || 1);
    const k = Math.min(sizeK, 720 / signW, room ? 1 : 9), midY = y0 + signH / 2;   /* very long text is shrunk to stay on screen */
    const sign = node("g", { class: "gc-sign", transform: "translate(" + W / 2 + " " + midY + ") scale(" + k + ") translate(" + (-W / 2) + " " + (-midY) + ")" }, svg);

    // RGB: one gradient across the sign (optionally flowing in the preview), and a lighter one for the tube core
    let paint = i => lineHex(i), corePaint = i => (light ? lineHex(i) : tint(lineHex(i))), glowPaint = i => glowOf(lineHex(i));
    const rgbStyle = N.find(N.RGB_STYLES, cfg.rs);
    if (rgb) {
      const stops = rgbStyle.stops.concat([rgbStyle.stops[0]]);
      const mkGrad = (id, tinted) => {
        const gr = node("linearGradient", { id, gradientUnits: "userSpaceOnUse", x1: signX, y1: 0, x2: signX + signW, y2: 0, spreadMethod: "repeat" }, defs);
        stops.forEach((c, i) => node("stop", { offset: (i / (stops.length - 1)).toFixed(3), "stop-color": tinted ? mix(c, "#FFFFFF", 0.55) : c }, gr));
        if (view.anim && lit && !design && !reduceMotion) node("animateTransform", { attributeName: "gradientTransform", type: "translate", from: "0 0", to: signW + " 0", dur: "6s", repeatCount: "indefinite" }, gr);
      };
      mkGrad("gcRgb", false); mkGrad("gcRgbCore", true);
      paint = () => "url(#gcRgb)"; glowPaint = () => "url(#gcRgb)"; corePaint = () => (light ? "url(#gcRgb)" : "url(#gcRgbCore)");
    }
    const iconHex = cfg.ic && !rgb ? N.colorOf(cfg.ic).hex : null;
    const iconPaint = (fn) => (iconHex ? (fn === corePaint ? (light ? iconHex : tint(iconHex)) : fn === glowPaint ? glowOf(iconHex) : iconHex) : fn(0));

    // light spilling onto the wall: a soft pool of the neon colour behind the sign
    if (lit && !design) {
      const spill = (id, hex, op) => { const gg = node("radialGradient", { id }, defs); node("stop", { offset: "0", "stop-color": hex, "stop-opacity": op }, gg); node("stop", { offset: "0.55", "stop-color": hex, "stop-opacity": op * 0.35 }, gg); node("stop", { offset: "1", "stop-color": hex, "stop-opacity": 0 }, gg); };
      const gA = rgb ? rgbStyle.stops[0] : glowOf(lineHex(0)), gB = rgb ? rgbStyle.stops[Math.floor(rgbStyle.stops.length / 2)] : glowOf(lineHex(1));
      const opk = Math.min(1.3, glowK);
      spill("gcSpillA", gA, (light ? 0.35 : 0.62) * opk); spill("gcSpillB", gB, (light ? 0.3 : 0.55) * opk);
      const two = rgb || (show.length > 1 && gA !== gB);
      const spillStyle = light ? "" : "mix-blend-mode:screen";
      node("ellipse", { cx: two ? W / 2 - 110 : W / 2, cy: midY, rx: signW * (two ? 0.62 : 0.78), ry: signH * 0.6 + 120, fill: "url(#gcSpillA)", style: spillStyle, opacity: placeholder ? 0.3 : 1 }, sign);
      if (two) node("ellipse", { cx: W / 2 + 110, cy: midY, rx: signW * 0.62, ry: signH * 0.6 + 120, fill: "url(#gcSpillB)", style: spillStyle }, sign);
    }

    // sign area outline (what the estimate is based on)
    node("rect", { x: signX, y: y0, width: signW, height: signH, rx: 10, fill: "none", stroke: light ? "rgba(0,0,0,.28)" : "rgba(255,255,255,.2)", "stroke-width": 2, "stroke-dasharray": "10 8" }, sign);

    const drawLines = (parent, attrsIn, iconAttrs) => {
      const attrsFor = i => (typeof attrsIn === "function" ? attrsIn(i) : attrsIn);
      const textAttrs = o => { const c = Object.assign({}, o); delete c.iw; return c; };
      show.forEach((s, i) => {
        const t = node("text", Object.assign({ x: lineX(), y: textTop + band * (i + 0.5), "text-anchor": anchor, "dominant-baseline": "central", "font-family": font.css, "font-size": fs, "letter-spacing": spacing }, textAttrs(attrsFor(i))), parent);
        t.textContent = s;
      });
      if (icon.d) {
        const a = iconAttrs || attrsFor(0), sc = iconSize / 24;
        const ix = top ? signX + padX + (innerW - iconSize) / 2 : cfg.ip === "right" ? signX + padX + textW + gap : signX + padX;
        const iy = top ? y0 : textTop + textH / 2 - iconSize / 2;
        const pth = node("path", Object.assign({ d: icon.d, transform: "translate(" + ix + " " + iy + ") scale(" + sc + ")", "stroke-linejoin": "round", "stroke-linecap": "round" }, textAttrs(a)), parent);
        pth.setAttribute("fill", "none");
        pth.setAttribute("stroke-width", String(((+a.iw || +a["stroke-width"] || 2) * 0.9) / sc));
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
    const art = node("g", { class: "gc-art", opacity: placeholder ? 0.35 : 1 }, sign);
    const lay = (fillC, strokeC, w, extra) => Object.assign({ fill: mode === "outline" ? "none" : fillC, stroke: strokeC, "stroke-width": tubeW(w), iw: w }, extra || {});
    drawLines(node("g", { filter: "url(#gcShadow)", transform: "translate(7 12)", opacity: light ? 0.38 : 0.5 }, art), lay("#000", "#000", 6));
    if (lit) {
      if (!design) {
        drawLines(node("g", { filter: "url(#gcGlowWide)", opacity: Math.min(1, (light ? 0.3 : 0.9) * glowK) }, art), i => lay(glowPaint(i), glowPaint(i), 18), lay(iconPaint(glowPaint), iconPaint(glowPaint), 18));
        drawLines(node("g", { filter: "url(#gcGlowMid)", opacity: Math.min(1, (light ? 0.35 : 0.95) * glowK) }, art), i => lay(glowPaint(i), glowPaint(i), 12), lay(iconPaint(glowPaint), iconPaint(glowPaint), 12));
      }
      if (!light) drawLines(node("g", { filter: "url(#gcGlowTight)" }, art), i => lay(paint(i), paint(i), 6), lay(iconPaint(paint), iconPaint(paint), 6));
      const coreAttrs = shrink > 0 ? { filter: "url(#gcCore)" } : {};
      drawLines(node("g", Object.assign({ class: "gc-core" }, coreAttrs), art), i => lay(corePaint(i), paint(i), 2.6, { "paint-order": "stroke" }), lay(iconPaint(corePaint), iconPaint(paint), 2.6, { "paint-order": "stroke" }));
      if (mode === "outline") drawLines(node("g", {}, art), i => ({ fill: "none", stroke: corePaint(i), "stroke-width": TUBE - 2.4, iw: 2 }), { fill: "none", stroke: iconPaint(corePaint), "stroke-width": TUBE - 2.4, iw: 2 });
    } else {
      // switched off: pale tubes with a hint of their colour, no glow
      const off = i => (rgb ? "#e9e6ef" : mix(lineHex(i), "#EEEAF2", 0.72));
      drawLines(node("g", { class: "gc-core" }, art), i => lay(off(i), mix(off(i).startsWith("#") ? off(i) : "#cfcbd6", "#9a96a3", 0.25), 2.6, { "paint-order": "stroke" }), lay(iconHex ? mix(iconHex, "#EEEAF2", 0.72) : off(0), "#bdb9c6", 2.6));
    }

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
    if (!m) return;
    m.textContent = text || ""; m.className = "msg" + (text ? " " + (kind || "err") : "");
    if (!inp) return;
    if (kind === "warn" || !text) inp.removeAttribute("aria-invalid"); else inp.setAttribute("aria-invalid", "true");
  };

  function render(opts) {
    const raw = readRaw();
    const r = N.normalize(raw);
    const cfg = r.config; lastCfg = cfg; valid = r.ok;
    const rgb = cfg.p === "rgb";

    // labels / counters / which sub-panels are visible
    el("typeName").textContent = N.find(N.PRODUCT_TYPES, cfg.p).label;
    el("colorName").textContent = rgb ? "RGB " + N.find(N.RGB_STYLES, cfg.rs).label : N.colorOf(cfg.c).label;
    el("fontName").textContent = N.find(N.FONTS, cfg.f).label;
    el("sizeName").textContent = cfg.z === "custom" ? "Custom" : N.sizeOf(cfg.z).label;
    el("symName").textContent = cfg.i === "none" ? "" : N.find(N.ICONS, cfg.i).label;
    el("stdSwatches").hidden = rgb; el("rgbBox").hidden = !rgb;
    el("c2Field").hidden = rgb || !(raw.t[1] || "").trim(); el("c3Field").hidden = rgb || !line3Shown() || !(raw.t[2] || "").trim();
    el("symOpts").hidden = cfg.i === "none"; el("icField").hidden = rgb;
    el("customWRow").hidden = f.size.value !== "custom";
    el("addLine").hidden = line3Shown();
    const delL2 = form.querySelector("[data-del=\"2\"]"); if (delL2) delL2.hidden = !f.l2.value && !line3Shown();
    el("alignField").hidden = el("lhField").hidden = cfg.t.filter(Boolean).length < 2;
    el("spOut").textContent = ["None", "Slight", "Medium", "Wide", "Extra wide"][cfg.sp] || "None";
    needFont(drawFont(cfg));
    const bgMode = f.bg.value;
    el("bgName").textContent = bgMode === "photo" ? "Custom Background" : N.find(N.BACKDROPS, cfg.g).label;
    el("bgPhotoRow").hidden = bgMode !== "photo";
    el("dimRow").hidden = el("f-dim").hidden = el("bgRemove").hidden = !bgImg;
    el("dimOut").textContent = f.dim.value + "%";
    const len = s => Array.from(String(s || "").trim()).length;
    const cnt = (id, n, max) => { const c = el(id); c.textContent = n + "/" + max; c.classList.toggle("over", n > max); };
    cnt("c-l1", len(raw.t[0]), N.LIMITS.line); cnt("c-l2", len(raw.t[1]), N.LIMITS.line); cnt("c-l3", len(f.l3.value), N.LIMITS.line); cnt("c-n", len(raw.n), N.LIMITS.notes);

    // validation messages (text, not colour alone)
    setMsg("l1", "f-l1", r.errors.line1 || r.warnings.line1, r.errors.line1 ? "err" : "warn");
    setMsg("l2", "f-l2", r.errors.line2, "err");
    setMsg("l3", "f-l3", r.errors.line3, "err");
    setMsg("cw", "f-cw", r.errors.cw, "err");
    setMsg("q", "f-q", r.errors.q, "err");
    setMsg("n", "f-n", r.errors.notes, "err");

    // preview
    let est = N.estimate(cfg, RATES);
    if (!preview.classList.contains("is-fallback")) {
      try { if (window.__gcForcePreviewFail) throw new Error("forced"); est = draw(cfg, photoOpt()); }
      catch (e) { showFallbackPreview(cfg); }
    } else showFallbackPreview(cfg);
    lastEst = est;
    el("sizeTag").textContent = est.size.label + " letters (" + est.size.letterW + " in wide, " + est.size.letterH + " in high each): the whole sign is about " + est.size.w + " × " + est.size.h + " in.";
    const colourWords = rgb ? "RGB multicolour (" + N.find(N.RGB_STYLES, cfg.rs).label.toLowerCase() + " preview)" : N.colorOf(cfg.c).label.toLowerCase() + (cfg.t[1] && cfg.c2 ? " and " + N.colorOf(cfg.c2).label.toLowerCase() : "");
    svg.setAttribute("aria-label", cfg.t[0]
      ? 'Preview of your sign: "' + cfg.t.filter(Boolean).join(" / ") + '" in ' + colourWords + ", " + N.find(N.FONTS, cfg.f).label.toLowerCase() + " style, " + (cfg.z === "custom" ? "custom" : N.sizeOf(cfg.z).label.toLowerCase()) + " size, about " + est.size.w + " by " + est.size.h + " inches, on the " + (view.mode === "design" ? "plain design background" : f.bg.value === "photo" ? "custom background" : N.find(N.BACKDROPS, cfg.g).label.toLowerCase()) + (view.light ? "" : ", switched off") + ". Visual approximation only."
      : "Preview placeholder. Enter your text to see the sign.");
    el("rgbNote").hidden = !rgb;
    el("designId").textContent = valid ? N.designId(cfg) : "–";

    renderEstimate(cfg, est);
    updateLinks(cfg, est);
    scheduleAutosave(cfg);
    if (!(opts && opts.noHistory)) pushHistory(cfg);
  }

  /* ---------------- size help (the ? button beside "Select Size") ---------------- */
  (function sizeHelp() {
    const btn = el("sizeHelpBtn"), pop = el("sizeHelp");
    const set = open => { pop.hidden = !open; btn.setAttribute("aria-expanded", String(open)); };
    btn.addEventListener("click", () => set(pop.hidden));
    pop.addEventListener("click", () => set(false));
    form.addEventListener("keydown", e => { if (e.key === "Escape" && !pop.hidden) { set(false); btn.focus(); } });
  })();

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
      conf.innerHTML = '<div class="callout"><b>Price on confirmation</b><p>These choices are not in the number above. We price them by hand after checking your design:</p><ul>' +
        est.toConfirm.map(t => "<li>" + esc(t) + "</li>").join("") + "</ul></div>";
    } else {
      conf.innerHTML = '<p class="hint">Based on the published per-sq-ft rate. We confirm the final price after a design check.</p>';
    }
  }

  /* ---------------- enquiry links ---------------- */
  function message(cfg, est, withUrl, extra) {
    return N.buildMessage(cfg, est, Object.assign({ designUrl: withUrl ? designUrl(cfg) : "", hasFile: !!file }, extra || {}));
  }
  function updateLinks(cfg, est) {
    const wa = el("sendWa"), mail = el("sendMail");
    const msg = valid ? message(cfg, est, true) : "";
    wa.href = valid ? waUrl(msg) : "#studio-form-start";
    mail.href = valid ? "mailto:" + CONFIG.email + "?subject=" + encodeURIComponent("Neon sign design " + N.designId(cfg) + ": " + cfg.t.filter(Boolean).join(" ")) + "&body=" + encodeURIComponent(msg) : "#studio-form-start";
    const top = el("sendWaTop"); top.href = wa.href;
    [wa, mail, top].forEach(a => a.setAttribute("aria-disabled", String(!valid)));
    const u = valid ? designUrl(cfg) : "";
    el("designUrl").value = u || (valid ? "Link sharing needs the live website address" : "");
    el("copyLink").disabled = !valid || !u;
    el("saveBtn").disabled = !valid; el("dlBtn").disabled = !valid;
    const share = el("shareBtn");
    if (navigator.share) { share.hidden = false; share.disabled = !valid; }
    el("ownDesign").href = waUrl("Hi Grafix Club, I have my own logo/design and would like a custom neon sign quote. I will attach it here." + (valid ? "\nMy design so far: " + N.designId(cfg) + (u ? "\n" + u : "") : ""));
    updateQuote();
  }

  let guard = 0;
  function guardSend(e, label) {
    if (!valid) { e.preventDefault(); render({ noHistory: true }); const bad = form.querySelector("[aria-invalid=true]") || f.l1; if (bad.closest("details")) bad.closest("details").open = true; bad.focus(); announce("Please fix the highlighted fields first."); return false; }
    if (Date.now() - guard < 1500) { e.preventDefault(); return false; }
    guard = Date.now(); announce(label); return true;
  }
  el("sendWa").addEventListener("click", e => guardSend(e, "Opening WhatsApp with your design."));
  el("sendWaTop").addEventListener("click", e => guardSend(e, "Opening WhatsApp with your design."));
  el("sendMail").addEventListener("click", e => guardSend(e, "Opening your e-mail app with your design."));

  el("shareBtn").addEventListener("click", async e => {
    if (!guardSend(e, "Opening the share sheet.")) return;
    const cfg = lastCfg, est = N.estimate(cfg, RATES);
    const data = { title: "My neon sign design " + N.designId(cfg), text: message(cfg, est, false) };
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

  /* ---------------- quote request (goes out as a WhatsApp message; nothing is stored on a server) ---------------- */
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
    a.href = ok ? waUrl(message(lastCfg, lastEst || N.estimate(lastCfg, RATES), true, { heading: "Hi Grafix Club, I would like a quote for this neon sign.", customer: d, ref })) : "#quote";   // stays clickable: a click with missing details shows what to fix
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

  /* ---------------- reset / presets / text tools ---------------- */
  function resetAll() {
    clearFile(); dropBg(); writeCfg(N.normalize(N.DEFAULTS).config); safeStore.del(LS_DRAFT); render();
    announce("Design reset to the starting sign."); f.l1.focus();
  }
  el("resetBtn").addEventListener("click", resetAll);
  el("resetText").addEventListener("click", () => { f.l1.value = N.DEFAULTS.t[0]; f.l2.value = ""; f.l3.value = ""; el("row-l3").hidden = true; f.al.value = "center"; f.lh.value = "normal"; f.sp.value = 0; render(); announce("Text reset."); f.l1.focus(); });
  el("addLine").addEventListener("click", () => {
    if (!f.l2.value.trim()) { f.l2.focus(); announce("Type your second line in Line 2."); return; }
    el("row-l3").hidden = false; render(); f.l3.focus(); announce("Line 3 added.");
  });
  form.addEventListener("click", e => {
    const d = e.target.closest("[data-del]"); if (!d) return;
    if (d.dataset.del === "3") { f.l3.value = ""; el("row-l3").hidden = true; f.l2.focus(); }
    else { f.l2.value = f.l3.value; f.l3.value = ""; el("row-l3").hidden = true; f.c2.value = f.c3.value; f.c3.value = ""; f.l2.focus(); }
    render(); announce("Line removed.");
  });
  const toCase = (s, mode) => mode === "upper" ? s.toLocaleUpperCase() : mode === "lower" ? s.toLocaleLowerCase() : s.toLocaleLowerCase().replace(/(^|[\s\-'/])(\p{L})/gu, (m, a, b) => a + b.toLocaleUpperCase());
  form.addEventListener("click", e => {
    const b = e.target.closest("[data-case]"); if (!b) return;
    [f.l1, f.l2, f.l3].forEach(inp => { inp.value = toCase(inp.value, b.dataset.case); });
    render(); announce("Letter case changed.");
  });

  el("presets").innerHTML = N.PRESETS.map(p => '<button type="button" class="btn btn-ghost btn-sm" data-preset="' + p.key + '">' + esc(p.label) + "</button>").join("");
  function applyPreset(key, silent) {
    const p = N.PRESETS.find(x => x.key === key); if (!p) return false;
    writeCfg(N.normalize(Object.assign({}, N.DEFAULTS, { p: f.ptype.value }, p.cfg)).config); render();
    if (!silent) announce("Started from the " + p.label + " example.");
    return true;
  }
  el("presets").addEventListener("click", e => { const b = e.target.closest("[data-preset]"); if (b) applyPreset(b.dataset.preset); });

  /* ---------------- undo / redo (design settings only; the wall photo and files are not part of the history) ---------------- */
  const hist = [], MAX_HIST = 60; let hpos = -1, histTimer = 0;
  function pushHistory(cfg) {
    if (!valid) return;
    clearTimeout(histTimer);
    histTimer = setTimeout(() => {
      const enc = N.encode(cfg);
      if (hist[hpos] === enc) return;
      hist.splice(hpos + 1); hist.push(enc); if (hist.length > MAX_HIST) hist.shift(); hpos = hist.length - 1; syncHistBtns();
    }, 350);
  }
  function syncHistBtns() { el("undoBtn").disabled = hpos <= 0; el("redoBtn").disabled = hpos >= hist.length - 1; }
  function stepHistory(d) {
    clearTimeout(histTimer);
    const next = hpos + d; if (next < 0 || next >= hist.length) return;
    hpos = next; const cfg = N.decode(hist[hpos]); if (!cfg) return;
    writeCfg(cfg); render({ noHistory: true }); syncHistBtns();
    announce(d < 0 ? "Undone." : "Redone.");
  }
  el("undoBtn").addEventListener("click", () => stepHistory(-1));
  el("redoBtn").addEventListener("click", () => stepHistory(1));
  document.addEventListener("keydown", e => {
    if (!(e.ctrlKey || e.metaKey) || e.altKey) return;
    const t = e.target; if (t && (t.tagName === "INPUT" && /text|number|search|email|tel/.test(t.type) || t.tagName === "TEXTAREA")) return;   // keep the browser's own undo inside text boxes
    const k = e.key.toLowerCase();
    if (k === "z" && !e.shiftKey) { e.preventDefault(); stepHistory(-1); }
    else if (k === "y" || (k === "z" && e.shiftKey)) { e.preventDefault(); stepHistory(1); }
  });

  /* ---------------- preview tools: view mode, light, glow, colour flow, zoom, fit, full screen ---------------- */
  function syncView() {
    el("viewLife").setAttribute("aria-pressed", String(view.mode === "life")); el("viewDesign").setAttribute("aria-pressed", String(view.mode === "design"));
    el("lightBtn").setAttribute("aria-pressed", String(view.light));
    el("glowRange").value = view.glow; el("glowOut").textContent = view.glow + "%";
    el("animBtn").setAttribute("aria-pressed", String(view.anim)); el("animBtn").hidden = lastCfg.p !== "rgb" || reduceMotion;
    preview.style.setProperty("--zoom", view.zoom); preview.classList.toggle("zoomed", view.zoom > 1);
    el("zoomOut").disabled = view.zoom <= 1; el("zoomIn").disabled = view.zoom >= 2.5; el("zoomVal").textContent = Math.round(view.zoom * 100) + "%";
  }
  const viewChanged = msg => { saveView(); syncView(); render({ noHistory: true }); if (msg) announce(msg); };
  el("viewLife").addEventListener("click", () => { view.mode = "life"; viewChanged("Room preview."); });
  el("viewDesign").addEventListener("click", () => { view.mode = "design"; viewChanged("Plain design preview."); });
  el("lightBtn").addEventListener("click", () => { view.light = !view.light; viewChanged(view.light ? "Sign switched on." : "Sign switched off."); });
  el("glowRange").addEventListener("input", () => { view.glow = +el("glowRange").value; viewChanged(); });
  el("animBtn").addEventListener("click", () => { view.anim = !view.anim; viewChanged(view.anim ? "Colour flow preview on." : "Colour flow preview paused."); });
  el("zoomIn").addEventListener("click", () => { view.zoom = Math.min(2.5, Math.round((view.zoom + 0.25) * 100) / 100); syncView(); });
  el("zoomOut").addEventListener("click", () => { view.zoom = Math.max(1, Math.round((view.zoom - 0.25) * 100) / 100); syncView(); });
  el("fitBtn").addEventListener("click", () => { view.zoom = 1; syncView(); preview.scrollTo(0, 0); announce("Preview fitted to the frame."); });
  const fsTarget = el("previewWrap") || preview;
  if (fsTarget.requestFullscreen) {
    el("fsBtn").addEventListener("click", () => { if (document.fullscreenElement) document.exitFullscreen(); else fsTarget.requestFullscreen().catch(() => announce("Full screen is not available here.")); });
    document.addEventListener("fullscreenchange", () => { el("fsBtn").textContent = document.fullscreenElement ? "Exit full screen" : "Full screen"; });
  } else el("fsBtn").hidden = true;

  /* ---------------- download a PNG of the preview (fonts embedded so the picture matches the screen) ---------------- */
  const blobToData = b => new Promise((res, rej) => { const r = new FileReader(); r.onload = () => res(r.result); r.onerror = rej; r.readAsDataURL(b); });
  async function fontFaceCss(family, text, weight) {
    const url = "https://fonts.googleapis.com/css2?family=" + encodeURIComponent(family).replace(/%20/g, "+") + (weight ? ":wght@" + weight : "") + "&text=" + encodeURIComponent(text);
    const css = await (await fetch(url)).text();
    const srcs = [...css.matchAll(/url\((https:\/\/fonts\.gstatic\.com\/[^)]+)\)/g)].map(m => m[1]).slice(0, 4);
    let out = "";
    for (const s of srcs) out += "@font-face{font-family:'" + family + "';" + (weight ? "font-weight:" + weight + ";" : "") + "src:url(" + await blobToData(await (await fetch(s)).blob()) + ");}";
    return out;
  }
  el("dlBtn").addEventListener("click", async () => {
    if (!valid) return;
    const btn = el("dlBtn"); btn.disabled = true; const old = btn.textContent; btn.textContent = "Preparing image…";
    const urls = [];
    try {
      const clone = svg.cloneNode(true);
      const vb = svg.viewBox.baseVal, scale = 2, W = vb.width * scale, H = vb.height * scale;
      clone.setAttribute("xmlns", SVGNS); clone.setAttribute("width", W); clone.setAttribute("height", H);
      clone.querySelectorAll("animateTransform").forEach(a => a.remove());
      let note = "";
      try {
        const font = drawFont(lastCfg);
        const css = await fontFaceCss(font.gf, Array.from(new Set(lastCfg.t.join("") + "Your text")).join("")) + await fontFaceCss("Inter", "about0123456789 in.", 600);
        const st = document.createElementNS(SVGNS, "style"); st.textContent = css; clone.insertBefore(st, clone.firstChild);
      } catch (e) { note = " The lettering may use a standard font because the style font could not be added."; }
      const ph = clone.querySelector(".gc-photo");
      if (ph && bgImg) { const c = document.createElement("canvas"); const s = Math.min(1, 1600 / Math.max(bgImg.naturalWidth, bgImg.naturalHeight)); c.width = bgImg.naturalWidth * s; c.height = bgImg.naturalHeight * s; c.getContext("2d").drawImage(bgImg, 0, 0, c.width, c.height); ph.setAttribute("href", c.toDataURL("image/jpeg", 0.85)); }
      const src = URL.createObjectURL(new Blob([new XMLSerializer().serializeToString(clone)], { type: "image/svg+xml" })); urls.push(src);
      const img = await new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = () => rej(new Error("render")); i.src = src; });
      const c = document.createElement("canvas"); c.width = W; c.height = H;
      const x = c.getContext("2d"); x.drawImage(img, 0, 0, W, H);
      x.font = "600 " + 20 * scale / 2 + "px Inter, Arial, sans-serif"; x.fillStyle = "rgba(255,255,255,.75)"; x.textAlign = "right";
      x.fillText("Grafix Club · " + N.designId(lastCfg) + " · visual approximation", W - 16, H - 16);
      const blob = await new Promise(res => c.toBlob(res, "image/png"));
      if (!blob) throw new Error("png");
      const href = URL.createObjectURL(blob); urls.push(href);
      const a = document.createElement("a"); a.href = href; a.download = "grafix-neon-" + N.designId(lastCfg) + ".png"; document.body.appendChild(a); a.click(); a.remove();
      announce("Preview image downloaded." + note);
      el("dlNote").textContent = "Image downloaded." + note;
    } catch (e) {
      announce("Could not create the image in this browser. Try another browser, or send the design link instead.");
      el("dlNote").textContent = "Could not create the image here. Use the design link instead.";
    } finally {
      setTimeout(() => urls.forEach(u => URL.revokeObjectURL(u)), 4000);
      btn.textContent = old; btn.disabled = !valid;
      setTimeout(() => { el("dlNote").textContent = ""; }, 6000);
    }
  });

  /* ---------------- reference / logo file ---------------- */
  function clearFile() {
    if (fileUrl) URL.revokeObjectURL(fileUrl);
    file = null; fileUrl = ""; el("f-file").value = "";
    el("fileChip").hidden = true; el("fileChip").textContent = ""; setMsg("file", "f-file", "");
  }
  async function takeFile(picked) {
    if (!picked) { clearFile(); render({ noHistory: true }); return; }
    let headBytes = new Uint8Array(0);
    try { headBytes = new Uint8Array(await picked.slice(0, 16).arrayBuffer()); } catch (err) { /* unreadable file is rejected below */ }
    const res = N.checkFile({ type: picked.type, size: picked.size, name: picked.name }, headBytes, CONFIG.maxUploadMB);
    if (!res.ok) { clearFile(); setMsg("file", "f-file", res.message, "err"); announce(res.message); render({ noHistory: true }); return; }
    clearFile(); file = picked; setMsg("file", "f-file", "");
    const chip = el("fileChip"); chip.hidden = false; chip.textContent = "";
    if (res.type !== "application/pdf") { fileUrl = URL.createObjectURL(picked); const im = document.createElement("img"); im.src = fileUrl; im.alt = "Preview of your logo or reference image"; im.width = 56; im.height = 56; chip.appendChild(im); }
    const name = document.createElement("span"); name.className = "fname"; name.textContent = picked.name + " (" + Math.max(1, Math.round(picked.size / 1024)) + " KB)"; chip.appendChild(name);
    const rm = document.createElement("button"); rm.type = "button"; rm.className = "btn btn-ghost btn-sm"; rm.textContent = "Remove"; rm.setAttribute("aria-label", "Remove file " + picked.name);
    rm.addEventListener("click", () => { clearFile(); render({ noHistory: true }); announce("File removed."); el("f-file").focus(); });
    chip.appendChild(rm);
    announce("File added: " + picked.name + ".");
    render({ noHistory: true });
  }
  el("f-file").addEventListener("change", e => takeFile(e.target.files && e.target.files[0]));
  const dz = el("dropZone");
  ["dragenter", "dragover"].forEach(t => dz.addEventListener(t, e => { e.preventDefault(); dz.classList.add("over"); }));
  ["dragleave", "drop"].forEach(t => dz.addEventListener(t, () => dz.classList.remove("over")));
  dz.addEventListener("drop", e => { e.preventDefault(); const fl = e.dataTransfer && e.dataTransfer.files; if (fl && fl.length) takeFile(fl[0]); });

  /* ---------------- own wall photo for the preview (never uploaded, never saved) ---------------- */
  function dropBg() {
    if (bgUrl) URL.revokeObjectURL(bgUrl);
    bgUrl = ""; bgImg = null; el("f-bgfile").value = ""; setMsg("bg", "f-bgfile", "");
    if (f.bg.value === "photo") f.bg.value = "mauve";
  }
  el("f-bgfile").addEventListener("change", async e => {
    const picked = e.target.files && e.target.files[0];
    const fail = msg => { el("f-bgfile").value = ""; setMsg("bg", "f-bgfile", msg, "err"); announce(msg); render({ noHistory: true }); };
    if (!picked) return;
    let headBytes = new Uint8Array(0);
    try { headBytes = new Uint8Array(await picked.slice(0, 16).arrayBuffer()); } catch (err) { /* rejected below */ }
    const res = N.checkFile({ type: picked.type, size: picked.size, name: picked.name }, headBytes, CONFIG.maxUploadMB);
    if (!res.ok) return fail(res.message);
    if (res.type === "application/pdf") return fail("Please choose a PNG, JPG or WebP photo for the background.");
    const url = URL.createObjectURL(picked), img = new Image();
    img.onload = () => {
      if (bgUrl) URL.revokeObjectURL(bgUrl);
      bgUrl = url; bgImg = img; setMsg("bg", "f-bgfile", ""); f.bg.value = "photo";
      announce("Wall photo added to the preview."); render({ noHistory: true });
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
      const load = document.createElement("button"); load.type = "button"; load.className = "saved-load"; load.textContent = N.designId(cfg) + " · " + N.summary(cfg);
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
    announce(ok ? "Design saved on this device (" + N.designId(lastCfg) + "). You can have up to " + MAX_SAVED + "." : "Could not save: your browser is blocking storage. Use Copy design link instead.");
    el("savedNote").textContent = ok ? "Saved on this device only." : "Saving is blocked in this browser. Use the link instead.";
  });

  let saveTimer = 0;
  function scheduleAutosave(cfg) {
    clearTimeout(saveTimer);
    if (!valid) return;
    saveTimer = setTimeout(() => safeStore.set(LS_DRAFT, N.encode(cfg)), 500);
  }

  /* ---------------- events ---------------- */
  // "input" fires for typing, sliders, checkboxes and radio buttons, so one listener covers every control.
  form.addEventListener("input", e => { if (e.target === f.dim) render({ noHistory: true }); else render(); });
  form.addEventListener("submit", e => e.preventDefault());

  /* ---------------- "how is this estimated" text, built from the live settings ---------------- */
  (function howText() {
    let t = "The sign's length comes from your text: each letter takes the width of the size you pick (" + N.SIZES.map(z => z.label + " " + z.w + " in").join(", ") + "), and its height is the size's letter height (" + N.SIZES.map(z => z.h + " in").join(", ") + ") for each line. " +
      "With Custom, you set the whole width and the letter height follows your text. " +
      "The neon price is that width multiplied by that height, charged at " + N.money(RATES.neonRatePerSqFt) + " per sq ft and rounded to the nearest ₹100" +
      (Number(RATES.neonRgbRatePerSqFt) > 0 ? " (RGB neon: " + N.money(RATES.neonRgbRatePerSqFt) + " per sq ft)" : "; RGB neon is priced on confirmation") + ". " +
      "An acrylic backing adds the difference between our neon-with-backboard rate (" + N.money(RATES.neonBackboardRatePerSqFt) + " per sq ft) and the neon rate. " +
      "One sign that comes to less than " + N.money(RATES.neonMinPrice) + " is shown at " + N.money(RATES.neonMinPrice) + "; quantity multiplies the price of one sign. " +
      "Outdoor use, fitting, symbols, a dimmer, logos and your notes are quoted by hand. GST extra where applicable. This is an estimate, not an offer, and no payment is taken on this website.";
    if (typeof GCCatalogue !== "undefined") {
      const ref = GCCatalogue.byId.get("neon-name-sign");
      if (ref && RATES.neonMinPrice < ref.price) t += " Our price list shows a custom neon name sign (up to 2 ft wide) from " + N.money(ref.price) + ", while this builder prices by area, so a small sign can show a lower number here. We confirm which price applies when we quote.";
    }
    el("howText").textContent = t;
  })();

  /* lets another script open a ready-made design here */
  window.GCStudio = { load(cfg, title) {
    const c = N.normalize(Object.assign({}, N.DEFAULTS, cfg)).config;
    writeCfg(c); render();
    const n = el("restoreNote"); n.textContent = "Started from the “" + (title || "collection") + "” design. Change anything you like."; n.hidden = false; announce(n.textContent);
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
    if (sp.get("type") === "rgb") f.ptype.value = "rgb";
    ensureFonts();   // the designer is the whole page, so fonts are wanted straight away
    syncView(); render(); renderSaved();
    clearTimeout(histTimer); hist.length = 0; hist.push(N.encode(lastCfg)); hpos = 0; syncHistBtns();
    if (status) { const n = el("restoreNote"); n.textContent = status; n.hidden = false; announce(status); }
  })();
  /* keep the RGB flow button in step with the sign type */
  form.addEventListener("change", e => { if (e.target.name === "ptype") syncView(); });
})();
