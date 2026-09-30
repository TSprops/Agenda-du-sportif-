// Met à jour la liste SHELL de public/sw.js (fichiers gardés pour le mode hors connexion) :
// toutes les feuilles de public/css/ (avec la version ?v=…) et tous les fichiers de public/js/.
// À lancer après avoir ajouté, renommé ou supprimé un fichier : node scripts/liste-hors-ligne.cjs
const fs = require("fs"), path = require("path");
const PUB = path.join(__dirname, "..", "public"), SW = path.join(PUB, "sw.js");
const list = (dir, ext) => fs.readdirSync(path.join(PUB, dir), { recursive: true }).filter(f => f.endsWith(ext)).map(f => dir + "/" + f.split(path.sep).join("/")).sort();
let sw = fs.readFileSync(SW, "utf8");
const m = sw.match(/const SHELL = \[(.*?)\];/);
const items = [...m[1].matchAll(/"([^"]*)"/g)].map(x => x[1]);
const ver = items.find(i => i.startsWith("app.js?")).slice(6);
let keep = items.filter(i => !i.startsWith("js/") && !i.startsWith("css/"));
const js = list("js", ".js"), css = list("css", ".css").map(f => f + ver);
const old = items.filter(i => js.includes(i)), js2 = [...old, ...js.filter(f => !old.includes(f))];
const h = keep.indexOf("index.html") + 1; keep = [...keep.slice(0, h), ...css, ...keep.slice(h)];
const d = keep.indexOf("data.js") + 1; const out = [...keep.slice(0, d), ...js2, ...keep.slice(d)];
sw = sw.replace(m[0], "const SHELL = [" + out.map(x => `"${x}"`).join(", ") + "];");
fs.writeFileSync(SW, sw); console.log(out.length + " fichiers dans la liste hors connexion");
