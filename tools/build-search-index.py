#!/usr/bin/env python3
"""Arama dizinini ve kaynak kullanım listesini üretir.

Kullanım:  python3 tools/build-search-index.py
Çıktı:     assets/js/search-index.js

Her sayfanın <main> içeriği h2 başlıklarına göre bölümlere ayrılır; SSS sayfasında
her soru (details[id]) ayrı bir kayıt olur. Etkinliklerin JSON verisindeki metinler de
aranabilir hâle getirilir. Ayrıca hangi kaynağın (data-src) hangi sayfada kullanıldığı
listelenir ve data.js'de tanımlı olmayan kaynak kimlikleri için uyarı verilir.
"""
import html
import json
import re
import sys
from html.parser import HTMLParser
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
PAGES = [
    "index.html", "nedir.html", "gunluk-yasam.html", "nasil-ogrenir.html", "sinir-aglari.html",
    "uretken-yz.html", "hatalar.html", "onyargi.html", "gizlilik.html", "sorumlu-kullanim.html",
    "iyi-komut.html", "atolye.html", "sss.html", "kaynaklar.html", "ogretmen.html",
]
SKIP_TAGS = {"style", "svg", "button", "nav", "header", "footer"}


class Extractor(HTMLParser):
    def __init__(self, file, page_title):
        super().__init__(convert_charrefs=True)
        self.file, self.page_title = file, page_title
        self.in_main = False
        self.skip_tag, self.skip_nest = None, 0
        self.sections = []
        self.cur = None
        self.capture = None
        self.buf = []
        self.pending_id = ""
        self.in_json = False
        self.json_buf = []
        self.sources = set()

    def new_section(self, sid, heading):
        self.cur = {"id": sid, "heading": heading, "text": []}
        self.sections.append(self.cur)

    def note_sources(self, attrs):
        a = dict(attrs)
        for s in a.get("data-src", "").split(","):
            if s.strip():
                self.sources.add(s.strip())

    def handle_starttag(self, tag, attrs):
        self.note_sources(attrs)
        a = dict(attrs)
        if self.skip_tag:
            if tag == self.skip_tag:
                self.skip_nest += 1
            return
        if tag == "main":
            self.in_main = True
            self.new_section("", self.page_title)
            return
        if not self.in_main:
            return
        if tag == "script":
            if a.get("type") == "application/json":
                self.in_json, self.json_buf = True, []
            else:
                self.skip_tag, self.skip_nest = tag, 1
            return
        if tag in SKIP_TAGS:
            self.skip_tag, self.skip_nest = tag, 1
            return
        if tag == "h2":
            self.capture, self.buf, self.pending_id = "h2", [], a.get("id", "")
        elif tag == "details" and self.file == "sss.html" and a.get("id"):
            self.new_section(a["id"], "")
        elif tag == "summary" and self.file == "sss.html":
            self.capture, self.buf = "summary", []

    def handle_startendtag(self, tag, attrs):
        self.note_sources(attrs)

    def handle_endtag(self, tag):
        if self.skip_tag:
            if tag == self.skip_tag:
                self.skip_nest -= 1
                if self.skip_nest == 0:
                    self.skip_tag = None
            return
        if not self.in_main:
            return
        if tag == "main":
            self.in_main = False
            return
        if self.in_json and tag == "script":
            self.in_json = False
            try:
                data = json.loads("".join(self.json_buf))
                for it in data.get("items", []):
                    self.cur["text"].append(re.sub(r"<[^>]+>", " ", it.get("q", "") + " " + it.get("fb", "")))
            except json.JSONDecodeError as e:
                print(f"UYARI: {self.file} içinde JSON okunamadı: {e}", file=sys.stderr)
            return
        if self.capture == "h2" and tag == "h2":
            self.new_section(self.pending_id, " ".join("".join(self.buf).split()))
            self.capture = None
        elif self.capture == "summary" and tag == "summary":
            self.cur["heading"] = re.sub(r"^\d+\.\s*", "", " ".join("".join(self.buf).split()))
            self.capture = None
        elif tag == "details" and self.file == "sss.html" and self.cur and self.cur["id"].startswith("s-"):
            self.new_section("", "Merak edilen sorular")

    def handle_data(self, data):
        if not self.in_main or self.skip_tag:
            return
        if self.in_json:
            self.json_buf.append(data)
        elif self.capture:
            self.buf.append(data)
        elif self.cur is not None:
            self.cur["text"].append(data)


def main():
    data_js = (ROOT / "assets/js/data.js").read_text(encoding="utf-8")
    known = set(re.findall(r'^\s*"([a-z0-9-]+)":\s*\{', data_js, re.M))
    entries, usage, problems = [], {}, []
    for f in PAGES:
        src = (ROOT / f).read_text(encoding="utf-8")
        m = re.search(r"<title>(.*?)</title>", src, re.S)
        title = html.unescape(m.group(1)).split(" · ")[0].strip() if m else f
        ex = Extractor(f, title)
        ex.feed(src)
        for sid in sorted(ex.sources):
            usage.setdefault(sid, []).append(f)
            if sid not in known:
                problems.append(f"{f}: tanımsız kaynak kimliği '{sid}'")
        for sec in ex.sections:
            text = " ".join(" ".join(sec["text"]).split())
            if not text and not sec["heading"]:
                continue
            if len(text) < 20 and not sec["id"]:
                continue
            entries.append({
                "url": f + ("#" + sec["id"] if sec["id"] else ""),
                "pageTitle": title,
                "heading": sec["heading"] or title,
                "text": text[:1500],
            })
    for sid in sorted(known - set(usage)):
        problems.append(f"Kaynak hiçbir sayfada kullanılmıyor: '{sid}'")
    out = ROOT / "assets/js/search-index.js"
    out.write_text(
        "/* Bu dosya tools/build-search-index.py ile otomatik üretilir; elle düzenlemeyin. */\n"
        "window.SEARCH_INDEX = " + json.dumps(entries, ensure_ascii=False) + ";\n"
        "window.YZ = window.YZ || {};\n"
        "YZ.SOURCE_USAGE = " + json.dumps(usage, ensure_ascii=False) + ";\n",
        encoding="utf-8",
    )
    print(f"{len(entries)} arama kaydı, {len(usage)} kaynak kullanımı yazıldı → {out.relative_to(ROOT)}")
    for p in problems:
        print("UYARI:", p)
    return 1 if any("tanımsız" in p for p in problems) else 0


if __name__ == "__main__":
    sys.exit(main())
