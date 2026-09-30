// « Comment faire » : bouton « ? » et fenêtre qui montre le mouvement (mannequin de silhouette/, fiches de exercices/).
// Départ et arrivée côte à côte, bouton « Voir le mouvement » pour l'animation, repères pour débuter, placement des mains.
// Ce fichier regroupe ce que les autres modules utilisent.
// Même ordre de chargement que l'ancien fichier unique.
import "../core.js";
import "../faq.js";
import "../workout.js";
import "../muscles.js";
import "../silhouette/index.js";
import "../exercices/index.js";
export { moveOf } from "./recherche.js";
export { gripSVG } from "./mains.js";
export { howBtnHTML, animViewsOf } from "./fenetre.js";
