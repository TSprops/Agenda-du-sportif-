// Social : liste de toutes les conversations.
import { $, S, ago, esc } from "../commun/core.js";
import { SOC, openChat, otherOf, unreadOf, who } from "../amis/index.js";
import { t } from "../commun/i18n.js";

/* ---------- Messages : toutes les conversations ---------- */
export function renderMessages() {
  const F = Object.entries(SOC.friends).filter(([, f]) => f.status === "accepted");
  const last = pid => ((SOC.chats[pid] || {}).last || {}).at || 0;
  const withMsg = F.filter(([pid]) => last(pid)).sort((a, b) => (unreadOf(b[0]) - unreadOf(a[0])) || last(b[0]) - last(a[0])), without = F.filter(([pid]) => !last(pid));
  const row = ([pid, f]) => { const u = otherOf(f), w = who(u, 46), c = SOC.chats[pid], un = unreadOf(pid);
    return `<button type="button" class="conv${un ? " unread" : ""}" data-conv="${u}">${w.av}<span class="main"><b>${esc(w.d.pseudo)}</b><span>${c && c.last ? esc(c.last.from === S.uid ? t("messages.toiTexte", { texte: c.last.text }) : c.last.text) : t("messages.demarrer")}</span></span>${c && c.last ? `<small>${esc(ago(c.last.at))}</small>` : ""}${un ? '<i class="dot-new"></i>' : ""}</button>`; };
  $("msgsBody").innerHTML = !F.length ? `<div class="empty">${t("messages.ajouteAmis")}</div><button class="btn primary" data-go="friends">${t("social.ajouterAmis")}</button>`
    : `${withMsg.length ? `<div class="conv-list">${withMsg.map(row).join("")}</div>` : `<div class="empty">${t("messages.aucune")}</div>`}
       ${without.length ? `<section><h2 class="h2">${t("messages.ecrireAmi")}</h2><div class="conv-list">${without.map(row).join("")}</div></section>` : ""}`;
}
$("msgsBody").addEventListener("click", e => { const b = e.target.closest("[data-conv]"); if (b) openChat(b.dataset.conv); });
