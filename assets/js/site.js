/* Yapay Zekâyı Keşfet — gezinme, arama, ilerleme, kontrol soruları, sunum modu */
(function () {
  "use strict";
  var YZ = window.YZ;
  var body = document.body;
  var pageId = body.getAttribute("data-page") || "";

  /* ---------- Güvenli yerel depolama ---------- */
  var store = {
    get: function (k, d) { try { var v = localStorage.getItem(k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } },
    set: function (k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* depolama kapalı olabilir */ } }
  };
  YZ.store = store;

  /* ---------- Yardımcılar ---------- */
  function el(tag, attrs, html) {
    var n = document.createElement(tag);
    if (attrs) Object.keys(attrs).forEach(function (k) { n.setAttribute(k, attrs[k]); });
    if (html != null) n.innerHTML = html;
    return n;
  }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  YZ.esc = esc;
  var CHECK = '<svg viewBox="0 0 16 16" width="12" height="12" aria-hidden="true"><path d="M3 8.5l3 3 7-7" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  var CROSS = '<svg viewBox="0 0 16 16" width="12" height="12" aria-hidden="true"><path d="M4 4l8 8M12 4l-8 8" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/></svg>';
  YZ.CHECK = CHECK; YZ.CROSS = CROSS;
  var ICON = {
    search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></svg>',
    menu: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M4 6h16M4 12h16M4 18h16"/></svg>',
    screen: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="3" y="4" width="18" height="12" rx="2"/><path d="M8 20h8M12 16v4"/></svg>',
    teacher: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M3 7l9-4 9 4-9 4-9-4z"/><path d="M7 9v5c0 1.5 2.5 3 5 3s5-1.5 5-3V9"/></svg>',
    theme: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>'
  };
  var LOGO = '<svg class="brand-mark" viewBox="0 0 40 40" aria-hidden="true"><rect width="40" height="40" rx="11" fill="var(--primary)"/><g stroke="var(--primary-ink)" stroke-width="2.2" fill="none"><circle cx="11" cy="13" r="3"/><circle cx="11" cy="27" r="3"/><circle cx="29" cy="20" r="3.4"/><path d="M14 13.8 25.8 19M14 26.2 25.8 21"/></g></svg>';

  function pageById(id) { for (var i = 0; i < YZ.PAGES.length; i++) if (YZ.PAGES[i].id === id) return YZ.PAGES[i]; return null; }
  var current = pageById(pageId) || (pageId === YZ.TEACHER.id ? YZ.TEACHER : null);

  /* ---------- İlerleme ---------- */
  var PKEY = "yz-ilerleme-v1";
  function getProg() { return store.get(PKEY, {}); }
  function setProg(p) { store.set(PKEY, p); }
  function markVisited() {
    if (!current || !current.topic) return;
    var p = getProg(); p[pageId] = p[pageId] || {}; p[pageId].visited = true; setProg(p);
  }
  function setDone(id, v) { var p = getProg(); p[id] = p[id] || {}; p[id].done = !!v; setProg(p); refreshProgressUI(); }
  function isDone(id) { var p = getProg(); return !!(p[id] && p[id].done); }
  YZ.setDone = setDone; YZ.isDone = isDone;
  var TOPICS = YZ.PAGES.filter(function (p) { return p.topic; });

  /* ---------- Üst çubuk ---------- */
  function buildHeader() {
    var h = document.getElementById("site-header");
    if (!h) return;
    h.className = "site-header";
    h.innerHTML =
      '<button class="btn icon-btn only-mobile" id="menu-btn" aria-controls="sidebar" aria-expanded="false">' + ICON.menu + '<span class="sr-only">Konular menüsü</span></button>' +
      '<a class="brand" href="index.html">' + LOGO + '<span class="brand-text">Yapay Zekâyı Keşfet<small>Ortaokul için yapay zekâ rehberi</small></span></a>' +
      '<div class="header-search" role="search">' + ICON.search +
      '<label class="sr-only" for="q">Sitede ara</label>' +
      '<input id="q" type="search" autocomplete="off" placeholder="Konu veya soru ara… ( / )" aria-controls="search-results" aria-expanded="false" aria-autocomplete="list">' +
      '<ul class="search-results" id="search-results" role="listbox" aria-label="Arama sonuçları" hidden></ul></div>' +
      '<div class="header-actions">' +
      '<a class="btn ghost hide-mobile" href="' + YZ.TEACHER.file + '"' + (pageId === "ogretmen" ? ' aria-current="page"' : "") + '>' + ICON.teacher + '<span class="lbl">Öğretmen rehberi</span></a>' +
      '<button class="btn ghost" id="present-btn" aria-pressed="false" title="Sunum modu (P)">' + ICON.screen + '<span class="lbl">Sunum modu</span></button>' +
      '<button class="btn ghost icon-btn" id="theme-btn" title="Açık / koyu tema">' + ICON.theme + '<span class="sr-only">Temayı değiştir</span></button>' +
      "</div>";
  }

  /* ---------- Konu menüsü ---------- */
  function buildSidebar() {
    var s = document.getElementById("sidebar");
    if (!s) return;
    s.className = "sidebar";
    s.setAttribute("aria-label", "Konular");
    var html = '<div class="progress-box" id="progress-box"></div><ol class="toc">';
    YZ.PAGES.forEach(function (p, i) {
      if (i === 11) html += '</ol><p class="toc-sep">Uygula ve keşfet</p><ol class="toc">';
      html += '<li data-id="' + p.id + '"><a href="' + p.file + '"' + (p.id === pageId ? ' aria-current="page"' : "") + '><span class="num">' + p.no + '</span><span>' + esc(p.short) + '</span><span class="state" aria-hidden="true"></span></a></li>';
    });
    html += '</ol><p class="toc-sep">Öğretmen için</p><ol class="toc"><li><a href="' + YZ.TEACHER.file + '"' + (pageId === "ogretmen" ? ' aria-current="page"' : "") + '><span class="num">Ö</span><span>Öğretmen rehberi</span><span class="state"></span></a></li></ol>';
    s.innerHTML = html;
    refreshProgressUI();
  }

  function refreshProgressUI() {
    var done = TOPICS.filter(function (p) { return isDone(p.id); }).length;
    var box = document.getElementById("progress-box");
    if (box) {
      box.innerHTML = '<p>Öğrenme ilerlemen: <strong>' + done + " / " + TOPICS.length + "</strong> konu</p>" +
        '<div class="progress-bar" role="progressbar" aria-label="Tamamlanan konular" aria-valuemin="0" aria-valuemax="' + TOPICS.length + '" aria-valuenow="' + done + '"><span style="width:' + Math.round(done / TOPICS.length * 100) + '%"></span></div>' +
        '<button type="button" id="reset-progress">İlerlemeyi sıfırla</button>';
      var rb = document.getElementById("reset-progress");
      rb.onclick = function () {
        if (rb.getAttribute("data-confirm") !== "1") {
          rb.setAttribute("data-confirm", "1");
          rb.textContent = "Emin misin? Silmek için tekrar tıkla";
          setTimeout(function () { if (document.body.contains(rb)) { rb.removeAttribute("data-confirm"); rb.textContent = "İlerlemeyi sıfırla"; } }, 5000);
          return;
        }
        setProg({}); refreshProgressUI(); syncCompleteBtn();
      };
    }
    document.querySelectorAll(".toc li[data-id]").forEach(function (li) {
      var d = isDone(li.getAttribute("data-id"));
      li.classList.toggle("done", d);
      var st = li.querySelector(".state");
      if (st) st.innerHTML = d ? CHECK : "";
      var a = li.querySelector("a");
      if (a) { var t = a.querySelector("span:nth-child(2)").textContent; a.setAttribute("aria-label", t + (d ? " (tamamlandı)" : "")); }
    });
    document.querySelectorAll("[data-path-id]").forEach(function (li) { li.classList.toggle("done", isDone(li.getAttribute("data-path-id"))); });
  }

  /* ---------- Önceki / sonraki ---------- */
  function buildPager() {
    var nav = document.getElementById("pager");
    if (!nav || !current || !current.no) return;
    var i = YZ.PAGES.indexOf(current);
    var prev = YZ.PAGES[i - 1], next = YZ.PAGES[i + 1];
    nav.className = "pager";
    nav.setAttribute("aria-label", "Önceki ve sonraki konu");
    nav.innerHTML =
      (prev ? '<a class="prev" href="' + prev.file + '" rel="prev"><small>← Önceki konu</small>' + esc(prev.title) + "</a>" : "<span></span>") +
      (next ? '<a class="next" href="' + next.file + '" rel="next"><small>Sonraki konu →</small>' + esc(next.title) + "</a>" : "");
  }

  /* ---------- Konu tamamlama ---------- */
  function buildComplete() {
    var row = document.getElementById("complete-row");
    if (!row || !current || !current.topic) return;
    row.className = "complete-row";
    row.innerHTML = '<p>Bu konudaki açıklamaları okuyup kontrol sorularını yanıtladıysan konuyu tamamlandı olarak işaretleyebilirsin. Kayıt yalnızca bu tarayıcıda tutulur; ad veya kişisel bilgi istenmez.</p>' +
      '<button class="btn primary" id="complete-btn" aria-pressed="false"></button>';
    document.getElementById("complete-btn").onclick = function () { setDone(pageId, !isDone(pageId)); syncCompleteBtn(); };
    syncCompleteBtn();
  }
  function syncCompleteBtn() {
    var b = document.getElementById("complete-btn");
    if (!b) return;
    var d = isDone(pageId);
    b.setAttribute("aria-pressed", d ? "true" : "false");
    b.innerHTML = d ? CHECK + " Tamamlandı (geri al)" : "Bu konuyu tamamladım";
    b.className = d ? "btn" : "btn primary";
  }

  /* ---------- Kaynak notları ---------- */
  function sourceLink(id) {
    var s = YZ.SOURCES[id];
    if (!s) { console.warn("Bilinmeyen kaynak:", id); return ""; }
    var label = esc(s.kurum) + " – " + esc(s.baslik);
    if (s.tur === "web") return '<a href="' + esc(s.url) + '" target="_blank" rel="noopener">' + label + '<span class="sr-only"> (yeni sekmede açılır)</span></a>';
    return '<a href="kaynaklar.html#k-' + id + '">' + label + '</a> <span class="kind">verilen dosya</span>';
  }
  YZ.sourceLink = sourceLink;
  function fillSources() {
    document.querySelectorAll(".src[data-src]").forEach(function (p) {
      var ids = p.getAttribute("data-src").split(",").map(function (x) { return x.trim(); }).filter(Boolean);
      p.innerHTML = "Kaynak: " + ids.map(sourceLink).join("; ");
    });
  }

  /* ---------- Kontrol soruları ----------
     <div class="quiz-q" data-answer="b"><fieldset><legend>..</legend>
       <label class="opt"><input type="radio" name=".." value="a"> metin</label> ...
       <div class="fb-data" hidden><p data-for="a">..</p>...</div></fieldset></div> */
  function initQuizzes() {
    var qs = document.querySelectorAll(".quiz-q");
    qs.forEach(function (q, idx) {
      var answer = q.getAttribute("data-answer");
      var fs = q.querySelector("fieldset");
      var inputs = q.querySelectorAll("input[type=radio]");
      inputs.forEach(function (inp) { inp.name = "q-" + pageId + "-" + idx; });
      var actions = el("div", { "class": "quiz-actions" });
      var check = el("button", { type: "button", "class": "btn primary" }, "Kontrol et");
      var retry = el("button", { type: "button", "class": "btn", hidden: "" }, "Yeniden dene");
      actions.appendChild(check); actions.appendChild(retry);
      var fb = el("div", { "class": "feedback", role: "status", "aria-live": "polite", hidden: "" });
      fs.appendChild(actions); fs.appendChild(fb);
      check.onclick = function () {
        var chosen = q.querySelector("input:checked");
        if (!chosen) { fb.hidden = false; fb.className = "feedback bad"; fb.innerHTML = "Önce bir seçenek işaretle."; return; }
        var ok = chosen.value === answer;
        var expl = q.querySelector('.fb-data [data-for="' + chosen.value + '"]');
        var gen = q.querySelector(".fb-data [data-for='all']");
        q.querySelectorAll(".opt").forEach(function (o) { o.classList.remove("is-correct", "is-wrong"); });
        chosen.closest(".opt").classList.add(ok ? "is-correct" : "is-wrong");
        fb.hidden = false;
        fb.className = "feedback " + (ok ? "good" : "bad");
        fb.innerHTML = '<span class="verdict"><span class="ic" aria-hidden="true">' + (ok ? CHECK : CROSS) + "</span>" + (ok ? "Doğru." : "Henüz değil.") + "</span> " +
          (expl ? expl.innerHTML : "") + (gen ? " " + gen.innerHTML : "");
        if (!ok) { retry.hidden = false; }
        else {
          retry.hidden = true;
          q.setAttribute("data-solved", "1");
          var p = getProg(); p[pageId] = p[pageId] || {}; p[pageId].quiz = p[pageId].quiz || {}; p[pageId].quiz[idx] = 1; setProg(p);
          var all = document.querySelectorAll(".quiz-q").length;
          var solved = Object.keys(getProg()[pageId].quiz || {}).length;
          if (current && current.topic && solved >= all && !isDone(pageId)) {
            setDone(pageId, true); syncCompleteBtn();
            fb.innerHTML += '<br><strong>Tüm kontrol sorularını çözdün; bu konu tamamlandı olarak işaretlendi.</strong>';
          }
        }
      };
      retry.onclick = function () {
        inputs.forEach(function (i) { i.checked = false; });
        q.querySelectorAll(".opt").forEach(function (o) { o.classList.remove("is-correct", "is-wrong"); });
        fb.hidden = true; retry.hidden = true; inputs[0].focus();
      };
    });
  }

  /* ---------- Arama ---------- */
  function norm(s) {
    return String(s).toLocaleLowerCase("tr")
      .replace(/[âà]/g, "a").replace(/[îı]/g, "i").replace(/[û]/g, "u")
      .replace(/ç/g, "c").replace(/ğ/g, "g").replace(/ö/g, "o").replace(/ş/g, "s").replace(/ü/g, "u")
      .replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();
  }
  YZ.norm = norm;
  var indexPrepared = null;
  function prepIndex() {
    if (indexPrepared) return indexPrepared;
    indexPrepared = (window.SEARCH_INDEX || []).map(function (e) {
      return { e: e, h: norm(e.heading + " " + e.pageTitle), t: norm(e.text) };
    });
    return indexPrepared;
  }
  function search(q) {
    var terms = norm(q).split(" ").filter(function (t) { return t.length > 1; });
    if (!terms.length) return [];
    var out = [];
    prepIndex().forEach(function (r) {
      var score = 0, all = true;
      terms.forEach(function (t) {
        var inH = r.h.indexOf(t) !== -1, inT = r.t.indexOf(t) !== -1;
        if (!inH && !inT) all = false;
        if (inH) score += 5;
        if (inT) score += 1 + Math.min(3, r.t.split(t).length - 2);
      });
      if (all) out.push({ r: r, s: score });
    });
    out.sort(function (a, b) { return b.s - a.s; });
    return out.slice(0, 12).map(function (x) { return x.r.e; });
  }
  function snippet(text, q) {
    var terms = norm(q).split(" ").filter(function (t) { return t.length > 1; });
    var n = norm(text);
    var pos = -1;
    for (var i = 0; i < terms.length && pos < 0; i++) pos = n.indexOf(terms[i]);
    // norm() karakter sayısını büyük ölçüde korur; yaklaşık konum yeterli
    var start = Math.max(0, pos - 60);
    var s = text.slice(start, start + 170);
    s = (start > 0 ? "…" : "") + s + (start + 170 < text.length ? "…" : "");
    var safe = esc(s);
    terms.forEach(function (t) {
      var re = new RegExp("(" + t.split("").map(function (c) {
        var m = { a: "[aâàAÂ]", c: "[cçCÇ]", g: "[gğGĞ]", i: "[iıîİI]", o: "[oöOÖ]", s: "[sşSŞ]", u: "[uüûUÜ]" };
        return m[c] || c.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      }).join("") + ")", "gi");
      safe = safe.replace(re, "<mark>$1</mark>");
    });
    return safe;
  }
  function initSearch() {
    var input = document.getElementById("q"), list = document.getElementById("search-results");
    if (!input) return;
    var sel = -1, items = [];
    function close() { list.hidden = true; input.setAttribute("aria-expanded", "false"); sel = -1; }
    function render() {
      var q = input.value;
      if (norm(q).length < 2) { close(); return; }
      var res = search(q);
      list.innerHTML = res.length ? res.map(function (e, i) {
        return '<li role="option" id="sr-' + i + '"><a href="' + e.url + '"><span class="r-page">' + esc(e.pageTitle) + '</span><span class="r-title">' + esc(e.heading) + '</span><span class="r-snip">' + snippet(e.text, q) + "</span></a></li>";
      }).join("") : '<li class="r-empty">Sonuç bulunamadı. Farklı bir kelime dene (ör. “veri”, “önyargı”, “şifre”).</li>';
      list.hidden = false; input.setAttribute("aria-expanded", "true");
      items = list.querySelectorAll("a"); sel = -1;
    }
    function move(d) {
      if (!items.length) return;
      if (sel >= 0) items[sel].removeAttribute("aria-selected");
      sel = (sel + d + items.length) % items.length;
      items[sel].setAttribute("aria-selected", "true");
      items[sel].scrollIntoView({ block: "nearest" });
      input.setAttribute("aria-activedescendant", "sr-" + sel);
    }
    input.addEventListener("input", render);
    input.addEventListener("focus", render);
    input.addEventListener("keydown", function (ev) {
      if (ev.key === "ArrowDown") { ev.preventDefault(); move(1); }
      else if (ev.key === "ArrowUp") { ev.preventDefault(); move(-1); }
      else if (ev.key === "Enter") { if (sel >= 0) { ev.preventDefault(); items[sel].click(); } else if (items.length) { ev.preventDefault(); items[0].click(); } }
      else if (ev.key === "Escape") { close(); input.blur(); }
    });
    document.addEventListener("click", function (ev) { if (!ev.target.closest(".header-search")) close(); });
    document.addEventListener("keydown", function (ev) {
      if (ev.key === "/" && !isTyping(ev.target)) { ev.preventDefault(); input.focus(); }
    });
  }
  function isTyping(t) { return t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.tagName === "SELECT" || t.isContentEditable); }

  /* ---------- Sunum modu ---------- */
  var MKEY = "yz-sunum";
  function setPresent(on) {
    body.classList.toggle("present", on);
    document.documentElement.classList.toggle("present-root", on);
    var b = document.getElementById("present-btn");
    if (b) { b.setAttribute("aria-pressed", on ? "true" : "false"); var l = b.querySelector(".lbl"); if (l) l.textContent = on ? "Sunumdan çık" : "Sunum modu"; }
    store.set(MKEY, on);
  }
  function buildPresentBar() {
    var bar = el("div", { "class": "present-bar", role: "toolbar", "aria-label": "Sunum denetimleri" });
    var i = current ? YZ.PAGES.indexOf(current) : -1;
    var opts = YZ.PAGES.map(function (p) { return '<option value="' + p.file + '"' + (p.id === pageId ? " selected" : "") + ">" + p.no + ". " + esc(p.short) + "</option>"; }).join("") +
      '<option value="' + YZ.TEACHER.file + '"' + (pageId === "ogretmen" ? " selected" : "") + ">Öğretmen rehberi</option>";
    bar.innerHTML =
      (i > 0 ? '<a class="btn" href="' + YZ.PAGES[i - 1].file + '">← Önceki</a>' : "") +
      '<label class="sr-only" for="jump">Konuya git</label><select id="jump">' + opts + "</select>" +
      (i >= 0 && i < YZ.PAGES.length - 1 ? '<a class="btn" href="' + YZ.PAGES[i + 1].file + '">Sonraki →</a>' : "") +
      '<button class="btn" type="button" id="present-exit">Sunumdan çık</button>';
    body.appendChild(bar);
    bar.querySelector("#jump").onchange = function () { location.href = this.value; };
    bar.querySelector("#present-exit").onclick = function () { setPresent(false); };
  }
  function initPresent() {
    var b = document.getElementById("present-btn");
    if (b) b.onclick = function () { setPresent(!body.classList.contains("present")); };
    var urlOn = /[?&]sunum=1/.test(location.search);
    setPresent(urlOn || store.get(MKEY, false));
    buildPresentBar();
    document.addEventListener("keydown", function (ev) {
      if (isTyping(ev.target) || ev.ctrlKey || ev.metaKey || ev.altKey) return;
      if (ev.key === "p" || ev.key === "P") setPresent(!body.classList.contains("present"));
      if (body.classList.contains("present") && current && current.no) {
        var i = YZ.PAGES.indexOf(current);
        if (ev.key === "ArrowRight" && ev.shiftKey && YZ.PAGES[i + 1]) location.href = YZ.PAGES[i + 1].file;
        if (ev.key === "ArrowLeft" && ev.shiftKey && YZ.PAGES[i - 1]) location.href = YZ.PAGES[i - 1].file;
      }
    });
  }

  /* ---------- Tema ---------- */
  function initTheme() {
    var t = store.get("yz-tema", null);
    if (t) document.documentElement.setAttribute("data-theme", t);
    var b = document.getElementById("theme-btn");
    if (b) b.onclick = function () {
      var cur = document.documentElement.getAttribute("data-theme") ||
        (window.matchMedia && matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
      var nx = cur === "dark" ? "light" : "dark";
      document.documentElement.setAttribute("data-theme", nx);
      store.set("yz-tema", nx);
    };
  }

  /* ---------- Mobil menü ---------- */
  function initMenu() {
    var b = document.getElementById("menu-btn");
    if (!b) return;
    b.onclick = function () {
      var open = !body.classList.contains("menu-open");
      body.classList.toggle("menu-open", open);
      b.setAttribute("aria-expanded", open ? "true" : "false");
      if (open) { var a = document.querySelector(".sidebar a"); if (a) a.focus(); }
    };
    document.addEventListener("keydown", function (ev) { if (ev.key === "Escape" && body.classList.contains("menu-open")) { body.classList.remove("menu-open"); b.setAttribute("aria-expanded", "false"); b.focus(); } });
    document.addEventListener("click", function (ev) {
      if (body.classList.contains("menu-open") && !ev.target.closest(".sidebar") && !ev.target.closest("#menu-btn")) { body.classList.remove("menu-open"); b.setAttribute("aria-expanded", "false"); }
    });
  }

  /* ---------- Hedefe gidince vurgula ---------- */
  function flashTarget() {
    if (!location.hash) return;
    var t = document.getElementById(decodeURIComponent(location.hash.slice(1)));
    if (!t) return;
    if (t.tagName === "DETAILS") t.open = true;
    var d = t.closest("details"); if (d) d.open = true;
    t.classList.add("flash");
  }

  function footer() {
    var f = document.getElementById("site-footer");
    if (!f) return;
    f.className = "site-footer";
    f.innerHTML = "Yapay Zekâyı Keşfet · 5–8. sınıflar için öğretim amaçlı site · Hesap ya da kişisel veri istemez; ilerleme yalnızca bu tarayıcıda saklanır. · <a href=\"kaynaklar.html\">Kaynaklar</a> · <a href=\"" + YZ.TEACHER.file + "\">Öğretmen rehberi</a>";
  }

  /* ---------- Başlat ---------- */
  buildHeader();
  buildSidebar();
  buildPager();
  buildComplete();
  fillSources();
  initQuizzes();
  initSearch();
  initPresent();
  initTheme();
  initMenu();
  footer();
  markVisited();
  refreshProgressUI();
  flashTarget();
  window.addEventListener("hashchange", flashTarget);
})();
