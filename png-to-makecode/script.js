const dropzone = document.getElementById("dropzone");
const dropzoneText = document.getElementById("dropzoneText");
const fileInput = document.getElementById("fileInput");
const optionsSection = document.getElementById("options");
const previewSection = document.getElementById("previewSection");
const outputSectionImg = document.getElementById("outputSectionImg");
const outputSectionTilemap = document.getElementById("outputSectionTilemap");

const modeToggle = document.getElementById("modeToggle");
const subtitleImg = document.getElementById("subtitleImg");
const subtitleTilemap = document.getElementById("subtitleTilemap");
const tilemapSubToggle = document.getElementById("tilemapSubToggle");
const tilemapFiles = document.getElementById("tilemapFiles");
const jresDropzone = document.getElementById("jresDropzone");
const jresDropzoneText = document.getElementById("jresDropzoneText");
const jresInput = document.getElementById("jresInput");
const tsDropzone = document.getElementById("tsDropzone");
const tsDropzoneText = document.getElementById("tsDropzoneText");
const tsInput = document.getElementById("tsInput");

const assetNameLabel = document.getElementById("assetNameLabel");
const assetNameInput = document.getElementById("assetName");
const optAssetName = document.getElementById("optAssetName");
const optMapName = document.getElementById("optMapName");
const mapNameInput = document.getElementById("mapName");
const aliasNameInput = document.getElementById("aliasName");
const outputFormatSelect = document.getElementById("outputFormat");
const spacedSelect = document.getElementById("spaced");
const thresholdInput = document.getElementById("threshold");
const thresholdValue = document.getElementById("thresholdValue");
const targetWidthInput = document.getElementById("targetWidth");
const targetWidthLabel = document.getElementById("targetWidthLabel");
const tileScaleSelect = document.getElementById("tileScale");
const maxTileLengthInput = document.getElementById("maxTileLength");
const dimsInfo = document.getElementById("dimsInfo");

const optAlias = document.getElementById("optAlias");
const optFormat = document.getElementById("optFormat");
const optSpaced = document.getElementById("optSpaced");
const optTargetWidth = document.getElementById("optTargetWidth");
const optTileScale = document.getElementById("optTileScale");
const optMaxTileLength = document.getElementById("optMaxTileLength");

const originalCanvas = document.getElementById("originalCanvas");
const resultCanvas = document.getElementById("resultCanvas");
const outputCode = document.getElementById("outputCode");
const copyBtn = document.getElementById("copyBtn");

const outputJres = document.getElementById("outputJres");
const outputTs = document.getElementById("outputTs");
const copyJresBtn = document.getElementById("copyJresBtn");
const copyTsBtn = document.getElementById("copyTsBtn");
const tilemapStatus = document.getElementById("tilemapStatus");

const DEFAULT_MAX_TILE_LENGTH = 64; // valeur de repli si le champ "longueur max en tuiles" est vide/invalide
const MAX_TILESET_SIZE = 256; // limite MakeCode : 1 octet/case -> 256 entrées de tileset max par tuilemap (index 0 = transparence)
// MakeCode (tiles.isWall) lit un mur quand le pixel de l'image de légende vaut 2 ; le convertisseur ne sait pas déduire
// quelles tuiles doivent bloquer, donc par défaut aucune case n'est un mur (0) — à définir ensuite à la main dans l'éditeur MakeCode
const DEFAULT_WALL_VALUE = 0;
// octet de version présent en tête des données de tuilemap dans le .jres (confirmé sur plusieurs tuilemaps réels du projet),
// mais absent du buffer hex`` compilé dans le .ts : sans ce décalage, largeur/hauteur et toutes les cases sont lues avec 1 octet de trop
const TILEMAP_JRES_VERSION_BYTE = 0x10;

let sourceImage = null; // HTMLImageElement courant
let mode = "img"; // "img" | "tilemap"
let tilemapSubMode = "tile"; // "tile" | "map"
let tilemapJresText = null;
let tilemapTsText = null;

function wireDropzone(zoneEl, inputEl, onFile) {
    zoneEl.addEventListener("click", () => inputEl.click());
    inputEl.addEventListener("change", () => onFile(inputEl.files[0]));
    ["dragenter", "dragover"].forEach(evt => {
        zoneEl.addEventListener(evt, (e) => {
            e.preventDefault();
            zoneEl.classList.add("dragover");
        });
    });
    ["dragleave", "drop"].forEach(evt => {
        zoneEl.addEventListener(evt, (e) => {
            e.preventDefault();
            zoneEl.classList.remove("dragover");
        });
    });
    zoneEl.addEventListener("drop", (e) => {
        e.preventDefault();
        onFile(e.dataTransfer.files[0]);
    });
}

