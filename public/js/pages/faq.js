// Assistant : questions fréquentes, sans IA.
import { $, BENCH, S } from "../commun/core.js";
import { go } from "../commun/store.js";
import { lsGet, lsSet } from "../commun/install.js";
import { who } from "../amis/index.js";
import { existe, t } from "../commun/i18n.js";

/* ============================================================
   Assistant (FAQ, sans IA)
   ============================================================ */
// Questions fréquentes : question (q), mots-clés de recherche (mots) et réponse (r) dans « assistant.faq.<id> ».
const FAQ_IDS = ["commentFaire", "boutonGo", "creerRoutine", "suivreProgramme", "derniereFois", "recordsDirect", "serie", "plusieursSeances", "carteMusculaire", "partagerBilan", "cordes", "defi", "commenter", "noterSeance", "ajouterSeries", "repos", "enregistrement", "rpe", "photo", "reprendre", "types", "creatine", "complement", "installer", "modifierProfil", "motDePasse", "donneesPrivees", "horsConnexion", "supprimerCompte", "course", "wod", "recordsCrossfit", "calis", "idees", "recordsPR", "progression", "son", "serieCouleur", "ajouterAmi", "messageAmi", "essayerSeanceAmi", "quiVoit", "bloquer", "contacter"];
const FAQ = FAQ_IDS.map(id => ({ q: t(`assistant.faq.${id}.q`), k: t(`assistant.faq.${id}.mots`), a: t(`assistant.faq.${id}.r`) }));
const norm = x => String(x).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9 ]/g, " ");
// Lexique : t = termes exacts (bonus de pertinence), lex = rubrique du lexique.
// Lexique : termes exacts (bonus de pertinence), question, mots-clés et réponse dans « assistant.lexique.<id> » ; lex = rubrique du lexique.
const GLOSS = [["cf", ["wod", "rx", "fortime", "timecap", "amrap", "emom", "tabata", "chipper", "21159", "1rm", "girls", "charges", "metcon", "box", "kipping", "unbroken", "thruster", "wallball", "doubleunder", "t2b", "muscleup", "hspu", "halterophilie", "kbswing", "burpee"]], ["run", ["ef", "seuil", "fractionne", "vma", "allure", "3030", "fc"]]].flatMap(([lex, ids]) => ids.map(id => ({
  lex, t: t(`assistant.lexique.${id}.termes`).split(" "), q: t(`assistant.lexique.${id}.q`), k: t(`assistant.lexique.${id}.mots`), a: t(`assistant.lexique.${id}.r`) })));
