/* Shared: helpers, menu, wand-light night mode, Accio search, sparkles */
(function () {
  var root = document.documentElement;
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  function $(s, c) { return (c || document).querySelector(s); }
  function $$(s, c) { return [].slice.call((c || document).querySelectorAll(s)); }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function isTodo(s) { return /^TODO/.test(String(s || '')); }
  // TODO text renders as a visible, editable placeholder instead of pretending to be content
  function t(s) { return isTodo(s) ? '<span class="todo">' + esc(s) + '</span>' : esc(s); }
  var cache = {};
  function loadJSON(n) { return cache[n] || (cache[n] = fetch('content/' + n + '.json').then(function (r) { return r.json(); })); }
  var A = 'public/assets/';
  function icon(name, alt, cls) { return '<img src="' + A + name + '.png" alt="' + esc(alt || '') + '"' + (cls ? ' class="' + cls + '"' : '') + ' loading="lazy" decoding="async">'; }

  function sparks(x, y, n) {
    if (reduce) return;
    for (var i = 0; i < (n || 12); i++) {
      var s = document.createElement('i'); s.className = 'spark';
      var a = Math.random() * Math.PI * 2, d = 30 + Math.random() * 50;
      s.style.left = x - 5 + 'px'; s.style.top = y - 5 + 'px';
      s.style.setProperty('--dx', Math.cos(a) * d + 'px'); s.style.setProperty('--dy', Math.sin(a) * d + 'px');
      document.body.appendChild(s); setTimeout(s.remove.bind(s), 850);
    }
  }
  document.addEventListener('click', function (e) {
    var el = e.target.closest('.btn,.house,.potion,.orb,.book,.place');
    if (!el) return;
    var r = el.getBoundingClientRect();
    sparks(e.clientX || r.left + r.width / 2, e.clientY || r.top + r.height / 2, 10);
  });

  // mobile menu
  var menu = $('#menuBtn'), links = $('.links');
  if (menu) {
    menu.addEventListener('click', function () { var o = links.classList.toggle('open'); menu.setAttribute('aria-expanded', String(o)); });
    links.addEventListener('click', function (e) { if (e.target.closest('a')) { links.classList.remove('open'); menu.setAttribute('aria-expanded', 'false'); } });
  }

  // Nox: the room goes dark and only the wand's light follows the pointer, a finger or keyboard focus
  var dark = document.createElement('div'); dark.className = 'darkness'; dark.setAttribute('aria-hidden', 'true');
  var hint = document.createElement('p'); hint.className = 'lumos-hint'; hint.textContent = 'Nox. Your wand is the only light. Tap the moon for Lumos.';
  document.body.appendChild(dark); document.body.appendChild(hint);
  function light(x, y) { dark.style.setProperty('--lx', x + 'px'); dark.style.setProperty('--ly', y + 'px'); }
  addEventListener('pointermove', function (e) { light(e.clientX, e.clientY); }, { passive: true });
  addEventListener('pointerdown', function (e) { light(e.clientX, e.clientY); }, { passive: true });
  document.addEventListener('focusin', function (e) { var r = e.target.getBoundingClientRect(); light(r.left + r.width / 2, r.top + r.height / 2); });
  var themeBtn = $('#themeBtn');
  function setTheme(night) {
    if (night) root.setAttribute('data-theme', 'night'); else root.removeAttribute('data-theme');
    try { localStorage.setItem('ma-theme', night ? 'night' : 'day'); } catch (e) {}
    if (themeBtn) { themeBtn.setAttribute('aria-pressed', String(night)); themeBtn.setAttribute('aria-label', night ? 'Lumos: light the room' : 'Nox: darken the room, light it with your wand'); }
  }
  try { setTheme(localStorage.getItem('ma-theme') === 'night'); } catch (e) {}
  if (themeBtn) themeBtn.addEventListener('click', function () { setTheme(root.getAttribute('data-theme') !== 'night'); });

  // Accio: search sections and spellbooks
  var accio = $('#accio'), q = $('#accioQ'), out = $('#accioOut'), searchBtn = $('#searchBtn'), index = null;
  function build() {
    if (index) return Promise.resolve(index);
    return Promise.all([loadJSON('site'), loadJSON('projects'), loadJSON('career'), loadJSON('decks')]).then(function (r) {
      index = r[0].locations.map(function (l) { return { t: l.name, s: l.label, h: l.href }; })
        .concat(r[2].years.map(function (y) { return { t: y.org, s: 'Experience · ' + y.title, h: 'experience.html' }; }))
        .concat(r[3].map(function (d) { return { t: d.title, s: 'Presentation · ' + d.type, h: 'projects.html#lecture' }; }))
        .concat(r[1].map(function (p) { return { t: p.title, s: p.brand + (p.categories.indexOf('spec') > -1 ? ' · Spec concept' : ''), h: 'case.html#' + p.slug }; }));
      return index;
    });
  }
  function show(term) {
    build().then(function (ix) {
      term = term.trim().toLowerCase();
      var hits = ix.filter(function (x) { return !term || (x.t + ' ' + x.s).toLowerCase().indexOf(term) > -1; }).slice(0, 12);
      out.innerHTML = hits.length ? hits.map(function (x) { return '<li><a href="' + esc(x.h) + '">' + esc(x.t) + '<small>' + esc(x.s) + '</small></a></li>'; }).join('') : '<li><a href="projects.html">Nothing answered the summons. See every project</a></li>';
    });
  }
  function openAccio() { accio.classList.add('open'); q.value = ''; show(''); q.focus(); }
  function closeAccio() { accio.classList.remove('open'); if (searchBtn) searchBtn.focus(); }
  if (accio) {
    searchBtn.addEventListener('click', openAccio);
    q.addEventListener('input', function () { show(q.value); });
    accio.addEventListener('click', function (e) { if (e.target === accio || e.target.closest('a')) closeAccio(); });
    addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && accio.classList.contains('open')) closeAccio();
      if (e.key === '/' && !/INPUT|TEXTAREA/.test(document.activeElement.tagName)) { e.preventDefault(); openAccio(); }
    });
  }

  window.MA = { $: $, $$: $$, esc: esc, t: t, isTodo: isTodo, loadJSON: loadJSON, icon: icon, A: A, reduce: reduce, sparks: sparks };
})();
