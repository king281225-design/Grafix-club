/* =========================================================
   GRAFIX CLUB – Design collection
   Original neon text designs drawn live in CSS (no photos, nothing copied from other sites).
   Needs: config.js, common.js, neon-model.js. studio.js is optional (enables "Customise").
   The shortlist is stored only in this browser (localStorage) until the visitor taps WhatsApp.
   ========================================================= */
(function () {
  "use strict";
  const root = document.getElementById("collectionApp");
  if (!root || typeof GCNeon === "undefined") return;
  const N = GCNeon, { waUrl, safeStore, announce } = GC;
  const RATES = { neonRatePerSqFt: CONFIG.neonRatePerSqFt, neonBackboardRatePerSqFt: CONFIG.neonBackboardRatePerSqFt, neonMinPrice: CONFIG.neonMinPrice };
  const LS_FAV = "gc.collection.fav";
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const WIDE = new Set(["monoton", "bungee", "orbitron", "righteous", "funky", "grooving", "robo", "stylish"]);

  /* every design is validated by the same model the Studio uses */
  const items = N.COLLECTION.map(d => {
    const cfg = N.normalize(Object.assign({}, N.DEFAULTS, d.cfg)).config;
    const font = N.find(N.FONTS, cfg.f), c1 = N.colorOf(cfg.c), c2 = cfg.t[1] && cfg.c2 ? N.colorOf(cfg.c2) : c1;
    const lines = cfg.t.filter(Boolean), longest = Math.max.apply(null, lines.map(s => Array.from(s).length));
    const k = Math.min(24, 78 / (Math.max(longest, 3) * (WIDE.has(cfg.f) ? 0.72 : font.deva ? 0.62 : 0.52)));
    const est = N.estimate(cfg, RATES);
    return { id: d.id, cat: d.cat, title: d.title, cfg, font, c1, c2, lines, k: Math.round(k * 10) / 10, est, icon: N.find(N.ICONS, cfg.i) };
  });
  /* Name plates and shop letters: original CSS drawings of our own products (no neon, so no neon estimate).
     The "from" price comes from the price list (catalogue.js) so it can never drift from it. */
  const P = (id, cat, title, style, lines, fk, product, sub, wall) => ({ id, cat, title, style, lines, fk, product, sub, wall: wall || "night" });
  const PLATES = [
    P("pl-black-gold", "plates", "Black and gold name plate", "black-gold", ["Rohan & Neha", "A-102"], "vibes", "acrylic-name-plate", "Black acrylic, gold lettering", "light"),
    P("pl-wood-led", "plates", "Backlit wood name plate", "wood-led", ["Sharma", "Residence"], "righteous", "led-name-plate", "Wood look with warm LED glow", "stone"),
    P("pl-white-round", "plates", "Round family plate", "white-round", ["The Verma", "Family"], "vibes", "acrylic-name-plate", "White acrylic with gold ring", "wood"),
    P("pl-steel-gold", "plates", "Gold steel letters", "steel-gold", ["KHANNA", "House No. 7"], "block", "steel-name-plate", "Raised gold steel letters", "stone"),
    P("pl-glass", "plates", "Clinic glass plate", "glass", ["Dr. Mehra", "Dental Clinic"], "righteous", "acrylic-name-plate", "Clear acrylic on gold standoffs", "light"),
    P("pl-hindi", "plates", "Hindi name plate", "black-gold", ["\u0936\u0930\u094D\u092E\u093E \u0928\u093F\u0935\u093E\u0938", "\u092E\u0915\u093E\u0928 \u0928\u0902. 21"], "rozha", "acrylic-name-plate", "Black acrylic, gold Hindi lettering", "light"),
    P("lt-gold-3d", "letters", "3D gold shop letters", "gold-3d", ["BEAUTY", "SALON"], "block", "steel-acrylic-letters", "Gold steel / acrylic letters", "dark"),
    P("lt-halo", "letters", "Halo-lit letters", "halo", ["CAFE", "ROYAL"], "righteous", "acrylic-led-letters", "Letters glow from behind", "dark"),
    P("lt-front", "letters", "Front-lit LED letters", "front", ["MOBILE", "HUB"], "bungee", "acrylic-led-letters", "Bright LED faces", "dark"),
    P("lt-board", "letters", "LED shop board", "board", ["Fresh Sweets", "Open daily"], "righteous", "led-shop-board", "Backlit board, outdoor-ready", "dark"),
    P("lt-steel", "letters", "Brushed steel letters", "steel", ["STUDIO", ""], "block", "steel-acrylic-letters", "Silver brushed steel", "concrete"),
    P("lt-clinic", "letters", "Clinic light box", "box", ["Smile", "Dental Care"], "righteous", "led-shop-board", "Backlit box with printed face", "dark"),
    P("pl-arch", "plates", "Arch name plate", "arch", ["Anand", "Nivas"], "vibes", "acrylic-name-plate", "Matte black arch, gold lettering", "light"),
    P("pl-marble", "plates", "Marble look plate", "marble", ["The Kapoors", "Villa 12"], "righteous", "acrylic-name-plate", "Marble finish, brass lettering", "stone"),
    P("pl-edge", "plates", "Edge-lit acrylic plate", "edge", ["Aarav", "Residence"], "righteous", "led-name-plate", "Soft glow around the edge", "stone"),
    P("pl-brass-wood", "plates", "Walnut and brass plate", "brass-wood", ["Seema's Nivas", "11/73"], "vibes", "steel-name-plate", "Walnut wood, raised brass letters", "light"),
    P("lt-reception", "letters", "Matte white reception logo", "matte-white", ["Luxe", "Studio"], "vibes", "acrylic-led-letters", "Matte 3D letters on a slat wall", "slat"),
    P("lt-wood", "letters", "Wooden cafe letters", "wood-letters", ["CAFE", "BREW"], "block", "steel-acrylic-letters", "Cut wood-look letters", "cream"),
    P("lt-black-gold", "letters", "Black and gold 3D letters", "black-gold-3d", ["NOIR", "Fashion"], "righteous", "steel-acrylic-letters", "Black acrylic with gold edge", "light"),
    P("lt-round", "letters", "Round light box", "round-box", ["HAIR", "SALON"], "righteous", "led-shop-board", "Circular backlit sign", "slat")
  ];
  /* Design ideas: pictures supplied by the shop. They show styles we can make; the final size, finish and price are confirmed on a mock-up. */
  const IDEA = (id, title, file, w, h, alt, product, sub) => ({ id, cat: "ideas", title, file, w, h, alt, product, sub });
  const IDEAS = [
    IDEA("id-neon-heart", "Heart neon name sign", "d1-ram-harleen", 890, 755, "Neon sign idea: two names in warm yellow script inside a pink neon heart with small hearts, on a black wall", "neon-name-sign", "Neon name sign idea"),
    IDEA("id-backlit-ganesh", "Backlit acrylic plate with Krishna motif", "d3-rohit-ananya", 900, 600, "Name plate idea: frosted acrylic plate with a warm backlight, a flute-and-feather motif and the names Rohit and Ananya", "led-name-plate", "Backlit acrylic plate idea"),
    IDEA("id-gold-leaf", "Black and gold leaf plate", "d5-priyanka-abhishek", 900, 600, "Name plate idea: black acrylic plate with gold mirror leaf motif and gold script names", "acrylic-name-plate", "Black acrylic with gold lettering idea"),
    IDEA("id-arch", "Arch plate with gold vine", "d4-vinay-priyanka", 842, 900, "Name plate idea: matte black arch-shaped plate with gold leaf vine, a house number and two names", "acrylic-name-plate", "Matte black arch plate idea"),
    IDEA("id-om-wood", "Wood plate with Om and warm glow", "d6-flat-104", 900, 600, "Name plate idea: carved wood plate with an Om symbol, gold lettering and a warm backlight", "led-name-plate", "Carved wood plate with backlight idea"),
    IDEA("id-brass-wood", "Walnut plate with brass frame", "d7-solanki", 900, 600, "Name plate idea: walnut wood plate with a brass frame and raised brass Ganesha motif and lettering", "steel-name-plate", "Walnut and brass plate idea"),
    IDEA("id-om-stone", "Backlit Om plate on stone", "d8-seemas-nivas", 661, 900, "Name plate idea: black plate with an Om symbol and a warm halo glow, mounted on a stone wall", "led-name-plate", "Backlit plate idea"),
    IDEA("id-gold-3d", "Gold 3D letters on black", "d9-nanak", 675, 900, "Name plate idea: matte black plate with raised gold 3D script lettering", "acrylic-name-plate", "Raised gold lettering idea"),
    IDEA("id-wall-letters", "Black wall-mounted name letters", "d2-sharma", 560, 900, "Name sign idea: black cut-out lettering mounted on a textured outside wall next to a front door", "steel-acrylic-letters", "Cut-out wall letters idea")
  ];
  const priceText = id => {
    const p = typeof GCCatalogue !== "undefined" && GCCatalogue.byId.get(id);
    if (!p) return "";
    return p.basis === "from" ? "From " + N.money(p.price) : N.money(p.price) + " " + p.unit;
  };
  PLATES.forEach(d => {
    const font = N.fontOf(d.fk), lines = d.lines.filter(Boolean), longest = Math.max.apply(null, lines.map(x => Array.from(x).length));
    const wide = WIDE.has(d.fk) || /^(gold-3d|halo|front|steel|board)$/.test(d.style);
    items.push({ id: d.id, cat: d.cat, title: d.title, plate: d, font, lines, k: Math.round(Math.min(15, 62 / (Math.max(longest, 3) * (wide ? 0.68 : font.deva ? 0.62 : 0.52))) * 10) / 10, priceText: priceText(d.product), sub: d.sub });
  });
  IDEAS.forEach(d => items.push({ id: d.id, cat: d.cat, title: d.title, idea: d, font: null, lines: [], priceText: priceText(d.product), sub: d.sub }));
  const byId = new Map(items.map(i => [i.id, i]));
  const CATS = N.COLLECTION_CATEGORIES.concat([{ key: "plates", label: "Name plates" }, { key: "letters", label: "Shop letters & boards" }, { key: "ideas", label: "Design ideas" }]);
  const catLabel = key => (CATS.find(c => c.key === key) || {}).label || key;

  let filter = "all";
  let fav = [];
  try { const raw = JSON.parse(safeStore.get(LS_FAV) || "[]"); if (Array.isArray(raw)) fav = raw.filter(id => byId.has(id)).slice(0, 12); } catch (e) { fav = []; }
  const saveFav = () => safeStore.set(LS_FAV, JSON.stringify(fav));

  const colourNames = i => i.cfg.t[1] && i.cfg.c2 && i.cfg.c2 !== i.cfg.c ? i.c1.label + " and " + i.c2.label.toLowerCase() : i.c1.label;
  const altOf = i => i.idea ? i.idea.alt : i.plate ? "Design idea: " + i.title.toLowerCase() + ", " + i.lines.join(" / ") + "." : "Neon sign design: " + i.lines.join(" / ") + ", " + i.font.label.replace(/[^\w &-]/g, "").trim() + " lettering, " + colourNames(i).toLowerCase() + ", on a " + (N.find(N.BACKDROPS, i.cfg.g).label.toLowerCase()) + ".";
  const msgOne = i => i.idea ? "Hi Grafix Club, I like the “" + i.title + "” design idea from your collection. Can you make something like it and quote it?" : "Hi Grafix Club, I like the “" + i.title + "” design (" + i.lines.join(" / ") + (i.cfg ? ", " + N.sizeOf(i.cfg.z).label + " size" : "") + ") from your collection. Can you quote it?";
  const msgMany = list => "Hi Grafix Club, I shortlisted these designs from your collection:\n" + list.map((i, n) => (n + 1) + ". " + i.title + (i.lines.length ? " – “" + i.lines.join(" / ") + "”" : " (design idea)") + (i.cfg ? ", " + N.sizeOf(i.cfg.z).label + " size, about " + N.money(i.est.total) : i.priceText ? ", " + i.priceText.toLowerCase() : "")).join("\n") + "\nPlease help me choose and share a quote.";

  const plateCard = (i, on) =>
    '<li class="coll-card" data-id="' + i.id + '" data-cat="' + i.cat + '">' +
      '<div class="cw cw-w-' + i.plate.wall + '" role="img" aria-label="' + esc(altOf(i)) + '">' +
        '<div class="pl pl-' + i.plate.style + '" style="--ff:' + i.font.css + ';--k:' + i.k + '" aria-hidden="true">' +
          i.lines.map((x, n) => '<span class="pl-l' + (n === 1 ? " pl-l2" : "") + '"' + (/[\u0900-\u097F]/.test(x) ? ' lang="hi"' : "") + ">" + esc(x) + "</span>").join("") + "</div></div>" +
      '<div class="coll-body"><div class="coll-top"><div><h3>' + esc(i.title) + '</h3><p class="coll-cat">' + esc(catLabel(i.cat)) + "</p></div>" +
        '<button type="button" class="fav" data-fav="' + i.id + '" aria-pressed="' + on + '" aria-label="Shortlist ' + esc(i.title) + '"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="' + N.find(N.ICONS, "heart").d + '"/></svg></button></div>' +
        '<p class="coll-meta">' + esc(i.sub) + "</p>" +
        '<p class="coll-price">' + (i.priceText ? "<b>" + esc(i.priceText) + "</b> <small>price list, final price on size</small>" : "<small>Price on request</small>") + "</p>" +
        '<div class="coll-actions"><a class="btn btn-wa btn-sm" href="' + waUrl(msgOne(i)) + '" target="_blank" rel="noopener">Ask on WhatsApp<span class="sr-only"> about ' + esc(i.title) + " (opens in a new tab)</span></a></div></div></li>";

  const ideaCard = (i, on) =>
    '<li class="coll-card" data-id="' + i.id + '" data-cat="' + i.cat + '">' +
      '<div class="cw cw-photo"><img src="assets/designs/' + i.idea.file + '.jpg" alt="' + esc(i.idea.alt) + '" width="' + i.idea.w + '" height="' + i.idea.h + '" loading="lazy" decoding="async"></div>' +
      '<div class="coll-body"><div class="coll-top"><div><h3>' + esc(i.title) + '</h3><p class="coll-cat">' + esc(catLabel(i.cat)) + "</p></div>" +
        '<button type="button" class="fav" data-fav="' + i.id + '" aria-pressed="' + on + '" aria-label="Shortlist ' + esc(i.title) + '"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="' + N.find(N.ICONS, "heart").d + '"/></svg></button></div>' +
        '<p class="coll-meta">' + esc(i.sub) + ". Final design is confirmed on a mock-up.</p>" +
        '<p class="coll-price">' + (i.priceText ? "<b>" + esc(i.priceText) + "</b> <small>price list, final price on size</small>" : "<small>Price on request</small>") + "</p>" +
        '<div class="coll-actions"><a class="btn btn-wa btn-sm" href="' + waUrl(msgOne(i)) + '" target="_blank" rel="noopener">Ask on WhatsApp<span class="sr-only"> about ' + esc(i.title) + " (opens in a new tab)</span></a></div></div></li>";

  const cardHtml = i => {
    const on = fav.includes(i.id);
    if (i.idea) return ideaCard(i, on);
    if (i.plate) return plateCard(i, on);
    const iconSvg = i.icon.d ? '<svg class="cw-ic" viewBox="0 0 24 24" aria-hidden="true"><path d="' + i.icon.d + '"/></svg>' : "";
    return '<li class="coll-card" data-id="' + i.id + '" data-cat="' + i.cat + '">' +
      '<div class="cw cw-' + i.cfg.g + '" role="img" aria-label="' + esc(altOf(i)) + '">' +
        '<div class="cw-in' + (i.cfg.b !== "none" ? " cw-back" : "") + '" style="--n1:' + i.c1.hex + ';--n2:' + i.c2.hex + ';--ff:' + i.font.css + ';--k:' + i.k + '" aria-hidden="true">' +
          iconSvg + i.lines.map((s, n) => '<span class="cw-l' + (n === 1 ? " cw-l2" : "") + '"' + (/[ऀ-ॿ]/.test(s) ? ' lang="hi"' : "") + ">" + esc(s) + "</span>").join("") +
        "</div></div>" +
      '<div class="coll-body">' +
        '<div class="coll-top"><div><h3>' + esc(i.title) + '</h3><p class="coll-cat">' + esc(catLabel(i.cat)) + "</p></div>" +
        '<button type="button" class="fav" data-fav="' + i.id + '" aria-pressed="' + on + '" aria-label="Shortlist ' + esc(i.title) + '"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="' + N.find(N.ICONS, "heart").d + '"/></svg></button></div>' +
        '<p class="coll-meta">' + esc(i.font.label.replace(/[^\w &-]/g, "").trim()) + " · " + esc(colourNames(i)) + " · " + N.sizeOf(i.cfg.z).label + ' size</p>' +
        '<p class="coll-price">About <b>' + N.money(i.est.total) + '</b> <small>estimate' + (i.est.toConfirm.length ? ", symbol quoted extra" : "") + "</small></p>" +
        '<div class="coll-actions"><button type="button" class="btn btn-ghost btn-sm" data-use="' + i.id + '">Customise this</button>' +
        '<a class="btn btn-wa btn-sm" href="' + waUrl(msgOne(i)) + '" target="_blank" rel="noopener">Ask on WhatsApp<span class="sr-only"> about ' + esc(i.title) + " (opens in a new tab)</span></a></div>" +
      "</div></li>";
  };

  root.innerHTML =
    '<div class="coll-filters" role="group" aria-label="Filter designs by type" id="collFilters"></div>' +
    '<p class="coll-count" id="collCount" aria-live="polite"></p>' +
    '<ul class="coll-grid" id="collGrid"></ul>' +
    '<div class="coll-bar" id="collBar" hidden role="region" aria-label="Your shortlist"><p id="collBarText"></p><div class="coll-bar-actions"><a class="btn btn-wa btn-sm" id="collSend" target="_blank" rel="noopener">Send shortlist on WhatsApp<span class="sr-only"> (opens in a new tab)</span></a><button type="button" class="btn btn-ghost btn-sm" id="collClear">Clear</button></div></div>';
  const grid = document.getElementById("collGrid"), bar = document.getElementById("collBar");

  const cats = [{ key: "all", label: "All designs" }].concat(CATS.filter(c => items.some(i => i.cat === c.key)));
  document.getElementById("collFilters").innerHTML = cats.map(c => '<button type="button" class="chip-btn" data-filter="' + c.key + '" aria-pressed="' + (c.key === filter) + '">' + esc(c.label) + " <small>" + (c.key === "all" ? items.length : items.filter(i => i.cat === c.key).length) + "</small></button>").join("");

  function paint() {
    const shown = items.filter(i => filter === "all" || i.cat === filter);
    grid.innerHTML = shown.map(cardHtml).join("");
    document.getElementById("collCount").textContent = "Showing " + shown.length + " design" + (shown.length === 1 ? "" : "s") + (filter === "all" ? "" : " in “" + catLabel(filter) + "”") + ".";
    paintBar();
  }
  function paintBar() {
    const list = fav.map(id => byId.get(id)).filter(Boolean);
    bar.hidden = !list.length;
    if (!list.length) return;
    document.getElementById("collBarText").textContent = list.length + (list.length === 1 ? " design" : " designs") + " shortlisted: " + list.map(i => i.title).join(", ") + ".";
    document.getElementById("collSend").href = waUrl(msgMany(list));
  }

  root.addEventListener("click", e => {
    const fb = e.target.closest("[data-filter]");
    if (fb) { filter = fb.dataset.filter; root.querySelectorAll("[data-filter]").forEach(b => b.setAttribute("aria-pressed", String(b === fb))); paint(); return; }
    const hb = e.target.closest("[data-fav]");
    if (hb) {
      const id = hb.dataset.fav, i = byId.get(id), at = fav.indexOf(id);
      if (at >= 0) fav.splice(at, 1); else if (fav.length >= 12) { announce("You can shortlist up to 12 designs. Remove one to add another."); return; } else fav.push(id);
      saveFav(); hb.setAttribute("aria-pressed", String(fav.includes(id))); paintBar();
      announce((fav.includes(id) ? "Added " : "Removed ") + i.title + (fav.includes(id) ? " to" : " from") + " your shortlist. " + fav.length + " shortlisted.");
      return;
    }
    const ub = e.target.closest("[data-use]");
    if (ub) {
      const i = byId.get(ub.dataset.use);
      if (window.GCStudio && typeof window.GCStudio.load === "function") window.GCStudio.load(i.cfg, i.title);
      else location.href = "index.html?design=" + N.encode(i.cfg) + "#studio";
    }
  });
  document.getElementById("collClear").addEventListener("click", () => { fav = []; saveFav(); paint(); announce("Shortlist cleared."); });

  /* fonts: one small request for just the glyphs these designs use, only when the section is near the screen */
  let fontsAsked = false;
  function loadFonts() {
    if (fontsAsked) return; fontsAsked = true;
    const used = [], seen = new Set(); let glyphs = "";
    items.forEach(i => { if (i.font && !seen.has(i.font.key)) { seen.add(i.font.key); used.push(i.font); } glyphs += i.lines.join(""); });
    const text = Array.from(new Set(Array.from(glyphs))).join("");
    const link = document.createElement("link"); link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?" + used.map(ft => "family=" + encodeURIComponent(ft.gf).replace(/%20/g, "+")).join("&") + "&text=" + encodeURIComponent(text) + "&display=swap";
    document.head.appendChild(link);
  }
  if ("IntersectionObserver" in window) { const io = new IntersectionObserver(es => { if (es.some(x => x.isIntersecting)) { loadFonts(); io.disconnect(); } }, { rootMargin: "800px 0px" }); io.observe(root); }
  else loadFonts();

  paint();
})();
