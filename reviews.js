/* =========================================================
   GRAFIX CLUB – automatic Google reviews
   Reads the JSON data URL of a review-widget service (CONFIG.googleReviewsFeed, api.featurable.com only)
   and shows the customers' own reviews with their names and star ratings. New reviews appear when the service refreshes.
   Nothing is invented: if the feed is missing or fails, the reviews already on the page stay exactly as they are.
   Review text is only ever inserted with textContent.
   ========================================================= */
(function () {
  "use strict";
  const box = document.getElementById("gQuotes");
  if (!box || typeof CONFIG === "undefined") return;
  const FEED = String(CONFIG.googleReviewsFeed || "");
  if (!FEED) return;
  if (!/^https:\/\/api\.featurable\.com\/[A-Za-z0-9/_?=&.-]{4,200}$/.test(FEED)) { if (window.console) console.warn("CONFIG.googleReviewsFeed must start with https://api.featurable.com/"); return; }
  const WORDS = { ONE: 1, TWO: 2, THREE: 3, FOUR: 4, FIVE: 5 };
  const MAX = 9;
  const clean = (v, n) => String(v == null ? "" : v).replace(/\s+/g, " ").trim().slice(0, n);
  function normalise(r) {
    if (!r || typeof r !== "object") return null;
    const rv = r.reviewer || {};
    let stars = r.starRating != null ? r.starRating : r.rating;
    stars = typeof stars === "string" ? (WORDS[stars.toUpperCase()] || Number(stars)) : Number(stars);
    const text = clean(r.comment != null ? r.comment : r.text, 600);
    if (!(stars >= 1 && stars <= 5) || !text) return null;
    const name = rv.isAnonymous ? "A Google user" : clean(rv.displayName || rv.name || r.author || r.name, 60) || "A Google user";
    const d = new Date(r.createTime || r.time || r.date || "");
    return { stars: Math.round(stars), text, name, when: isNaN(d) ? "" : new Intl.DateTimeFormat("en-IN", { month: "short", year: "numeric" }).format(d), at: isNaN(d) ? 0 : d.getTime() };
  }
  function render(list) {
    const items = list.map(normalise).filter(Boolean).sort((a, b) => b.at - a.at).slice(0, MAX);
    if (!items.length) return false;
    box.textContent = "";
    items.forEach(it => {
      const q = document.createElement("blockquote"); q.className = "reveal in";
      const st = document.createElement("div"); st.className = "stars"; st.setAttribute("role", "img"); st.setAttribute("aria-label", it.stars + " out of 5 stars");
      st.textContent = "★".repeat(it.stars) + "☆".repeat(5 - it.stars);
      const p = document.createElement("p"); p.textContent = "“" + it.text + "”";
      const c = document.createElement("cite"); c.textContent = it.name + " · Google review" + (it.when ? " · " + it.when : "");
      q.appendChild(st); q.appendChild(p); q.appendChild(c); box.appendChild(q);
    });
    return true;
  }
  const ctl = "AbortController" in window ? new AbortController() : null;
  const timer = ctl ? setTimeout(() => ctl.abort(), 8000) : 0;
  fetch(FEED, { credentials: "omit", referrerPolicy: "no-referrer", signal: ctl ? ctl.signal : undefined })
    .then(r => { if (!r.ok) throw new Error("feed " + r.status); return r.json(); })
    .then(d => {
      const list = Array.isArray(d) ? d : Array.isArray(d && d.reviews) ? d.reviews : Array.isArray(d && d.widget && d.widget.reviews) ? d.widget.reviews : [];
      render(list);
    })
    .catch(() => { /* keep the reviews already on the page */ })
    .finally(() => clearTimeout(timer));
})();
