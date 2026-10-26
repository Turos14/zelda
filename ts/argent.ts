let rubis = 0

function coffre() {
    let i = 0
    let plus_rubis = 0
    if (link.tileKindAt(TileDirection.Center, assets.tile`myTile16`)) {
        dialogue.setFlag(SpriteFlag.Invisible, false)
        dialogue.setPosition(link.x, link.y - 16)
        dialogue.sayText("A : ouvrir le coffre")
        if (controller.A.isPressed()) {
            tiles.setTileAt(link.tilemapLocation(), assets.tile`myTile17`)
            i = randint(0, 1);
            if (i == 0) {
                sprites.changeDataNumberBy(link, "vie", 20)
                barreFoodJoueur.value += 20
            } else {
                plus_rubis = randint(1, 10);
                rubis += plus_rubis;
            }
        }
    } //else {
        // dialogue.setFlag(SpriteFlag.Invisible, true)
    // }
    if (i == 1) {
        dialogue.sayText("vous venez de trouvez " + plus_rubis + " rubis")
        dialogue.setFlag(SpriteFlag.Invisible, false)
    }
}