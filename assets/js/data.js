/* Sayfa listesi ve kaynak kayıtları. Kaynak notları ile kaynaklar sayfası bu listeden üretilir. */
window.YZ = window.YZ || {};

YZ.PAGES = [
  { id: "baslangic", file: "index.html", no: 1, title: "Başlangıç: Yapay zekâyı keşfet", short: "Başlangıç", desc: "Öğrenme yolu ve merak soruları" },
  { id: "nedir", file: "nedir.html", no: 2, title: "Yapay zekâ nedir, ne değildir?", short: "Yapay zekâ nedir?", desc: "Sıradan yazılım, otomasyon ve yapay zekâ farkı", topic: true },
  { id: "gunluk", file: "gunluk-yasam.html", no: 3, title: "Günlük yaşamda yapay zekâ", short: "Günlük yaşamda YZ", desc: "Öneri, çeviri, harita, görüntü tanıma, erişilebilirlik", topic: true },
  { id: "ogrenme", file: "nasil-ogrenir.html", no: 4, title: "Yapay zekâ nasıl öğrenir?", short: "Nasıl öğrenir?", desc: "Veri, etiket, örüntü, model, eğitim ve test", topic: true },
  { id: "sinir", file: "sinir-aglari.html", no: 5, title: "Yapay sinir ağlarının mantığı", short: "Yapay sinir ağları", desc: "Girdi, ağırlık, katman ve çıktı", topic: true },
  { id: "uretken", file: "uretken-yz.html", no: 6, title: "Üretken yapay zekâ nasıl çalışır?", short: "Üretken yapay zekâ", desc: "Metin, görsel, ses ve video üretimi", topic: true },
  { id: "hatalar", file: "hatalar.html", no: 7, title: "Yapay zekâ neden hata yapar?", short: "Neden hata yapar?", desc: "Eksik veri, belirsiz soru, uydurma bilgi", topic: true },
  { id: "onyargi", file: "onyargi.html", no: 8, title: "Veri, önyargı ve adalet", short: "Önyargı ve adalet", desc: "Tek taraflı veri neden sorun yaratır?", topic: true },
  { id: "gizlilik", file: "gizlilik.html", no: 9, title: "Gizlilik ve güvenli kullanım", short: "Gizlilik ve güvenlik", desc: "Kişisel veri ve paylaşım kuralları", topic: true },
  { id: "sorumlu", file: "sorumlu-kullanim.html", no: 10, title: "Yapay zekâyı sorumlu kullanmak", short: "Sorumlu kullanım", desc: "Ödev, kaynak, telif ve insan sorumluluğu", topic: true },
  { id: "komut", file: "iyi-komut.html", no: 11, title: "İyi bir soru veya komut nasıl yazılır?", short: "İyi komut yazmak", desc: "Amaç, bağlam, istenen çıktı, sınırlar", topic: true },
  { id: "atolye", file: "atolye.html", no: 12, title: "Yapay zekâ atölyesi", short: "Atölye", desc: "Simülasyonlar ve oyunlar" },
  { id: "sss", file: "sss.html", no: 13, title: "Merak edilen sorular", short: "Merak edilen sorular", desc: "24 soruya kısa cevaplar" },
  { id: "kaynaklar", file: "kaynaklar.html", no: 14, title: "Tüm kaynaklar", short: "Tüm kaynaklar", desc: "Kullanılan kaynakların listesi" }
];
YZ.TEACHER = { id: "ogretmen", file: "ogretmen.html", title: "Öğretmen rehberi", short: "Öğretmen rehberi" };

