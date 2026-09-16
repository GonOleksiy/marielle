/* ============================================================
   MARIELLE — перевірка каталогу

   Коли ви редагуєте js/data.js руками, найлегше зробити помилку,
   яку не видно: забути кому, написати неіснуючий тип силуету,
   продублювати id. Каталог від цього мовчки порожніє.

   Цей файл перевіряє дані одразу після завантаження і пояснює
   словами, що саме не так і в якій позиції.

   Повідомлення завжди йдуть у консоль браузера (F12 → Console).
   Помітну плашку на сторінці показуємо лише там, де сайт
   редагують — на localhost, з файлу або за адресою ?check=1,
   щоб покупець ніколи її не побачив.
   ============================================================ */
(function (g) {
  'use strict';

  if (!g.DATA || !g.Art) return;

  var REQUIRED = ['id', 'name', 'cat', 'type', 'price', 'stock', 'sizes', 'colors', 'specs', 'desc'];
  var GENDERS = ['w', 'm', 'u'];
  var BADGES = ['', 'new', 'sale', 'hit'];

  var errors = [];
  var warns = [];

  function err(where, what) { errors.push({ where: where, what: what }); }
  function warn(where, what) { warns.push({ where: where, what: what }); }

  /* ---------- категорії ---------- */
  var catIds = {};
  g.DATA.cats.forEach(function (c, i) {
    var where = 'категорія «' + (c.name || c.id || ('№' + (i + 1))) + '»';
    if (!c.id) err(where, 'немає id');
    if (catIds[c.id]) err(where, 'id «' + c.id + '» вже використано іншою категорією');
    catIds[c.id] = true;
    if (!c.name) err(where, 'немає назви (name)');
    if (GENDERS.indexOf(c.g) < 0) err(where, 'поле g має бути \'w\' (жіноче), \'m\' (чоловіче) або \'u\' (спільне), а зараз там: ' + JSON.stringify(c.g));
    if (c.type && g.Art.types.indexOf(c.type) < 0) warn(where, 'силует «' + c.type + '» невідомий — картинка буде запасною');
    if (c.count === 0) warn(where, 'у цій категорії немає жодного товару — вона показується порожньою');
  });

  /* ---------- товари ---------- */
  var ids = {};
  g.DATA.products.forEach(function (p, i) {
    var where = 'товар «' + (p.name || p.id || ('№' + (i + 1))) + '»';

    REQUIRED.forEach(function (f) {
      if (p[f] === undefined || p[f] === null || p[f] === '') err(where, 'не заповнено поле ' + f);
    });

    if (p.id) {
      if (ids[p.id]) err(where, 'id «' + p.id + '» вже має інший товар — відкриється не той');
      ids[p.id] = true;
      if (!/^[a-z0-9-]+$/.test(p.id)) warn(where, 'id «' + p.id + '» містить не лише малі латинські літери, цифри й дефіс — посилання буде негарним');
    }

    if (p.cat && !catIds[p.cat]) err(where, 'категорія «' + p.cat + '» не існує — товар не потрапить у жоден розділ');
    if (p.type && g.Art.types.indexOf(p.type) < 0) err(where, 'силует «' + p.type + '» невідомий. Доступні: ' + g.Art.types.join(', '));
    if (p.g && GENDERS.indexOf(p.g) < 0) err(where, 'поле g має бути \'w\', \'m\' або \'u\'');

    if (typeof p.price !== 'number' || !(p.price > 0)) err(where, 'ціна має бути числом більше нуля (без пробілів і без «грн»)');
    if (p.old !== undefined) {
      if (typeof p.old !== 'number') err(where, 'стара ціна (old) має бути числом');
      else if (p.old <= p.price) err(where, 'стара ціна (' + p.old + ') не більша за поточну (' + p.price + ') — знижка виглядатиме як підвищення');
    }
    if (p.badge === 'sale' && !p.old) warn(where, 'позначка «sale» без старої ціни — відсоток знижки не порахується');
    if (p.badge !== undefined && BADGES.indexOf(p.badge) < 0) warn(where, 'позначка «' + p.badge + '» невідома. Доступні: new, sale, hit або порожньо');

    if (typeof p.stock !== 'number' || p.stock < 0) err(where, 'залишок (stock) має бути числом 0 або більше');

    if (Array.isArray(p.sizes)) {
      if (!p.sizes.length) err(where, 'список розмірів порожній');
    } else if (p.sizes !== undefined) err(where, 'розміри (sizes) мають бути списком у квадратних дужках');

    if (Array.isArray(p.colors)) {
      if (!p.colors.length) err(where, 'список кольорів порожній');
      p.colors.forEach(function (c, k) {
        if (!c || !c.name) err(where, 'у кольору №' + (k + 1) + ' немає назви');
        if (!c || !/^#[0-9a-f]{6}$/i.test(c.hex || '')) err(where, 'у кольору «' + ((c && c.name) || '№' + (k + 1)) + '» некоректний код — має бути вигляду #A9784C');
      });
    } else if (p.colors !== undefined) err(where, 'кольори (colors) мають бути списком у квадратних дужках');

    if (p.specs && typeof p.specs === 'object' && !Object.keys(p.specs).length) {
      warn(where, 'немає жодної характеристики — на картці буде порожньо');
    }
    if (p.desc && p.desc.length < 40) warn(where, 'опис дуже короткий (' + p.desc.length + ' символів) — покупцю немає за що зачепитись');
    if (typeof p.rating === 'number' && (p.rating < 0 || p.rating > 5)) err(where, 'оцінка має бути від 0 до 5');
  });

  /* ---------- контакти ---------- */
  var s = g.DATA.shop || {};
  var PLACEHOLDERS = [
    ['phoneHref', '+380670000000', 'телефон'],
    ['email', 'hello@marielle.ua', 'пошта'],
    ['telegram', 'https://t.me/marielle_ua', 'Telegram'],
    ['instagram', 'https://instagram.com/marielle.ua', 'Instagram']
  ];
  PLACEHOLDERS.forEach(function (row) {
    if (s[row[0]] === row[1]) warn('контакти', row[2] + ' ще заглушка — покупець не додзвониться');
  });

  /* ---------- вивід ---------- */
  if (!errors.length && !warns.length) return;

  var line = function (x) { return x.where + ': ' + x.what; };

  if (errors.length) {
    console.error('%cMarielle — помилки в каталозі (' + errors.length + ')',
      'font-weight:700', '\n' + errors.map(line).join('\n'));
  }
  if (warns.length) {
    console.warn('%cMarielle — попередження (' + warns.length + ')',
      'font-weight:700', '\n' + warns.map(line).join('\n'));
  }

  var editing = /^(localhost|127\.0\.0\.1|\[::1\])$/.test(location.hostname) ||
                location.protocol === 'file:' ||
                /[?&]check=1/.test(location.search);
  if (!editing || !errors.length) return;

  function show() {
    var box = document.createElement('div');
    box.setAttribute('role', 'alert');
    box.style.cssText = [
      'position:fixed', 'left:12px', 'right:12px', 'bottom:12px', 'z-index:9999',
      'max-height:46vh', 'overflow:auto',
      'padding:16px 18px', 'border-radius:12px',
      'background:#7A1F1F', 'color:#fff',
      'font:400 13px/1.55 ui-monospace,SFMono-Regular,Menlo,Consolas,monospace',
      'box-shadow:0 20px 60px -20px rgba(0,0,0,.6)'
    ].join(';');
    box.innerHTML =
      '<div style="display:flex;gap:12px;align-items:flex-start">' +
        '<div style="flex:1">' +
          '<b style="font-size:14px">Помилки в js/data.js — ' + errors.length + '</b>' +
          '<ul style="margin:10px 0 0;padding-left:18px">' +
            errors.map(function (x) {
              return '<li style="margin-bottom:5px">' +
                String(line(x)).replace(/[&<>]/g, function (m) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;' }[m]; }) +
                '</li>';
            }).join('') +
          '</ul>' +
          (warns.length ? '<div style="margin-top:10px;opacity:.8">Ще ' + warns.length + ' попереджень — дивіться консоль браузера.</div>' : '') +
          '<div style="margin-top:10px;opacity:.75">Цю плашку бачите лише ви: на опублікованому сайті її немає.</div>' +
        '</div>' +
        '<button type="button" aria-label="Закрити" style="flex:none;background:none;border:0;color:#fff;font-size:20px;line-height:1;cursor:pointer;opacity:.8">×</button>' +
      '</div>';
    box.querySelector('button').onclick = function () { box.remove(); };
    document.body.appendChild(box);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', show);
  else show();

})(window);
