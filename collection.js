/* =========================================================
   GRAFIX CLUB – Design collection
   Pictures of the styles we make, in this order: name plates, neon, LED boards, acrylic.
   Each picture is a design idea: the final size, finish and price are confirmed on a mock-up.
   Needs: config.js, common.js, neon-model.js (money formatting), catalogue.js (price list).
   The shortlist is stored only in this browser (localStorage) until the visitor taps WhatsApp.
   ========================================================= */
(function () {
  "use strict";
  const root = document.getElementById("collectionApp");
  if (!root || typeof GCNeon === "undefined") return;
  const N = GCNeon, { waUrl, safeStore, announce } = GC;
  const LS_FAV = "gc.collection.fav";
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  /* the price comes from the price list (catalogue.js) so it can never drift from it */
  const priceText = id => {
    const p = typeof GCCatalogue !== "undefined" && GCCatalogue.byId.get(id);
    if (!p) return "";
    return p.basis === "from" ? "From " + N.money(p.price) : N.money(p.price) + " " + p.unit;
  };
  const CATS = [
    { key: "plates", label: "Name plates" },
    { key: "neon", label: "Neon designs" },
    { key: "led", label: "LED boards" },
    { key: "acrylic", label: "Acrylic" },
    { key: "lamination", label: "Bike & scooty lamination" }
  ];
  /* every picture fills its card (cropped to 4:3); POS keeps the lettering in view on tall pictures */
  const POS = { "d2-sharma": "50% 12%", "d4-vinay-priyanka": "50% 48%", "d8-seemas-nivas": "50% 52%", "d9-nanak": "50% 28%", "d13-backlit-directory": "50% 12%", "d14-sawants": "50% 42%", "d16-sri-nivas": "50% 30%", "d17-sanu": "50% 45%", "d25-happy-birthday": "50% 48%", "d31-happy-place-orange": "50% 33%", "d24-open-welcome": "50% 42%", "d20-coffee-time": "50% 45%", "d22-gold-3d-letters": "50% 55%", "d19-dhruv": "50% 38%", "d11-cafe-board": "50% 22%" };
  const I = (id, cat, title, file, w, h, alt, product, sub) => ({ id, cat, title, file, w, h, alt, product, sub, priceText: priceText(product) });
  const ORDER = CATS.map(c => c.key);
  const items = [
    I("pl-brass-wood", "plates", "Walnut plate with brass frame", "d7-solanki", 900, 600, "Name plate idea: walnut wood plate with a brass frame and raised brass Ganesha motif and lettering", "steel-name-plate", "Walnut and brass plate"),
    I("pl-wall-letters", "plates", "Black wall-mounted name letters", "d2-sharma", 560, 900, "Name sign idea: black cut-out lettering mounted on a textured outside wall next to a front door", "steel-acrylic-letters", "Cut-out wall letters"),
    I("pl-sawants", "plates", "Script name sign with house number", "d14-sawants", 736, 736, "Name sign idea: slim metal script lettering with a heart and a house number on a plain rod, softly backlit on a cream wall", "led-name-plate", "Backlit script name sign"),
    I("pl-evaara", "plates", "Leaf-arc plate with gold script", "d15-evaara", 900, 600, "Name plate idea: cream plate with a gold leaf arc, a house number and a script name with a warm backlight", "led-name-plate", "Backlit plate with gold leaf arc"),
    I("pl-sri-nivas", "plates", "Flute and feather backlit name sign", "d16-sri-nivas", 736, 736, "Name sign idea: black cut-out lettering on a flute shape with a peacock feather and a hanging number plate, glowing behind", "led-name-plate", "Backlit cut-out name sign with hanging number"),
    I("pl-white-gold", "plates", "White acrylic with gold mirror letters", "d17-sanu", 736, 736, "Name plate idea: white acrylic plate with raised gold mirror lettering and gold corner pieces", "acrylic-name-plate", "White acrylic with gold mirror lettering"),
    I("pl-krishna-led", "plates", "Backlit plate with Krishna silhouette", "d18-aadhyan", 735, 586, "Name plate idea: frosted plate with a black Krishna silhouette, a flute and a script name, with a warm backlight", "led-name-plate", "Backlit plate with silhouette"),
    I("pl-wood-brass", "plates", "Teak plate with brass figure", "d19-dhruv", 736, 736, "Name plate idea: teak wood plate with raised brass lettering, a house number, a flute and a brass figure", "steel-name-plate", "Teak and brass plate"),
    I("pl-coffee-time", "plates", "Black cut-out wall sign", "d20-coffee-time", 900, 900, "Wall sign idea: black laser-cut metal lettering with a coffee cup and bean on a light wood-panel wall", "steel-acrylic-letters", "Cut-out metal wall sign"),
    I("ne-heart", "neon", "Heart neon name sign", "d1-ram-harleen", 890, 755, "Neon sign idea: two names in warm yellow script inside a pink neon heart with small hearts, on a black wall", "neon-name-sign", "Neon name sign"),
    I("ne-open", "neon", "Open welcome neon sign", "d24-open-welcome", 679, 679, "Neon sign idea: hanging open sign with pink OPEN letters, light-blue welcome script and a yellow border in a shop window", "neon-name-sign", "Hanging shop sign in three colours"),
    I("ne-birthday", "neon", "Happy Birthday neon sign", "d25-happy-birthday", 720, 900, "Neon sign idea: Happy Birthday in blue script and pink block letters with three yellow neon stars on a wall", "neon-name-sign", "Party sign in blue, pink and yellow"),
    I("ne-diwali", "neon", "Happy Diwali neon with diya", "d26-happy-diwali", 736, 723, "Neon sign idea: Happy Diwali in pink script with a blue and yellow diya lamp, hanging on a brick wall", "neon-name-sign", "Festival sign with diya"),
    I("ne-shubh", "neon", "Shubh Deepawali neon in Hindi", "d27-shubh-deepawali", 736, 736, "Neon sign idea: Shubh Deepawali in Hindi, pink lettering with a yellow diya lamp, hanging on a chain", "neon-name-sign", "Hindi festival sign with diya"),
    I("ne-coffee", "neon", "Coffee neon sign with cup", "d28-coffee", 736, 736, "Neon sign idea: warm yellow Coffee script with a steaming cup on a clear backing, on a brick wall", "neon-name-sign", "Cafe sign in warm yellow"),
    I("ne-coffee-house", "neon", "Coffee House neon logo", "d29-coffee-house", 736, 736, "Neon sign idea: amber cup and house-roof line drawing with white Coffee House lettering on a dark wall", "neon-name-sign", "Cafe logo in amber and white"),
    I("ne-happy-place-green", "neon", "Happy place neon with leaves", "d30-happy-place-green", 736, 736, "Neon sign idea: white this is my happy place script with two green neon leaf sprigs on a dark wall", "neon-name-sign", "Quote sign with green leaves"),
    I("ne-happy-place", "neon", "Happy place neon quote", "d31-happy-place-orange", 863, 900, "Neon sign idea: orange neon quote THIS IS MY happy place in capitals and script beside a palm plant", "neon-name-sign", "Quote sign in orange"),
    I("led-krishna", "led", "Backlit plate with Krishna motif", "d3-rohit-ananya", 900, 600, "Name plate idea: frosted acrylic plate with a warm backlight, a flute-and-feather motif and two names", "led-name-plate", "Backlit LED name plate"),
    I("led-om-wood", "led", "Wood plate with Om and warm glow", "d6-flat-104", 900, 600, "Name plate idea: carved wood plate with an Om symbol, gold lettering and a warm backlight", "led-name-plate", "Carved wood plate with LED backlight"),
    I("led-om-stone", "led", "Backlit Om plate on stone", "d8-seemas-nivas", 661, 900, "Name plate idea: black plate with an Om symbol and a warm halo glow, mounted on a stone wall", "led-name-plate", "Backlit plate with halo glow"),
    I("led-halo-letters", "led", "Halo-lit 3D script letters", "d10-halo-letters", 735, 490, "Shop sign idea: glowing cream 3D script lettering with small capitals below, mounted on a dark vertical-slat facade", "acrylic-led-letters", "Halo-lit 3D letters on a slat facade"),
    I("led-cafe-board", "led", "Cafe fascia with glowing letters", "d11-cafe-board", 736, 736, "Shop sign idea: black cafe fascia with softly glowing letters, a coffee-cup symbol and a round hanging sign above a cafe entrance", "led-shop-board", "Backlit cafe fascia and round side sign"),
    I("led-restaurant-board", "led", "Restaurant board with glowing script", "d12-restaurant-board", 900, 720, "Shop sign idea: black restaurant fascia with glowing warm script lettering and a line drawing, with a round side sign and warm light strip", "led-shop-board", "Backlit restaurant fascia"),
    I("led-rathods", "led", "Round backlit plate with Krishna", "d21-rathods", 750, 562, "Name plate idea: round backlit plate with a Krishna figure, a flute, a script name, a house number and a flower border, glowing around the edge", "led-name-plate", "Round plate with edge glow"),
    I("led-gold-3d", "led", "Gold 3D letters with warm backlight", "d22-gold-3d-letters", 736, 736, "Shop sign idea: shiny gold 3D block letters with a leaf symbol and a warm halo glow on a white wall", "acrylic-led-letters", "Gold 3D letters, halo-lit"),
    I("led-directory", "led", "Backlit directory sign", "d13-backlit-directory", 506, 900, "Sign idea: tall dark rounded board with a warm halo glow, a circular logo and wood-look arrow panels for directions", "led-shop-board", "Backlit directory board"),
    I("ac-frosted", "acrylic", "Frosted acrylic lobby sign", "d23-frosted-acrylic", 900, 675, "Office sign idea: frosted acrylic panel on silver standoffs with black raised letters and a leaf logo", "acrylic-name-plate", "Frosted acrylic with raised letters"),
    I("ac-gold-leaf", "acrylic", "Black and gold leaf plate", "d5-priyanka-abhishek", 900, 600, "Name plate idea: black acrylic plate with gold mirror leaf motif and gold script names", "acrylic-name-plate", "Black acrylic with gold lettering"),
    I("ac-arch", "acrylic", "Arch plate with gold vine", "d4-vinay-priyanka", 842, 900, "Name plate idea: matte black arch-shaped plate with gold leaf vine, a house number and two names", "acrylic-name-plate", "Matte black arch plate"),
    I("ac-gold-3d", "acrylic", "Gold 3D letters on black", "d9-nanak", 675, 900, "Name plate idea: matte black plate with raised gold 3D script lettering", "acrylic-name-plate", "Raised gold lettering"),
    I("lm-bike-blue", "lamination", "Matte blue bike graphics", "d32-bike-blue", 800, 600, "Bike lamination idea: sports bike with matte blue and white sharp-edged graphics over black", "bike-lamination", "Matte blue bike graphics"),
    I("lm-bike-neon", "lamination", "Neon green bike graphics", "d33-bike-neon", 800, 600, "Bike lamination idea: sports bike with neon yellow-green slashes over a black body", "bike-lamination", "Neon edition bike graphics"),
    I("lm-bike-orange", "lamination", "Orange graphic bike wrap", "d34-bike-orange", 800, 600, "Bike lamination idea: sports bike with bold orange tiger-stripe graphics over black", "bike-lamination", "Orange graphic bike wrap"),
    I("lm-scooty-floral", "lamination", "Floral scooty wrap", "d35-scooty-floral", 800, 600, "Scooty lamination idea: black scooty with pink cherry blossom flowers on the front and side panels", "scooty-lamination", "Floral scooty wrap"),
    I("lm-scooty-sporty", "lamination", "Sporty white and teal scooty", "d36-scooty-sporty", 800, 600, "Scooty lamination idea: white scooty with sharp teal and blue sporty graphics", "scooty-lamination", "Sporty scooty graphics"),
    I("lm-scooty-matte", "lamination", "Matte black scooty with red", "d37-scooty-matte", 800, 600, "Scooty lamination idea: matte black scooty with dark red angular graphics", "scooty-lamination", "Matte finish scooty wrap"),
    I("lm-scooty-elegant", "lamination", "Elegant white and lilac scooty", "d38-scooty-elegant", 800, 600, "Scooty lamination idea: white scooty with soft lilac and purple graphics", "scooty-lamination", "Elegant scooty graphics")
  ].sort((a, b) => ORDER.indexOf(a.cat) - ORDER.indexOf(b.cat));
  const byId = new Map(items.map(i => [i.id, i]));
  const catLabel = key => (CATS.find(c => c.key === key) || {}).label || key;

  let filter = "all";
  let fav = [];
  try { const raw = JSON.parse(safeStore.get(LS_FAV) || "[]"); if (Array.isArray(raw)) fav = raw.filter(id => byId.has(id)).slice(0, 12); } catch (e) { fav = []; }
  const saveFav = () => safeStore.set(LS_FAV, JSON.stringify(fav));

  const msgOne = i => "Hi Grafix Club, I like the “" + i.title + "” design idea (" + catLabel(i.cat) + ") from your collection. Can you make something like it and quote it?";
  const msgMany = list => "Hi Grafix Club, I shortlisted these design ideas from your collection:\n" + list.map((i, n) => (n + 1) + ". " + i.title + " (" + catLabel(i.cat) + ")" + (i.priceText ? ", " + i.priceText.toLowerCase() : "")).join("\n") + "\nPlease help me choose and share a quote.";

  const cardHtml = i => {
    const on = fav.includes(i.id);
    return '<li class="coll-card" data-id="' + i.id + '" data-cat="' + i.cat + '">' +
      '<div class="cw cw-photo"' + (POS[i.file] ? ' style="--pos:' + POS[i.file] + '"' : "") + '><img src="assets/designs/' + i.file + '.jpg" alt="' + esc(i.alt) + '" width="' + i.w + '" height="' + i.h + '" loading="lazy" decoding="async"></div>' +
      '<div class="coll-body"><div class="coll-top"><div><h3>' + esc(i.title) + '</h3><p class="coll-cat">' + esc(catLabel(i.cat)) + "</p></div>" +
        '<button type="button" class="fav" data-fav="' + i.id + '" aria-pressed="' + on + '" aria-label="Shortlist ' + esc(i.title) + '"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="' + N.find(N.ICONS, "heart").d + '"/></svg></button></div>' +
        '<p class="coll-meta">' + esc(i.sub) + ". Final design is confirmed on a mock-up.</p>" +
        '<p class="coll-price">' + (i.priceText ? "<b>" + esc(i.priceText) + "</b> <small>price list, final price on size</small>" : "<small>Price on request</small>") + "</p>" +
        '<div class="coll-actions"><a class="btn btn-wa btn-sm" href="' + waUrl(msgOne(i)) + '" target="_blank" rel="noopener">Ask on WhatsApp<span class="sr-only"> about ' + esc(i.title) + " (opens in a new tab)</span></a></div></div></li>";
  };

  root.innerHTML =
    '<div class="coll-filters" role="group" aria-label="Filter designs by type" id="collFilters"></div>' +
    '<p class="coll-count" id="collCount" aria-live="polite"></p>' +
    '<ul class="coll-grid" id="collGrid"></ul>' +
    '<div class="coll-bar" id="collBar" hidden role="region" aria-label="Your shortlist"><p id="collBarText"></p><div class="coll-bar-actions"><a class="btn btn-wa btn-sm" id="collSend" target="_blank" rel="noopener">Send shortlist on WhatsApp<span class="sr-only"> (opens in a new tab)</span></a><button type="button" class="btn btn-ghost btn-sm" id="collClear">Clear</button></div></div>';
  const grid = document.getElementById("collGrid"), bar = document.getElementById("collBar");

  const cats = [{ key: "all", label: "All designs" }].concat(CATS);
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
    }
  });
  document.getElementById("collClear").addEventListener("click", () => { fav = []; saveFav(); paint(); announce("Shortlist cleared."); });

  paint();
})();
