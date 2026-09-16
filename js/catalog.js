/* ============================================================
   MARIELLE — каталог: фільтри, пошук, сортування
   Стан фільтрів зберігається в адресному рядку, тому
   посилання на відфільтровану добірку можна надіслати.
   ============================================================ */
(function () {
  'use strict';

  var M = window.MR;
  if (!M) return;
  var $ = M.$, $$ = M.$$, on = M.on, esc = M.esc, money = M.money;

  var results = $('[data-results]');
  if (!results) return;

  var RANGE = window.DATA.priceRange();

  /* ---------- стан ---------- */
  var st = {
    g:     '',
    cats:  [],
    sizes: [],
    colors: [],
    price: RANGE[1],
    inStock: false,
    sale: false,
    fav: false,
    q: '',
    sort: 'pop'
  };

  /* ---------- читання адреси ---------- */
  function fromURL() {
    var p = new URLSearchParams(location.search);
    if (p.get('g') === 'w' || p.get('g') === 'm') st.g = p.get('g');
    if (p.get('cat'))   st.cats   = p.get('cat').split(',').filter(Boolean);
    if (p.get('size'))  st.sizes  = p.get('size').split(',').filter(Boolean);
    if (p.get('color')) st.colors = p.get('color').split(',').filter(Boolean);
    if (p.get('price')) st.price  = parseInt(p.get('price'), 10) || RANGE[1];
    if (p.get('stock') === '1') st.inStock = true;
    if (p.get('sale')  === '1') st.sale = true;
    if (p.get('fav')   === '1') st.fav = true;
    if (p.get('q'))    st.q = p.get('q');
    if (p.get('sort')) st.sort = p.get('sort');
  }

  function toURL(replace) {
    var p = new URLSearchParams();
    if (st.g) p.set('g', st.g);
    if (st.cats.length)   p.set('cat', st.cats.join(','));
    if (st.sizes.length)  p.set('size', st.sizes.join(','));
    if (st.colors.length) p.set('color', st.colors.join(','));
    if (st.price < RANGE[1]) p.set('price', st.price);
    if (st.inStock) p.set('stock', '1');
    if (st.sale)    p.set('sale', '1');
    if (st.fav)     p.set('fav', '1');
    if (st.q)       p.set('q', st.q);
    if (st.sort !== 'pop') p.set('sort', st.sort);
    var url = location.pathname + (p.toString() ? '?' + p.toString() : '');
    history[replace ? 'replaceState' : 'pushState']({}, '', url);
  }

  /* ---------- побудова фільтрів ---------- */
  /* список категорій залежить від обраного розділу «Жінкам / Чоловікам» */
  function buildCats() {
    $('[data-f-cats]').innerHTML = window.DATA.catsFor(st.g).map(function (c) {
      return '<label class="fopt"><input type="checkbox" data-cat="' + c.id + '"' +
             (st.cats.indexOf(c.id) > -1 ? ' checked' : '') + '> ' +
             esc(c.name) + '<small>' + c.count + '</small></label>';
    }).join('');
  }

  function buildFilters() {
    $('[data-f-genders]').innerHTML =
      '<div class="seg" role="group" aria-label="Розділ">' +
      [{ id: '', name: 'Усі' }].concat(window.DATA.genders).map(function (x) {
        return '<button type="button" class="seg__b" data-gender="' + x.id + '">' + esc(x.name) + '</button>';
      }).join('') + '</div>';

    buildCats();

    var sizes = window.DATA.allSizes().filter(function (s) { return s.length <= 4; });
    $('[data-f-sizes]').innerHTML = sizes.map(function (s) {
      return '<label><input type="checkbox" data-size="' + esc(s) + '"><span>' + esc(s) + '</span></label>';
    }).join('');

    $('[data-f-colors]').innerHTML = window.DATA.allColors().map(function (c) {
      return '<label title="' + esc(c.name) + '"><input type="checkbox" data-color="' + esc(c.name) + '">' +
             '<span style="background:' + esc(c.hex) + '"></span>' +
             '<span class="hidden">' + esc(c.name) + '</span></label>';
    }).join('');

    var range = $('[data-f-price]');
    range.min = RANGE[0]; range.max = RANGE[1]; range.step = 100;

    /* сортування за оцінкою ховаємо, поки оцінки не справжні */
    if (!window.DATA.showRatings) {
      var opt = $('[data-sort] option[value="rate"]');
      if (opt) opt.remove();
      if (st.sort === 'rate') st.sort = 'pop';
    }
  }

  /* ---------- синхронізація вигляду з станом ---------- */
  function syncControls() {
    $$('[data-gender]').forEach(function (b) {
      var on2 = b.getAttribute('data-gender') === st.g;
      b.classList.toggle('is-on', on2);
      b.setAttribute('aria-pressed', on2 ? 'true' : 'false');
    });
    $$('[data-cat]').forEach(function (i) { i.checked = st.cats.indexOf(i.getAttribute('data-cat')) > -1; });
    $$('[data-size]').forEach(function (i) { i.checked = st.sizes.indexOf(i.getAttribute('data-size')) > -1; });
    $$('[data-color]').forEach(function (i) { i.checked = st.colors.indexOf(i.getAttribute('data-color')) > -1; });
    $('[data-f-price]').value = st.price;
    $('[data-f-price-v]').textContent = money(st.price);
    $('[data-f-instock]').checked = st.inStock;
    $('[data-f-sale]').checked = st.sale;
    $('[data-f-fav]').checked = st.fav;
    $('[data-q]').value = st.q;
    $('[data-sort]').value = st.sort;
  }

  /* ---------- відбір ---------- */
  function filtered() {
    var q = st.q.trim().toLowerCase();
    var list = window.DATA.products.filter(function (p) {
      /* аксесуари (g === 'u') показуються в обох розділах */
      if (st.g && p.g !== st.g && p.g !== 'u') return false;
      if (st.cats.length && st.cats.indexOf(p.cat) < 0) return false;
      if (st.sizes.length && !p.sizes.some(function (s) { return st.sizes.indexOf(s) > -1; })) return false;
      if (st.colors.length && !p.colors.some(function (c) { return st.colors.indexOf(c.name) > -1; })) return false;
      if (p.price > st.price) return false;
      if (st.inStock && !p.inStock) return false;
      if (st.sale && !p.old) return false;
      if (st.fav && !M.Fav.has(p.id)) return false;
      if (q) {
        var hay = [p.name, p.catName, p.line, p.desc,
                   Object.keys(p.specs).map(function (k) { return p.specs[k]; }).join(' '),
                   p.colors.map(function (c) { return c.name; }).join(' ')].join(' ').toLowerCase();
        if (hay.indexOf(q) < 0) return false;
      }
      return true;
    });

    var rank = { hit: 0, new: 1, sale: 2 };
    list.sort(function (a, b) {
      switch (st.sort) {
        case 'cheap': return a.price - b.price;
        case 'rich':  return b.price - a.price;
        case 'rate':  return b.rating - a.rating || b.reviews - a.reviews;
        case 'new':   return (a.badge === 'new' ? 0 : 1) - (b.badge === 'new' ? 0 : 1) || b.rating - a.rating;
        default:
          return (rank[a.badge] == null ? 3 : rank[a.badge]) - (rank[b.badge] == null ? 3 : rank[b.badge])
                 || b.rating - a.rating;
      }
    });
    return list;
  }

  /* ---------- активні мітки ---------- */
  function chips() {
    var box = $('[data-chips]');
    var out = [];
    if (st.g) out.push(chip(window.DATA.genderName(st.g), 'g', ''));
    st.cats.forEach(function (c) {
      var cat = window.DATA.cat(c);
      if (cat) out.push(chip('Категорія: ' + cat.name, 'cat', c));
    });
    st.sizes.forEach(function (s) { out.push(chip('Розмір ' + s, 'size', s)); });
    st.colors.forEach(function (c) { out.push(chip(c, 'color', c)); });
    if (st.price < RANGE[1]) out.push(chip('До ' + money(st.price), 'price', ''));
    if (st.inStock) out.push(chip('В наявності', 'stock', ''));
    if (st.sale)    out.push(chip('Зі знижкою', 'sale', ''));
    if (st.fav)     out.push(chip('Обране', 'fav', ''));
    if (st.q)       out.push(chip('«' + st.q + '»', 'q', ''));
    box.innerHTML = out.join('');
  }
  function chip(label, kind, val) {
    return '<span class="chip">' + esc(label) +
      '<button type="button" data-chip="' + kind + '" data-val="' + esc(val) + '" aria-label="Прибрати фільтр">' +
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg>' +
      '</button></span>';
  }

  /* ---------- заголовок сторінки ---------- */
  function heading() {
    var t = 'Каталог', sub = 'Усі позиції в наявності та під замовлення. Не впевнені в розмірі — напишіть нам, підкажемо.';
    if (st.fav) { t = 'Обране'; sub = 'Речі, які ви позначили серцем. Список зберігається у вашому браузері.'; }
    else if (st.sale) { t = 'Sale'; sub = 'Позиції зі знижкою. Кількість обмежена залишками на складі.'; }
    else if (st.cats.length === 1) {
      var c = window.DATA.cat(st.cats[0]);
      if (c) {
        t = c.name + (st.g && c.g === 'u' ? '' : '');
        sub = c.desc + '. ' + c.count + ' ' + plural(c.count, 'позиція', 'позиції', 'позицій') + ' у розділі.';
      }
    }
    else if (st.g) {
      t = window.DATA.genderName(st.g);
      sub = st.g === 'w'
        ? 'Сукні, блузи, верхній одяг, костюми та трикотаж. Кожна модель шиється партією до 40 одиниць.'
        : 'Сорочки, верхній одяг, костюми, штани та трикотаж. Крій із плаваючим бортом і ручною обробкою.';
    }
    $('[data-title]').textContent = t;
    $('[data-subtitle]').textContent = sub;
    $('[data-crumb]').textContent = t;
    document.title = t + ' — Marielle';
  }
  function plural(n, a, b, c) {
    n = Math.abs(n) % 100;
    var n1 = n % 10;
    if (n > 10 && n < 20) return c;
    if (n1 > 1 && n1 < 5) return b;
    if (n1 === 1) return a;
    return c;
  }

  /* ---------- рендер ---------- */
  function render(push) {
    var list = filtered();
    var found = list.length + ' ' + plural(list.length, 'товар', 'товари', 'товарів');
    $('[data-count]').textContent = found;
    var apply = $('[data-filters-apply]');
    if (apply) apply.textContent = list.length ? 'Показати ' + found : 'Нічого не знайдено';
    chips();
    heading();

    if (!list.length) {
      results.innerHTML = '<div class="empty" style="grid-column:1/-1">' +
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"><circle cx="11" cy="11" r="6.4"/><path d="m16 16 4.4 4.4"/></svg>' +
        '<p>За такими фільтрами нічого не знайшлось.<br>Спробуйте прибрати частину умов.</p>' +
        '<button class="btn btn--ghost btn--sm" type="button" data-f-reset>Скинути фільтри</button></div>';
    } else {
      results.innerHTML = list.map(function (p, i) { return M.cardHTML(p, i % 4); }).join('');
    }

    M.Fav.paint();
    M.initTilt(results);
    M.initReveal(results);
    toURL(!push);
  }

  /* ---------- події ---------- */
  function bind() {
    on($('[data-f-genders]'), 'click', function (e) {
      var b = e.target.closest('[data-gender]');
      if (!b) return;
      st.g = b.getAttribute('data-gender');
      /* категорії іншої статі більше не діють — прибираємо їх */
      var allowed = window.DATA.catsFor(st.g).map(function (c) { return c.id; });
      st.cats = st.cats.filter(function (c) { return allowed.indexOf(c) > -1; });
      buildCats();
      syncControls();
      render(true);
    });

    on($('[data-f-cats]'), 'change', function (e) {
      var i = e.target.closest('[data-cat]');
      if (!i) return;
      toggle(st.cats, i.getAttribute('data-cat'), i.checked);
      render(true);
    });
    on($('[data-f-sizes]'), 'change', function (e) {
      var i = e.target.closest('[data-size]');
      if (!i) return;
      toggle(st.sizes, i.getAttribute('data-size'), i.checked);
      render(true);
    });
    on($('[data-f-colors]'), 'change', function (e) {
      var i = e.target.closest('[data-color]');
      if (!i) return;
      toggle(st.colors, i.getAttribute('data-color'), i.checked);
      render(true);
    });

    var range = $('[data-f-price]');
    on(range, 'input', function () {
      st.price = parseInt(range.value, 10);
      $('[data-f-price-v]').textContent = money(st.price);
    });
    on(range, 'change', function () { render(true); });

    on($('[data-f-instock]'), 'change', function () { st.inStock = this.checked; render(true); });
    on($('[data-f-sale]'),    'change', function () { st.sale    = this.checked; render(true); });
    on($('[data-f-fav]'),     'change', function () { st.fav     = this.checked; render(true); });
    on($('[data-sort]'),      'change', function () { st.sort    = this.value;   render(true); });

    var t = null;
    on($('[data-q]'), 'input', function () {
      var v = this.value;
      clearTimeout(t);
      t = setTimeout(function () { st.q = v; render(false); }, 220);
    });

    on($('[data-chips]'), 'click', function (e) {
      var b = e.target.closest('[data-chip]');
      if (!b) return;
      var kind = b.getAttribute('data-chip'), val = b.getAttribute('data-val');
      if (kind === 'g')     { st.g = ''; buildCats(); }
      if (kind === 'cat')   toggle(st.cats, val, false);
      if (kind === 'size')  toggle(st.sizes, val, false);
      if (kind === 'color') toggle(st.colors, val, false);
      if (kind === 'price') st.price = RANGE[1];
      if (kind === 'stock') st.inStock = false;
      if (kind === 'sale')  st.sale = false;
      if (kind === 'fav')   st.fav = false;
      if (kind === 'q')     st.q = '';
      syncControls();
      render(true);
    });

    on(document, 'click', function (e) {
      if (!e.target.closest('[data-f-reset]')) return;
      st.g = ''; st.cats = []; st.sizes = []; st.colors = [];
      st.price = RANGE[1]; st.inStock = false; st.sale = false; st.fav = false; st.q = ''; st.sort = 'pop';
      buildCats();
      syncControls();
      render(true);
    });

    /* фільтри як панель на планшеті й телефоні */
    var panel = $('.filters'), overlay = $('.overlay');
    function openFilters() {
      M.modalOpened(panel);
      panel.classList.add('is-open');
      if (overlay) overlay.classList.add('is-on');
      document.body.classList.add('is-locked');
      var f = $('[data-filters-close]', panel);
      if (f) setTimeout(function () { f.focus(); }, 60);
    }
    function closeFilters() {
      panel.classList.remove('is-open');
      if (overlay) overlay.classList.remove('is-on');
      document.body.classList.remove('is-locked');
      M.modalClosed(panel);
    }
    on($('[data-filters-open]'), 'click', openFilters);
    on($('[data-filters-close]'), 'click', closeFilters);
    on($('[data-filters-apply]'), 'click', closeFilters);
    on(overlay, 'click', closeFilters);
    on(document, 'keydown', function (e) { if (e.key === 'Escape') closeFilters(); });
    /* після вибору на телефоні панель має закритись сама */
    on(panel, 'click', function (e) {
      if (!panel.classList.contains('is-open')) return;
      if (e.target.closest('[data-f-reset]')) setTimeout(closeFilters, 120);
    });

    /* назад/вперед у браузері */
    on(window, 'popstate', function () {
      st.g = ''; st.cats = []; st.sizes = []; st.colors = [];
      st.price = RANGE[1]; st.inStock = false; st.sale = false; st.fav = false; st.q = ''; st.sort = 'pop';
      fromURL();
      buildCats();
      syncControls();
      render(false);
    });

    /* зміна обраного має оновлювати список, коли ввімкнено фільтр «обране» */
    on(document, 'click', function (e) {
      if (st.fav && e.target.closest('[data-fav]')) setTimeout(function () { render(false); }, 10);
    });
  }

  function toggle(arr, v, add) {
    var i = arr.indexOf(v);
    if (add && i < 0) arr.push(v);
    if (!add && i > -1) arr.splice(i, 1);
  }

  /* ---------- старт ---------- */
  fromURL();       /* спершу читаємо адресу — від неї залежить список категорій */
  buildFilters();
  syncControls();
  bind();
  render(false);

  if (location.hash === '#search') {
    var q = $('[data-q]');
    if (q) setTimeout(function () { q.focus(); }, 120);
  }
})();
