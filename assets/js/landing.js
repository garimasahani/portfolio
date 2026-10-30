/* Landing: the leather-bound map, the illustrated room map, the glance cards and the drifting objects around the portrait */
(function () {
  var M = window.MA, $ = M.$, esc = M.esc, icon = M.icon, root = document.documentElement;

  /* the illustrated map: hotspots sit over the rooms drawn in the art (left, top, width, height in %);
     the two rooms the art doesn't show get plaques of their own */
  var SPOTS = { experience: [13, 12, 29, 24], skills: [53, 13, 33, 24], about: [2, 34, 26, 27], projects: [71, 34, 28, 27], common: [3, 66, 33, 29], contact: [66, 66, 32, 29] };
  var PLAQUE = { decks: [37.5, 72.5], lab: [36.5, 1.5] };
  function artMap(el, locs, castle) {
    el.innerHTML = '<img src="public/assets/map/map.jpg" alt="" width="632" height="765">' + locs.map(function (l) {
      if (SPOTS[l.id]) { var r = SPOTS[l.id]; return '<a class="spot" href="' + esc(l.href) + '" style="left:' + r[0] + '%;top:' + r[1] + '%;width:' + r[2] + '%;height:' + r[3] + '%" aria-label="' + esc(l.name + ': ' + l.label) + '"></a>'; }
      var p = PLAQUE[l.id];
      return p ? '<a class="plaque" href="' + esc(l.href) + '" style="left:' + p[0] + '%;top:' + p[1] + '%">' + icon(l.icon, '') + '<span><b>' + esc(l.name) + '</b><i>' + esc(l.label) + '</i></span></a>' : '';
    }).join('') + (castle ? '<a class="spot" href="#main" data-enter style="left:33%;top:31%;width:34%;height:30%" aria-label="Enter the academy"></a>' : '');
  }

  /* the leather-bound map: opens once per visit, fills the page, skippable, instant with reduced motion */
  var door = $('#door');
  function seen() { try { sessionStorage.setItem('ma-entered', '1'); } catch (e) {} }
  function finish() {
    seen();
    root.classList.remove('door-on');
    if (door) door.remove();
    var h = $('#heroTitle'); if (h) { h.setAttribute('tabindex', '-1'); h.focus({ preventScroll: true }); }
  }
  function leave() {
    if (M.reduce) { finish(); return; }
    door.classList.add('gone'); setTimeout(finish, 900);
  }
  M.loadJSON('site').then(function (site) {
    if ($('#landMap')) artMap($('#landMap'), site.locations, false);
    if (door && $('#doorMap')) artMap($('#doorMap'), site.locations, true);
  });
  if (door && root.classList.contains('door-on')) {
    var seal = $('#doorOpen'), tome = $('#portal'), busy = false;
    if (!M.reduce) {
      var dust = '';
      for (var i = 0; i < 26; i++) dust += '<i style="left:' + (Math.random() * 100).toFixed(1) + '%;top:' + (30 + Math.random() * 70).toFixed(1) + '%;--s:' + (3 + Math.random() * 5).toFixed(1) + 'px;--d:' + (7 + Math.random() * 8).toFixed(1) + 's;--t:-' + (Math.random() * 12).toFixed(1) + 's;--x:' + (Math.random() * 60 - 30).toFixed(0) + 'px"></i>';
      $('#doorDust').innerHTML = dust;
    }
    seal.focus();
    var open = function () {
      if (busy) return; busy = true; seen();
      var r = tome.getBoundingClientRect(), flap = innerWidth > 700 ? r.height * 1.07 * 0.17 : 0;
      // opened, the flaps add width either side; scale the book so the whole spread fills the page
      tome.style.setProperty('--fit', Math.min((innerWidth * 0.97) / (r.width + flap * 2), (innerHeight - 90) / (r.height * 1.07)).toFixed(3));
      var s = seal.getBoundingClientRect();
      M.sparks(s.left + s.width / 2, s.top + s.height / 2, 30);
      door.classList.add('opening');
      $('#doorHint').textContent = 'Pick a room, or step into the academy';
      setTimeout(function () { door.classList.add('open'); var first = $('#doorMap .spot'); if (first) first.focus({ preventScroll: true }); }, M.reduce ? 0 : 2300);
    };
    seal.addEventListener('click', open);
    tome.addEventListener('click', function (e) { if (!door.classList.contains('opening') && !e.target.closest('a')) open(); });
    door.addEventListener('click', function (e) { var a = e.target.closest('[data-enter],#doorEnter'); if (a) { e.preventDefault(); leave(); } else if (e.target.closest('.artmap a')) seen(); });
    $('#doorSkip').addEventListener('click', finish);
    door.addEventListener('keydown', function (e) { if (e.key === 'Escape') finish(); });
  } else if (door) { door.remove(); }

  /* the glance cards, from content/site.json */
  M.loadJSON('site').then(function (site) {
    $('#gist').innerHTML = site.gist.map(function (g) {
      return '<article class="gcard">' + icon(g.icon, '', 'clay') + '<h2>' + esc(g.title) + '</h2>' +
        (g.text ? '<p>' + esc(g.text) + '</p>' : '') +
        (g.chips ? '<div class="tags">' + g.chips.map(function (c) { return '<span class="chip">' + esc(c) + '</span>'; }).join('') + '</div>' : '') +
        '<a class="more" href="' + esc(g.href) + '">' + esc(g.cta) + ' <span aria-hidden="true">→</span></a></article>';
    }).join('');
  });

  /* the objects around the portrait drift a little against the pointer */
  var scene = $('#scene');
  if (scene && !M.reduce && matchMedia('(pointer:fine)').matches) {
    var bits = M.$$('.bit', scene);
    scene.addEventListener('pointermove', function (e) {
      var r = scene.getBoundingClientRect(), nx = (e.clientX - r.left) / r.width - 0.5, ny = (e.clientY - r.top) / r.height - 0.5;
      bits.forEach(function (b) {
        var d = parseFloat(b.dataset.depth) * 26;
        b.style.setProperty('--px', (-nx * d).toFixed(1) + 'px'); b.style.setProperty('--py', (-ny * d).toFixed(1) + 'px');
      });
    });
    scene.addEventListener('pointerleave', function () { bits.forEach(function (b) { b.style.setProperty('--px', '0px'); b.style.setProperty('--py', '0px'); }); });
  }
})();
