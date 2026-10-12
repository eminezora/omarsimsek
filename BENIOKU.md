# Yapay Zekâyı Keşfet — kullanım notu

5–8. sınıflar için Türkçe yapay zekâ öğrenme sitesi. Kurulum, hesap veya internet bağlantılı bir yapay zekâ servisi gerektirmez.

## Açmak

- **En kolay yol:** `index.html` dosyasına çift tıklayın; site tarayıcıda açılır.
- **Okul ağında veya internette yayımlamak:** Klasörün tamamını (`*.html`, `assets/`) herhangi bir statik web sunucusuna kopyalayın. Ek yazılım gerekmez.
- Yazı tipleri (Lexend, Noto Sans) Google Fonts'tan yüklenir. İnternet yoksa site bilgisayarın kendi yazı tipleriyle çalışır.

## Sınıfta

- **Sunum modu:** Üstteki düğme veya `P` tuşu. `Shift` + `→` / `←` ile konular arasında geçilir. Adresin sonuna `?sunum=1` eklenirse sayfa sunum modunda açılır.
- **Arama:** `/` tuşu.
- **Öğretmen rehberi:** `ogretmen.html` (ders akışları, tartışma soruları, değerlendirme).
- İlerleme bilgisi yalnızca o tarayıcıda (localStorage) tutulur; kişisel veri istenmez.

## İçeriği güncellemek

- Kaynak kayıtları `assets/js/data.js` dosyasındadır. Sayfalarda `<p class="src" data-src="kimlik"></p>` biçiminde kullanılır.
- Bir sayfayı değiştirdikten sonra arama dizinini yenileyin:

  ```
  python3 tools/build-search-index.py
  ```

  Betik, tanımsız kaynak kimliklerini ve kullanılmayan kaynakları da bildirir.
- İçerik haritası, incelenen kaynaklar ve kaynaklarda düzeltilen noktalar: `ICERIK-HARITASI.md`.

## Dosyalar

| Dosya | Konu |
|---|---|
| `index.html` | 1. Başlangıç |
| `nedir.html` … `iyi-komut.html` | 2–11. Konu sayfaları |
| `atolye.html` | 12. Simülasyonlar ve oyunlar |
| `sss.html` | 13. Merak edilen sorular (24 soru) |
| `kaynaklar.html` | 14. Tüm kaynaklar |
| `ogretmen.html` | Öğretmen rehberi |
| `assets/js/shapelab.js` | Şekil simülasyonlarının hesap motoru (k-en yakın komşu) |
| `assets/js/sims.js` | Etkileşimler |
| `assets/js/site.js` | Menü, arama, ilerleme, kontrol soruları, sunum modu |
