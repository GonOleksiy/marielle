/* ============================================================
   MARIELLE — сторінка товару
   Вибір кольору й розміру, 3D-обертання перетягуванням,
   таблиця мірок, схожі позиції.
   ============================================================ */
(function () {
  'use strict';

  var M = window.MR;
  if (!M) return;
  var $ = M.$, $$ = M.$$, on = M.on, esc = M.esc, money = M.money, I = M.I;

  var box = $('[data-pdp]');
  if (!box) return;

  var p = window.DATA.byId(M.qs('id'));

  /* ---------- товар не знайдено ---------- */
  if (!p) {
    box.innerHTML = '<div class="empty" style="grid-column:1/-1">' +
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"><circle cx="11" cy="11" r="6.4"/><path d="m16 16 4.4 4.4"/></svg>' +
      '<h2 style="margin:0">Такої позиції немає</h2>' +
      '<p>Можливо, вона вже розпродана або посилання застаріло.</p>' +
      '<a class="btn" href="catalog.html">До каталогу</a></div>';
    document.title = 'Товар не знайдено — Marielle';
    return;
  }

  document.title = p.name + ' — Marielle';
  var meta = $('meta[name="description"]');
  if (meta) meta.setAttribute('content', p.desc);

  /* ---------- стан вибору ---------- */
  var sel = { color: 0, size: p.sizes.length > 2 ? 1 : 0, q: 1 };

  /* ---------- сітки мірок ---------- */
  var MEAS_W = {
    'XS': [82, 63, 89], 'S': [86, 67, 93], 'M': [90, 71, 97],
    'L':  [96, 77, 103], 'XL': [102, 83, 109]
  };
  var MEAS_M = {
    'S':  [96, 82, 39], 'M': [100, 86, 40], 'L': [106, 92, 41.5],
    'XL': [112, 98, 43], 'XXL': [118, 104, 44.5]
  };
  var isMen = p.g === 'm';
  var MEAS  = isMen ? MEAS_M : MEAS_W;
  var MEAS_H = isMen ? ['Груди, см', 'Талія, см', 'Шия, см'] : ['Груди, см', 'Талія, см', 'Стегна, см'];

  /* ---------- ланцюжок ---------- */
  var cat = window.DATA.cat(p.cat);
  $('[data-crumbs]').innerHTML =
    '<a href="index.html">Головна</a><i>/</i>' +
    '<a href="catalog.html">Каталог</a><i>/</i>' +
    (cat ? '<a href="catalog.html?cat=' + cat.id + '">' + esc(cat.name) + '</a><i>/</i>' : '') +
    '<span>' + esc(p.name) + '</span>';

  /* ============================================================
     РОЗМІТКА
     ============================================================ */
  function stars(r) {
    var out = '';
    for (var i = 0; i < 5; i++) out += '<svg viewBox="0 0 100 100" style="opacity:' + (i < Math.round(r) ? 1 : .26) + '"><use href="#spark"/></svg>';
    return out;
  }

  function stockLine() {
    if (!p.inStock) return '<div class="stockline is-out"><i></i> Немає в наявності — напишіть нам, скажемо, коли буде</div>';
    if (p.stock <= 4) return '<div class="stockline is-low"><i></i> Лишилось ' + p.stock + ' шт.</div>';
    return '<div class="stockline"><i></i> В наявності, відправимо сьогодні</div>';
  }

  function sizeTable() {
    var rows = p.sizes.filter(function (s) { return MEAS[s]; });
    if (!rows.length) return '';
    return '<div class="sizetable__wrap"><table class="sizetable">' +
      '<thead><tr><th>Розмір</th><th>' + MEAS_H[0] + '</th><th>' + MEAS_H[1] + '</th><th>' + MEAS_H[2] + '</th></tr></thead><tbody>' +
      rows.map(function (s) {
        var m = MEAS[s];
        return '<tr><td><b>' + esc(s) + '</b></td><td>' + m[0] + '</td><td>' + m[1] + '</td><td>' + m[2] + '</td></tr>';
      }).join('') +
      '</tbody></table></div>' +
      '<p style="font-size:.8rem;color:var(--text-3);margin-top:10px">Мірки тіла, не виробу. Між розмірами — беріть більший або напишіть нам.</p>';
  }

  box.innerHTML =
    '<div class="pdp__media">' +
      '<div class="pdp__stage" data-stage>' +
        '<div data-art></div>' +
        '<span class="pdp__hint">Потягніть, щоб роздивитись</span>' +
      '</div>' +
      '<div class="pdp__thumbs" data-thumbs></div>' +
    '</div>' +

    '<div class="pdp__info">' +
      '<div>' +
        '<span class="eyebrow">' + esc(p.line) + ' · ' + esc(p.catName) + '</span>' +
        '<h1>' + esc(p.name) + '</h1>' +
      '</div>' +

      (window.DATA.showRatings
        ? '<div class="pdp__rate">' +
            '<span class="stars">' + stars(p.rating) + '</span>' +
            '<span>' + p.rating.toFixed(1) + ' · ' + p.reviews + ' відгуків</span>' +
          '</div>'
        : '') +

      '<div class="pdp__price">' +
        (p.old ? '<span class="price__old">' + money(p.old) + '</span>' : '') +
        '<span class="price__now' + (p.old ? ' is-sale' : '') + '">' + money(p.price) + '</span>' +
        (p.old ? '<span class="badge badge--sale">−' + Math.round((1 - p.price / p.old) * 100) + '%</span>' : '') +
      '</div>' +

      '<p class="pdp__desc">' + esc(p.desc) + '</p>' +

      stockLine() +

      '<div>' +
        '<div class="opt__h"><b>Колір</b><span class="opt__v" data-color-name></span></div>' +
        '<div class="fcol" data-colors></div>' +
      '</div>' +

      '<div>' +
        '<div class="opt__h"><b>Розмір</b><a href="#sizes">Таблиця розмірів</a></div>' +
        '<div class="fsize" data-sizes></div>' +
      '</div>' +

      '<div>' +
        '<div class="opt__h"><b>Кількість</b></div>' +
        '<div class="qty" data-qty>' +
          '<button type="button" data-qm aria-label="Менше">−</button><span data-qv>1</span>' +
          '<button type="button" data-qp aria-label="Більше">+</button>' +
        '</div>' +
      '</div>' +

      '<div class="pdp__buy">' +
        '<button class="btn btn--lg" type="button" data-buy' + (p.inStock ? '' : ' disabled') + '>' +
          (p.inStock ? 'Додати в кошик' : 'Немає в наявності') + '</button>' +
        '<button class="pdp__fav" type="button" data-fav="' + esc(p.id) + '" aria-label="В обране" aria-pressed="false">' + I.heart + '</button>' +
      '</div>' +

      '<a class="btn btn--ghost btn--block" href="' + esc(window.DATA.shop.telegram) + '" target="_blank" rel="noopener">Запитати про розмір у Telegram</a>' +

      (p.made ? '<div class="made"><span class="made__ic"><svg viewBox="0 0 100 100"><use href="#spark"/></svg></span>' +
                '<span>' + esc(p.made) + '</span></div>' : '') +

      '<div class="trust">' +
        '<div class="trust__i"><svg><use href="#i-truck"/></svg><span>Безкоштовна доставка від ' + money(window.DATA.shop.freeShipFrom) + '</span></div>' +
        '<div class="trust__i"><svg><use href="#i-back"/></svg><span>Обмін і повернення ' + window.DATA.shop.returnDays + ' днів</span></div>' +
        '<div class="trust__i"><svg><use href="#i-shield"/></svg><span>Примірка на відділенні НП</span></div>' +
      '</div>' +

      '<div>' +
        '<h3 style="font-size:1.3rem;margin-bottom:6px">Характеристики</h3>' +
        '<dl class="specs">' +
          Object.keys(p.specs).map(function (k) {
            return '<div class="specs__r"><dt>' + esc(k) + '</dt><dd>' + esc(p.specs[k]) + '</dd></div>';
          }).join('') +
        '</dl>' +
      '</div>' +

      (sizeTable()
        ? '<div id="sizes"><h3 style="font-size:1.3rem;margin-bottom:12px">Таблиця розмірів</h3>' + sizeTable() + '</div>'
        : '') +
    '</div>';

  /* ============================================================
     ІНТЕРАКТИВ
     ============================================================ */
  var artBox = $('[data-art]', box);
  var stage  = $('[data-stage]', box);

  function curColor() { return p.colors[sel.color] || p.colors[0]; }

  function drawArt() {
    artBox.innerHTML = window.Art.render(p, { dark: M.isDark(), color: curColor().hex });
  }
  window.__pdpRepaint = function () { drawArt(); drawThumbs(); };

  function drawThumbs() {
    $('[data-thumbs]', box).innerHTML = p.colors.map(function (c, i) {
      return '<button type="button" class="pdp__th' + (i === sel.color ? ' is-on' : '') + '" data-th="' + i + '" aria-label="Колір: ' + esc(c.name) + '">' +
        window.Art.render(p, { dark: M.isDark(), color: c.hex }) + '</button>';
    }).join('');
  }

  function drawColors() {
    $('[data-colors]', box).innerHTML = p.colors.map(function (c, i) {
      return '<label title="' + esc(c.name) + '">' +
        '<input type="radio" name="pdp-color" value="' + i + '"' + (i === sel.color ? ' checked' : '') + '>' +
        '<span style="background:' + esc(c.hex) + '"></span></label>';
    }).join('');
    $('[data-color-name]', box).textContent = curColor().name;
  }

  function drawSizes() {
    $('[data-sizes]', box).innerHTML = p.sizes.map(function (s, i) {
      return '<label><input type="radio" name="pdp-size" value="' + i + '"' + (i === sel.size ? ' checked' : '') + '>' +
        '<span>' + esc(s) + '</span></label>';
    }).join('');
  }

  drawArt();
  drawThumbs();
  drawColors();
  drawSizes();
  M.Fav.paint();

  /* вибір кольору */
  on($('[data-colors]', box), 'change', function (e) {
    var i = e.target.closest('input');
    if (!i) return;
    sel.color = parseInt(i.value, 10);
    drawArt(); drawThumbs();
    $('[data-color-name]', box).textContent = curColor().name;
  });
  on($('[data-thumbs]', box), 'click', function (e) {
    var b = e.target.closest('[data-th]');
    if (!b) return;
    sel.color = parseInt(b.getAttribute('data-th'), 10);
    drawArt(); drawThumbs(); drawColors();
  });

  /* вибір розміру */
  on($('[data-sizes]', box), 'change', function (e) {
    var i = e.target.closest('input');
    if (i) sel.size = parseInt(i.value, 10);
  });

  /* кількість */
  on($('[data-qm]', box), 'click', function () { sel.q = Math.max(1, sel.q - 1); $('[data-qv]', box).textContent = sel.q; });
  on($('[data-qp]', box), 'click', function () { sel.q = Math.min(20, sel.q + 1); $('[data-qv]', box).textContent = sel.q; });

  /* у кошик */
  on($('[data-buy]', box), 'click', function () {
    M.Cart.add(p.id, { size: p.sizes[sel.size], color: curColor().name, q: sel.q });
    if (window.__openCart) window.__openCart();
  });

  /* 3D-обертання перетягуванням */
  (function () {
    if (M.reduced()) return;
    var svg = null, rx = 0, ry = 0, down = false, sx = 0, sy = 0, brx = 0, bry = 0, raf = null;

    function el() { return $('.art', artBox); }
    function apply() {
      raf = null;
      svg = el();
      if (svg) svg.style.transform = 'rotateY(' + ry.toFixed(2) + 'deg) rotateX(' + rx.toFixed(2) + 'deg)';
    }
    function req() { if (!raf) raf = requestAnimationFrame(apply); }

    on(stage, 'pointerdown', function (e) {
      down = true; sx = e.clientX; sy = e.clientY; bry = ry; brx = rx;
      stage.setPointerCapture && stage.setPointerCapture(e.pointerId);
    });
    on(stage, 'pointermove', function (e) {
      if (!down) {
        if (e.pointerType !== 'mouse') return;
        var r = stage.getBoundingClientRect();
        ry = ((e.clientX - r.left) / r.width - .5) * 22;
        rx = (.5 - (e.clientY - r.top) / r.height) * 12;
        req();
        return;
      }
      ry = bry + (e.clientX - sx) * 0.42;
      rx = Math.max(-34, Math.min(34, brx - (e.clientY - sy) * 0.3));
      req();
    });
    function up() { down = false; }
    on(stage, 'pointerup', up);
    on(stage, 'pointercancel', up);
    on(stage, 'pointerleave', function () {
      if (down) { down = false; return; }
      ry = 0; rx = 0; req();
    });
  })();

  /* ============================================================
     СХОЖІ ТОВАРИ
     ============================================================ */
  (function () {
    var wrap = $('[data-related]');
    if (!wrap) return;
    var same = window.DATA.byCat(p.cat).filter(function (x) { return x.id !== p.id; });
    /* решту добираємо з того самого розділу — чоловіче не мішаємо з жіночим */
    var pool = window.DATA.byGender(p.g === 'u' ? '' : p.g);
    var more = pool.filter(function (x) {
      return x.id !== p.id && x.cat !== p.cat &&
             (x.line === p.line || Math.abs(x.price - p.price) < 4500);
    });
    var list = same.concat(more).slice(0, 4);
    if (!list.length) return;
    $('[data-related-sec]').hidden = false;
    wrap.innerHTML = list.map(function (x, i) { return M.cardHTML(x, i % 4); }).join('');
    M.Fav.paint();
    M.initTilt(wrap);
    M.initReveal(wrap);
  })();

  /* ============================================================
     СТРУКТУРОВАНІ ДАНІ ДЛЯ ПОШУКОВИКІВ
     ============================================================ */
  (function () {
    var s = document.createElement('script');
    s.type = 'application/ld+json';
    var ld = {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: p.name,
      description: p.desc,
      brand: { '@type': 'Brand', name: 'Marielle' },
      category: p.catName,
      color: p.colors.map(function (c) { return c.name; }).join(', '),
      size: p.sizes.join(', '),
      offers: {
        '@type': 'Offer',
        price: p.price,
        priceCurrency: 'UAH',
        availability: p.inStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock'
      }
    };
    /* рейтинг у розмітці для пошуковиків — лише коли він справжній */
    if (window.DATA.showRatings) {
      ld.aggregateRating = { '@type': 'AggregateRating', ratingValue: p.rating, reviewCount: p.reviews };
    }
    s.textContent = JSON.stringify(ld);
    document.head.appendChild(s);
  })();
})();
