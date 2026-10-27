/** Sprite du joueur */
const link = sprites.create(assets.image`link 2000`, SpriteKind.Player)
//mais link au premier plan
link.z = 20
//la caméra le suit
scene.cameraFollowSprite(link)
//data de la vie
sprites.setDataNumber(link, "vie", 100)
//data des dégats
sprites.setDataNumber(link, "dégats", 10)
//vitesse de déplacement de link en pyxel
controller.moveSprite(link, 100, 100)
//anim link (marche)
let animLink = assets.animation`marche link`
if (animLink) {
    animation.runImageAnimation(link, animLink, 200, true)
}

/** vérifi la vie de link */
function verifier_mort_link() {
    let vieL = sprites.readDataNumber(link, "vie")
    link.say(`Vie: ${vieL}`) // link a au dessus de sa tête ecrit sa vie restante

    /** tue link ou bloc la vie de link */
    if (vieL <= 0) {
        game.popScene()
        game.showLongText("Score final : " + score, DialogLayout.Center)
        game.gameOver(false)
    } else if (vieL > 100) {
        sprites.setDataNumber(link, "vie", 100)
        barreVieJoueur.value = 100
    }
}

/** Barre de vie du joueur */
const barreVieJoueur = statusbars.create(52, 6, StatusBarKind.Health);
barreVieJoueur.positionDirection(CollisionDirection.Top)
barreVieJoueur.setOffsetPadding(-90, 4)
barreVieJoueur.setColor(2, 10)
barreVieJoueur.setLabel("HP", 15)
barreVieJoueur.setBarBorder(1, 13)
barreVieJoueur.setStatusBarFlag(StatusBarFlag.SmoothTransition, true)

/** barre d'endu */
const barreEnduJoueur = statusbars.create(52, 6, StatusBarKind.Health);
barreEnduJoueur.setColor(7, 10)
barreEnduJoueur.positionDirection(CollisionDirection.Top)
barreEnduJoueur.setOffsetPadding(-90, 14)
barreEnduJoueur.setStatusBarFlag(StatusBarFlag.SmoothTransition, true)
barreEnduJoueur.setLabel("EN", 15)
barreEnduJoueur.setBarBorder(1, 13)

/** force les joueur a se servire des coffre */
const barreFoodJoueur = statusbars.create(52, 6, StatusBarKind.Health);
barreFoodJoueur.setColor(14, 10)
barreFoodJoueur.positionDirection(CollisionDirection.Top)
barreFoodJoueur.setOffsetPadding(-90, 24)
barreFoodJoueur.setStatusBarFlag(StatusBarFlag.SmoothTransition, true)
barreFoodJoueur.setLabel("co", 15)
barreFoodJoueur.setBarBorder(1, 13)

const argent = statusbars.create(52, 6, StatusBarKind.Health);
argent.value = 0
argent.setColor(4, 10)
argent.positionDirection(CollisionDirection.Top)
argent.setOffsetPadding(-90, 34)
argent.setStatusBarFlag(StatusBarFlag.SmoothTransition, true)
argent.setLabel("RU", 15)
argent.setBarBorder(1, 13)

game.onUpdate(function () {
    barreVieJoueur.value = sprites.readDataNumber(link, "vie");
    verifier_mort_link();
});

function epona_relais_new() {
    if (link.tileKindAt(TileDirection.Center, assets.tile`myTile106`) || link.tileKindAt(TileDirection.Center, assets.tile`myTile107`)) {
        dialogue.sayText("Touche A: 20 rubis pour faire venir un cheval")
        dialogue.setFlag(SpriteFlag.Invisible, false)
        if (controller.A.isPressed() && rubis >= 20) {
            rubis -= 20
        }
    }
}