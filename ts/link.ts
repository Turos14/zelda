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

let epona :any = null
let epona_arrive = false // vrai entre l'achat et l'arrivée du cheval, pour ne pas le payer deux fois

/** dit si link est sur une tuile de relais (où on peut appeler epona) */
function sur_relais_epona() {
    return link.tileKindAt(TileDirection.Center, assets.tile`myTile106`) || link.tileKindAt(TileDirection.Center, assets.tile`myTile107`)
}

function epona_relais_new() {
    if (sur_relais_epona() && epona == null && !epona_arrive) {
        dialogue.sayText("Touche A: 20 rubis pour faire venir un cheval")
        dialogue.setFlag(SpriteFlag.Invisible, false)
        if (controller.A.isPressed() && rubis >= 20) {
            rubis -= 20
            epona_arrive = true
            control.runInParallel(function () { // pause hors du game.onUpdate pour ne pas figer le jeu 1 s
                pause(1000);
                epona = sprites.create(assets.image`myImage14`, SpriteKind.entitéS)
                epona.x = link.x
                epona.y = link.y
                epona_arrive = false
                controller.moveSprite(link, 200, 200)
            })
        } else if(controller.A.isPressed() && epona != null) {
            pause(1000);
            sprites.destroy(epona)
            epona = null
            controller.moveSprite(link, 100, 100)
        }
    }
}

game.onUpdate(function () {
    if (epona != null) { // le cheval suit link une fois arrivé
        epona.x = link.x
        epona.y = link.y
        
    }
})

let épée_sprite: any = null

function epeeForever() {
    if (épée_sprite != null) {
        épée_sprite.setPosition(link.x - 12, link.y + 3) // l'épée suit link mais avec un décalage pour que le menche soit dans la main de link
    }
}

function coup_épée() {
    if (épée_sprite != null) return // un coup est déjà en cours : sinon l'ancienne épée n'est jamais détruite
    coup = 1;
    épée_sprite = sprites.create(assets.image`arme`, SpriteKind.épée) // créé un sprite a chaque fois
    let animEpee = assets.animation`épée`
    if (animEpee) {
        animation.runImageAnimation(épée_sprite, animEpee, 200, false)
    }
    pause(600)
    coup = 0
    pause(100)
    sprites.destroy(épée_sprite) // détruit le sprite pour ne pas avoir plein d'épée partout
    épée_sprite = null
}

/** place l'épée de link en combat */


game.onUpdate(function () {
    epeeForever()
    epona_relais_new()
    argent.value = rubis
})