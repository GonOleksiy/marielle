/* ============================================================
   MARIELLE — «шовк» у геройському блоці

   Власний WebGL-шейдер без жодних бібліотек: поле висот із
   накладених хвиль, з нього рахується нормаль і освітлення.
   Виходить тканина, що повільно дихає.

   Якщо WebGL недоступний — полотно просто лишається прозорим,
   під ним видно градієнт, сайт працює далі.
   ============================================================ */
(function () {
  'use strict';

  var canvas = document.getElementById('silk');
  if (!canvas) return;

  var reduced = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);

  var gl = null;
  try {
    gl = canvas.getContext('webgl', { alpha: true, antialias: false, premultipliedAlpha: false, depth: false }) ||
         canvas.getContext('experimental-webgl', { alpha: true, antialias: false, premultipliedAlpha: false, depth: false });
  } catch (e) { return; }
  if (!gl) return;

  /* ---------------- шейдери ---------------- */
  var VS = [
    'attribute vec2 p;',
    'void main(){ gl_Position = vec4(p, 0.0, 1.0); }'
  ].join('\n');

  var FS = [
    'precision highp float;',
    'uniform vec2  uRes;',
    'uniform float uT;',
    'uniform float uDark;',
    'uniform vec2  uM;',
    'uniform vec3  cLo;',   /* глибока складка */
    'uniform vec3  cHi;',   /* світло на гребені */
    'uniform vec3  cGold;', /* фірмовий відблиск */

    /* поле висот: чотири хвилі під різними кутами */
    'float H(vec2 q){',
    '  float v = 0.0;',
    '  v += sin(q.x * 1.65 + uT * 0.33) * 0.50;',
    '  v += sin(q.y * 2.10 - uT * 0.26) * 0.38;',
    '  v += sin((q.x + q.y) * 1.28 + uT * 0.185) * 0.34;',
    '  v += sin((q.x - q.y) * 2.55 - uT * 0.225) * 0.20;',
    '  v += sin(q.x * 3.90 + q.y * 1.10 + uT * 0.42) * 0.10;',
    '  return v;',
    '}',

    'void main(){',
    '  vec2 uv = (gl_FragCoord.xy - 0.5 * uRes) / uRes.y;',
    '  vec2 q  = uv * 3.2 + uM * 0.35;',

    /* нормаль через похідні поля висот */
    '  float e = 0.012;',
    '  float h  = H(q);',
    '  float hx = H(q + vec2(e, 0.0));',
    '  float hy = H(q + vec2(0.0, e));',
    '  vec3  n  = normalize(vec3(-(hx - h) / e, -(hy - h) / e, 2.4));',

    /* два джерела світла: основне зверху-зліва і золотий контровий */
    '  vec3 L1 = normalize(vec3(-0.45, 0.72, 0.53));',
    '  vec3 L2 = normalize(vec3( 0.78, -0.30, 0.42));',
    '  vec3 V  = vec3(0.0, 0.0, 1.0);',

    '  float d1 = max(dot(n, L1), 0.0);',
    '  float d2 = max(dot(n, L2), 0.0);',
    '  float s1 = pow(max(dot(reflect(-L1, n), V), 0.0), 26.0);',
    '  float s2 = pow(max(dot(reflect(-L2, n), V), 0.0), 40.0);',

    /* базовий колір тканини */
    '  vec3 col = mix(cLo, cHi, d1 * 0.86 + 0.14);',
    '  col += cGold * (d2 * 0.30 + s2 * 0.85);',
    '  col += cHi   * s1 * 0.42;',

    /* легкий муар, щоб поверхня не здавалась пластиковою */
    '  col *= 0.965 + 0.035 * sin(h * 7.0 + uT * 0.5);',

    /* м\'які краї: у центрі щільно, на периметрі розчиняється */
    '  float r = length(uv * vec2(0.86, 1.18));',
    '  float a = smoothstep(1.18, 0.34, r);',
    '  a *= mix(0.72, 0.9, uDark);',

    '  gl_FragColor = vec4(col, a);',
    '}'
  ].join('\n');

  function compile(type, src) {
    var sh = gl.createShader(type);
    gl.shaderSource(sh, src);
    gl.compileShader(sh);
    if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) { gl.deleteShader(sh); return null; }
    return sh;
  }

  var vs = compile(gl.VERTEX_SHADER, VS);
  var fs = compile(gl.FRAGMENT_SHADER, FS);
  if (!vs || !fs) return;

  var prog = gl.createProgram();
  gl.attachShader(prog, vs);
  gl.attachShader(prog, fs);
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return;
  gl.useProgram(prog);

  /* повноекранний трикутник */
  var buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  var loc = gl.getAttribLocation(prog, 'p');
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

  var uRes  = gl.getUniformLocation(prog, 'uRes');
  var uT    = gl.getUniformLocation(prog, 'uT');
  var uDark = gl.getUniformLocation(prog, 'uDark');
  var uM    = gl.getUniformLocation(prog, 'uM');
  var cLo   = gl.getUniformLocation(prog, 'cLo');
  var cHi   = gl.getUniformLocation(prog, 'cHi');
  var cGold = gl.getUniformLocation(prog, 'cGold');

  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

  /* ---------------- палітра під тему ---------------- */
  var PAL = {
    light: { lo: [0.851, 0.812, 0.761], hi: [0.996, 0.988, 0.976], gold: [0.722, 0.533, 0.361] },
    dark:  { lo: [0.063, 0.055, 0.075], hi: [0.176, 0.161, 0.200], gold: [0.780, 0.580, 0.384] }
  };
  function paint() {
    var dark = document.documentElement.getAttribute('data-theme') === 'dark';
    var p = dark ? PAL.dark : PAL.light;
    gl.useProgram(prog);
    gl.uniform3fv(cLo, p.lo);
    gl.uniform3fv(cHi, p.hi);
    gl.uniform3fv(cGold, p.gold);
    gl.uniform1f(uDark, dark ? 1 : 0);
  }
  paint();
  if (window.MutationObserver) {
    new MutationObserver(paint).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  }

  /* ---------------- розмір ---------------- */
  var dpr = 1;
  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 1.75);
    var w = Math.max(1, Math.round(canvas.clientWidth * dpr));
    var h = Math.max(1, Math.round(canvas.clientHeight * dpr));
    if (canvas.width === w && canvas.height === h) return;
    canvas.width = w; canvas.height = h;
    gl.viewport(0, 0, w, h);
    gl.uniform2f(uRes, w, h);
  }

  /* ---------------- курсор ---------------- */
  var mx = 0, my = 0, tmx = 0, tmy = 0;
  if (window.matchMedia && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    window.addEventListener('pointermove', function (e) {
      tmx = (e.clientX / window.innerWidth - 0.5) * 1.4;
      tmy = (0.5 - e.clientY / window.innerHeight) * 1.4;
    }, { passive: true });
  }

  /* ---------------- цикл ---------------- */
  var t0 = performance.now(), raf = null, visible = true;

  function frame(now) {
    raf = requestAnimationFrame(frame);
    if (!visible) return;
    resize();
    mx += (tmx - mx) * 0.045;
    my += (tmy - my) * 0.045;
    gl.uniform2f(uM, mx, my);
    gl.uniform1f(uT, reduced ? 6.0 : (now - t0) / 1000);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    if (reduced) { cancelAnimationFrame(raf); raf = null; }  /* один кадр і стоп */
  }

  /* не малюємо, коли блок за межами екрана або вкладка неактивна */
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (en) { visible = en[0].isIntersecting; }, { threshold: 0.02 })
      .observe(canvas);
  }
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) { if (raf) { cancelAnimationFrame(raf); raf = null; } }
    else if (!raf) { t0 = performance.now() - 4000; raf = requestAnimationFrame(frame); }
  });

  resize();
  canvas.classList.add('is-on');
  raf = requestAnimationFrame(frame);
})();
