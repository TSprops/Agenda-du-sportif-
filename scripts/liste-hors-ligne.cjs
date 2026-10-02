// Met à jour la liste SHELL de public/sw.js (fichiers gardés pour le mode hors connexion) :
// toutes les feuilles de public/css/ (avec la version ?v=…), tous les fichiers de public/js/ et de public/langues/.
// Écrit aussi public/js/commun/langues.js : la liste des langues proposées, lue dans chaque langues/<code>.json.
// À lancer après avoir ajouté, renommé ou supprimé un fichier (ou ajouté une langue) : node scripts/liste-hors-ligne.cjs
const fs = require("fs"), path = require("path");
const PUB = path.join(__dirname, "..", "public"), SW = path.join(PUB, "sw.js");
const list = (dir, ext) => fs.readdirSync(path.join(PUB, dir), { recursive: true }).filter(f => f.endsWith(ext)).map(f => dir + "/" + f.split(path.sep).join("/")).sort();
// Langues : le français d'abord (langue par défaut), puis les autres par code.
const langs = list("langues", ".json").map(f => ({ code: path.basename(f, ".json"), ...JSON.parse(fs.readFileSync(path.join(PUB, f), "utf8"))._langue }))
  .sort((a, b) => (a.code !== "fr") - (b.code !== "fr") || a.code.localeCompare(b.code)).map(l => ({ code: l.code, nom: l.nom, locale: l.locale }));
fs.writeFileSync(path.join(PUB, "js/commun/langues.js"), "// Fichier généré par scripts/liste-hors-ligne.cjs (ne pas modifier à la main) : langues proposées dans l'app.\n"
  + "export const LANGUES = " + JSON.stringify(langs) + ";\n");
let sw = fs.readFileSync(SW, "utf8");
const m = sw.match(/const SHELL = \[(.*?)\];/);
const items = [...m[1].matchAll(/"([^"]*)"/g)].map(x => x[1]);
const ver = items.find(i => i.startsWith("app.js?")).slice(6);
let keep = items.filter(i => !i.startsWith("js/") && !i.startsWith("css/") && !i.startsWith("langues/"));
const js = list("js", ".js"), css = list("css", ".css").map(f => f + ver);
const old = items.filter(i => js.includes(i)), js2 = [...old, ...js.filter(f => !old.includes(f))];
const h = keep.indexOf("index.html") + 1; keep = [...keep.slice(0, h), ...css, ...keep.slice(h)];
const d = keep.indexOf("data.js") + 1; const out = [...keep.slice(0, d), ...list("langues", ".json"), ...js2, ...keep.slice(d)];
sw = sw.replace(m[0], "const SHELL = [" + out.map(x => `"${x}"`).join(", ") + "];");
fs.writeFileSync(SW, sw); console.log(out.length + " fichiers dans la liste hors connexion");