function loadFile(file) {
    if (!file || !file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
            sourceImage = img;
            dropzoneText.textContent = file.name;
            optionsSection.hidden = false;
            previewSection.hidden = false;
            render();
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

function loadTextFile(file, onLoaded) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => onLoaded(e.target.result, file.name);
    reader.readAsText(file);
}

wireDropzone(dropzone, fileInput, loadFile);

wireDropzone(jresDropzone, jresInput, (file) => {
    if (!file) return;
    loadTextFile(file, (text) => {
        tilemapJresText = text;
        jresDropzoneText.textContent = file.name;
        jresDropzone.classList.add("filled");
        render();
    });
});

wireDropzone(tsDropzone, tsInput, (file) => {
    if (!file) return;
    loadTextFile(file, (text) => {
        tilemapTsText = text;
        tsDropzoneText.textContent = file.name;
        tsDropzone.classList.add("filled");
        render();
    });
});

modeToggle.querySelectorAll(".mode-btn").forEach(btn => {
    btn.addEventListener("click", () => setMode(btn.dataset.mode));
});
tilemapSubToggle.querySelectorAll(".mode-btn").forEach(btn => {
    btn.addEventListener("click", () => setTilemapSubMode(btn.dataset.submode));
});

function updateOptionVisibility() {
    const isTilemap = mode === "tilemap";
    const isMap = isTilemap && tilemapSubMode === "map";
    optAlias.hidden = isTilemap;
    optFormat.hidden = isTilemap;
    optSpaced.hidden = isTilemap;
    optTargetWidth.hidden = isTilemap && !isMap;
    optTileScale.hidden = !isTilemap;
    optAssetName.hidden = isMap;
    optMapName.hidden = !isMap;
    optMaxTileLength.hidden = !isMap;
    assetNameLabel.textContent = isTilemap ? "Nom affiché de la tuile (displayName, optionnel)" : "Nom de l'asset";
    targetWidthLabel.textContent = isMap
        ? "Largeur cible en px (optionnel, redimensionne toute la carte proportionnellement avant découpe)"
        : "Largeur cible en px (optionnel, redimensionne sans flou)";
}

function setMode(newMode) {
    mode = newMode;
    modeToggle.querySelectorAll(".mode-btn").forEach(btn => {
        btn.classList.toggle("active", btn.dataset.mode === mode);
    });
    const isTilemap = mode === "tilemap";
    subtitleImg.hidden = isTilemap;
    subtitleTilemap.hidden = !isTilemap;
    tilemapFiles.hidden = !isTilemap;
    tilemapSubToggle.hidden = !isTilemap;
    updateOptionVisibility();
    render();
}

function setTilemapSubMode(sub) {
    tilemapSubMode = sub;
    tilemapSubToggle.querySelectorAll(".mode-btn").forEach(btn => {
        btn.classList.toggle("active", btn.dataset.submode === sub);
    });
    updateOptionVisibility();
    render();
}

[assetNameInput, aliasNameInput, outputFormatSelect, spacedSelect, targetWidthInput, mapNameInput, maxTileLengthInput].forEach(el => {
    el.addEventListener("input", render);
});
tileScaleSelect.addEventListener("change", render);
thresholdInput.addEventListener("input", () => {
    thresholdValue.textContent = thresholdInput.value;
    render();
});

function getSourcePixels() {
    const natW = sourceImage.naturalWidth;
    const natH = sourceImage.naturalHeight;

    // dessine l'original pour l'aperçu de gauche, mis à l'échelle pour rester lisible
    const previewScale = Math.max(1, Math.floor(Math.min(320 / natW, 320 / natH)));
    originalCanvas.width = natW * previewScale;
    originalCanvas.height = natH * previewScale;
    const octx = originalCanvas.getContext("2d");
    octx.imageSmoothingEnabled = false;
    octx.drawImage(sourceImage, 0, 0, natW * previewScale, natH * previewScale);

    // redimensionnement avant quantification : taille carrée fixe pour une tuile,
    // sinon largeur cible optionnelle (sans flou, plus proche voisin) en conservant le ratio
    let w, h;
    if (mode === "tilemap") {
        w = h = parseInt(tileScaleSelect.value, 10);
    } else {
        w = natW;
        h = natH;
        const targetWidthRaw = targetWidthInput.value.trim();
        if (targetWidthRaw) {
            const tw = parseInt(targetWidthRaw, 10);
            if (tw > 0) {
                w = tw;
                h = Math.max(1, Math.round(natH * (tw / natW)));
            }
        }
    }

    const work = document.createElement("canvas");
    work.width = w;
    work.height = h;
    const wctx = work.getContext("2d");
    wctx.imageSmoothingEnabled = false;
    wctx.drawImage(sourceImage, 0, 0, w, h);

    return wctx.getImageData(0, 0, w, h);
}

// redimensionne l'image source à un multiple exact de la taille de tuile (aucune déformation en carré,
// contrairement à getSourcePixels : une carte garde ses proportions, l'excédent en bord est simplement rogné)
function getFullMapPixels(tileSize) {
    const natW = sourceImage.naturalWidth;
    const natH = sourceImage.naturalHeight;

    const previewScale = Math.max(1, Math.floor(Math.min(320 / natW, 320 / natH)));
    originalCanvas.width = natW * previewScale;
    originalCanvas.height = natH * previewScale;
    const octx = originalCanvas.getContext("2d");
    octx.imageSmoothingEnabled = false;
    octx.drawImage(sourceImage, 0, 0, natW * previewScale, natH * previewScale);

    // largeur cible optionnelle : redimensionne toute la carte proportionnellement (comme en mode Image)
    // avant de la découper en tuiles ; la hauteur suit le même ratio que l'image d'origine
    let targetW = natW, targetH = natH;
    const targetWidthRaw = targetWidthInput.value.trim();
    if (targetWidthRaw) {
        const tw = parseInt(targetWidthRaw, 10);
        if (tw > 0) {
            targetW = tw;
            targetH = Math.max(1, Math.round(natH * (tw / natW)));
        }
    }

    const cols = Math.floor(targetW / tileSize);
    const rows = Math.floor(targetH / tileSize);

    if (cols === 0 || rows === 0) {
        return { cols, rows, w: 0, h: 0, imageData: null };
    }

    const w = cols * tileSize;
    const h = rows * tileSize;
    const work = document.createElement("canvas");
    work.width = w;
    work.height = h;
    const wctx = work.getContext("2d");
    wctx.imageSmoothingEnabled = false;
    wctx.drawImage(sourceImage, 0, 0, w, h);

    return { cols, rows, w, h, imageData: wctx.getImageData(0, 0, w, h) };
}

function extractTileBlock(flatGrid, tileSize, col, row) {
    const block = [];
    for (let y = 0; y < tileSize; y++) {
        block.push(flatGrid[row * tileSize + y].slice(col * tileSize, col * tileSize + tileSize));
    }
    return block;
}

function quantize(imageData, alphaThreshold) {
    const { width, height, data } = imageData;
    const grid = [];
    for (let y = 0; y < height; y++) {
        const row = [];
        for (let x = 0; x < width; x++) {
            const i = (y * width + x) * 4;
            const a = data[i + 3];
            if (a < alphaThreshold) {
                row.push(0);
            } else {
                row.push(nearestPaletteIndex(data[i], data[i + 1], data[i + 2]));
            }
        }
        grid.push(row);
    }
    return { width, height, grid };
}

function drawResultPreview(quantized) {
    const { width, height, grid } = quantized;
    const maxDim = 320;
    const scale = Math.max(1, Math.floor(Math.min(maxDim / width, maxDim / height)));

    resultCanvas.width = width * scale;
    resultCanvas.height = height * scale;
    const ctx = resultCanvas.getContext("2d");
    ctx.imageSmoothingEnabled = false;

    // damier pour visualiser la transparence
    const checker = ["#3a3f4b", "#2c303a"];
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const idx = grid[y][x];
            if (idx === 0) {
                ctx.fillStyle = checker[(x + y) % 2];
            } else {
                const [r, g, b] = MAKECODE_PALETTE[idx].rgb;
                ctx.fillStyle = `rgb(${r},${g},${b})`;
            }
            ctx.fillRect(x * scale, y * scale, scale, scale);
        }
    }
}

