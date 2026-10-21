/* =========================================================
   GRAFIX CLUB – Neon Studio model
   ---------------------------------------------------------
   Pure functions (no DOM) shared by the studio UI and the
   Node tests: option lists, input validation, the pricing
   formula, the enquiry message and save/share encoding.

   IMPORTANT – pricing: this site has no server, cart or payment
   system. The number computed here is an indicative estimate;
   the shop confirms the final price on WhatsApp after checking
   the design. If a back end is added later, run estimate() again
   on the server and ignore any price sent by the browser.
   ========================================================= */
(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  else root.GCNeon = api;
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";

  // ratio = approximate letter height / sign width for one line; it drives the size estimate only (not an exact measurement).
  // deva = the font has Devanagari (Hindi) letters. Keep the first three keys: older share links and presets use them.
  const FONTS = [
    { key: "script", label: "Script", css: "'Pacifico', cursive", gf: "Pacifico", ratio: 0.42, group: "Classic" },
    { key: "block", label: "BLOCK", css: "'Bebas Neue', sans-serif", gf: "Bebas Neue", ratio: 0.3, group: "Classic" },
    { key: "marker", label: "Marker", css: "'Permanent Marker', cursive", gf: "Permanent Marker", ratio: 0.42, group: "Classic" },
    { key: "neon", label: "Neon Script", css: "'Neonderthaw', cursive", gf: "Neonderthaw", ratio: 0.45, group: "Script and wedding" },
    { key: "sacra", label: "Sacramento", css: "'Sacramento', cursive", gf: "Sacramento", ratio: 0.38, group: "Script and wedding" },
    { key: "yellow", label: "Yellowtail", css: "'Yellowtail', cursive", gf: "Yellowtail", ratio: 0.42, group: "Script and wedding" },
    { key: "dancing", label: "Dancing", css: "'Dancing Script', cursive", gf: "Dancing Script", ratio: 0.4, group: "Script and wedding" },
    { key: "vibes", label: "Great Vibes", css: "'Great Vibes', cursive", gf: "Great Vibes", ratio: 0.4, group: "Script and wedding" },
    { key: "lobster", label: "Lobster", css: "'Lobster', cursive", gf: "Lobster", ratio: 0.38, group: "Script and wedding" },
    { key: "kaushan", label: "Kaushan", css: "'Kaushan Script', cursive", gf: "Kaushan Script", ratio: 0.4, group: "Script and wedding" },
    { key: "satisfy", label: "Satisfy", css: "'Satisfy', cursive", gf: "Satisfy", ratio: 0.38, group: "Script and wedding" },
    { key: "monoton", label: "MONOTON", css: "'Monoton', sans-serif", gf: "Monoton", ratio: 0.34, group: "Bold and modern" },
    { key: "orbitron", label: "Orbitron", css: "'Orbitron', sans-serif", gf: "Orbitron", ratio: 0.36, group: "Bold and modern" },
    { key: "righteous", label: "Righteous", css: "'Righteous', sans-serif", gf: "Righteous", ratio: 0.34, group: "Bold and modern" },
    { key: "bungee", label: "BUNGEE", css: "'Bungee', sans-serif", gf: "Bungee", ratio: 0.36, group: "Bold and modern" },
    { key: "caveat", label: "Caveat", css: "'Caveat', cursive", gf: "Caveat", ratio: 0.36, group: "Handwritten" },
    { key: "kalam", label: "Kalam \u0915\u0932\u092E", css: "'Kalam', cursive", gf: "Kalam", ratio: 0.4, group: "Hindi (Devanagari)", deva: true },
    { key: "rozha", label: "Rozha \u0930\u094B\u091D\u093E", css: "'Rozha One', serif", gf: "Rozha One", ratio: 0.4, group: "Hindi (Devanagari)", deva: true },
    { key: "yatra", label: "Yatra \u092F\u093E\u0924\u094D\u0930\u093E", css: "'Yatra One', cursive", gf: "Yatra One", ratio: 0.4, group: "Hindi (Devanagari)", deva: true }
  ];
  const COLORS = [
    { key: "pink", label: "Hot pink", hex: "#ff2e93" }, { key: "white", label: "Warm white", hex: "#ffe9b8" },
    { key: "gold", label: "Gold", hex: "#ffc933" }, { key: "cyan", label: "Cyan", hex: "#27e6ff" },
    { key: "violet", label: "Violet", hex: "#9b5cff" }, { key: "green", label: "Green", hex: "#3bf08a" },
    { key: "red", label: "Red", hex: "#ff3b3b" }, { key: "orange", label: "Orange", hex: "#ff8a1f" },
    { key: "magenta", label: "Magenta", hex: "#ff3df2" }, { key: "blue", label: "Electric blue", hex: "#3d7bff" },
    { key: "lime", label: "Lime", hex: "#b8ff3a" }, { key: "lemon", label: "Lemon yellow", hex: "#fff23a" },
    { key: "mint", label: "Mint", hex: "#5fffd0" }, { key: "teal", label: "Teal", hex: "#14d9c0" },
    { key: "lavender", label: "Lavender", hex: "#c7a6ff" }, { key: "peach", label: "Peach", hex: "#ffa985" },
    { key: "rose", label: "Rose", hex: "#ff7ba9" }, { key: "coolwhite", label: "Cool white", hex: "#e6f4ff" }
  ];
  // Preview wall behind the sign (display only, never priced). c = main colour, light = light wall (neon is drawn with a darker core).
  // Customers can also pick any colour (g: "custom" + gc) or use their own wall photo (UI only, stays on the device).
  const BACKDROPS = [
    { key: "night", label: "Dark wall", c: "#100e17" }, { key: "black", label: "Matte black", c: "#050507" },
    { key: "concrete", label: "Concrete", c: "#3b3e44" }, { key: "brick", label: "Brick wall", c: "#2d1713" },
    { key: "wood", label: "Wood panel", c: "#2a1c12" }, { key: "navy", label: "Midnight blue", c: "#0b1330" },
    { key: "purple", label: "Purple room", c: "#2a0d45" }, { key: "terracotta", label: "Cafe terracotta", c: "#6a3524" },
    { key: "green", label: "Forest green", c: "#0f2a1e" }, { key: "light", label: "Light wall", c: "#ddd7cd", light: true },
    { key: "cream", label: "Cream plaster", c: "#efe6d2", light: true }, { key: "marble", label: "White marble", c: "#e9e9ec", light: true }
  ];
  const BACKINGS = [
    { key: "none", label: "No backing", hint: "Neon only" },
    { key: "rect", label: "Acrylic rectangle", hint: "Clear panel behind the sign" },
    { key: "shape", label: "Acrylic cut-to-shape", hint: "Panel follows the letters" }
  ];
  const USES = [
    { key: "indoor", label: "Indoor", hint: "Home, café, shop interior" },
    { key: "outdoor", label: "Outdoor", hint: "We confirm feasibility and price" }
  ];
  const FITTINGS = [
    { key: "pickup", label: "I will collect it", hint: "From our Virender Nagar shop" },
    { key: "fit", label: "I need fitting", hint: "Quoted separately" }
  ];
  const ICONS = [
    { key: "none", label: "None", d: "" },
    { key: "heart", label: "Heart", d: "M12 21s-7-4.5-9.5-9A5.5 5.5 0 0 1 12 6a5.5 5.5 0 0 1 9.5 6c-2.5 4.5-9.5 9-9.5 9z" },
    { key: "star", label: "Star", d: "M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z" },
    { key: "bolt", label: "Bolt", d: "M13 2L4 14h7l-1 8 9-12h-7z" },
    { key: "moon", label: "Moon", d: "M20 14.5A8.5 8.5 0 1 1 9.5 4a7 7 0 0 0 10.5 10.5z" }
  ];
  const PRESETS = [
    { key: "name", label: "Name sign", cfg: { t: ["Your Name", ""], f: "script", c: "pink", w: 3 } },
    { key: "open", label: "OPEN sign", cfg: { t: ["OPEN", ""], f: "block", c: "red", w: 2 } },
    { key: "vibes", label: "Good vibes", cfg: { t: ["Good", "Vibes"], f: "marker", c: "cyan", w: 3 } },
    { key: "welcome", label: "Welcome", cfg: { t: ["Welcome", ""], f: "script", c: "gold", w: 3 } },
    { key: "backboard", label: "With backboard", cfg: { t: ["Your Name", ""], f: "script", c: "violet", w: 3, b: "shape" } },
    { key: "wedding", label: "Wedding", cfg: { t: ["Mr & Mrs", ""], f: "vibes", c: "rose", w: 3, i: "heart" } },
    { key: "cafe", label: "Cafe", cfg: { t: ["Coffee", "& Chai"], f: "monoton", c: "peach", c2: "cyan", w: 3 } },
    { key: "swagatam", label: "Hindi welcome", cfg: { t: ["\u0938\u094D\u0935\u093E\u0917\u0924\u092E\u094D", ""], f: "kalam", c: "gold", w: 3 } }
  ];

  const LIMITS = { line: 20, notes: 200, wMin: 1, wMax: 8, wStep: 0.5, maxLines: 2 };
  const DEFAULTS = Object.freeze({ t: ["Your Name", ""], f: "script", c: "pink", w: 3, b: "none", u: "indoor", x: "pickup", i: "none", n: "", c2: "", g: "night", gc: "" });

  const keysOf = list => list.map(o => o.key);
  const pick = (list, key, fallback) => (keysOf(list).includes(key) ? key : fallback);
  const find = (list, key) => list.find(o => o.key === key) || list[0];
  const clean = (s, max) => Array.from(String(s == null ? "" : s).normalize("NFC")
    .replace(/[\u0000-\u001F\u007F-\u009F\u200B-\u200F\u2028\u2029\u202A-\u202E\u2066-\u2069\uFEFF]/g, " ").replace(/\s+/g, " ").trim()).slice(0, max).join("");
  const HEX = /^#[0-9a-f]{6}$/i;
  /** A colour is either a key from COLORS or a custom "#rrggbb" value. Anything else falls back. */
  const colorKey = (raw, fallback) => { const v = typeof raw === "string" ? raw.trim().toLowerCase() : ""; return (keysOf(COLORS).includes(v) || HEX.test(v)) ? v : fallback; };
  const colorOf = key => HEX.test(key || "") ? { key: "custom", label: "Custom colour " + key.toUpperCase(), hex: key.toLowerCase() } : find(COLORS, key);
  const luminance = hex => { const n = parseInt(hex.slice(1), 16); return (0.2126 * (n >> 16) + 0.7152 * ((n >> 8) & 255) + 0.0722 * (n & 255)) / 255; };
  /** True for a light preview wall (a light preset or a light custom colour). */
  const isLightWall = cfg => cfg.g === "custom" ? luminance(cfg.gc) > 0.6 : !!(BACKDROPS.find(b => b.key === cfg.g) || {}).light;
  const DEVA = /[\u0900-\u097F]/;
  const hasNonLatin = s => /[^\u0000-\u024F\u2000-\u206F\u20A0-\u20CF]/.test(s);
  const money = n => "\u20B9" + Number(n).toLocaleString("en-IN");

  /**
   * normalize(raw) -> { config, errors, warnings }
   * Always returns a safe config (whitelisted keys, clamped numbers, trimmed text).
   * errors  : things the customer must fix before sending (field -> message)
   * warnings: advisory notes shown beside the field
   */
  function normalize(raw) {
    raw = raw && typeof raw === "object" ? raw : {};
    const rt = Array.isArray(raw.t) ? raw.t : [raw.t, ""];
    const errors = {}, warnings = {};
    const l1raw = String(rt[0] == null ? "" : rt[0]), l2raw = String(rt[1] == null ? "" : rt[1]);
    const l1 = clean(l1raw, LIMITS.line), l2 = clean(l2raw, LIMITS.line);
    if (!l1 && l2) errors.line1 = "Use line 1 first. Line 2 is optional.";
    else if (!l1) errors.line1 = "Enter the text for your sign.";
    if (Array.from(l1raw.trim()).length > LIMITS.line) errors.line1 = "Line 1 can have up to " + LIMITS.line + " characters.";
    if (Array.from(l2raw.trim()).length > LIMITS.line) errors.line2 = "Line 2 can have up to " + LIMITS.line + " characters.";
    const fontKey = pick(FONTS, raw.f, DEFAULTS.f), fontObj = find(FONTS, fontKey), allText = l1 + l2;
    if (hasNonLatin(allText)) {
      const onlyLatinOrDeva = !/[^\u0000-\u024F\u2000-\u206F\u20A0-\u20CF\u0900-\u097F]/.test(allText);
      if (DEVA.test(allText) && !fontObj.deva) warnings.line1 = "This style has no Hindi letters. Choose a style from the Hindi (Devanagari) group to see your text properly.";
      else if (!(DEVA.test(allText) && onlyLatinOrDeva)) warnings.line1 = "The preview font may not show this script correctly. Tell us the style you want in the notes and we will confirm it on the mock-up.";
    }
    let w = Number(raw.w); if (!Number.isFinite(w)) w = DEFAULTS.w;
    w = Math.min(LIMITS.wMax, Math.max(LIMITS.wMin, Math.round(w / LIMITS.wStep) * LIMITS.wStep));
    const notesRaw = String(raw.n == null ? "" : raw.n);
    if (Array.from(notesRaw.trim()).length > LIMITS.notes) errors.notes = "Notes can have up to " + LIMITS.notes + " characters.";
    const bgHex = HEX.test(String(raw.gc || "").trim()) ? String(raw.gc).trim().toLowerCase() : "";
    const bgKey = raw.g === "custom" ? (bgHex ? "custom" : DEFAULTS.g) : pick(BACKDROPS, raw.g, DEFAULTS.g);
    const c = colorKey(raw.c, DEFAULTS.c), c2 = (l2 && !HEX.test(String(raw.c2 || "").trim())) ? colorKey(raw.c2, "") : "";
    [c, c2].forEach(k => { if (HEX.test(k) && luminance(k) < 0.3) warnings.color = "That colour is quite dark, so it will not glow much. Neon looks best in bright shades; we will suggest the closest bright match."; });
    const config = {
      t: l1 ? (l2 ? [l1, l2] : [l1, ""]) : ["", ""],
      f: fontKey, c, c2, g: bgKey, gc: bgKey === "custom" ? bgHex : "", w,
      b: pick(BACKINGS, raw.b, DEFAULTS.b), u: pick(USES, raw.u, DEFAULTS.u), x: pick(FITTINGS, raw.x, DEFAULTS.x),
      i: pick(ICONS, raw.i, DEFAULTS.i), n: clean(notesRaw, LIMITS.notes)
    };
    return { config, errors, warnings, ok: Object.keys(errors).length === 0 };
  }

  const lineCount = cfg => (cfg.t[1] ? 2 : 1);

  /**
   * estimate(config, rates) -> { rows, total, size, minApplied, toConfirm }
   *   area    = width x height            (height = width x font ratio x lines, an approximation)
   *   neon    = area x neonRatePerSqFt
   *   backing = area x (backboard rate - neon rate)   when an acrylic backing is chosen
   *   each line is rounded to the nearest ₹100; total never goes below neonMinPrice
   * Items the shop has not published a price for (outdoor build, fitting, symbols, notes)
   * are NOT priced: they are listed in toConfirm and the total says "from".
   */
  function estimate(cfg, rates) {
    const font = find(FONTS, cfg.f);
    const w = cfg.w, h = w * font.ratio * lineCount(cfg);
    const area = w * h;
    const r100 = n => Math.round(n / 100) * 100;
    const rate = rates.neonRatePerSqFt, back = rates.neonBackboardRatePerSqFt;
    const rows = [];
    const neon = r100(area * rate);
    rows.push({ key: "neon", label: "Neon sign, " + area.toFixed(1) + " sq ft at " + money(rate) + " per sq ft", amount: neon });
    let sum = neon;
    if (cfg.b !== "none") {
      const extra = r100(area * Math.max(0, back - rate));
      rows.push({ key: "backing", label: find(BACKINGS, cfg.b).label + " (" + money(Math.max(0, back - rate)) + " per sq ft extra)", amount: extra });
      sum += extra;
    }
    let minApplied = false;
    if (sum < rates.neonMinPrice) { rows.push({ key: "min", label: "Minimum order price adjustment", amount: rates.neonMinPrice - sum }); sum = rates.neonMinPrice; minApplied = true; }
    const toConfirm = [];
    if (cfg.u === "outdoor") toConfirm.push("Outdoor use: we confirm feasibility and price");
    if (cfg.x === "fit") toConfirm.push("Fitting at your location");
    if (cfg.i !== "none") toConfirm.push("Symbol (" + find(ICONS, cfg.i).label.toLowerCase() + ") adds neon length");
    if (HEX.test(cfg.c || "") || HEX.test(cfg.c2 || "")) toConfirm.push("Closest available LED shade for your custom colour");
    if (cfg.n) toConfirm.push("Anything you wrote in the notes");
    if (hasNonLatin(cfg.t.join(""))) toConfirm.push("Lettering style for this script");
    return { rows, total: sum, size: { w, h: Math.round(h * 10) / 10, area: Math.round(area * 10) / 10, lines: lineCount(cfg) }, minApplied, toConfirm };
  }

  /* ---------- save / share encoding (URL-safe base64 of compact JSON) ---------- */
  const b64 = {
    enc(str) { const bytes = new TextEncoder().encode(str); let s = ""; bytes.forEach(b => { s += String.fromCharCode(b); }); return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, ""); },
    dec(str) { const s = atob(str.replace(/-/g, "+").replace(/_/g, "/")); const bytes = Uint8Array.from(s, c => c.charCodeAt(0)); return new TextDecoder().decode(bytes); }
  };
  function encode(cfg) { return b64.enc(JSON.stringify(Object.assign({ v: 1 }, cfg))); }
  /** decode(str) -> normalized config, or null if the string is not a valid design */
  function decode(str) {
    try {
      if (typeof str !== "string" || !str || str.length > 1200 || !/^[A-Za-z0-9_-]+$/.test(str)) return null;
      const obj = JSON.parse(b64.dec(str));
      if (!obj || typeof obj !== "object" || obj.v !== 1) return null;
      const r = normalize(obj);
      return r.config.t[0] ? r.config : null;
    } catch (e) { return null; }
  }

  /** Short label for the saved-designs list. */
  function summary(cfg) {
    return cfg.t.filter(Boolean).join(" ") + " · " + colorOf(cfg.c).label + " · " + find(FONTS, cfg.f).label + " · " + cfg.w + " ft";
  }

  /** Plain-text enquiry for WhatsApp / e-mail. */
  function buildMessage(cfg, est, opts) {
    opts = opts || {};
    const L = [];
    L.push(opts.heading || "Hi Grafix Club, I designed a neon sign on your website.");
    L.push("Text: \"" + cfg.t.filter(Boolean).join(" / ") + "\"");
    L.push("Colour: " + colorOf(cfg.c).label + (cfg.t[1] && cfg.c2 ? " (line 2: " + colorOf(cfg.c2).label + ")" : ""));
    L.push("Style: " + find(FONTS, cfg.f).label);
    L.push("Width: " + cfg.w + " ft (about " + est.size.w + " ft x " + est.size.h + " ft)");
    if (cfg.i !== "none") L.push("Symbol: " + find(ICONS, cfg.i).label);
    L.push("Backing: " + find(BACKINGS, cfg.b).label);
    L.push("Use: " + find(USES, cfg.u).label);
    L.push("Fitting: " + find(FITTINGS, cfg.x).label);
    if (cfg.n) L.push("Notes: " + cfg.n);
    L.push("Website estimate: " + money(est.total) + " (indicative, from)");
    if (est.toConfirm.length) L.push("To confirm: " + est.toConfirm.join("; "));
    if (opts.designUrl) L.push("Open my design: " + opts.designUrl);
    if (opts.hasFile) L.push("I will attach my reference file in this chat.");
    L.push("Please confirm design and price.");
    return L.join("\n");
  }

  /* ---------- reference-file validation (type, size, magic bytes) ---------- */
  const FILE_TYPES = { "image/png": "PNG", "image/jpeg": "JPG", "image/webp": "WebP", "application/pdf": "PDF" };
  function sniff(bytes) {
    const b = Array.from(bytes.slice(0, 12));
    const ascii = (from, len) => String.fromCharCode(...b.slice(from, from + len));
    if (b[0] === 0x89 && ascii(1, 3) === "PNG") return "image/png";
    if (b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return "image/jpeg";
    if (ascii(0, 4) === "RIFF" && ascii(8, 4) === "WEBP") return "image/webp";
    if (ascii(0, 4) === "%PDF") return "application/pdf";
    return null;
  }
  /** checkFile({type,size,name}, headerBytes, maxMB) -> {ok, message, type} */
  function checkFile(meta, bytes, maxMB) {
    if (!meta || !FILE_TYPES[meta.type]) return { ok: false, message: "Please choose a PNG, JPG, WebP or PDF file." };
    if (!meta.size) return { ok: false, message: "That file is empty." };
    if (meta.size > maxMB * 1024 * 1024) return { ok: false, message: "That file is too large. The limit is " + maxMB + " MB." };
    const real = sniff(bytes || []);
    if (real !== meta.type) return { ok: false, message: "That file does not look like a real " + FILE_TYPES[meta.type] + ". Please choose another file." };
    return { ok: true, type: real, message: "" };
  }

  return { FONTS, COLORS, BACKDROPS, colorOf, luminance, isLightWall, BACKINGS, USES, FITTINGS, ICONS, PRESETS, LIMITS, DEFAULTS, FILE_TYPES, normalize, estimate, encode, decode, summary, buildMessage, checkFile, sniff, find, money, hasNonLatin };
});