/* tur: "dosya" = kullanıcının verdiği, internette açık adresi olmayan kaynak; "web" = çevrim içi kaynak */
YZ.ACCESS = "12 Ekim 2026";
YZ.SOURCES = {
  /* ---- Verilen dosyalar ---- */
  "aof-giris": {
    tur: "dosya", kurum: "Anadolu Üniversitesi Açıköğretim Fakültesi", yazar: "Dr. Melike Palsü Kurt",
    baslik: "Yapay Zekâya Giriş (YZE101U) – Kitap özeti (EPUB)", yil: "2026",
    not: "Kullanıcının verdiği dosya. EPUB üst verisinde tarih 29.09.2026.",
    konu: "YZ tanımı, zekâ ve bilinç ayrımı, veri, önyargı, mahremiyet, makine öğrenmesi, derin öğrenme, büyük dil modelleri, otomasyon yanılgısı"
  },
  "aof-matematik": {
    tur: "dosya", kurum: "Anadolu Üniversitesi Açıköğretim Fakültesi", yazar: "Ed. Prof. Dr. Gözde Özkan Tükel, Prof. Dr. Tunahan Turhan",
    baslik: "Yapay Zekâ İçin Matematik (ders kitabı, PDF)", yil: "2026",
    not: "Kullanıcının verdiği dosya.",
    konu: "Veri–model–algoritma–tahmin, parametreler, genelleme, aşırı uyum, eğitim/test ayrımı, Cahit Arf"
  },
  "meb-derin": {
    tur: "dosya", kurum: "MEB Yenilik ve Eğitim Teknolojileri Genel Müdürlüğü, Dijital Beceriler Daire Başkanlığı",
    baslik: "Derin Öğrenme – Yapay Zekâ Uygulamaları Eğitici Eğitimi Kursu sunumu (31 Ağustos–4 Eylül 2026)", yil: "2026",
    not: "Kullanıcının verdiği dosya. 14. slayttaki model parametre tahminleri doğrulanamadığı için kullanılmadı.",
    konu: "Yapay nöron, ağırlık, eşik, VE/VEYA/XOR örnekleri, öğrenme döngüsü"
  },
  "meb-makine": {
    tur: "dosya", kurum: "MEB Yenilik ve Eğitim Teknolojileri Genel Müdürlüğü, Dijital Beceriler Daire Başkanlığı",
    baslik: "Makine Öğrenmesi – Yapay Zekâ Uygulamaları Eğitici Eğitimi Kursu sunumu (5–9 Ekim 2026, Antalya)", yil: "2026",
    not: "Kullanıcının verdiği dosya.",
    konu: "Makine öğrenmesi adımları, eğitim/test ayrımı, aşırı uyum, k-en yakın komşu"
  },
  "meb-antalya": {
    tur: "dosya", kurum: "MEB Yenilik ve Eğitim Teknolojileri Genel Müdürlüğü",
    baslik: "Yapay Zekâ ile Öğrenme Nasıl Değişiyor? (eğitici eğitimi sunumu, Antalya)", yil: "2026",
    not: "Kullanıcının verdiği dosya. Araç karşılaştırma slaytları hızla eskiyen ürün bilgisi içerdiği için kullanılmadı.",
    konu: "Temel kavramlar, sık karıştırılan kavramlar, token süreci, komut bileşenleri, etik ve güvenli kullanım"
  },
  "seminer": {
    tur: "dosya", kurum: "MEB ve BTK Akademi – TYMM Yapay Zekâ Okuryazarlığı Programı", yazar: "Fatih Kallem, Orhan Yenay",
    baslik: "Yapay Zekâ Farkındalık Semineri (etkileşimli HTML sunum)", yil: "Yayın tarihi belirtilmemiş",
    not: "Kullanıcının verdiği dosya. Model/fiyat tablosu ve bazı genellemeler düzeltilerek kullanıldı.",
    konu: "Tarihçe, belirsiz komut, kopya mı destek mi, deepfake, halüsinasyon, paylaşım kuralları"
  },

  /* ---- Web kaynakları ---- */
  "oecd-tanim": {
    tur: "web", kurum: "OECD.AI", baslik: "Updates to the OECD's definition of an AI system explained", yil: "2023 (29 Kasım)",
    url: "https://oecd.ai/en/wonk/ai-system-definition-update", konu: "Yapay zekâ sisteminin tanımı"
  },
  "unesco-ogrenci": {
    tur: "web", kurum: "UNESCO", yazar: "F. Miao, K. Shiohira, N. Lao", baslik: "AI competency framework for students", yil: "2024",
    url: "https://www.unesco.org/en/articles/ai-competency-framework-students",
    not: "Tanıtım sayfası okundu; Türkçe dahil birçok dilde yayımlandığı belirtiliyor. Tam metin (unesdoc) bot koruması nedeniyle açılamadı.",
    konu: "Öğrenciler için YZ yetkinlikleri, sorumlu kullanım"
  },
  "unesco-uretken": {
    tur: "web", kurum: "UNESCO", baslik: "Guidance for generative AI in education and research", yil: "2023",
    url: "https://www.unesco.org/en/articles/guidance-generative-ai-education-and-research",
    konu: "Üretken YZ, veri gizliliği, üretken YZ platformları için yaş sınırı önerisi"
  },
  "unesco-etik": {
    tur: "web", kurum: "UNESCO", baslik: "Ethics of Artificial Intelligence – Recommendation on the Ethics of AI", yil: "2021 (tavsiye kararı)",
    url: "https://www.unesco.org/en/artificial-intelligence/recommendation-ethics", konu: "Etik ilkeler, insan denetimi, adalet"
  },
  "unicef": {
    tur: "web", kurum: "UNICEF Innocenti", baslik: "Guidance on AI and children (Version 3.0)", yil: "2025 (Aralık)",
    url: "https://www.unicef.org/innocenti/reports/policy-guidance-ai-children", konu: "Çocukların verisi, gizliliği, güvenliği ve hakları"
  },
  "meb-politika": {
    tur: "web", kurum: "T.C. Millî Eğitim Bakanlığı", baslik: "Eğitimde Yapay Zekâ Politika Belgesi ve Eylem Planı (2025–2029)", yil: "2025",
    url: "https://yegitek.meb.gov.tr/meb_iys_dosyalar/2025_06/17092340_egitimdeyapayzekapolitikabelgesiveeylemplani202520291.pdf",
    konu: "Eğitimde YZ kullanımında veri gizliliği, algoritmik önyargı, şeffaflık"
  },
  "meb-politika-haber": {
    tur: "web", kurum: "T.C. Millî Eğitim Bakanlığı", baslik: "\"Eğitimde Yapay Zekâ Politika Belgesi ve Eylem Planı\" yürürlüğe girdi (haber)", yil: "2025 (17 Haziran)",
    url: "https://www.meb.gov.tr/egitimde-yapay-zeka-politika-belgesi-ve-eylem-plani-yururluge-girdi/haber/37531/tr",
    konu: "Politika belgesinin kapsamı: 4 hedef, 15 politika, 40 eylem"
  },
  "kvkk": {
    tur: "web", kurum: "T.C. Mevzuat Bilgi Sistemi", baslik: "6698 sayılı Kişisel Verilerin Korunması Kanunu (madde 3 ve 6)", yil: "2016 (kabul: 24.3.2016)",
    url: "https://www.mevzuat.gov.tr/MevzuatMetin/1.5.6698.pdf", konu: "Kişisel veri ve özel nitelikli kişisel veri tanımları"
  },
  "gml-ayirma": {
    tur: "web", kurum: "Google for Developers – Machine Learning Crash Course", baslik: "Datasets: Dividing the original dataset", yil: "Tarih belirtilmemiş",
    url: "https://developers.google.com/machine-learning/crash-course/overfitting/dividing-datasets", konu: "Eğitim, doğrulama ve test kümeleri"
  },
  "gml-asiri": {
    tur: "web", kurum: "Google for Developers – Machine Learning Crash Course", baslik: "Overfitting", yil: "Tarih belirtilmemiş",
    url: "https://developers.google.com/machine-learning/crash-course/overfitting/overfitting", konu: "Aşırı uyum ve genelleme"
  },
  "gml-dengesiz": {
    tur: "web", kurum: "Google for Developers – Machine Learning Crash Course", baslik: "Datasets: Imbalanced datasets", yil: "Tarih belirtilmemiş",
    url: "https://developers.google.com/machine-learning/crash-course/overfitting/imbalanced-datasets", konu: "Dengesiz veri kümeleri"
  },
  "gml-sinir": {
    tur: "web", kurum: "Google for Developers – Machine Learning Crash Course", baslik: "Neural networks: Nodes and hidden layers", yil: "Tarih belirtilmemiş",
    url: "https://developers.google.com/machine-learning/crash-course/neural-networks/nodes-hidden-layers", konu: "Nöron, ağırlık, gizli katman hesabı"
  },
  "gml-llm": {
    tur: "web", kurum: "Google for Developers – Machine Learning Crash Course", baslik: "LLMs: What's a large language model?", yil: "Tarih belirtilmemiş",
    url: "https://developers.google.com/machine-learning/crash-course/llm/transformers", konu: "Token, dil modelinin tahmin etmesi, halüsinasyon"
  },
  "gml-onyargi": {
    tur: "web", kurum: "Google for Developers – Machine Learning Crash Course", baslik: "Fairness: Types of bias", yil: "Tarih belirtilmemiş",
    url: "https://developers.google.com/machine-learning/crash-course/fairness/types-of-bias", konu: "Seçim yanlılığı, kapsama yanlılığı, otomasyon yanlılığı"
  },
  "gml-dogruluk": {
    tur: "web", kurum: "Google for Developers – Machine Learning Crash Course", baslik: "Classification: Accuracy, recall, precision, and related metrics", yil: "Tarih belirtilmemiş",
    url: "https://developers.google.com/machine-learning/crash-course/classification/accuracy-precision-recall", konu: "Doğruluk oranının dengesiz veride yanıltıcı olabilmesi"
  },
  "nist": {
    tur: "web", kurum: "NIST (ABD Ulusal Standartlar ve Teknoloji Enstitüsü)", baslik: "NIST Study Evaluates Effects of Race, Age, Sex on Face Recognition Software", yil: "2019 (19 Aralık)",
    url: "https://www.nist.gov/news-events/news/2019/12/nist-study-evaluates-effects-race-age-sex-face-recognition-software",
    konu: "Yüz tanıma algoritmalarında hata oranlarının gruplara ve algoritmaya göre değişebilmesi"
  },
  "kalai": {
    tur: "web", kurum: "arXiv", yazar: "A. T. Kalai, O. Nachum, S. S. Vempala, E. Zhang", baslik: "Why Language Models Hallucinate", yil: "2025",
    url: "https://arxiv.org/abs/2509.04664", konu: "Dil modellerinin emin olmadığında tahmin yürütmesi (halüsinasyon)"
  },
  "ibm-halusinasyon": {
    tur: "web", kurum: "IBM", baslik: "What Are AI Hallucinations?", yil: "Tarih belirtilmemiş",
    url: "https://www.ibm.com/think/topics/ai-hallucinations", konu: "Halüsinasyon kavramı"
  },
  "ibm-sinir": {
    tur: "web", kurum: "IBM", baslik: "What Is a Neural Network?", yil: "Tarih belirtilmemiş",
    url: "https://www.ibm.com/think/topics/neural-networks", konu: "Sinir ağlarının biyolojik esin kaynağı, McCulloch–Pitts (1943), Rosenblatt (1958)"
  },
  "deepmind-trafik": {
    tur: "web", kurum: "Google DeepMind", baslik: "Traffic prediction with advanced Graph Neural Networks", yil: "2020 (3 Eylül)",
    url: "https://deepmind.google/discover/blog/traffic-prediction-with-advanced-graph-neural-networks/", konu: "Harita uygulamalarında varış süresi tahmini"
  },
  "youtube-oneri": {
    tur: "web", kurum: "YouTube Resmî Blogu", yazar: "Cristos Goodrow", baslik: "On YouTube's recommendation system", yil: "2021 (15 Eylül)",
    url: "https://blog.youtube/inside-youtube/on-youtubes-recommendation-system/", konu: "Öneri sistemlerinin işleyişi"
  },
  "seeing-ai": {
    tur: "web", kurum: "Microsoft", baslik: "Seeing AI – A Visual Assistant for the Blind", yil: "Tarih belirtilmemiş",
    url: "https://www.seeingai.com/", konu: "Görme engelliler için görüntüyü sesli betimleyen uygulama"
  },
  "ab-ogretmen": {
    tur: "web", kurum: "Avrupa Komisyonu", baslik: "Ethical guidelines on the use of AI and data in teaching and learning for educators", yil: "2022",
    url: "https://op.europa.eu/en/publication-detail/-/publication/d81a0d54-5348-11ed-92ed-01aa75ed71a1", konu: "Öğretmenler için YZ ve veri etiği"
  },
  "ai4k12": {
    tur: "web", kurum: "AI4K12 (AAAI ve CSTA)", baslik: "Five Big Ideas in AI", yil: "Tarih belirtilmemiş",
    url: "https://ai4k12.org/", konu: "Okullarda YZ öğretimi için beş büyük fikir"
  },
  "elements": {
    tur: "web", kurum: "Elements of AI", baslik: "A free online introduction to artificial intelligence for non-experts", yil: "Tarih belirtilmemiş (kurs 2018'de başladı)",
    url: "https://www.elementsofai.com/", konu: "Yeni başlayanlar için ek öğrenme kaynağı"
  },
  "tf-playground": {
    tur: "web", kurum: "TensorFlow", baslik: "A Neural Network Playground", yil: "Tarih belirtilmemiş",
    url: "https://playground.tensorflow.org/", konu: "Tarayıcıda sinir ağı deneme ortamı (ileri düzey)"
  },
  "transformer-explainer": {
    tur: "web", kurum: "Georgia Tech Polo Club", baslik: "Transformer Explainer: LLM Transformer Model Visually Explained", yil: "Tarih belirtilmemiş",
    url: "https://poloclub.github.io/transformer-explainer/", konu: "Dil modelinin sonraki token olasılıklarını görselleştirme (ileri düzey)"
  }
};
