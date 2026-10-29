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

  // The 28 styles customers pick from, in this order. ratio = approximate letter height / sign width (drawing only).
  // deva = the font has Devanagari (Hindi) letters. hi = the Hindi font used for the preview when the text is Hindi and the style has no Hindi letters of its own (a similar look, so every style still changes the preview). Fonts are free Google Fonts that match each style name.
  const FONTS = [
    { key: "passionate", label: "Passionate", css: "'Pacifico', cursive", gf: "Pacifico", ratio: 0.42, hi: { gf: "Tillana", css: "'Tillana', cursive" } },
    { key: "dreamy", label: "Dreamy", css: "'Neonderthaw', cursive", gf: "Neonderthaw", ratio: 0.45, hi: { gf: "Amita", css: "'Amita', cursive" } },
    { key: "flow", label: "Flow", css: "'Yellowtail', cursive", gf: "Yellowtail", ratio: 0.42, hi: { gf: "Dekko", css: "'Dekko', cursive" } },
    { key: "original", label: "ORIGINAL", css: "'Bebas Neue', sans-serif", gf: "Bebas Neue", ratio: 0.3, hi: { gf: "Khand", css: "'Khand', sans-serif" } },
    { key: "classic", label: "CLASSIC", css: "'Poppins', sans-serif", gf: "Poppins", ratio: 0.4, deva: true },
    { key: "boyz", label: "Boyz", css: "'Permanent Marker', cursive", gf: "Permanent Marker", ratio: 0.42, hi: { gf: "Sarpanch", css: "'Sarpanch', sans-serif" } },
    { key: "funky", label: "Funky", css: "'Monoton', sans-serif", gf: "Monoton", ratio: 0.34, hi: { gf: "Modak", css: "'Modak', cursive" } },
    { key: "chic", label: "Chic", css: "'Great Vibes', cursive", gf: "Great Vibes", ratio: 0.4, hi: { gf: "Kurale", css: "'Kurale', serif" } },
    { key: "delight", label: "Delight", css: "'Dancing Script', cursive", gf: "Dancing Script", ratio: 0.4, hi: { gf: "Laila", css: "'Laila', serif" } },
    { key: "classy", label: "Classy", css: "'Satisfy', cursive", gf: "Satisfy", ratio: 0.38, hi: { gf: "Arya", css: "'Arya', sans-serif" } },
    { key: "romantic", label: "Romantic", css: "'Sacramento', cursive", gf: "Sacramento", ratio: 0.38, hi: { gf: "Gotu", css: "'Gotu', sans-serif" } },
    { key: "robo", label: "ROBO", css: "'Orbitron', sans-serif", gf: "Orbitron", ratio: 0.36, hi: { gf: "Rajdhani", css: "'Rajdhani', sans-serif" } },
    { key: "grooving", label: "Grooving", css: "'Bungee', sans-serif", gf: "Bungee", ratio: 0.36, hi: { gf: "Yatra One", css: "'Yatra One', cursive" } },
    { key: "quirky", label: "Quirky", css: "'Kalam', cursive", gf: "Kalam", ratio: 0.4, deva: true },
    { key: "stylish", label: "Stylish", css: "'Righteous', sans-serif", gf: "Righteous", ratio: 0.34, hi: { gf: "Baloo 2", css: "'Baloo 2', cursive" } },
    { key: "sassy", label: "Sassy", css: "'Sassy Frass', cursive", gf: "Sassy Frass", ratio: 0.4, hi: { gf: "Jaini", css: "'Jaini', cursive" } },
    { key: "glam", label: "Glam", css: "'Allura', cursive", gf: "Allura", ratio: 0.4, hi: { gf: "Kadwa", css: "'Kadwa', serif" } },
    { key: "mayasans", label: "MAYA-SANS", css: "'Josefin Sans', sans-serif", gf: "Josefin Sans", ratio: 0.34, hi: { gf: "Hind", css: "'Hind', sans-serif" } },
    { key: "chemistry", label: "Chemistry", css: "'Mr De Haviland', cursive", gf: "Mr De Haviland", ratio: 0.4, hi: { gf: "Sahitya", css: "'Sahitya', serif" } },
    { key: "acoustic", label: "Acoustic", css: "'Over the Rainbow', cursive", gf: "Over the Rainbow", ratio: 0.4, hi: { gf: "Mukta", css: "'Mukta', sans-serif" } },
    { key: "sparky", label: "Sparky", css: "'Reenie Beanie', cursive", gf: "Reenie Beanie", ratio: 0.4, hi: { gf: "Pragati Narrow", css: "'Pragati Narrow', sans-serif" } },
    { key: "vibey", label: "Vibey", css: "'Caveat', cursive", gf: "Caveat", ratio: 0.4, hi: { gf: "Palanquin Dark", css: "'Palanquin Dark', sans-serif" } },
    { key: "lofi", label: "LoFi", css: "'Handlee', cursive", gf: "Handlee", ratio: 0.4, hi: { gf: "Sura", css: "'Sura', serif" } },
    { key: "dope", label: "DOPE", css: "'Bungee Inline', sans-serif", gf: "Bungee Inline", ratio: 0.36, hi: { gf: "Teko", css: "'Teko', sans-serif" } },
    { key: "bossy", label: "Bossy", css: "'Yesteryear', cursive", gf: "Yesteryear", ratio: 0.4, hi: { gf: "Eczar", css: "'Eczar', serif" } },
    { key: "iconic", label: "ICONIC", css: "'Alfa Slab One', serif", gf: "Alfa Slab One", ratio: 0.36, hi: { gf: "Rozha One", css: "'Rozha One', serif" } },
    { key: "jolly", label: "Jolly", css: "'Sofia', cursive", gf: "Sofia", ratio: 0.4, hi: { gf: "Inknut Antiqua", css: "'Inknut Antiqua', serif" } },
    { key: "modern", label: "MODERN", css: "'Tenor Sans', sans-serif", gf: "Tenor Sans", ratio: 0.34, hi: { gf: "Karma", css: "'Karma', serif" } }
  ];
  // Styles used by older share links, saved designs and the name-plate cards. Not offered in the picker; normalize() maps them to the 15 above.
  const LEGACY_FONTS = [
    { key: "script", label: "Script", css: "'Pacifico', cursive", gf: "Pacifico", ratio: 0.42, legacy: "passionate" },
    { key: "block", label: "BLOCK", css: "'Bebas Neue', sans-serif", gf: "Bebas Neue", ratio: 0.3, legacy: "original" },
    { key: "marker", label: "Marker", css: "'Permanent Marker', cursive", gf: "Permanent Marker", ratio: 0.42, legacy: "boyz" },
    { key: "neon", label: "Neon Script", css: "'Neonderthaw', cursive", gf: "Neonderthaw", ratio: 0.45, legacy: "dreamy" },
    { key: "sacra", label: "Sacramento", css: "'Sacramento', cursive", gf: "Sacramento", ratio: 0.38, legacy: "romantic" },
    { key: "yellow", label: "Yellowtail", css: "'Yellowtail', cursive", gf: "Yellowtail", ratio: 0.42, legacy: "flow" },
    { key: "dancing", label: "Dancing", css: "'Dancing Script', cursive", gf: "Dancing Script", ratio: 0.4, legacy: "delight" },
    { key: "vibes", label: "Great Vibes", css: "'Great Vibes', cursive", gf: "Great Vibes", ratio: 0.4, legacy: "chic" },
    { key: "lobster", label: "Lobster", css: "'Lobster', cursive", gf: "Lobster", ratio: 0.38, legacy: "classy" },
    { key: "kaushan", label: "Kaushan", css: "'Kaushan Script', cursive", gf: "Kaushan Script", ratio: 0.4, legacy: "flow" },
    { key: "satisfy", label: "Satisfy", css: "'Satisfy', cursive", gf: "Satisfy", ratio: 0.38, legacy: "classy" },
    { key: "monoton", label: "MONOTON", css: "'Monoton', sans-serif", gf: "Monoton", ratio: 0.34, legacy: "funky" },
    { key: "orbitron", label: "Orbitron", css: "'Orbitron', sans-serif", gf: "Orbitron", ratio: 0.36, legacy: "robo" },
    { key: "righteous", label: "Righteous", css: "'Righteous', sans-serif", gf: "Righteous", ratio: 0.34, legacy: "stylish" },
    { key: "bungee", label: "BUNGEE", css: "'Bungee', sans-serif", gf: "Bungee", ratio: 0.36, legacy: "grooving" },
    { key: "caveat", label: "Caveat", css: "'Caveat', cursive", gf: "Caveat", ratio: 0.36, legacy: "quirky" },
    { key: "kalam", label: "Kalam कलम", css: "'Kalam', cursive", gf: "Kalam", ratio: 0.4, deva: true, legacy: "quirky" },
    { key: "rozha", label: "Rozha रोझा", css: "'Rozha One', serif", gf: "Rozha One", ratio: 0.4, deva: true, legacy: "classic" },
    { key: "yatra", label: "Yatra यात्रा", css: "'Yatra One', cursive", gf: "Yatra One", ratio: 0.4, deva: true, legacy: "classic" }
  ];
  // The 10 neon colours, in this order, with their exact hex codes.
  const COLORS = [
    { key: "p-white", label: "White", hex: "#FFFFFF" }, { key: "p-pink", label: "Pink", hex: "#EC008C" },
    { key: "p-green", label: "Green", hex: "#009B55" }, { key: "p-blue", label: "Blue", hex: "#0000FF" },
    { key: "p-purple", label: "Purple", hex: "#884A9E" }, { key: "p-orange", label: "Orange", hex: "#F58220" },
    { key: "p-lightblue", label: "Light Blue", hex: "#62C1D5" }, { key: "p-cream", label: "Warm Cream", hex: "#F1E1C8" },
    { key: "p-red", label: "Red", hex: "#ED1C24" }, { key: "p-yellow", label: "Yellow", hex: "#FFF000" }
  ];
  // Colours used by older links, each mapped to the closest of the 10 above; any other "#rrggbb" snaps to the nearest by RGB distance.
  const LEGACY_COLORS = [
    { key: "pink", to: "p-pink" }, { key: "white", to: "p-cream" }, { key: "gold", to: "p-yellow" }, { key: "cyan", to: "p-lightblue" },
    { key: "violet", to: "p-purple" }, { key: "green", to: "p-green" }, { key: "red", to: "p-red" }, { key: "orange", to: "p-orange" },
    { key: "magenta", to: "p-pink" }, { key: "blue", to: "p-blue" }, { key: "lime", to: "p-green" }, { key: "lemon", to: "p-yellow" },
    { key: "mint", to: "p-green" }, { key: "teal", to: "p-lightblue" }, { key: "lavender", to: "p-purple" }, { key: "peach", to: "p-orange" },
    { key: "rose", to: "p-pink" }, { key: "coolwhite", to: "p-white" }
  ];
  // Preview walls (display only, never priced). light = light wall (the neon is drawn with a darker core).
  // The customer's own wall photo is handled in the UI (never saved or sent), so it is not in this list.
  const BACKDROPS = [
    { key: "mauve", label: "Default Wall", c: "#2a1330" }, { key: "brick", label: "Dark Brick Wall", c: "#2d1713" },
    { key: "concrete", label: "Concrete Wall", c: "#5a5d63" }, { key: "white", label: "White Wall", c: "#ece9e4", light: true },
    { key: "wood", label: "Wooden Wall", c: "#6b4423" }
  ];
  const LEGACY_BACKDROPS = { night: "mauve", black: "mauve", navy: "mauve", purple: "mauve", terracotta: "brick", green: "concrete", light: "white", cream: "white", marble: "white", custom: "mauve" };
  // Sizes. width x height in inches is per letter: the sign gets longer with more text.
  const SIZES = [
    { key: "regular", label: "Regular", w: 3, h: 10 }, { key: "medium", label: "Medium", w: 4, h: 13 }, { key: "large", label: "Large", w: 5, h: 15 }
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
    { key: "name", label: "Name sign", cfg: { t: ["Your Name", ""], f: "passionate", c: "p-pink", z: "medium" } },
    { key: "open", label: "OPEN sign", cfg: { t: ["OPEN", ""], f: "original", c: "p-red", z: "regular" } },
    { key: "vibes", label: "Good vibes", cfg: { t: ["Good", "Vibes"], f: "boyz", c: "p-lightblue", z: "medium" } },
    { key: "welcome", label: "Welcome", cfg: { t: ["Welcome", ""], f: "passionate", c: "p-yellow", z: "medium" } },
    { key: "wedding", label: "Wedding", cfg: { t: ["Mr & Mrs", ""], f: "chic", c: "p-pink", z: "medium", i: "heart" } },
    { key: "cafe", label: "Cafe", cfg: { t: ["Coffee", "& Chai"], f: "funky", c: "p-orange", c2: "p-lightblue", z: "medium" } },
    { key: "swagatam", label: "Hindi welcome", cfg: { t: ["\u0938\u094D\u0935\u093E\u0917\u0924\u092E\u094D", ""], f: "quirky", c: "p-yellow", z: "medium" } }
  ];



  /* Ready-made designs shown in the "Design collection" section (original text designs, rendered live; not photos).
     Each cfg goes through normalize() before use, so a bad entry can never reach the page. */
  const COLLECTION_CATEGORIES = [
    { key: "name", label: "Names & home" }, { key: "wedding", label: "Wedding & events" }, { key: "cafe", label: "Cafe & restaurant" },
    { key: "shop", label: "Shop & business" }, { key: "quotes", label: "Quotes & vibes" }, { key: "kids", label: "Kids & fun" },
    { key: "gym", label: "Gym & studio" }, { key: "hindi", label: "Hindi" }
  ];
  const D = (id, cat, title, t, f, c, o) => ({ id, cat, title, cfg: Object.assign({ t, f, c, z: "medium" }, o || {}) });
  const COLLECTION = [
    D("ananya", "name", "Soft pink name", ["Ananya", ""], "passionate", "p-pink"),
    D("aryan", "name", "Gamer room", ["Aryan", ""], "robo", "p-lightblue"),
    D("kavya", "name", "Name with heart", ["Kavya", ""], "delight", "p-pink", { i: "heart" }),
    D("home", "name", "Home sweet home", ["Home", "Sweet Home"], "classy", "p-cream", { c2: "p-orange", g: "wood" }),
    D("vows", "wedding", "Mr & Mrs", ["Mr & Mrs", ""], "chic", "p-pink", { z: "large", i: "heart" }),
    D("married", "wedding", "Just married", ["Just", "Married"], "romantic", "p-yellow", { c2: "p-cream" }),
    D("together", "wedding", "Better together", ["Better", "Together"], "dreamy", "p-purple", { c2: "p-pink" }),
    D("sangeet", "wedding", "Sangeet night", ["Sangeet", "Night"], "flow", "p-pink", { c2: "p-yellow", z: "large" }),
    D("coffee", "cafe", "Coffee and chai", ["Coffee", "& Chai"], "funky", "p-orange", { c2: "p-lightblue", g: "brick" }),
    D("fresh", "cafe", "Fresh and hot", ["Fresh", "& Hot"], "classy", "p-orange", { c2: "p-yellow", g: "brick" }),
    D("eat", "cafe", "Eat, drink, repeat", ["Eat Drink", "Repeat"], "grooving", "p-red", { c2: "p-cream" }),
    D("sweet", "cafe", "Sweet tooth", ["Sweet", "Tooth"], "flow", "p-pink", { c2: "p-green" }),
    D("open", "shop", "OPEN sign", ["OPEN", ""], "original", "p-red", { z: "regular" }),
    D("welcome", "shop", "Welcome", ["Welcome", ""], "passionate", "p-yellow", { g: "wood" }),
    D("salon", "shop", "Salon and spa", ["Beauty", "Salon"], "chic", "p-pink", { c2: "p-cream", b: "rect" }),
    D("studio", "shop", "Studio name", ["Photo", "Studio"], "stylish", "p-white", { c2: "p-blue", g: "concrete" }),
    D("vibes", "quotes", "Good vibes", ["Good", "Vibes"], "boyz", "p-lightblue", { c2: "p-pink" }),
    D("dream", "quotes", "Dream big", ["Dream", "Big"], "quirky", "p-yellow", { c2: "p-orange" }),
    D("love", "quotes", "Love is all", ["Love", "Is All"], "delight", "p-red", { i: "heart" }),
    D("stars", "quotes", "Be a star", ["Be A", "Star"], "classy", "p-yellow", { c2: "p-purple", i: "star" }),
    D("kids", "kids", "Play room", ["Play", "Room"], "grooving", "p-green", { c2: "p-orange" }),
    D("moon", "kids", "Little moon", ["Sweet", "Dreams"], "romantic", "p-yellow", { c2: "p-purple", i: "moon" }),
    D("fit", "gym", "No pain, no gain", ["No Pain", "No Gain"], "original", "p-red", { c2: "p-cream", z: "large", g: "concrete" }),
    D("flex", "gym", "Beast mode", ["Beast", "Mode"], "robo", "p-green", { c2: "p-lightblue" }),
    D("swagat", "hindi", "Swagatam", ["\u0938\u094d\u0935\u093e\u0917\u0924\u092e\u094d", ""], "quirky", "p-yellow", { g: "wood" }),
    D("shubh", "hindi", "Shubh labh", ["\u0936\u0941\u092d", "\u0932\u093e\u092d"], "classic", "p-orange", { c2: "p-yellow", g: "brick" }),
    D("ghar", "hindi", "Home name", ["\u092e\u0947\u0930\u093e \u0918\u0930", ""], "classic", "p-pink"),
    D("vihaan", "name", "Bold boy's name", ["Vihaan", ""], "flow", "p-blue"),
    D("ishita", "name", "Dreamy name", ["Ishita", ""], "dreamy", "p-purple", { i: "star" }),
    D("mehendi", "wedding", "Mehendi night", ["Mehendi", "Night"], "flow", "p-green", { c2: "p-yellow", z: "large", g: "concrete" }),
    D("savedate", "wedding", "Save the date", ["Save The", "Date"], "classy", "p-cream", { c2: "p-pink" }),
    D("chaitime", "cafe", "Chai time", ["Chai", "Time"], "classy", "p-yellow", { c2: "p-orange", g: "brick" }),
    D("burger", "cafe", "Burger bar", ["Burger", "Bar"], "grooving", "p-orange", { c2: "p-red" }),
    D("boutique", "shop", "Boutique", ["Boutique", "Store"], "chic", "p-pink", { c2: "p-cream", b: "rect" }),
    D("techzone", "shop", "Tech zone", ["Tech", "Zone"], "robo", "p-lightblue", { c2: "p-pink" }),
    D("wild", "quotes", "Stay wild", ["Stay", "Wild"], "flow", "p-green", { c2: "p-green" }),
    D("happen", "quotes", "Make it happen", ["Make It", "Happen"], "quirky", "p-orange", { c2: "p-yellow", g: "concrete" }),
    D("dino", "kids", "Dino land", ["Dino", "Land"], "grooving", "p-green", { c2: "p-yellow" }),
    D("littlestar", "kids", "Little star", ["Little", "Star"], "delight", "p-yellow", { c2: "p-pink", i: "star" }),
    D("princess", "kids", "Princess room", ["Princess", "Room"], "chic", "p-pink", { c2: "p-purple", i: "heart" }),
    D("superkid", "kids", "Super kid", ["Super", "Kid"], "boyz", "p-red", { c2: "p-lightblue" }),
    D("rise", "gym", "Rise and grind", ["Rise", "& Grind"], "original", "p-orange", { c2: "p-cream", z: "large" }),
    D("trainhard", "gym", "Train hard", ["Train", "Hard"], "stylish", "p-red", { c2: "p-yellow", g: "concrete" }),
    D("yoga", "gym", "Yoga studio", ["Yoga", "Studio"], "romantic", "p-green", { c2: "p-purple", g: "concrete" }),
    D("fitlife", "gym", "Fit life", ["Fit", "Life"], "funky", "p-green", { c2: "p-lightblue" }),
    D("diwali", "hindi", "Shubh Deepawali", ["\u0936\u0941\u092d", "\u0926\u0940\u092a\u093e\u0935\u0932\u0940"], "classic", "p-orange", { c2: "p-yellow", g: "brick" }),
    D("vivah", "hindi", "Shubh Vivah", ["\u0936\u0941\u092d", "\u0935\u093f\u0935\u093e\u0939"], "classic", "p-pink", { c2: "p-yellow", i: "heart" }),
    D("mithai", "hindi", "Mithai ghar", ["\u092e\u093f\u0920\u093e\u0908", "\u0918\u0930"], "quirky", "p-yellow", { c2: "p-orange", g: "wood" }),
    D("aadhya", "name", "Soft orange name", ["Aadhya", ""], "romantic", "p-orange"),
    D("mira", "name", "Warm cream moon", ["Mira", ""], "dreamy", "p-cream", { i: "moon" }),
    D("kabir", "name", "Green name", ["Kabir", ""], "stylish", "p-green"),
    D("zara", "name", "Purple name", ["Zara", ""], "delight", "p-purple"),
    D("forever", "wedding", "Forever starts here", ["Forever", "Starts Here"], "chic", "p-pink", { c2: "p-cream", z: "large", i: "heart" }),
    D("pose", "wedding", "Photo booth", ["Strike", "A Pose"], "boyz", "p-pink", { c2: "p-lightblue" }),
    D("cheers", "wedding", "Cheers", ["Cheers", ""], "classy", "p-yellow", { z: "large" }),
    D("party", "wedding", "Party time", ["Party", "Time"], "grooving", "p-pink", { c2: "p-lightblue" }),
    D("orderhere", "cafe", "Order here", ["Order", "Here"], "stylish", "p-orange", { c2: "p-cream" }),
    D("coldcoffee", "cafe", "Cold coffee", ["Cold", "Coffee"], "funky", "p-lightblue", { c2: "p-orange", g: "brick" }),
    D("baked", "cafe", "Fresh baked", ["Fresh", "Baked"], "classy", "p-orange", { c2: "p-cream", g: "brick" }),
    D("lounge", "cafe", "The lounge", ["The", "Lounge"], "flow", "p-purple", { c2: "p-yellow" }),
    D("comein", "shop", "Come on in", ["Come", "On In"], "quirky", "p-cream", { c2: "p-orange", g: "wood" }),
    D("newarr", "shop", "New arrivals", ["New", "Arrivals"], "flow", "p-pink", { c2: "p-cream" }),
    D("sale", "shop", "Big sale", ["Big", "Sale"], "grooving", "p-red", { c2: "p-yellow" }),
    D("gift", "shop", "Gift shop", ["Gift", "Shop"], "chic", "p-lightblue", { c2: "p-pink" }),
    D("riseshine", "quotes", "Rise and shine", ["Rise &", "Shine"], "classy", "p-yellow", { c2: "p-orange" }),
    D("games", "quotes", "Game room", ["Let The Games", "Begin"], "robo", "p-green", { c2: "p-lightblue" }),
    D("positive", "quotes", "Stay positive", ["Stay", "Positive"], "delight", "p-green", { c2: "p-yellow", g: "concrete" }),
    D("kind", "quotes", "Be kind", ["Be", "Kind"], "romantic", "p-pink", { i: "heart" }),
    D("rainbow", "kids", "Rainbow room", ["Rainbow", "Room"], "classy", "p-pink", { c2: "p-lightblue" }),
    D("astro", "kids", "Little astronaut", ["Little", "Astronaut"], "stylish", "p-lightblue", { c2: "p-purple", i: "star" }),
    D("playtime", "kids", "Playtime", ["Play", "Time"], "boyz", "p-yellow", { c2: "p-green" }),
    D("littleone", "kids", "Little one", ["Little", "One"], "romantic", "p-purple", { c2: "p-pink", i: "heart" }),
    D("noexcuse", "gym", "No excuses", ["No", "Excuses"], "original", "p-red", { c2: "p-cream", z: "large" }),
    D("sweat", "gym", "Sweat and smile", ["Sweat &", "Smile"], "flow", "p-orange", { c2: "p-yellow", g: "concrete" }),
    D("pilates", "gym", "Pilates studio", ["Pilates", "Studio"], "romantic", "p-purple", { c2: "p-orange" }),
    D("cardio", "gym", "Cardio zone", ["Cardio", "Zone"], "robo", "p-pink", { c2: "p-lightblue" }),
    D("mata", "hindi", "Jai Mata Di", ["\u091c\u092f", "\u092e\u093e\u0924\u093e \u0926\u0940"], "classic", "p-red", { c2: "p-yellow", g: "brick" }),
    D("atithi", "hindi", "Atithi Devo Bhava", ["\u0905\u0924\u093f\u0925\u093f", "\u0926\u0947\u0935\u094b \u092d\u0935"], "classic", "p-yellow", { g: "wood" }),
    D("dukaan", "hindi", "Meri dukaan", ["\u092e\u0947\u0930\u0940", "\u0926\u0941\u0915\u093e\u0928"], "classic", "p-orange", { c2: "p-yellow" }),
    D("parivar", "hindi", "Hamara parivar", ["\u0939\u092e\u093e\u0930\u093e", "\u092a\u0930\u093f\u0935\u093e\u0930"], "quirky", "p-pink", { c2: "p-yellow", i: "heart" })
  ];

  const LIMITS = { line: 20, notes: 200, maxLines: 2 };
  const DEFAULTS = Object.freeze({ t: ["Hello", ""], f: "passionate", c: "p-pink", z: "regular", b: "none", u: "indoor", x: "pickup", i: "none", n: "", c2: "", g: "mauve" });
  const ALL_FONTS = FONTS.concat(LEGACY_FONTS);
  /** Any font key, including the older ones used by name-plate cards. */
  const fontOf = key => ALL_FONTS.find(o => o.key === key) || FONTS[0];

  const keysOf = list => list.map(o => o.key);
  const pick = (list, key, fallback) => (keysOf(list).includes(key) ? key : fallback);
  const find = (list, key) => list.find(o => o.key === key) || list[0];
  const clean = (s, max) => Array.from(String(s == null ? "" : s).normalize("NFC")
    .replace(/[\u0000-\u001F\u007F-\u009F\u200B-\u200F\u2028\u2029\u202A-\u202E\u2066-\u2069\uFEFF]/g, " ").replace(/\s+/g, " ").trim()).slice(0, max).join("");
  const HEX = /^#[0-9a-f]{6}$/i;
  /** A colour is either a key from COLORS or a custom "#rrggbb" value. Anything else falls back. */
  const hexRgb = h => { const n = parseInt(h.slice(1), 16); return [n >> 16, (n >> 8) & 255, n & 255]; };
  /** Snaps any "#rrggbb" to the closest of the 10 neon colours (so an old or custom colour never leaves the palette). */
  const nearestColor = hex => { const a = hexRgb(hex); let best = COLORS[0], bd = Infinity; COLORS.forEach(c => { const b = hexRgb(c.hex), d = (a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2 + (a[2] - b[2]) ** 2; if (d < bd) { bd = d; best = c; } }); return best.key; };
  const colorKey = (raw, fallback) => {
    const v = typeof raw === "string" ? raw.trim().toLowerCase() : "";
    if (keysOf(COLORS).includes(v)) return v;
    if (HEX.test(v)) return nearestColor(v);
    const old = LEGACY_COLORS.find(c => c.key === v);
    return old ? old.to : fallback;
  };
  const colorOf = key => find(COLORS, key);
  const luminance = hex => { const n = parseInt(hex.slice(1), 16); return (0.2126 * (n >> 16) + 0.7152 * ((n >> 8) & 255) + 0.0722 * (n & 255)) / 255; };
  /** True for a light preview wall. */
  const isLightWall = cfg => !!(BACKDROPS.find(b => b.key === cfg.g) || {}).light;
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
    const rawFont = String(raw.f || ""), legacyFont = (LEGACY_FONTS.find(o => o.key === rawFont) || {}).legacy;
    const fontKey = pick(FONTS, legacyFont || rawFont, DEFAULTS.f), fontObj = find(FONTS, fontKey), allText = l1 + l2;
    if (hasNonLatin(allText)) {
      const onlyLatinOrDeva = !/[^\u0000-\u024F\u2000-\u206F\u20A0-\u20CF\u0900-\u097F]/.test(allText);
      if (DEVA.test(allText) && !fontObj.deva) warnings.line1 = "This style has no Hindi letters, so the preview uses a Hindi font with a similar look. Tell us the style you want in the notes and we will confirm it on the mock-up.";
      else if (!(DEVA.test(allText) && onlyLatinOrDeva)) warnings.line1 = "The preview font may not show this script correctly. Tell us the style you want in the notes and we will confirm it on the mock-up.";
    }
    // size: a key; older links stored a width in feet, which maps to the closest of the three sizes
    let z = pick(SIZES, raw.z, "");
    if (!z) { const w = Number(raw.w); z = Number.isFinite(w) && raw.w !== "" && raw.w !== null ? (w <= 2 ? "regular" : w <= 3.5 ? "medium" : "large") : DEFAULTS.z; }
    const notesRaw = String(raw.n == null ? "" : raw.n);
    if (Array.from(notesRaw.trim()).length > LIMITS.notes) errors.notes = "Notes can have up to " + LIMITS.notes + " characters.";
    const bgKey = pick(BACKDROPS, LEGACY_BACKDROPS[raw.g] || raw.g, DEFAULTS.g);
    const c = colorKey(raw.c, DEFAULTS.c), c2 = l2 ? colorKey(raw.c2, "") : "";
    const config = {
      t: l1 ? (l2 ? [l1, l2] : [l1, ""]) : ["", ""],
      f: fontKey, c, c2, g: bgKey, z,
      b: pick(BACKINGS, raw.b, DEFAULTS.b), u: pick(USES, raw.u, DEFAULTS.u), x: pick(FITTINGS, raw.x, DEFAULTS.x),
      i: pick(ICONS, raw.i, DEFAULTS.i), n: clean(notesRaw, LIMITS.notes)
    };
    return { config, errors, warnings, ok: Object.keys(errors).length === 0 };
  }

  const lineCount = cfg => (cfg.t[1] ? 2 : 1);
  const sizeOf = key => find(SIZES, key);
  const COMBINING = /\p{M}/u;
  /** Length of one line in letters: a space counts as half a letter, accents and Hindi vowel signs as nothing. */
  const letters = line => Array.from(line || "").reduce((n, ch) => n + (/\s/.test(ch) ? 0.5 : COMBINING.test(ch) ? 0 : 1), 0);

  /**
   * estimate(config, rates) -> { rows, total, size, minApplied, toConfirm }
   *   sign width  = letters in the longest line x the size's letter width (inches)
   *   sign height = lines x the size's letter height (inches)
   *   area (sq ft) = width x height / 144
   *   neon    = area x neonRatePerSqFt
   *   backing = area x (backboard rate - neon rate)   when an acrylic backing is chosen
   *   each line is rounded to the nearest ₹100; total never goes below neonMinPrice
   * Items the shop has not published a price for (outdoor build, fitting, symbols, notes)
   * are NOT priced: they are listed in toConfirm and the total says "from".
   */
  function estimate(cfg, rates) {
    const sz = sizeOf(cfg.z), lines = lineCount(cfg);
    const wIn = Math.max(sz.w, Math.round(Math.max.apply(null, cfg.t.filter(Boolean).map(letters).concat([1])) * sz.w));
    const hIn = lines * sz.h;
    const area = wIn * hIn / 144;
    const r100 = n => Math.round(n / 100) * 100;
    const rate = rates.neonRatePerSqFt, back = rates.neonBackboardRatePerSqFt;
    const rows = [];
    const neon = r100(area * rate);
    rows.push({ key: "neon", label: "Neon sign, " + sz.label + " letters, about " + wIn + " × " + hIn + " in (" + area.toFixed(1) + " sq ft at " + money(rate) + " per sq ft)", amount: neon });
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
    if (cfg.n) toConfirm.push("Anything you wrote in the notes");
    if (hasNonLatin(cfg.t.join(""))) toConfirm.push("Lettering style for this script");
    return { rows, total: sum, size: { z: sz.key, label: sz.label, letterW: sz.w, letterH: sz.h, w: wIn, h: hIn, area: Math.round(area * 10) / 10, lines }, minApplied, toConfirm };
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
    return cfg.t.filter(Boolean).join(" ") + " · " + colorOf(cfg.c).label + " · " + find(FONTS, cfg.f).label + " · " + sizeOf(cfg.z).label;
  }

  /** Plain-text enquiry for WhatsApp / e-mail. */
  function buildMessage(cfg, est, opts) {
    opts = opts || {};
    const L = [];
    L.push(opts.heading || "Hi Grafix Club, I designed a neon sign on your website.");
    L.push("Text: \"" + cfg.t.filter(Boolean).join(" / ") + "\"");
    L.push("Colour: " + colorOf(cfg.c).label + (cfg.t[1] && cfg.c2 ? " (line 2: " + colorOf(cfg.c2).label + ")" : ""));
    L.push("Style: " + find(FONTS, cfg.f).label);
    L.push("Size: " + est.size.label + " (letters " + est.size.letterW + " in wide x " + est.size.letterH + " in high; whole sign about " + est.size.w + " x " + est.size.h + " in)");
    L.push("Background (preview only): " + find(BACKDROPS, cfg.g).label);
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

  return { FONTS, fontOf, COLORS, BACKDROPS, SIZES, sizeOf, colorOf, luminance, isLightWall, BACKINGS, USES, FITTINGS, ICONS, PRESETS, COLLECTION, COLLECTION_CATEGORIES, LIMITS, DEFAULTS, FILE_TYPES, normalize, estimate, encode, decode, summary, buildMessage, checkFile, sniff, find, money, hasNonLatin };
});
