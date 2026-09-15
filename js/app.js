/* ============================================================
   MARIELLE — загальна логіка сайту
   Без бібліотек і без збірки. Порядок підключення:
   data.js → art.js → app.js → (catalog.js | product.js)
   ============================================================ */
(function () {
  'use strict';

  var LS_CART = 'mrl.cart', LS_FAV = 'mrl.fav', LS_THEME = 'mrl.theme';
  var SHOP = (window.DATA && window.DATA.shop) || {};

  /* ---------- дрібні помічники ---------- */
  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function on(el, ev, fn, o) { if (el) el.addEventListener(ev, fn, o); }
  function money(n) { return new Intl.NumberFormat('uk-UA').format(Math.round(n)) + ' ₴'; }
  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }
  function read(k, d) { try { return JSON.parse(localStorage.getItem(k)) || d; } catch (e) { return d; } }
  function write(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  function qs(name) {
    var m = new RegExp('[?&]' + name + '=([^&]*)').exec(window.location.search);
    return m ? decodeURIComponent(m[1].replace(/\+/g, ' ')) : '';
  }
  function isDark() { return document.documentElement.getAttribute('data-theme') === 'dark'; }
  function reduced() {
    return !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }

  /* ---------- іконки ---------- */
  var I = {
    heart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20.4 4.6 13a4.6 4.6 0 0 1 6.5-6.5l.9.9.9-.9A4.6 4.6 0 0 1 19.4 13Z"/></svg>',
    plus:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>',
    check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m4 12.5 5.2 5.2L20 7"/></svg>',
    star:  '<svg viewBox="0 0 24 24" fill="currentColor"><path d="m12 3.2 2.6 5.6 6.1.8-4.5 4.2 1.2 6-5.4-3-5.4 3 1.2-6L3.3 9.6l6.1-.8Z"/></svg>',
    arr:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14m-6-6 6 6-6 6"/></svg>',
    x:     '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg>',
    sun:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><circle cx="12" cy="12" r="4.2"/><path d="M12 2.6v2.2M12 19.2v2.2M4.2 4.2l1.6 1.6M18.2 18.2l1.6 1.6M2.6 12h2.2M19.2 12h2.2M4.2 19.8l1.6-1.6M18.2 5.8l1.6-1.6"/></svg>',
    moon:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M20 14.2A8.2 8.2 0 0 1 9.8 4 8.4 8.4 0 1 0 20 14.2Z"/></svg>',
    bag:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M5.5 7.5h13l1 13h-15Z"/><path d="M9 10V6.8a3 3 0 0 1 6 0V10"/></svg>'
  };

  /* ---------- сповіщення ---------- */
  var toastEl = null, toastT = null;
  function toast(msg) {
    if (!toastEl) {
      toastEl = document.createElement('div');
      toastEl.className = 'toast';
      toastEl.setAttribute('role', 'status');
      toastEl.setAttribute('aria-live', 'polite');
      document.body.appendChild(toastEl);
    }
    toastEl.innerHTML = I.check + '<span>' + esc(msg) + '</span>';
    toastEl.classList.add('is-on');
    clearTimeout(toastT);
    toastT = setTimeout(function () { toastEl.classList.remove('is-on'); }, 2600);
  }

  /* ============================================================
     ТЕМА
     ============================================================ */
  var Theme = {
    cur: 'light',
    init: function () {
      var saved = null;
      try { saved = localStorage.getItem(LS_THEME); } catch (e) {}
      var sysDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      this.set(saved ? saved.replace(/"/g, '') : (sysDark ? 'dark' : 'light'), true);
      var self = this;
      $$('[data-theme-toggle]').forEach(function (b) {
        on(b, 'click', function () { self.set(self.cur === 'dark' ? 'light' : 'dark'); });
      });
    },
    set: function (v, silent) {
      this.cur = v;
      document.documentElement.setAttribute('data-theme', v);
      var meta = $('meta[name="theme-color"]');
      if (meta) meta.setAttribute('content', v === 'dark' ? '#0F0E12' : '#FAF8F5');
      if (!silent) { try { localStorage.setItem(LS_THEME, v); } catch (e) {} }
      $$('[data-theme-toggle]').forEach(function (b) {
        b.innerHTML = v === 'dark' ? I.sun : I.moon;
        b.setAttribute('aria-label', v === 'dark' ? 'Світла тема' : 'Темна тема');
        b.title = b.getAttribute('aria-label');
      });
    }
  };

  /* ============================================================
     ОБРАНЕ
     ============================================================ */
  var Fav = {
    ids: read(LS_FAV, []),
    has: function (id) { return this.ids.indexOf(id) > -1; },
    toggle: function (id) {
      var i = this.ids.indexOf(id);
      if (i > -1) this.ids.splice(i, 1); else this.ids.push(id);
      write(LS_FAV, this.ids);
      this.paint();
      return i < 0;
    },
    paint: function () {
      var self = this;
      $$('[data-fav]').forEach(function (b) {
        var onNow = self.has(b.getAttribute('data-fav'));
        b.classList.toggle('is-on', onNow);
        b.setAttribute('aria-pressed', onNow ? 'true' : 'false');
      });
      $$('[data-fav-count]').forEach(function (c) {
        c.textContent = self.ids.length;
        c.classList.toggle('is-on', self.ids.length > 0);
      });
    }
  };

  /* ============================================================
     КОШИК
     ============================================================ */
  var Cart = {
    items: read(LS_CART, []),

    save: function () { write(LS_CART, this.items); this.paint(); },

    add: function (id, opts) {
      opts = opts || {};
      var p = window.DATA.byId(id);
      if (!p) return;
      if (!p.inStock) { toast('Цієї позиції зараз немає'); return; }
      var size = opts.size || p.sizes[0] || '';
      var color = opts.color || (p.colors[0] && p.colors[0].name) || '';
      var key = id + '|' + size + '|' + color;
      var ex = this.items.filter(function (i) { return i.key === key; })[0];
      if (ex) ex.q = Math.min(ex.q + (opts.q || 1), 20);
      else this.items.push({ key: key, id: id, size: size, color: color, q: opts.q || 1 });
      this.save();
      toast(p.name + ' — у кошику');
    },

    setQ: function (key, q) {
      var it = this.items.filter(function (i) { return i.key === key; })[0];
      if (!it) return;
      it.q = Math.min(q, 20);
      if (it.q < 1) this.items = this.items.filter(function (i) { return i.key !== key; });
      this.save();
    },

    remove: function (key) {
      this.items = this.items.filter(function (i) { return i.key !== key; });
      this.save();
    },

    count: function () { return this.items.reduce(function (s, i) { return s + i.q; }, 0); },

    total: function () {
      return this.items.reduce(function (s, i) {
        var p = window.DATA.byId(i.id);
        return s + (p ? p.price * i.q : 0);
      }, 0);
    },

    /* текст замовлення, який покупець надсилає продавцю */
    orderText: function () {
      var lines = ['Замовлення з сайту Marielle', ''];
      this.items.forEach(function (i, n) {
        var p = window.DATA.byId(i.id);
        if (!p) return;
        var ex = [];
        if (i.size) ex.push('розмір ' + i.size);
        if (i.color) ex.push(i.color);
        lines.push((n + 1) + '. ' + p.name + (ex.length ? ' (' + ex.join(', ') + ')' : '') +
                   ' — ' + i.q + ' шт. × ' + money(p.price));
      });
      lines.push('', 'Разом: ' + money(this.total()));
      if (SHOP.freeShipFrom && this.total() >= SHOP.freeShipFrom) lines.push('Доставка: безкоштовна');
      return lines.join('\n');
    },

    paint: function () {
      var self = this;
      $$('[data-cart-count]').forEach(function (c) {
        c.textContent = self.count();
        c.classList.toggle('is-on', self.count() > 0);
      });
      var sum = $('[data-cart-total]');
      if (sum) sum.textContent = money(this.total());

      var ship = $('[data-cart-ship]');
      if (ship) {
        var left = (SHOP.freeShipFrom || 0) - this.total();
        ship.textContent = this.total() === 0 ? ''
          : left > 0 ? 'До безкоштовної доставки: ' + money(left)
                     : 'Доставка — безкоштовно';
      }
      var btn = $('[data-cart-order]');
      if (btn) btn.disabled = this.items.length === 0;

      var box = $('[data-cart-body]');
      if (!box) return;

      if (!this.items.length) {
        box.innerHTML = '<div class="drawer__empty">' + I.bag +
          '<p>У кошику поки порожньо</p>' +
          '<a class="btn btn--ghost btn--sm" href="catalog.html">Перейти до каталогу</a></div>';
        return;
      }
      var dark = isDark(), html = '';
      this.items.forEach(function (i) {
        var p = window.DATA.byId(i.id);
        if (!p) return;
        var col = p.colors.filter(function (c) { return c.name === i.color; })[0] || p.colors[0];
        var meta = [];
        if (i.size) meta.push(i.size);
        if (i.color) meta.push(i.color);
        html += '<div class="citem">' +
          '<div class="citem__art">' + window.Art.render(p, { dark: dark, color: col && col.hex }) + '</div>' +
          '<div><div class="citem__t">' + esc(p.name) + '</div>' +
          '<div class="citem__p">' + (meta.length ? esc(meta.join(' · ')) + ' · ' : '') + money(p.price) + '</div>' +
          '<div class="qty">' +
            '<button type="button" data-q="-1" data-key="' + esc(i.key) + '" aria-label="Зменшити кількість">−</button>' +
            '<span>' + i.q + '</span>' +
            '<button type="button" data-q="1" data-key="' + esc(i.key) + '" aria-label="Збільшити кількість">+</button>' +
          '</div></div>' +
          '<div class="citem__right"><div class="citem__sum">' + money(p.price * i.q) + '</div>' +
          '<button type="button" class="citem__del" data-del="' + esc(i.key) + '">Прибрати</button></div>' +
          '</div>';
      });
      box.innerHTML = html;
    }
  };

  /* ============================================================
     КАРТКА ТОВАРУ
     ============================================================ */
  function cardHTML(p, delay) {
    var dark = isDark();
    var badges = '';
    if (!p.inStock) badges += '<span class="badge badge--out">Немає</span>';
    else if (p.badge === 'sale' && p.old) badges += '<span class="badge badge--sale">−' + Math.round((1 - p.price / p.old) * 100) + '%</span>';
    else if (p.badge === 'new') badges += '<span class="badge badge--new">Новинка</span>';
    else if (p.badge === 'hit') badges += '<span class="badge badge--hit">Хіт</span>';
    if (p.inStock && p.stock <= 4) badges += '<span class="badge">Лишилось ' + p.stock + '</span>';

    var sw = p.colors.slice(0, 4).map(function (c) {
      return '<i class="card__sw" style="background:' + esc(c.hex) + '" title="' + esc(c.name) + '"></i>';
    }).join('');

    var specKeys = Object.keys(p.specs || {});
    var spec = specKeys.length ? esc(p.specs[specKeys[0]]) : '';

    return '<article class="card reveal' + (p.inStock ? '' : ' is-out') + '" data-tilt data-id="' + esc(p.id) + '" style="--d:' + (delay || 0) + '">' +
      '<div class="card__media">' +
        '<div class="card__badges">' + badges + '</div>' +
        '<button type="button" class="card__fav" data-fav="' + esc(p.id) + '" aria-label="Додати «' + esc(p.name) + '» в обране" aria-pressed="false">' + I.heart + '</button>' +
        '<a class="card__art" href="' + p.url + '" aria-label="' + esc(p.name) + '">' + window.Art.render(p, { dark: dark }) + '</a>' +
        '<div class="card__swatches">' + sw + '</div>' +
        '<div class="card__quick">' +
          '<a class="btn btn--ghost btn--sm" href="' + p.url + '">Детальніше</a>' +
          (p.inStock ? '<button type="button" class="btn btn--sm" data-add="' + esc(p.id) + '">У кошик</button>' : '') +
        '</div>' +
      '</div>' +
      '<div class="card__body">' +
        '<div class="card__line">' + esc(p.line) + ' · ' + esc(p.catName) + '</div>' +
        '<h3 class="card__title"><a href="' + p.url + '">' + esc(p.name) + '</a></h3>' +
        '<div class="card__spec">' + spec + '</div>' +
        '<div class="card__rate">' + I.star + '<span>' + p.rating.toFixed(1) + '</span>' +
          '<span style="opacity:.6">(' + p.reviews + ')</span></div>' +
        '<div class="card__foot">' +
          '<div class="price">' + (p.old ? '<span class="price__old">' + money(p.old) + '</span>' : '') +
            '<span class="price__now' + (p.old ? ' is-sale' : '') + '">' + money(p.price) + '</span></div>' +
          (p.inStock
            ? '<button type="button" class="card__add" data-add="' + esc(p.id) + '" aria-label="Додати «' + esc(p.name) + '» у кошик">' + I.plus + '</button>'
            : '') +
        '</div>' +
      '</div>' +
    '</article>';
  }

  /* ============================================================
     3D-НАХИЛ КАРТОК (лише для миші)
     ============================================================ */
  function initTilt(root) {
    if (!window.matchMedia || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    if (reduced()) return;

    $$('[data-tilt]', root || document).forEach(function (el) {
      if (el.__tilt) return;
      el.__tilt = 1;
      var raf = null, tx = 0, ty = 0;

      function apply() {
        raf = null;
        el.style.transform = 'perspective(900px) rotateX(' + ty.toFixed(2) + 'deg) rotateY(' + tx.toFixed(2) + 'deg) translateY(-6px)';
      }
      on(el, 'pointermove', function (e) {
        if (e.pointerType !== 'mouse') return;
        var r = el.getBoundingClientRect();
        tx = ((e.clientX - r.left) / r.width - .5) * 9;
        ty = (.5 - (e.clientY - r.top) / r.height) * 7;
        if (!raf) raf = requestAnimationFrame(apply);
      });
      on(el, 'pointerleave', function () {
        if (raf) { cancelAnimationFrame(raf); raf = null; }
        el.style.transform = '';
      });
    });
  }

  /* ============================================================
     ПОЯВА ПРИ СКРОЛІ
     ============================================================ */
  var io = null;
  function initReveal(root) {
    var els = $$('.reveal', root || document).filter(function (e) { return !e.classList.contains('is-in'); });
    if (!('IntersectionObserver' in window) || reduced()) {
      els.forEach(function (e) { e.classList.add('is-in'); });
      return;
    }
    if (!io) {
      io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); }
        });
      }, { rootMargin: '0px 0px -7% 0px', threshold: .06 });
    }
    els.forEach(function (e) { io.observe(e); });
  }

  /* ============================================================
     ЛУКБУК — 3D-карусель по колу
     ============================================================ */
  function initLook() {
    var stage = $('[data-look]');
    if (!stage) return;
    var ring = $('.look__ring', stage);
    var cells = $$('.look__cell', ring);
    var n = cells.length;
    if (!n) return;

    var step = 360 / n;
    var radius = Math.round((stage.clientWidth * 0.28) / Math.tan(Math.PI / n)) || 420;
    var angle = 0, cur = 0;

    function layout() {
      radius = Math.round((cells[0].offsetWidth * 0.62) / Math.tan(Math.PI / n));
      cells.forEach(function (c, i) {
        c.style.transform = 'rotateY(' + (i * step) + 'deg) translateZ(' + radius + 'px)';
      });
      turn(cur, true);
    }
    function turn(i, silent) {
      cur = ((i % n) + n) % n;
      angle = -cur * step;
      ring.style.transform = 'translateZ(-' + radius + 'px) rotateY(' + angle + 'deg)';
      cells.forEach(function (c, k) { c.classList.toggle('is-front', k === cur); });
      $$('.look__dot', stage.parentNode).forEach(function (d, k) { d.classList.toggle('is-on', k === cur); });
      if (!silent) {
        cells.forEach(function (c, k) { c.setAttribute('aria-hidden', k === cur ? 'false' : 'true'); });
      }
    }

    layout();
    on(window, 'resize', layout);

    var prev = $('[data-look-prev]'), next = $('[data-look-next]');
    on(prev, 'click', function () { turn(cur - 1); });
    on(next, 'click', function () { turn(cur + 1); });
    $$('.look__dot', stage.parentNode).forEach(function (d, k) {
      on(d, 'click', function () { turn(k); });
    });

    /* перетягування мишею та пальцем */
    var down = false, sx = 0, moved = 0;
    on(stage, 'pointerdown', function (e) {
      down = true; sx = e.clientX; moved = 0;
      ring.classList.add('is-drag');
      stage.setPointerCapture && stage.setPointerCapture(e.pointerId);
    });
    on(stage, 'pointermove', function (e) {
      if (!down) return;
      moved = e.clientX - sx;
      ring.style.transform = 'translateZ(-' + radius + 'px) rotateY(' + (angle + moved * 0.22) + 'deg)';
    });
    function up() {
      if (!down) return;
      down = false;
      ring.classList.remove('is-drag');
      if (Math.abs(moved) > 42) turn(cur + (moved < 0 ? 1 : -1));
      else turn(cur, true);
    }
    on(stage, 'pointerup', up);
    on(stage, 'pointercancel', up);
    on(stage, 'pointerleave', up);

    /* клавіатура */
    stage.setAttribute('tabindex', '0');
    on(stage, 'keydown', function (e) {
      if (e.key === 'ArrowLeft') { e.preventDefault(); turn(cur - 1); }
      if (e.key === 'ArrowRight') { e.preventDefault(); turn(cur + 1); }
    });

    /* автообертання, поки видно і поки не чіпають */
    var timer = null;
    function play() { if (!reduced() && !timer) timer = setInterval(function () { turn(cur + 1); }, 4200); }
    function stop() { clearInterval(timer); timer = null; }
    on(stage, 'pointerenter', stop);
    on(stage, 'pointerleave', play);
    on(stage, 'focusin', stop);
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (en) { en[0].isIntersecting ? play() : stop(); }, { threshold: .3 })
        .observe(stage);
    } else play();

    window.__lookRepaint = function () {
      cells.forEach(function (c) {
        var id = c.getAttribute('data-id');
        var p = window.DATA.byId(id);
        var box = $('.look__art', c);
        if (p && box) box.innerHTML = window.Art.render(p, { dark: isDark() });
      });
    };
  }

  /* ============================================================
     ХЕДЕР, МЕНЮ, ШУХЛЯДА
     ============================================================ */
  function initChrome() {
    var header = $('.header');
    if (header) {
      var onScroll = function () { header.classList.toggle('is-stuck', window.scrollY > 8); };
      onScroll();
      on(window, 'scroll', onScroll, { passive: true });
    }

    /* активний пункт меню */
    var page = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
    var here = page + location.search.toLowerCase();
    $$('.nav__link').forEach(function (a) {
      var href = (a.getAttribute('href') || '').split('#')[0].toLowerCase();
      if (!href) return;
      /* точний збіг разом із параметрами, інакше «Каталог» світився б
         одночасно з «Сукні» та «Sale» */
      if (href === here || (href === page && !location.search)) a.classList.add('is-active');
    });

    /* мобільне меню */
    var mnav = $('.mnav');
    function closeMenu() {
      if (!mnav) return;
      mnav.classList.remove('is-open');
      document.body.classList.remove('is-locked');
      var b = $('[data-menu-open]'); if (b) b.setAttribute('aria-expanded', 'false');
    }
    on($('[data-menu-open]'), 'click', function () {
      if (!mnav) return;
      mnav.classList.add('is-open');
      document.body.classList.add('is-locked');
      this.setAttribute('aria-expanded', 'true');
      var f = $('.mnav__link', mnav);
      if (f) setTimeout(function () { f.focus(); }, 60);
    });
    on($('[data-menu-close]'), 'click', closeMenu);
    $$('.mnav__link').forEach(function (a) { on(a, 'click', closeMenu); });

    /* кошик */
    var drawer = $('.drawer'), overlay = $('.overlay');
    function openCart() {
      if (!drawer) return;
      Cart.paint();
      drawer.classList.add('is-open');
      if (overlay) overlay.classList.add('is-on');
      document.body.classList.add('is-locked');
      drawer.setAttribute('aria-hidden', 'false');
      var c = $('[data-cart-close]', drawer);
      if (c) setTimeout(function () { c.focus(); }, 80);
    }
    function closeCart() {
      if (!drawer) return;
      drawer.classList.remove('is-open');
      if (overlay) overlay.classList.remove('is-on');
      document.body.classList.remove('is-locked');
      drawer.setAttribute('aria-hidden', 'true');
    }
    window.__openCart = openCart;
    $$('[data-cart-open]').forEach(function (b) { on(b, 'click', openCart); });
    on($('[data-cart-close]'), 'click', closeCart);
    on(overlay, 'click', function () {
      closeCart();
      var f = $('.filters'); if (f) f.classList.remove('is-open');
    });
    on(document, 'keydown', function (e) {
      if (e.key !== 'Escape') return;
      closeCart(); closeMenu();
      var f = $('.filters'); if (f) f.classList.remove('is-open');
    });

    /* дії всередині кошика */
    on($('[data-cart-body]'), 'click', function (e) {
      var q = e.target.closest('[data-q]');
      if (q) {
        var key = q.getAttribute('data-key');
        var it = Cart.items.filter(function (i) { return i.key === key; })[0];
        if (it) Cart.setQ(key, it.q + parseInt(q.getAttribute('data-q'), 10));
        return;
      }
      var d = e.target.closest('[data-del]');
      if (d) { Cart.remove(d.getAttribute('data-del')); toast('Прибрано з кошика'); }
    });

    /* оформлення: бекенду немає — готуємо текст і віддаємо в месенджер */
    on($('[data-cart-order]'), 'click', function () {
      if (!Cart.items.length) return;
      var txt = Cart.orderText();
      if (navigator.clipboard) navigator.clipboard.writeText(txt).catch(function () {});
      toast('Замовлення скопійовано — надішліть його нам');
      if (SHOP.telegram) window.open(SHOP.telegram, '_blank', 'noopener');
      else if (SHOP.email) {
        window.location.href = 'mailto:' + SHOP.email +
          '?subject=' + encodeURIComponent('Замовлення з сайту Marielle') +
          '&body=' + encodeURIComponent(txt);
      }
    });

    /* глобальні кліки: у кошик / в обране */
    on(document, 'click', function (e) {
      var add = e.target.closest('[data-add]');
      if (add) {
        e.preventDefault();
        Cart.add(add.getAttribute('data-add'), {
          size: add.getAttribute('data-size') || '',
          color: add.getAttribute('data-color') || ''
        });
        if (add.classList.contains('card__add')) {
          add.classList.add('is-done');
          add.innerHTML = I.check;
          setTimeout(function () { add.classList.remove('is-done'); add.innerHTML = I.plus; }, 1400);
        }
        return;
      }
      var fav = e.target.closest('[data-fav]');
      if (fav) {
        e.preventDefault();
        toast(Fav.toggle(fav.getAttribute('data-fav')) ? 'Додано в обране' : 'Прибрано з обраного');
      }
    });

    /* FAQ */
    $$('.faq__q').forEach(function (b) {
      on(b, 'click', function () {
        var item = b.closest('.faq__item');
        var open = item.classList.contains('is-open');
        $$('.faq__item').forEach(function (i) {
          i.classList.remove('is-open');
          var q = $('.faq__q', i); if (q) q.setAttribute('aria-expanded', 'false');
        });
        if (!open) { item.classList.add('is-open'); b.setAttribute('aria-expanded', 'true'); }
      });
    });

    /* розсилка */
    on($('[data-news]'), 'submit', function (e) {
      e.preventDefault();
      var i = this.elements.email;
      if (!/^[^@\s]+@[^@\s]+\.[a-z]{2,}$/i.test(i.value.trim())) { toast('Перевірте e-mail'); i.focus(); return; }
      toast('Дякуємо! Ми напишемо про новинки');
      this.reset();
    });

    /* рік у футері + контакти з data.js */
    $$('[data-year]').forEach(function (e) { e.textContent = new Date().getFullYear(); });
    $$('[data-shop]').forEach(function (e) {
      var k = e.getAttribute('data-shop');
      if (SHOP[k] == null) return;
      if (e.tagName === 'A' && /Href$/.test(k)) return;
      e.textContent = SHOP[k];
    });
  }

  /* ============================================================
     ФОРМА ЗВ'ЯЗКУ
     ============================================================ */
  function initForm() {
    var form = $('[data-contact-form]');
    if (!form) return;

    function fail(field, msg) {
      var f = field.closest('.field') || field.closest('.check');
      if (f) {
        f.classList.add('has-error');
        var e = $('.field__err', f) || $('.field__err', f.parentNode);
        if (e) e.textContent = msg;
      }
      return false;
    }
    function clear(field) {
      var f = field.closest('.field') || field.closest('.check');
      if (!f) return;
      f.classList.remove('has-error');
      var e = $('.field__err', f) || $('.field__err', f.parentNode);
      if (e) e.textContent = '';
    }
    $$('input, textarea, select', form).forEach(function (i) {
      on(i, 'input', function () { clear(i); });
      on(i, 'change', function () { clear(i); });
    });

    on(form, 'submit', function (e) {
      e.preventDefault();
      var ok = true;
      var el = form.elements;
      var name = el.name, phone = el.phone, email = el.email, msg = el.message, agree = el.agree;

      if (!name.value.trim() || name.value.trim().length < 2) ok = fail(name, 'Вкажіть, як до вас звертатись');
      if (phone.value.replace(/\D/g, '').length < 9) ok = fail(phone, 'Телефон має містити щонайменше 9 цифр');
      if (email.value.trim() && !/^[^@\s]+@[^@\s]+\.[a-z]{2,}$/i.test(email.value.trim())) ok = fail(email, 'Перевірте e-mail');
      if (!msg.value.trim() || msg.value.trim().length < 5) ok = fail(msg, 'Опишіть, з чим допомогти');
      if (agree && !agree.checked) ok = fail(agree, 'Потрібна ваша згода');
      if (!ok) {
        var bad = $('.has-error input, .has-error textarea', form);
        if (bad) bad.focus();
        return;
      }

      var topic = el.topic ? el.topic.value : '';
      var text = ['Звернення з сайту Marielle', '',
        'Ім\'я: ' + name.value.trim(),
        'Телефон: ' + phone.value.trim(),
        email.value.trim() ? 'E-mail: ' + email.value.trim() : '',
        topic ? 'Тема: ' + topic : '',
        '', msg.value.trim()].filter(Boolean).join('\n');

      var box = $('[data-form-ok]');
      if (box) {
        box.classList.add('is-on');
        var pre = $('[data-form-text]', box);
        if (pre) pre.value = text;
        var tg = $('[data-send-tg]', box);
        if (tg && SHOP.telegram) tg.href = SHOP.telegram;
        var vb = $('[data-send-viber]', box);
        if (vb && SHOP.viber) vb.href = SHOP.viber;
        var ml = $('[data-send-mail]', box);
        if (ml) ml.href = 'mailto:' + SHOP.email +
          '?subject=' + encodeURIComponent('Звернення з сайту Marielle') +
          '&body=' + encodeURIComponent(text);
        box.scrollIntoView({ block: 'center', behavior: 'smooth' });
      }
      if (navigator.clipboard) navigator.clipboard.writeText(text).catch(function () {});
      toast('Повідомлення готове — надішліть зручним каналом');
      form.reset();
    });
  }

  /* ============================================================
     ТЕЛЕВІЗОР: великий інтерфейс + навігація стрілками
     ============================================================ */
  function initTV() {
    var ua = navigator.userAgent;
    var isTV = /SmartTV|SMART-TV|Tizen|Web0S|WebOS|NetCast|HbbTV|BRAVIA|AFT[A-Z]|GoogleTV|CrKey|VIDAA|PhilipsTV/i.test(ua) ||
               (window.innerWidth >= 1900 && window.matchMedia && !window.matchMedia('(hover: hover)').matches);
    if (!isTV) return;
    document.body.classList.add('tv-mode');

    on(document, 'keydown', function (e) {
      var k = e.key;
      if (k !== 'ArrowUp' && k !== 'ArrowDown' && k !== 'ArrowLeft' && k !== 'ArrowRight') return;
      var tag = (document.activeElement && document.activeElement.tagName) || '';
      if (/INPUT|TEXTAREA|SELECT/.test(tag)) return;

      var items = $$('a[href], button:not([disabled]), input, select, [tabindex]:not([tabindex="-1"])')
        .filter(function (el) {
          var r = el.getBoundingClientRect();
          return r.width > 0 && r.height > 0 && getComputedStyle(el).visibility !== 'hidden';
        });
      if (!items.length) return;

      var cur = document.activeElement && items.indexOf(document.activeElement) > -1 ? document.activeElement : null;
      if (!cur) { items[0].focus(); e.preventDefault(); return; }

      var cr = cur.getBoundingClientRect();
      var cx = cr.left + cr.width / 2, cy = cr.top + cr.height / 2;
      var best = null, bestD = Infinity;
      items.forEach(function (el) {
        if (el === cur) return;
        var r = el.getBoundingClientRect();
        var x = r.left + r.width / 2, y = r.top + r.height / 2;
        var dx = x - cx, dy = y - cy;
        var ok = (k === 'ArrowRight' && dx > 8 && Math.abs(dy) < Math.abs(dx) * 1.4) ||
                 (k === 'ArrowLeft'  && dx < -8 && Math.abs(dy) < Math.abs(dx) * 1.4) ||
                 (k === 'ArrowDown'  && dy > 8 && Math.abs(dx) < Math.abs(dy) * 1.8) ||
                 (k === 'ArrowUp'    && dy < -8 && Math.abs(dx) < Math.abs(dy) * 1.8);
        if (!ok) return;
        var d = Math.hypot(dx, dy);
        if (d < bestD) { bestD = d; best = el; }
      });
      if (best) {
        e.preventDefault();
        best.focus();
        best.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      }
    });
  }

  /* ============================================================
     СТАРТ
     ============================================================ */
  function renderGrids() {
    $$('[data-products]').forEach(function (box) {
      var mode = box.getAttribute('data-products');
      var list = window.DATA.products.slice();

      if (mode.indexOf('cat:') === 0) {
        var c = mode.slice(4);
        list = list.filter(function (p) { return p.cat === c; });
      } else if (mode === 'home') {
        list = list.filter(function (p) { return p.badge === 'hit' || p.badge === 'new' || p.rating >= 4.8; });
      } else if (mode === 'sale') {
        list = list.filter(function (p) { return !!p.old; });
      } else if (mode === 'new') {
        list = list.filter(function (p) { return p.badge === 'new'; });
      }

      var lim = parseInt(box.getAttribute('data-limit') || '0', 10);
      if (lim) list = list.slice(0, lim);

      box.innerHTML = list.map(function (p, i) { return cardHTML(p, i % 4); }).join('');
      Fav.paint();
      initTilt(box);
      initReveal(box);
    });
  }

  function renderCats() {
    var box = $('[data-cats]');
    if (!box) return;
    box.innerHTML = window.DATA.cats.map(function (c, i) {
      var sample = window.DATA.byCat(c.id)[0];
      var art = sample ? window.Art.render(sample, { dark: isDark() }) : '';
      return '<a class="cat reveal" href="catalog.html?cat=' + c.id + '" style="--d:' + (i % 4) + '">' +
        '<div class="cat__n">' + c.n + ' / ' + c.count + '</div>' +
        '<div class="cat__name">' + esc(c.name) + '</div>' +
        '<div class="cat__desc">' + esc(c.desc) + '</div>' +
        '<div class="cat__art">' + art + '</div>' +
        '<span class="cat__go">Дивитись ' + I.arr + '</span>' +
        '</a>';
    }).join('');
    initReveal(box);
  }

  function renderLook() {
    var ring = $('[data-look] .look__ring');
    if (!ring) return;
    var picks = window.DATA.products.filter(function (p) { return p.badge === 'hit' || p.badge === 'new'; }).slice(0, 8);
    if (picks.length < 6) picks = window.DATA.products.slice(0, 8);
    var dark = isDark();
    ring.innerHTML = picks.map(function (p) {
      return '<a class="look__cell" href="' + p.url + '" data-id="' + esc(p.id) + '">' +
        '<span class="look__art">' + window.Art.render(p, { dark: dark }) + '</span>' +
        '<span class="look__cap"><b>' + esc(p.name) + '</b><span>' + esc(p.line) + ' · ' + money(p.price) + '</span></span>' +
        '</a>';
    }).join('');
    var dots = $('[data-look-dots]');
    if (dots) dots.innerHTML = picks.map(function (_, i) {
      return '<button type="button" class="look__dot" aria-label="Образ ' + (i + 1) + '"></button>';
    }).join('');
  }

  function renderHeroFloat() {
    var box = $('[data-hero-float]');
    if (!box) return;
    var picks = ['colette-coat', 'aurore-slip', 'margot-silk', 'céleste-sweater', 'renée-blazer', 'manon-pleated']
      .map(function (id) { return window.DATA.byId(id); })
      .filter(Boolean);
    if (picks.length < 6) picks = window.DATA.products.slice(0, 6);
    var dark = isDark(), n = picks.length, r = 230;
    box.innerHTML = picks.map(function (p, i) {
      var a = i * (360 / n);
      return '<div class="hero__slot" style="--a:' + a + 'deg;--r:' + r + 'px">' +
        '<div class="hero__item">' + window.Art.render(p, { dark: dark }) + '</div></div>';
    }).join('');
  }

  function boot() {
    Theme.init();
    initChrome();
    Cart.paint();
    Fav.paint();
    initForm();
    initTV();

    renderCats();
    renderGrids();
    renderLook();
    renderHeroFloat();
    initLook();

    initTilt();
    initReveal();

    /* при зміні теми перемальовуємо ілюстрації */
    if (window.MutationObserver) {
      new MutationObserver(function () {
        var dark = isDark();
        $$('.card').forEach(function (card) {
          var p = window.DATA.byId(card.getAttribute('data-id'));
          var art = $('.card__art', card);
          if (p && art) art.innerHTML = window.Art.render(p, { dark: dark });
        });
        renderCats();
        renderHeroFloat();
        if (window.__lookRepaint) window.__lookRepaint();
        if (window.__pdpRepaint) window.__pdpRepaint();
        Cart.paint();
      }).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    }
  }

  /* експорт для catalog.js / product.js */
  window.MR = {
    $: $, $$: $$, on: on, money: money, esc: esc, qs: qs, I: I,
    isDark: isDark, reduced: reduced, toast: toast,
    Cart: Cart, Fav: Fav, Theme: Theme,
    cardHTML: cardHTML, initTilt: initTilt, initReveal: initReveal
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
