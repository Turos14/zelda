//#region endu
function enduF() {
    if (enduV > 0 && enduR) {
        if (controller.left.isPressed() || controller.up.isPressed() || controller.down.isPressed() || controller.right.isPressed()) {
            enduV -= 10
        } else {
            if (enduV < 100) {
                enduV += 5
            }
        }
        controller.moveSprite(link, 100, 100)
    } else {
        enduR = false
        enduV += 5
        if (enduV == 100) {
            enduR = true
        }
        controller.moveSprite(link, 50, 50)
    }
    barreEnduJoueur.value = enduV
}

//#endregion

//#region miasme

/**
 * dit si la tuile dans les paramètre de la fonction est sous link
 * @param tuile 
 * @returns number
*/
function tile_center(tuile: any[]) {
    let i = tuile.length
    let p = 0
    for (let o = 0; o < i; o++) {
        if (link.tileKindAt(TileDirection.Center, tuile[o])) {
            p += 1
        }
    }

    if (p != 0) {
        return (true);
    } else {
        return (false);
    }
}

/** liste des tuiles de miasme */
let miasmeTiles = [
    assets.tile`myTile15`,
    assets.tile`myTile24`,
    assets.tile`myTile50`,
    assets.tile`myTile51`,
    assets.tile`myTile52`,
    assets.tile`myTile53`,
    assets.tile`myTile54`,
    assets.tile`myTile55`,
    assets.tile`myTile56`,
    assets.tile`myTile57`,
    assets.tile`myTile58`,
    assets.tile`myTile59`,
    assets.tile`myTile60`,
    assets.tile`myTile61`,
    assets.tile`myTile63`,
    assets.tile`myTile64`,
    assets.tile`myTile65`,
    assets.tile`myTile66`,
    assets.tile`myTile67`,
    assets.tile`myTile69`,
    assets.tile`myTile70`,
    assets.tile`myTile71`,
]

/** vérifi si link est sur du miasme (si oui: vie -= 20) */
function miasme() {
    if (tile_center(miasmeTiles)) sprites.changeDataNumberBy(link, "vie", -20)
}

//#endregion

let exe = 0
//#region nouriture
function nouriture() {
    if (exe == 10) {
        if (barreFoodJoueur.value > 0) barreFoodJoueur.value -= 10
        if (barreFoodJoueur.value == 0) sprites.changeDataNumberBy(link, "vie", -5)
    }
    exe += 1
}

//#endregion

//#region boucle

/** vérification toute les 500 ms */
game.onUpdateInterval(500, function () {
    miasme();
    enduF();
    nouriture();
})

game.onUpdate(function () {
    // vérification des coffres
    coffre()

    // positionne l'épée de link quand link donne un coup
    epeeForever()
})

//#endregion