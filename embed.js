/* Extérieur Clair — calculateur à intégrer : reprend le calculateur et ses données de la page /taxe-amenagement (même site), sans les dupliquer. Aucune donnée envoyée, aucun cookie. */
(function () {
  'use strict';
  var root = document.getElementById('embed-root');
  if (!root) return;
  function fail() {
    root.textContent = '';
    var p = document.createElement('p');
    var a = document.createElement('a');
    a.href = 'https://exterieur-clair.fr/taxe-amenagement';
    a.rel = 'noopener';
    a.textContent = 'Ouvrir le calculateur de taxe d\u2019aménagement sur Extérieur Clair';
    p.appendChild(a);
    root.appendChild(p);
  }
  fetch('/taxe-amenagement', { credentials: 'omit' }).then(function (r) {
    if (!r.ok) throw new Error('http');
    return r.text();
  }).then(function (html) {
    var doc = new DOMParser().parseFromString(html, 'text/html');
    var box = doc.querySelector('[data-tool="taxe-amenagement"]');
    var data = doc.getElementById('ta-data');
    var src = doc.querySelector('script[src^="/taxe.js"]');
    if (!box || !data || !src) throw new Error('markup');
    root.textContent = '';
    root.appendChild(document.importNode(box, true));
    var d = document.createElement('script');
    d.type = 'application/json';
    d.id = 'ta-data';
    d.textContent = data.textContent;
    document.body.appendChild(d);
    var s = document.createElement('script');
    s.src = src.getAttribute('src');
    s.onerror = fail;
    document.body.appendChild(s);
  }).catch(fail);
})();
