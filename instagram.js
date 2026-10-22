/* =========================================================
   GRAFIX CLUB – automatic Instagram gallery
   Reads a JSON feed (CONFIG.instagramFeed, e.g. https://feeds.behold.so/XXXX) and shows the latest posts.
   New Instagram posts appear here by themselves when the feed service refreshes (about daily on its free plan).
   No Instagram login or token is stored on this site. If the feed is missing or fails, only the
   "Follow on Instagram" button is shown and the rest of the page is unaffected.
   ========================================================= */
(function () {
  "use strict";
  const grid = document.getElementById("igGrid"), note = document.getElementById("igNote");
  if (!grid || typeof CONFIG === "undefined") return;
  const FEED = String(CONFIG.instagramFeed || "");
  const MAX = 12;
  const okFeed = /^https:\/\/feeds\.behold\.so\/[A-Za-z0-9_-]{6,64}$/.test(FEED);
  const okPost = u => /^https:\/\/www\.instagram\.com\/(p|reel|reels|tv)\/[A-Za-z0-9_-]+\/?/.test(String(u || ""));
  const okImg = u => { try { const x = new URL(u); return x.protocol === "https:" && /(^|\.)behold\.pictures$/.test(x.hostname); } catch (e) { return false; } };
  const text = (v, n) => String(v == null ? "" : v).replace(/\s+/g, " ").trim().slice(0, n);

  function imageOf(p) {
    const s = p.sizes || {};
    const cand = [s.medium && s.medium.mediaUrl, s.large && s.large.mediaUrl, s.small && s.small.mediaUrl];
    return cand.find(okImg) || "";
  }
  function render(posts) {
    const shown = posts.filter(p => p && okPost(p.permalink) && imageOf(p)).slice(0, MAX);
    if (!shown.length) return false;
    shown.forEach(p => {
      const li = document.createElement("li");
      const a = document.createElement("a");
      a.href = p.permalink; a.target = "_blank"; a.rel = "noopener";
      const cap = text(p.prunedCaption || p.caption, 120);
      const kind = p.isReel ? "Reel" : p.mediaType === "VIDEO" ? "Video" : p.mediaType === "CAROUSEL_ALBUM" ? "Album" : "";
      const img = document.createElement("img");
      img.src = imageOf(p); img.loading = "lazy"; img.decoding = "async"; img.width = 400; img.height = 400;
      img.alt = text(p.altText, 200) || cap || "Instagram post from Grafix Club";
      a.appendChild(img);
      if (kind) { const b = document.createElement("span"); b.className = "ig-badge"; b.textContent = kind; a.appendChild(b); }
      const sr = document.createElement("span"); sr.className = "sr-only"; sr.textContent = " View this post on Instagram (opens in a new tab)"; a.appendChild(sr);
      li.appendChild(a); grid.appendChild(li);
    });
    grid.hidden = false;
    return true;
  }
  if (!FEED) return;
  if (!okFeed) { if (window.console) console.warn("CONFIG.instagramFeed must look like https://feeds.behold.so/<id>"); return; }
  const ctl = "AbortController" in window ? new AbortController() : null;
  const timer = ctl ? setTimeout(() => ctl.abort(), 8000) : 0;
  fetch(FEED, { credentials: "omit", referrerPolicy: "no-referrer", signal: ctl ? ctl.signal : undefined })
    .then(r => { if (!r.ok) throw new Error("feed " + r.status); return r.json(); })
    .then(data => { if (!data || !Array.isArray(data.posts) || !render(data.posts)) throw new Error("empty feed"); })
    .catch(() => { note.textContent = "Our latest posts are on Instagram. Tap Follow to see them."; note.hidden = false; })
    .finally(() => clearTimeout(timer));
})();
