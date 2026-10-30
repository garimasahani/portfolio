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


  /* Sound: every effect is synthesised with the Web Audio API (no audio files). Nothing plays until the
     visitor's first tap or key press, and the menu has a Sound switch that is remembered. */
  var muted = false, unlocked = false, AC = null, master = null, lastHover = 0;
  try { muted = localStorage.getItem('ma-sound') === 'off'; } catch (e) {}
  function audio() {
    if (muted || !unlocked) return null;
    if (!AC) {
      try { AC = new (window.AudioContext || window.webkitAudioContext)(); master = AC.createGain(); master.gain.value = 0.6; master.connect(AC.destination); hall(AC, master); } catch (e) { return null; }
    }
    if (AC.state === 'suspended') AC.resume();
    return AC;
  }
  // a stone hall's echo: the master signal is also sent through a generated reverb
  function hall(c, bus) {
    var n = Math.floor(c.sampleRate * 2.2), ir = c.createBuffer(2, n, c.sampleRate);
    for (var ch = 0; ch < 2; ch++) { var d = ir.getChannelData(ch); for (var i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / n, 2.6); }
    var cv = c.createConvolver(), wet = c.createGain(); cv.buffer = ir; wet.gain.value = 0.34; bus.connect(cv); cv.connect(wet); wet.connect(c.destination);
  }
  function unlock() { unlocked = true; }
  ['pointerdown', 'keydown', 'touchend'].forEach(function (ev) { addEventListener(ev, unlock, { once: true, capture: true }); });
  function tone(c, f0, t0, dur, type, vol, f1) {
    var o = c.createOscillator(), g = c.createGain(), t = c.currentTime + t0;
    o.type = type || 'sine'; o.frequency.setValueAtTime(f0, t); if (f1) o.frequency.exponentialRampToValueAtTime(f1, t + dur);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.012); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(master); o.start(t); o.stop(t + dur + 0.05);
  }
  function noise(c, t0, dur, type, f0, f1, vol, q) {
    var n = Math.floor(c.sampleRate * dur), buf = c.createBuffer(1, n, c.sampleRate), d = buf.getChannelData(0);
    for (var i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
    var src = c.createBufferSource(), f = c.createBiquadFilter(), g = c.createGain(), t = c.currentTime + t0;
    src.buffer = buf; f.type = type; f.Q.value = q || 1; f.frequency.setValueAtTime(f0, t); f.frequency.exponentialRampToValueAtTime(f1, t + dur);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + dur * 0.25); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    src.connect(f); f.connect(g); g.connect(master); src.start(t);
  }
  /* the sound world: a celesta-and-glockenspiel twinkle, wand swishes, owl hoots and a castle bell, in a stone hall's echo */
  function celesta(c, f, t0, vol, dur) {
    dur = dur || 1.3; vol = vol || 0.1;
    tone(c, f, t0, dur, 'sine', vol);
    tone(c, f * 4, t0, dur * 0.35, 'sine', vol * 0.4);      // the bright strike
    tone(c, f * 2.76, t0, dur * 0.25, 'sine', vol * 0.22);  // the glockenspiel bell partial
  }
  // E minor: a dreamy, slightly eerie ladder to climb
  var SCALE = [659.25, 739.99, 783.99, 987.77, 1174.66, 1318.51, 1567.98, 1975.53];
  var UP = [659.25, 783.99, 987.77, 1318.51, 1174.66, 987.77, 1174.66, 1567.98];
  function swish(c, t0, up) { noise(c, t0, 0.3, 'bandpass', up ? 700 : 3800, up ? 3800 : 700, 0.2, 1.6); }
  function trail(c, t0, n) { for (var i = 0; i < n; i++) celesta(c, 2000 + Math.random() * 2600, t0 + i * 0.055, 0.035, 0.35); }
  function bell(c, t0, f) { [1, 2.0, 2.76, 4.07].forEach(function (m, i) { tone(c, f * m, t0, 3.2 / (i + 1), 'sine', 0.13 / (i + 1)); }); }
  function hoot(c, t0) {
    var o = c.createOscillator(), l = c.createOscillator(), lg = c.createGain(), g = c.createGain(), t = c.currentTime + t0;
    o.type = 'sine'; o.frequency.setValueAtTime(400, t); o.frequency.exponentialRampToValueAtTime(285, t + 0.34);
    l.frequency.value = 26; lg.gain.value = 7; l.connect(lg); lg.connect(o.frequency);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.2, t + 0.07); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.4);
    o.connect(g); g.connect(master); o.start(t); l.start(t); o.stop(t + 0.45); l.stop(t + 0.45);
  }
  var FX = {
    spark: function (c) { swish(c, 0, false); trail(c, 0.04, 4); },
    tap: function (c) { celesta(c, SCALE[Math.floor(Math.random() * 5)] * 1.5, 0, 0.09, 0.9); },
    hover: function (c) { celesta(c, SCALE[2 + Math.floor(Math.random() * 5)] * 2, 0, 0.04, 0.5); },
    // the wax seal breaking, then the stone-and-leather groan of the cover
    crack: function (c) { noise(c, 0, 0.07, 'highpass', 2500, 5000, 0.5); tone(c, 150, 0, 0.2, 'sine', 0.4, 50); },
    creak: function (c) {
      var o = c.createOscillator(), l = c.createOscillator(), lg = c.createGain(), f = c.createBiquadFilter(), g = c.createGain(), t = c.currentTime;
      o.type = 'sawtooth'; o.frequency.setValueAtTime(58, t); o.frequency.linearRampToValueAtTime(112, t + 0.8); o.frequency.linearRampToValueAtTime(66, t + 1.5);
      l.frequency.value = 9; lg.gain.value = 10; l.connect(lg); lg.connect(o.frequency);
      f.type = 'lowpass'; f.frequency.value = 480; f.Q.value = 7;
      g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.11, t + 0.3); g.gain.exponentialRampToValueAtTime(0.0001, t + 1.6);
      o.connect(f); f.connect(g); g.connect(master); o.start(t); l.start(t); o.stop(t + 1.7); l.stop(t + 1.7);
      noise(c, 0, 1.4, 'lowpass', 180, 90, 0.22, 0.7);
    },
    whoosh: function (c) { noise(c, 0, 1, 'bandpass', 260, 2600, 0.3, 0.8); swish(c, 0.1, true); },
    // the big reveal: a castle bell, a rising run of celesta, a glittering trail
    magic: function (c) {
      bell(c, 0, 196);
      UP.forEach(function (f, i) { celesta(c, f, 0.1 + i * 0.11, 0.1, 1.5); });
      trail(c, 0.9, 12);
    },
    pop: function (c, i) { celesta(c, SCALE[(i || 0) % 8] * 1.5, 0, 0.1, 0.9); trail(c, 0.03, 2); },
    flip: function (c) { noise(c, 0, 0.18, 'bandpass', 2200, 800, 0.22, 1.2); noise(c, 0.05, 0.3, 'highpass', 3000, 1500, 0.05); },
    bubble: function (c) { for (var i = 0; i < 4; i++) tone(c, 240 + Math.random() * 200, i * 0.07, 0.13, 'sine', 0.1, 650 + Math.random() * 350); noise(c, 0, 0.35, 'highpass', 4000, 6000, 0.05); },
    orb: function (c) { [392, 392 * 1.005, 587.3, 783.99].forEach(function (f, i) { tone(c, f, i * 0.06, 1.4, 'sine', 0.06, f * 1.06); }); trail(c, 0.3, 5); },
    menu: function (c) { swish(c, 0, true); celesta(c, 1318.51, 0.05, 0.05, 0.6); },
    hoot: function (c) { hoot(c, 0); hoot(c, 0.55); trail(c, 0.9, 3); },
    bell: function (c) { bell(c, 0, 233); celesta(c, 1567.98, 0.2, 0.06, 1.2); },
    // lights out: a snuffed flame and a low hush
    nox: function (c) { swish(c, 0, false); tone(c, 520, 0, 0.8, 'sine', 0.08, 130); noise(c, 0.1, 0.8, 'lowpass', 900, 120, 0.12, 0.8); },
    // a wand-tip flares: a bright zing and a rising celesta flourish
    lumos: function (c) { swish(c, 0, true); tone(c, 380, 0, 0.5, 'sine', 0.08, 1500); [987.77, 1318.51, 1567.98, 1975.53].forEach(function (f, i) { celesta(c, f, 0.18 + i * 0.07, 0.08, 1); }); trail(c, 0.3, 6); }
  };
  function play(name, arg) { var c = audio(); if (c && FX[name]) FX[name](c, arg); }
  function setMuted(m) {
    muted = m; try { localStorage.setItem('ma-sound', m ? 'off' : 'on'); } catch (e) {}
    $$('.soundtoggle').forEach(function (b) { b.setAttribute('aria-pressed', String(!m)); b.textContent = m ? 'Sound: off' : 'Sound: on'; });
    if (!m) { unlocked = true; play('tap'); }
  }
  // a Sound switch at the end of every menu
  $$('.links').forEach(function (ul) {
    var li = document.createElement('li'); li.innerHTML = '<button class="soundtoggle" type="button" aria-pressed="' + !muted + '">' + (muted ? 'Sound: off' : 'Sound: on') + '</button>';
    ul.appendChild(li); li.firstChild.addEventListener('click', function (e) { e.stopPropagation(); setMuted(!muted); });
  });
  // sounds for the objects the visitor touches
  document.addEventListener('click', function (e) {
    var el = e.target.closest('.btn,.house,.potion,.orb,.book,.place,.card,.deck,.gcard,.tab,#searchBtn,#themeBtn,#menuBtn,.backmap,.pager a,.filters button');
    if (!el) return;
    var kind = el.matches('.potion') ? 'bubble' : el.matches('.book') ? 'flip' : el.matches('.orb') ? 'orb' : el.matches('#menuBtn') ? 'menu' : el.matches('#themeBtn') ? (root.getAttribute('data-theme') === 'night' ? 'lumos' : 'nox') : el.matches('.place') ? (el.dataset.id === 'contact' ? 'hoot' : el.dataset.id === 'about' ? 'bell' : 'pop') : el.matches('.house') ? 'pop' : 'tap';
    if (kind === 'pop') play('pop', Math.floor(Math.random() * 7)); else play(kind);
  }, true);
  document.addEventListener('pointerover', function (e) {
    var el = e.target.closest('.place'); if (!el || (e.relatedTarget && el.contains(e.relatedTarget))) return;
    var now = Date.now(); if (now - lastHover > 140) { lastHover = now; play('hover'); }
  });

  window.MA = { $: $, $$: $$, esc: esc, t: t, isTodo: isTodo, loadJSON: loadJSON, icon: icon, A: A, reduce: reduce, sparks: sparks, play: play };
})();