function buildCode(quantized) {
    const { grid } = quantized;
    const spaced = spacedSelect.value === "spaced";
    const rows = grid.map(row => {
        const chars = row.map(idx => MAKECODE_PALETTE[idx].hex);
        return spaced ? chars.join(" ") : chars.join("");
    });

    const body = "img`\n" + rows.join("\n") + "\n`";
    const name = assetNameInput.value.trim() || "monImage";
    const alias = aliasNameInput.value.trim();

    switch (outputFormatSelect.value) {
        case "const":
            return `const ${name} = ${body}`;
        case "raw":
            return body;
        case "case":
        default: {
            const caseLines = alias
                ? `case "${name}":\n            case "${alias}":return ${body};`
                : `case "${name}":return ${body};`;
            return caseLines;
        }
    }
}

// --- Format binaire MakeCode pour une tuile individuelle (image/x-mkcd-f4) ---
// en-tête : magic 0x87, format 0x04 (4 bits/pixel), largeur (LE16), hauteur (LE16), réservé (2 octets)
// puis les pixels, 2 par octet (nibble bas = x pair, nibble haut = x impair), ligne par ligne

function packTileBuffer(quantized) {
    const { width, height, grid } = quantized;
    const rowBytes = Math.ceil(width / 2);
    const buf = new Uint8Array(8 + rowBytes * height);
    buf[0] = 0x87;
    buf[1] = 0x04;
    buf[2] = width & 0xff;
    buf[3] = (width >> 8) & 0xff;
    buf[4] = height & 0xff;
    buf[5] = (height >> 8) & 0xff;
    buf[6] = 0;
    buf[7] = 0;

    let o = 8;
    for (let y = 0; y < height; y++) {
        for (let bx = 0; bx < rowBytes; bx++) {
            const x0 = bx * 2;
            const x1 = x0 + 1;
            const lo = grid[y][x0] & 0xf;
            const hi = x1 < width ? (grid[y][x1] & 0xf) : 0;
            buf[o++] = lo | (hi << 4);
        }
    }

    let binary = "";
    for (let i = 0; i < buf.length; i++) binary += String.fromCharCode(buf[i]);
    return btoa(binary);
}

