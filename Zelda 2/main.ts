//#region --- 9. INITIALISATION DU JEU ET BOUCLES ---

let enduV = 100
let enduR = true

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

tiles.setCurrentTilemap(tilemap`level`)
tiles.placeOnRandomTile(link, assets.tile`chuchu_`)
pause(10)

// pour l'aide de début de partit (touche...)
let saria = sprites.create(assets.image`myImage3`, SpriteKind.aide)
tiles.placeOnRandomTile(saria, assets.tile`boko0`)

// dialogue
dialogue = sprites.create(assets.image`myImage7`, SpriteKind.aide)
dialogue.setFlag(SpriteFlag.Invisible, true)

// pour le scénario
game.showLongText("Bonjour Link", DialogLayout.Bottom)
game.showLongText("L'arbre Mojo veut te voir", DialogLayout.Bottom)

// verifi si il y a du miasme
game.onUpdateInterval(500, function () {
    miasme()
    enduF()
})

game.onUpdateInterval(5000, function () {
    if (barreFoodJoueur.value > 0) {
        barreFoodJoueur.value -= 10
    }
    if (barreFoodJoueur.value == 0) {
        sprites.changeDataNumberBy(link, "vie", -5)
    }
})

game.onUpdate(function () {
    // vérification des coffres
    coffre()

    // positionne l'épée de link quand link donne un coup
    epeeForever()
})


gerudoBoss();
piafBoss();
zoraBoss();

while (!(link.x >= 15 * 15)) {
    controller.moveSprite(link, 100, 100)
    pause(1)
}

tiles.setCurrentTilemap(tilemap`level8`)
pause(100)
// tiles.placeOnRandomTile(link, assets.tile`chuchu_`)

// DÉCLARATION DES SCRIPTES ET DES BOUCLES

game.onUpdate(function () { // forever mais qui fait moins beuguer le jeu
    // Création des likelike
    creer_likelike()

    // Création des monstre basic
    monstre_create()

    /**détruit tout les monstre si le niveau de fps et trop bas */
    fps()

    
})

//#endregion