GLOSS.forEach(g => FAQ.push(g));
// WOD de référence : une fiche par WOD (« assistant.wodRef.notes.<id> » : conseil en plus, facultatif).
BENCH.forEach(bm => FAQ.push({
  lex: "wod", t: [norm(bm.name).trim()], q: t("assistant.wodRef.question", { nom: bm.name }), k: norm(bm.name) + " wod benchmark", // i18n-ignore (mots-clés identiques partout)
  a: [t("assistant.wodRef.description", { nom: bm.name, desc: bm.desc }), bm.type === "amrap" ? t("assistant.wodRef.amrap", { n: bm.cap }) : t("assistant.wodRef.fortime"),
    existe("assistant.wodRef.notes." + bm.id) ? t("assistant.wodRef.notes." + bm.id) : "", t("assistant.wodRef.noter")].filter(Boolean).join("\n")
}));
// Petits mots ignorés par la recherche (propres à chaque langue).
const STOP = new Set(t("assistant.motsVides").split(" "));
function helpAdd(text, who) {
  const d = document.createElement("div"); d.className = "bubble " + who; d.textContent = text;
  $("helpMsgs").appendChild(d); $("helpMsgs").scrollTop = $("helpMsgs").scrollHeight;
}
function helpSuggest(list, withContact) {
  const w = document.createElement("div"); w.className = "help-sugg";
  list.forEach(i => { const b = document.createElement("button"); b.type = "button"; b.textContent = FAQ[i].q; b.dataset.faq = i; w.appendChild(b); });
  if (withContact) { const b = document.createElement("button"); b.type = "button"; b.textContent = t("assistant.ecrireCreateur"); b.dataset.contact = "1"; w.appendChild(b); }
  $("helpMsgs").appendChild(w); $("helpMsgs").scrollTop = $("helpMsgs").scrollHeight;
}
function helpAnswer(i) { helpAdd(FAQ[i].q, "me"); setTimeout(() => helpAdd(FAQ[i].a, "bot"), 250); }
function helpOpen() {
  $("helpPanel").hidden = false; $("helpFab").hidden = true; $("helpHint").hidden = true;
  if (!$("helpMsgs").children.length) {
    const p = S.profile && S.profile.pseudo;
    helpAdd(p ? t("assistant.bonjourPseudo", { pseudo: p }) : t("assistant.bonjour"), "bot");
    helpSuggest([0, 16, 17, 2, 5, 8], false);
    helpLexButtons();
  }
}
function helpLexButtons() {
  const w = document.createElement("div"); w.className = "help-sugg";
  ["cf", "wod", "run"].forEach(id => {
    const b = document.createElement("button"); b.type = "button"; b.className = "lex"; b.textContent = "📖 " + t("assistant.rubriques." + id); b.dataset.lex = id; w.appendChild(b);
  });
  $("helpMsgs").appendChild(w); $("helpMsgs").scrollTop = $("helpMsgs").scrollHeight;
}
function helpClose() { $("helpPanel").hidden = true; updateFab(); }
$("helpFab").onclick = () => { lsSet("help-hint-off", 1); helpOpen(); };
$("helpClose").onclick = helpClose;
$("helpMsgs").addEventListener("click", e => {
  const b = e.target.closest("button"); if (!b) return;
  if (b.dataset.contact) { helpClose(); go("contactform"); return; }
  if (b.dataset.lex) {
    helpAdd(t("assistant.rubriques." + b.dataset.lex), "me");
    setTimeout(() => { helpAdd(t("assistant.choisisMot"), "bot"); helpSuggest(FAQ.map((f, i) => f.lex === b.dataset.lex ? i : -1).filter(i => i >= 0), false); }, 250);
    return;
  }
  if (b.dataset.faq != null) helpAnswer(+b.dataset.faq);
});
$("helpForm").addEventListener("submit", e => {
  e.preventDefault();
  const text = $("helpInput").value.trim(); if (!text) return;
  $("helpInput").value = ""; helpAdd(text, "me");
  const raw = norm(text), words = raw.split(" ").filter(w => w.length > 1 && !STOP.has(w));
  const joined = raw.replace(/\s+/g, "");
  const scored = FAQ.map((f, i) => {
    const hay = norm(f.k + " " + f.q);
    let score = words.reduce((a, w) => a + (w.length > 2 && (hay.includes(w) || hay.includes(w.replace(/s$/, ""))) ? 1 : 0) + ((f.t || []).includes(w) ? 3 : 0), 0);
    (f.t || []).forEach(x => { if (x.length > 3 && !words.includes(x) && joined.includes(x)) score += 3; });
    return { i, score };
  }).filter(x => x.score > 0).sort((a, b) => b.score - a.score);
  setTimeout(() => {
    if (scored.length) {
      helpAdd(FAQ[scored[0].i].a, "bot");
      const more = scored.slice(1, 3).filter(x => x.score >= Math.max(2, scored[0].score));
      if (more.length) { helpAdd(t("assistant.aussi"), "bot"); helpSuggest(more.map(x => x.i), false); }
    } else {
      helpAdd(t("assistant.pasTrouve"), "bot");
      helpSuggest([0, 10, 12], true);
    }
  }, 300);
});
const FAB_SCREENS = ["home", "seances", "nutrition", "complements", "creatine", "contact", "profile", "crossfit", "types", "hub", "records", "rec", "progress", "prog", "friends", "friend", "go", "social", "messages", "share", "challenges", "challenge", "ranks", "muscles", "recap", "routines", "programs"];
let hintReady = false;
setTimeout(() => { hintReady = true; updateFab(); }, 2500);
function updateFab() {
  $("helpFab").hidden = !FAB_SCREENS.includes(S.screen) || !$("helpPanel").hidden;
  $("helpHint").hidden = $("helpFab").hidden || !hintReady || !!lsGet("help-hint-off");
}
function hideHint() { lsSet("help-hint-off", 1); $("helpHint").hidden = true; }
$("helpHintClose").onclick = hideHint;
$("helpHintOpen").onclick = () => { hideHint(); helpOpen(); };

export { FAB_SCREENS, norm, updateFab };