function decodeTileBase64ToGrid(base64Data) {
    const binary = atob(base64Data);
    const buf = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) buf[i] = binary.charCodeAt(i);
    const width = buf[2] | (buf[3] << 8);
    const height = buf[4] | (buf[5] << 8);
    const rowBytes = Math.ceil(width / 2);
    const grid = [];
    for (let y = 0; y < height; y++) {
        const row = [];
        for (let x = 0; x < width; x++) {
            const byte = buf[8 + y * rowBytes + (x >> 1)];
            row.push(x % 2 === 0 ? (byte & 0xf) : ((byte >> 4) & 0xf));
        }
        grid.push(row);
    }
    return { width, height, grid };
}

function gridHash(grid) {
    return grid.map(row => row.join(",")).join("|");
}

function bytesToHex(bytes) {
    let s = "";
    for (let i = 0; i < bytes.length; i++) s += bytes[i].toString(16).padStart(2, "0");
    return s;
}

function tileScaleEnumName(tileSize) {
    return tileSize === 8 ? "Eight" : tileSize === 32 ? "ThirtyTwo" : "Sixteen";
}

function findExistingTileMeta(jresObj) {
    for (const key of Object.keys(jresObj)) {
        const entry = jresObj[key];
        if (entry && typeof entry === "object" && entry.tilemapTile) {
            const dot = key.lastIndexOf(".");
            const namespace = dot >= 0 ? key.slice(0, dot + 1) : "";
            return { namespace, mimeType: entry.mimeType || "image/x-mkcd-f4" };
        }
    }
    return { namespace: "myTiles.", mimeType: "image/x-mkcd-f4" };
}

function buildTileLibrary(jresObj, tileSize) {
    const library = new Map(); // hash -> clé complète (ex: "myTiles.tile8")
    let transparencyKey = null;
    for (const key of Object.keys(jresObj)) {
        const entry = jresObj[key];
        if (entry && typeof entry === "object" && entry.tilemapTile && entry.dataEncoding === "base64") {
            let decoded;
            try {
                decoded = decodeTileBase64ToGrid(entry.data);
            } catch (e) {
                continue;
            }
            if (decoded.width !== tileSize || decoded.height !== tileSize) continue;
            const hash = gridHash(decoded.grid);
            if (!library.has(hash)) library.set(hash, key);
            if (!transparencyKey && decoded.grid.every(row => row.every(v => v === 0))) {
                transparencyKey = key;
            }
        }
    }
    return { library, transparencyKey };
}

function nextTileNumber(jresObj, tsText) {
    let max = 0;
    for (const key of Object.keys(jresObj)) {
        const m = key.match(/tile(\d+)$/);
        if (m) max = Math.max(max, parseInt(m[1], 10));
    }
    const re = /export const tile(\d+)\s*=\s*image\.ofBuffer/g;
    let m;
    while ((m = re.exec(tsText))) {
        max = Math.max(max, parseInt(m[1], 10));
    }
    return max + 1;
}

// insère de nouvelles entrées de tuiles juste après la dernière tuile existante (ou en tête s'il n'y en a aucune)
function insertEntriesAfterLastTile(jresObj, newEntries) {
    if (newEntries.length === 0) return jresObj;
    const keys = Object.keys(jresObj);
    let lastTileIdx = -1;
    keys.forEach((k, i) => {
        if (jresObj[k] && typeof jresObj[k] === "object" && jresObj[k].tilemapTile) lastTileIdx = i;
    });
    if (lastTileIdx === -1) {
        const ordered = {};
        newEntries.forEach(([k, v]) => (ordered[k] = v));
        keys.forEach(k => (ordered[k] = jresObj[k]));
        return ordered;
    }
    const result = {};
    keys.forEach((k, i) => {
        result[k] = jresObj[k];
        if (i === lastTileIdx) newEntries.forEach(([nk, nv]) => (result[nk] = nv));
    });
    return result;
}

