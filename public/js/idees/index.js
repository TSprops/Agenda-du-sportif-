// CrossFit, idées de séances, records et courbes de progression.
// Ce fichier regroupe ce que les autres modules utilisent.
// Même ordre de chargement que l'ancien fichier unique.
import "../commun/core.js";
import "../commun/store.js";
import "../seances/index.js";
import "../pages/faq.js";
import "../entrainement/index.js";
export { cfData, MONTHS_S, shortDate, benchEntries, benchValue, benchText, renderCrossfit } from "./crossfit.js";
export { MUSCU_LIFTS, RUN_PRS, CALIS_PRS, prsData, repsText, ideaExercises, tryIdea } from "./idees-seances.js";
export { prBest, prText, renderRec } from "./records.js";
export { renderTypesHub, renderRecordsHub, renderProgHub, renderHub } from "./categories.js";
export { doneSet, renderProg } from "./progression.js";
