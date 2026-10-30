/* Case study: one project from content/projects.json, picked by the URL hash, with page-turn navigation */
(function () {
  var M = window.MA, $ = M.$, esc = M.esc, t = M.t, icon = M.icon;
  var SECTIONS = [['challenge', 'The Challenge', 'icons/map'], ['role', 'My Role', 'icons/hat'], ['research', 'Research & Insights', 'icons/glasses'],
    ['strategy', 'Strategy', 'icons/spellbook'], ['execution', 'Execution', 'icons/wand'], ['results', 'Results & Learnings', 'icons/crystal']];
  function list(items) { return items && items.length ? '<ul>' + items.map(function (x) { return '<li>' + t(x) + '</li>'; }).join('') + '</ul>' : ''; }
  function links(ls) { return (ls || []).filter(function (l) { return !M.isTodo(l.url); }).map(function (l) { return '<a href="' + esc(l.url) + '" target="_blank" rel="noopener">' + esc(l.label) + ' ↗</a>'; }).join(' · '); }
  var LAB = { 'airbnb-znmd': 'znmd', 'sarvam-diwali': 'sarvam', 'spotify-homejam': 'spotads', 'spotify-navbeats': 'spotads', 'jiocinema-paris': 'jio', 'spotify-offline': 'spotify', 'spotify-premium': 'premium', 'supermoney-okrs': 'supermoney', 'supercard-sales': 'supercard', 'airbnb-for-work': 'airbnb' };
  var last = -1;
  function render(projects, career) {
    var slug = location.hash.slice(1), i = -1;
    projects.forEach(function (p, k) { if (p.slug === slug) i = k; });
    var main = $('#case');
    if (i < 0) { main.innerHTML = '<div class="lost"><div>' + icon('icons/lantern', '', 'clay') + '<h1>This spellbook is missing.</h1><p><a class="btn" href="projects.html">Back to the Chamber</a></p></div></div>'; return; }
    var p = projects[i], spec = p.categories.indexOf('spec') > -1, ing = p.ingredients || {};
    var prev = projects[(i - 1 + projects.length) % projects.length], next = projects[(i + 1) % projects.length];
    var job = career.years.filter(function (y) { return y.org === p.workex; })[0];
    var role = spec ? 'Self-initiated and unofficial: a concept I made on my own, not commissioned by ' + p.brand + '.' : job ? job.title + ' at ' + job.org + '.' : 'TODO: add your role on this project';
    var imgs = [].concat(p.image ? [p.image] : [], p.gallery || []);
    document.title = p.title + ' · Garima Sahani';
    var body = {
      challenge: '<p>' + t(p.prophecy) + '</p>',
      role: '<p>' + t(role) + '</p>',
      research: (p.why ? '<p>' + t(p.why) + '</p>' : '') + '<div class="facts2">' + [['Audience', ing.audience], ['Channels', ing.channels], ['Tools', ing.tools], ['Budget', ing.budget]]
        .map(function (r) { return '<div><b>' + r[0] + '</b>' + t(r[1] || 'TODO') + '</div>'; }).join('') + '</div>',
      strategy: '<p>' + t(p.idea || p.summary) + '</p>' + (p.quote ? '<p class="quote">“' + esc(p.quote) + '”</p>' : ''),
      execution: list(p.spellwork) + (imgs.length ? '<div class="gallery">' + imgs.map(function (im) { return '<figure class="photo"><img src="' + esc(im.src) + '" alt="' + esc(im.alt) + '" loading="lazy"><figcaption>' + esc(im.alt) + '</figcaption></figure>'; }).join('') + '</div>' : ''),
      results: (p.results && p.results.length ? '<div class="results">' + p.results.map(function (r) { return '<div><b>' + t(r.value) + '</b>' + t(r.label) + '</div>'; }).join('') + '</div>' : '') +
        (spec ? '<p class="spec-note">This is a spec concept, so these are targets, research figures or post reach, not live campaign results.</p>' : '') +
        '<h3 style="margin-top:22px;font:400 .95rem var(--fell);letter-spacing:.2em;text-transform:uppercase;color:var(--gold-text)">What I learned</h3>' + list(p.lessons) +
        (links(p.links) ? '<p style="margin-top:16px">' + links(p.links) + '</p>' : '')
    };
    main.innerHTML = '<header class="casehead"><p class="label">' + esc(p.brand) + (spec ? ' · Spec concept' : '') + '</p><h1>' + esc(p.title) + '</h1><p>' + t(p.summary) + '</p>' +
      (p.metric ? '<div class="chips"><span class="chip">' + esc(p.metric.value + ' ' + p.metric.label) + '</span></div>' : '') +
      (LAB[p.slug] ? '<p style="margin-top:22px"><a class="btn" href="spec-lab.html#' + LAB[p.slug] + '">Play with the live mock <span class="arr" aria-hidden="true">→</span></a></p>' : '') + '</header>' +
      '<article class="casebook" id="book"><ul class="toc">' + SECTIONS.map(function (s, k) { return '<li><a href="#' + p.slug + '" data-go="cs-' + s[0] + '">' + (k + 1) + '. ' + esc(s[1]) + '</a></li>'; }).join('') + '</ul>' +
      SECTIONS.map(function (s, k) { return '<section class="cs" id="cs-' + s[0] + '"><h2>' + icon(s[2], '') + '<span><span class="n">' + ['I', 'II', 'III', 'IV', 'V', 'VI'][k] + '.</span> ' + esc(s[1]) + '</span></h2>' + body[s[0]] + '</section>'; }).join('') + '</article>' +
      '<nav class="pager" aria-label="More projects"><a href="case.html#' + prev.slug + '" data-dir="prev">← ' + esc(prev.title) + '</a><a class="btn ghost" href="projects.html">All projects</a><a href="case.html#' + next.slug + '" data-dir="next">' + esc(next.title) + ' →</a></nav>';
    M.$$('.toc a').forEach(function (a) { a.addEventListener('click', function (e) { e.preventDefault(); document.getElementById(a.dataset.go).scrollIntoView({ behavior: M.reduce ? 'auto' : 'smooth' }); }); });
    var book = $('#book');
    if (last > -1 && !M.reduce) book.classList.add(i > last || (last === projects.length - 1 && i === 0) ? 'turn-next' : 'turn-prev');
    last = i;
    scrollTo(0, 0);
  }
  Promise.all([M.loadJSON('projects'), M.loadJSON('career')]).then(function (r) {
    render(r[0], r[1]);
    addEventListener('hashchange', function () { render(r[0], r[1]); });
  });
})();
