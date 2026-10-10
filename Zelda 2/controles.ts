//#region --- 8. CONTRÔLES ET ÉVÉNEMENTS ---

controller.B.onEvent(ControllerButtonEvent.Pressed, function () {
    coup_épée()
})

sprites.onOverlap(SpriteKind.Player, SpriteKind.Enemy, function (sprite, otherSprite) {
    let dmg = sprites.readDataNumber(otherSprite, "dégats")
    if (dmg == null) dmg = 0;
    let force = sprites.readDataNumber(link, "dégats")
    if (force == null) force = 0;
    change_vie(dmg, otherSprite, force)
    pause(500)
})

sprites.onOverlap(SpriteKind.Player, SpriteKind.Projectile, function (sprite, otherSprite) {
    sprites.changeDataNumberBy(link, "vie", -10)
    otherSprite.destroy()
})

sprites.onOverlap(SpriteKind.Player, SpriteKind.likelikeKind, function (sprite, otherSprite) {
    let dmg = sprites.readDataNumber(otherSprite, "dégats")
    if (dmg == null) dmg = 0;
    let force = sprites.readDataNumber(link, "dégats")
    if (force == null) force = 0;
    change_vie_likelike(dmg, otherSprite, force)
    pause(500)
})

sprites.onOverlap(SpriteKind.Player, SpriteKind.BossGerudo, function (sprite, otherSprite) {
    let dmg = sprites.readDataNumber(otherSprite, "dégats")
    if (dmg == null) dmg = 0;
    let force = sprites.readDataNumber(link, "dégats")
    if (force == null) force = 0;
    change_vie_boss(dmg, otherSprite, force)
    pause(500)
})

sprites.onOverlap(SpriteKind.Player, SpriteKind.BossZora, function (sprite, otherSprite) {
    let dmg = sprites.readDataNumber(otherSprite, "dégats")
    if (dmg == null) dmg = 0;
    let force = sprites.readDataNumber(link, "dégats")
    if (force == null) force = 0;
    change_vie_boss(dmg, otherSprite, force)
    pause(500)
})

sprites.onOverlap(SpriteKind.Player, SpriteKind.BossPiaf, function (sprite, otherSprite) {
    let dmg = sprites.readDataNumber(otherSprite, "dégats")
    if (dmg == null) dmg = 0;
    let force = sprites.readDataNumber(link, "dégats")
    if (force == null) force = 0;
    change_vie_boss(dmg, otherSprite, force)
    pause(500)
})
//#endregion