function insertTsTileExports(tsText, tileKeySuffixes) {
    if (tileKeySuffixes.length === 0) return tsText;
    const blockRe = /( *)\/\/% fixedInstance jres blockIdentity=images\._tile\r?\n( *)export const \w+ = image\.ofBuffer\(hex``\);/g;
    let lastMatch = null;
    let m;
    while ((m = blockRe.exec(tsText))) lastMatch = m;
    if (!lastMatch) return null;

    const commentIndent = lastMatch[1];
    const exportIndent = lastMatch[2];
    const insertPos = lastMatch.index + lastMatch[0].length;
    const blocks = tileKeySuffixes
        .map(suffix => `\n${commentIndent}//% fixedInstance jres blockIdentity=images._tile\n${exportIndent}export const ${suffix} = image.ofBuffer(hex\`\`);`)
        .join("");
    return tsText.slice(0, insertPos) + blocks + tsText.slice(insertPos);
}

function insertTsTilemapCases(tsText, caseBlocks) {
    if (caseBlocks.length === 0) return tsText;
    const re = /TileScale\.(Eight|Sixteen|ThirtyTwo)\s*\)\s*;/g;
    let lastMatch = null;
    let m;
    while ((m = re.exec(tsText))) lastMatch = m;
    if (!lastMatch) return null;
    const insertPos = lastMatch.index + lastMatch[0].length;
    const text = caseBlocks.map(b => "\n" + b).join("");
    return tsText.slice(0, insertPos) + text + tsText.slice(insertPos);
}

function setTilemapStatus(text, isWarning) {
    tilemapStatus.textContent = text;
    tilemapStatus.classList.toggle("warning", !!isWarning);
}

function renderImgMode() {
    const imageData = getSourcePixels();
    const quantized = quantize(imageData, parseInt(thresholdInput.value, 10));
    drawResultPreview(quantized);
    outputCode.value = buildCode(quantized);
    dimsInfo.textContent = `${quantized.width} × ${quantized.height} px`;
}

// --- mode Tuilemap : "Nouvelle tuile" (une image -> une tuile ajoutée aux fichiers existants) ---

function renderTilemapTileMode() {
    const imageData = getSourcePixels();
    const quantized = quantize(imageData, parseInt(thresholdInput.value, 10));
    drawResultPreview(quantized);
    dimsInfo.textContent = `${quantized.width} × ${quantized.height} px`;

    if (!tilemapJresText || !tilemapTsText) {
        setTilemapStatus("Dépose aussi tilemap.g.jres et tilemap.g.ts (les fichiers existants de ton projet) pour générer le code mis à jour.", true);
        outputJres.value = "";
        outputTs.value = "";
        return;
    }

    let jresObj;
    try {
        jresObj = JSON.parse(tilemapJresText);
    } catch (err) {
        setTilemapStatus("tilemap.g.jres invalide : " + err.message, true);
        outputJres.value = "";
        outputTs.value = "";
        return;
    }

    const { namespace, mimeType } = findExistingTileMeta(jresObj);
    const tileNumber = nextTileNumber(jresObj, tilemapTsText);
    const tileKeySuffix = "tile" + tileNumber;
    const fullKey = namespace + tileKeySuffix;
    const displayName = assetNameInput.value.trim();
    const base64Data = packTileBuffer(quantized);

    const newEntry = {
        id: fullKey,
        data: base64Data,
        dataEncoding: "base64",
        namespace: namespace,
        mimeType: mimeType,
        tilemapTile: true,
        displayName: displayName || tileKeySuffix,
    };

    outputJres.value = JSON.stringify(insertEntriesAfterLastTile(jresObj, [[fullKey, newEntry]]), null, 4);

    const newTs = insertTsTileExports(tilemapTsText, [tileKeySuffix]);
    if (newTs === null) {
        setTilemapStatus(
            `Tuile "${fullKey}" ajoutée au .jres, mais je n'ai pas trouvé où l'insérer dans le .ts : ajoute à la main, dans le namespace ${namespace.replace(/\.$/, "")}, un bloc "//% fixedInstance jres blockIdentity=images._tile" suivi de "export const ${tileKeySuffix} = image.ofBuffer(hex\`\`);".`,
            true
        );
        outputTs.value = tilemapTsText;
    } else {
        setTilemapStatus(`Nouvelle tuile "${fullKey}" ajoutée (displayName : "${displayName || tileKeySuffix}").`, false);
        outputTs.value = newTs;
    }
}

