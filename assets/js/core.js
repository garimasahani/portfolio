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
  function loadJSON(n) { return cache[n] || (cache[n] = fetch('content/' + n + '.json', { cache: 'no-cache' }).then(function (r) { return r.json(); })); }
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


  /* Sound: two effects only, synthesised with the Web Audio API (no audio files): a wand whoosh on every click
     and a paper flip while the map opens. Nothing plays until the visitor's first tap or key press, and the
     menu has a Sound switch that is remembered. */
  var muted = false, unlocked = false, AC = null, master = null;
  try { muted = localStorage.getItem('ma-sound') === 'off'; } catch (e) {}
  function audio() {
    if (muted || !unlocked) return null;
    if (!AC) {
      try { AC = new (window.AudioContext || window.webkitAudioContext)(); master = AC.createGain(); master.gain.value = 0.7; master.connect(AC.destination); } catch (e) { return null; }
    }
    if (AC.state === 'suspended') AC.resume();
    return AC;
  }
  function unlock() { unlocked = true; }
  ['pointerdown', 'keydown', 'touchend'].forEach(function (ev) { addEventListener(ev, unlock, { once: true, capture: true }); });
  // a burst of filtered noise: the building block of both sounds
  function noise(c, t0, dur, type, f0, f1, vol, q, attack) {
    var n = Math.floor(c.sampleRate * dur), buf = c.createBuffer(1, n, c.sampleRate), d = buf.getChannelData(0);
    for (var i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
    var src = c.createBufferSource(), f = c.createBiquadFilter(), g = c.createGain(), t = c.currentTime + t0;
    src.buffer = buf; f.type = type; f.Q.value = q || 1; f.frequency.setValueAtTime(f0, t); f.frequency.exponentialRampToValueAtTime(f1, t + dur);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + dur * (attack || 0.25)); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    src.connect(f); f.connect(g); g.connect(master); src.start(t);
  }
  var FX = {
    // a quick wand flick: air rushing past, high to low
    whoosh: function (c) { noise(c, 0, 0.34, 'bandpass', 3400, 600, 0.3, 1.4, 0.3); noise(c, 0.02, 0.22, 'highpass', 2500, 1200, 0.06, 0.8, 0.3); },
    // pages turning: a few dry rustles, each a sharp edge with a soft tail
    paper: function (c) {
      [0, 0.28, 0.62, 0.95].forEach(function (t, i) {
        noise(c, t, 0.2, 'bandpass', 2600 - i * 250, 900, 0.26, 0.9, 0.08);
        noise(c, t + 0.015, 0.3, 'highpass', 4200, 1800, 0.08, 0.7, 0.1);
      });
    }
  };
  function play(name) { var c = audio(); if (c && FX[name]) FX[name](c); }
  function setMuted(m) {
    muted = m; try { localStorage.setItem('ma-sound', m ? 'off' : 'on'); } catch (e) {}
    $$('.soundtoggle').forEach(function (b) { b.setAttribute('aria-pressed', String(!m)); b.textContent = m ? 'Sound: off' : 'Sound: on'; });
    if (!m) { unlocked = true; play('whoosh'); }
  }
  // a Sound switch at the end of every menu
  $$('.links').forEach(function (ul) {
    var li = document.createElement('li'); li.innerHTML = '<button class="soundtoggle" type="button" aria-pressed="' + !muted + '">' + (muted ? 'Sound: off' : 'Sound: on') + '</button>';
    ul.appendChild(li); li.firstChild.addEventListener('click', function (e) { e.stopPropagation(); setMuted(!muted); });
  });
  // every click with the wand whooshes, except the seal, which has the paper sound instead
  document.addEventListener('click', function (e) {
    if (e.target.closest('#doorOpen,#portal,.soundtoggle')) return;
    play('whoosh');
  }, true);

  window.MA = { $: $, $$: $$, esc: esc, t: t, isTodo: isTodo, loadJSON: loadJSON, icon: icon, A: A, reduce: reduce, sparks: sparks, play: play };
})();
