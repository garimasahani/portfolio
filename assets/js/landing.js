/* Landing: the doors, the glance cards and the drifting objects around the portrait */
(function () {
  var M = window.MA, $ = M.$, esc = M.esc, icon = M.icon, root = document.documentElement;

  /* the folded map: opens once per visit, skippable, and instant with reduced motion */
  var door = $('#door');
  function finish() {
    root.classList.remove('door-on');
    try { sessionStorage.setItem('ma-entered', '1'); } catch (e) {}
    if (door) door.remove();
    var h = $('#heroTitle'); if (h) { h.setAttribute('tabindex', '-1'); h.focus({ preventScroll: true }); }
  }
  if (door && root.classList.contains('door-on')) {
    var open = $('#doorOpen'), busy = false;
    if (!M.reduce) {
      var dust = '';
      for (var i = 0; i < 22; i++) dust += '<i style="left:' + (Math.random() * 100).toFixed(1) + '%;top:' + (30 + Math.random() * 70).toFixed(1) + '%;--s:' + (3 + Math.random() * 5).toFixed(1) + 'px;--d:' + (7 + Math.random() * 8).toFixed(1) + 's;--t:-' + (Math.random() * 12).toFixed(1) + 's;--x:' + (Math.random() * 60 - 30).toFixed(0) + 'px"></i>';
      $('#doorDust').innerHTML = dust;
    }
    open.focus();
    var enter = function () {
      if (busy) return; busy = true;
      if (M.reduce) { finish(); return; }
      var fold = $('#portal'), r = fold.getBoundingClientRect();
      // opened, the map is twice as wide as it is folded; shrink it to fit the screen
      fold.style.setProperty('--fit', Math.min(1, innerWidth * 0.94 / (r.width * 2), innerHeight * 0.9 / r.height).toFixed(3));
      door.classList.add('opening');
      M.sparks(r.left + r.width / 2, r.top + r.height / 2, 26);
      setTimeout(function () { door.classList.add('zoom'); }, 3000);
      setTimeout(function () { door.classList.add('gone'); }, 3400);
      setTimeout(finish, 4300);
    };
    open.addEventListener('click', enter);
    $('#portal').addEventListener('click', enter);
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
