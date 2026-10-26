//#region fps

let fpsActuel = 2000 // variable quis retourne le nombre actuelle de fps
let tempsPrecedent = game.runtime()
let compteurFrames = 0

game.onUpdate(function () {
    compteurFrames++ // permet de savoire combien de fois la boucle est répéter par secode
    let tempsActuel = game.runtime() // game.runtime() = milis();
    if (tempsActuel - tempsPrecedent >= 1000) {
        fpsActuel = compteurFrames // sinon le nombre de fps ogmentrer puis chuterais a toute les seconde
        compteurFrames = 0
        tempsPrecedent = tempsActuel // sinon sa passerais son temps a s'excupter
    }
})

//#endregion

//#region épée

let épée_sprite: any = null

function coup_épée() {
    if (épée_sprite != null) return // un coup est déjà en cours : sinon l'ancienne épée n'est jamais détruite
    coup = 1;
    épée_sprite = sprites.create(assets.image`arme`, SpriteKind.épée) // créé un sprite a chaque fois
    let animEpee = assets.animation`épée`
    if (animEpee) {
        animation.runImageAnimation(épée_sprite, animEpee, 200, false)
    }
    epeeForever() // place l'épée tout de suite, sinon elle apparaît une frame en (0, 0)
    pause(600)
    coup = 0
    pause(100)
    sprites.destroy(épée_sprite) // détruit le sprite pour ne pas avoir plein d'épée partout
    épée_sprite = null
}

/** place l'épée de link en combat */
function epeeForever() {
    if (épée_sprite != null) {
        épée_sprite.setPosition(link.x - 12, link.y + 3) // l'épée suit link mais avec un décalage pour que le menche soit dans la main de link
    }
}

//#endregion

//#region vie

function change_vie(dégats_en: number, enemi: Sprite, dégats_link: number) {
    if (coup == 0) {  // si link n'est pas en train de donner un coup d'épée
        sprites.changeDataNumberBy(link, "vie", -dégats_en) // enleve les dégat de link
    } else {
        let indexMonstre = sprites.readDataNumber(enemi, "NB_du_MONSTRE") // pour pouvoir obtenir sa statubar et la réactualiser
        let nouvelleVie = sprites.readDataNumber(enemi, "vie") - dégats_link
        sprites.setDataNumber(enemi, "vie", nouvelleVie)
        if (nouvelleVie > 0) {
            enemi.setPosition(link.x + randint(-32, 32), link.y + randint(-32, 32))
        }
        if (b_Vie_monstre[indexMonstre]) {
            b_Vie_monstre[indexMonstre].value = nouvelleVie * (100 / sprites.readDataNumber(enemi, "vie_base")) // adapte la vie du monstre pour la statubar car max = 100
        }
    }
    if (sprites.readDataNumber(enemi, "vie") <= 0) { // tue le monstre si sa vie == 0
        score += sprites.readDataNumber(enemi, "vie_base") // augmente le score de link
        sprites.destroy(enemi) // détruit le menstre
    }
}

function change_vie_likelike(dégats_en: number, enemi: Sprite, dégats_link: number) {
    if (coup == 0) {  // si link n'est pas en train de donner un coup d'épée
        sprites.changeDataNumberBy(link, "vie", -dégats_en)
        barreVieJoueur.value = sprites.readDataNumber(link, "vie")

    } else {
        let nouvelleVie = sprites.readDataNumber(enemi, "vie") - dégats_link
        sprites.setDataNumber(enemi, "vie", nouvelleVie)
        let barreLikelike = sprites.readDataSprite(enemi, "statubar") as StatusBarSprite
        if (barreLikelike) {
            barreLikelike.value = nouvelleVie * (100 / sprites.readDataNumber(enemi, "vie_base"))
        }

    }
    if (sprites.readDataNumber(enemi, "vie") <= 0) {
        score += sprites.readDataNumber(enemi, "vie_base")
        sprites.destroy(enemi)
    }
}

function change_vie_boss(dégats_en: number, boss: Sprite, dégats_link: number) {
    if (coup == 0) {  // si link n'est pas en train de donner un coup d'épée
        sprites.changeDataNumberBy(link, "vie", -dégats_en)
    } else {
        let nouvelleVie = sprites.readDataNumber(boss, "vie") - dégats_link
        sprites.setDataNumber(boss, "vie", nouvelleVie)
    }
    if (sprites.readDataNumber(boss, "vie") <= 0) {
        score += sprites.readDataNumber(boss, "vie_base")
        boss.setFlag(SpriteFlag.Ghost, true) // n'entre plus en collision pendant qu'il brûle
        effects.fire.start(boss, 500, 60) // démarre l'effet avant que le sprite soit marqué détruit
        pause(500)
        sprites.destroy(boss)
    }
}

//#endregion

coffre