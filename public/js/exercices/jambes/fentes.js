// Fiche « Comment faire » : Fentes.
import { side, stand } from "../_communs.js";
import { lunge } from "./_communs.js";
import { db } from "../../silhouette/index.js";

export default { views: [side([stand({ eq: [db(P => [P.near.grip, 90], "side", { mid: true })] }), lunge("near"), lunge("far")], ["Debout", "Jambe droite devant", "Jambe gauche devant"], [0, 1, 0, 2])],
    cue: "Grand pas en avant : descends le genou arrière près du sol, genou avant au-dessus de la cheville, remonte, puis change de jambe.",
    tips: ["Une jambe puis l’autre.", "Genou avant au-dessus de la cheville, dans l’axe du pied.", "Buste droit, genou arrière qui frôle le sol."] };
