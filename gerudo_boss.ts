//#region --- 6. BOSS : GERUDO ---

function gerudoBoss() { // fonction d'apelle de boss
    let gerudo = sprites.create(assets.image`myImage15`, SpriteKind.BossGerudo)
    gerudo.z = 10
    gerudo.setFlag(SpriteFlag.StayInScreen, true) // empêche le boss de sortir entièrement de l'écran
    
    // vie = 1000 (vie en temps réel)
    // vie_base = 1000 (pour calculer la vie a ajouter)
    // dégat = 25
    sprites.setDataNumber(gerudo, "vie", 1000)
    sprites.setDataNumber(gerudo, "vie_base", 1000)
    sprites.setDataNumber(gerudo, "dégats", 25)


    /** Barre de vie du boss */
    const BVgerudoBoss = statusbars.create(64, 8, StatusBarKind.Health) // def
    BVgerudoBoss.positionDirection(CollisionDirection.Top) 
    BVgerudoBoss.setOffsetPadding(0, 8) // 2x plus bas que la barre de vie de link (padding 4)
    BVgerudoBoss.setColor(2, 10)
    BVgerudoBoss.value = 100

    gerudo.onDestroyed(function () {
        sprites.destroy(BVgerudoBoss) // supprime la barre de vie quand le boss meurt
    })

    game.onUpdate(function () {
        BVgerudoBoss.value = sprites.readDataNumber(gerudo, "vie") * (100 / sprites.readDataNumber(gerudo, "vie_base"));
    });

    const PORTEE_ATTAQUE = 48 // distance en dessous de laquelle le boss charge automatiquement
    const VITESSE_CHARGE = 150
    const VITESSE_RECUL = 100
    const VITESSE_APPROCHE = 60

    game.onUpdateInterval(400, function () {
        if (sprites.readDataNumber(gerudo, "vie") <= 0) return // le boss est mort : il arrête de bouger/attaquer

        let dx = link.x - gerudo.x
        let dy = link.y - gerudo.y
        let distance = Math.sqrt(dx * dx + dy * dy)

        if (distance > 0 && distance < PORTEE_ATTAQUE) { // link est à portée : charge utilise myAnim0
            animation.runImageAnimation(gerudo, assets.animation`myAnim4`, 200, false)
            gerudo.vx = (dx / distance) * VITESSE_CHARGE
            gerudo.vy = (dy / distance) * VITESSE_CHARGE
        } else if (distance > 0) { // link est hors de portée : défense (recul) ou approche utilise myAnim4
            animation.runImageAnimation(gerudo, assets.animation`myAnim0`, 200, false)
            if (randint(0, 1) == 0) { // défense : garde ses distances
                gerudo.vx = -(dx / distance) * VITESSE_RECUL
                gerudo.vy = -(dy / distance) * VITESSE_RECUL
            } else { // approche : se rapproche lentement
                gerudo.vx = (dx / distance) * VITESSE_APPROCHE
                gerudo.vy = (dy / distance) * VITESSE_APPROCHE
            }
        } else {
            gerudo.vx = 0
            gerudo.vy = 0
        }
    })
}

//#endregion
