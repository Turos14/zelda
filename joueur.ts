//#region --- 2. CONFIGURATION & VARIABLES ---

//#region Initialisation de Link

/** Sprite du joueur */
const link = sprites.create(assets.image`link 2000`, SpriteKind.Player)
link.z = 20
scene.cameraFollowSprite(link)
sprites.setDataNumber(link, "vie", 100)
sprites.setDataNumber(link, "dégats", 10)
controller.moveSprite(link, 100, 100)
let animLink = assets.animation`marche link`

if (animLink) {
    animation.runImageAnimation(link, animLink, 200, true)
}

/** Barre de vie du joueur */
const barreVieJoueur = statusbars.create(52, 6, StatusBarKind.Health);
barreVieJoueur.positionDirection(CollisionDirection.Top)
barreVieJoueur.setOffsetPadding(-90, 4)
barreVieJoueur.setColor(2, 10)
barreVieJoueur.setLabel("HP", 15)
barreVieJoueur.setBarBorder(1, 13)
barreVieJoueur.setStatusBarFlag(StatusBarFlag.SmoothTransition, true)

const barreEnduJoueur = statusbars.create(52, 6, StatusBarKind.Health);
barreEnduJoueur.setColor(7, 10)
barreEnduJoueur.positionDirection(CollisionDirection.Top)
barreEnduJoueur.setOffsetPadding(-90, 14)
barreEnduJoueur.setStatusBarFlag(StatusBarFlag.SmoothTransition, true)
barreEnduJoueur.setLabel("EN", 15)
barreEnduJoueur.setBarBorder(1, 13)

const barreFoodJoueur = statusbars.create(52, 6, StatusBarKind.Health);
barreFoodJoueur.setColor(14, 10)
barreFoodJoueur.positionDirection(CollisionDirection.Top)
barreFoodJoueur.setOffsetPadding(-90, 24)
barreFoodJoueur.setStatusBarFlag(StatusBarFlag.SmoothTransition, true)
barreFoodJoueur.setLabel("EN", 15)
barreFoodJoueur.setBarBorder(1, 13)

game.onUpdate(function () {
    barreVieJoueur.value = sprites.readDataNumber(link, "vie");
    verifier_mort_link();
});

//#endregion
/** remplire pour les dialogue mes c pas ouf alors il faut mieu modifier par des états */
let dialogue: any = null // défini en liste plus tard

// variable de score et de chose utile

let score = 0 // pour le score et modifier à la mort des monstre de la vie des monstre initiale
let coup = 0 // état pour savoir si
let nombre_de_monstre = 0 // ressance le nombre de monstre mais a continuer
let MONSTRE = 0 // regarder a quoi elle sert

/** Tableau pour stocker les barres de vie des ennemis */
let b_Vie_monstre: any[] = []

//#endregion
