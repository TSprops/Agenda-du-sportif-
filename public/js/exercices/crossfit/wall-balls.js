// Fiche « Comment faire » : Wall balls.
import { side } from "../_communs.js";
import { wallball } from "./_communs.js";

export default { views: [side(wallball.slice(0, 2), ["Squat, ballon contre la poitrine", "Lancer vers la cible"])],
    animViews: [side(wallball, ["Squat, ballon contre la poitrine", "Lancer", "Ballon en vol", "Ballon sur la cible"])],
    cue: "Medecine ball contre la poitrine : descends en squat, puis remonte d’un coup et lance le ballon sur la cible au mur. Rattrape-le et enchaîne.",
    tips: ["Squat complet à chaque répétition, dos droit.", "C’est la poussée des jambes qui lance le ballon, les bras finissent le geste.", "Regarde la cible, rattrape le ballon en redescendant directement en squat."] };
