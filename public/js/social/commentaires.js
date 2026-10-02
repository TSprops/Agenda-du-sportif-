// Social : commentaires (affichage, envoi, suppression, partout dans l'app).
import { bannedStop } from "./accueil.js";
import { renderFeed } from "./fil.js";
import { $, S, addDoc, ago, armed, collection, db, deleteDoc, doc, esc } from "../commun/core.js";
import { toast } from "../entrainement/index.js";
import { SOC, renderFriend, reportContent } from "../amis/index.js";
import { t } from "../commun/i18n.js";

/* ---------- Commentaires ---------- */
async function postComment(owner, k, text) {
  const data = { date: k, from: S.uid, pseudo: S.profile.pseudo, text: text.slice(0, 500), at: Date.now() };
  const ref = await addDoc(collection(db, "comments", owner, "items"), data);
  return { id: ref.id, owner, ...data };
}
export function commentsHTML(list, owner, k, opt) {
  const o = opt || {}, all = list.filter(c => c.date === k).sort((a, b) => a.at - b.at), show = o.all ? all : all.slice(-2);
  return `<div class="comments" data-cowner="${owner}" data-ck="${esc(k)}">
    ${all.length > show.length ? `<button type="button" class="linkish c-more" data-callk="${esc(k)}">${t("commentaires.voirTous", { n: all.length })}</button>` : ""}
    ${show.map(c => { const d = SOC.dir[c.from] || {}; return `<p class="cmt"><b>${esc(c.from === S.uid ? t("social.toi") : d.pseudo || c.pseudo || t("social.ami"))}</b> ${esc(c.text)} <small>${esc(ago(c.at))}</small>${c.from === S.uid || owner === S.uid ? `<button type="button" class="c-del" data-cdel="${owner}|${c.id}" aria-label="${esc(t("commentaires.supprimer"))}">✕</button>` : ""}${c.from !== S.uid ? `<button type="button" class="c-del" data-crep="${owner}|${c.id}" aria-label="${esc(t("commentaires.signaler"))}">⚑</button>` : ""}</p>`; }).join("")}
    <form class="c-form" data-cform="${owner}|${esc(k)}"><input placeholder="${esc(t(owner === S.uid ? "commentaires.repondre" : "commentaires.ecrire"))}" maxlength="500" aria-label="${esc(t("commentaires.commentaire"))}"><button class="btn sm" type="submit">${t("commun.envoyer")}</button></form>
  </div>`;
}
// Commentaires sur ma séance (dans la fiche du jour).
export function myCommentsHTML(k) {
  const list = (SOC.myComments || []).filter(c => c.date === k);
  if (!list.length) return "";
  return `<div class="lbl">${t("commentaires.deTesAmis")} <em>${list.length}</em></div>${commentsHTML(SOC.myComments, S.uid, k, { all: true })}`;
}
// Envoi et suppression, partout dans l'app (fiche, fil, page d'un ami).
document.addEventListener("submit", async e => {
  const f = e.target.closest("[data-cform]"); if (!f) return;
  e.preventDefault();
  if (bannedStop()) return;
  const inp = f.querySelector("input"), text = inp.value.trim(); if (!text) return;
  const [owner, k] = f.dataset.cform.split("|"); inp.value = ""; inp.disabled = true;
  try {
    const c = await postComment(owner, k, text);
    if (owner !== S.uid) { [SOC.feed && SOC.feed.by[owner], SOC.friendUid === owner && SOC.friendData].forEach(x => { if (x) (x.comments = x.comments || []).push(c); }); }
    SOC.openCmt = k; rerenderComments();
  } catch (x) { inp.value = text; toast(t("commentaires.nonEnvoye")); }
  inp.disabled = false;
});
function findComment(owner, id) {
  const lists = [SOC.myComments, SOC.feed && SOC.feed.by[owner] && SOC.feed.by[owner].comments, SOC.friendUid === owner && SOC.friendData && SOC.friendData.comments];
  for (const l of lists) { const c = (l || []).find(x => x.id === id); if (c) return c; }
  return null;
}
document.addEventListener("click", async e => {
  const rp = e.target.closest("[data-crep]");
  if (rp) {
    if (!armed(rp, t("commentaires.signalerQ"))) return;
    const [owner, id] = rp.dataset.crep.split("|"), c = findComment(owner, id); if (!c) return;
    SOC.reported = SOC.reported || new Set();
    if (SOC.reported.has(id)) { toast(t("commentaires.dejaSignale")); return; }
    SOC.reported.add(id);
    try { await reportContent({ target: c.from, targetPseudo: c.pseudo, kind: "comment", text: c.text, ref: `comments/${owner}/items/${id}` }); toast(t("commentaires.signale")); }
    catch (x) { SOC.reported.delete(id); toast(t("commentaires.signalementImpossible")); }
    return;
  }
  const m = e.target.closest("[data-callk]"); if (m) { SOC.openCmt = m.dataset.callk; rerenderComments(true); return; }
  const d = e.target.closest("[data-cdel]"); if (!d) return;
  if (!armed(d, t("commentaires.supprimerQ"))) return;
  const [owner, id] = d.dataset.cdel.split("|");
  try {
    await deleteDoc(doc(db, "comments", owner, "items", id));
    [SOC.feed && SOC.feed.by[owner], SOC.friendUid === owner && SOC.friendData].forEach(x => { if (x && x.comments) x.comments = x.comments.filter(c => c.id !== id); });
    rerenderComments();
  } catch (x) { toast(t("commentaires.suppressionImpossible")); }
});
function rerenderComments() {
  if (S.screen === "social") renderFeed();
  if (S.screen === "friend") renderFriend();
  if (S.open) { const el = $("myComments"); if (el) el.innerHTML = myCommentsHTML(S.open); }
}
