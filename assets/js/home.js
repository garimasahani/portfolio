/* Room scripts: each page renders only the sections it contains (map, sorting ceremony, library, potions, chamber, decks, pensieve, owlery) */
(function () {
  var M = window.MA, $ = M.$, $$ = M.$$, esc = M.esc, t = M.t, icon = M.icon;
  var FORM_ENDPOINT = ''; // TODO: paste a Formspree (or similar) endpoint to receive letters directly; empty opens the visitor's email app
  // a photo in a sculpted gold frame with a vintage tone
  function gframe(p, cls) { return '<figure class="gframe' + (cls ? ' ' + cls : '') + '"><span class="gf-in"><img src="' + esc(p.src) + '" alt="' + esc(p.alt) + '" loading="lazy" width="480" height="600"></span>' + (p.caption ? '<figcaption>' + esc(p.caption) + '</figcaption>' : '') + '</figure>'; }
  var LAB = { 'airbnb-znmd': 'znmd', 'sarvam-diwali': 'sarvam', 'spotify-homejam': 'spotads', 'spotify-navbeats': 'spotads', 'jiocinema-paris': 'jio', 'spotify-offline': 'spotify', 'spotify-premium': 'premium', 'supermoney-okrs': 'supermoney', 'supercard-sales': 'supercard', 'airbnb-for-work': 'airbnb' };
  var CAT = {
    live: { label: 'Live campaigns', icon: 'icons/spellbook', a: 'var(--red)' },
    'growth-ops': { label: 'Growth & ops', icon: 'icons/cauldron', a: 'var(--green)' },
    content: { label: 'Content', icon: 'icons/quill', a: 'var(--blue)' },
    partnerships: { label: 'Partnerships', icon: 'icons/key', a: 'var(--gold)' },
    spec: { label: 'Spec concepts', icon: 'icons/crystal', a: 'var(--plum)' }
  };

  // one project card, used wherever a project is listed (work experience, the chamber, the spec lab)
  function projectCard(p) {
    var c = CAT[p.categories[0]] || CAT.live, spec = p.categories.indexOf('spec') > -1;
    return '<article class="card' + (spec ? ' spec' : '') + '" style="--a:' + c.a + '"><div class="top"><div><p class="brand2">' + esc(p.brand) + '</p><span class="chip" style="margin-top:8px">' + esc(spec ? 'Spec concept' : c.label) + '</span></div>' + icon(c.icon, '', 'clay') + '</div>' +
      '<h3>' + esc(p.title) + '</h3><p>' + t(p.summary) + '</p>' +
      (p.metric ? '<p class="metric">' + esc(p.metric.value) + '<small>' + esc(p.metric.label) + '</small></p>' : '') +
      '<a class="go" href="case.html#' + p.slug + '">Uncover the Magic <span aria-hidden="true">→</span><span class="sr">: ' + esc(p.title) + '</span></a>' +
      (LAB[p.slug] ? '<a class="try" href="spec-lab.html#' + LAB[p.slug] + '">✦ Play with the live mock<span class="sr"> of ' + esc(p.title) + '</span></a>' : '') + '</article>';
  }

  /* I. Entrance */
  M.loadJSON('site').then(function (site) {
    if (!$('#heroTitle')) return;
    var h = site.hero;
    $('#heroKicker').textContent = h.kicker;
    $('#heroTitle').innerHTML = h.headline.map(function (l) { return '<span>' + esc(l) + '</span>'; }).join('');
    $('#heroMe').textContent = h.intro;
    renderMap(site.locations);
  });
  M.loadJSON('site').then(function (site) { if ($('#letter')) renderSocials(site); });
  if (!M.reduce && $('#dust')) {
    var dust = '';
    for (var i = 0; i < 26; i++) dust += '<i style="left:' + (Math.random() * 100).toFixed(1) + '%;top:' + (40 + Math.random() * 60).toFixed(1) + '%;--s:' + (3 + Math.random() * 5).toFixed(1) + 'px;--d:' + (7 + Math.random() * 8).toFixed(1) + 's;--t:-' + (Math.random() * 12).toFixed(1) + 's;--x:' + (Math.random() * 60 - 30).toFixed(0) + 'px"></i>';
    $('#dust').innerHTML = dust;
  }
  // Explore: the wand draws a golden trail down the page, then the map unrolls
  if ($('#explore')) $('#explore').addEventListener('click', function (e) {
    var target = $('#map');
    if (M.reduce) return;
    e.preventDefault();
    var r = e.currentTarget.getBoundingClientRect(), w = innerWidth, hgt = innerHeight;
    var x0 = r.left + r.width / 2, y0 = r.top + r.height / 2, x1 = w * 0.5, y1 = hgt + 40;
    var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('class', 'trail'); svg.setAttribute('viewBox', '0 0 ' + w + ' ' + hgt); svg.setAttribute('aria-hidden', 'true');
    svg.innerHTML = '<path d="M' + x0 + ' ' + y0 + ' C' + (x0 + w * 0.35) + ' ' + (y0 - 120) + ' ' + (w * 0.9) + ' ' + (hgt * 0.75) + ' ' + x1 + ' ' + y1 + '"/>';
    document.body.appendChild(svg);
    var p = svg.firstChild, len = p.getTotalLength();
    p.style.strokeDasharray = len; p.style.strokeDashoffset = len;
    p.getBoundingClientRect();
    p.style.transition = 'stroke-dashoffset .75s cubic-bezier(.5,0,.3,1)'; p.style.strokeDashoffset = 0;
    var start = performance.now();
    (function trailSparks(now) {
      var k = Math.min(1, (now - start) / 750), pt = p.getPointAtLength(len * k);
      M.sparks(pt.x, pt.y, 2);
      if (k < 1) requestAnimationFrame(trailSparks);
    })(start);
    setTimeout(function () { target.scrollIntoView({ behavior: 'smooth' }); svg.style.transition = 'opacity .6s'; svg.style.opacity = 0; }, 700);
    setTimeout(function () { svg.remove(); history.replaceState(null, '', '#map'); }, 1500);
  });

  /* II. Map */
  var POS = { about: [135, 150], experience: [380, 150], skills: [620, 150], projects: [865, 150], decks: [135, 455], lab: [380, 455], common: [620, 455], contact: [865, 455] };
  var YOU = [500, 305];
  function renderMap(locs) {
    if (!$('#mapsheet')) return;
    var roads = '', places = '';
    locs.forEach(function (l, i) {
      var p = POS[l.id], dx = p[0] - YOU[0], cx = YOU[0] + dx * 0.5 + (p[1] < YOU[1] ? -50 : 50) * (dx === 0 ? 0 : 1), cy = (YOU[1] + p[1]) / 2 + (dx === 0 ? 0 : 40) * (p[1] < YOU[1] ? 1 : -1);
      roads += '<path class="road" id="road-' + l.id + '" d="M' + YOU[0] + ' ' + YOU[1] + ' Q' + cx + ' ' + cy + ' ' + p[0] + ' ' + (p[1] + (p[1] < YOU[1] ? 70 : -70)) + '"/>';
      places += '<a class="place" href="' + l.href + '" data-id="' + l.id + '" style="left:' + p[0] / 10 + '%;top:' + p[1] / 6.2 + '%">' +
        '<span class="tip" role="tooltip"><em>' + esc(l.label) + '</em>' + esc(l.blurb) + '</span>' + icon(l.icon, '', 'clay') + '<b>' + esc(l.name) + '</b></a>';
    });
    $('#mapsheet').innerHTML = '<svg viewBox="0 0 1000 620" preserveAspectRatio="none" aria-hidden="true">' +
      '<path class="walls" d="M40 40h920v540H40z M40 300h120 M840 300h120 M380 40v50 M620 40v50 M380 580v-40 M620 580v-40"/>' + roads +
      '<text class="scrawl" x="250" y="318">mind the moving staircases</text><text class="scrawl" x="760" y="318">owl post, this way</text>' +
      '<circle cx="' + YOU[0] + '" cy="' + YOU[1] + '" r="6" fill="#B82E24"/><text class="you" x="' + YOU[0] + '" y="' + (YOU[1] + 30) + '">You are here</text><g id="prints"></g></svg>' + places +
      '<img src="public/assets/ornaments/compass.png" alt="" style="position:absolute;right:3%;bottom:4%;width:7%;opacity:.85">';
    $('#maplist').innerHTML = locs.map(function (l) { return '<li><a href="' + l.href + '">' + icon(l.icon, '') + '<span><b>' + esc(l.name) + '</b>' + esc(l.label) + '. ' + esc(l.blurb) + '</span></a></li>'; }).join('');
    var prints = $('#prints'), timer = null;
    function walk(id) {
      clearInterval(timer); prints.innerHTML = '';
      $$('.road').forEach(function (r) { r.classList.toggle('lit', r.id === 'road-' + id); });
      var path = $('#road-' + id), len = path.getTotalLength(), n = Math.floor(len / 24), i = 0;
      function step() {
        if (i > n) { clearInterval(timer); return; }
        var a = path.getPointAtLength(i * 24), b = path.getPointAtLength(Math.min(len, i * 24 + 2));
        var ang = Math.atan2(b.y - a.y, b.x - a.x) * 180 / Math.PI + 90, side = i % 2 ? 7 : -7, rad = ang * Math.PI / 180;
        prints.insertAdjacentHTML('beforeend', '<path fill="#4A3220" opacity=".7" d="M0-9c3 0 4 3 4 6s-1 5-4 5-4-2-4-5 1-6 4-6zM0 4c2 0 3 1 3 3s-1 3-3 3-3-1-3-3 1-3 3-3z" transform="translate(' + (a.x + Math.cos(rad) * side).toFixed(1) + ' ' + (a.y + Math.sin(rad) * side).toFixed(1) + ') rotate(' + ang.toFixed(0) + ')"/>');
        i++;
      }
      if (M.reduce) { while (i <= n) step(); return; }
      step(); timer = setInterval(step, 60);
    }
    function stop() { clearInterval(timer); prints.innerHTML = ''; $$('.road').forEach(function (r) { r.classList.remove('lit'); }); }
    $$('.place').forEach(function (a) {
      a.addEventListener('mouseenter', function () { walk(a.dataset.id); }); a.addEventListener('focus', function () { walk(a.dataset.id); });
      a.addEventListener('mouseleave', stop); a.addEventListener('blur', stop);
    });
  }

  /* III. Sorting ceremony */
  M.loadJSON('about').then(function (a) {
    if ($('#story')) renderAbout(a);
    if ($('#facts')) $('#facts').innerHTML = a.facts.map(function (f) { return '<li>' + t(f) + '</li>'; }).join('');
  });
  function renderAbout(a) {
    $('#aboutIntro').textContent = a.intro;
    $('#story').innerHTML = a.story.map(function (s) { return '<article class="ph">' + gframe(s.photo) + '<div><h3>' + esc(s.title) + '</h3><p>' + t(s.text) + '</p></div></article>'; }).join('');
    var COL = { gryffindor: 'var(--red)', slytherin: 'var(--green)', hufflepuff: 'var(--gold-text)', ravenclaw: 'var(--blue)' };
    $('#houses').innerHTML = a.houses.map(function (h) { return '<button class="house" type="button" aria-pressed="false" data-id="' + h.id + '">' + icon('crests/' + h.id, h.house + ' crest', 'clay') + '<span>' + esc(h.trait) + '</span></button>'; }).join('');
    var verdict = $('#verdict'), say = $('#hatSay'), hat = $('#hat'), running = false;
    function pick(h) {
      $$('.house').forEach(function (b) { b.setAttribute('aria-pressed', String(b.dataset.id === h.id)); });
      verdict.hidden = false; verdict.style.setProperty('--hc', COL[h.id]);
      verdict.innerHTML = '<h3>' + esc(h.house) + ' · ' + esc(h.trait) + '</h3><p>' + esc(h.line) + '</p><p class="proof">' + esc(h.proof) + '</p>';
    }
    $$('.house').forEach(function (b, i) { b.addEventListener('click', function () { if (!running) { pick(a.houses[i]); say.innerHTML = 'Hmm. <b>' + esc(a.houses[i].house) + '</b>, you say?'; } }); });
    hat.addEventListener('click', function () {
      if (running) return;
      if (M.reduce) { pick(a.houses[0]); say.innerHTML = 'A bit of every house. Pick a crest to see why.'; return; }
      running = true; hat.classList.add('talk'); say.textContent = 'Hmm. Difficult. Very difficult…';
      var i = 0;
      var tick = setInterval(function () {
        pick(a.houses[i]); say.innerHTML = 'Plenty of ' + esc(a.houses[i].trait.toLowerCase()) + '… <b>' + esc(a.houses[i].house) + '</b>?';
        if (++i >= a.houses.length) {
          clearInterval(tick);
          setTimeout(function () { hat.classList.remove('talk'); say.innerHTML = '<b>All four!</b> The hat couldn\'t choose. Pick a crest to see why.'; running = false; }, 1500);
        }
      }, 1500);
    });
  }

  /* IV. Library */
  Promise.all([M.loadJSON('career'), M.loadJSON('projects')]).then(function (r) {
    if (!$('#books')) return;
    var years = r[0].years.slice().reverse(), projects = r[1];
    var COLS = ['#8E2A20', '#2F5A44', '#34508F', '#6B4A2F', '#5A3F8C', '#9C3A22', '#3B6B4F'], HTS = [300, 270, 310, 285, 260, 300, 280];
    $('#books').innerHTML = years.map(function (y, i) {
      return '<button class="book" type="button" aria-expanded="false" aria-controls="bookPage" data-i="' + i + '" style="--c:' + COLS[i % COLS.length] + ';--h:' + HTS[i % HTS.length] + 'px"><span class="s" aria-hidden="true"></span><span class="t">' + esc(y.spine || y.org) + '</span><span class="n" aria-hidden="true">' + ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII'][i] + '</span><span class="sr">: ' + esc(y.title) + '</span></button>';
    }).join('') + '<img class="deco clay" src="' + M.A + 'icons/lantern.png" alt="" aria-hidden="true">';
    var page = $('#bookPage');
    function open(i, focus) {
      var y = years[i], mine = projects.filter(function (p) { return p.workex === y.org; });
      $$('.book').forEach(function (b) { b.setAttribute('aria-expanded', String(+b.dataset.i === i)); });
      page.classList.remove('turn'); void page.offsetWidth; page.classList.add('turn');
      page.innerHTML = '<div class="grid"><div><p class="label">Chapter ' + ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII'][i] + '</p><h3 style="margin-top:10px">' + esc(y.org) + '</h3><p class="role">' + esc(y.title) + '</p>' +
        '<h4>Key responsibilities</h4><ul>' + y.did.map(function (d) { return '<li>' + t(d) + '</li>'; }).join('') + '</ul>' +
        (y.photo ? gframe(y.photo, 'shot') : '') + '</div>' +
        '<div><h4>Measurable impact</h4><div class="impact">' + y.outcomes.map(function (o) { return '<div>' + t(o) + '</div>'; }).join('') + '</div>' +
        '<h4>Skills used</h4><div class="tags">' + y.owls.map(function (o) { return '<span class="chip">' + esc(o) + '</span>'; }).join('') + '</div></div></div>' +
        (mine.length ? '<div class="workprojects"><h4>Projects & achievements</h4><div class="cards">' + mine.map(projectCard).join('') + '</div></div>' : '');
      if (focus) page.scrollIntoView({ behavior: M.reduce ? 'auto' : 'smooth', block: 'nearest' });
    }
    $$('.book').forEach(function (b) { b.addEventListener('click', function () { open(+b.dataset.i, true); }); });
    open(0);
  });

  /* V. Potions */
  // the clay bottle is green; sepia flattens it to amber, then a hue turn pours each brand colour
  var TINT = { '#B82E24': 'sepia(1) saturate(3) hue-rotate(-38deg) brightness(.92)', '#3A5BA9': 'sepia(1) saturate(2.6) hue-rotate(178deg) brightness(.95)', '#6C4BA6': 'sepia(1) saturate(2.2) hue-rotate(222deg) brightness(.95)',
    '#D4A84A': 'sepia(1) saturate(2.4) hue-rotate(4deg) brightness(1.05)', '#6B4A2F': 'sepia(1) saturate(1.4) hue-rotate(-12deg) brightness(.8)' };
  function tint(p) { return p.crystal ? 'saturate(1)' : TINT[p.color] || 'saturate(1)'; }
  if ($('#potions')) M.loadJSON('potions').then(function (pots) {
    M.loadJSON('projects').then(function (projects) {
      var byslug = {}; projects.forEach(function (p) { byslug[p.slug] = p; });
      $('#potions').innerHTML = pots.map(function (p, i) {
        return '<button class="potion" type="button" aria-pressed="false" aria-controls="potcard" data-i="' + i + '" style="--tint:' + tint(p) + ';--pc:' + p.color + '">' + icon(p.crystal ? 'icons/crystal' : 'icons/potion', '') + '<span>' + esc(p.name) + '</span></button>';
      }).join('');
      var card = $('#potcard');
      function pour(i) {
        var p = pots[i];
        $$('.potion').forEach(function (b) { b.setAttribute('aria-pressed', String(+b.dataset.i === i)); });
        card.style.setProperty('--tint', tint(p)); card.style.setProperty('--pc', p.color); card.style.setProperty('--pc2', p.color === '#D4A84A' ? 'var(--gold-text)' : p.color);
        card.classList.remove('turn'); void card.offsetWidth; card.classList.add('turn');
        card.innerHTML = icon(p.crystal ? 'icons/crystal' : 'icons/potion', '', 'big') +
          '<div><h3>' + esc(p.name) + '</h3><p style="margin-top:8px">' + t(p.expertise) + '</p><h4 style="margin-top:18px">Ingredients (tools)</h4><div class="tags">' + p.tools.map(function (x) { return '<span class="chip">' + esc(x) + '</span>'; }).join('') + '</div></div>' +
          '<div><h4>Where I\'ve brewed it</h4><ul>' + p.applied.map(function (x) { return '<li>' + t(x) + '</li>'; }).join('') + '</ul><div class="ex">' +
          p.examples.filter(function (s) { return byslug[s]; }).map(function (s) { return '<a href="case.html#' + s + '">' + esc(byslug[s].title) + ' →</a>'; }).join('') + '</div>' + (p.photo ? gframe(p.photo) : '') + '</div>';
      }
      $$('.potion').forEach(function (b) { b.addEventListener('click', function () { pour(+b.dataset.i); }); });
      pour(0);
    });
  });

  /* VI. Chamber of creations */
  if ($('#cards')) M.loadJSON('projects').then(function (projects) {
    // the chamber holds what I made on my own; job projects live in Experience and spec concepts in the Spec Lab
    projects = projects.filter(function (p) { return !p.workex && p.categories.indexOf('spec') < 0; });
    var filter = 'all', expanded = false, LIMIT = 9;
    var keys = ['all'].concat(Object.keys(CAT).filter(function (k) { return projects.some(function (p) { return p.categories.indexOf(k) > -1; }); }));
    $('#filters').style.display = projects.length <= 6 ? 'none' : '';
    $('#filters').innerHTML = keys.map(function (k) { return '<button type="button" data-k="' + k + '" aria-pressed="' + (k === 'all') + '">' + (k === 'all' ? 'All' : CAT[k].label) + '</button>'; }).join('');
    function render() {
      var list = projects.filter(function (p) { return filter === 'all' || p.categories.indexOf(filter) > -1; });
      var shown = expanded ? list : list.slice(0, LIMIT);
      $('#cards').innerHTML = shown.map(projectCard).join('');
      $('#more').innerHTML = list.length > LIMIT ? '<button class="btn ghost" type="button" id="moreBtn">' + (expanded ? 'Show fewer' : 'Show all ' + list.length + ' spells') + '</button>' : '';
      var mb = $('#moreBtn'); if (mb) mb.addEventListener('click', function () { expanded = !expanded; render(); if (!expanded) $('#projects').scrollIntoView(); });
    }
    $$('#filters button').forEach(function (b) {
      b.addEventListener('click', function () { filter = b.dataset.k; expanded = false; $$('#filters button').forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); }); render(); });
    });
    render();
  });

  // the spec lab: each mock links to its case study, and concepts without a mock get cards here
  if ($('#speccards')) M.loadJSON('projects').then(function (projects) {
    var specs = projects.filter(function (p) { return p.categories.indexOf('spec') > -1; });
    var byKey = {};
    specs.forEach(function (p) { if (LAB[p.slug]) (byKey[LAB[p.slug]] = byKey[LAB[p.slug]] || []).push(p); });
    Object.keys(byKey).forEach(function (k) {
      var panel = $('#p-' + k); if (!panel) return;
      panel.insertAdjacentHTML('afterbegin', '<p class="readcase">Read the case study: ' + byKey[k].map(function (p) { return '<a href="case.html#' + p.slug + '">' + esc(p.title) + ' →</a>'; }).join(' · ') + '</p>');
    });
    $('#speccards').innerHTML = specs.filter(function (p) { return !LAB[p.slug]; }).map(projectCard).join('');
  });

  // presentations: the real decks, each a clay-bound slide stack
  if ($('#decks')) M.loadJSON('decks').then(function (decks) {
    $('#decks').innerHTML = decks.map(function (d) {
      return '<a class="deck" href="' + esc(d.url) + '" target="_blank" rel="noopener"><div class="stack" aria-hidden="true"><i></i><i></i>' +
        '<div class="slide" style="--c1:' + d.c1 + ';--c2:' + d.c2 + '"><small>' + esc(d.type) + '</small><b>' + esc(d.title) + '</b><span><em>Garima Sahani</em><em>' + esc(d.size) + '</em></span></div></div>' +
        '<p><span class="sr">' + esc(d.title) + '. </span>' + esc(d.text) + '</p><span class="open">' + esc(d.open) + ' ↗</span></a>';
    }).join('');
  });

  /* VII. Pensieve */
  if ($('#orbs')) M.loadJSON('pensieve').then(function (mem) {
    $('#orbs').innerHTML = mem.map(function (m, i) {
      return '<li><button class="orb" type="button" aria-expanded="false" aria-controls="memory" data-i="' + i + '" style="--d:' + (4 + (i % 3)) + 's;--t:-' + (i * 0.7).toFixed(1) + 's"><span class="sr">' + esc(m.title) + '</span></button><b aria-hidden="true">' + esc(m.title) + '</b><small>' + esc(m.kind) + '</small></li>';
    }).join('');
    var box = $('#memory');
    $$('.orb').forEach(function (b) {
      b.addEventListener('click', function () {
        var m = mem[+b.dataset.i];
        $$('.orb').forEach(function (x) { x.setAttribute('aria-expanded', String(x === b)); });
        box.hidden = false; box.className = 'memory' + (m.image ? ' hasimg' : '');
        void box.offsetWidth; box.classList.add('turn');
        box.innerHTML = (m.image ? '<img class="photo" src="' + esc(m.image.src) + '" alt="' + esc(m.image.alt) + '" loading="lazy">' : '') + '<div><p class="label">' + esc(m.kind) + '</p><h3 style="margin-top:8px">' + esc(m.title) + '</h3><p>' + t(m.text) + '</p></div>';
      });
    });
  });

  /* VIII. Owlery */
  function renderSocials(site) {
    var links = [{ label: 'Email', url: 'mailto:' + site.email }].concat(site.socials, [site.resume]);
    $('#socials').innerHTML = links.filter(function (l) { return !M.isTodo(l.url); }).map(function (l) {
      var ext = /^http/.test(l.url);
      return '<a href="' + esc(l.url) + '"' + (ext ? ' target="_blank" rel="noopener"' : '') + (/\.pdf$/i.test(l.url) ? ' download' : '') + '>' + esc(l.label) + (ext ? ' ↗' : '') + '</a>';
    }).join('');
    var form = $('#letter'), err = $('#fErr'), desk = $('#desk'), sent = $('#sent');
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var fn = $('#fName'), fe = $('#fEmail'), fm = $('#fMsg'), name = fn.value.trim(), email = fe.value.trim(), msg = fm.value.trim();
      if (!name || !msg || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) { err.textContent = 'The owl needs your name, a valid email and a message.'; (!name ? fn : !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) ? fe : fm).focus(); return; }
      err.textContent = '';
      var go = FORM_ENDPOINT
        ? fetch(FORM_ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify({ name: name, email: email, message: msg }) }).then(function (r) { if (!r.ok) throw 0; })
        : Promise.resolve();
      go.then(function () {
        desk.classList.add('sealed'); sent.hidden = false;
        sent.textContent = FORM_ENDPOINT ? 'Sealed and sent. Your owl is on its way, ' + name + '.' : 'Sealed! Your email app is opening so the owl can fly. If it doesn\'t, write to ' + site.email + '.';
        if (!FORM_ENDPOINT) setTimeout(function () {
          location.href = 'mailto:' + site.email + '?subject=' + encodeURIComponent('An owl from ' + name) + '&body=' + encodeURIComponent(msg + '\n\n' + name + '\n' + email);
        }, M.reduce ? 0 : 1600);
      }).catch(function () { err.textContent = 'The owl got lost. Please email ' + site.email + ' instead.'; });
    });
  }

  // content renders after load, so honour a #section link once the page has its final height
  if (location.hash.length > 1) addEventListener('load', function () { setTimeout(function () { var el = document.getElementById(location.hash.slice(1)); if (el) scrollTo({ top: el.getBoundingClientRect().top + scrollY - 70, behavior: 'instant' }); }, 300); });
})();
