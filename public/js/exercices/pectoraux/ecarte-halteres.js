// Fiche « Comment faire » : Écarté haltères.
import { t } from "../../commun/i18n.js";
import { front, side, view } from "../_communs.js";
import { benchEq, benchF, benchLie, flyArms, flyTop } from "./_communs.js";

export default { animViews: ["De profil", view("Vue de dessus", [flyTop(1), flyTop(0)], [t("fiches.ecarte-halteres.legende1"), t("fiches.ecarte-halteres.legende2")])], views: [side([benchLie(0, flyArms(1), benchEq(0, "db")), benchLie(0, flyArms(0), benchEq(0, "db"))], [t("fiches.ecarte-halteres.legende1"), t("fiches.ecarte-halteres.legende2")]),
      front([benchF(1, 150, "db", { R: { ua: 4, fa: -12, hand: -12 } }), benchF(0, 128, "db", { R: { wristAt: [128, 92], hand: -90, elbowBend: -1 } })], [t("fiches.ecarte-halteres.legende3"), t("fiches.ecarte-halteres.legende4")])],
    cue: t("fiches.ecarte-halteres.consigne"),
    tips: [t("fiches.ecarte-halteres.conseil1"), t("fiches.ecarte-halteres.conseil2"), t("fiches.ecarte-halteres.conseil3")] };
