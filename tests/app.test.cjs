// Parcours dans l'app (navigateur Chromium via Playwright).
const { chromium } = require("playwright");
const { BASE, put, signupPage, screen, home } = require("./helpers.cjs");

module.exports = async function appTests(t) {
  const browser = await chromium.launch();
  try {
    // Inscription : les conditions sont obligatoires.
    const A = await signupPage(browser, "Alice");
    t("inscription avec conditions acceptées", await screen(A), "v-home");

    // Séance : bibliothèque, dernière fois, record en direct.
    await A.click("[data-go=go]"); await A.click("[data-gonew]"); await A.click("[data-a=disc][data-id=muscu]"); await A.click("[data-a=type][data-id=push]");
    await A.click("[data-a=add-ex]"); await A.fill("#libQ", "couch"); await A.waitForTimeout(200); await A.click('#libList [data-lib="Développé couché"]');
    await A.fill("#r-0-0", "8"); await A.fill("#k-0-0", "80"); await A.click("#go-0"); await A.click("#rtSkip");
    await A.click("[data-a=close]"); await A.waitForTimeout(500);
    await A.click("#v-seances .back"); await A.click("[data-gonew]"); await A.click("[data-a=disc][data-id=muscu]"); await A.click("[data-a=type][data-id=push]");
    await A.click("[data-a=add-ex]"); await A.fill("#libQ", "couch"); await A.waitForTimeout(200);
    // « ? » directement dans la recherche : on voit le mouvement sans ajouter l'exercice.
    await A.click('#libList [data-how="lib"][data-name="Développé couché"]'); await A.waitForSelector("#howSheet:not([hidden])");
    t("comment faire depuis la recherche", await A.textContent("#howTitle"), "Développé couché");
    t("comment faire : placement des mains", await A.$eval("#howGrip", e => !e.hidden && !!e.querySelector("svg.hg")), true);
    await A.click("#howClose");
    t("recherche toujours ouverte, rien d'ajouté", await A.isVisible('#libList [data-lib="Développé couché"]') && !(await A.$("#k-0-0")), true);
    await A.click('#libList [data-lib="Développé couché"]');
    t("poids de la dernière fois repris", await A.inputValue("#k-0-0"), "80");
    // « Comment faire » : silhouette animée.
    t("comment faire : rien de dessiné avant l'ouverture", await A.$eval("#howStage", e => e.children.length), 0);
    t("comment faire : bouton accessible", await A.getAttribute("[data-how='0']", "aria-label"), "Comment faire : Développé couché");
    t("comment faire : zone tactile ≥ 44 px", await A.$eval("[data-how='0']", e => e.getBoundingClientRect().width >= 44 && e.getBoundingClientRect().height >= 44), true);
    await A.click("[data-how='0']"); await A.waitForSelector("#howSheet:not([hidden])");
    t("comment faire : focus sur la croix", await A.evaluate(() => document.activeElement.id), "howClose");
    t("comment faire : profil et face en boomerang", await A.$$eval("#howStage .how-anim svg", x => x.length), 4);
    t("comment faire : fond inerte", await A.$eval("#sheet", e => e.inert), true);
    await A.keyboard.press("Escape");
    t("comment faire : fermé par Échap", await A.$eval("#howSheet", e => e.hidden), true);
    t("comment faire : focus rendu au bouton", await A.evaluate(() => document.activeElement.dataset.how), "0");
    t("comment faire : fond de nouveau actif", await A.$eval("#sheet", e => e.inert), false);
    await A.click("[data-how='0']"); await A.click("#howBackdrop", { position: { x: 20, y: 20 } });
    t("comment faire : fermé par un toucher sur le fond", await A.$eval("#howSheet", e => e.hidden), true);
    await A.emulateMedia({ reducedMotion: "reduce" }); await A.click("[data-how='0']");
    t("comment faire : sans animation, poses côte à côte", await A.$$eval("#howStage.side figure", x => x.length), 4);
    await A.click("#howClose"); await A.emulateMedia({ reducedMotion: "no-preference" });
    await A.fill("#r-0-0", "6"); await A.fill("#k-0-0", "85"); await A.click("#go-0"); await A.waitForTimeout(300);
    t("record en direct", /Nouveau record/.test(await A.textContent("#toast")), true);
    await A.click("#rtSkip"); await A.click("[data-a=close]"); await A.waitForTimeout(500);

    // Programme et routine : la séance se prépare toute seule.
    await home(A); await A.click("[data-go=go]"); await A.click(".go-tile[data-go=programs]"); await A.click("[data-pgstart=ppl]"); await A.waitForTimeout(300);
    await A.click("[data-pgnext]"); await A.waitForSelector("#f-title", { timeout: 8000 });
    t("programme : séance prête", await A.inputValue("#f-title"), "Push");
    t("programme : noms d'exercices verrouillés", await A.$eval("#exn-0", e => e.readOnly), true);
    await A.click("[data-a=save-routine]"); await A.click("[data-a=close]"); await A.waitForTimeout(400);
    await home(A); await A.click("[data-go=go]"); await A.click("[data-rgo2]"); await A.waitForSelector("#f-title", { timeout: 8000 });
    t("routine : séance lancée", await A.$$eval("[id^=exn-]", x => x.length), 5);
    await A.click("[data-a=close]"); await A.waitForTimeout(400);

    // Séance ancienne (plus de 90 jours) : chargée par morceaux.
    const old = new Date(Date.now() - 200 * 864e5), ok = old.getFullYear() + "-" + String(old.getMonth() + 1).padStart(2, "0") + "-" + String(old.getDate()).padStart(2, "0");
    await put(`users/${A.uid}/seances/${ok}`, { disc: "course", runType: "ef", title: "Vieille sortie", run: { dist: 12, h: "", m: 70, s: "", blocks: [] }, updatedAt: 1 });
    await home(A); await A.click("[data-go=go]"); await A.click(".go-tile[data-go=seances]");
    await A.waitForFunction(k => !!document.querySelector("#list") && true, ok);
    const hasOld = await A.evaluate(async k => { for (let i = 0; i < 12; i++) { if ([...document.querySelectorAll("#list .row")].some(r => r.dataset.k === k)) return true; document.getElementById("prev").click(); await new Promise(r => setTimeout(r, 50)); } return false; }, ok);
    t("ancienne séance chargée", hasOld, true);

    // Glisser pour supprimer.
    await home(A); await A.click("[data-go=go]"); await A.click(".go-tile[data-go=seances]"); await A.waitForTimeout(300);
    const n0 = await A.$$eval("#list .row", x => x.length);
    await A.$eval("#list .row", e => e.scrollIntoView({ block: "center" })); await A.waitForTimeout(200);
    const bb = await (await A.$("#list .row")).boundingBox();
    await A.mouse.move(bb.x + 30, bb.y + bb.height / 2); await A.mouse.down(); await A.mouse.move(bb.x + 240, bb.y + bb.height / 2, { steps: 6 }); await A.mouse.up();
    await A.waitForSelector("#confirmSheet:not([hidden])"); await A.click("#confirmGo"); await A.waitForTimeout(400);
    t("glisser supprime la séance", await A.$$eval("#list .row", x => x.length), n0 - 1);

    // Export de mes données.
    await home(A); await A.click("[data-go=profile]");
    const [dl] = await Promise.all([A.waitForEvent("download", { timeout: 15000 }), A.click("#exportBtn")]);
    t("export de mes données", /mes-donnees/.test(dl.suggestedFilename()), true);

    // Compte existant sans conditions acceptées : fenêtre à accepter une fois.
    await put(`users/${A.uid}`, { pseudo: "Alice", termsV: 0, seen: { amis1: true, v2: true, tuto: true }, typesV: 2 });
    await home(A); await A.waitForTimeout(500);
    t("conditions demandées aux anciens comptes", await A.$eval("#termsSheet", e => !e.hidden), true);
    await A.click("#termsOk"); await home(A);
    t("conditions demandées une seule fois", await A.$eval("#termsSheet", e => !e.hidden), false);

    // Social : ami, commentaire, signalement, modération.
    await A.click("[data-go=social]"); await A.click("[data-go=friends]"); const code = await A.textContent("#myCode");
    const B = await signupPage(browser, "Bruno");
    await B.click("[data-go=social]"); await B.click("[data-go=friends]"); await B.fill("#fsInput", code); await B.click("#friendSearch button[type=submit]"); await B.waitForTimeout(600);
    await B.click("[data-fadd]"); await A.waitForTimeout(900); await A.click("[data-faccept]"); await A.waitForTimeout(900);
    await home(B); await B.click("[data-go=social]"); await B.click("[data-go=feed]"); await B.waitForSelector(".feed-card .c-form input", { timeout: 10000 });
    const bad = "Commentaire à modérer " + Date.now();
    const inp = await B.$(".feed-card .c-form input"); await inp.fill(bad); await inp.press("Enter"); await B.waitForTimeout(800);
    await home(A); await A.click("[data-go=go]"); await A.click(".go-tile[data-go=seances]"); await A.click("#list .row"); await A.waitForTimeout(500);
    t("commentaire reçu dans la séance", (await A.textContent("#myComments")).includes(bad), true);
    await A.click("#myComments [data-crep]"); await A.click("#myComments [data-crep]"); await A.waitForTimeout(600);
    t("commentaire signalé", /signalé/.test(await A.textContent("#toast")), true);
    await A.click("[data-a=close]");
    // A devient admin : supprime le contenu et bannit B.
    await put("admins/" + A.uid, { ok: true });
    await home(A); await A.click("[data-go=profile]"); await A.click("#adminBtn"); await A.waitForTimeout(800);
    t("signalement visible par l'admin", (await A.textContent("#adminBody")).includes(bad), true);
    const del = `.msg:has-text("${bad}") [data-repdel]`;
    // L'écran admin se redessine à chaque nouveauté : on confirme jusqu'à ce que la suppression passe.
    for (let i = 0; i < 4 && (await A.$(del)); i++) { await A.click(del); await A.click(del).catch(() => {}); await A.waitForTimeout(700); }
    await A.waitForFunction(t => !document.getElementById("adminBody").textContent.includes(t), bad, { timeout: 8000 }).catch(() => {});
    t("contenu supprimé par l'admin", (await A.textContent("#adminBody")).includes(bad), false);
    await A.click(`#adminBody [data-uid="${B.uid}"]`); await A.waitForTimeout(500); await A.click("#auserBody [data-ban]"); await A.click("#auserBody [data-ban]"); await A.waitForTimeout(800);
    await home(B); await B.click("[data-go=social]");
    t("le banni voit la suspension", await B.$(".ban-card") !== null, true);

    t("aucune erreur JavaScript (A)", A.errs.join(" | "), "");
    t("aucune erreur JavaScript (B)", B.errs.join(" | "), "");
  } finally { await browser.close(); }
};
