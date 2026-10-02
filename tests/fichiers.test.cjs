// Fichiers de l'app : le mode hors connexion (service worker) connaît tous les fichiers js/ et css/,
// index.html charge toutes les feuilles de style de css/ dans l'ordre de leur numéro,
// et les traductions sont complètes (scripts/verifier-traductions.cjs).
const fs = require("fs"), path = require("path");
const PUB = path.join(__dirname, "..", "public");
const list = (dir, ext) => fs.readdirSync(path.join(PUB, dir), { recursive: true }).filter(f => f.endsWith(ext)).map(f => dir + "/" + f.split(path.sep).join("/")).sort();

module.exports = async function fileTests(t) {
  const sw = fs.readFileSync(path.join(PUB, "sw.js"), "utf8");
  const shell = [...sw.match(/const SHELL = \[(.*?)\];/)[1].matchAll(/"([^"]*)"/g)].map(m => m[1].split("?")[0]);
  const js = list("js", ".js"), css = list("css", ".css");
  t("hors connexion : tous les fichiers js/ sont listés", js.filter(f => !shell.includes(f)), []);
  t("hors connexion : tous les fichiers css/ sont listés", css.filter(f => !shell.includes(f)), []);
  t("hors connexion : aucun fichier listé n'est absent", shell.filter(f => f !== "./" && !fs.existsSync(path.join(PUB, f))), []);
  const html = fs.readFileSync(path.join(PUB, "index.html"), "utf8");
  const links = [...html.matchAll(/<link rel="stylesheet" href="(css\/[^"?]+)/g)].map(m => m[1]);
  t("index.html charge toutes les feuilles de style, dans l'ordre", links, css);
  // Langues : chaque fichier langues/<code>.json est proposé dans l'app et a son manifeste.
  const codes = list("langues", ".json").map(f => path.basename(f, ".json")).sort();
  const proposees = JSON.parse(fs.readFileSync(path.join(PUB, "js/commun/langues.js"), "utf8").match(/LANGUES = (\[.*\]);/)[1]).map(l => l.code).sort();
  t("langues : toutes proposées dans l'app (node scripts/liste-hors-ligne.cjs)", proposees, codes);
  t("langues : un manifeste par langue", codes.filter(c => !fs.existsSync(path.join(PUB, c === "fr" ? "manifest.webmanifest" : `manifest.${c}.webmanifest`))), []);
  const r = require("../scripts/verifier-traductions.cjs")();
  const NOMS = { manquantes: "aucune clé manquante", enTrop: "aucune clé en trop", variables: "mêmes variables et balises", inconnues: "aucune clé inconnue dans le code",
    inutiles: "aucune clé inutilisée", enDur: "aucun texte en dur" };
  for (const [k, v] of Object.entries(r)) t("traductions : " + (NOMS[k] || k), v, []);
};
