/* Etkileşimler ve simülasyonlar. Her bileşen data-widget özniteliğine göre başlatılır. */
(function () {
  "use strict";
  var YZ = window.YZ, L = window.ShapeLab;
  var esc = YZ.esc;
  function $(root, sel) { return root.querySelector(sel); }
  function $$(root, sel) { return Array.prototype.slice.call(root.querySelectorAll(sel)); }
  function pct(x) { return "%" + Math.round(x * 100); }
  function fmt(x, d) { return (Math.round(x * Math.pow(10, d == null ? 2 : d)) / Math.pow(10, d == null ? 2 : d)).toFixed(d == null ? 2 : d).replace(".", ","); }
  function readJSON(w) { var s = w.querySelector('script[type="application/json"]'); return s ? JSON.parse(s.textContent) : {}; }
  var OK = '<span class="ic good" aria-hidden="true">' + YZ.CHECK + '</span>', NO = '<span class="ic bad" aria-hidden="true">' + YZ.CROSS + '</span>';
  function seg(name, options, value) {
    return '<div class="seg" role="group" aria-label="' + esc(name) + '">' + options.map(function (o) {
      return '<button type="button" data-v="' + esc(o[0]) + '" aria-pressed="' + (o[0] === value ? "true" : "false") + '">' + esc(o[1]) + "</button>";
    }).join("") + "</div>";
  }
  function bindSeg(segEl, onChange) {
    $$(segEl, "button").forEach(function (b) {
      b.addEventListener("click", function () {
        $$(segEl, "button").forEach(function (x) { x.setAttribute("aria-pressed", x === b ? "true" : "false"); });
        onChange(b.getAttribute("data-v"));
      });
    });
  }
  function setSeg(segEl, v) { $$(segEl, "button").forEach(function (x) { x.setAttribute("aria-pressed", x.getAttribute("data-v") === v ? "true" : "false"); }); }
  var BADGE = '<span class="sim-badge">Öğretim amaçlı basitleştirilmiş simülasyon</span>';

  /* =====================================================================
     1) Genel ayırma etkinliği (sorter)
     JSON: { choices:[...], items:[{q, a(index), fb}] , title?}
     ===================================================================== */
  function sorter(w) {
    var d = readJSON(w);
    var box = document.createElement("div");
    w.appendChild(box);
    var state = {};
    function render() {
      box.innerHTML = d.items.map(function (it, i) {
        return '<div class="sorter-item" data-i="' + i + '"><p class="q">' + it.q + '</p><div class="choices" role="group" aria-label="Seçenekler">' +
          d.choices.map(function (c, j) { return '<button type="button" data-j="' + j + '">' + esc(c) + "</button>"; }).join("") +
          '</div><div class="feedback" role="status" aria-live="polite" hidden></div></div>';
      }).join("") + '<div class="sim-row"><span class="score" aria-live="polite"></span><button type="button" class="btn reset">Sıfırla</button></div>';
      $$(box, ".sorter-item").forEach(function (item) {
        var i = +item.getAttribute("data-i"), it = d.items[i];
        $$(item, ".choices button").forEach(function (b) {
          b.addEventListener("click", function () {
            var j = +b.getAttribute("data-j"), ok = j === it.a;
            state[i] = ok;
            $$(item, ".choices button").forEach(function (x) { x.classList.remove("chosen-good", "chosen-bad"); x.removeAttribute("aria-pressed"); });
            b.classList.add(ok ? "chosen-good" : "chosen-bad"); b.setAttribute("aria-pressed", "true");
            var fb = $(item, ".feedback");
            fb.hidden = false; fb.className = "feedback " + (ok ? "good" : "bad");
            fb.innerHTML = '<span class="verdict"><span class="ic" aria-hidden="true">' + (ok ? YZ.CHECK : YZ.CROSS) + "</span>" + (ok ? "Uygun seçim." : "Tekrar düşün.") + "</span> " +
              (ok ? "" : "En uygun seçenek: <strong>" + esc(d.choices[it.a]) + "</strong>. ") + it.fb;
            score();
          });
        });
      });
      $(box, ".reset").addEventListener("click", function () { state = {}; render(); });
      score();
    }
    function score() {
      var n = Object.keys(state).length, ok = Object.keys(state).filter(function (k) { return state[k]; }).length;
      $(box, ".score").textContent = n ? ok + " / " + d.items.length + " uygun seçim (" + n + " yanıtlandı)" : d.items.length + " durum var. Her biri için bir seçenek seç.";
    }
    render();
  }

  /* =====================================================================
     2) Bir modeli eğit (shape-trainer)
     ===================================================================== */
  var TEST12 = [
    ["ucgen", "kirmizi", .9, 0], ["ucgen", "mavi", .55, 0], ["ucgen", "yesil", .75, 180], ["ucgen", "sari", .7, 20],
    ["kare", "mavi", .75, 0], ["kare", "kirmizi", .9, 45], ["kare", "yesil", .55, 10], ["kare", "sari", .85, 30],
    ["daire", "yesil", .7, 0], ["daire", "kirmizi", .55, 0], ["daire", "mavi", .95, 0], ["daire", "sari", .75, 0]
  ];
  function mk(t, c, s, r, seed) {
    return { type: t, label: t, color: c, size: s, rot: r || 0, seed: seed || (Math.round(s * 1000) + (r || 0) * 7 + c.length * 31 + t.length * 101) };
  }
  var PRESET_UNIFORM = (function () {
    var out = [];
    [["ucgen", "kirmizi"], ["kare", "mavi"], ["daire", "yesil"]].forEach(function (p) {
      [.8, .85, .9, .82].forEach(function (s, i) { out.push(mk(p[0], p[1], s, 0, 100 + i * 13 + p[0].length)); });
    });
    return out;
  })();
  var PRESET_DIVERSE = (function () {
    var out = [], cols = ["kirmizi", "sari", "yesil", "mavi"];
    ["ucgen", "kare", "daire"].forEach(function (t, ti) {
      [[.6, 0], [.95, 40], [.75, 200], [.85, 25]].forEach(function (sr, i) { out.push(mk(t, cols[(i + ti) % 4], sr[0], t === "daire" ? 0 : sr[1], 500 + i * 17 + ti)); });
    });
    return out;
  })();
  YZ.SHAPE_PRESETS = { uniform: PRESET_UNIFORM, diverse: PRESET_DIVERSE, test: TEST12.map(function (t) { return mk(t[0], t[1], t[2], t[3]); }) };

  function featTable(s) {
    var f = L.features(s);
    return '<table class="feat-table"><tbody>' +
      "<tr><th scope=\"row\">Köşelilik</th><td>" + fmt(f.koselilik) + "</td></tr>" +
      "<tr><th scope=\"row\">Doluluk</th><td>%" + Math.round(f.doluluk * 100) + "</td></tr>" +
      "<tr><th scope=\"row\">En-boy oranı</th><td>" + fmt(f.enboy) + "</td></tr>" +
      "<tr><th scope=\"row\">Boyut</th><td>" + fmt(f.boyut) + "</td></tr>" +
      "<tr><th scope=\"row\">Renk</th><td>" + (L.COLORS[s.color] ? L.COLORS[s.color].ad : "-") + "</td></tr>" +
      "</tbody></table>";
  }

  function shapeTrainer(w) {
    var K = 3;
    var st = { type: "ucgen", color: "kirmizi", size: .8, rot: 0, label: "ucgen", train: [], model: null, dirty: false, seedN: 1 };
    w.innerHTML = BADGE +
      '<h2 id="sim-egit">Bir modeli eğit</h2>' +
      '<div class="sim-how"><strong>Nasıl oynanır?</strong><ol>' +
      "<li>Bir şekil oluştur, doğru etiketini seç ve eğitim kümesine ekle. İstersen hazır örnek kümelerinden birini yükle.</li>" +
      "<li><strong>Modeli eğit</strong> düğmesine bas.</li>" +
      "<li>Modeli, eğitimde hiç görmediği 12 şekilden oluşan <strong>sabit test kümesiyle</strong> dene. Sonra örnekleri çeşitlendirip yeniden dene.</li></ol></div>" +
      '<div class="sim-cols">' +
      '<div class="sim-panel"><h4>1. Şekil oluştur</h4>' +
      '<div class="sim-row">' + seg("Şekil", [["ucgen", "Üçgen"], ["kare", "Kare"], ["daire", "Daire"]], "ucgen") + "</div>" +
      '<div class="sim-row">' + seg("Renk", [["kirmizi", "Kırmızı"], ["sari", "Sarı"], ["yesil", "Yeşil"], ["mavi", "Mavi"]], "kirmizi") + "</div>" +
      '<label class="field">Boyut <input type="range" min="0.5" max="1" step="0.05" value="0.8" data-k="size"></label>' +
      '<label class="field">Döndürme: <span data-out="rot">0°</span><input type="range" min="0" max="90" step="5" value="0" data-k="rot"></label>' +
      '<div class="sim-row"><div class="preview-shape" data-preview></div><div data-feat></div></div>' +
      '<div class="sim-row"><span>Etiket:</span>' + seg("Etiket", [["ucgen", "üçgen"], ["kare", "kare"], ["daire", "daire"]], "ucgen") + "</div>" +
      '<div class="sim-row"><button type="button" class="btn primary" data-act="add">Eğitim kümesine ekle</button><button type="button" class="btn" data-act="try">Bu şekli modele sor</button></div>' +
      '<div data-try-out class="sim-result" role="status" aria-live="polite" hidden></div>' +
      "</div>" +
      '<div class="sim-panel"><h4>2. Eğitim kümesi <span data-count></span></h4>' +
      '<div class="sim-row"><button type="button" class="btn" data-act="uniform">Tek tip örnekler yükle</button><button type="button" class="btn" data-act="diverse">Çeşitli örnekler yükle</button></div>' +
      '<div data-trainlist></div>' +
      '<div class="sim-row"><button type="button" class="btn primary" data-act="train">Modeli eğit</button><span data-status role="status" aria-live="polite"></span></div>' +
      "</div></div>" +
      '<div class="sim-panel" style="margin-top:16px"><h4>3. Yeni örneklerle dene</h4>' +
      '<p class="note">Test kümesi sabittir; eğitim kümesinde bulunmayan 12 şekilden oluşur. Her denemede aynı şekiller kullanıldığı için sonuçlar karşılaştırılabilir.</p>' +
      '<div class="sim-row"><button type="button" class="btn primary" data-act="test">Test kümesinde dene</button><button type="button" class="btn" data-act="reset">Her şeyi sıfırla</button></div>' +
      '<div data-test-out role="status" aria-live="polite"></div></div>' +
      '<details class="more"><summary>Bu simülasyonda neler basitleştirildi?</summary><div class="more-body"><ul>' +
      "<li>Model, gerçek bir makine öğrenmesi yöntemi olan <strong>k-en yakın komşu</strong> (k = 3) hesabını yapar: Yeni şekle en çok benzeyen 3 eğitim örneğine bakar ve çoğunluğun etiketini seçer. Sonuçlar rastgele değildir; aynı örneklerle her zaman aynı sonucu verir.</li>" +
      "<li>Gerçek görüntü tanıma sistemleri fotoğraftaki binlerce pikselden kendi özelliklerini öğrenir. Burada model şekli yalnızca 5 hazır özellikle görür: köşelilik, doluluk, en-boy oranı, boyut ve renk.</li>" +
      "<li>Bu tür modelde “eğitim”, örneklerin özelliklerini hesaplayıp saklamak ve her özelliği aynı ölçeğe getirmektir. Sinir ağları gibi modellerde eğitim, ağırlıkların adım adım ayarlanmasıdır.</li>" +
      "<li>Gerçek sistemler binlerce, hatta milyonlarca örnekle eğitilir. Ancak burada da görüldüğü gibi, örnek sayısından çok örneklerin <em>çeşitliliği ve temsil gücü</em> önemlidir.</li></ul></div></details>";

    var segs = $$(w, ".seg");
    bindSeg(segs[0], function (v) { st.type = v; st.label = v; setSeg(segs[2], v); upd(); });
    bindSeg(segs[1], function (v) { st.color = v; upd(); });
    bindSeg(segs[2], function (v) { st.label = v; });
    $$(w, "input[type=range]").forEach(function (r) {
      r.addEventListener("input", function () { st[r.getAttribute("data-k")] = +r.value; upd(); });
    });
    function cur() { return { type: st.type, color: st.color, size: st.size, rot: st.type === "daire" ? 0 : st.rot, seed: 9000 + st.seedN }; }
    function upd() {
      $(w, '[data-out="rot"]').textContent = (st.type === "daire" ? "—" : st.rot + "°");
      $(w, "[data-preview]").innerHTML = L.svg(cur());
      $(w, "[data-feat]").innerHTML = '<p class="note" style="margin:0">Modelin gördüğü sayılar:</p>' + featTable(cur());
    }
    function renderTrain() {
      var by = { ucgen: [], kare: [], daire: [] };
      st.train.forEach(function (s, i) { by[s.label].push([s, i]); });
      $(w, "[data-trainlist]").innerHTML = L.TYPE_KEYS.map(function (t) {
        return "<p style=\"margin:.6em 0 .2em\"><strong>" + L.TYPES[t] + "</strong> etiketli (" + by[t].length + ")</p><div class=\"shape-list\">" +
          (by[t].length ? by[t].map(function (p) {
            return '<button type="button" class="shape-chip" data-i="' + p[1] + '" title="Kaldır">' + L.svg(p[0], "etiket: " + L.TYPES[t] + ". Kaldırmak için tıkla") + '<span class="x" aria-hidden="true">×</span></button>';
          }).join("") : '<span class="note">Henüz örnek yok.</span>') + "</div>";
      }).join("");
      $(w, "[data-count]").textContent = "(" + st.train.length + " örnek)";
      $$(w, ".shape-chip").forEach(function (b) {
        b.addEventListener("click", function () { st.train.splice(+b.getAttribute("data-i"), 1); changed(); });
      });
    }
    function status(msg) { $(w, "[data-status]").innerHTML = msg; }
    function changed() {
      renderTrain();
      if (st.model) { st.dirty = true; status("Eğitim kümesi değişti. Değişikliğin etkisini görmek için modeli yeniden eğit."); }
    }
    function load(set) { st.train = set.map(function (s) { return Object.assign({}, s); }); st.model = null; st.dirty = false; status("Örnekler yüklendi. Şimdi modeli eğit."); renderTrain(); $(w, "[data-test-out]").innerHTML = ""; }

    $(w, '[data-act="add"]').addEventListener("click", function () {
      var s = cur(); s.label = st.label; st.seedN++;
      st.train.push(s); changed();
      if (!st.model) status(st.train.length + " örnek eklendi.");
      upd();
    });
    $(w, '[data-act="uniform"]').addEventListener("click", function () { load(PRESET_UNIFORM); });
    $(w, '[data-act="diverse"]').addEventListener("click", function () { load(PRESET_DIVERSE); });
    $(w, '[data-act="train"]').addEventListener("click", function () {
      var labels = {}; st.train.forEach(function (s) { labels[s.label] = 1; });
      if (st.train.length < 3) { status(NO + " En az 3 örnek ekle."); return; }
      st.model = L.train(st.train); st.dirty = false;
      var miss = L.TYPE_KEYS.filter(function (t) { return !labels[t]; });
      status(OK + " Model " + st.train.length + " örnekle eğitildi." + (miss.length ? " Dikkat: " + miss.map(function (t) { return L.TYPES[t]; }).join(", ") + " etiketli örnek yok; model bu şekli hiç tahmin edemez." : ""));
    });
    $(w, '[data-act="try"]').addEventListener("click", function () {
      var out = $(w, "[data-try-out]"); out.hidden = false;
      if (!st.model) { out.innerHTML = "Önce modeli eğit."; return; }
      var s = cur(), p = L.predict(st.model, s, K);
      out.innerHTML = "<strong>Modelin tahmini: " + L.TYPES[p.label] + "</strong>. En yakın " + p.neighbors.length + " eğitim örneği:" +
        '<div class="shape-list" style="margin-top:6px">' + p.neighbors.map(function (n) {
          var e = st.model.examples[n.i];
          return '<span class="shape-chip" style="cursor:default">' + L.svg(e, "etiket: " + L.TYPES[e.label]) + "</span>";
        }).join("") + "</div><p class=\"note\" style=\"margin:6px 0 0\">Oylar: " + Object.keys(p.votes).map(function (k) { return L.TYPES[k] + " " + p.votes[k]; }).join(", ") + ". Model en çok oyu alan etiketi seçti.</p>";
    });
    $(w, '[data-act="test"]').addEventListener("click", function () {
      var out = $(w, "[data-test-out]");
      if (!st.model) { out.innerHTML = '<p class="sim-result">Önce eğitim kümesine örnek ekleyip modeli eğit.</p>'; return; }
      var ev = L.evaluate(st.model, YZ.SHAPE_PRESETS.test, K);
      var html = '<div class="test-grid">' + ev.results.map(function (r) {
        return '<div class="test-item ' + (r.ok ? "ok" : "no") + '">' + L.svg(r.shape) + '<span class="pred">' + (r.ok ? OK + " Doğru" : NO + " Yanlış") + "</span>Tahmin: " + (r.pred ? L.TYPES[r.pred] : "—") + "<br><span class=\"note\">Gerçek: " + L.TYPES[r.shape.label] + "</span></div>";
      }).join("") + "</div>";
      html += '<div class="sim-result"><strong>Test başarısı: ' + ev.ok + " / " + ev.total + " (" + pct(ev.acc) + ")</strong>" + (st.dirty ? " — model eski eğitim kümesiyle çalışıyor." : "") +
        "<br>" + L.TYPE_KEYS.map(function (t) { var p = ev.per[t]; return L.TYPES[t] + ": " + p.ok + "/" + p.n; }).join(" · ") + "<br>" + insight(ev) + "</div>";
      out.innerHTML = html;
    });
    function insight(ev) {
      var tips = [];
      var colorsBy = {}; st.train.forEach(function (s) { (colorsBy[s.label] = colorsBy[s.label] || {})[s.color] = 1; });
      var single = L.TYPE_KEYS.every(function (t) { return colorsBy[t] && Object.keys(colorsBy[t]).length === 1; });
      if (single) tips.push("Eğitim kümesinde her şekil tek bir renkteydi. Model rengi bir ipucu gibi kullanmış olabilir; örneğin kırmızı bir kareyi üçgen sanabilir.");
      var rotSq = st.train.some(function (s) { return s.label === "kare" && s.rot >= 20; });
      var missRot = ev.results.some(function (r) { return !r.ok && r.shape.type === "kare" && r.shape.rot >= 20; });
      if (!rotSq && missRot) tips.push("Eğitimde döndürülmüş kare yoktu; test kümesindeki döndürülmüş kareler zorlanıyor.");
      if (ev.acc >= 0.9) tips.push("Model yeni örneklerin çoğunda doğru sonuç verdi. Yine de bu, her yeni şekilde doğru olacağı anlamına gelmez.");
      else if (!tips.length) tips.push("Hangi şekillerde hata yapıldığına bak: Eğitim kümesinde bu şekillere benzeyen örnekler var mı?");
      return tips.join(" ");
    }
    $(w, '[data-act="reset"]').addEventListener("click", function () {
      st.train = []; st.model = null; st.dirty = false; st.type = "ucgen"; st.color = "kirmizi"; st.size = .8; st.rot = 0; st.label = "ucgen";
      setSeg(segs[0], "ucgen"); setSeg(segs[1], "kirmizi"); setSeg(segs[2], "ucgen");
      $$(w, "input[type=range]").forEach(function (r) { r.value = r.getAttribute("data-k") === "size" ? .8 : 0; });
      $(w, "[data-test-out]").innerHTML = ""; $(w, "[data-try-out]").hidden = true; status(""); renderTrain(); upd();
    });
    renderTrain(); upd();
  }

  /* =====================================================================
     3) Mini sinir ağı (mini-nn): 2 girdi → 2 gizli nöron → 1 çıktı
     ===================================================================== */
  function sigmoid(z) { return 1 / (1 + Math.exp(-z)); }
  function stepf(z) { return z >= 0 ? 1 : 0; }
  var NN_PRESETS = {
    ve: { name: "VE kapısı", w: [6, 6, 0, 0], b: [-9, 0], v: [10, 0], c: -5, act: "sig", note: "Gizli nöron 1, iki girdi de 1 olduğunda büyük değer üretir. Çıkış nöronu yalnızca gizli nöron 1'e bakar." },
    veya: { name: "VEYA kapısı", w: [6, 6, 0, 0], b: [-3, 0], v: [10, 0], c: -5, act: "sig", note: "Girdilerden biri 1 olduğunda toplam eşiği geçer." },
    xor: { name: "YA DA (XOR)", w: [6, 6, -6, -6], b: [-3, 9], v: [6, 6], c: -9, act: "sig", note: "Gizli nöron 1 “en az biri açık mı?”, gizli nöron 2 “ikisi birden açık değil mi?” sorusunu hesaplar. Çıkış ikisine birden “evet” diyorsa açılır. Bu problem tek nöronla çözülemez; gizli katman gerekir." },
    sifir: { name: "Sıfırdan başla", w: [0, 0, 0, 0], b: [0, 0], v: [0, 0], c: 0, act: "sig", note: "Tüm ağırlıklar 0. Kaydırıcılarla kendi ağını kur." }
  };
  function nnCompute(p, x1, x2) {
    var act = p.act === "step" ? stepf : sigmoid;
    var z1 = p.w[0] * x1 + p.w[1] * x2 + p.b[0];
    var z2 = p.w[2] * x1 + p.w[3] * x2 + p.b[1];
    var h1 = act(z1), h2 = act(z2);
    var zo = p.v[0] * h1 + p.v[1] * h2 + p.c;
    var y = act(zo);
    return { z1: z1, z2: z2, h1: h1, h2: h2, zo: zo, y: y };
  }
  YZ.nnCompute = nnCompute; YZ.NN_PRESETS = NN_PRESETS;

  function miniNN(w) {
    var p = JSON.parse(JSON.stringify(NN_PRESETS.xor));
    var x = [1, 0];
    function slider(label, key, idx, min, max) {
      return '<label class="field">' + label + ': <span data-o="' + key + idx + '"></span><input type="range" min="' + min + '" max="' + max + '" step="0.5" data-key="' + key + '" data-idx="' + idx + '"></label>';
    }
    w.innerHTML = BADGE + '<h2 id="sim-ag">Mini sinir ağı</h2>' +
      '<div class="sim-how"><strong>Nasıl kullanılır?</strong><ol><li>Girdi değerlerini (0 ile 1 arası) ve bağlantı ağırlıklarını değiştir.</li><li>Her nöronun hesabını ve çıktının nasıl değiştiğini izle.</li><li>Hazır ayarları dene: Aynı ağ, yalnızca ağırlıklar değişince farklı bir kuralı hesaplar.</li></ol>' +
      '<p style="margin:.4em 0 0">Örnek durum: Bir okul kapısı, <em>Girdi 1 = kart okundu</em> ve <em>Girdi 2 = şifre girildi</em> bilgilerine göre açılsın mı? Çıktı 0,5 veya üstündeyse “aç”, altındaysa “açma” kabul edilir.</p></div>' +
      '<div class="sim-row"><span>Hazır ayar:</span>' + seg("Hazır ayar", [["ve", "VE"], ["veya", "VEYA"], ["xor", "YA DA (XOR)"], ["sifir", "Sıfırdan"]], "xor") +
      '<span>Etkinleştirme:</span>' + seg("Etkinleştirme işlevi", [["sig", "Yumuşak (sigmoid)"], ["step", "Basamak"]], "sig") + "</div>" +
      '<p class="note" data-note></p>' +
      '<div class="nn-wrap" data-svg></div>' +
      '<div class="sim-cols">' +
      '<div class="sim-panel"><h4>Girdiler</h4>' + slider("Girdi 1 (x₁)", "x", 0, 0, 1).replace('step="0.5"', 'step="0.1"') + slider("Girdi 2 (x₂)", "x", 1, 0, 1).replace('step="0.5"', 'step="0.1"') + "</div>" +
      '<div class="sim-panel"><h4>Gizli katman ağırlıkları</h4>' + slider("x₁ → gizli 1 (a₁)", "w", 0, -10, 10) + slider("x₂ → gizli 1 (a₂)", "w", 1, -10, 10) + slider("Gizli 1 eşik ayarı (b₁)", "b", 0, -10, 10) +
      slider("x₁ → gizli 2 (a₃)", "w", 2, -10, 10) + slider("x₂ → gizli 2 (a₄)", "w", 3, -10, 10) + slider("Gizli 2 eşik ayarı (b₂)", "b", 1, -10, 10) + "</div>" +
      '<div class="sim-panel"><h4>Çıkış ağırlıkları</h4>' + slider("gizli 1 → çıkış (c₁)", "v", 0, -10, 10) + slider("gizli 2 → çıkış (c₂)", "v", 1, -10, 10) + slider("Çıkış eşik ayarı (b₃)", "c", 0, -10, 10) +
      '<button type="button" class="btn" data-act="reset" style="margin-top:10px">Sıfırla (XOR ayarına dön)</button></div></div>' +
      '<h3>Adım adım hesap</h3><div class="calc" data-calc aria-live="polite"></div>' +
      '<h3>Dört olası girdi için sonuç (doğruluk tablosu)</h3><div class="table-wrap"><table class="truth"><thead><tr><th>x₁</th><th>x₂</th><th>gizli 1</th><th>gizli 2</th><th>çıktı</th><th>karar</th></tr></thead><tbody data-truth></tbody></table></div>' +
      '<details class="more"><summary>Bu simülasyonda neler basitleştirildi?</summary><div class="more-body"><ul>' +
      "<li>Hesaplar gerçektir: Her nöron, girdileri ağırlıklarla çarpar, toplar, eşik ayarını (bias) ekler ve sonucu bir etkinleştirme işlevinden geçirir. Ekrandaki her sayı bu formülle hesaplanır; rastgele değer kullanılmaz.</li>" +
      "<li>Burada ağırlıkları sen ayarlıyorsun. Gerçek ağlarda ağırlıklar eğitim sırasında, hatayı azaltacak şekilde küçük adımlarla otomatik ayarlanır.</li>" +
      "<li>Bu ağda 3 nöron ve 9 ayarlanabilir sayı var. Gerçek görüntü veya dil modellerinde milyonlarca hatta milyarlarca ayarlanabilir sayı (parametre) bulunur.</li>" +
      "<li>Sigmoid işlevi sonucu 0 ile 1 arasına sıkıştırır: σ(z) = 1 / (1 + e<sup>−z</sup>). Basamak işlevi ise z ≥ 0 ise 1, değilse 0 verir.</li></ul></div></details>";

    var segs = $$(w, ".seg");
    bindSeg(segs[0], function (v) { p = JSON.parse(JSON.stringify(NN_PRESETS[v])); setSeg(segs[1], p.act); syncSliders(); draw(); });
    bindSeg(segs[1], function (v) { p.act = v; draw(); });
    var sliders = $$(w, "input[type=range]");
    function getv(k, i) { return k === "x" ? x[i] : k === "c" ? p.c : p[k][i]; }
    function syncSliders() {
      sliders.forEach(function (s) { s.value = getv(s.dataset.key, +s.dataset.idx); });
      $(w, "[data-note]").textContent = p.note || "";
    }
    sliders.forEach(function (s) {
      s.addEventListener("input", function () {
        var k = s.dataset.key, i = +s.dataset.idx, v = +s.value;
        if (k === "x") x[i] = v; else if (k === "c") p.c = v; else p[k][i] = v;
        p.note = ""; $(w, "[data-note]").textContent = "";
        draw();
      });
    });
    $(w, '[data-act="reset"]').addEventListener("click", function () { p = JSON.parse(JSON.stringify(NN_PRESETS.xor)); x = [1, 0]; setSeg(segs[0], "xor"); setSeg(segs[1], "sig"); syncSliders(); draw(); });

    function edge(x1, y1, x2, y2, wt, label, lx, ly) {
      var width = 1 + Math.min(8, Math.abs(wt) * 0.8);
      var dash = wt < 0 ? ' stroke-dasharray="7 5"' : "";
      var col = wt < 0 ? "var(--warn)" : "var(--primary)";
      return '<line x1="' + x1 + '" y1="' + y1 + '" x2="' + x2 + '" y2="' + y2 + '" stroke="' + col + '" stroke-width="' + width + '"' + dash + ' opacity="' + (wt === 0 ? .25 : .85) + '"/>' +
        '<text class="nn-w" x="' + lx + '" y="' + ly + '" text-anchor="middle">' + label + " = " + fmt(wt, 1) + "</text>";
    }
    function node(cx, cy, label, val, cls) {
      return '<circle class="nn-node ' + (cls || "") + '" cx="' + cx + '" cy="' + cy + '" r="34"/>' +
        '<text class="nn-label" x="' + cx + '" y="' + (cy - 44) + '">' + label + "</text>" +
        '<text class="nn-val" x="' + cx + '" y="' + (cy + 5) + '">' + fmt(val) + "</text>";
    }
    function draw() {
      var r = nnCompute(p, x[0], x[1]);
      $$(w, "[data-o]").forEach(function (o) { var k = o.getAttribute("data-o"); o.textContent = fmt(getv(k[0], +k.slice(1)), 1); });
      var svg = '<svg viewBox="0 0 640 300" role="img" aria-label="İki girdili, iki gizli nöronlu, bir çıkışlı sinir ağı. Çıktı ' + fmt(r.y) + '">' +
        edge(90, 80, 320, 80, p.w[0], "a₁", 200, 66) + edge(90, 220, 320, 80, p.w[1], "a₂", 170, 132) +
        edge(90, 80, 320, 220, p.w[2], "a₃", 170, 176) + edge(90, 220, 320, 220, p.w[3], "a₄", 200, 246) +
        edge(320, 80, 550, 150, p.v[0], "c₁", 440, 100) + edge(320, 220, 550, 150, p.v[1], "c₂", 440, 214) +
        node(90, 80, "Girdi 1", x[0], "in") + node(90, 220, "Girdi 2", x[1], "in") +
        node(320, 80, "Gizli 1", r.h1) + node(320, 220, "Gizli 2", r.h2) + node(550, 150, "Çıktı", r.y) +
        '<text class="nn-label" x="550" y="214">' + (r.y >= 0.5 ? "Karar: AÇ" : "Karar: AÇMA") + "</text>" +
        '<text class="svg-muted" x="320" y="292" text-anchor="middle" font-size="12">Düz çizgi: pozitif ağırlık · Kesikli çizgi: negatif ağırlık · Kalınlık: ağırlığın büyüklüğü</text></svg>';
      $(w, "[data-svg]").innerHTML = svg;
      var an = p.act === "step" ? "basamak" : "σ";
      $(w, "[data-calc]").textContent =
        "Gizli 1: z = " + fmt(p.w[0], 1) + "×" + fmt(x[0], 1) + " + " + fmt(p.w[1], 1) + "×" + fmt(x[1], 1) + " + (" + fmt(p.b[0], 1) + ") = " + fmt(r.z1) + "   →  " + an + "(z) = " + fmt(r.h1) + "\n" +
        "Gizli 2: z = " + fmt(p.w[2], 1) + "×" + fmt(x[0], 1) + " + " + fmt(p.w[3], 1) + "×" + fmt(x[1], 1) + " + (" + fmt(p.b[1], 1) + ") = " + fmt(r.z2) + "   →  " + an + "(z) = " + fmt(r.h2) + "\n" +
        "Çıktı:   z = " + fmt(p.v[0], 1) + "×" + fmt(r.h1) + " + " + fmt(p.v[1], 1) + "×" + fmt(r.h2) + " + (" + fmt(p.c, 1) + ") = " + fmt(r.zo) + "   →  " + an + "(z) = " + fmt(r.y) +
        "   →  " + (r.y >= 0.5 ? "AÇ (≥ 0,5)" : "AÇMA (< 0,5)");
      $(w, "[data-truth]").innerHTML = [[0, 0], [0, 1], [1, 0], [1, 1]].map(function (c) {
        var t = nnCompute(p, c[0], c[1]);
        return "<tr><td>" + c[0] + "</td><td>" + c[1] + "</td><td>" + fmt(t.h1) + "</td><td>" + fmt(t.h2) + "</td><td><strong>" + fmt(t.y) + "</strong></td><td>" + (t.y >= 0.5 ? "AÇ" : "AÇMA") + "</td></tr>";
      }).join("");
    }
    syncSliders(); draw();
  }

  /* =====================================================================
     4) Tek nöron (neuron) — eşikli toplama
     ===================================================================== */
  function neuron(w) {
    var st = { x: [1, 1], w: [1, 1], t: 1.5 };
    w.innerHTML = '<span class="sim-badge">Öğretim amaçlı basitleştirilmiş model</span><h3 style="margin-top:.2em">Tek bir yapay nöronu dene</h3>' +
      '<p>Bu nöron iki girdiyi ağırlıklarıyla çarpar, toplar ve toplam <strong>eşik</strong> değerine ulaşırsa 1, ulaşmazsa 0 verir. Başlangıç ayarı “iki girdi de 1 ise 1 ver” kuralını (VE) hesaplar.</p>' +
      '<div class="sim-cols"><div class="sim-panel"><h4>Girdiler</h4>' +
      '<div class="sim-row">Girdi 1: ' + seg("Girdi 1", [["0", "0"], ["1", "1"]], "1") + "</div>" +
      '<div class="sim-row">Girdi 2: ' + seg("Girdi 2", [["0", "0"], ["1", "1"]], "1") + "</div></div>" +
      '<div class="sim-panel"><h4>Ayarlar</h4>' +
      '<label class="field">Ağırlık 1: <span data-o="w0"></span><input type="range" min="-2" max="2" step="0.5" value="1" data-k="w0"></label>' +
      '<label class="field">Ağırlık 2: <span data-o="w1"></span><input type="range" min="-2" max="2" step="0.5" value="1" data-k="w1"></label>' +
      '<label class="field">Eşik: <span data-o="t"></span><input type="range" min="-2" max="3" step="0.5" value="1.5" data-k="t"></label>' +
      '<button type="button" class="btn" data-act="reset">Sıfırla</button></div></div>' +
      '<div class="calc" data-calc aria-live="polite"></div>' +
      '<p class="note">Dene: Eşiği 0,5 yaparsan nöron “girdilerden en az biri 1 ise 1 ver” kuralını (VEYA) hesaplar. Ağırlıklardan birini negatif yapınca ne oluyor?</p>';
    var segs = $$(w, ".seg");
    bindSeg(segs[0], function (v) { st.x[0] = +v; draw(); });
    bindSeg(segs[1], function (v) { st.x[1] = +v; draw(); });
    $$(w, "input[type=range]").forEach(function (r) {
      r.addEventListener("input", function () { var k = r.dataset.k; if (k === "t") st.t = +r.value; else st.w[+k[1]] = +r.value; draw(); });
    });
    $(w, '[data-act="reset"]').addEventListener("click", function () {
      st = { x: [1, 1], w: [1, 1], t: 1.5 }; setSeg(segs[0], "1"); setSeg(segs[1], "1");
      $$(w, "input[type=range]").forEach(function (r) { r.value = r.dataset.k === "t" ? 1.5 : 1; }); draw();
    });
    function draw() {
      $(w, '[data-o="w0"]').textContent = fmt(st.w[0], 1); $(w, '[data-o="w1"]').textContent = fmt(st.w[1], 1); $(w, '[data-o="t"]').textContent = fmt(st.t, 1);
      var sum = st.w[0] * st.x[0] + st.w[1] * st.x[1];
      var rows = [[0, 0], [0, 1], [1, 0], [1, 1]].map(function (c) { var s = st.w[0] * c[0] + st.w[1] * c[1]; return "  " + c[0] + "   " + c[1] + "   toplam " + fmt(s, 1) + "  →  " + (s >= st.t ? 1 : 0); }).join("\n");
      $(w, "[data-calc]").textContent = "Toplam = " + fmt(st.w[0], 1) + "×" + st.x[0] + " + " + fmt(st.w[1], 1) + "×" + st.x[1] + " = " + fmt(sum, 1) +
        "\nEşik = " + fmt(st.t, 1) + "  →  çıktı = " + (sum >= st.t ? "1 (toplam eşiğe ulaştı)" : "0 (toplam eşiğin altında)") +
        "\n\nTüm girdiler için:\n x₁  x₂\n" + rows;
    }
    draw();
  }

  /* =====================================================================
     5) Dengeli veri deneyi (balance-lab)
     ===================================================================== */
  var BAL = (function () {
    var pools = {}, test = [];
    var seeds = { ucgen: 11, kare: 22, daire: 33 }, tseeds = { ucgen: 911, kare: 922, daire: 933 };
    L.TYPE_KEYS.forEach(function (t) {
      pools[t] = L.makePool(t, 30, seeds[t], { jitter: 0.14 });
      test = test.concat(L.makePool(t, 10, tseeds[t], { jitter: 0.14 }));
    });
    return { pools: pools, test: test };
  })();
  YZ.BAL = BAL;
  function balanceRun(n, k) {
    var tr = [];
    L.TYPE_KEYS.forEach(function (t) { tr = tr.concat(BAL.pools[t].slice(0, n[t])); });
    if (!tr.length) return null;
    var m = L.train(tr);
    return L.evaluate(m, BAL.test, k);
  }
  YZ.balanceRun = balanceRun;

  function balanceLab(w) {
    var n = { ucgen: 10, kare: 10, daire: 10 }, K = 5, history = [];
    w.innerHTML = BADGE + '<h2 id="sim-denge">Dengeli veri deneyi</h2>' +
      '<div class="sim-how"><strong>Nasıl yapılır?</strong><ol><li>Kaydırıcılarla eğitim verisinde her şekilden kaç örnek olacağını seç.</li><li><strong>Eğit ve test et</strong> düğmesine bas.</li><li>Model her seferinde aynı <strong>30 şekillik sabit test kümesiyle</strong> (her türden 10 şekil) sınanır. Her şekil türü için başarıyı karşılaştır.</li></ol></div>' +
      '<div class="sim-cols"><div class="sim-panel"><h4>Eğitim verisindeki dağılım</h4>' +
      L.TYPE_KEYS.map(function (t) { return '<label class="field">' + L.TYPES[t].charAt(0).toLocaleUpperCase("tr") + L.TYPES[t].slice(1) + ' örnekleri: <span data-o="' + t + '"></span><input type="range" min="0" max="30" step="1" data-t="' + t + '"></label>'; }).join("") +
      '<div class="sim-row"><button type="button" class="btn" data-p="10,10,10">Dengeli 10/10/10</button><button type="button" class="btn" data-p="30,30,3">Daire az</button><button type="button" class="btn" data-p="30,3,30">Kare az</button><button type="button" class="btn" data-p="30,30,30">Hepsi 30</button></div>' +
      '<div class="sim-row"><button type="button" class="btn primary" data-act="run">Eğit ve test et</button><button type="button" class="btn" data-act="reset">Sıfırla</button></div>' +
      '<div data-strip></div></div>' +
      '<div class="sim-panel"><h4>Sonuç (sabit test kümesi)</h4><div data-out role="status" aria-live="polite"><p class="note">Henüz deneme yapılmadı.</p></div></div></div>' +
      '<h3>Denemelerini karşılaştır</h3><div class="table-wrap"><table><thead><tr><th>Eğitim dağılımı (üçgen/kare/daire)</th><th>Üçgen</th><th>Kare</th><th>Daire</th><th>Genel</th></tr></thead><tbody data-hist><tr><td colspan="5" class="note">Denemeler burada listelenecek.</td></tr></tbody></table></div>' +
      '<details class="more"><summary>Test kümesini gör</summary><div class="more-body"><div class="test-grid" data-testset></div></div></details>' +
      '<details class="more"><summary>Bu simülasyonda neler basitleştirildi?</summary><div class="more-body"><ul>' +
      "<li>Başarı yüzdeleri uydurma değildir: Her denemede gerçek bir k-en yakın komşu modeli (k = 5) seçtiğin örneklerle kurulur ve 30 test şeklinin her biri tek tek sınıflandırılır. Aynı dağılım her zaman aynı sonucu verir.</li>" +
      "<li>Eğitim örnekleri tohumlu bir üreteçle önceden hazırlanmış 30'ar şekillik havuzlardan sırayla alınır; test şekilleri ayrı bir havuzdan gelir ve eğitimde kullanılmaz.</li>" +
      "<li>Bu model, en yakın 5 örneğin oyuna baktığı için az örneği olan türü daha zor seçer. Başka model türlerinde dengesizliğin etkisi farklı büyüklükte olabilir; ama dengesiz veri birçok gerçek sistemde de benzer sorunlara yol açar.</li>" +
      "<li>Gerçek sistemlerde dengesizlik yalnızca örnek sayısında değil; örneklerin çeşitliliğinde, ortamında ve kalitesinde de olabilir.</li></ul></div></details>";
    var sliders = $$(w, "input[type=range]");
    function sync() {
      sliders.forEach(function (s) { s.value = n[s.dataset.t]; $(w, '[data-o="' + s.dataset.t + '"]').textContent = n[s.dataset.t]; });
      $(w, "[data-strip]").innerHTML = '<p class="note" style="margin:.6em 0 .2em">Eğitim kümesi: ' + (n.ucgen + n.kare + n.daire) + " örnek</p>" +
        L.TYPE_KEYS.map(function (t) {
          return '<div class="bar-row"><span>' + L.TYPES[t] + '</span><div class="bar-track"><div class="bar-fill alt" style="width:' + (n[t] / 30 * 100) + '%"></div></div><span>' + n[t] + "</span></div>";
        }).join("");
    }
    sliders.forEach(function (s) { s.addEventListener("input", function () { n[s.dataset.t] = +s.value; sync(); }); });
    $$(w, "[data-p]").forEach(function (b) {
      b.addEventListener("click", function () { var v = b.dataset.p.split(",").map(Number); n = { ucgen: v[0], kare: v[1], daire: v[2] }; sync(); });
    });
    $(w, '[data-act="run"]').addEventListener("click", function () {
      var ev = balanceRun(n, K), out = $(w, "[data-out]");
      if (!ev) { out.innerHTML = '<p>' + NO + " Eğitim kümesi boş. En az bir örnek ekle.</p>"; return; }
      var rows = L.TYPE_KEYS.map(function (t) {
        var p = ev.per[t], a = p.ok / p.n;
        return '<div class="bar-row"><span>' + L.TYPES[t] + '</span><div class="bar-track"><div class="bar-fill" style="width:' + (a * 100) + '%"></div></div><span>' + p.ok + "/" + p.n + "</span></div>";
      }).join("");
      var accs = L.TYPE_KEYS.map(function (t) { return ev.per[t].ok / ev.per[t].n; });
      var worst = L.TYPE_KEYS[accs.indexOf(Math.min.apply(null, accs))];
      var msg;
      if (n[worst] === 0) msg = "Eğitim verisinde hiç " + L.TYPES[worst] + " yok. Model hiç görmediği bir etiketi tahmin edemez.";
      else if (Math.min.apply(null, accs) < 0.6 && ev.acc >= 0.6) msg = "Genel başarı %" + Math.round(ev.acc * 100) + " ama " + L.TYPES[worst] + " için yalnızca " + ev.per[worst].ok + "/10. Tek bir genel yüzde, bir grubun ne kadar zorlandığını gizleyebilir.";
      else if (Math.max.apply(null, accs) - Math.min.apply(null, accs) <= 0.2) msg = "Şekil türleri arasında başarı birbirine yakın.";
      else msg = "En çok zorlanan tür: " + L.TYPES[worst] + ". Bu türün eğitim örneklerini artırıp tekrar dene.";
      out.innerHTML = '<div class="bars">' + rows + '</div><p style="margin:.8em 0 0"><strong>Genel başarı: ' + ev.ok + "/30 (" + pct(ev.acc) + ")</strong></p><p class=\"note\" style=\"margin:.3em 0 0\">" + msg + "</p>";
      history.unshift({ d: n.ucgen + "/" + n.kare + "/" + n.daire, a: L.TYPE_KEYS.map(function (t) { return ev.per[t].ok + "/10"; }), g: pct(ev.acc) });
      history = history.slice(0, 6);
      $(w, "[data-hist]").innerHTML = history.map(function (h) { return "<tr><td>" + h.d + "</td><td>" + h.a.join("</td><td>") + "</td><td><strong>" + h.g + "</strong></td></tr>"; }).join("");
    });
    $(w, '[data-act="reset"]').addEventListener("click", function () {
      n = { ucgen: 10, kare: 10, daire: 10 }; history = []; sync();
      $(w, "[data-out]").innerHTML = '<p class="note">Henüz deneme yapılmadı.</p>';
      $(w, "[data-hist]").innerHTML = '<tr><td colspan="5" class="note">Denemeler burada listelenecek.</td></tr>';
    });
    $(w, "[data-testset]").innerHTML = BAL.test.map(function (s) { return '<div class="test-item">' + L.svg(s) + L.TYPES[s.label] + "</div>"; }).join("");
    sync();
  }

  /* =====================================================================
     6) Yapay zekâ dedektifi (detective)
     ===================================================================== */
  var DET_CHOICES = ["Yanlış veya uydurma bilgi", "Gizlilik riski", "Önyargı / dengesiz veri", "Kontrol edilmesi gereken iddia", "Belirgin bir sorun yok"];
  var DET_CASES = [
    { s: "Bir sohbet botu şöyle yazıyor: “İstanbul, 1543 yılında Fatih Sultan Mehmet tarafından fethedildi.”", a: 0, fb: "İstanbul'un fethi 1453'tür. Cümle akıcı ve kendinden emin olsa da tarih yanlış. Tarih, isim ve sayı içeren cevapları güvenilir bir kaynaktan kontrol et." },
    { s: "Ödev yardımı isteyen bir öğrenci sohbet kutusuna şunu yazmak üzere: “Adım Elif Y., Atatürk Ortaokulu 7/B'deyim, telefonum 0555 … , bana kesirleri anlat.”", a: 1, fb: "Kesirleri öğrenmek için ad, okul, sınıf ve telefon gerekmez. Soruyu kişisel bilgi olmadan da sorabilirsin. Gereksiz kişisel veri paylaşmamak en güvenli yoldur." },
    { s: "Bir bitki tanıma uygulaması yaz aylarında çekilmiş fotoğraflarla eğitilmiş. Kışın yapraklarını dökmüş ağaçları sık sık yanlış tanıyor.", a: 2, fb: "Eğitim verisi tek bir mevsimi temsil ediyor. Model, verisinde az bulunan durumlarda daha çok hata yapıyor. Çözüm: farklı mevsimlerden örnekler eklemek ve her durum için ayrı ayrı test etmek." },
    { s: "Bir sohbet botu kaynak göstermeden şöyle diyor: “2024'te yapılan bir araştırmaya göre her gün 3 saat oyun oynayan öğrencilerin notları %40 artıyor.”", a: 3, fb: "Belirli bir yıl, yüzde ve “araştırma” iddiası var ama kaynak yok. Böyle bir araştırmanın gerçekten olup olmadığı, kim tarafından yapıldığı ve ne bulduğu kontrol edilmeden kullanılmamalı." },
    { s: "Bir arkadaşın, sınıf arkadaşının izni olmadan çektiği fotoğrafını “yüzü yaşlandır” uygulamasına yüklemek istiyor.", a: 1, fb: "Fotoğraftaki yüz, o kişiye ait kişisel veridir. Başkasının fotoğrafını izni olmadan bir uygulamaya yüklemek, onun gizliliğini ihlal eder. Fotoğrafın nerede saklanacağı ve nasıl kullanılacağı da çoğu zaman belli değildir." },
    { s: "Bir sohbet botu kaynak olarak “Yılmaz, A. (2019). Kuşların Göç Yolları. Bilim Yayınları, s. 245” gösteriyor. Okul kütüphanesinde ve kütüphane kataloglarında böyle bir kitap bulunamıyor.", a: 0, fb: "Dil modelleri gerçek gibi görünen ama var olmayan kaynaklar üretebilir. Bu kaynak kontrol edilmiş ve bulunamamış; bu yüzden uydurma kabul edilmeli ve kullanılmamalı." },
    { s: "Okul kulübü seçmeleri için hazırlanan bir puanlama aracı, geçmiş yıllarda kulübe yalnızca 8. sınıflar alındığı için 5. sınıf başvurularına sürekli düşük puan veriyor.", a: 2, fb: "Araç geçmişteki seçimlerden öğrendiği için eski alışkanlığı tekrarlıyor. Buna tarihsel önyargı denir. Geçmiş veriler adil olmayan bir durumu yansıtıyorsa model de bunu sürdürebilir." },
    { s: "Bir videoda ünlü bir futbolcu “Bu uygulamayı indirenlere bedava forma veriyorum!” diyor. Ses biraz yapay, futbolcunun resmî hesaplarında böyle bir duyuru yok.", a: 3, fb: "Bu bir derin sahte (deepfake) video olabilir. Videoya güvenmeden önce kişinin resmî hesaplarına ve güvenilir haber kaynaklarına bak. Bir şeyi kazanmak için acele ettiren mesajlar ayrıca şüphe uyandırmalı." },
    { s: "Bir yapay zekâ aracı şöyle diyor: “Ay'ın Dünya'ya ortalama uzaklığı yaklaşık 384.000 kilometredir.”", a: 4, fb: "Bu bilgi bilimsel kaynaklarla uyumludur (ortalama uzaklık yaklaşık 384.400 km). Doğru bilgileri tanımak da önemli. Yine de bir ödevde kullanacaksan bir ders kitabından veya güvenilir bir bilim kurumundan teyit etmek iyi bir alışkanlıktır." },
    { s: "Bir oyun sitesindeki sohbet penceresi “Hesabını doğrulamam için şifreni ve annenin telefon numarasını yaz.” diyor.", a: 1, fb: "Şifre hiçbir sohbet botuyla, uygulamayla veya kişiyle paylaşılmaz. Gerçek hizmetler şifreni sohbet penceresinde istemez. Böyle bir istek gördüğünde bir yetişkine haber ver." },
    { s: "Bir ses tanıma uygulaması çoğunlukla tek bir şehirdeki kişilerin ses kayıtlarıyla eğitilmiş. Başka yörelerin ağızlarıyla konuşan kişileri daha sık yanlış anlıyor.", a: 2, fb: "Sorun konuşan kişilerde değil, eğitim verisinin çeşitliliğindedir. Veri, kullanacak herkesi temsil etmediğinde sistem bazı kullanıcılar için daha çok hata yapar." },
    { s: "Bir öğrenci, yapay zekâdan aldığı “Su deniz seviyesinde 100 °C'de kaynar.” bilgisini fen ödevine yazıyor ve ders kitabından kontrol ediyor.", a: 4, fb: "Bilgi doğrudur ve öğrenci ders kitabından kontrol etmiş. Bu, yapay zekâyı sorumlu kullanmanın iyi bir örneği. Ödevde yapay zekâdan yararlandığını belirtmesi de gerekebilir." }
  ];
  YZ.DET = { choices: DET_CHOICES, cases: DET_CASES };

  function detective(w) {
    var i = 0, score = 0, answered = {};
    w.innerHTML = '<span class="sim-badge">Öğretim amaçlı oyun — gerçek bir yapay zekâ kullanılmaz</span><h2 id="sim-dedektif">Yapay zekâ dedektifi</h2>' +
      '<div class="sim-how"><strong>Nasıl oynanır?</strong> Her vakayı oku ve en önemli sorunu seç. Seçiminden sonra nedenini açıklayan geri bildirim göreceksin. Bazı vakalarda birden fazla sorun olabilir; en belirgin olanı seç. Vakalardaki metinler öğretim amacıyla hazırlanmıştır.</div>' +
      '<div class="detective-card"><p class="note" data-prog></p><div class="scenario" data-s></div><div class="choices" role="group" aria-label="Sorun türü" data-c></div>' +
      '<div class="feedback" data-fb role="status" aria-live="polite" hidden></div>' +
      '<div class="sim-row"><button type="button" class="btn" data-act="prev">← Önceki vaka</button><button type="button" class="btn primary" data-act="next">Sonraki vaka →</button><button type="button" class="btn" data-act="reset">Baştan başla</button><span class="score" data-score></span></div></div>';
    function render() {
      var c = DET_CASES[i];
      $(w, "[data-prog]").textContent = "Vaka " + (i + 1) + " / " + DET_CASES.length;
      $(w, "[data-s]").textContent = c.s;
      $(w, "[data-c]").innerHTML = DET_CHOICES.map(function (ch, j) { return '<button type="button" data-j="' + j + '">' + esc(ch) + "</button>"; }).join("");
      var fb = $(w, "[data-fb]"); fb.hidden = true;
      $$(w, "[data-c] button").forEach(function (b) { b.addEventListener("click", function () { choose(+b.dataset.j); }); });
      if (answered[i] != null) showResult(answered[i]);
      $(w, '[data-act="prev"]').disabled = i === 0;
      $(w, '[data-act="next"]').textContent = i === DET_CASES.length - 1 ? "Sonucu gör" : "Sonraki vaka →";
      updScore();
    }
    function choose(j) {
      if (answered[i] == null) { answered[i] = j; if (j === DET_CASES[i].a) score++; }
      showResult(answered[i]);
      updScore();
    }
    function showResult(j) {
      var c = DET_CASES[i], ok = j === c.a;
      $$(w, "[data-c] button").forEach(function (b) {
        var bj = +b.dataset.j; b.disabled = true;
        if (bj === j) b.classList.add(ok ? "chosen-good" : "chosen-bad");
        if (!ok && bj === c.a) { b.classList.add("reveal"); b.insertAdjacentHTML("beforeend", " <span class=\"note\">(en uygun)</span>"); }
      });
      var fb = $(w, "[data-fb]"); fb.hidden = false; fb.className = "feedback " + (ok ? "good" : "bad");
      fb.innerHTML = '<span class="verdict"><span class="ic" aria-hidden="true">' + (ok ? YZ.CHECK : YZ.CROSS) + "</span>" + (ok ? "Doğru tespit." : "Bu vakada en belirgin sorun: " + esc(DET_CHOICES[c.a]) + ".") + "</span> " + c.fb;
    }
    function updScore() { $(w, "[data-score]").textContent = "Puan: " + score + " / " + Object.keys(answered).length; }
    $(w, '[data-act="prev"]').addEventListener("click", function () { if (i > 0) { i--; render(); } });
    $(w, '[data-act="next"]').addEventListener("click", function () {
      if (i < DET_CASES.length - 1) { i++; render(); return; }
      var n = Object.keys(answered).length;
      var fb = $(w, "[data-fb]"); fb.hidden = false; fb.className = "feedback good";
      fb.innerHTML = "<strong>Dedektif raporu:</strong> " + n + " vakadan " + score + " tanesinde en belirgin sorunu buldun." + (n < DET_CASES.length ? " Yanıtlamadığın " + (DET_CASES.length - n) + " vaka var; “Önceki vaka” ile geri dönebilirsin." : "") +
        " Unutma: Gerçek hayatta tek bir “doğru düğme” yoktur; önemli olan durumu sorgulamak, kaynağı kontrol etmek ve gerekirse bir yetişkine danışmaktır.";
    });
    $(w, '[data-act="reset"]').addEventListener("click", function () { i = 0; score = 0; answered = {}; render(); });
    render();
  }

  /* =====================================================================
     7) Sonraki kelime oyunu (next-word)
     ===================================================================== */
  var NW = {
    start: ["Bugün", "hava", "çok"],
    table: {
      "çok": [["güzel", .44], ["soğuk", .30], ["sıcak", .20], ["mutlu", .06]],
      "güzel": [["olduğu", .40], ["ve", .27], ["ama", .23], [".", .10]],
      "soğuk": [["olduğu", .38], ["ve", .27], ["ama", .25], [".", .10]],
      "sıcak": [["olduğu", .40], ["ve", .25], ["ama", .25], [".", .10]],
      "mutlu": [[".", .55], ["ve", .25], ["ama", .20]],
      "olduğu": [["için", .93], ["gibi", .07]],
      "için": [["parka", .45], ["dışarı", .35], ["evde", .20]],
      "gibi": [["dün", .6], ["yarın", .4]],
      "dün": [["de", .7], [".", .3]], "yarın": [["da", .6], [".", .4]], "de": [["öyleydi.", 1]], "da": [["öyle", 1]], "öyle": [["olacak.", 1]],
      "ve": [["rüzgârlı.", .45], ["güneşli.", .35], ["bulutlu.", .20]],
      "ama": [["rüzgârlı.", .40], ["yağmur", .35], ["serin.", .25]],
      "yağmur": [["yağabilir.", .8], ["bekleniyor.", .2]],
      "parka": [["gittik.", .7], ["koştuk.", .3]],
      "dışarı": [["çıktık.", .85], ["baktık.", .15]],
      "evde": [["kaldık.", 1]]
    }
  };
  YZ.NW = NW;
  function nextWord(w) {
    var words = NW.start.slice(), rnd = L.rng(Date.now() % 100000);
    w.innerHTML = '<span class="sim-badge">Öğretim amaçlı basitleştirilmiş simülasyon</span><h3 style="margin-top:.2em" id="sim-kelime">Sıradaki kelimeyi tahmin et</h3>' +
      '<p>Dil modelleri metni parça parça (token token) üretir. Her adımda olası devamlara bir olasılık verir ve birini seçer. Bir kelimeye tıkla ya da seçimi “modele” bırak.</p>' +
      '<div class="token-line" data-line aria-live="polite"></div>' +
      '<div class="next-options" data-opts></div>' +
      '<div class="sim-row"><button type="button" class="btn primary" data-act="auto">Olasılığa göre seçtir</button><button type="button" class="btn" data-act="reset">Baştan başla</button></div>' +
      '<p class="note" data-info></p>' +
      '<details class="more"><summary>Bu simülasyonda neler basitleştirildi?</summary><div class="more-body"><ul>' +
      "<li>Buradaki olasılıklar <strong>öğretim amacıyla elle yazılmıştır</strong>; gerçek bir modelden alınmamıştır. Gerçek dil modelleri olasılıkları milyarlarca parametreyle, metnin tamamına bakarak hesaplar.</li>" +
      "<li>Burada yalnızca son kelimeye bakılıyor. Gerçek modeller önceki kelimelerin hepsini (bağlam penceresine sığdığı kadar) dikkate alır.</li>" +
      "<li>“Olasılığa göre seçtir” düğmesi, kelimeleri gösterilen olasılıklarla rastgele seçer. Bu yüzden aynı başlangıç her seferinde farklı bir cümleye dönüşebilir; gerçek sohbet botlarının aynı soruya farklı cevaplar vermesinin bir nedeni de budur.</li>" +
      "<li>Gerçek modellerde metin kelimelerden değil, kelime parçalarından (token) oluşur. “Yapay zekâ” gibi bir ifade birkaç tokene bölünebilir.</li></ul></div></details>";
    function render(newIdx) {
      $(w, "[data-line]").innerHTML = words.map(function (t, i) { return '<span class="tok' + (i === newIdx ? " new" : "") + '">' + esc(t) + "</span>"; }).join(" ");
      var last = words[words.length - 1], opts = NW.table[last];
      var ended = !opts || /\.$/.test(last);
      if (ended) {
        $(w, "[data-opts]").innerHTML = '<p class="sim-result" style="margin:0"><strong>Cümle tamamlandı.</strong> Cümle akıcı görünüyor; ama modelin bugün havanın gerçekten nasıl olduğunu bilmediğine dikkat et. Yalnızca hangi kelimelerin birbirini izlemeye yatkın olduğunu “biliyor”.</p>';
        $(w, '[data-act="auto"]').disabled = true;
        $(w, "[data-info]").textContent = "";
        return;
      }
      $(w, '[data-act="auto"]').disabled = false;
      $(w, "[data-opts]").innerHTML = opts.map(function (o, i) {
        return '<button type="button" class="next-opt" data-i="' + i + '"><span><strong>' + esc(o[0]) + '</strong></span><span class="bar-track"><span class="bar-fill" style="display:block;width:' + (o[1] * 100) + '%"></span></span><span>%' + Math.round(o[1] * 100) + "</span></button>";
      }).join("");
      $(w, "[data-info]").textContent = "“" + last + "” kelimesinden sonra gelebilecek " + opts.length + " seçenek var.";
      $$(w, ".next-opt").forEach(function (b) { b.addEventListener("click", function () { add(opts[+b.dataset.i][0]); }); });
    }
    function add(t) { words.push(t); render(words.length - 1); }
    $(w, '[data-act="auto"]').addEventListener("click", function () {
      var opts = NW.table[words[words.length - 1]]; if (!opts) return;
      var r = rnd(), acc = 0, pick = opts[opts.length - 1][0];
      for (var i = 0; i < opts.length; i++) { acc += opts[i][1]; if (r < acc) { pick = opts[i][0]; break; } }
      add(pick);
    });
    $(w, '[data-act="reset"]').addEventListener("click", function () { words = NW.start.slice(); render(); });
    render();
  }

  /* =====================================================================
     8) Ezberleyen ve genelleyen model (memorize)
     ===================================================================== */
  function memorize(w) {
    var train = PRESET_DIVERSE, test = YZ.SHAPE_PRESETS.test;
    function key(s) { return [s.type, s.color, s.size, s.rot, s.seed].join("|"); }
    var table = {}; train.forEach(function (s) { table[key(s)] = s.label; });
    var knn = L.train(train);
    function evalMem(set) { var ok = 0; set.forEach(function (s) { if (table[key(s)] === s.label) ok++; }); return ok; }
    function evalKnn(set) { return L.evaluate(knn, set, 1).ok; }
    w.innerHTML = '<span class="sim-badge">Öğretim amaçlı basitleştirilmiş simülasyon</span><h3 style="margin-top:.2em">Ezberleyen model ile genelleyen model</h3>' +
      '<p>İki model aynı 12 eğitim şekliyle hazırlandı. <strong>Ezberleyen model</strong> yalnızca birebir aynı şekli gördüğünde cevap verir, diğerlerinde “bilmiyorum” der. <strong>Genelleyen model</strong> yeni şekli en çok benzediği eğitim örneğine göre sınıflandırır.</p>' +
      '<div class="shape-list" aria-label="Eğitim şekilleri">' + train.map(function (s) { return '<span class="shape-chip" style="cursor:default">' + L.svg(s, "eğitim örneği") + "</span>"; }).join("") + "</div>" +
      '<div class="sim-row"><button type="button" class="btn" data-act="train">Eğitim örnekleriyle sına</button><button type="button" class="btn primary" data-act="test">Yeni örneklerle sına</button></div>' +
      '<div data-out role="status" aria-live="polite"></div>';
    function show(which) {
      var set = which === "train" ? train : test;
      var m = evalMem(set), k = evalKnn(set);
      $(w, "[data-out]").innerHTML = '<div class="table-wrap"><table><thead><tr><th>' + (which === "train" ? "Eğitimde kullanılan 12 şekil" : "Eğitimde hiç görülmemiş 12 yeni şekil") + "</th><th>Doğru cevap</th></tr></thead><tbody>" +
        "<tr><td>Ezberleyen model</td><td><strong>" + m + " / 12</strong></td></tr><tr><td>Genelleyen model</td><td><strong>" + k + " / 12</strong></td></tr></tbody></table></div>" +
        '<p class="sim-result">' + (which === "train"
          ? "Eğitim örneklerinde iki model de çok başarılı görünüyor. Ama bu, modelin gerçekten öğrendiğini göstermez; ezberleyen model de tam puan alır."
          : "Yeni örneklerde ezberleyen model hiçbir şekli tanıyamıyor. Bir modelin başarısı, eğitimde görmediği örneklerle ölçülmelidir.") + "</p>";
    }
    $(w, '[data-act="train"]').addEventListener("click", function () { show("train"); });
    $(w, '[data-act="test"]').addEventListener("click", function () { show("test"); });
  }

  /* =====================================================================
     9) Komut kurucu (prompt-builder)
     ===================================================================== */
  function promptBuilder(w) {
    var EX = {
      amac: "Fotosentezi anlamak istiyorum; yarın sınıfta kısaca anlatacağım.",
      baglam: "7. sınıf öğrencisiyim. Bitkilerin güneş ışığına ihtiyaç duyduğunu biliyorum ama nasıl besin ürettiklerini tam anlamadım.",
      cikti: "Günlük yaşamdan bir benzetmeyle, 5–6 cümlelik sade bir açıklama yaz. Sonunda kendimi sınamam için 2 soru sor.",
      sinir: "Bilmediğin veya emin olmadığın bir şey varsa bunu belirt. Kaynak uydurma; ders kitabımdan kontrol edebileceğim temel bilgileri kullan."
    };
    var F = [["amac", "Amaç", "Ne istiyorsun ve neden?"], ["baglam", "Bağlam", "Sen kimsin, konu hakkında ne biliyorsun, cevap kim için?"], ["cikti", "İstenen çıktı", "Cevap nasıl olsun? (uzunluk, biçim, örnek, soru…)"], ["sinir", "Sınırlar", "Neleri istemiyorsun, nelere dikkat etmeli?"]];
    w.innerHTML = '<span class="sim-badge">Öğretim amaçlı araç — yazdıkların hiçbir yere gönderilmez</span><h3 style="margin-top:.2em" id="komut-kurucu">Komut kurucu</h3>' +
      '<p>Dört kutuyu doldur; komutun aşağıda oluşsun. Kontrol listesi yalnızca basit kurallarla çalışır: kutunun dolu olup olmadığına ve kişisel bilgiye benzeyen ifadelere bakar. Cevabın doğruluğunu ölçemez.</p>' +
      F.map(function (f) { return '<label class="field">' + f[1] + ' <span class="note" style="font-weight:400">— ' + f[2] + '</span><textarea data-f="' + f[0] + '" rows="2"></textarea></label>'; }).join("") +
      '<div class="sim-row"><button type="button" class="btn" data-act="ex">Örnekle doldur</button><button type="button" class="btn" data-act="clear">Temizle</button><button type="button" class="btn primary" data-act="copy">Komutu kopyala</button><span data-copied role="status" aria-live="polite"></span></div>' +
      '<h4>Oluşan komut</h4><div class="prompt-sample" data-out></div>' +
      '<h4>Kontrol listesi</h4><ul data-check style="list-style:none;padding:0"></ul>';
    var tas = $$(w, "textarea");
    function val(k) { return $(w, '[data-f="' + k + '"]').value.trim(); }
    function upd() {
      var parts = F.map(function (f) { return val(f[0]); }).filter(Boolean);
      $(w, "[data-out]").textContent = parts.length ? parts.join("\n") : "(Kutuları doldurdukça komutun burada görünecek.)";
      var all = F.map(function (f) { return val(f[0]); }).join(" ");
      var checks = F.map(function (f) {
        var ok = val(f[0]).split(/\s+/).filter(Boolean).length >= 3;
        return [ok, f[1] + (ok ? " yazıldı." : " eksik veya çok kısa.")];
      });
      var personal = /(\b0?5\d{2}[\s-]?\d{3}[\s-]?\d{2}[\s-]?\d{2}\b)|(@[a-z0-9-]+\.)|(\b\d{11}\b)|şifre(m|si)?\s*[:=]|adres(im)?\s*[:=]|\bmahalle(si)?\b|\bsokak\b|\bcadde(si)?\b/i.test(all);
      checks.push([!personal, personal ? "Kişisel bilgiye benzeyen bir ifade var (telefon, e-posta, kimlik numarası, adres veya şifre). Komutundan çıkar." : "Kişisel bilgiye benzeyen bir ifade bulunmadı."]);
      $(w, "[data-check]").innerHTML = checks.map(function (c) { return "<li>" + (c[0] ? OK : NO) + " " + esc(c[1]) + "</li>"; }).join("") +
        "<li><span class=\"ic warn\" aria-hidden=\"true\">!</span> İyi bir komut daha uygun bir cevap alma olasılığını artırır ama <strong>doğru cevabı garanti etmez</strong>. Gelen cevabı yine kontrol et.</li>";
    }
    tas.forEach(function (t) { t.addEventListener("input", upd); });
    $(w, '[data-act="ex"]').addEventListener("click", function () { tas.forEach(function (t) { t.value = EX[t.dataset.f]; }); upd(); });
    $(w, '[data-act="clear"]').addEventListener("click", function () { tas.forEach(function (t) { t.value = ""; }); $(w, "[data-copied]").textContent = ""; upd(); });
    $(w, '[data-act="copy"]').addEventListener("click", function () {
      var txt = $(w, "[data-out]").textContent, msg = $(w, "[data-copied]");
      function done() { msg.textContent = "Kopyalandı."; }
      function fallback() {
        var ta = document.createElement("textarea"); ta.value = txt; document.body.appendChild(ta); ta.select();
        try { document.execCommand("copy"); done(); } catch (e) { msg.textContent = "Kopyalanamadı; metni seçip elle kopyalayabilirsin."; }
        document.body.removeChild(ta);
      }
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(txt).then(done, fallback); else fallback();
    });
    upd();
  }

  /* =====================================================================
     10) Aşamalı şema (stepper)
     Kapsayıcıda [data-step="n"] öğeleri ve <ol class="step-texts"> bulunur.
     ===================================================================== */
  function stepper(w) {
    var parts = $$(w, "[data-step]"), texts = $$(w, ".step-texts > li");
    var max = texts.length, i = 1;
    var ctl = document.createElement("div");
    ctl.className = "sim-row";
    ctl.innerHTML = '<button type="button" class="btn" data-act="prev">← Önceki aşama</button><button type="button" class="btn primary" data-act="next">Sonraki aşama →</button><button type="button" class="btn" data-act="all">Tümünü göster</button><span class="note" data-pos></span>';
    var textBox = document.createElement("div");
    textBox.className = "sim-result"; textBox.setAttribute("aria-live", "polite");
    var list = $(w, ".step-texts"); list.hidden = true;
    list.parentNode.insertBefore(textBox, list);
    list.parentNode.insertBefore(ctl, textBox);
    function show() {
      parts.forEach(function (p) { var s = +p.getAttribute("data-step"); p.style.opacity = s <= i ? 1 : 0.08; });
      textBox.innerHTML = "<strong>Aşama " + i + ":</strong> " + texts[i - 1].innerHTML;
      $(ctl, "[data-pos]").textContent = i + " / " + max;
      $(ctl, '[data-act="prev"]').disabled = i <= 1; $(ctl, '[data-act="next"]').disabled = i >= max;
    }
    $(ctl, '[data-act="prev"]').addEventListener("click", function () { if (i > 1) { i--; show(); } });
    $(ctl, '[data-act="next"]').addEventListener("click", function () { if (i < max) { i++; show(); } });
    $(ctl, '[data-act="all"]').addEventListener("click", function () { i = max; show(); });
    show();
  }

  var WIDGETS = { sorter: sorter, "shape-trainer": shapeTrainer, "mini-nn": miniNN, neuron: neuron, "balance-lab": balanceLab, detective: detective, "next-word": nextWord, memorize: memorize, "prompt-builder": promptBuilder, stepper: stepper };
  document.querySelectorAll("[data-widget]").forEach(function (w) {
    var f = WIDGETS[w.getAttribute("data-widget")];
    if (f) { try { f(w); } catch (e) { console.error("Etkileşim başlatılamadı:", w.getAttribute("data-widget"), e); w.insertAdjacentHTML("beforeend", '<p class="feedback bad">Bu etkinlik yüklenemedi. Sayfayı yenilemeyi dene.</p>'); } }
  });
})();
