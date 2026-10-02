// Vérifie les traductions (lancé par npm test, ou seul : node scripts/verifier-traductions.cjs) :
// - chaque langue de public/langues/ a exactement les clés du français, avec les mêmes variables {x} et balises ;
// - chaque clé utilisée dans le code existe, et chaque clé du français sert quelque part ;
// - il ne reste aucun texte visible en dur dans index.html, data.js et js/ (hors langues.js et i18n.js).
// Une ligne de code peut être exclue avec le commentaire « i18n-ignore » (texte technique jamais affiché).
const fs = require("fs"), path = require("path");
const PUB = path.join(__dirname, "..", "public");
const lire = f => fs.readFileSync(path.join(PUB, f), "utf8");
const list = (dir, ext) => fs.readdirSync(path.join(PUB, dir), { recursive: true }).filter(f => f.endsWith(ext)).map(f => dir + "/" + f.split(path.sep).join("/")).sort();
function aplatir(o, pre = "", out = {}) {
  for (const [k, v] of Object.entries(o)) { if (k === "_langue") continue; if (v && typeof v === "object") aplatir(v, pre + k + ".", out); else out[pre + k] = v; }
  return out;
}
const vars = s => [...String(s).matchAll(/\{(\w+)\}/g)].map(m => m[1]).sort().join(",");
const balises = s => [...String(s).matchAll(/<\/?([a-z0-9]+)/gi)].map(m => m[1].toLowerCase()).sort().join(",");
const sansPluriel = k => k.replace(/_(zero|one|two|few|many|other)$/, "");