// --- mode Tuilemap : "Carte complète" (découpe l'image en tuiles, réutilise/complète le tileset, génère le tuilemap) ---

// ne compte que les tuiles non transparentes : l'index 0 (transparence) occupe toujours une place à part
// dans le tileset de la région, donc le vrai budget disponible pour le reste est MAX_TILESET_SIZE - 1
function countDistinctNonTransparentTiles(blockHashes, transparentHash, r0, r1, c0, c1) {
    const set = new Set();
    for (let r = r0; r < r1; r++) {
        for (let c = c0; c < c1; c++) {
            const h = blockHashes[r][c];
            if (h !== transparentHash) set.add(h);
        }
    }
    return set.size;
}

// découpe récursivement la carte en régions qui respectent à la fois la longueur max en tuiles (largeur/hauteur,
// le critère choisi par l'utilisateur) et la vraie limite MakeCode de 256 tuiles distinctes par tuilemap : au-delà,
// les index de tuiles dépasseraient 255 et l'écriture dans le buffer Uint8Array boucle silencieusement (les index
// débordants retombent sur 0-255), ce qui corrompt la carte sans erreur visible. On coupe la plus grande dimension
// en deux tant qu'une des deux limites est dépassée.
function splitRegion(blockHashes, transparentHash, r0, r1, c0, c1, maxLength) {
    const height = r1 - r0;
    const width = c1 - c0;
    const withinLength = height <= maxLength && width <= maxLength;
    const withinTileBudget = countDistinctNonTransparentTiles(blockHashes, transparentHash, r0, r1, c0, c1) <= MAX_TILESET_SIZE - 1;
    if ((withinLength && withinTileBudget) || (height <= 1 && width <= 1)) {
        return [{ r0, r1, c0, c1 }];
    }
    if (height >= width && height > 1) {
        const rmid = r0 + Math.ceil(height / 2);
        return [
            ...splitRegion(blockHashes, transparentHash, r0, rmid, c0, c1, maxLength),
            ...splitRegion(blockHashes, transparentHash, rmid, r1, c0, c1, maxLength),
        ];
    }
    const cmid = c0 + Math.ceil(width / 2);
    return [
        ...splitRegion(blockHashes, transparentHash, r0, r1, c0, cmid, maxLength),
        ...splitRegion(blockHashes, transparentHash, r0, r1, cmid, c1, maxLength),
    ];
}

function buildLegendRows(cols, rows, value) {
    const ch = MAKECODE_PALETTE[value].hex;
    const rowsOut = [];
    for (let r = 0; r < rows; r++) {
        rowsOut.push(new Array(cols).fill(ch).join(" ") + " ");
    }
    return rowsOut;
}

function getMaxTileLength() {
    const v = parseInt(maxTileLengthInput.value, 10);
    return v && v >= 1 ? v : DEFAULT_MAX_TILE_LENGTH;
}

function uniqueTopLevelKey(jresObj, baseSlug) {
    if (!jresObj[baseSlug]) return baseSlug;
    let n = 2;
    while (jresObj[baseSlug + n]) n++;
    return baseSlug + n;
}

