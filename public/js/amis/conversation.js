// Amis : conversation privée et signalement.
import { SOC, pairId, pairOf } from "./etat.js";
import { blockUser } from "./liste.js";
import { openFriend } from "./page-ami.js";
import { $, S, addDoc, armed, avatarHTML, collection, db, doc, esc, key, limitToLast, onSnapshot, orderBy, pad, query, setDoc, todayK } from "../commun/core.js";
import { shortDate } from "../idees/index.js";
import { bannedStop } from "../social/index.js";
import { go } from "../commun/store.js";
import { heure, t } from "../commun/i18n.js";

/* ---------- Messages ---------- */
export function openChat(uid) {
  const pid = pairId(S.uid, uid);
  if (SOC.chatUnsub) SOC.chatUnsub();
  if (S.screen !== "chat") SOC.chatFrom = S.screen;
  SOC.chatUid = uid; SOC.msgs = []; SOC.reportMid = null; SOC.menu = false; go("chat");
  setDoc(doc(db, "chats", pid), { users: pairOf(S.uid, uid), read: { [S.uid]: Date.now() } }, { merge: true }).catch(() => {});
  SOC.chatUnsub = onSnapshot(query(collection(db, "chats", pid, "messages"), orderBy("at"), limitToLast(150)), snap => {
    SOC.msgs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    renderChatMsgs(true);
    if (S.screen === "chat") setDoc(doc(db, "chats", pid), { read: { [S.uid]: Date.now() } }, { merge: true }).catch(() => {});
  }, () => { $("chatMsgs").innerHTML = `<p class="hint" style="text-align:center">${t("conversation.indisponible")}</p>`; });
}
export function renderChat() {
  const d = SOC.dir[SOC.chatUid] || { pseudo: "…" };
  $("chatWho").innerHTML = `${avatarHTML({ pseudo: d.pseudo, photo: d.photo }, 36)}<b>${esc(d.pseudo)}</b>`;
  $("chatMenu").hidden = !SOC.menu;
  renderChatMsgs(true);
}
function renderChatMsgs(scroll) {
  const box = $("chatMsgs"); if (!box) return;
  let lastDay = "";
  box.innerHTML = SOC.msgs.length ? SOC.msgs.map(m => {
    const k = key(new Date(m.at)), day = k !== lastDay ? `<p class="chat-day">${esc(k === todayK() ? t("commun.aujourdhui") : shortDate(k))}</p>` : ""; lastDay = k;
    const mine = m.from === S.uid;
    return `${day}<div class="bubble ${mine ? "me" : "bot"}" data-mid="${m.id}">${esc(m.text)}<small>${esc(heure(m.at))}</small></div>${!mine && SOC.reportMid === m.id ? `<button type="button" class="report-btn" data-report="${m.id}">${t("conversation.signalerMessage")}</button>` : ""}`;
  }).join("") : `<p class="hint" style="text-align:center;margin-top:30px">${t("conversation.vide")}</p>`;
  if (scroll) box.scrollTop = box.scrollHeight;
}
// Signalement envoyé à l'administrateur. ref = chemin du contenu, pour pouvoir le supprimer.
export async function reportContent(o) {
  const d = SOC.dir[o.target] || {};
  await addDoc(collection(db, "reports"), { from: S.uid, fromPseudo: S.profile.pseudo, target: o.target || "", targetPseudo: o.targetPseudo || d.pseudo || "", text: String(o.text || "").slice(0, 1200), kind: o.kind, ref: o.ref || null, at: Date.now() });
}
$("chatForm").addEventListener("submit", async e => {
  e.preventDefault();
  if (bannedStop()) return;
  const inp = $("chatInput"), text = inp.value.trim(); if (!text) return;
  const pid = pairId(S.uid, SOC.chatUid), at = Date.now(); inp.value = "";
  try {
    await addDoc(collection(db, "chats", pid, "messages"), { from: S.uid, text: text.slice(0, 1000), at });
    await setDoc(doc(db, "chats", pid), { users: pairOf(S.uid, SOC.chatUid), last: { text: text.slice(0, 80), from: S.uid, at }, read: { [S.uid]: at } }, { merge: true });
  } catch (x) { inp.value = text; $("chatMsgs").insertAdjacentHTML("beforeend", `<p class="err" style="text-align:center">${t("conversation.nonEnvoye")}</p>`); }
});
$("chatBack").onclick = () => go(["messages", "friend", "friends", "feed"].includes(SOC.chatFrom) ? SOC.chatFrom : "friends");
$("v-chat").addEventListener("click", async e => {
  const b = e.target.closest("[data-mid]");
  if (b && !b.classList.contains("me")) { SOC.reportMid = SOC.reportMid === b.dataset.mid ? null : b.dataset.mid; renderChatMsgs(false); return; }
  const btn = e.target.closest("button"); if (!btn) return;
  if (btn.id === "chatMore") { SOC.menu = !SOC.menu; $("chatMenu").hidden = !SOC.menu; return; }
  if (btn.id === "chatWho") { openFriend(SOC.chatUid); return; }
  if (btn.dataset.report) {
    const m = SOC.msgs.find(x => x.id === btn.dataset.report); if (!m) return;
    try { await reportContent({ target: SOC.chatUid, kind: "message", text: m.text, ref: `chats/${pairId(S.uid, SOC.chatUid)}/messages/${m.id}` }); btn.textContent = t("conversation.signale"); btn.disabled = true; } catch (x) { btn.textContent = t("commun.echecReessaie"); }
    return;
  }
  if (btn.dataset.cm === "profile") { openFriend(SOC.chatUid); return; }
  if (btn.dataset.cm === "report") {
    const last = SOC.msgs.filter(m => m.from !== S.uid).slice(-10).map(m => t("conversation.citation", { texte: m.text })).join("\n");
    try { await reportContent({ target: SOC.chatUid, kind: "conversation", text: last || t("conversation.videSignalement"), ref: `chats/${pairId(S.uid, SOC.chatUid)}` }); btn.textContent = t("conversation.signalee"); btn.disabled = true; } catch (x) { btn.textContent = t("commun.echecReessaie"); }
    return;
  }
  if (btn.dataset.cm === "block") { if (!armed(btn, t("conversation.toucherBloquer"))) return; await blockUser(SOC.chatUid); go("friends"); }
});
export function leaveChat() { if (SOC.chatUnsub) { SOC.chatUnsub(); SOC.chatUnsub = null; } }
