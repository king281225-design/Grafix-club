/* =========================================================
   GRAFIX CLUB – site config. Edit this block only.
   (Moved here from app.js so every page can share it.)
   Leave a social URL as "" to use a search fallback until the
   official page URL is known.
   ========================================================= */
const CONFIG = {
  phone: "+919999306308",
  whatsapp: "919999306308",           // country code + number, no +
  email: "grafixclub_gc@yahoo.in",
  defaultMsg: "Hi Grafix Club, I found you online and would like a quote.",
  links: {
    google: "https://share.google/le0RUSxiwVPWliVLf",   // shop's Google listing
    googleReview: "https://www.google.com/search?q=Grafix+Club+Janakpuri+reviews", // replace with your g.page/r/.../review link
    justdial: "https://www.justdial.com/Delhi/Grafix-Club-Opposite-Dilli-Heart-Janakpuri/011P1228636379E9G4A7_BZDET",
    directions: "https://www.google.com/maps/dir/?api=1&destination=Grafix+Club+WZ-79%2FC6+Gali+No+7+Virender+Nagar+Janakpuri+Delhi+110058",
    instagram: "https://www.instagram.com/grafix.club/",
    facebook: ""     // e.g. "https://www.facebook.com/yourpage"
  },
  /* Google review button: paste the shop's Google Place ID (starts with "ChIJ", find it with Google's Place ID Finder)
     and the button opens the review box directly. Or paste your Business Profile review link into links.googleReview. */
  googlePlaceId: "",

  /* Show real Google reviews automatically: connect the shop at featurable.com (free plan), then paste the widget's
     data URL here, e.g. "https://api.featurable.com/api/v1/widgets/<widget-id>". Leave "" to keep the reviews below as they are.
     Only api.featurable.com is allowed by the security policy. */
  googleReviewsFeed: "",

  /* Automatic Instagram gallery: paste the JSON feed URL from a feed service (e.g. https://feeds.behold.so/XXXX).
     Leave "" to show only the "Follow on Instagram" button. Only feeds.behold.so is allowed by the security policy. */
  instagramFeed: "https://feeds.behold.so/haJ4WHeUxRL3KwUYceCQ",
  fallback: {
    instagram: "https://www.google.com/search?q=Grafix+Club+Janakpuri+instagram",
    facebook: "https://www.facebook.com/search/top?q=Grafix%20Club%20Delhi"
  },

  /* ---- Neon Studio pricing (indicative; the shop confirms the final price) ---- */
  neonRatePerSqFt: 800,            // custom neon, per sq ft  (price list: "Custom neon logo / quote")
  neonBackboardRatePerSqFt: 1000,  // neon + acrylic backboard, per sq ft (price list: "Neon + acrylic backboard")
  neonMinPrice: 1500,              // minimum estimate shown in the studio
  neonRgbRatePerSqFt: 0,           // RGB / multicolour neon, per sq ft. 0 = not set yet: RGB signs show "price on confirmation"

  /* ---- Neon Studio limits ---- */
  maxUploadMB: 5                   // reference photo / logo upload limit
};
