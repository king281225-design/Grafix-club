/* =========================================================
   GRAFIX CLUB – Design collection
   Pictures of the styles we make, in the same order as the price list: name plates, LED boards, neon signs, steel letters and stickers, then a separate Acrylic work group.
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
    { key: "led", label: "LED boards" },
    { key: "neon", label: "Neon signs" },
    { key: "letters", label: "Steel letters & stickers" },
    { key: "acrylic", label: "Acrylic work" }
  ];
  /* every picture fills its card (cropped to 4:3); POS keeps the lettering in view on tall pictures */
  const POS = { "d2-sharma": "50% 12%", "d4-vinay-priyanka": "50% 48%", "d8-seemas-nivas": "50% 52%", "d9-nanak": "50% 28%", "d13-backlit-directory": "50% 12%", "d14-sawants": "50% 42%", "d16-sri-nivas": "50% 30%", "d17-sanu": "50% 45%", "d25-happy-birthday": "50% 48%", "d31-happy-place-orange": "50% 33%", "d24-open-welcome": "50% 42%", "d20-coffee-time": "50% 45%", "d22-gold-3d-letters": "50% 55%", "d19-dhruv": "50% 38%", "d11-cafe-board": "50% 22%", "d40-beauty-halo": "50% 52%", "d39-glossy-nail": "50% 45%", "d41-ganesh-kunj-frame": "50% 45%", "d42-agarwals-peacock": "50% 45%", "d43-nagpur-mandala": "50% 50%", "d44-shivsarman-oval": "50% 50%", "d45-cyber-samanvaya": "50% 50%", "d46-pratap-villa": "50% 75%", "d47-shivay-gate": "50% 55%", "d49-tripathis-cutout": "50% 50%", "d50-kovraya-brass": "50% 50%", "d51-blue-gold-acrylic": "50% 68%", "d52-longleaf-green-plate": "50% 45%", "d55-visual-arts-backlit": "50% 45%", "d56-maroon-backlit-plate": "50% 32%", "d57-white-acrylic-qr": "50% 45%", "d58-black-gold-qr": "50% 45%", "d53-artisans-backlit-panel": "50% 45%", "d59-restaurant-script": "50% 45%", "d60-baker-buddy": "50% 25%", "d61-smokz-fascia": "50% 30%", "d62-brotherfood": "50% 14%", "d63-good-bun": "50% 10%", "d64-cafe-luna": "50% 45%", "d65-couple-love-hearts": "50% 50%", "d66-le-petit-nuage": "50% 45%", "d67-serenitea": "50% 45%", "d68-logeni-wall": "50% 40%", "d70-lm-studio-halo": "50% 40%", "d72-berg-maroon-panel": "50% 38%", "d73-blackroc-halo": "50% 40%", "d48-satvik-kitchen": "50% 30%", "d54-mirror-gold-initials": "50% 50%", "d69-kylie-lark-ring": "50% 50%", "d71-ruth-services-gold": "50% 30%", "d74-lotus-black-gold": "50% 50%", "d75-frosted-rose-gold": "50% 50%", "d76-walnut-brass-om": "50% 50%", "d77-round-black-gold": "50% 50%", "d78-green-arch-gold": "50% 38%", "d79-steel-cutout-cement": "50% 50%", "d80-corten-jali": "50% 50%", "d81-marble-clinic": "50% 50%", "d82-clear-acrylic-plaque": "50% 50%", "d83-navy-gate-pillar": "50% 50%", "d84-blush-qr-stand": "50% 60%", "d85-black-review-stand": "50% 55%", "d86-hindi-ganesha-black": "50% 50%", "d87-hindi-white-saffron": "50% 50%", "d88-teak-hanging-bell": "50% 40%", "d89-gate-pillar-two-plate": "50% 50%", "d90-royal-blue-reception": "50% 50%", "d91-slate-warm-glow": "50% 50%", "d92-etched-copper": "50% 50%", "d93-round-sage-kids": "50% 50%", "d94-edge-lit-clinic": "50% 50%", "d95-wood-slat-brass": "50% 50%", "d96-purple-gold-arch": "50% 50%", "d97-floating-numerals": "50% 45%", "d98-terracotta-gold-script": "50% 50%", "d99-sweets-script-board": "50% 50%", "d100-salon-rose-gold-letters": "50% 50%", "d101-pharmacy-green-cross": "50% 50%", "d102-jeweller-maroon-gold": "50% 50%", "d103-coffee-blade-fascia": "50% 50%", "d104-bakery-pink-fascia": "50% 50%", "d105-dental-blue-white": "50% 50%", "d106-gym-red-halo": "50% 50%" };
  const I = (id, cat, title, file, w, h, alt, product, sub) => ({ id, cat, title, file, w, h, alt, product, sub, priceText: priceText(product) });
  const ORDER = CATS.map(c => c.key);
  const items = [
    I("pl-brass-wood", "plates", "Walnut plate with brass frame", "d7-solanki", 900, 600, "Name plate idea: walnut wood plate with a brass frame and raised brass Ganesha motif and lettering", "steel-name-plate", "Walnut and brass plate"),
    I("pl-wall-letters", "letters", "Black wall-mounted name letters", "d2-sharma", 560, 900, "Name sign idea: black cut-out lettering mounted on a textured outside wall next to a front door", "steel-acrylic-letters", "Cut-out wall letters"),
    I("pl-sawants", "plates", "Script name sign with house number", "d14-sawants", 736, 736, "Name sign idea: slim metal script lettering with a heart and a house number on a plain rod, softly backlit on a cream wall", "led-name-plate", "Backlit script name sign"),
    I("pl-evaara", "plates", "Leaf-arc plate with gold script", "d15-evaara", 900, 600, "Name plate idea: cream plate with a gold leaf arc, a house number and a script name with a warm backlight", "led-name-plate", "Backlit plate with gold leaf arc"),
    I("pl-sri-nivas", "plates", "Flute and feather backlit name sign", "d16-sri-nivas", 736, 736, "Name sign idea: black cut-out lettering on a flute shape with a peacock feather and a hanging number plate, glowing behind", "led-name-plate", "Backlit cut-out name sign with hanging number"),
    I("pl-white-gold", "acrylic", "White acrylic with gold mirror letters", "d17-sanu", 736, 736, "Name plate idea: white acrylic plate with raised gold mirror lettering and gold corner pieces", "acrylic-name-plate", "White acrylic with gold mirror lettering"),
    I("pl-krishna-led", "plates", "Backlit plate with Krishna silhouette", "d18-aadhyan", 735, 586, "Name plate idea: frosted plate with a black Krishna silhouette, a flute and a script name, with a warm backlight", "led-name-plate", "Backlit plate with silhouette"),
    I("pl-wood-brass", "plates", "Teak plate with brass figure", "d19-dhruv", 736, 736, "Name plate idea: teak wood plate with raised brass lettering, a house number, a flute and a brass figure", "steel-name-plate", "Teak and brass plate"),
    I("pl-coffee-time", "letters", "Black cut-out wall sign", "d20-coffee-time", 900, 900, "Wall sign idea: black laser-cut metal lettering with a coffee cup and bean on a light wood-panel wall", "steel-acrylic-letters", "Cut-out metal wall sign"),
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
    I("led-halo-letters", "acrylic", "Halo-lit 3D script letters", "d10-halo-letters", 735, 490, "Shop sign idea: glowing cream 3D script lettering with small capitals below, mounted on a dark vertical-slat facade", "acrylic-led-letters", "Halo-lit 3D letters on a slat facade"),
    I("led-cafe-board", "led", "Cafe fascia with glowing letters", "d11-cafe-board", 736, 736, "Shop sign idea: black cafe fascia with softly glowing letters, a coffee-cup symbol and a round hanging sign above a cafe entrance", "led-shop-board", "Backlit cafe fascia and round side sign"),
    I("led-restaurant-board", "led", "Restaurant board with glowing script", "d12-restaurant-board", 900, 720, "Shop sign idea: black restaurant fascia with glowing warm script lettering and a line drawing, with a round side sign and warm light strip", "led-shop-board", "Backlit restaurant fascia"),
    I("led-rathods", "led", "Round backlit plate with Krishna", "d21-rathods", 750, 562, "Name plate idea: round backlit plate with a Krishna figure, a flute, a script name, a house number and a flower border, glowing around the edge", "led-name-plate", "Round plate with edge glow"),
    I("led-gold-3d", "acrylic", "Gold 3D letters with warm backlight", "d22-gold-3d-letters", 736, 736, "Shop sign idea: shiny gold 3D block letters with a leaf symbol and a warm halo glow on a white wall", "acrylic-led-letters", "Gold 3D letters, halo-lit"),
    I("led-glossy-nail", "led", "Round backlit board with crown and neon accents", "d39-glossy-nail", 512, 512, "Shop sign idea: round backlit board with a gold crown, a black hand with pink nails, pink neon hearts and a bow, and the name Glossy Nail", "led-shop-board", "Round backlit shop board with neon accents"),
    I("led-directory", "led", "Backlit directory sign", "d13-backlit-directory", 506, 900, "Sign idea: tall dark rounded board with a warm halo glow, a circular logo and wood-look arrow panels for directions", "led-shop-board", "Backlit directory board"),
    I("ac-beauty-halo", "acrylic", "Round white acrylic sign with gold ring", "d40-beauty-halo", 784, 1056, "Wall sign idea: round white acrylic sign with a gold mirror ring and black 3D lettering on a wood-slat wall", "acrylic-name-plate", "Round acrylic sign with gold mirror ring"),
    I("ac-frosted", "acrylic", "Frosted acrylic lobby sign", "d23-frosted-acrylic", 900, 675, "Office sign idea: frosted acrylic panel on silver standoffs with black raised letters and a leaf logo", "acrylic-name-plate", "Frosted acrylic with raised letters"),
    I("ac-gold-leaf", "acrylic", "Black and gold leaf plate", "d5-priyanka-abhishek", 900, 600, "Name plate idea: black acrylic plate with gold mirror leaf motif and gold script names", "acrylic-name-plate", "Black acrylic with gold lettering"),
    I("ac-arch", "acrylic", "Arch plate with gold vine", "d4-vinay-priyanka", 842, 900, "Name plate idea: matte black arch-shaped plate with gold leaf vine, a house number and two names", "acrylic-name-plate", "Matte black arch plate"),
    I("ac-gold-3d", "acrylic", "Gold 3D letters on black", "d9-nanak", 675, 900, "Name plate idea: matte black plate with raised gold 3D script lettering", "acrylic-name-plate", "Raised gold lettering"),
    I("pl-ganesh-frame", "plates", "Framed backlit plate in Hindi", "d41-ganesh-kunj-frame", 1000, 1000, "Name plate idea: white frosted plate in a dark wood frame with gold corner motifs and Hindi names in gold, glowing softly behind, under a leafy plant", "led-name-plate", "Backlit plate with wood frame and gold corners"),
    I("pl-peacock-stone", "plates", "Peacock cut-out plate on stone", "d42-agarwals-peacock", 736, 685, "Name plate idea: black cut-out frame with a peacock feather corner and a warm backlit panel with a family name and flat number, on a stone wall", "led-name-plate", "Black cut-out frame with warm backlight"),
    I("pl-mandala-black", "plates", "Black and gold mandala plate", "d43-nagpur-mandala", 736, 552, "Name plate idea: black rectangular plate with a gold mandala corner, gold serif lettering and a warm glow around the edge", "led-name-plate", "Black plate with gold lettering and glow"),
    I("pl-oval-leaf", "plates", "Shaped plate with gold leaves", "d44-shivsarman-oval", 939, 630, "Name plate idea: soft-shaped black plate with a gold tree emblem, a lantern, gold leaf vine and script names, with a warm backlight", "led-name-plate", "Shaped black plate with leaf vine and lantern"),
    I("pl-circuit-black", "plates", "Black plate with gold border", "d45-cyber-samanvaya", 939, 630, "Name plate idea: black plate on gold standoffs with a gold curved border, a house emblem and gold lettering with a soft glow at the base", "led-name-plate", "Black plate with gold curve and standoffs"),
    I("pl-stone-villa", "plates", "Backlit stone villa nameboard", "d46-pratap-villa", 736, 981, "Name board idea: textured stone panel in a garden wall with gold script villa name and a warm backlight, lit flower beds below", "led-name-plate", "Backlit nameboard in a garden wall"),
    I("pl-gate-hindi", "plates", "Gate pillar sign with Hindi name", "d47-shivay-gate", 800, 1000, "Gate sign idea: backlit gold Hindi name with a black name plate below it on a white gate pillar, with wall lights and a lit garden", "led-name-plate", "Backlit Hindi name and plate on a gate pillar"),
    I("pl-black-cutout", "plates", "Black cut-out name with halo", "d49-tripathis-cutout", 454, 427, "Name sign idea: black cut-out lettering and a flat number mounted off a white brick wall, with a warm halo glow behind", "led-name-plate", "Cut-out name and flat number with halo glow"),
    I("pl-brass-halo", "plates", "Brass bar with lit letters", "d50-kovraya-brass", 500, 500, "Name plate idea: brushed brass bar with cut-out letters that glow warm white, and a soft glow above and below, on a plaster wall", "led-name-plate", "Brushed brass bar with cut-out lit letters"),
    I("ac-blue-gold", "acrylic", "Blue acrylic with gold frame", "d51-blue-gold-acrylic", 736, 981, "Office plate idea: deep blue acrylic plate with a gold border, gold standoffs, a mountain logo and gold lettering", "acrylic-name-plate", "Blue acrylic plate with gold border and standoffs"),
    I("ac-green-gold", "acrylic", "Green plate with gold script", "d52-longleaf-green-plate", 736, 736, "Clinic sign idea: dark green plate with a gold frame, raised gold script lettering and a small caption, on a stone wall with a warm light above", "acrylic-name-plate", "Dark green plate with gold frame and script"),
    I("ac-visual-backlit", "acrylic", "Clear acrylic with halo glow", "d55-visual-arts-backlit", 736, 801, "Office sign idea: clear acrylic panel on gold standoffs with a black printed logo and a warm halo glow behind", "led-name-plate", "Clear acrylic panel with black logo and warm glow"),
    I("ac-maroon-shaped", "acrylic", "Maroon shaped plate with glow", "d56-maroon-backlit-plate", 800, 1000, "Office plate idea: maroon acrylic cut in a shaped outline with silver studs, white lettering and a warm halo glow", "led-name-plate", "Maroon shaped acrylic with silver studs and halo"),
    I("ac-qr-white", "acrylic", "White acrylic QR stand", "d57-white-acrylic-qr", 1000, 1000, "Table stand idea: white acrylic stand with raised gold social icons and three QR codes on a gold base, on a cafe counter", "acrylic-name-plate", "Table stand with three QR codes and gold icons"),
    I("ac-qr-black", "acrylic", "Black and gold QR stand", "d58-black-gold-qr", 736, 981, "Table stand idea: black acrylic stand on a mirror gold base with gold-framed QR codes for Wi-Fi, Google reviews and Instagram", "acrylic-name-plate", "Black acrylic stand with gold QR frames"),
    I("le-artisan-panel", "acrylic", "Backlit frosted shop panel", "d53-artisans-backlit-panel", 1000, 1000, "Shop sign idea: frosted acrylic panel with a bright warm light frame and black logo lettering, on a brick wall beside a shop window", "led-shop-board", "Frosted acrylic panel with light-frame edge"),
    I("le-restaurant-script", "acrylic", "Halo-lit script with dome", "d59-restaurant-script", 736, 736, "Shop sign idea: glowing amber 3D script lettering with a serving-dome symbol on a dark fascia above a restaurant window", "acrylic-led-letters", "Halo-lit 3D script and cloche on dark fascia"),
    I("le-bakery-3d", "acrylic", "Bakery sign in colourful 3D", "d60-baker-buddy", 723, 1000, "Shop sign idea: bright 3D lettering in blue and yellow with a chef mascot above a bakery entrance, lit by small spotlights", "acrylic-led-letters", "3D bright letters with mascot and spot lights"),
    I("le-yellow-fascia", "led", "Yellow fascia with black letters", "d61-smokz-fascia", 736, 589, "Shop sign idea: bright yellow backlit fascia with bold black lettering and a grill symbol above a glass-front grill restaurant", "led-shop-board", "Yellow backlit board with bold black lettering"),
    I("le-slim-fascia", "led", "Slim black fascia with gold script", "d62-brotherfood", 667, 1000, "Shop sign idea: slim black fascia with gold script lettering and a small menu line above a takeaway counter with wall lights", "led-shop-board", "Black board with gold script and menu line"),
    I("le-wood-bun", "led", "Wood-panel facade with round logo", "d63-good-bun", 668, 1000, "Shop sign idea: vertical wood-slat facade with cream block lettering and a round circular logo sign over the glass door", "led-shop-board", "Vertical wood facade with bold letters and round sign"),
    I("le-cafe-luna", "acrylic", "Cafe letters with soft front glow", "d64-cafe-luna", 721, 490, "Shop sign idea: cream 3D lettering with a soft glow on a dark cafe fascia above lit windows", "acrylic-led-letters", "Cream 3D letters on dark fascia"),
    I("le-couple-script", "acrylic", "Glowing script with hearts", "d65-couple-love-hearts", 736, 736, "Sign idea: glowing amber script lettering with a double heart outline on a grey plank wall", "acrylic-led-letters", "Halo-lit script letters and heart outline"),
    I("le-cloud-script", "acrylic", "Halo-lit script with round logo", "d66-le-petit-nuage", 667, 1000, "Shop sign idea: glowing amber script lettering stacked in two lines under a ring logo with a cloud, on a plain wall with a spotlight", "acrylic-led-letters", "Halo-lit script and ring logo on wall"),
    I("le-green-tea", "acrylic", "Cafe board with green 3D letters", "d67-serenitea", 735, 592, "Shop sign idea: white fascia with deep-green 3D lettering and a leaf in the letters, with a soft halo light, above a tea cafe interior", "acrylic-led-letters", "White board with deep-green halo-lit letters"),
    I("le-ring-logo", "acrylic", "Round logo with halo on dark wall", "d68-logeni-wall", 667, 1000, "Reception wall idea: round logo in gold ring with a warm halo glow on a dark textured wall between two plants", "acrylic-led-letters", "Backlit round logo on a reception wall"),
    I("le-reception-halo", "acrylic", "Backlit logo on reception wall", "d70-lm-studio-halo", 736, 736, "Reception wall idea: black logo letters with a golden crescent and warm halo glow on a beige wall behind a marble desk", "acrylic-led-letters", "Black logo with golden halo behind the desk"),
    I("le-maroon-panel", "led", "Maroon panel with logo above wood slats", "d72-berg-maroon-panel", 800, 1000, "Reception wall idea: maroon board with a gold logo and lettering over a wood-slat wall with a warm light strip, in a waiting area", "led-shop-board", "Maroon board with gold logo, warm slat light"),
    I("le-halo-block", "acrylic", "Big halo-lit block letters", "d73-blackroc-halo", 679, 679, "Building sign idea: big black 3D block letters on a white wall with a soft halo and a light line along the edge, in front of plants", "acrylic-led-letters", "Black 3D block letters with soft halo and edge light"),
    I("lt-satvik-gold", "letters", "Gold 3D Hindi logo on marble", "d48-satvik-kitchen", 736, 920, "Wall sign idea: shiny gold 3D Hindi script with small English lettering on a dark marble feature wall behind a reception desk", "steel-acrylic-letters", "Shiny gold 3D lettering on a stone feature wall"),
    I("lt-mirror-initials", "acrylic", "Mirror gold initials with heart", "d54-mirror-gold-initials", 750, 562, "Gift idea: gold and silver mirror acrylic script initials with a heart and a date, standing on a mirror gold base", "steel-acrylic-letters", "Gold and silver mirror acrylic table piece"),
    I("lt-gold-ring", "letters", "Gold ring with 3D letters", "d69-kylie-lark-ring", 1000, 1000, "Wall sign idea: thin gold ring with raised gold block lettering and a smaller line below, mounted on a dark blue wall", "steel-acrylic-letters", "Gold ring and 3D gold lettering on wall"),
    I("lt-ruth-monogram", "letters", "Gold monogram with small caps", "d71-ruth-services-gold", 667, 1000, "Office wall idea: big gold 3D two-letter monogram with small spaced lettering on a dark wall in a lobby", "steel-acrylic-letters", "Gold 3D monogram on a dark wall"),
    I("pl-lotus-black-gold", "plates", "Black and gold plate with lotus", "d74-lotus-black-gold", 1000, 750, "Name plate idea: black plate with a thin gold border, a gold lotus and gold raised lettering, glowing warmly on a stone wall", "led-name-plate", "Backlit black and gold plate"),
    I("ac-frosted-rose-gold", "acrylic", "Frosted acrylic with rose-gold script", "d75-frosted-rose-gold", 1000, 750, "Name plate idea: frosted white acrylic plate with rose-gold script lettering and a house number on brass standoffs, softly backlit", "acrylic-name-plate", "Frosted acrylic with rose-gold lettering"),
    I("pl-walnut-brass-om", "plates", "Walnut plate with brass Om", "d76-walnut-brass-om", 1000, 750, "Name plate idea: walnut wood plate with a raised brass Om symbol and brass lettering, lit softly from behind", "steel-name-plate", "Walnut and brass plate with Om"),
    I("pl-round-black-gold", "plates", "Round black plate with house icon", "d77-round-black-gold", 900, 900, "Name plate idea: round black plate with a gold ring, a small gold house icon and gold lettering, backlit on a brick wall", "led-name-plate", "Round backlit plate on brick"),
    I("pl-green-arch-gold", "plates", "Green arch plate with gold vine", "d78-green-arch-gold", 750, 1000, "Name plate idea: arch-shaped deep green plate with a gold vine and gold script lettering, warm light glowing behind", "led-name-plate", "Backlit arch plate with gold vine"),
    I("lt-steel-cutout-cement", "letters", "Large steel cut-out letters", "d79-steel-cutout-cement", 1000, 750, "Wall sign idea: big brushed steel cut-out lettering with a house number, softly backlit on a cement wall", "steel-acrylic-letters", "Brushed steel cut-out letters"),
    I("pl-corten-jali", "plates", "Rust steel plate with jali cut-out", "d80-corten-jali", 1000, 750, "Name plate idea: rust-finish steel plate with a laser-cut jali pattern and cut-out lettering on a dark stone gate pillar", "steel-name-plate", "Rust steel plate with jali pattern"),
    I("ac-marble-clinic", "acrylic", "Marble-look clinic plate", "d81-marble-clinic", 1000, 750, "Clinic plate idea: white marble-look acrylic plate with black lettering and a gold edge, mounted on standoffs beside a glass door", "acrylic-name-plate", "Marble-look acrylic clinic plate"),
    I("ac-clear-acrylic-plaque", "acrylic", "Clear acrylic office plaque", "d82-clear-acrylic-plaque", 1000, 750, "Office plate idea: clear acrylic plaque with frosted white lettering held on brass standoffs on a dark grey wall", "acrylic-name-plate", "Clear acrylic plaque on standoffs"),
    I("pl-navy-gate-pillar", "plates", "Navy backlit gate pillar plate", "d83-navy-gate-pillar", 1000, 750, "Gate plate idea: navy blue plate with white lettering and a cool white backlight, mounted on a plastered gate pillar", "led-name-plate", "Backlit navy gate pillar plate"),
    I("ac-blush-qr-stand", "acrylic", "Blush acrylic QR menu stand", "d84-blush-qr-stand", 900, 900, "Table stand idea: blush pink acrylic stand with gold script lettering and a QR code for the menu, on a cafe counter", "acrylic-name-plate", "Blush acrylic QR stand"),
    I("ac-black-review-stand", "acrylic", "Black review QR stand with gold stars", "d85-black-review-stand", 900, 900, "Counter stand idea: black acrylic stand with a gold brass base, five gold stars and a QR code to leave a review, on a salon counter", "acrylic-name-plate", "Black review stand with QR"),
    I("pl-hindi-ganesha-black", "plates", "Black plate with Ganesha and Hindi name", "d86-hindi-ganesha-black", 1000, 750, "Name plate idea: glossy black plate with a gold Ganesha line drawing and a Hindi name in gold, backlit on a stone wall", "led-name-plate", "Backlit plate with Ganesha and Hindi name"),
    I("ac-hindi-white-saffron", "acrylic", "White acrylic with saffron Hindi name", "d87-hindi-white-saffron", 1000, 750, "Name plate idea: white acrylic plate with a large Hindi family name in saffron, a thin saffron border and a warm backlight", "acrylic-name-plate", "White acrylic with saffron Hindi name"),
    I("pl-teak-hanging-bell", "plates", "Hanging teak plate with brass bell", "d88-teak-hanging-bell", 750, 1000, "Name plate idea: tall teak plate hung on brass chains with raised brass lettering and a small brass bell beneath", "steel-name-plate", "Hanging teak plate with bell"),
    I("pl-gate-pillar-two-plate", "plates", "Black pillar plate with brass family plate", "d89-gate-pillar-two-plate", 1000, 750, "Gate plate idea: large black plate with gold lettering and a small brass family plate below, between two wall lights on a stone pillar", "steel-name-plate", "Black plate with brass plate below"),
    I("ac-royal-blue-reception", "acrylic", "Royal blue reception plaque", "d90-royal-blue-reception", 1000, 750, "Office plate idea: royal blue acrylic plaque with gold lettering and a gold line, mounted on standoffs beside a glass door", "acrylic-name-plate", "Blue acrylic reception plaque"),
    I("pl-slate-warm-glow", "plates", "Black slate plate with warm glow", "d91-slate-warm-glow", 1000, 750, "Name plate idea: black slate-look plate with engraved silver lettering and a warm glow along the bottom edge, on a garden wall", "led-name-plate", "Slate-look backlit plate"),
    I("pl-etched-copper", "plates", "Etched copper plate with floral border", "d92-etched-copper", 1000, 750, "Name plate idea: copper-finish plate with an etched floral border and etched lettering, hung beside a lantern on a white wall", "steel-name-plate", "Etched copper plate"),
    I("ac-round-sage-kids", "acrylic", "Round sage green plate with acorns", "d93-round-sage-kids", 900, 900, "Name plate idea: round sage green acrylic plate with white lettering and a small acorn drawing, beside a front door", "acrylic-name-plate", "Round sage acrylic plate"),
    I("ac-edge-lit-clinic", "acrylic", "Edge-lit clear acrylic clinic panel", "d94-edge-lit-clinic", 1000, 750, "Clinic sign idea: clear acrylic panel with a bright white edge light, a tooth logo and teal lettering, mounted on standoffs", "acrylic-name-plate", "Edge-lit clear acrylic panel"),
    I("pl-wood-slat-brass", "plates", "Wood slat panel with brass letters", "d95-wood-slat-brass", 1000, 750, "Name sign idea: wood slat panel with raised brass lettering and warm light between the slats", "led-name-plate", "Wood slats with brass lettering"),
    I("pl-purple-gold-arch", "plates", "Purple and gold arch plate", "d96-purple-gold-arch", 1000, 750, "Name plate idea: royal purple plate with a shaped arch top, gold ornament and gold script lettering on brass standoffs, backlit on a marble wall", "led-name-plate", "Backlit purple and gold arch plate"),
    I("lt-floating-numerals", "letters", "Floating white house numerals", "d97-floating-numerals", 1000, 750, "House number idea: large floating white numerals with a small line of lettering below, softly backlit on a grey wall", "steel-acrylic-letters", "Floating backlit house numerals"),
    I("pl-terracotta-gold-script", "plates", "Terracotta plate with gold script", "d98-terracotta-gold-script", 1000, 750, "Name plate idea: terracotta plate with gold script lettering and a small gold sun motif, on a cream wall in warm light", "steel-name-plate", "Terracotta and gold script plate"),
    I("lb-sweets-script-board", "led", "Glowing script sweet shop board", "d99-sweets-script-board", 1000, 750, "Shop board idea: black fascia with glowing warm white 3D script lettering, a small line below and a gold LED strip underneath, above a lit shop window", "led-shop-board", "Script shop board with LED strip"),
    I("lb-salon-rose-gold-letters", "led", "Salon board with rose-gold letters", "d100-salon-rose-gold-letters", 1000, 750, "Shop board idea: black fascia with soft rose-gold 3D letters and a small line below, over a bright glass salon front", "acrylic-led-letters", "Rose-gold letters on black fascia"),
    I("lb-pharmacy-green-cross", "led", "Pharmacy board with green cross", "d101-pharmacy-green-cross", 1000, 750, "Shop board idea: long white and green backlit board with a green cross and white lettering above a bright glass pharmacy front", "led-shop-board", "Green and white pharmacy board"),
    I("lb-jeweller-maroon-gold", "led", "Jeweller fascia with gold letters", "d102-jeweller-maroon-gold", 1000, 750, "Shop board idea: deep maroon fascia with warm gold 3D letters lit from above, over a glowing jewellery showroom", "acrylic-led-letters", "Gold letters on maroon fascia"),
    I("lb-coffee-blade-fascia", "led", "Cafe fascia with round blade sign", "d103-coffee-blade-fascia", 1000, 750, "Shop board idea: dark fascia with gold lit letters and a round gold-edged hanging blade sign above a warm brick-front cafe", "led-shop-board", "Cafe fascia with hanging blade sign"),
    I("lb-bakery-pink-fascia", "led", "Pink bakery fascia with cupcake", "d104-bakery-pink-fascia", 1000, 750, "Shop board idea: soft pink fascia with cream raised lettering and a small cupcake icon above a striped awning", "led-shop-board", "Pink bakery fascia"),
    I("lb-dental-blue-white", "led", "Blue and white clinic backlit board", "d105-dental-blue-white", 1000, 750, "Clinic board idea: white backlit board with a tooth logo and blue lettering with a blue edge light, above a glass clinic front", "led-shop-board", "Backlit clinic board"),
    I("lb-gym-red-halo", "led", "Red halo-lit gym letters", "d106-gym-red-halo", 1000, 750, "Shop board idea: black facade with red halo-lit letters and a dumbbell icon and a red LED line along the top edge", "acrylic-led-letters", "Red halo-lit gym letters")
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
      '<div class="cw cw-photo' + (i.file.indexOf("i-") === 0 ? " cw-stock" : "") + '"' + (POS[i.file] ? ' style="--pos:' + POS[i.file] + '"' : "") + '><img src="assets/' + (i.file.indexOf("i-") === 0 ? "ideas/" : "designs/") + i.file + '.jpg" alt="' + esc(i.alt) + '" width="' + i.w + '" height="' + i.h + '" loading="lazy" decoding="async"></div>' +
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

  const setFilter = key => {
    if (!cats.some(c => c.key === key)) return;
    filter = key;
    root.querySelectorAll("[data-filter]").forEach(b => b.setAttribute("aria-pressed", String(b.dataset.filter === key)));
    paint();
  };
  /* "See our ... collection" links in the price list open the matching category */
  document.addEventListener("click", e => { const a = e.target.closest("a[data-coll]"); if (a) setFilter(a.dataset.coll); });
  root.addEventListener("click", e => {
    const fb = e.target.closest("[data-filter]");
    if (fb) { setFilter(fb.dataset.filter); return; }
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
