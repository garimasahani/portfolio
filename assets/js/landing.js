/* Landing: the wax-sealed cover opens once per visit onto the map, and every place on the map is a link */
(function () {
  var M = window.MA, $ = M.$, esc = M.esc, root = document.documentElement;

  /* places drawn in the art (left, top, width, height in % of the map), keyed by content/site.json location id;
     the castle is Hogwarts, the about page; places the art doesn't name get plaques at [centre, top] */
  var SPOTS = { experience: [26.6, 16.5, 15.1, 17.2], skills: [51.6, 19.1, 16.1, 17.8], greathall: [18.2, 34.4, 16.1, 24.2], projects: [62.5, 34.4, 18.2, 24.2],
    about: [37, 32.4, 23.4, 26.4], common: [18.2, 63.6, 23.4, 29.3], contact: [62, 64.2, 17.2, 28.6] };
  var PLAQUE = { about: [48.4, 58.6, 'big'], decks: [48.6, 86], lab: [48.6, 3.4] };
  M.loadJSON('site').then(function (site) {
    var locs = site.locations, about = locs.filter(function (l) { return l.id === 'about'; })[0];
    var spot = function (id, l, name) { var r = SPOTS[id]; return '<a class="spot" href="' + esc(l.href) + '" style="left:' + r[0] + '%;top:' + r[1] + '%;width:' + r[2] + '%;height:' + r[3] + '%"><span class="sr">' + esc((name || l.name) + ': ' + l.label) + '</span></a>'; };
    var plaque = function (l, name, hidden) { var p = PLAQUE[l.id]; return '<a class="plaque' + (p[2] ? ' ' + p[2] : '') + '" href="' + esc(l.href) + '" style="left:' + p[0] + '%;top:' + p[1] + '%"' + (hidden ? ' tabindex="-1" aria-hidden="true"' : '') + '><b>' + esc(name || l.name) + '</b><i>' + esc(l.label) + '</i></a>'; };
    $('#landMap').innerHTML = '<img src="public/assets/map/open-map.jpg" alt="" width="960" height="786">' +
      locs.map(function (l) { return SPOTS[l.id] ? spot(l.id, l, l.id === 'about' ? 'Hogwarts' : '') : ''; }).join('') +
      (about ? spot('greathall', about, 'The Great Hall') + plaque(about, 'Hogwarts', true) : '') +
      locs.map(function (l) { return PLAQUE[l.id] && l.id !== 'about' ? plaque(l) : ''; }).join('');
    // on tall screens the map slides sideways; start on the castle
    var st = $('#stage'); st.scrollLeft = (st.scrollWidth - st.clientWidth) / 2;
  });

  /* the cover: once per visit, skippable, instant with reduced motion */
  var door = $('#door');
  function finish() {
    try { sessionStorage.setItem('ma-entered', '1'); } catch (e) {}
    root.classList.remove('door-on');
    if (door) door.remove();
    var first = $('#landMap .spot'); if (first) first.focus({ preventScroll: true });
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
      setTimeout(function () { door.classList.add('gone'); }, 1500);
      setTimeout(finish, 2300);
    };
    seal.addEventListener('click', open);
    $('#portal').addEventListener('click', open);
    $('#doorSkip').addEventListener('click', finish);
    door.addEventListener('keydown', function (e) { if (e.key === 'Escape') finish(); });
  } else if (door) { door.remove(); }
})();
