function piafBoss() {
    let piaf = sprites.create(assets.image`myImage16`, SpriteKind.BossPiaf)
    piaf.z = 15
    piaf.setFlag(SpriteFlag.StayInScreen, true) // empêche le boss de sortir entièrement de l'écran
    sprites.setDataNumber(piaf, "vie", 1000)
    sprites.setDataNumber(piaf, "vie_base", 1000)
    sprites.setDataNumber(piaf, "dégats", 34)

    /** Barre de vie du boss */
    const BVpiafBoss = statusbars.create(64, 8, StatusBarKind.Health);
    BVpiafBoss.positionDirection(CollisionDirection.Top)
    BVpiafBoss.setOffsetPadding(0, 8) // 2x plus bas que la barre de vie de link (padding 4)
    BVpiafBoss.setColor(2, 10)
    BVpiafBoss.value = 100

    piaf.onDestroyed(function () {
        sprites.destroy(BVpiafBoss) // supprime la barre de vie quand le boss meurt
    })

    game.onUpdate(function () {
        BVpiafBoss.value = sprites.readDataNumber(piaf, "vie") * (100 / sprites.readDataNumber(piaf, "vie_base"));
    });

    let i = 0

    game.onUpdateInterval(400, function () {
        if (sprites.readDataNumber(piaf, "vie") <= 0) return // le boss est mort : il arrête de bouger/attaquer

        if (i == 0) {
            piaf .vy = 0
            if (link.x < piaf.x) {
                animation.runImageAnimation(piaf, assets.animation`myAnim7`, 200, false)
                piaf.vx = -150
            } else {
                animation.runImageAnimation(piaf, assets.animation`myAnim9`, 200, false)
                piaf.vx = 150
            }
            i = 1
        } else {
            piaf .vx = 0
            if (link.y < piaf.y) {
                animation.runImageAnimation(piaf, assets.animation`myAnim8`, 200, false)
                piaf.vy = -150
            } else {
                animation.runImageAnimation(piaf, assets.animation`myAnim6`, 200, false)
                piaf.vy = 150
            }
            i = 0
        }
    })


}