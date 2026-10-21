/* Extérieur Clair — calculateur de taxe d'aménagement (tout est calculé dans le navigateur, aucune donnée envoyée) */
(function () {
  'use strict';
  var box = document.querySelector('[data-tool="taxe-amenagement"]');
  var raw = document.getElementById('ta-data');
  if (!box || !raw) return;
  var DATA = JSON.parse(raw.textContent);
  var V = { piscine: 251, construction: 892 }, DEP = { '44': 2.5, '85': 2.5 };
  var fmt = function (n) { return Math.round(n).toLocaleString('fr-FR') + ' €'; };
  var pct = function (n) { return String(n).replace('.', ',') + ' %'; };
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
    var p = $('#ta-p').value, s = parseFloat($('#ta-s').value) || 0, rp = $('#ta-rp').checked;
    Array.prototype.forEach.call(box.querySelectorAll('[data-for]'), function (el) { el.style.display = el.getAttribute('data-for').split(' ').indexOf(p) > -1 ? '' : 'none'; });
    var c = find($('#ta-c').value), out = $('.result');
    if (!c) { out.innerHTML = '<div class="small">Commune</div><div class="big sm">Choisissez une commune de la liste</div><p class="fine">Tapez le début du nom ou le code postal, puis choisissez dans la liste.</p>'; return; }
    var lines = [], base, val, l;
    if (p === 'piscine') { val = V.piscine; base = s * val; l = s + ' m² × 251 €'; }
    else {
      if (s <= 5) { out.innerHTML = '<div class="small">' + esc(c.n) + '</div><div class="big sm">En principe, pas de taxe</div><p>Une construction de 5 m² ou moins ne demande aucune autorisation d’urbanisme et n’est pas taxée.</p>'; return; }
      var ab = rp ? Math.min(s, 100) : 0;
      base = ab * V.construction * 0.5 + (s - ab) * V.construction;
      l = rp ? (ab + ' m² × 446 €' + (s > 100 ? ' + ' + (s - 100) + ' m² × 892 €' : '')) : s + ' m² × 892 €';
    }
    var tc = c.t, td = DEP[c.d], exo = 0;
    if (p === 'abri' && s <= 20 && c.a) { exo = c.a; lines.push(esc(c.n) + ' exonère les abris de jardin de 20 m² ou moins à ' + c.a + ' % sur la part communale.'); }
    if (p === 'abri' && s > 20) lines.push('Au-delà de 20 m², l’exonération communale des abris de jardin ne s’applique pas, et un permis peut être exigé.');
    var partC = base * tc / 100 * (1 - exo / 100), partD = base * td / 100;
    if (c.s) lines.push('Attention : ' + esc(c.s.replace(/ \(délibération[^)]*\)/, '')) + '. Demandez à la mairie le taux de votre parcelle.');
    if (p === 'piscine') lines.push('Une commune ne peut pas exonérer les piscines. Déclarez le bassin aux impôts dans les 90 jours suivant l’achèvement.');
    out.innerHTML = '<div class="small">Taxe d’aménagement estimée à ' + esc(c.n) + ' (' + c.d + ')</div><div class="big">' + fmt(partC + partD) + '</div>' +
      '<ul><li>Part communale ou intercommunale : ' + fmt(partC) + ' (' + l + ' × ' + pct(tc) + (exo ? ', exonérée à ' + exo + ' %' : '') + ')</li><li>Part départementale : ' + fmt(partD) + ' (taux de ' + pct(td) + ')</li>' +
      lines.map(function (x) { return '<li>' + x + '</li>'; }).join('') + '</ul>' +
      '<p class="fine">Valeurs forfaitaires 2026 et délibérations publiées par la DGFiP (taux applicables au 1<sup>er</sup> janvier 2026). ' + (c.e ? 'Intercommunalité : ' + esc(c.e) + '. ' : '') + 'Le montant définitif est calculé par l’administration ; la redevance d’archéologie préventive (0,68 %) peut s’ajouter.</p>';
  };
  Array.prototype.forEach.call(box.querySelectorAll('select,input'), function (el) { el.addEventListener('input', up); el.addEventListener('change', up); });
  up();
})();
