/* ShapeLab — şekil simülasyonlarının hesap motoru.
   Şekiller çokgen olarak üretilir; özellikler bu çokgenlerden gerçekten hesaplanır.
   Sınıflandırıcı: k-en yakın komşu (k-NN). Rastgelelik yalnızca tohumlu (tekrarlanabilir) üreteçten gelir. */
(function (root) {
  "use strict";

  var COLORS = {
    kirmizi: { ad: "kırmızı", hex: "#d64545", hue: 0 },
    sari: { ad: "sarı", hex: "#d99a00", hue: 50 },
    yesil: { ad: "yeşil", hex: "#2e9e5b", hue: 140 },
    mavi: { ad: "mavi", hex: "#3a6fd8", hue: 220 },
    gri: { ad: "gri", hex: "#6b7280", hue: 0, gray: true }
  };
  var TYPES = { ucgen: "üçgen", kare: "kare", daire: "daire" };
  var TYPE_KEYS = ["ucgen", "kare", "daire"];

  /* Tohumlu rastgele sayı üreteci (mulberry32) */
  function rng(seed) {
    var a = seed >>> 0;
    return function () {
      a = (a + 0x6D2B79F5) >>> 0;
      var t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function sizeName(s) { return s < 0.6 ? "küçük" : s < 0.82 ? "orta" : "büyük"; }

  /* Şekli 100×100 alanda çokgen köşelerine çevirir */
  function polygon(s) {
    var r = rng(s.seed || 7);
    var jit = s.jitter == null ? 0.06 : s.jitter;
    var R = 32 * s.size;
    var rot = (s.rot || 0) * Math.PI / 180;
    var angles, radius;
    if (s.type === "daire") {
      angles = []; for (var i = 0; i < 36; i++) angles.push(i * 10);
      radius = R;
    } else if (s.type === "kare") {
      angles = [45, 135, 225, 315]; radius = R * 1.2533; // alanı aynı boyuttaki daireyle eşit
    } else {
      angles = [-90, 30, 150]; radius = R * 1.5551; // alanı aynı boyuttaki daireyle eşit
    }
    return angles.map(function (deg) {
      var a = deg * Math.PI / 180 + rot;
      var rr = radius * (1 + (r() - 0.5) * jit);
      var dx = (r() - 0.5) * jit * R, dy = (r() - 0.5) * jit * R;
      return [50 + rr * Math.cos(a) + dx, (s.type === "ucgen" ? 58 : 50) + rr * Math.sin(a) + dy];
    });
  }

  function area(pts) {
    var s = 0;
    for (var i = 0; i < pts.length; i++) { var p = pts[i], q = pts[(i + 1) % pts.length]; s += p[0] * q[1] - q[0] * p[1]; }
    return Math.abs(s) / 2;
  }

  function segDist(px, py, a, b) {
    var vx = b[0] - a[0], vy = b[1] - a[1];
    var t = ((px - a[0]) * vx + (py - a[1]) * vy) / (vx * vx + vy * vy);
    t = Math.max(0, Math.min(1, t));
    var dx = a[0] + t * vx - px, dy = a[1] + t * vy - py;
    return Math.sqrt(dx * dx + dy * dy);
  }

  /* Modelin "gördüğü" sayısal özellikler */
  function features(s) {
    var pts = polygon(s);
    var xs = pts.map(function (p) { return p[0]; }), ys = pts.map(function (p) { return p[1]; });
    var w = Math.max.apply(null, xs) - Math.min.apply(null, xs);
    var h = Math.max.apply(null, ys) - Math.min.apply(null, ys);
    var c = COLORS[s.color] || COLORS.gri;
    var hr = c.hue * Math.PI / 180;
    var cx = 0, cy = 0; pts.forEach(function (p) { cx += p[0]; cy += p[1]; }); cx /= pts.length; cy /= pts.length;
    var rMax = 0, rMin = Infinity;
    pts.forEach(function (p, i) {
      rMax = Math.max(rMax, Math.hypot(p[0] - cx, p[1] - cy));
      rMin = Math.min(rMin, segDist(cx, cy, p, pts[(i + 1) % pts.length]));
    });
    return {
      koselilik: rMax / rMin,                 // merkezden en uzak nokta / en yakın kenar (daire ≈ 1, kare ≈ 1,4, üçgen ≈ 2)
      doluluk: area(pts) / (w * h),          // şekil alanı / çevreleyen dikdörtgen alanı
      enboy: Math.min(w, h) / Math.max(w, h), // 1 = kare gibi çevreleyen kutu
      boyut: Math.sqrt(area(pts) / Math.PI) / 32, // alana göre boyut (1 ≈ en büyük)
      renkX: c.gray ? 0 : Math.cos(hr),
      renkY: c.gray ? 0 : Math.sin(hr)
    };
  }
  var FKEYS = ["koselilik", "doluluk", "enboy", "boyut", "renkX", "renkY"];
  /* Özellik ağırlıkları: renk iki sayıyla gösterildiği için her biri biraz düşük tutulur */
  var WEIGHTS = [1, 0.8, 0.6, 0.8, 0.8, 0.8];
  function vec(s) { var f = features(s); return FKEYS.map(function (k) { return f[k]; }); }

  /* "Eğitim": örneklerin özelliklerini hesaplar ve her özelliği ölçeklemek için ortalama/sapma bulur */
  function train(examples) {
    var X = examples.map(function (e) { return vec(e); });
    var d = FKEYS.length, mean = [], sd = [];
    for (var j = 0; j < d; j++) {
      var m = 0; X.forEach(function (x) { m += x[j]; }); m /= Math.max(1, X.length);
      var v = 0; X.forEach(function (x) { v += (x[j] - m) * (x[j] - m); }); v = Math.sqrt(v / Math.max(1, X.length));
      mean.push(m); sd.push(v);
    }
    return { examples: examples, X: X, mean: mean, sd: sd };
  }
  function scaled(model, x) {
    return x.map(function (v, j) { return model.sd[j] > 1e-6 ? WEIGHTS[j] * (v - model.mean[j]) / model.sd[j] : 0; });
  }

  /* k-en yakın komşu ile tahmin */
  function predict(model, shape, k) {
    if (!model || !model.examples.length) return null;
    k = Math.min(k || 3, model.examples.length);
    var q = scaled(model, vec(shape));
    var ds = model.X.map(function (x, i) {
      var s = scaled(model, x), d = 0;
      for (var j = 0; j < s.length; j++) d += (s[j] - q[j]) * (s[j] - q[j]);
      return { i: i, d: Math.sqrt(d), label: model.examples[i].label };
    }).sort(function (a, b) { return a.d - b.d || a.i - b.i; });
    var nn = ds.slice(0, k), votes = {}, dist = {};
    nn.forEach(function (n) { votes[n.label] = (votes[n.label] || 0) + 1; dist[n.label] = (dist[n.label] || 0) + n.d; });
    var best = null;
    Object.keys(votes).forEach(function (l) {
      if (best === null || votes[l] > votes[best] || (votes[l] === votes[best] && dist[l] < dist[best])) best = l;
    });
    return { label: best, votes: votes, neighbors: nn };
  }

  function evaluate(model, tests, k) {
    var per = {}, total = 0, ok = 0;
    var results = tests.map(function (t) {
      var p = predict(model, t, k);
      var correct = !!p && p.label === t.label;
      per[t.label] = per[t.label] || { n: 0, ok: 0 };
      per[t.label].n++; if (correct) per[t.label].ok++;
      total++; if (correct) ok++;
      return { shape: t, pred: p ? p.label : null, ok: correct, p: p };
    });
    return { results: results, per: per, acc: total ? ok / total : 0, ok: ok, total: total };
  }

  /* Tohumlu örnek üretimi (Dengeli veri deneyi için) */
  function makePool(type, n, seed, opts) {
    opts = opts || {};
    var r = rng(seed);
    var out = [];
    for (var i = 0; i < n; i++) {
      out.push({
        type: type, label: type,
        color: opts.color || "gri",
        size: 0.55 + r() * 0.45,
        rot: Math.round(r() * 359),
        seed: Math.floor(r() * 1e9) + 1
      });
    }
    return out;
  }

  function describe(s) {
    return (COLORS[s.color] ? COLORS[s.color].ad + " " : "") + sizeName(s.size) + " " + TYPES[s.type] + (s.rot ? " (" + Math.round(s.rot) + "° döndürülmüş)" : "");
  }

  function svg(s, extraLabel) {
    var pts = polygon(s).map(function (p) { return p[0].toFixed(1) + "," + p[1].toFixed(1); }).join(" ");
    var c = COLORS[s.color] || COLORS.gri;
    return '<svg viewBox="0 0 100 100" role="img" aria-label="' + describe(s) + (extraLabel ? ", " + extraLabel : "") + '"><polygon points="' + pts + '" fill="' + c.hex + '" stroke="rgba(0,0,0,.35)" stroke-width="1.5" stroke-linejoin="round"/></svg>';
  }

  var api = { COLORS: COLORS, TYPES: TYPES, TYPE_KEYS: TYPE_KEYS, rng: rng, polygon: polygon, features: features, train: train, predict: predict, evaluate: evaluate, makePool: makePool, describe: describe, svg: svg, sizeName: sizeName };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.ShapeLab = api;
})(this);
