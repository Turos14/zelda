//#region --- 7. OUTILS MATHÉMATIQUES & RECHERCHES ---

function NbC(): number {
    const map = game.currentScene().tileMap;
    if (map && map.data) {
        return map.data.width;
    }
    return 0;
}

function NbL(): number {
    const map = game.currentScene().tileMap;
    if (map && map.data) {
        return map.data.height;
    }
    return 0;
}

function obtenirDistanceTuileLaPlusProche(typeCible: Image): number {
    let distanceMinimale = Infinity;
    const toutesLesTuiles = tiles.getTilesByType(typeCible);
    for (const emplacement of toutesLesTuiles) {
        const dx = emplacement.x - link.x;
        const dy = emplacement.y - link.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < distanceMinimale) {
            distanceMinimale = distance;
        }
    }
    return distanceMinimale;
}
//#endregion
