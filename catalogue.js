/* =========================================================
   GRAFIX CLUB – product catalogue + search engine
   ---------------------------------------------------------
   Single source of truth for the Price list tabs, the search
   suggestions and the search results page (search.html).

   Every product below comes from the shop's own price list /
   service cards. Nothing here is invented: if the site did not
   state a material, lighting type or finish for an item, that
   field is left empty and the item simply does not appear under
   that filter. There is no stock, popularity or "newest" data,
   so none is shown or sortable.

   To add a product: append an object to PRODUCTS.
   Fields: id, cat, name, desc, price (₹, starting price), unit
   (text shown after the price), basis (sqft | inch | piece |
   from), lit (true if illuminated), materials[], tags[], image
   (file name in assets/shop without .jpg), studio (optional
   Neon Studio preset key).
   ========================================================= */
(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  else root.GCCatalogue = api;
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";

  const CATEGORIES = [
    { name: "Name Plates", slug: "name-plates", coll: "plates", color: "#9b5cff", blurb: "Home, office and clinic plates." },
    { name: "LED Boards", slug: "led-boards", coll: "led", color: "#ffc933", blurb: "Shop boards and 3D letters." },
    { name: "Neon Signs", slug: "neon-signs", coll: "neon", color: "#ff2e93", blurb: "Custom LED neon names, quotes and logos." },
    { name: "Steel Letters & Stickers", slug: "steel-letters-stickers", coll: "letters", color: "#ff8a1f", blurb: "Steel and acrylic letters, vinyl stickers and decals." }
  ];

  const PRODUCTS = [
    // ---- Neon Signs
    { id: "neon-name-sign", cat: "Neon Signs", name: "Custom neon name sign", desc: "Up to 2 ft wide, 12V LED neon", price: 2499, unit: "from", basis: "from", lit: true, materials: ["LED neon"], tags: ["name", "birthday", "wedding", "custom", "cafe"], image: "d1-ram-harleen", studio: "name" },
    { id: "neon-logo-quote", cat: "Neon Signs", name: "Custom neon logo / quote", desc: "Priced by area, any colour", price: 800, unit: "per sq ft", basis: "sqft", lit: true, materials: ["LED neon"], tags: ["logo", "quote", "business", "custom"], image: "d31-happy-place-orange", studio: "name" },
    { id: "neon-acrylic-backboard", cat: "Neon Signs", name: "Neon + acrylic backboard", desc: "Cut-to-shape or rectangle", price: 1000, unit: "per sq ft", basis: "sqft", lit: true, materials: ["LED neon", "Acrylic"], tags: ["backboard", "backing"], image: "d28-coffee", studio: "backboard" },
    // ---- LED Boards
    { id: "led-shop-board", cat: "LED Boards", name: "LED shop sign board", desc: "Backlit, outdoor-ready", price: 600, unit: "per sq ft", basis: "sqft", lit: true, materials: [], tags: ["shop", "outdoor", "signage", "backlit", "signboard"], image: "d12-restaurant-board" },
    { id: "acrylic-led-letters", cat: "LED Boards", name: "3D acrylic LED letters", desc: "Front-lit or halo-lit", price: 750, unit: "per sq ft", basis: "sqft", lit: true, materials: ["Acrylic"], tags: ["3d", "front-lit", "halo-lit", "letters", "shop"], image: "d10-halo-letters" },
    // ---- Name Plates
    { id: "acrylic-name-plate", cat: "Name Plates", name: "Acrylic name plate", desc: "Home, office, clinic", price: 699, unit: "from", basis: "from", lit: false, materials: ["Acrylic"], tags: ["home", "office", "clinic"], image: "d5-priyanka-abhishek" },
    { id: "steel-name-plate", cat: "Name Plates", name: "Steel letter name plate", desc: "Gold / silver / black", price: 1499, unit: "from", basis: "from", lit: false, materials: ["Steel"], tags: ["gold", "silver", "black", "letters"], image: "d7-solanki" },
    { id: "led-name-plate", cat: "Name Plates", name: "LED backlit name plate", desc: "Warm or cool white", price: 1999, unit: "from", basis: "from", lit: true, materials: [], tags: ["backlit", "warm white", "cool white", "led"], image: "d3-rohit-ananya" },
    // ---- Steel Letters & Stickers
    { id: "steel-acrylic-letters", cat: "Steel Letters & Stickers", name: "Steel / acrylic letters", desc: "Brushed steel, gold, black", price: 150, unit: "per inch", basis: "inch", lit: false, materials: ["Steel", "Acrylic"], tags: ["letters", "gold", "black", "brushed"], image: "d2-sharma" },
    { id: "car-decal", cat: "Steel Letters & Stickers", name: "Car decal / graphics", desc: "Vinyl cut, any design", price: 399, unit: "from", basis: "from", lit: false, materials: ["Vinyl"], tags: ["car", "graphics", "vinyl cut"], image: "i-car-decal" },
    { id: "computerised-sticker", cat: "Steel Letters & Stickers", name: "Computerised sticker", desc: "Name, logo, small decals", price: 49, unit: "per piece", basis: "piece", lit: false, materials: ["Vinyl"], tags: ["decal", "logo", "name", "vinyl"], image: "i-vinyl-apply" }
  ];

  /** Alt text for card photos. "d*" are design pictures (assets/designs); "p*" are the shop's own photos (assets/shop); "i-*" are free-licence stock photos (assets/ideas),
      shown with an "Illustrative photo" badge – they show the product type, not Grafix Club's own work. */
  const IMAGE_ALT = {
    "d39-glossy-nail": "Shop sign idea: round backlit board with a gold crown, a black hand with pink nails, pink neon hearts and a bow, and the name Glossy Nail",
    "d40-beauty-halo": "Wall sign idea: round white acrylic sign with a gold mirror ring and black 3D lettering on a wood-slat wall",
    "d1-ram-harleen": "Neon sign idea: two names in warm yellow script inside a pink neon heart",
    "d31-happy-place-orange": "Neon quote sign in orange script beside a palm plant",
    "d28-coffee": "Warm yellow Coffee neon sign with a cup on a clear backing",
    "d12-restaurant-board": "Shop sign idea: black fascia board with glowing warm script lettering",
    "d10-halo-letters": "Halo-lit cream 3D script letters on a dark slat facade",
    "d2-sharma": "Name sign idea: black cut-out lettering on a textured wall",
    "d5-priyanka-abhishek": "Name plate idea: black acrylic plate with gold leaf motif and gold script names",
    "d7-solanki": "Name plate idea: walnut plate with a brass frame and raised brass lettering",
    "d3-rohit-ananya": "Name plate idea: frosted plate with a warm backlight and script names",
    "i-car-decal": "Car with vinyl decals and graphics (illustrative photo)",
    "i-vinyl-apply": "Installer applying a white vinyl wrap to a car (illustrative photo)",
  };

  /* ---------------- facets ---------------- */
  const LIT = [{ id: "yes", label: "Illuminated" }, { id: "no", label: "Not illuminated" }];
  const BASES = [
    { id: "sqft", label: "Per sq ft" },
    { id: "inch", label: "Per inch" },
    { id: "piece", label: "Per piece" },
    { id: "from", label: "Fixed starting price" }
  ];
  const PRICE_BANDS = [
    { id: "lt500", label: "Under ₹500", min: 0, max: 499 },
    { id: "500-999", label: "₹500 – ₹999", min: 500, max: 999 },
    { id: "1000-1999", label: "₹1,000 – ₹1,999", min: 1000, max: 1999 },
    { id: "2000+", label: "₹2,000 and above", min: 2000, max: Infinity }
  ];
  const SORTS = [
    { id: "relevance", label: "Relevance" },
    { id: "price-asc", label: "Price: low to high" },
    { id: "price-desc", label: "Price: high to low" },
    { id: "name", label: "Name: A to Z" }
  ];
  const slugify = s => String(s).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const MATERIALS = (() => {
    const counts = new Map();
    PRODUCTS.forEach(p => p.materials.forEach(m => counts.set(m, (counts.get(m) || 0) + 1)));
    return [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).map(([label]) => ({ id: slugify(label), label }));
  })();
  const FACETS = { cat: CATEGORIES.map(c => ({ id: c.slug, label: c.name })), lit: LIT, mat: MATERIALS, price: PRICE_BANDS, basis: BASES };
  const byId = new Map(PRODUCTS.map(p => [p.id, p]));
  const catBySlug = new Map(CATEGORIES.map(c => [c.slug, c]));
  const catByName = new Map(CATEGORIES.map(c => [c.name, c]));

  const formatPrice = n => "₹" + Number(n).toLocaleString("en-IN");

  /* ---------------- text matching ---------------- */
  const fold = s => String(s == null ? "" : s).normalize("NFKD").replace(/[\u0300-\u036F]/g, "").toLowerCase();
  const stem = w => (w.length > 3 && w.endsWith("s") && !w.endsWith("ss") ? w.slice(0, -1) : w);
  const words = s => fold(s).replace(/[^\p{L}\p{N}]+/gu, " ").trim().split(" ").filter(Boolean).map(stem);

  // Query-side synonyms, using the vocabulary the shop itself uses.
  const SYNONYMS = {
    signboard: ["board", "sign"], hoarding: ["board"], glow: ["neon", "led"], light: ["led", "neon", "illuminated"],
    lit: ["illuminated"], sticker: ["decal"], decal: ["sticker"], nameboard: ["name", "plate"], banner: ["board"]
  };

  const WEIGHTS = { name: 6, cat: 3, tags: 3, mat: 2, desc: 1.5 };
  const index = PRODUCTS.map(p => {
    const f = {
      name: words(p.name),
      cat: words(p.cat),
      tags: words(p.tags.join(" ")),
      mat: words(p.materials.join(" ")),
      desc: words(p.desc + (p.lit ? " illuminated" : ""))
    };
    const compact = Object.values(f).flat().join("") + words(p.name).join("");
    return { p, f, compact, nameStr: words(p.name).join(" ") };
  });
  const VOCAB = [...new Set(index.flatMap(e => Object.values(e.f).flat()))];

  function slotAlternatives(tok) {
    const alts = [tok];
    (SYNONYMS[tok] || []).forEach(s => alts.push(stem(s)));
    return alts;
  }
  // best score of one slot (a token with its synonyms) against one product, 0 = no match
  function slotScore(entry, alts) {
    let best = 0;
    for (const alt of alts) {
      for (const field of Object.keys(WEIGHTS)) {
        for (const w of entry.f[field]) {
          if (w === alt) best = Math.max(best, WEIGHTS[field]);
          else if (alt.length >= 2 && w.startsWith(alt)) best = Math.max(best, WEIGHTS[field] * 0.7);
        }
      }
      if (!best && alt.length >= 5 && entry.compact.includes(alt)) best = 1; // "nameplate" -> "name plate"
    }
    return best;
  }

  function lev(a, b, max) {
    if (Math.abs(a.length - b.length) > max) return max + 1;
    const prev = Array.from({ length: b.length + 1 }, (_, i) => i);
    for (let i = 1; i <= a.length; i++) {
      let cur = [i], rowMin = i;
      for (let j = 1; j <= b.length; j++) {
        cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
        if (cur[j] < rowMin) rowMin = cur[j];
      }
      if (rowMin > max) return max + 1;
      for (let j = 0; j <= b.length; j++) prev[j] = cur[j];
    }
    return prev[b.length];
  }
  function correct(tok) {
    if (tok.length < 4 || VOCAB.includes(tok)) return null;
    const max = tok.length >= 7 ? 2 : 1;
    let best = null, bd = max + 1;
    for (const v of VOCAB) { const d = lev(tok, v, max); if (d < bd) { bd = d; best = v; } }
    return best;
  }

  function runSlots(slots) {
    const scored = [];
    index.forEach((entry, order) => {
      let total = 0, matched = 0;
      for (const alts of slots) {
        const s = slotScore(entry, alts);
        if (s > 0) { matched++; total += s; }
      }
      scored.push({ product: entry.p, score: total, matched, order });
    });
    return scored;
  }

  /**
   * search(query) -> { results:[{product,score}], mode, tokens, corrected }
   * mode: "all" (no query) | "exact" (every word matched) | "partial" (some words) | "fuzzy" (typo corrected) | "none"
   */
  function search(query) {
    const q = String(query == null ? "" : query).trim();
    const tokens = words(q);
    if (!tokens.length) return { results: PRODUCTS.map((product, order) => ({ product, score: 0, order })), mode: "all", tokens: [], corrected: null };
    const slots = tokens.map(slotAlternatives);
    const phrase = tokens.join(" ");
    const rank = list => list.sort((a, b) => b.score - a.score || a.order - b.order);
    let scored = runSlots(slots);
    let hits = scored.filter(r => r.matched === slots.length);
    hits.forEach(r => { if (index[r.order].nameStr.includes(phrase)) r.score += 4; });
    if (hits.length) return { results: rank(hits), mode: "exact", tokens, corrected: null };

    // typo tolerance
    const fixed = tokens.map(t => correct(t) || t);
    if (fixed.some((t, i) => t !== tokens[i])) {
      const fscored = runSlots(fixed.map(slotAlternatives));
      const fhits = fscored.filter(r => r.matched === fixed.length);
      if (fhits.length) return { results: rank(fhits), mode: "fuzzy", tokens, corrected: fixed.join(" ") };
    }
    // partial: at least one word matched, most matches first
    const partial = scored.filter(r => r.matched > 0);
    if (partial.length && slots.length > 1) {
      partial.sort((a, b) => b.matched - a.matched || b.score - a.score || a.order - b.order);
      return { results: partial, mode: "partial", tokens, corrected: null };
    }
    return { results: [], mode: "none", tokens, corrected: null };
  }

  /* ---------------- filters / sort / paging ---------------- */
  const inBand = (p, id) => { const b = PRICE_BANDS.find(x => x.id === id); return !!b && p.price >= b.min && p.price <= b.max; };
  const facetTests = {
    cat: (p, v) => (catBySlug.get(v) || {}).name === p.cat,
    mat: (p, v) => p.materials.some(m => slugify(m) === v),
    lit: (p, v) => (v === "yes") === p.lit,
    price: inBand,
    basis: (p, v) => p.basis === v
  };
  /** OR within a facet, AND across facets. `skip` ignores one facet (used for facet counts). */
  function applyFilters(list, f, skip) {
    return list.filter(r => {
      const p = r.product || r;
      return Object.keys(facetTests).every(k => {
        if (k === skip) return true;
        const sel = (f && f[k]) || [];
        return !sel.length || sel.some(v => facetTests[k](p, v));
      });
    });
  }
  function facetCounts(list, f) {
    const counts = {};
    Object.keys(FACETS).forEach(k => {
      const base = applyFilters(list, f, k);
      counts[k] = {};
      FACETS[k].forEach(opt => { counts[k][opt.id] = base.filter(r => facetTests[k](r.product || r, opt.id)).length; });
    });
    return counts;
  }
  function sortResults(list, sort) {
    const arr = list.slice();
    const prod = r => r.product || r;
    if (sort === "price-asc") arr.sort((a, b) => prod(a).price - prod(b).price || (a.order || 0) - (b.order || 0));
    else if (sort === "price-desc") arr.sort((a, b) => prod(b).price - prod(a).price || (a.order || 0) - (b.order || 0));
    else if (sort === "name") arr.sort((a, b) => prod(a).name.localeCompare(prod(b).name));
    return arr; // "relevance" keeps search order
  }
  function paginate(list, page, size) {
    const pages = Math.max(1, Math.ceil(list.length / size));
    const cur = Math.min(Math.max(1, page | 0 || 1), pages);
    return { page: cur, pages, total: list.length, items: list.slice((cur - 1) * size, cur * size) };
  }

  /* ---------------- URL state ---------------- */
  const emptyState = () => ({ q: "", cat: [], mat: [], lit: [], price: [], basis: [], sort: "relevance", page: 1 });
  const cleanQuery = s => Array.from(String(s || "").replace(/[\u0000-\u001F\u007F-\u009F\u200B-\u200F\u2028\u2029\uFEFF]/g, " ").replace(/\s+/g, " ").trim()).slice(0, 80).join("");
  /** Parse a query string into a validated state. Unknown values are dropped. */
  function parseState(search) {
    const sp = new URLSearchParams(search || "");
    const st = emptyState();
    st.q = cleanQuery(sp.get("q"));
    Object.keys(FACETS).forEach(k => {
      const ok = new Set(FACETS[k].map(o => o.id));
      st[k] = [...new Set(sp.getAll(k).map(v => String(v).toLowerCase()).filter(v => ok.has(v)))];
    });
    const sort = sp.get("sort"); st.sort = SORTS.some(s => s.id === sort) ? sort : "relevance";
    const pg = parseInt(sp.get("page"), 10); st.page = Number.isFinite(pg) && pg > 0 && pg < 1000 ? pg : 1;
    return st;
  }
  function buildQuery(st) {
    const sp = new URLSearchParams();
    if (st.q) sp.set("q", st.q);
    Object.keys(FACETS).forEach(k => (st[k] || []).forEach(v => sp.append(k, v)));
    if (st.sort && st.sort !== "relevance") sp.set("sort", st.sort);
    if (st.page > 1) sp.set("page", String(st.page));
    const s = sp.toString();
    return s ? "?" + s : "";
  }
  const searchHref = st => "search.html" + buildQuery(Object.assign(emptyState(), st));

  /* ---------------- autocomplete ---------------- */
  /** Up to `limit` suggestions: products, matching categories, and a final "see all results" entry. */
  function suggest(query, limit) {
    limit = limit || 6;
    const q = cleanQuery(query);
    if (!q) return CATEGORIES.slice(0, limit).map(c => ({ type: "category", label: c.name, sub: c.blurb, href: searchHref({ cat: [c.slug] }), cat: c.slug }));
    const res = search(q);
    const out = [];
    const qFold = words(q).join(" ");
    CATEGORIES.forEach(c => {
      if (words(c.name).join(" ").startsWith(qFold) || c.slug.startsWith(fold(q).replace(/\s+/g, "-"))) out.push({ type: "category", label: c.name, sub: "Category", href: searchHref({ cat: [c.slug] }), cat: c.slug });
    });
    res.results.slice(0, Math.max(0, limit - 1 - out.length)).forEach(r => out.push({
      type: "product", label: r.product.name, sub: r.product.cat + " · from " + formatPrice(r.product.price) + (r.product.unit === "from" ? "" : " " + r.product.unit),
      href: searchHref({ q: r.product.name }), id: r.product.id
    }));
    if (res.mode === "fuzzy" && res.corrected) out.unshift({ type: "didyoumean", label: "Did you mean “" + res.corrected + "”?", sub: "Showing matches for the corrected spelling", href: searchHref({ q: res.corrected }), q: res.corrected });
    out.push({ type: "all", label: "See all results for “" + q + "”", sub: "", href: searchHref({ q }), q });
    return out.slice(0, limit + 1);
  }

  return {
    CATEGORIES, PRODUCTS, FACETS, SORTS, PRICE_BANDS, MATERIALS, IMAGE_ALT,
    byId, catByName, catBySlug, formatPrice, slugify, fold, words,
    search, suggest, applyFilters, facetCounts, sortResults, paginate,
    emptyState, parseState, buildQuery, searchHref, cleanQuery
  };
});
