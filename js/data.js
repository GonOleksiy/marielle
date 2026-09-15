/* ============================================================
   MARIELLE — каталог (демонстраційні дані)

   ЗАМІНИТИ на реальні позиції: назви, ціни, наявність, опис.
   Поля товару:
     id      — унікальний рядок, потрапляє в адресу product.html?id=...
     name    — назва
     cat     — категорія (id з масиву CATS нижче)
     type    — який силует малювати (див. js/art.js)
     line    — колекція / капсула
     price   — ціна, грн
     old     — стара ціна (лише якщо є знижка), інакше приберіть поле
     rating  — 0..5
     reviews — кількість відгуків
     badge   — '' | 'new' | 'sale' | 'hit'
     stock   — скільки одиниць на складі (0 = немає)
     sizes   — доступні розміри
     colors  — масив { name, hex }
     specs   — характеристики (показуються на картці та сторінці товару)
     desc    — опис
   ============================================================ */
(function (g) {
  'use strict';

  /* ---------------- КАТЕГОРІЇ ---------------- */
  var CATS = [
    { id: 'dress',  name: 'Сукні',           n: '01', desc: 'Від щоденних до вечірніх', type: 'dress'    },
    { id: 'blouse', name: 'Блузи та сорочки', n: '02', desc: 'Основа гардеробу',        type: 'blouse'   },
    { id: 'outer',  name: 'Верхній одяг',    n: '03', desc: 'Пальта, тренчі, жакети',   type: 'coat'     },
    { id: 'suit',   name: 'Костюми',         n: '04', desc: 'Комплекти, що працюють',   type: 'blazer'   },
    { id: 'skirt',  name: 'Спідниці',        n: '05', desc: 'Міді, максі, олівець',     type: 'skirt'    },
    { id: 'pants',  name: 'Штани',           n: '06', desc: 'Палаццо, сигарети, денім', type: 'trousers' },
    { id: 'knit',   name: 'Трикотаж',        n: '07', desc: 'Светри, кардигани, топи',  type: 'knit'     },
    { id: 'acc',    name: 'Аксесуари',       n: '08', desc: 'Сумки, хустки, паски',     type: 'bag'      }
  ];

  /* ---------------- ПАЛІТРА ТКАНИН ---------------- */
  var IVORY = { name: 'Молочний',   hex: '#F0EAE0' };
  var BLACK = { name: 'Чорний',     hex: '#1C1B1F' };
  var SAND  = { name: 'Пісок',      hex: '#C9AE8C' };
  var CAMEL = { name: 'Кемел',      hex: '#A9784C' };
  var OLIVE = { name: 'Олива',      hex: '#6B6C4F' };
  var CHOCO = { name: 'Шоколад',    hex: '#4A342A' };
  var SKY   = { name: 'Небо',       hex: '#A9BCC9' };
  var WINE  = { name: 'Вино',       hex: '#6E2B37' };
  var GREY  = { name: 'Сірий',      hex: '#9A958E' };
  var CREAM = { name: 'Крем',       hex: '#E4D5C2' };
  var NAVY  = { name: 'Ніч',        hex: '#22304A' };
  var ROSE  = { name: 'Пудра',      hex: '#C99A96' };

  var XS_XL = ['XS', 'S', 'M', 'L', 'XL'];
  var S_L   = ['S', 'M', 'L'];

  /* ---------------- ТОВАРИ ---------------- */
  var P = [

    /* ======== СУКНІ ======== */
    {
      id: 'aurore-slip', name: 'Сукня Aurore', cat: 'dress', type: 'dress-slip', line: 'Essentials',
      price: 3480, rating: 4.9, reviews: 41, badge: 'hit', stock: 7,
      sizes: XS_XL, colors: [IVORY, BLACK, SAND],
      specs: { 'Тканина': 'Віскоза-сатин', 'Склад': '96% віскоза, 4% еластан', 'Силует': 'Комбінація на бретелях', 'Довжина': 'Міді, 118 см', 'Підкладка': 'Немає, щільна тканина', 'Догляд': 'Делікатне прання 30°' },
      desc: 'Сукня-комбінація з сатину, який лягає по фігурі, але не підкреслює зайвого. Регульовані бретелі, косий крій — тканина рухається разом із вами. Носиться сама влітку і поверх водолазки взимку.'
    },
    {
      id: 'lisette-midi', name: 'Сукня Lisette', cat: 'dress', type: 'dress-midi', line: 'Atelier',
      price: 4290, old: 4900, rating: 4.8, reviews: 26, badge: 'sale', stock: 4,
      sizes: XS_XL, colors: [WINE, BLACK, OLIVE],
      specs: { 'Тканина': 'Костюмна вовна', 'Склад': '68% вовна, 30% віскоза, 2% еластан', 'Силует': 'Приталений, спідниця сонце', 'Довжина': 'Міді, 112 см', 'Підкладка': 'Повна, віскоза', 'Догляд': 'Хімчистка' },
      desc: 'Сукня з відрізною талією і спідницею-сонце. Щільна вовна тримає форму, підкладка не дає тканині електризуватись. Потайна блискавка збоку, глибина декольте помірна.'
    },
    {
      id: 'noelle-maxi', name: 'Сукня Noelle', cat: 'dress', type: 'dress-maxi', line: 'Soirée',
      price: 5900, rating: 4.9, reviews: 18, badge: 'new', stock: 3,
      sizes: ['XS', 'S', 'M', 'L'], colors: [BLACK, NAVY, WINE],
      specs: { 'Тканина': 'Шовк-армані', 'Склад': '100% поліестер преміум', 'Силует': 'Прямий, розріз збоку', 'Довжина': 'Максі, 142 см', 'Підкладка': 'Ліф', 'Догляд': 'Хімчистка' },
      desc: 'Вечірня сукня в підлогу з м\'яким блиском і розрізом до середини стегна. Виточки на ліфі тримають форму без кісточок. Ефектна, але не кричить.'
    },
    {
      id: 'camille-shirt-dress', name: 'Сукня-сорочка Camille', cat: 'dress', type: 'dress-shirt', line: 'Essentials',
      price: 2980, rating: 4.6, reviews: 53, badge: '', stock: 12,
      sizes: XS_XL, colors: [IVORY, SKY, SAND],
      specs: { 'Тканина': 'Бавовна-поплін', 'Склад': '100% бавовна', 'Силует': 'Вільний, пасок у комплекті', 'Довжина': 'Міді, 116 см', 'Кишені': 'Дві накладні', 'Догляд': 'Машинне прання 40°' },
      desc: 'Сукня-сорочка з щільного попліну. Із паском — силует, без паска — оверсайз. Бавовна дихає, тому це універсальний варіант на теплу пору року.'
    },
    {
      id: 'elodie-knit-dress', name: 'В\'язана сукня Elodie', cat: 'dress', type: 'dress-knit', line: 'Knitwear',
      price: 3150, rating: 4.7, reviews: 29, badge: '', stock: 0,
      sizes: S_L, colors: [CREAM, CHOCO, GREY],
      specs: { 'Тканина': 'Дрібна в\'язка', 'Склад': '50% вовна меріно, 50% акрил', 'Силует': 'По фігурі', 'Довжина': 'Міді, 110 см', 'Комір': 'Високий', 'Догляд': 'Ручне прання 30°' },
      desc: 'Щільна в\'язка з меріносом — тепла, але не колеться. Сукня тягнеться і повертається у форму, тому сідає на різні типи фігури.'
    },

    /* ======== БЛУЗИ ТА СОРОЧКИ ======== */
    {
      id: 'margot-silk', name: 'Блуза Margot', cat: 'blouse', type: 'blouse', line: 'Atelier',
      price: 2640, rating: 4.8, reviews: 37, badge: 'hit', stock: 9,
      sizes: XS_XL, colors: [IVORY, BLACK, ROSE],
      specs: { 'Тканина': 'Шовк-креп', 'Склад': '100% шовк', 'Силует': 'Напівприлеглий', 'Рукав': 'Довгий, манжет на ґудзику', 'Комір': 'Стійка', 'Догляд': 'Хімчистка або ручне прання' },
      desc: 'Шовкова блуза, яку однаково добре видно і під жакетом, і окремо. Креп не просвічує — це рідкість для шовку такої ваги.'
    },
    {
      id: 'juliette-poplin', name: 'Сорочка Juliette', cat: 'blouse', type: 'shirt', line: 'Essentials',
      price: 1890, rating: 4.7, reviews: 64, badge: '', stock: 15,
      sizes: XS_XL, colors: [IVORY, SKY, BLACK],
      specs: { 'Тканина': 'Бавовна-поплін', 'Склад': '97% бавовна, 3% еластан', 'Силует': 'Оверсайз', 'Рукав': 'Довгий, зі складкою', 'Комір': 'Класичний', 'Догляд': 'Машинне прання 40°' },
      desc: 'Біла сорочка оверсайз — та сама, що підходить під усе. Подовжена спинка, приспущене плече, щільний поплін, який не жмакається за півдня.'
    },
    {
      id: 'adele-wrap', name: 'Блуза Adèle на запах', cat: 'blouse', type: 'blouse-wrap', line: 'Atelier',
      price: 2290, old: 2750, rating: 4.5, reviews: 22, badge: 'sale', stock: 6,
      sizes: XS_XL, colors: [WINE, BLACK, OLIVE],
      specs: { 'Тканина': 'Віскозний креп', 'Склад': '92% віскоза, 8% еластан', 'Силует': 'Приталений, запах', 'Рукав': '3/4, розкльошений', 'Комір': 'V-подібний', 'Догляд': 'Делікатне прання 30°' },
      desc: 'Запах регулюється паском, тому блуза сідає по фігурі незалежно від розміру грудей. Креп тримає драпірування і не тягнеться на ліктях.'
    },
    {
      id: 'inès-top', name: 'Топ Inès', cat: 'blouse', type: 'top', line: 'Essentials',
      price: 1290, rating: 4.4, reviews: 48, badge: '', stock: 20,
      sizes: XS_XL, colors: [IVORY, BLACK, CAMEL],
      specs: { 'Тканина': 'Рібана', 'Склад': '95% бавовна, 5% еластан', 'Силует': 'По фігурі', 'Рукав': 'Без рукавів', 'Комір': 'Квадратний виріз', 'Догляд': 'Машинне прання 30°' },
      desc: 'Базовий топ у рубчик із квадратним вирізом. Щільна рібана не просвічує і не витягується після другого прання.'
    },

    /* ======== ВЕРХНІЙ ОДЯГ ======== */
    {
      id: 'colette-coat', name: 'Пальто Colette', cat: 'outer', type: 'coat', line: 'Outerwear',
      price: 8900, rating: 4.9, reviews: 31, badge: 'hit', stock: 5,
      sizes: XS_XL, colors: [CAMEL, BLACK, CREAM],
      specs: { 'Тканина': 'Вовна-кашемір', 'Склад': '80% вовна, 20% кашемір', 'Силует': 'Прямий, oversize', 'Довжина': 'Міді, 110 см', 'Підкладка': 'Повна, віскоза', 'Догляд': 'Хімчистка' },
      desc: 'Пальто-халат без ґудзиків, на паску. Вовна з кашеміром тримає тепло до −5 °C і не колеться навіть на голе плече. Приспущене плече дає місце для светра.'
    },
    {
      id: 'sylvie-trench', name: 'Тренч Sylvie', cat: 'outer', type: 'trench', line: 'Outerwear',
      price: 6400, old: 7300, rating: 4.7, reviews: 24, badge: 'sale', stock: 8,
      sizes: XS_XL, colors: [SAND, BLACK, OLIVE],
      specs: { 'Тканина': 'Бавовняна габардина', 'Склад': '65% бавовна, 35% поліестер', 'Силует': 'Двобортний, пасок', 'Довжина': 'Міді, 105 см', 'Водовідштовхування': 'Так, просочення', 'Догляд': 'Машинне прання 30°' },
      desc: 'Класичний тренч із кокеткою і манжетами на ремінцях. Габардина з просоченням тримає дрібний дощ, а не лише вітер.'
    },
    {
      id: 'renée-blazer', name: 'Жакет Renée', cat: 'outer', type: 'blazer', line: 'Tailoring',
      price: 4700, rating: 4.8, reviews: 39, badge: '', stock: 10,
      sizes: XS_XL, colors: [BLACK, CAMEL, NAVY],
      specs: { 'Тканина': 'Костюмна вовна', 'Склад': '70% вовна, 28% поліестер, 2% еластан', 'Силует': 'Напівприлеглий', 'Застібка': 'Один ґудзик', 'Підкладка': 'Повна', 'Догляд': 'Хімчистка' },
      desc: 'Жакет із підкладкою і легкою підплічковою — тримає лінію плеча, але не робить її квадратною. Поєднується зі штанами Renée в костюм.'
    },
    {
      id: 'bettine-puffer', name: 'Куртка Bettine', cat: 'outer', type: 'puffer', line: 'Outerwear',
      price: 5600, rating: 4.6, reviews: 17, badge: 'new', stock: 6,
      sizes: S_L, colors: [BLACK, CREAM, OLIVE],
      specs: { 'Тканина': 'Матовий нейлон', 'Склад': 'Верх 100% нейлон, наповнювач холофайбер 200 г', 'Силует': 'Прямий', 'Довжина': 'Нижче стегна, 92 см', 'Температура': 'До −12 °C', 'Догляд': 'Машинне прання 30°' },
      desc: 'Зимова куртка з матовим верхом, без блиску та логотипів. Широкі стьобані секції — пух не збивається донизу.'
    },

    /* ======== КОСТЮМИ ======== */
    {
      id: 'renée-suit', name: 'Костюм Renée', cat: 'suit', type: 'suit', line: 'Tailoring',
      price: 7200, old: 8100, rating: 4.9, reviews: 21, badge: 'sale', stock: 4,
      sizes: XS_XL, colors: [BLACK, CAMEL, NAVY],
      specs: { 'Комплект': 'Жакет + штани', 'Тканина': 'Костюмна вовна', 'Склад': '70% вовна, 28% поліестер, 2% еластан', 'Силует': 'Жакет напівприлеглий, штани прямі', 'Підкладка': 'Жакет — повна', 'Догляд': 'Хімчистка' },
      desc: 'Костюм, який можна носити частинами: жакет — до джинсів, штани — до трикотажу. Купуючи комплектом, ви економите 900 ₴ проти окремих позицій.'
    },
    {
      id: 'odette-linen-suit', name: 'Лляний костюм Odette', cat: 'suit', type: 'suit', line: 'Summer',
      price: 5400, rating: 4.5, reviews: 14, badge: 'new', stock: 7,
      sizes: XS_XL, colors: [IVORY, SAND, OLIVE],
      specs: { 'Комплект': 'Жакет + шорти', 'Тканина': 'Льон', 'Склад': '55% льон, 45% віскоза', 'Силует': 'Вільний', 'Підкладка': 'Немає', 'Догляд': 'Машинне прання 30°' },
      desc: 'Літній комплект із льону з віскозою — жмакається значно менше, ніж чистий льон, але лишається холодним на тілі.'
    },

    /* ======== СПІДНИЦІ ======== */
    {
      id: 'agnès-pencil', name: 'Спідниця-олівець Agnès', cat: 'skirt', type: 'skirt-pencil', line: 'Tailoring',
      price: 2240, rating: 4.6, reviews: 33, badge: '', stock: 11,
      sizes: XS_XL, colors: [BLACK, CAMEL, WINE],
      specs: { 'Тканина': 'Костюмна вовна', 'Склад': '68% вовна, 30% віскоза, 2% еластан', 'Силует': 'Олівець', 'Довжина': 'Міді, 74 см', 'Розріз': 'Ззаду, 18 см', 'Догляд': 'Хімчистка' },
      desc: 'Спідниця-олівець із високою талією та розрізом ззаду — крок вільний, силует не ламається. Підкладка не дає тканині липнути до колготок.'
    },
    {
      id: 'manon-pleated', name: 'Плісована спідниця Manon', cat: 'skirt', type: 'skirt-pleated', line: 'Essentials',
      price: 2690, rating: 4.8, reviews: 45, badge: 'hit', stock: 9,
      sizes: XS_XL, colors: [CREAM, BLACK, OLIVE],
      specs: { 'Тканина': 'Плісе', 'Склад': '100% поліестер', 'Силует': 'Розкльошений', 'Довжина': 'Міді, 88 см', 'Пояс': 'Широка резинка', 'Догляд': 'Ручне прання 30°, не прасувати' },
      desc: 'Плісе тримається завдяки термофіксації — складки не розходяться після прання. Спідниця важить менше 300 г і не м\'ялася б навіть у валізі.'
    },
    {
      id: 'blanche-denim-skirt', name: 'Джинсова спідниця Blanche', cat: 'skirt', type: 'skirt-denim', line: 'Denim',
      price: 1740, rating: 4.3, reviews: 19, badge: '', stock: 13,
      sizes: XS_XL, colors: [SKY, BLACK, IVORY],
      specs: { 'Тканина': 'Денім', 'Склад': '99% бавовна, 1% еластан', 'Силует': 'Прямий', 'Довжина': 'Міні, 46 см', 'Посадка': 'Висока', 'Догляд': 'Машинне прання 30°' },
      desc: 'Щільний денім 11 oz — тримає форму і не витягується на стегнах. Висока посадка, класичні п\'ять кишень.'
    },

    /* ======== ШТАНИ ======== */
    {
      id: 'renée-trousers', name: 'Штани Renée', cat: 'pants', type: 'trousers', line: 'Tailoring',
      price: 2900, rating: 4.8, reviews: 42, badge: '', stock: 14,
      sizes: XS_XL, colors: [BLACK, CAMEL, NAVY],
      specs: { 'Тканина': 'Костюмна вовна', 'Склад': '70% вовна, 28% поліестер, 2% еластан', 'Силует': 'Прямі, зі стрілками', 'Посадка': 'Висока', 'Довжина': 'До підлоги, 106 см', 'Догляд': 'Хімчистка' },
      desc: 'Прямі штани зі стрілками, які подовжують ногу. Пояс із внутрішньою резинкою ззаду — сідають без зазору на спині.'
    },
    {
      id: 'zoé-palazzo', name: 'Палаццо Zoé', cat: 'pants', type: 'trousers-wide', line: 'Summer',
      price: 2350, rating: 4.6, reviews: 27, badge: '', stock: 10,
      sizes: XS_XL, colors: [IVORY, BLACK, SAND],
      specs: { 'Тканина': 'Віскозний твіл', 'Склад': '100% віскоза', 'Силует': 'Широкі', 'Посадка': 'Висока', 'Пояс': 'Резинка ззаду', 'Догляд': 'Делікатне прання 30°' },
      desc: 'Широкі штани, що падають прямою лінією від стегна. Віскозний твіл важчий за звичайну віскозу — тканина не «летить» на вітрі.'
    },
    {
      id: 'lou-jeans', name: 'Джинси Lou', cat: 'pants', type: 'jeans', line: 'Denim',
      price: 2480, old: 2900, rating: 4.5, reviews: 58, badge: 'sale', stock: 16,
      sizes: XS_XL, colors: [SKY, BLACK, IVORY],
      specs: { 'Тканина': 'Денім', 'Склад': '98% бавовна, 2% еластан', 'Силует': 'Mom fit', 'Посадка': 'Висока', 'Довжина': 'Укорочена, 7/8', 'Догляд': 'Машинне прання 30°' },
      desc: 'Джинси mom fit із мінімальним еластаном — тримають форму, але не стоять колом. Укорочена довжина відкриває щиколотку.'
    },

    /* ======== ТРИКОТАЖ ======== */
    {
      id: 'céleste-sweater', name: 'Светр Céleste', cat: 'knit', type: 'knit', line: 'Knitwear',
      price: 2790, rating: 4.9, reviews: 51, badge: 'hit', stock: 12,
      sizes: S_L, colors: [CREAM, CHOCO, GREY],
      specs: { 'Тканина': 'Об\'ємна в\'язка', 'Склад': '40% вовна, 30% альпака, 30% акрил', 'Силует': 'Оверсайз', 'Комір': 'Круглий', 'Рукав': 'Спущене плече', 'Догляд': 'Ручне прання 30°' },
      desc: 'Светр із альпакою — м\'який настільки, що носиться на голе тіло. Об\'ємна в\'язка тримає повітря, тому гріє краще за свою вагу.'
    },
    {
      id: 'faye-cardigan', name: 'Кардиган Faye', cat: 'knit', type: 'cardigan', line: 'Knitwear',
      price: 3400, rating: 4.7, reviews: 23, badge: 'new', stock: 8,
      sizes: S_L, colors: [CREAM, BLACK, CAMEL],
      specs: { 'Тканина': 'Дрібна в\'язка', 'Склад': '55% вовна меріно, 45% акрил', 'Силует': 'Подовжений', 'Довжина': '84 см', 'Застібка': 'Перламутрові ґудзики', 'Догляд': 'Ручне прання 30°' },
      desc: 'Подовжений кардиган, який замінює легку куртку в міжсезоння. Меріно не колеться і майже не скочується.'
    },
    {
      id: 'nina-turtleneck', name: 'Водолазка Nina', cat: 'knit', type: 'turtleneck', line: 'Essentials',
      price: 1620, rating: 4.6, reviews: 66, badge: '', stock: 22,
      sizes: XS_XL, colors: [BLACK, IVORY, WINE],
      specs: { 'Тканина': 'Дрібна в\'язка', 'Склад': '50% вовна меріно, 50% віскоза', 'Силует': 'По фігурі', 'Комір': 'Високий, подвійний', 'Рукав': 'Довгий', 'Догляд': 'Ручне прання 30°' },
      desc: 'Тонка водолазка, яка носиться під усе — від сукні до жакета. Подвійний комір не розтягується і тримається на шиї.'
    },

    /* ======== АКСЕСУАРИ ======== */
    {
      id: 'lune-bag', name: 'Сумка Lune', cat: 'acc', type: 'bag', line: 'Accessories',
      price: 2980, rating: 4.7, reviews: 30, badge: '', stock: 9,
      sizes: ['Один розмір'], colors: [CHOCO, BLACK, CAMEL],
      specs: { 'Матеріал': 'Натуральна шкіра', 'Розмір': '32 × 22 × 11 см', 'Ручка': 'Знімний ремінь', 'Підкладка': 'Текстиль', 'Кишені': 'Одна внутрішня на блискавці', 'Догляд': 'Крем для шкіри' },
      desc: 'Сумка на кожен день із гладкої шкіри. Вміщує ноутбук 13", тримає форму без каркаса, а ремінь знімається до короткої ручки.'
    },
    {
      id: 'soie-scarf', name: 'Хустка Soie', cat: 'acc', type: 'scarf', line: 'Accessories',
      price: 890, rating: 4.5, reviews: 35, badge: '', stock: 18,
      sizes: ['90 × 90 см'], colors: [ROSE, IVORY, WINE],
      specs: { 'Матеріал': 'Шовк-твіл', 'Склад': '100% шовк', 'Розмір': '90 × 90 см', 'Край': 'Підшитий вручну', 'Друк': 'Авторський', 'Догляд': 'Хімчистка' },
      desc: 'Шовкова хустка з ручним підгином краю — це видно з вивороту і саме це відрізняє її від масової. Носиться на шиї, у волоссі або на ручці сумки.'
    },
    {
      id: 'cuir-belt', name: 'Пасок Cuir', cat: 'acc', type: 'belt', line: 'Accessories',
      price: 740, rating: 4.4, reviews: 21, badge: '', stock: 24,
      sizes: ['S / 80', 'M / 90', 'L / 100'], colors: [BLACK, CHOCO, CAMEL],
      specs: { 'Матеріал': 'Натуральна шкіра', 'Ширина': '25 мм', 'Пряжка': 'Латунь, матова', 'Отвори': '5', 'Виробництво': 'Україна', 'Догляд': 'Крем для шкіри' },
      desc: 'Шкіряний пасок середньої ширини з матовою латунною пряжкою. Підходить і до штанів, і до сукні на талію.'
    }
  ];

  /* ---------------- КОНТАКТИ МАГАЗИНУ ----------------
     ЗАМІНИТИ на справжні. Поки що тут заглушки.
     ------------------------------------------------- */
  var SHOP = {
    name: 'Marielle',
    tagline: 'Одяг, у якому вас упізнають',
    phone: '+380 (67) 000-00-00',
    phoneHref: '+380670000000',
    email: 'hello@marielle.ua',
    telegram: 'https://t.me/marielle_ua',
    instagram: 'https://instagram.com/marielle.ua',
    viber: 'viber://chat?number=%2B380670000000',
    city: 'Київ',
    address: 'вул. Хрещатик, 1 (шоурум за записом)',
    hours: 'Пн–Сб 10:00–19:00 · Нд — вихідний',
    freeShipFrom: 2500,
    returnDays: 14
  };

  /* ---------------- СЛУЖБОВЕ ---------------- */
  var catById = {};
  CATS.forEach(function (c) { catById[c.id] = c; });

  P.forEach(function (p) {
    p.catName = catById[p.cat] ? catById[p.cat].name : '';
    p.inStock = p.stock > 0;
    p.url = 'product.html?id=' + encodeURIComponent(p.id);
    if (!p.line) p.line = 'Marielle';
    if (!p.colors) p.colors = [BLACK];
    if (!p.sizes) p.sizes = XS_XL;
  });

  CATS.forEach(function (c) {
    c.count = P.filter(function (p) { return p.cat === c.id; }).length;
  });

  g.DATA = {
    cats: CATS,
    products: P,
    shop: SHOP,
    colors: { IVORY: IVORY, BLACK: BLACK, SAND: SAND, CAMEL: CAMEL, OLIVE: OLIVE, CHOCO: CHOCO, SKY: SKY, WINE: WINE, GREY: GREY, CREAM: CREAM, NAVY: NAVY, ROSE: ROSE },
    byId: function (id) {
      for (var i = 0; i < P.length; i++) if (P[i].id === id) return P[i];
      return null;
    },
    byCat: function (c) { return P.filter(function (p) { return p.cat === c; }); },
    cat: function (id) { return catById[id] || null; },
    /* усі кольори, що зустрічаються в каталозі — для фільтрів */
    allColors: function () {
      var seen = {}, out = [];
      P.forEach(function (p) {
        p.colors.forEach(function (c) {
          if (!seen[c.name]) { seen[c.name] = 1; out.push(c); }
        });
      });
      return out;
    },
    allSizes: function () {
      var seen = {}, out = [];
      P.forEach(function (p) {
        p.sizes.forEach(function (s) { if (!seen[s]) { seen[s] = 1; out.push(s); } });
      });
      return out;
    },
    allLines: function () {
      var seen = {}, out = [];
      P.forEach(function (p) { if (!seen[p.line]) { seen[p.line] = 1; out.push(p.line); } });
      return out.sort();
    },
    priceRange: function () {
      var min = Infinity, max = 0;
      P.forEach(function (p) { if (p.price < min) min = p.price; if (p.price > max) max = p.price; });
      return [Math.floor(min / 100) * 100, Math.ceil(max / 100) * 100];
    }
  };

})(window);
