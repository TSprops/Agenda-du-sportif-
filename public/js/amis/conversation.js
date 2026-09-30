// Amis : conversation privée et signalement.
import { SOC, pairId, pairOf } from "./etat.js";
import { blockUser } from "./liste.js";
import { openFriend } from "./page-ami.js";
import { $, S, addDoc, armed, avatarHTML, collection, db, doc, esc, key, limitToLast, onSnapshot, orderBy, pad, query, setDoc, todayK } from "../core.js";
import { shortDate } from "../idees/index.js";
import { bannedStop } from "../social/index.js";
import { go } from "../store.js";

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
  }, () => { $("chatMsgs").innerHTML = `<p class="hint" style="text-align:center">Conversation indisponible.</p>`; });
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
    const k = key(new Date(m.at)), day = k !== lastDay ? `<p class="chat-day">${esc(k === todayK() ? "Aujourd’hui" : shortDate(k))}</p>` : ""; lastDay = k;
    const mine = m.from === S.uid, t = new Date(m.at);
    return `${day}<div class="bubble ${mine ? "me" : "bot"}" data-mid="${m.id}">${esc(m.text)}<small>${pad(t.getHours())}:${pad(t.getMinutes())}</small></div>${!mine && SOC.reportMid === m.id ? `<button type="button" class="report-btn" data-report="${m.id}">Signaler ce message</button>` : ""}`;
  }).join("") : `<p class="hint" style="text-align:center;margin-top:30px">Dis bonjour 👋<br>Les messages ne sont visibles que par vous deux.</p>`;
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
  } catch (x) { inp.value = text; $("chatMsgs").insertAdjacentHTML("beforeend", `<p class="err" style="text-align:center">Message non envoyé : vous n’êtes peut-être plus amis.</p>`); }
});
$("chatBack").onclick = () => go(["messages", "friend", "friends", "feed"].includes(SOC.chatFrom) ? SOC.chatFrom : "friends");
$("v-chat").addEventListener("click", async e => {
  const b = e.target.closest("[data-mid]");
  if (b && !b.classList.contains("me")) { SOC.reportMid = SOC.reportMid === b.dataset.mid ? null : b.dataset.mid; renderChatMsgs(false); return; }
  const t = e.target.closest("button"); if (!t) return;
  if (t.id === "chatMore") { SOC.menu = !SOC.menu; $("chatMenu").hidden = !SOC.menu; return; }
  if (t.id === "chatWho") { openFriend(SOC.chatUid); return; }
  if (t.dataset.report) {
    const m = SOC.msgs.find(x => x.id === t.dataset.report); if (!m) return;
    try { await reportContent({ target: SOC.chatUid, kind: "message", text: m.text, ref: `chats/${pairId(S.uid, SOC.chatUid)}/messages/${m.id}` }); t.textContent = "Signalé ✓ Merci"; t.disabled = true; } catch (x) { t.textContent = "Échec, réessaie"; }
    return;
  }
  if (t.dataset.cm === "profile") { openFriend(SOC.chatUid); return; }
  if (t.dataset.cm === "report") {
    const last = SOC.msgs.filter(m => m.from !== S.uid).slice(-10).map(m => "« " + m.text + " »").join("\n");
    try { await reportContent({ target: SOC.chatUid, kind: "conversation", text: last || "(conversation vide)", ref: `chats/${pairId(S.uid, SOC.chatUid)}` }); t.textContent = "Conversation signalée ✓"; t.disabled = true; } catch (x) { t.textContent = "Échec, réessaie"; }
    return;
  }
  if (t.dataset.cm === "block") { if (!armed(t, "Toucher à nouveau pour bloquer")) return; await blockUser(SOC.chatUid); go("friends"); }
});
export function leaveChat() { if (SOC.chatUnsub) { SOC.chatUnsub(); SOC.chatUnsub = null; } }
