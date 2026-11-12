/* Extérieur Clair — simulateur des impôts d'une piscine (tout est calculé dans le navigateur, aucune donnée envoyée) */
(function () {
  'use strict';
  var box = document.querySelector('[data-tool="piscine-impots"]');
  var raw = document.getElementById('pi-data');
  if (!box || !raw) return;
  var DATA = JSON.parse(raw.textContent);
  var VAL = 251, DEP = 2.5, ARCH = 0.4;
  /* Taxe foncière d'une piscine moyenne : 107 442 € / 939 piscines repérées en Vendée en 2022 (DGFiP),
     revalorisée 2023-2026 (×1,1407), rapportée au taux médian de la Vendée en 2025 (38,28 %) : 3,41 € par point de taux. */
  var K = 3.41;
  var fmt = function (n) { return Math.round(n).toLocaleString('fr-FR') + ' €'; };
  var pct = function (n) { return String(n).replace('.', ',') + ' %'; };
  var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  var norm = function (s) { return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, ' ').trim(); };
  var $ = function (s) { return box.querySelector(s); };
  var find = function (q) {
    var m = /\((44|85)\)\s*$/.exec(q), dep = m ? m[1] : null, n = norm(q.replace(/\((44|85)\)\s*$/, ''));
    if (!n) return null;
    if (/^\d{5}$/.test(n)) return DATA.filter(function (c) { return c.cp.indexOf(n) > -1; })[0] || null;
    var exact = DATA.filter(function (c) { return norm(c.n) === n && (!dep || c.d === dep); });
    if (exact.length) return exact[0];
    var start = DATA.filter(function (c) { return norm(c.n).indexOf(n) === 0; });
    return start.length === 1 ? start[0] : null;
  };
  var up = function () {
    var c = find($('#pi-c').value), out = $('.result');
    var s = Math.max(0, Math.min(200, parseFloat(String($('#pi-s').value).replace(',', '.')) || 0));
    var nd = $('#pi-nd').checked;
    if (!c) { out.innerHTML = '<div class="small">Commune</div><div class="big sm">Choisissez une commune de la liste</div><p class="fine">Tapez le début du nom ou le code postal, puis choisissez dans la liste.</p>'; return; }
    if (!s) { out.innerHTML = '<div class="small">' + esc(c.n) + '</div><div class="big sm">Indiquez la surface du bassin</div>'; return; }
    var ta = s * VAL * (c.t + DEP) / 100, ar = s * VAL * ARCH / 100, tf = K * c.f;
    var lines = [];
    lines.push('<li>Taxe d’aménagement, une seule fois : ' + fmt(ta) + ' (' + s + ' m² × 251 € × ' + pct(c.t) + ' de la commune + ' + pct(DEP) + ' du département)</li>');
    lines.push('<li>Archéologie préventive, une seule fois : environ ' + fmt(ar) + '</li>');
    lines.push('<li>Taxe foncière, chaque année : environ ' + fmt(tf) + ' (taux global de ' + pct(c.f) + ' en 2025, piscine de taille courante)</li>');
    if (c.s) lines.push('<li>Attention : ' + esc(c.s.replace(/ \(délibération[^)]*\)/, '')) + '. Demandez à la mairie le taux de votre parcelle.</li>');
    var html;
    if (nd) {
      html = '<div class="small">Piscine non déclarée à ' + esc(c.n) + ' (' + c.d + ')</div><div class="big">jusqu’à ' + fmt(4 * tf) + '</div>' +
        '<p>C’est le rattrapage possible de taxe foncière, selon la DGFiP jusqu’à quatre fois la taxe annuelle. En Vendée en 2022, il a été en moyenne de 227 € par piscine repérée.</p>' +
        '<ul><li>Taxe foncière ensuite, chaque année : environ ' + fmt(tf) + '</li><li>Le plus simple : déclarer la piscine vous-même dans l’espace « Biens immobiliers » d’impots.gouv, avant un courrier.</li></ul>';
    } else {
      html = '<div class="small">Impôts de votre piscine à ' + esc(c.n) + ' (' + c.d + ') sur 10 ans</div><div class="big">' + fmt(ta + ar + 8 * tf) + '</div>' +
        '<ul>' + lines.join('') + '<li>Sur 10 ans : taxe unique + 8 années de taxe foncière, si la piscine est déclarée dans les 90 jours (2 ans d’exonération en principe).</li></ul>';
    }
    out.innerHTML = html + '<p class="fine">Estimation indicative. Taxe d’aménagement : valeurs 2026 et taux votés publiés par la DGFiP. Taxe foncière : ordre de grandeur calculé à partir des chiffres de la DGFiP pour la Vendée ; le montant exact est sur votre avis.</p>';
  };
  Array.prototype.forEach.call(box.querySelectorAll('input'), function (el) { el.addEventListener('input', up); el.addEventListener('change', up); });
  up();
})();
