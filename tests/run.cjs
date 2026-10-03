// Lance tous les tests : `npm test` (démarre les émulateurs Firebase automatiquement).
const tests = [["Fichiers de l'app", require("./fichiers.test.cjs")], ["Règles de sécurité", require("./rules.test.cjs")], ["Recherche d'utilisateurs (serveur)", require("./recherche.test.cjs")], ["Parcours dans l'app", require("./app.test.cjs")]];
(async () => {
  let fail = 0, pass = 0;
  for (const [name, fn] of tests) {
    console.log("\n▶ " + name);
    const t = (label, got, want) => { const ok = JSON.stringify(got) === JSON.stringify(want); ok ? pass++ : fail++; console.log((ok ? "  ✓ " : "  ✗ ") + label + (ok ? "" : `  (obtenu ${JSON.stringify(got)}, attendu ${JSON.stringify(want)})`)); };
    try { await fn(t); } catch (e) { fail++; console.log("  ✗ arrêt : " + e.message.split("\n")[0]); }
  }
  console.log(`\n${pass} réussi(s), ${fail} échec(s)`);
  process.exit(fail ? 1 : 0);
})();
