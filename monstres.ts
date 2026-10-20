//#region --- 4. JEU : MONSTRES & ENVIRONNEMENT ---

let animation2: Image[][] = [
    assets.animation`gardien BOTW`,
    [],
    assets.animation`chuchu`,
    assets.animation`lynel`,
    assets.animation`gardien hyrule`,
    assets.animation`soldat hyrule`,
    assets.animation`myAnim1`,
    assets.animation`myAnim`
]

function si_tuile_cree_monstre(sur_bonne_tuile: boolean, myImage: Image, id_anim: number, dégats: number, vie: number) {
    if (sur_bonne_tuile) {
        MONSTRE = id_anim
        creer_Monstre(sprites.create(myImage, SpriteKind.Enemy), dégats, vie)
    }
}

function coffre() {
    if (link.tileKindAt(TileDirection.Center, assets.tile`myTile16`)) {
        dialogue.setFlag(SpriteFlag.Invisible, false)
        dialogue.setPosition(link.x, link.y - 16)
        dialogue.sayText("A : ouvrir le coffre")
        if (controller.A.isPressed()) {
            tiles.setTileAt(link.tilemapLocation(), assets.tile`myTile17`)
            sprites.changeDataNumberBy(link, "vie", 20)
            barreFoodJoueur.value += 20
        }
    } else {
        dialogue.setFlag(SpriteFlag.Invisible, true)
    }
}

function creer_Monstre(monstre: Sprite, dégats: number, vie: number) {
    nombre_de_monstre += 1
    monstre.setPosition(link.x + randint(-64, 64), link.y + randint(-64, 64))
    while (link.overlapsWith(monstre)) {
        monstre.setPosition(link.x + randint(-64, 64), link.y + randint(-64, 64))
    }
    sprites.setDataNumber(monstre, "dégats", dégats)
    sprites.setDataNumber(monstre, "vie", vie)
    sprites.setDataNumber(monstre, "vie_base", vie)
    tiles.setTileAt(link.tilemapLocation(), assets.tile`tileGrass3`)
    monstre.follow(link, 90, 90)
    let monstreId = b_Vie_monstre.length
    sprites.setDataNumber(monstre, "NB_du_MONSTRE", monstreId) // -----
    let newBar = statusbars.create(vie / 10, 4, StatusBarKind.Energy)
    newBar.value = 100
    newBar.setColor(2, 8)
    newBar.attachToSprite(monstre, 0, 0)
    b_Vie_monstre.push(newBar)
    let animMonstre = animation2[MONSTRE]
    if (animMonstre) {
        animation.runImageAnimation(monstre, animMonstre, 200, true)
    }
}

//#region Likelike

const likelike_list: Sprite[] = [];

function creer_likelike() {
    let tuilesCibles = tiles.getTilesByType(assets.tile`myTile15`)
    for (let tuile of tuilesCibles) {
        let dx = tuile.x - link.x
        let dy = tuile.y - link.y
        let distance = Math.sqrt(dx * dx + dy * dy)
        if (distance < 64) {
            nombre_de_monstre += 1
            // On est suffisamment prêt de la tuile pour déclencher la création du monstre
            // On initialise le likelike
            const likelike = sprites.create(assets.image`myImage2`, SpriteKind.likelikeKind)
            tiles.placeOnTile(likelike, tuile)
            tiles.setTileAt(tuile, assets.tile`myTile24`) // Remplace la tuile pour ne pas recréer systématiquement un montre
            sprites.setDataNumber(likelike, "vie_base", 250)
            sprites.setDataNumber(likelike, "vie", 250)
            sprites.setDataNumber(likelike, "dégats", 0) // Ce n'est pas lui qui fait des dégâts, mais ses projectiles
            let barre_likelike = statusbars.create(32, 4, StatusBarKind.Health);
            barre_likelike.attachToSprite(likelike, 16, -2)
            barre_likelike.value = 100
            barre_likelike.setColor(2, 8)
            sprites.setDataSprite(likelike, "statubar", barre_likelike)
            // On l'enregistre dans la liste pour qu'il lance des trucs sur link
            likelike_list.push(likelike)
        }
    }
}

/** Comportement pour les like like */
game.onUpdateInterval(5000, function () {
    // Pour tous les likelike
    for (const likelike_sprite of likelike_list) {
        // - Si le likelike est visible ...
        let dx = link.x - likelike_sprite.x
        let dy = link.y - likelike_sprite.y
        let distance = Math.sqrt(dx * dx + dy * dy)
        if (distance > 80) {
            // Le likelike est trop loin pour tirer sur link
            continue;
        }
        // - ... lancer une pierre en direction de Link
        // si link bouge la destination ne change pas
        animation.runImageAnimation(
            likelike_sprite,
            assets.animation`azertyuiop`,
            200,
            false
        )
        const projectile = sprites.createProjectileFromSprite(assets.image`myImage`, likelike_sprite, dx, dy)
        sprites.setDataNumber(projectile, "dégats", 10)
    }
})

//#endregion


//#endregion

//#region --- 5. fonction de boucle

function monstre_create() {
    si_tuile_cree_monstre(link.tileKindAt(TileDirection.Center, assets.tile`myTile12`), assets.image`myImage0`, 0, 12.5, 500)
    si_tuile_cree_monstre(link.tileKindAt(TileDirection.Center, assets.tile`myTile11`), assets.image`boko`, 1, 10, 100)
    si_tuile_cree_monstre(link.tileKindAt(TileDirection.Center, assets.tile`tilePath5`), assets.image`chuchu`, 2, 5, 50)
    si_tuile_cree_monstre(link.tileKindAt(TileDirection.Center, sprites.builtin.forestTiles0), assets.image`myImage1`, 3, 20, 500)
    si_tuile_cree_monstre(link.tileKindAt(TileDirection.Center, assets.tile`gan`), assets.image`myImage4`, 4, 15, 200)
    si_tuile_cree_monstre(link.tileKindAt(TileDirection.Center, assets.tile`myTile3`), assets.image`myImage5`, 5, 7.5, 100)
    si_tuile_cree_monstre(link.tileKindAt(TileDirection.Center, assets.tile`myTile4`), assets.image`myImage13`, 6, 10, 50)
    si_tuile_cree_monstre(link.tileKindAt(TileDirection.Center, assets.tile`myTile14`), assets.image`myImage12`, 7, 15, 150)
}

function fps() {
    if (fpsActuel <= 20) {
        sprites.destroyAllSpritesOfKind(SpriteKind.Enemy)
        pause(1000)
    }
}

//#endregion
