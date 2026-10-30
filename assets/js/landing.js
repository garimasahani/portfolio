/* Landing: the wax-sealed cover opens once per visit onto a full-screen map, and every place on it is a link */
(function () {
  var M = window.MA, $ = M.$, esc = M.esc, root = document.documentElement;

  /* the map is composed from the illustrated pieces in public/assets/map/els. Each entry is
     [piece, x %, y %, size in map units, place id (a link to that room) or extra classes].
     A map unit is 1/100 of the long side of a 16:10 sheet (1/100 of the height on tall screens). */
  var A = 'public/assets/map/els/';
  var WIDE = [
    ['mountains', 9, 14, 21, 'deco'], ['clouds1', 34, 6, 12, 'deco cloud'], ['clouds2', 84, 11, 22, 'deco cloud'], ['banner', 50, 8, 34, 'deco'],
    ['owlfly', 71, 18, 10, 'deco fly'], ['moon', 95, 24, 5, 'deco float'], ['compass', 7, 88, 8, 'deco'], ['lake', 50, 92, 30, 'deco'],
    ['tree1', 6, 37, 5.5, 'deco tree'], ['tree3', 37, 14, 5, 'deco tree'], ['tree5', 64, 42, 4.5, 'deco tree'], ['tree7', 36, 44, 3, 'deco tree'],
    ['tree6', 94, 40, 5, 'deco tree'], ['tree3', 93, 76, 5, 'deco tree'], ['tree9', 42, 79, 4.5, 'deco tree'], ['tree2', 11, 70, 3.4, 'deco tree'], ['tree1', 90, 92, 5, 'deco tree'],
    ['lantern1', 37, 35, 2.4, 'deco'], ['lantern2', 63, 67, 2.4, 'deco'], ['lantern2', 35, 66, 2.2, 'deco'], ['signpost', 31, 53, 4.5, 'deco'], ['chest', 23, 67, 3.5, 'deco'],
    ['greathall', 50, 51, 24, 'about'], ['library', 23, 28, 16, 'experience'], ['potion', 77, 26, 15.5, 'skills'], ['arch', 14, 55, 14, 'lab'],
    ['chamber', 85, 56, 14.5, 'projects'], ['common', 27, 79, 16, 'common'], ['owlery', 72, 78, 11.5, 'contact']
  ];
  var TALL = [
    ['clouds1', 18, 5, 16, 'deco cloud'], ['banner', 50, 12, 50, 'deco'], ['owlfly', 50, 20.5, 11, 'deco fly'],
    ['tree1', 5, 42, 5.5, 'deco tree'], ['tree3', 95, 42, 5.5, 'deco tree'], ['tree9', 53, 85, 6, 'deco tree'], ['tree2', 5, 76, 3.6, 'deco tree'],
    ['lantern1', 40, 74, 2.8, 'deco'], ['lantern2', 62, 75, 2.8, 'deco'],
    ['greathall', 50, 52, 28, 'about'], ['library', 26, 30, 19, 'experience'], ['potion', 75, 29, 18, 'skills'], ['arch', 16, 63, 13, 'lab'],
    ['chamber', 84, 61, 15, 'projects'], ['common', 27, 86, 19, 'common'], ['owlery', 77, 86, 12, 'contact']
  ];
  var world = $('#world'), stage = $('#main'), paths = $('#paths'), places = {}, mode = '';
  function draw() {
    var W = stage.clientWidth, H = stage.clientHeight, tall = H > W * 1.05, L = tall ? TALL : WIDE;
    stage.style.setProperty('--u', (tall ? Math.min(W / 62.5, H / 100) : Math.min(W / 100, H / 62.5)).toFixed(2) + 'px');
    if (mode !== (tall ? 't' : 'w')) {
      mode = tall ? 't' : 'w';
      var n = 0;
      world.innerHTML = L.map(function (e) {
        var l = places[e[4]], st = 'left:' + e[1] + '%;top:' + e[2] + '%;--s:' + e[3] + ';--d:-' + (e[1] % 5) + 's';
        if (!l) return '<span class="el ' + e[4] + '" style="' + st + '"><img src="' + A + e[0] + '.png" alt=""></span>';
        var sign = e[0] === 'arch' ? '<span class="scrollsign"><b>' + esc(l.name) + '</b><i>' + esc(l.label) + '</i></span>' : '';
        return '<a class="el place" href="' + esc(l.href) + '" data-id="' + l.id + '" style="' + st + ';--i:' + (n++) + '" aria-label="' + esc(l.name + ': ' + l.label) + '"><img src="' + A + e[0] + '.png" alt="">' + sign + '</a>';
      }).join('');
    }
    // dotted paths from the castle's gate to each place
    requestAnimationFrame(function () {
      var hall = world.querySelector('[data-id="about"]'); if (!hall) return;
      var o = stage.getBoundingClientRect(), h = hall.getBoundingClientRect(), x0 = h.left + h.width / 2 - o.left, y0 = h.bottom - h.height * 0.2 - o.top;
      paths.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
      paths.innerHTML = M.$$('.place', world).filter(function (a) { return a !== hall; }).map(function (a) {
        var r = a.getBoundingClientRect(), x1 = r.left + r.width / 2 - o.left, y1 = r.bottom - r.height * 0.12 - o.top, mx = (x0 + x1) / 2 + (y1 - y0) * 0.18, my = (y0 + y1) / 2 - (x1 - x0) * 0.12;
        return '<path d="M' + x0.toFixed(0) + ' ' + y0.toFixed(0) + 'Q' + mx.toFixed(0) + ' ' + my.toFixed(0) + ' ' + x1.toFixed(0) + ' ' + y1.toFixed(0) + '"/>';
      }).join('');
    });
  }
  M.loadJSON('site').then(function (site) {
    site.locations.forEach(function (l) { places[l.id] = l; });
    draw();
    M.$$('img', world).forEach(function (im) { if (!im.complete) im.addEventListener('load', function () { draw(); }, { once: true }); });
    if (!root.classList.contains('door-on')) stage.classList.add('rise');
  });
  var rz; addEventListener('resize', function () { clearTimeout(rz); rz = setTimeout(draw, 120); });

  /* the cover: once per visit, skippable, instant with reduced motion */
  var door = $('#door');
  function finish() {
    try { sessionStorage.setItem('ma-entered', '1'); } catch (e) {}
    root.classList.remove('door-on');
    stage.classList.add('rise'); setTimeout(draw, 1800);
    if (door) door.remove();
    var first = $('#world .place'); if (first) first.focus({ preventScroll: true });
  }
  if (door && root.classList.contains('door-on')) {
    if (!M.reduce) {
      var dust = '';
      for (var i = 0; i < 26; i++) dust += '<i style="left:' + (Math.random() * 100).toFixed(1) + '%;top:' + (30 + Math.random() * 70).toFixed(1) + '%;--s:' + (3 + Math.random() * 5).toFixed(1) + 'px;--d:' + (7 + Math.random() * 8).toFixed(1) + 's;--t:-' + (Math.random() * 12).toFixed(1) + 's;--x:' + (Math.random() * 60 - 30).toFixed(0) + 'px"></i>';
      $('#doorDust').innerHTML = dust;
    }
    var seal = $('#doorOpen'), busy = false;
    seal.focus();
    var open = function () {
      if (busy) return; busy = true;
      if (M.reduce) { finish(); return; }
      var s = seal.getBoundingClientRect();
      M.sparks(s.left + s.width / 2, s.top + s.height / 2, 34);
      door.classList.add('opening');
      $('#main').classList.add('rise');
      setTimeout(function () { door.classList.add('gone'); }, 1500);
      setTimeout(finish, 2300);
    };
    seal.addEventListener('click', open);
    $('#portal').addEventListener('click', open);
    $('#doorSkip').addEventListener('click', finish);
    door.addEventListener('keydown', function (e) { if (e.key === 'Escape') finish(); });
  } else if (door) { door.remove(); }
})();
