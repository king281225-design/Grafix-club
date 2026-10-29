/* =========================================================
   GRAFIX CLUB – search results page
   Needs: config.js, catalogue.js, common.js.
   Everything runs in the browser against the 16-item catalogue in
   catalogue.js. The URL carries the whole state (?q, filters, sort,
   page) so results can be bookmarked, shared and used with Back.
   ========================================================= */
(function () {
  "use strict";
  const C = GCCatalogue, { $, announce, waUrl, attachSuggest } = GC;
  const PAGE_SIZE = 9;
  const FACET_TITLES = { cat: "Category", price: "Price", lit: "Lighting", mat: "Material", basis: "Price type" };
  const FACET_ORDER = ["cat", "price", "lit", "mat", "basis"];
  const results = $("#results"), pager = $("#pager"), heading = $("#resultsHeading"), countEl = $("#resultCount");
  const input = $("#pageSearch"), sortSel = $("#sortSel"), filterForm = $("#filterForm"), activeBox = $("#activeFilters");
  const filtersEl = $("#filters"), filtersSummary = $("#filtersSummary"), skeleton = $("#skeleton");
  let state = C.parseState(location.search);

  /* ---------------- small DOM helpers (all text goes through textContent) ---------------- */
  function h(tag, attrs, kids) {
    const n = document.createElement(tag);
    Object.keys(attrs || {}).forEach(k => {
      if (k === "text") n.textContent = attrs[k];
      else if (k === "class") n.className = attrs[k];
      else n.setAttribute(k, attrs[k]);
    });
    (kids || []).forEach(c => n.appendChild(typeof c === "string" ? document.createTextNode(c) : c));
    return n;
  }
  const labelOf = (facet, id) => { const o = C.FACETS[facet].find(x => x.id === id); return o ? o.label : id; };
  const href = st => "search.html" + C.buildQuery(st);

  /* ---------------- filters (built once, counts updated in place so focus is never lost) ---------------- */
  const countEls = {};
  FACET_ORDER.forEach(k => {
    const fs = h("fieldset", {}, [h("legend", { text: FACET_TITLES[k] })]);
    C.FACETS[k].forEach(opt => {
      const id = "f-" + k + "-" + opt.id;
      const cb = h("input", { type: "checkbox", id, name: k, value: opt.id });
      const n = h("span", { class: "n", "aria-hidden": "true" });
      const sr = h("span", { class: "sr-only" });
      countEls[k + ":" + opt.id] = { row: null, n, sr };
      const row = h("label", { class: "opt-row", for: id }, [cb, h("span", { text: opt.label }), sr, n]);
      countEls[k + ":" + opt.id].row = row;
      fs.appendChild(row);
    });
    filterForm.appendChild(fs);
  });
  filterForm.addEventListener("submit", e => e.preventDefault());
  filterForm.addEventListener("change", e => {
    const cb = e.target; if (!cb.name || cb.type !== "checkbox") return;
    const set = new Set(state[cb.name]);
    if (cb.checked) set.add(cb.value); else set.delete(cb.value);
    state = Object.assign({}, state, { [cb.name]: C.FACETS[cb.name].map(o => o.id).filter(id => set.has(id)), page: 1 });
    update("push");
  });
  sortSel.appendChild(document.createDocumentFragment());
  C.SORTS.forEach(s => sortSel.appendChild(h("option", { value: s.id, text: s.label })));
  sortSel.addEventListener("change", () => { state = Object.assign({}, state, { sort: sortSel.value, page: 1 }); update("push"); });

  // Filters stay open on wide screens; on phones they start collapsed.
  const wide = matchMedia("(min-width: 61.3125em)");
  const placeFilters = () => { filtersEl.open = wide.matches || filtersEl.dataset.userOpen === "1"; };
  filtersEl.addEventListener("toggle", () => { if (wide.matches && !filtersEl.open) filtersEl.open = true; else if (!wide.matches) filtersEl.dataset.userOpen = filtersEl.open ? "1" : "0"; });
  (wide.addEventListener ? wide.addEventListener.bind(wide, "change") : wide.addListener.bind(wide))(placeFilters);
  placeFilters();

  /* ---------------- search box ---------------- */
  const suggest = attachSuggest(input, $("#pageSuggest"), {
    navigate(u) {
      const st = C.parseState((u.split("?")[1] || ""));
      state = Object.assign(C.emptyState(), { q: st.q, cat: st.cat });
      update("push", true);
    }
  });
  $("#pageSearchForm").addEventListener("submit", e => {
    e.preventDefault(); suggest.close();
    state = Object.assign({}, state, { q: C.cleanQuery(input.value), page: 1 });
    update("push", true);
  });

  /* ---------------- rendering ---------------- */
  function priceNode(p) {
    const unit = p.unit === "from" ? "" : " / " + p.unit.replace(/^per /, "");
    return h("p", { class: "price" }, ["From ", h("b", { text: C.formatPrice(p.price) }), unit]);
  }
  function card(p) {
    const cat = C.catByName.get(p.cat);
    const tid = "t-" + p.id;
    const img = h("img", { src: (p.image.indexOf("i-") === 0 ? "assets/ideas/" : /^d\d/.test(p.image) ? "assets/designs/" : "assets/shop/") + p.image + ".jpg", alt: C.IMAGE_ALT[p.image] || p.name, width: "360", height: "360", loading: "lazy", decoding: "async" });
    const imgBox = h("div", { class: p.image.indexOf("i-") === 0 ? "pcard-img stock" : "pcard-img" }, [img]);
    img.addEventListener("error", () => { imgBox.textContent = ""; imgBox.appendChild(h("div", { class: "state-box", text: "Photo unavailable" })); });
    const tags = h("ul", { class: "tags", "aria-label": "Features" });
    if (p.lit) tags.appendChild(h("li", { class: "tag", text: "Illuminated" }));
    p.materials.forEach(m => tags.appendChild(h("li", { class: "tag", text: m })));
    const actions = h("div", { class: "pcard-actions" }, [
      h("a", { class: "btn btn-wa", href: waUrl("Hi Grafix Club, I'd like a quote for: " + p.name + "."), target: "_blank", rel: "noopener" }, ["Ask on WhatsApp", h("span", { class: "sr-only", text: " about " + p.name + " (opens in a new tab)" })])
    ]);
    if (p.studio) actions.appendChild(h("a", { class: "btn btn-ghost", href: "custom-neon-sign.html?preset=" + encodeURIComponent(p.studio) }, ["Design it in Neon Studio", h("span", { class: "sr-only", text: " for " + p.name })]));
    const body = h("div", { class: "pcard-body" }, [
      h("span", { class: "cat", text: p.cat }), h("h3", { id: tid, text: p.name }), h("p", { class: "desc", text: p.desc }), priceNode(p), tags, actions
    ]);
    const art = h("article", { class: "pcard", "aria-labelledby": tid, style: "--c:" + (cat ? cat.color : "#fff") }, [imgBox, body]);
    return h("li", {}, [art]);
  }

  function stateBox(title, text, buttons) {
    const box = h("div", { class: "state-box" }, [h("h3", { text: title }), h("p", { text })]);
    if (buttons && buttons.length) box.appendChild(h("div", { class: "cta-row" }, buttons));
    return box;
  }
  const btn = (text, attrs) => h(attrs.href ? "a" : "button", Object.assign({ class: "btn btn-ghost", text }, attrs.href ? {} : { type: "button" }, attrs));

  function renderChips() {
    activeBox.textContent = "";
    const chips = [];
    if (state.q) chips.push({ label: "Search: " + state.q, remove: () => { state = Object.assign({}, state, { q: "", page: 1 }); } });
    FACET_ORDER.forEach(k => state[k].forEach(id => chips.push({ label: FACET_TITLES[k] + ": " + labelOf(k, id), remove: () => { state = Object.assign({}, state, { [k]: state[k].filter(v => v !== id), page: 1 }); } })));
    activeBox.hidden = chips.length === 0;
    if (!chips.length) return 0;
    chips.forEach(c => {
      const b = h("button", { type: "button", "aria-label": "Remove filter " + c.label }, []);
      b.innerHTML = '<svg class="ic" aria-hidden="true"><use href="#i-x"/></svg>';
      b.addEventListener("click", () => { c.remove(); update("push", true, true); });
      activeBox.appendChild(h("span", { class: "fchip" }, [h("span", { text: c.label }), b]));
    });
    const clear = h("button", { type: "button", class: "link-btn", text: "Clear all" });
    clear.addEventListener("click", () => { state = C.emptyState(); update("push", true, true); });
    activeBox.appendChild(clear);
    return chips.length;
  }

  function renderPager(pg) {
    pager.textContent = "";
    pager.hidden = pg.pages <= 1;
    if (pg.pages <= 1) return;
    const ul = h("ul");
    const link = (n, label, aria) => {
      const a = h("a", { href: href(Object.assign({}, state, { page: n })), text: label });
      if (aria) a.setAttribute("aria-label", aria);
      a.addEventListener("click", e => { if (e.metaKey || e.ctrlKey || e.shiftKey || e.button) return; e.preventDefault(); state = Object.assign({}, state, { page: n }); update("push", false, false, true); });
      return h("li", {}, [a]);
    };
    if (pg.page > 1) ul.appendChild(link(pg.page - 1, "‹ Previous", "Previous page")); else ul.appendChild(h("li", {}, [h("span", { class: "cur off", text: "‹ Previous" })]));
    for (let i = 1; i <= pg.pages; i++) {
      if (i === pg.page) ul.appendChild(h("li", {}, [h("span", { class: "cur", "aria-current": "page", text: String(i) }), ]));
      else ul.appendChild(link(i, String(i), "Page " + i));
    }
    if (pg.page < pg.pages) ul.appendChild(link(pg.page + 1, "Next ›", "Next page")); else ul.appendChild(h("li", {}, [h("span", { class: "cur off", text: "Next ›" })]));
    pager.appendChild(ul);
  }

  function render(opts) {
    const res = C.search(state.q);
    const filtered = C.applyFilters(res.results, state);
    const sorted = C.sortResults(filtered, state.sort);
    const pg = C.paginate(sorted, state.page, PAGE_SIZE);
    state.page = pg.page;

    // sync controls with the state
    if (document.activeElement !== input) input.value = state.q;
    sortSel.value = state.sort;
    const counts = C.facetCounts(res.results, state);
    FACET_ORDER.forEach(k => C.FACETS[k].forEach(opt => {
      const e = countEls[k + ":" + opt.id], n = counts[k][opt.id];
      const cb = e.row.querySelector("input");
      cb.checked = state[k].includes(opt.id);
      e.n.textContent = n; e.sr.textContent = ", " + n + (n === 1 ? " result" : " results");
      e.row.classList.toggle("zero", n === 0 && !cb.checked);
    }));
    const chipCount = renderChips();
    const nFilters = FACET_ORDER.reduce((s, k) => s + state[k].length, 0);
    filtersSummary.textContent = "Filters" + (nFilters ? " (" + nFilters + " selected)" : "");

    // results
    results.textContent = ""; skeleton.hidden = true;
    let msg;
    if (res.mode === "none") {
      const cats = C.CATEGORIES.map(c => h("a", { class: "btn btn-ghost", href: C.searchHref({ cat: [c.slug] }), text: c.name }));
      results.appendChild(stateBox("No products match “" + state.q + "”", "Check the spelling, or try a broader word such as neon, plate, lamination or sticker. You can also browse a category, or ask us: we make custom work that is not always on the price list.",
        cats.concat([h("a", { class: "btn btn-wa", href: waUrl("Hi Grafix Club, I could not find: " + state.q + ". Can you make it?"), target: "_blank", rel: "noopener", text: "Ask us on WhatsApp" }), btn("Clear search", { id: "clearQ" })])));
      msg = "No results for “" + state.q + "”.";
    } else if (sorted.length === 0) {
      results.appendChild(stateBox("No results with these filters", res.results.length + (res.results.length === 1 ? " product matches" : " products match") + (state.q ? " “" + state.q + "”" : "") + " before filtering. Remove a filter to see them.", [btn("Clear all filters", { id: "clearF" })]));
      msg = "No results with the selected filters.";
    } else {
      const grid = h("ul", { class: "grid", "aria-label": "Search results" });
      pg.items.forEach(r => grid.appendChild(card(r.product)));
      results.appendChild(grid);
      const from = (pg.page - 1) * PAGE_SIZE + 1, to = from + pg.items.length - 1;
      msg = (pg.pages > 1 ? "Showing " + from + "–" + to + " of " : "") + sorted.length + (sorted.length === 1 ? " result" : " results") + (state.q ? " for “" + state.q + "”" : "") + (pg.pages > 1 ? ". Page " + pg.page + " of " + pg.pages + "." : ".");
      if (res.mode === "fuzzy" && res.corrected) msg += " Showing matches for “" + res.corrected + "”.";
      if (res.mode === "partial") msg += " No product matches every word, so these match some of them.";
    }
    countEl.textContent = msg;
    $("#unitNote").hidden = !(state.sort.startsWith("price") || state.price.length);
    renderPager(pg);
    heading.textContent = state.q ? "Results for “" + state.q + "”" : (chipCount ? "Filtered results" : "All products and services");
    document.title = (state.q ? state.q + " – " : "") + "Search products and prices | Grafix Club";
    const cq = $("#clearQ"); if (cq) cq.addEventListener("click", () => { state = Object.assign({}, state, { q: "", page: 1 }); update("push", true, true); });
    const cf = $("#clearF"); if (cf) cf.addEventListener("click", () => { state = Object.assign(C.emptyState(), { q: state.q }); update("push", true, true); });
  }

  /* ---------------- update: render + keep the URL in step ---------------- */
  function update(mode, fromSearch, moveFocus, scrollTop) {
    try { render(); }
    catch (err) {
      results.textContent = ""; skeleton.hidden = true; countEl.textContent = "Something went wrong.";
      results.appendChild(stateBox("We could not show the results", "Please reload the page. You can still reach us directly.", [h("a", { class: "btn btn-gold", href: "./#prices", text: "See the price list" }), h("a", { class: "btn btn-wa", href: waUrl(), target: "_blank", rel: "noopener", text: "WhatsApp us" })]));
      return;
    }
    const url = location.pathname + C.buildQuery(state);
    if (mode === "push" && url !== location.pathname + location.search) history.pushState(null, "", url);
    else if (mode === "replace") history.replaceState(null, "", url);
    announce(countEl.textContent);
    if (moveFocus) { const first = activeBox.querySelector("button"); (first && !activeBox.hidden ? first : heading).focus(); }
    if (scrollTop) { heading.focus(); heading.scrollIntoView({ behavior: "auto", block: "start" }); }
  }

  addEventListener("popstate", () => { state = C.parseState(location.search); update("none"); });
  update("replace");   // normalises hostile or unknown parameters in the address bar
})();