// Textes français laissés dans le code : mots courants ou lettres accentuées dans une chaîne.
const FRANCAIS = /[a-zàâçéèêëîïôûùüÿœ’]{2,}[  ]+[a-zàâçéèêëîïôûùüÿœ]|[àâçéèêëîïôûùüœ]|\b(tes|ton|ta|mes|mon|une|des|les|pour|avec|dans|sur|jour|jours|séance)\b/i;
function chainesJs(src) {
  const out = []; let i = 0, ligne = 1;
  const lignes = src.split("\n");
  while (i < src.length) {
    const c = src[i];
    if (c === "\n") { ligne++; i++; continue; }
    if (c === "/" && src[i + 1] === "/") { while (i < src.length && src[i] !== "\n") i++; continue; }
    if (c === "/" && src[i + 1] === "*") { const j = src.indexOf("*/", i + 2); ligne += src.slice(i, j).split("\n").length - 1; i = j + 2; continue; }
    const avant = c === "/" && src[i + 1] !== "/" && src[i + 1] !== "*" ? src.slice(Math.max(0, i - 12), i).trimEnd() : null;
    if (avant !== null && (avant === "" || /[(,=:[!&|?{};+\-*%<>~^]$/.test(avant) || /\b(return|typeof)$/.test(avant))) {
      // Expression régulière : on la saute jusqu'au « / » final (hors classe [...]).
      let j = i + 1, classe = false;
      while (j < src.length && src[j] !== "\n") { const d = src[j]; if (d === "\\") { j += 2; continue; } if (d === "[") classe = true; else if (d === "]") classe = false; else if (d === "/" && !classe) break; j++; }
      i = j + 1; continue;
    }
    if (c === '"' || c === "'" || c === "`") {
      let j = i + 1, txt = "", prof = 0;
      const debut = ligne;
      while (j < src.length) {
        const d = src[j];
        if (d === "\\") { txt += src[j + 1]; j += 2; continue; }
        if (d === "\n") ligne++;
        if (c === "`" && d === "$" && src[j + 1] === "{") { // ${…} : on saute l'expression (les chaînes qu'elle contient sont vues à part)
          let k = j + 2; prof = 1;
          while (k < src.length && prof) { if (src[k] === "{") prof++; else if (src[k] === "}") prof--; else if (src[k] === "\n") ligne++; k++; }
          out.push(...chainesJs(src.slice(j + 2, k - 1)).map(x => ({ ...x, ligne: x.ligne + debut - 1 })));
          txt += " "; j = k; continue;
        }
        if (d === c) break;
        txt += d; j++;
      }
      out.push({ txt, ligne: debut, code: lignes[debut - 1] || "" });
      i = j + 1; continue;
    }
    i++;
  }
  return out;
}
const UNITES = /(^|[\s\d(/])(km\/h|km|kg|cm|min|reps?|rpe|1rm|bpm|ui|mg|g|m|s|h)(?=$|[\s\d).,/])/gi;
function visible(txt) {
  if (/color-mix\(|^[\w-]+:[^;]*;|url\(|\d+px\b|\$\d/.test(txt)) return false; // CSS, police, remplacement d'expression régulière
  const sansHtml = txt.replace(/<[^>]*>/g, " ").replace(/&[a-z]+;/g, " ").replace(UNITES, "$1 ");
  return /[A-Za-zÀ-ÿ]/.test(sansHtml) && FRANCAIS.test(sansHtml) && !CANONIQUES.has(txt.trim());
}

// Noms propres et adresses identiques dans toutes les langues.
const NOMS_PROPRES = /^\s*(AS|Sport|AS Sport|CrossFit|Hyrox|[a-z0-9.-]+\.(app|com|fr))\s*$/;
// Valeurs enregistrées en base en français (noms d'exercices…) : identifiants permis dans le code.
let CANONIQUES = new Set();
function verifier() {
  const res = { manquantes: [], enTrop: [], variables: [], inconnues: [], inutiles: [], enDur: [] };
  const langues = list("langues", ".json").map(f => [path.basename(f, ".json"), aplatir(JSON.parse(lire(f)))]);
  const fr = Object.fromEntries(langues).fr;
  CANONIQUES = new Set(Object.entries(fr).filter(([k]) => /^(exercices\.noms|valeurs)\./.test(k)).map(([, v]) => v));
  for (const [code, d] of langues) {
    if (code === "fr") continue;
    for (const k of Object.keys(fr)) if (!(k in d) && !(/_(zero|one|two|few|many)$/.test(k) && (sansPluriel(k) + "_other") in d)) res.manquantes.push(code + " : " + k);
    for (const k of Object.keys(d)) {
      if (!(k in fr) && !(/_(zero|one|two|few|many)$/.test(k) && (sansPluriel(k) + "_other") in fr)) res.enTrop.push(code + " : " + k);
      else if (k in fr && (vars(fr[k]) !== vars(d[k]) || balises(fr[k]) !== balises(d[k]))) res.variables.push(code + " : " + k);
    }
  }
  // Clés utilisées dans le code
  const fichiers = ["index.html", "data.js", ...list("js", ".js").filter(f => !f.endsWith("/i18n.js"))];
  const utilisees = new Set(), prefixes = new Set();
  for (const f of fichiers) {
    const src = lire(f);
    for (const m of src.matchAll(/data-i18n(?:-[a-z-]+)?="([^"]+)"/g)) utilisees.add(m[1]);
    for (const m of src.matchAll(/\bt\(\s*"([^"]+)"(\s*\+)?/g)) (m[2] ? prefixes : utilisees).add(m[1]);
    for (const m of src.matchAll(/\b(?:t|tFr)\(\s*"([^"]+)"\s*\+/g)) prefixes.add(m[1]);
    for (const m of src.matchAll(/"([a-zA-Z]+(?:\.[a-zA-Z0-9-]+)+)"/g)) if (m[1] in fr || (m[1] + "_other") in fr) utilisees.add(m[1]); // clés écrites dans une condition
    for (const m of src.matchAll(/\bt\(\s*`([^`$]*)\$\{/g)) prefixes.add(m[1]);
    for (const m of src.matchAll(/\b(?:valeur|canon|idDe|tPref)\(\s*"([^"]+)"/g)) prefixes.add(m[1] + ".");
    for (const m of src.matchAll(/["`]([a-zA-Z]+(?:\.[a-zA-Z0-9-]+)+\.)["`]/g)) prefixes.add(m[1]); // préfixes de clés écrits à part (« "accueil.stats." + id »)
    for (const m of src.matchAll(/\/\/ i18n-cles : (.+)/g)) m[1].split(/[ ,]+/).forEach(k => k && (k.endsWith(".") ? prefixes.add(k) : utilisees.add(k)));
  }
  const cles = new Set(Object.keys(fr).map(sansPluriel));
  for (const k of utilisees) if (!cles.has(k)) res.inconnues.push(k);
  for (const k of cles) if (!utilisees.has(k) && ![...prefixes].some(p => k.startsWith(p)) && !k.startsWith("secours.")) res.inutiles.push(k);
  // Textes en dur dans le JS
  for (const f of ["data.js", ...list("js", ".js")]) {
    if (f.endsWith("/i18n.js") || f.endsWith("/langues.js")) continue;
    for (const s of chainesJs(lire(f))) {
      if (/i18n-ignore/.test(s.code) || /console\.(log|warn|error)/.test(s.code)) continue;
      if (visible(s.txt)) res.enDur.push(`${f}:${s.ligne} « ${s.txt.replace(/\s+/g, " ").trim().slice(0, 70)} »`);
    }
  }
  // Textes en dur dans index.html : texte hors d'un élément traduit, attributs visibles non traduits.
  const html = lire("index.html").replace(/<!doctype[^>]*>/i, "").replace(/<script[\s\S]*?<\/script>/g, "").replace(/<!--[\s\S]*?-->/g, "").replace(/<svg[\s\S]*?<\/svg>/g, s => /aria-label="[^"]*"/.test(s) && !/data-i18n-aria-label/.test(s) ? "<svg aria-label>" : "");
  const pile = []; let pos = 0;
  for (const m of html.matchAll(/<(\/?)([a-z0-9]+)([^>]*)>|([^<]+)/gi)) {
    if (m[4] !== undefined) {
      const txt = m[4].replace(/&[a-z#0-9]+;/g, " ");
      if (/[A-Za-zÀ-ÿ]{2,}/.test(txt) && !pile.some(e => /data-i18n(-html)?=/.test(e.attrs)) && !NOMS_PROPRES.test(txt))
        res.enDur.push(`index.html « ${txt.trim().slice(0, 60)} »`);
      continue;
    }
    const [, ferme, tag, attrs] = m;
    if (ferme) { while (pile.length && pile.pop().tag !== tag.toLowerCase()); continue; }
    for (const a of ["placeholder", "aria-label", "title", "alt"]) {
      const v = attrs.match(new RegExp(`\\s${a}="([^"]*)"`));
      if (v && /[A-Za-zÀ-ÿ]{2,}/.test(v[1]) && !new RegExp(`data-i18n-${a}=`).test(attrs)) res.enDur.push(`index.html ${a}="${v[1]}"`);
    }
    if (!/\/$/.test(attrs) && !/^(meta|link|input|img|br|hr|source)$/i.test(tag)) pile.push({ tag: tag.toLowerCase(), attrs });
  }
  return res;
}
module.exports = verifier;
if (require.main === module) {
  const r = verifier(); let n = 0;
  for (const [k, v] of Object.entries(r)) { if (!v.length) continue; n += v.length; console.log(`\n${k} (${v.length})`); v.slice(0, +process.argv[2] || 40).forEach(x => console.log("  " + x)); }
  console.log(n ? `\n${n} problème(s)` : "Traductions : tout est en ordre.");
  process.exit(n ? 1 : 0);
}
