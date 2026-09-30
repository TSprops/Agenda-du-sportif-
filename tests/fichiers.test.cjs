// Fichiers de l'app : le mode hors connexion (service worker) connaît tous les fichiers js/ et css/,
// et index.html charge toutes les feuilles de style de css/ dans l'ordre de leur numéro.
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
};
