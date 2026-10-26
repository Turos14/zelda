//#region --- 6. BOSS : zora ---

function zoraBoss() {
    let zora = sprites.create(assets.image`myImage15`, SpriteKind.BossZora)
    zora.z = 15
    zora.setFlag(SpriteFlag.StayInScreen, true) // empêche le boss de sortir entièrement de l'écran
    sprites.setDataNumber(zora, "vie", 1000)
    sprites.setDataNumber(zora, "vie_base", 1000)
    sprites.setDataNumber(zora, "dégats", 25)


    /** Barre de vie du boss */
    const BVzoraBoss = statusbars.create(64, 8, StatusBarKind.Health);
    BVzoraBoss.positionDirection(CollisionDirection.Top)
    BVzoraBoss.setOffsetPadding(0, 8) // 2x plus bas que la barre de vie de link (padding 4)
    BVzoraBoss.setColor(2, 10)
    BVzoraBoss.value = 100

    zora.onDestroyed(function () {
        sprites.destroy(BVzoraBoss) // supprime la barre de vie quand le boss meurt
    })

    game.onUpdate(function () {
        BVzoraBoss.value = sprites.readDataNumber(zora, "vie") * (100 / sprites.readDataNumber(zora, "vie_base"));
    });

    const PORTEE_ATTAQUE = 48 // distance en dessous de laquelle le boss charge automatiquement
    const VITESSE_CHARGE = 150
    const VITESSE_RECUL = 100
    const VITESSE_APPROCHE = 60

    game.onUpdateInterval(400, function () {
        if (sprites.readDataNumber(zora, "vie") <= 0) return // le boss est mort : il arrête de bouger/attaquer

        let dx = link.x - zora.x
        let dy = link.y - zora.y
        let distance = Math.sqrt(dx * dx + dy * dy)

        if (distance > 0 && distance < PORTEE_ATTAQUE) { // link est à portée : charge utilise myAnim0
            animation.runImageAnimation(zora, assets.animation`myAnim5`, 200, false)
            zora.vx = (dx / distance) * VITESSE_CHARGE
            zora.vy = (dy / distance) * VITESSE_CHARGE
        } else if (distance > 0) { // link est hors de portée : défense (recul) ou approche utilise myAnim4
            animation.runImageAnimation(zora, assets.animation`myAnim3`, 200, false)
            if (randint(0, 1) == 0) { // défense : garde ses distances
                zora.vx = -(dx / distance) * VITESSE_RECUL
                zora.vy = -(dy / distance) * VITESSE_RECUL
            } else { // approche : se rapproche lentement
                zora.vx = (dx / distance) * VITESSE_APPROCHE
                zora.vy = (dy / distance) * VITESSE_APPROCHE
            }
        } else {
            zora.vx = 0
            zora.vy = 0
        }
    })
}

//#endregion