function renderTilemapMapMode() {
    const tileSize = parseInt(tileScaleSelect.value, 10);
    const { cols, rows, w, h, imageData } = getFullMapPixels(tileSize);

    if (cols === 0 || rows === 0) {
        dimsInfo.textContent = "";
        setTilemapStatus(`L'image doit faire au moins ${tileSize} × ${tileSize} px (taille de tuile choisie).`, true);
        outputJres.value = "";
        outputTs.value = "";
        return;
    }

    dimsInfo.textContent = `${sourceImage.naturalWidth} × ${sourceImage.naturalHeight} px → ${cols} × ${rows} tuiles (${w} × ${h} px utilisés)`;

    const alphaThreshold = parseInt(thresholdInput.value, 10);
    const flat = quantize(imageData, alphaThreshold);
    drawResultPreview(flat);

    if (!tilemapJresText || !tilemapTsText) {
        setTilemapStatus("Dépose aussi tilemap.g.jres et tilemap.g.ts existants pour générer la carte.", true);
        outputJres.value = "";
        outputTs.value = "";
        return;
    }

    let jresObj;
    try {
        jresObj = JSON.parse(tilemapJresText);
    } catch (err) {
        setTilemapStatus("tilemap.g.jres invalide : " + err.message, true);
        outputJres.value = "";
        outputTs.value = "";
        return;
    }

    const { namespace } = findExistingTileMeta(jresObj);
    const { library, transparencyKey } = buildTileLibrary(jresObj, tileSize);

    const transparentGrid = Array.from({ length: tileSize }, () => new Array(tileSize).fill(0));
    const transparentHash = gridHash(transparentGrid);

    // découpe l'image aplatie en blocs de tileSize x tileSize et repère les blocs uniques
    const blockHashes = [];
    const blockGridByHash = new Map();
    for (let r = 0; r < rows; r++) {
        const hashRow = [];
        for (let c = 0; c < cols; c++) {
            const block = extractTileBlock(flat.grid, tileSize, c, r);
            const hash = gridHash(block);
            hashRow.push(hash);
            if (!blockGridByHash.has(hash)) blockGridByHash.set(hash, block);
        }
        blockHashes.push(hashRow);
    }

    let nextNum = nextTileNumber(jresObj, tilemapTsText);
    const newTileTsSuffixes = [];
    const newTileJresEntries = [];
    const hashToFullKey = new Map();
    let reusedCount = 0;

    for (const [hash, block] of blockGridByHash) {
        if (hash === transparentHash) continue;
        const existing = library.get(hash);
        if (existing) {
            hashToFullKey.set(hash, existing);
            reusedCount++;
            continue;
        }
        const tileKeySuffix = "tile" + nextNum;
        nextNum++;
        const fullKey = namespace + tileKeySuffix;
        const base64Data = packTileBuffer({ width: tileSize, height: tileSize, grid: block });
        newTileJresEntries.push([fullKey, {
            id: fullKey,
            data: base64Data,
            dataEncoding: "base64",
            namespace: namespace,
            mimeType: "image/x-mkcd-f4",
            tilemapTile: true,
            displayName: tileKeySuffix,
        }]);
        newTileTsSuffixes.push(tileKeySuffix);
        hashToFullKey.set(hash, fullKey);
    }

    // la tuile transparente (index 0 du tileset) : réutilisée si le projet en a déjà une, sinon créée
    let transparencyFullKey = transparencyKey;
    if (!transparencyFullKey) {
        const tileKeySuffix = "tile" + nextNum;
        nextNum++;
        transparencyFullKey = namespace + tileKeySuffix;
        const base64Data = packTileBuffer({ width: tileSize, height: tileSize, grid: transparentGrid });
        newTileJresEntries.push([transparencyFullKey, {
            id: transparencyFullKey,
            data: base64Data,
            dataEncoding: "base64",
            namespace: namespace,
            mimeType: "image/x-mkcd-f4",
            tilemapTile: true,
            displayName: "transparency" + tileSize,
        }]);
        newTileTsSuffixes.push(tileKeySuffix);
    }
    hashToFullKey.set(transparentHash, transparencyFullKey);

    const maxTileLength = getMaxTileLength();
    const regions = splitRegion(blockHashes, transparentHash, 0, rows, 0, cols, maxTileLength);

    const baseName = (mapNameInput.value.trim() || "maCarte").replace(/\s+/g, "_");
    const enumName = tileScaleEnumName(tileSize);

    let jresResult = insertEntriesAfterLastTile(jresObj, newTileJresEntries);
    const mapTsCaseBlocks = [];
    const mapNames = [];
    const oversizedTilesets = [];

    regions.forEach((region, idx) => {
        const chunkCols = region.c1 - region.c0; // étendue en x dans l'image source
        const chunkRows = region.r1 - region.r0; // étendue en y dans l'image source
        // pas de rotation : la grille MakeCode garde la même orientation que l'image source
        // (col = x, row = y, comme tiles.createTilemap/TileMapData.getTile le lisent réellement).
        const mapWidth = chunkCols;
        const mapHeight = chunkRows;
        const localTileset = [transparencyFullKey];
        const localIndex = new Map([[transparentHash, 0]]);
        const indexGrid = new Uint8Array(mapWidth * mapHeight);

        let p = 0;
        for (let r = region.r0; r < region.r1; r++) {
            for (let c = region.c0; c < region.c1; c++) {
                const hash = blockHashes[r][c];
                let li = localIndex.get(hash);
                if (li === undefined) {
                    li = localTileset.length;
                    localTileset.push(hashToFullKey.get(hash));
                    localIndex.set(hash, li);
                }
                indexGrid[p++] = li;
            }
        }

        const wallBytesLen = Math.ceil(indexGrid.length / 2);
        const buf = new Uint8Array(4 + indexGrid.length + wallBytesLen);
        buf[0] = mapWidth & 0xff;
        buf[1] = (mapWidth >> 8) & 0xff;
        buf[2] = mapHeight & 0xff;
        buf[3] = (mapHeight >> 8) & 0xff;
        let o = 4;
        for (let i = 0; i < indexGrid.length; i++) buf[o++] = indexGrid[i];
        const wallByte = DEFAULT_WALL_VALUE | (DEFAULT_WALL_VALUE << 4);
        for (let i = 0; i < wallBytesLen; i++) buf[o++] = wallByte;

        // le buffer hex`` du .ts n'a pas l'octet de version ; le .jres si (voir TILEMAP_JRES_VERSION_BYTE)
        const hexString = bytesToHex(buf);
        const dataBase64 = btoa(TILEMAP_JRES_VERSION_BYTE.toString(16).padStart(2, "0") + hexString);

        const slug = regions.length > 1 ? `${baseName}_${idx + 1}` : baseName;
        const mapKey = uniqueTopLevelKey(jresResult, slug);
        mapNames.push(mapKey);

        // le format MakeCode stocke l'index de tuile sur 1 octet (0-255) : au-delà, la tuilemap serait corrompue.
        // avec un découpage par longueur (et non plus par nombre de tuiles distinctes), ce cas n'est plus exclu d'office.
        if (localTileset.length > MAX_TILESET_SIZE) {
            oversizedTilesets.push({ mapKey, count: localTileset.length });
        }

        jresResult = {
            ...jresResult,
            [mapKey]: {
                id: mapKey,
                data: dataBase64,
                dataEncoding: "base64",
                namespace: namespace,
                mimeType: "application/mkcd-tilemap",
                displayName: mapKey,
                tileset: localTileset,
            },
        };

        const legendRows = buildLegendRows(mapWidth, mapHeight, DEFAULT_WALL_VALUE);
        mapTsCaseBlocks.push(
            `            case "${mapKey}":return tiles.createTilemap(hex\`${hexString}\`, img\`\n${legendRows.join("\n")}\n\`, [${localTileset.join(",")}], TileScale.${enumName});`
        );
    });

    outputJres.value = JSON.stringify(jresResult, null, 4);

    let newTs = insertTsTileExports(tilemapTsText, newTileTsSuffixes);
    if (newTs === null) {
        setTilemapStatus("Impossible de repérer où insérer les nouvelles tuiles dans le .ts (structure inattendue : bloc \"//% fixedInstance jres blockIdentity=images._tile\" introuvable).", true);
        outputTs.value = tilemapTsText;
        return;
    }
    newTs = insertTsTilemapCases(newTs, mapTsCaseBlocks);
    if (newTs === null) {
        setTilemapStatus("Tuiles ajoutées, mais impossible de repérer où insérer le(s) tuilemap(s) dans le .ts (aucun appel TileScale existant trouvé).", true);
        outputTs.value = tilemapTsText;
        return;
    }
    outputTs.value = newTs;

    const parts = [`${newTileJresEntries.length} nouvelle(s) tuile(s) créée(s), ${reusedCount} réutilisée(s) depuis le projet.`];
    if (regions.length > 1) {
        parts.push(`Carte scindée en ${regions.length} tuilemaps (> ${maxTileLength} tuiles de long/large) : ${mapNames.join(", ")}.`);
    } else {
        parts.push(`Tuilemap généré : "${mapNames[0]}".`);
    }
    let isWarning = false;
    if (oversizedTilesets.length > 0) {
        isWarning = true;
        parts.push(
            `Attention : ${oversizedTilesets.map(o => `"${o.mapKey}" (${o.count} tuiles)`).join(", ")} dépasse${oversizedTilesets.length > 1 ? "nt" : ""} la limite MakeCode de ${MAX_TILESET_SIZE} tuiles distinctes par tuilemap — réduis la longueur max pour forcer un découpage plus fin.`
        );
    }
    setTilemapStatus(parts.join(" "), isWarning);
}

function render() {
    if (!sourceImage) {
        outputSectionImg.hidden = true;
        outputSectionTilemap.hidden = true;
        return;
    }
    if (mode === "tilemap") {
        outputSectionImg.hidden = true;
        outputSectionTilemap.hidden = false;
        if (tilemapSubMode === "map") {
            renderTilemapMapMode();
        } else {
            renderTilemapTileMode();
        }
    } else {
        outputSectionImg.hidden = false;
        outputSectionTilemap.hidden = true;
        renderImgMode();
    }
}

function wireCopyButton(btn, textarea) {
    btn.addEventListener("click", async () => {
        await navigator.clipboard.writeText(textarea.value);
        btn.textContent = "Copié !";
        setTimeout(() => (btn.textContent = "Copier"), 1200);
    });
}

wireCopyButton(copyBtn, outputCode);
wireCopyButton(copyJresBtn, outputJres);
wireCopyButton(copyTsBtn, outputTs);

setMode("img");
