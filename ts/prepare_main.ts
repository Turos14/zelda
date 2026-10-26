//#region --- 9. INITIALISATION DU JEU ET BOUCLES ---

/**prépare et initialise la barre d'endu*/
let enduV = 100
let enduR = true

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

// gerudoBoss();
// piafBoss();
// zoraBoss();

while (!(link.x >= 15 * 15)) {
    controller.moveSprite(link, 100, 100)
    pause(1)
}

tiles.setCurrentTilemap(tilemap`TEST`)
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
