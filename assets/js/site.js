/* BNI-ECR Network website: shared header/footer and data-driven components.
   Content lives in /data/*.json. See README.md for how to edit it. */
(function () {
  'use strict';

  var esc = function (s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  };
  // Text from the data files: *like this* is shown in italics (species and genus names).
  var rich = function (s) { return esc(s).replace(/\*([^*\n]+)\*/g, '<em>$1</em>'); };
  var plain = function (s) { return String(s == null ? '' : s).replace(/\*/g, ''); };
  var safeUrl = function (u) { return /^(https?:|mailto:|[\w./#?=&-]+$)/i.test(u || '') ? u : ''; };
  var getJSON = function (f) {
    return fetch('data/' + f).then(function (r) {
      if (!r.ok) throw new Error(f + ': ' + r.status);
      return r.json();
    });
  };
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  /* ---------- Header & footer ---------- */
  function buildChrome(site) {
    var page = (location.pathname.split('/').pop() || 'index.html');
    var links = site.nav.map(function (n) {
      var cur = n.href === page ? ' aria-current="page"' : '';
      return '<li><a href="' + esc(n.href) + '"' + cur + '>' + esc(n.label) + '</a></li>';
    }).join('');
    var joinCur = page === 'join.html' ? ' aria-current="page"' : '';
    var header = $('#site-header');
    if (header) {
      header.className = 'site-header';
      header.innerHTML =
        '<div class="wrap bar">' +
        '<a class="brand" href="index.html" aria-label="BNI-ECR Network, home">' +
        '<img src="assets/img/logo-icon.png" alt="" width="44" height="44"><span>BNI-ECR<small>Network</small></span></a>' +
        '<button class="nav-toggle" aria-expanded="false" aria-controls="primary-nav"><span class="sr">Menu</span>' +
        '<svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true"><path d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg></button>' +
        '<nav id="primary-nav" aria-label="Main"><ul>' + links +
        '<li><a class="btn btn-small" href="join.html"' + joinCur + '>' + esc(site.joinLabel) + '</a></li></ul></nav></div>';
      var btn = $('.nav-toggle', header), nav = $('#primary-nav', header);
      btn.addEventListener('click', function () {
        var open = nav.classList.toggle('open');
        btn.setAttribute('aria-expanded', open);
      });
    }
    var footer = $('#site-footer');
    if (footer) {
      footer.className = 'site-footer';
      footer.innerHTML =
        '<div class="wrap foot-grid">' +
        '<div><img class="foot-logo" src="assets/img/logo-arc.png" alt="BNI-ECR: Early Career Researchers Network for Biological Nitrification Inhibition" width="180">' +
        '</div>' +
        '<div><h2>Explore</h2><ul>' + links + '<li><a href="join.html">Join the network</a></li></ul></div>' +
        '<div><h2>Contact</h2><p>' + esc(site.coordinator) + ',<br>Founder and Co-coordinator<br>' +
        '<a href="mailto:' + esc(site.email) + '">' + esc(site.email) + '</a>' +
        (safeUrl(site.linkedinUrl) && site.linkedinUrl ? '<br><a href="' + esc(site.linkedinUrl) + '" rel="noopener">LinkedIn group</a>' : '') + '</p></div></div>' +
        '<div class="wrap fine"><p>The BNI-ECR Network is an early-career-researcher-led community. It is distinct from the International BNI Consortium. ' +
        'Institutional affiliations shown on this site are those of individual members and do not imply institutional ownership, sponsorship or endorsement.</p>' +
        '<p>© ' + new Date().getFullYear() + ' BNI-ECR Network</p></div>';
    }
    $$('[data-email]').forEach(function (a) {
      a.href = 'mailto:' + site.email;
      if (!a.textContent.trim()) a.textContent = site.email;
    });
  }

  /* ---------- Events ---------- */
  function icsLink(ev) {
    if (!ev.start || !ev.end) return '';
    var f = function (d) { return new Date(d).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, ''); };
    var ics = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//BNI-ECR Network//EN', 'BEGIN:VEVENT',
      'UID:' + ev.id + '@bni-ecr', 'DTSTAMP:' + f(new Date()), 'DTSTART:' + f(ev.start), 'DTEND:' + f(ev.end),
      'SUMMARY:' + ev.title.replace(/,/g, '\\,'), 'LOCATION:' + (ev.location || '').replace(/,/g, '\\,'),
      'DESCRIPTION:Programme subject to updates.', 'END:VEVENT', 'END:VCALENDAR'].join('\r\n');
    return '<a class="btn btn-ghost btn-small" download="' + esc(ev.id) + '.ics" href="data:text/calendar;charset=utf-8,' +
      encodeURIComponent(ics) + '">Add to calendar</a>';
  }

  function eventCard(ev, opts) {
    opts = opts || {};
    var meta = [];
    meta.push('<li><span>Date</span>' + esc(ev.dateLabel) + '</li>');
    if (ev.time) meta.push('<li><span>Time</span>' + esc(ev.time) + (ev.timezone ? ' <em>(' + esc(ev.timezone) + ')</em>' : '') + '</li>');
    if (ev.location) meta.push('<li><span>Venue</span>' + esc(ev.location) + '</li>');
    if (ev.chairs && ev.chairs.length) meta.push('<li><span>Chairs</span>' + esc(ev.chairs.join(' and ')) + '</li>');
    var prog = '';
    if (ev.programme && ev.programme.length && !opts.compact) {
      prog = '<h4>Programme</h4><ul class="prog">' + ev.programme.map(function (p) {
        return '<li>' + (p.time ? '<b>' + esc(p.time) + '</b> ' : '') + rich(p.item) + '</li>';
      }).join('') + '</ul>';
    }
    var tag = ev.placeholder ? '<span class="tag tag-ph">Placeholder</span>' :
      (ev.status === 'past' ? '<span class="tag">Past</span>' : '<span class="tag tag-live">Upcoming</span>');
    var actions = '';
    if (ev.status !== 'past' && !ev.placeholder) actions += icsLink(ev);
    if (safeUrl(ev.link)) actions += ' <a class="btn btn-small" href="' + esc(ev.link) + '">Details</a>';
    return '<article class="card event' + (opts.featured ? ' event-featured' : '') + '">' +
      '<header>' + tag + (ev.partOf ? '<p class="kicker">Part of the ' + esc(ev.partOf) + '</p>' : '') +
      '<h3>' + esc(ev.title) + '</h3></header>' +
      '<p>' + rich(ev.summary) + '</p><ul class="meta">' + meta.join('') + '</ul>' + prog +
      (ev.note ? '<p class="note">' + esc(ev.note) + '</p>' : '') +
      (actions ? '<p class="actions">' + actions + '</p>' : '') + '</article>';
  }

  function renderEvents(events) {
    $$('[data-events]').forEach(function (el) {
      var mode = el.getAttribute('data-events');
      var list = events.filter(function (e) {
        if (mode === 'featured') return e.featured;
        return e.status === mode;
      });
      el.innerHTML = list.length ? list.map(function (e) {
        return eventCard(e, { featured: mode === 'featured', compact: el.hasAttribute('data-compact') });
      }).join('') : '<p class="muted">Nothing listed yet.</p>';
    });
  }

  /* ---------- Members ---------- */
  function memberCard(m) {
    var initials = m.name.split(/\s+/).map(function (w) { return w[0]; }).filter(function (c) { return /\w/.test(c); }).slice(0, 2).join('');
    var avatar = m.photo ? '<img src="' + esc(m.photo) + '" alt="Photo of ' + esc(m.name) + '">' :
      '<span class="avatar-fallback" aria-hidden="true">' + (m.placeholder ? '+' : esc(initials)) + '</span>';
    var rows = [];
    var add = function (k, v) { if (v) rows.push('<dt>' + k + '</dt><dd>' + rich(v) + '</dd>'); };
    add('Career stage', m.stage);
    add('Research focus', m.focus);
    add('Crop or system', m.system);
    var tags = (m.expertise || []).map(function (t) { return '<li>' + rich(t) + '</li>'; }).join('');
    var link = safeUrl(m.profileUrl) ? '<p><a href="' + esc(m.profileUrl) + '" rel="noopener">' + esc(m.profileLabel || 'Profile') + ' →</a></p>' : '';
    var search = plain([m.name, m.institution, m.country, m.stage, m.focus, m.system, (m.expertise || []).join(' ')].join(' ')).toLowerCase();
    return '<article class="card member' + (m.placeholder ? ' is-placeholder' : '') + (m.featured ? ' is-featured' : '') + '" data-search="' + esc(search) + '">' +
      '<div class="avatar">' + avatar + '</div><div><h3>' + esc(m.name) + '</h3>' +
      (m.role ? '<p class="role">' + esc(m.role) + '</p>' : '') +
      '<p class="inst">' + esc(m.institution) + (m.country ? ', ' + esc(m.country) : '') + '</p></div>' +
      '<dl>' + rows.join('') + '</dl>' + (tags ? '<ul class="chips">' + tags + '</ul>' : '') + link + '</article>';
  }

  function renderMembers(members) {
    $$('[data-members]').forEach(function (el) {
      el.innerHTML = members.map(memberCard).join('');
    });
    var q = $('#member-search');
    if (q) q.addEventListener('input', function () {
      var t = q.value.trim().toLowerCase(), shown = 0;
      $$('.member').forEach(function (c) {
        var hit = !t || c.getAttribute('data-search').indexOf(t) > -1;
        c.hidden = !hit; if (hit) shown++;
      });
      var none = $('#member-none'); if (none) none.hidden = shown > 0;
    });
  }

  /* ---------- Resources & news ---------- */
  function renderResources(res) {
    $$('[data-resources]').forEach(function (el) {
      el.innerHTML = res.map(function (r) {
        var items = (r.items || []).map(function (i) {
          return '<li>' + (safeUrl(i.url) ? '<a href="' + esc(i.url) + '" rel="noopener">' + esc(i.title) + '</a>' : esc(i.title)) +
            (i.note ? ' <span class="muted">' + esc(i.note) + '</span>' : '') + '</li>';
        }).join('');
        return '<article class="card resource"><h3>' + esc(r.category) + '</h3><p>' + rich(r.description) + '</p>' +
          (items ? '<ul>' + items + '</ul>' : '<p class="empty">Nothing here yet. Members can suggest additions.</p>') + '</article>';
      }).join('');
    });
  }

  function renderNews(news) {
    $$('[data-news]').forEach(function (el) {
      var n = parseInt(el.getAttribute('data-news'), 10) || news.length;
      el.innerHTML = news.slice(0, n).map(function (x) {
        var t = '<h3>' + (safeUrl(x.link) ? '<a href="' + esc(x.link) + '">' + esc(x.title) + '</a>' : esc(x.title)) + '</h3>';
        return '<article class="card news"><p class="kicker">' + esc(x.date) + (x.placeholder ? ' · placeholder' : '') + '</p>' + t + '<p>' + rich(x.text) + '</p></article>';
      }).join('');
    });
  }

  /* ---------- Join ---------- */
  function renderJoin(site) {
    var body = encodeURIComponent(
      'Hello,\n\nI would like to join the BNI-ECR Network.\n\n' +
      'Full name:\nInstitution:\nCountry:\nCurrent career stage:\nMain research topic:\nCrop, plant or agricultural system studied:\nMethods or areas of expertise:\n' +
      'Connection to BNI (a few sentences):\nI am interested in (tick any): [ ] presenting a mini-webinar  [ ] contributing to joint writing  [ ] helping organize activities\n\nThank you!');
    var mail = 'mailto:' + site.email + '?subject=' + encodeURIComponent('Join the BNI-ECR Network') + '&body=' + body;
    $$('[data-join-cta]').forEach(function (el) {
      if (safeUrl(site.joinFormUrl) && site.joinFormUrl) {
        el.innerHTML = '<a class="btn" href="' + esc(site.joinFormUrl) + '" rel="noopener">Open the membership form</a> ' +
          '<a class="btn btn-ghost" href="' + esc(mail) + '">Or apply by email</a>';
      } else {
        el.innerHTML = '<a class="btn" href="' + esc(mail) + '">Apply by email</a>' +
          '<p class="muted small">An online form is coming soon. The button opens an email with the questions pre-filled.</p>';
      }
    });
    $$('[data-join-embed]').forEach(function (el) {
      if (site.joinFormEmbedUrl && /^https:\/\//.test(site.joinFormEmbedUrl)) {
        el.hidden = false;
        el.innerHTML = '<iframe title="BNI-ECR Network membership form" src="' + esc(site.joinFormEmbedUrl) +
          '" loading="lazy" width="100%" height="1500" frameborder="0">Loading…</iframe>';
      } else { el.hidden = true; }
    });
  }

  /* ---------- Boot ---------- */
  Promise.all([getJSON('site.json'), getJSON('events.json'), getJSON('members.json'), getJSON('resources.json'), getJSON('news.json')])
    .then(function (d) {
      buildChrome(d[0]); renderEvents(d[1]); renderMembers(d[2]); renderResources(d[3]); renderNews(d[4]); renderJoin(d[0]);
    })
    .catch(function (e) {
      console.error(e);
      var m = document.createElement('p');
      m.className = 'load-error';
      m.textContent = 'Some content could not be loaded. If you opened this file directly, serve the folder with a local web server (see README).';
      document.body.insertBefore(m, document.body.firstChild);
    });
})();
