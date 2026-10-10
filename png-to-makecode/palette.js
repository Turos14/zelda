// Palette par défaut de MakeCode Arcade (16 couleurs).
// L'index 0 est toujours transparent dans le moteur, quelle que soit sa couleur ici :
// on ne le propose donc jamais comme correspondance de couleur, seul le canal alpha y mène.
const MAKECODE_PALETTE = [
    { hex: ".", rgb: [0, 0, 0] },       // 0 transparent (MakeCode utilise "." plutôt que "0")
    { hex: "1", rgb: [255, 255, 255] }, // blanc
    { hex: "2", rgb: [255, 33, 33] },   // rouge
    { hex: "3", rgb: [255, 147, 196] }, // rose
    { hex: "4", rgb: [255, 129, 53] },  // orange
    { hex: "5", rgb: [255, 246, 9] },   // jaune
    { hex: "6", rgb: [36, 156, 163] },  // bleu sarcelle
    { hex: "7", rgb: [120, 220, 82] },  // vert
    { hex: "8", rgb: [0, 63, 173] },    // bleu
    { hex: "9", rgb: [135, 242, 255] }, // bleu clair
    { hex: "a", rgb: [142, 46, 196] },  // violet
    { hex: "b", rgb: [164, 131, 159] }, // mauve clair
    { hex: "c", rgb: [92, 64, 108] },   // violet foncé
    { hex: "d", rgb: [229, 205, 196] }, // beige
    { hex: "e", rgb: [145, 70, 61] },   // marron
    { hex: "f", rgb: [0, 0, 0] },       // noir
];

function nearestPaletteIndex(r, g, b) {
    let best = 1;
    let bestDist = Infinity;
    for (let i = 1; i < MAKECODE_PALETTE.length; i++) {
        const [pr, pg, pb] = MAKECODE_PALETTE[i].rgb;
        const dr = r - pr, dg = g - pg, db = b - pb;
        const dist = dr * dr + dg * dg + db * db;
        if (dist < bestDist) {
            bestDist = dist;
            best = i;
        }
    }
    return best;
}
