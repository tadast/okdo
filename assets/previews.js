// Small live previews of each product for the company page.
// Mark a box with data-preview="kestrel|almanac|barback|doremingo" and call OKPreviews.mountAll().
// The almanac preview needs assets/school-dots.js on the page.
(function () {
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var NS = 'http://www.w3.org/2000/svg';

  function s(tag, attrs, parent) {
    var n = document.createElementNS(NS, tag);
    for (var k in attrs) n.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(n);
    return n;
  }
  function box(host) {
    return s('svg', { viewBox: '0 0 200 125', class: 'pv', 'aria-hidden': 'true', focusable: 'false', preserveAspectRatio: 'xMidYMid meet' }, host);
  }
  function clamp(x) { return x < 0 ? 0 : x > 1 ? 1 : x; }
  function ease(x) { x = clamp(x); return 1 - Math.pow(1 - x, 3); }

  var css = document.createElement('style');
  css.textContent =
    '[data-preview]{position:relative;overflow:hidden}' +
    '.pv{position:absolute;inset:0;width:100%;height:100%;display:block}' +
    '.pv text{font-family:var(--pv-mono,ui-monospace,SFMono-Regular,Menlo,monospace)}' +
    '.pv-ink{fill:var(--pv-ink,#111)}.pv-mute{fill:var(--pv-mute,#8a8f98)}.pv-acc{fill:var(--pv-accent,#d9480f)}' +
    '.pv-sm{font-size:9px;letter-spacing:.04em}.pv-lg{font-size:17px;font-weight:600}' +
    '.pv-track{fill:none;stroke:var(--pv-line,rgba(127,127,127,.25));stroke-width:5}' +
    '.pv-ring{fill:none;stroke:var(--pv-accent,#d9480f);stroke-width:5;stroke-linecap:round}' +
    '.pv-cell{fill:var(--pv-line,rgba(127,127,127,.22));transition:fill .25s}.pv-cell.on{fill:var(--pv-accent,#d9480f)}' +
    '.pv-edge{fill:none;stroke:var(--pv-mute,#8a8f98);stroke-width:1}' +
    '.pv-node{fill:var(--pv-ink,#111)}.pv-group{fill:var(--pv-accent,#2b8a3e)}' +
    '.pv-halo{fill:none;stroke:var(--pv-accent,#2b8a3e);stroke-width:1.2}';
  document.head.appendChild(css);

  var make = {};

  // Kestrel: an "ends tonight" ring that resets each day at the same price; after 14 days, a finding.
  make.kestrel = function (host) {
    var g = box(host);
    var R = 27, C = 2 * Math.PI * R;
    s('circle', { cx: 52, cy: 56, r: R, class: 'pv-track' }, g);
    var ring = s('circle', { cx: 52, cy: 56, r: R, class: 'pv-ring', transform: 'rotate(-90 52 56)', 'stroke-dasharray': C }, g);
    var price = s('text', { x: 52, y: 62, 'text-anchor': 'middle', class: 'pv-ink pv-lg' }, g);
    price.textContent = '£24';
    s('text', { x: 100, y: 30, class: 'pv-mute pv-sm' }, g).textContent = 'ENDS TONIGHT';
    var cells = [];
    for (var i = 0; i < 14; i++) {
      cells.push(s('rect', { x: 100 + (i % 7) * 12, y: 40 + Math.floor(i / 7) * 12, width: 9, height: 9, rx: 2, class: 'pv-cell' }, g));
    }
    var day = s('text', { x: 100, y: 82, class: 'pv-mute pv-sm' }, g);
    var finding = s('text', { x: 100, y: 108, 'text-anchor': 'middle', class: 'pv-acc pv-sm' }, g);
    finding.textContent = 'FINDING: FALSE URGENCY';
    var P = 0.9, HOLD = 2.6, CYCLE = 14 * P + HOLD;
    return function (t) {
      var c = t % CYCLE, d = Math.min(14, Math.floor(c / P)), w = (c - d * P) / P;
      ring.setAttribute('stroke-dashoffset', d >= 14 ? C : C * ease(w * 1.1));
      cells.forEach(function (cell, i) { cell.setAttribute('class', 'pv-cell' + (i < d ? ' on' : '')); });
      day.textContent = 'DAY ' + Math.min(14, d + 1) + ' OF 14';
      finding.style.opacity = d >= 14 ? 1 : 0;
    };
  };
  make.kestrel.still = 99;

  // Almanac: English school locations appear south to north; a few pulse as illustrative adoptions.
  make.almanac = function (host) {
    var cv = document.createElement('canvas');
    cv.className = 'pv';
    cv.setAttribute('aria-hidden', 'true');
    host.appendChild(cv);
    var ctx = cv.getContext('2d');
    var D = window.SCHOOL_DOTS || [], N = D.length / 2;
    var order = [];
    for (var i = 0; i < N; i++) order.push(i);
    order.sort(function (a, b) { return D[a * 2 + 1] - D[b * 2 + 1]; });
    var W = 0, H = 0, dpr = 1, sc, ox, oy, base, ink, acc, mute;
    function size() {
      W = host.clientWidth; H = host.clientHeight;
      if (!W || !H) return false;
      dpr = Math.min(2, window.devicePixelRatio || 1);
      cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
      var pad = 6;
      sc = Math.min((W - 2 * pad) / 518, (H - 2 * pad) / 612);
      ox = (W - 518 * sc) / 2 - 136 * sc; oy = (H - 612 * sc) / 2 + 637 * sc;
      var st = getComputedStyle(host);
      mute = st.getPropertyValue('--pv-mute').trim() || '#8a8f98';
      acc = st.getPropertyValue('--pv-accent').trim() || '#3b5bdb';
      ink = st.getPropertyValue('--pv-ink').trim() || '#111';
      base = null;
      return true;
    }
    function dot(c, idx, r) {
      c.fillRect(ox + D[idx * 2] * sc - r / 2, oy - D[idx * 2 + 1] * sc - r / 2, r, r);
    }
    var R = Math.max(1, sc ? sc * 1.6 : 1.2);
    function renderBase() {
      base = document.createElement('canvas');
      base.width = cv.width; base.height = cv.height;
      var b = base.getContext('2d');
      b.setTransform(dpr, 0, 0, dpr, 0, 0);
      b.fillStyle = mute; b.globalAlpha = 0.75;
      R = Math.max(1, sc * 2.2);
      for (var i = 0; i < N; i++) dot(b, i, R);
    }
    function rnd(k) { var x = Math.sin(k * 127.1) * 43758.5453; return x - Math.floor(x); }
    return function (t) {
      if (host.clientWidth !== W || host.clientHeight !== H || !base) { if (!size()) return; renderBase(); }
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, cv.width, cv.height);
      var reveal = clamp(t / 1.6);
      if (reveal < 1) {
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.fillStyle = mute; ctx.globalAlpha = 0.75;
        var upto = Math.floor(N * ease(reveal));
        for (var j = 0; j < upto; j++) dot(ctx, order[j], R);
        ctx.globalAlpha = 1;
        return;
      }
      ctx.drawImage(base, 0, 0);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      var tt = t - 1.6, every = 0.45, life = 2.4;
      var k0 = Math.max(0, Math.floor((tt - life) / every));
      for (var k = k0; k * every <= tt; k++) {
        var age = (tt - k * every) / life;
        if (age < 0 || age > 1) continue;
        var idx = Math.floor(rnd(k + 1) * N);
        var x = ox + D[idx * 2] * sc, y = oy - D[idx * 2 + 1] * sc;
        var drop = rnd(k + 7) < 0.3;
        ctx.globalAlpha = 1 - age;
        ctx.strokeStyle = drop ? ink : acc;
        ctx.lineWidth = 1;
        ctx.beginPath(); ctx.arc(x, y, 2 + age * 9, 0, Math.PI * 2); ctx.stroke();
        ctx.fillStyle = drop ? ink : acc;
        ctx.beginPath(); ctx.arc(x, y, 2, 0, Math.PI * 2); ctx.fill();
      }
      ctx.globalAlpha = 1;
    };
  };
  make.almanac.still = 1.6;

  // Barback: venues join their operators, operators join one group.
  make.barback = function (host) {
    var g = box(host);
    var V = [[18, 22], [34, 46], [14, 66], [40, 16], [28, 92], [52, 108], [12, 112], [56, 70], [62, 38], [44, 82], [70, 96], [24, 40]];
    var O = [[108, 30], [104, 64], [110, 98]];
    var own = [0, 0, 1, 0, 2, 2, 2, 1, 0, 1, 2, 1];
    var G = [168, 62];
    var e1 = [], e2 = [], vn = [], on = [];
    V.forEach(function (v, i) {
      var o = O[own[i]];
      var len = Math.hypot(o[0] - v[0], o[1] - v[1]);
      e1.push({ el: s('line', { x1: v[0], y1: v[1], x2: o[0], y2: o[1], class: 'pv-edge', 'stroke-dasharray': len }, g), len: len, i: i });
    });
    O.forEach(function (o) {
      var len = Math.hypot(G[0] - o[0], G[1] - o[1]);
      e2.push({ el: s('line', { x1: o[0], y1: o[1], x2: G[0], y2: G[1], class: 'pv-edge', 'stroke-dasharray': len }, g), len: len });
    });
    V.forEach(function (v) { vn.push(s('circle', { cx: v[0], cy: v[1], r: 2.6, class: 'pv-node' }, g)); });
    O.forEach(function (o) { on.push(s('circle', { cx: o[0], cy: o[1], r: 4.5, class: 'pv-node' }, g)); });
    var halo = s('circle', { cx: G[0], cy: G[1], r: 10, class: 'pv-halo' }, g);
    var grp = s('circle', { cx: G[0], cy: G[1], r: 8, class: 'pv-group' }, g);
    var lab = s('text', { x: G[0], y: G[1] + 26, 'text-anchor': 'middle', class: 'pv-ink pv-sm' }, g);
    lab.textContent = '12 SITES';
    var CYCLE = 7.5;
    function pop(el, p, r) { el.setAttribute('r', r * ease(p)); }
    return function (t) {
      var c = t % CYCLE, out = 1 - clamp((c - 6.6) / 0.8);
      g.style.opacity = out;
      vn.forEach(function (n, i) { pop(n, (c - i * 0.05) / 0.35, 2.6); });
      e1.forEach(function (e) { e.el.setAttribute('stroke-dashoffset', e.len * (1 - ease((c - 0.7 - e.i * 0.07) / 0.6))); });
      on.forEach(function (n, i) { pop(n, (c - 1.2 - i * 0.12) / 0.4, 4.5); });
      e2.forEach(function (e, i) { e.el.setAttribute('stroke-dashoffset', e.len * (1 - ease((c - 2.2 - i * 0.1) / 0.6))); });
      pop(grp, (c - 2.8) / 0.5, 8);
      var h = ((c - 3.3) % 1.6) / 1.6;
      halo.setAttribute('r', c > 3.3 ? 8 + h * 12 : 0);
      halo.style.opacity = c > 3.3 ? 1 - h : 0;
      lab.style.opacity = clamp((c - 3.2) / 0.4);
    };
  };
  make.barback.still = 5;

  // DoReMingo: the flamingo bobs and notes rise.
  make.doremingo = function (host) {
    var g = box(host);
    s('rect', { x: 0, y: 0, width: 200, height: 125, fill: '#fff7ed' }, g);
    var notes = [];
    ['♪', '♫', '♩', '♪'].forEach(function (ch, i) {
      var n = s('text', { x: 0, y: 0, 'text-anchor': 'middle', fill: i % 2 ? '#c42e62' : '#ff5d8f', style: 'font:600 16px ui-rounded,system-ui,sans-serif' }, g);
      n.textContent = ch;
      notes.push(n);
    });
    var bird = s('image', { href: host.dataset.src || 'doremingo/flamingo.svg', x: 72, y: 34, width: 56, height: 56 }, g);
    return function (t) {
      bird.setAttribute('y', 34 + Math.sin(t * 2.2) * 3);
      notes.forEach(function (n, i) {
        var p = ((t * 0.32) + i / notes.length) % 1;
        n.setAttribute('x', (i % 2 ? 140 : 60) + Math.sin((p + i) * 6) * 8);
        n.setAttribute('y', 108 - p * 92);
        n.style.opacity = Math.sin(p * Math.PI);
      });
    };
  };
  make.doremingo.still = 0.6;

  var live = [], running = false;
  function loop(now) {
    if (!document.hidden) live.forEach(function (it) {
      if (!it.vis) { it.t0 = null; return; }
      if (it.t0 === null) it.t0 = now - it.carry * 1000;
      it.carry = (now - it.t0) / 1000;
      it.tick(it.carry);
    });
    requestAnimationFrame(loop);
  }
  window.OKPreviews = {
    mountAll: function (scope) {
      var io = 'IntersectionObserver' in window ? new IntersectionObserver(function (es) {
        es.forEach(function (e) { e.target._pv.vis = e.isIntersecting; });
      }, { rootMargin: '40px' }) : null;
      (scope || document).querySelectorAll('[data-preview]').forEach(function (host) {
        var f = make[host.dataset.preview];
        if (!f || host._pv) return;
        var it = { tick: f(host), vis: !io, t0: null, carry: 0 };
        host._pv = it;
        if (reduce) {
          var still = function () { it.tick(f.still); };
          still();
          if (window.ResizeObserver) new ResizeObserver(still).observe(host);
          return;
        }
        live.push(it);
        if (io) io.observe(host);
      });
      if (!reduce && !running) { running = true; requestAnimationFrame(loop); }
    }
  };
})();
