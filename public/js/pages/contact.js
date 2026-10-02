// Page Contact.
import { $, OBJETS, S, addDoc, collection, db, esc, fmtDate, getDocs, query, show, where } from "../commun/core.js";
import { t, valeur } from "../commun/i18n.js";

/* ============================================================
   Accueil
   ============================================================ */
/* ============================================================
   Contact
   ============================================================ */
let ctObjet = "";
function renderObjets() { $("ctObjets").innerHTML = OBJETS.map(o => `<button type="button" class="chip" data-objet="${esc(o)}" aria-pressed="${o === ctObjet}">${esc(valeur("valeurs.objets", o))}</button>`).join(""); }
$("ctObjets").addEventListener("click", e => { const b = e.target.closest("[data-objet]"); if (!b) return; ctObjet = b.dataset.objet; renderObjets(); });
function msgHTML(m) { return `<div class="msg"><div class="msg-top"><span class="tag">${esc(valeur("valeurs.objets", m.objet))}</span><small>${esc(fmtDate(m.at))}</small>${m.lu ? `<span class="tag done">${t("contact.lu")}</span>` : ""}</div><p>${esc(m.texte)}</p></div>`; }
async function loadMyMessages() {
  try {
    const snap = await getDocs(query(collection(db, "messages"), where("uid", "==", S.uid)));
    S.myMsgs = snap.docs.map(d => ({ id: d.id, ...d.data() })).sort((a, b) => b.at - a.at);
  } catch (e) { /* pas de réseau : on garde la liste actuelle */ }
}
function renderContact() {
  const draw = () => { $("myMsgsWrap").hidden = !S.myMsgs.length; $("myMsgs").innerHTML = S.myMsgs.map(msgHTML).join(""); };
  draw(); loadMyMessages().then(() => { if (S.screen === "contact") draw(); });
}
$("ctForm").addEventListener("submit", async e => {
  e.preventDefault();
  const texte = $("ctText").value.trim(), mail = $("ctMail").value.trim(), err = $("ctErr");
  if (!ctObjet) { show(err, t("contact.choisisObjet")); return; }
  if (texte.length < 3) { show(err, t("contact.ecrisMessage")); return; }
  err.hidden = true; $("ctSend").disabled = true; $("ctSend").textContent = t("contact.envoi");
  try {
    await addDoc(collection(db, "messages"), {
      uid: S.uid, pseudo: (S.profile && S.profile.pseudo) || "", objet: ctObjet, texte: texte.slice(0, 3000),
      email: mail.slice(0, 120), at: Date.now(), lu: false
    });
    $("ctForm").hidden = true; $("ctDone").hidden = false; $("ctText").value = ""; ctObjet = "";
  } catch (x) { show(err, t("contact.echec")); }
  $("ctSend").disabled = false; $("ctSend").textContent = t("commun.envoyer");
});

export { renderContact, renderObjets };
