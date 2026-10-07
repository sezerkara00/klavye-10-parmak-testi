/**
 * ASCII Türkçe Kelime Havuzu (Türkçe karakterler içermeyen kelimeler)
 * "başhekim" -> "bashekim", "öğretmen" -> "ogretmen", vb.
 */

// Türkçe karakterleri ASCII karşılıklarına dönüştüren yardımcı fonksiyon
function turkceToAscii(metin) {
  const harfHaritası = {
    'ç': 'c', 'Ç': 'c',
    'ğ': 'g', 'Ğ': 'g',
    'ı': 'i', 'I': 'i', 'İ': 'i', 'i': 'i',
    'ö': 'o', 'Ö': 'o',
    'ş': 's', 'Ş': 's',
    'ü': 'u', 'Ü': 'u'
  };
  return metin.replace(/[çÇğĞıIİiöÖşŞüÜ]/g, harf => harfHaritası[harf] || harf).toLowerCase();
}

const KELIME_HAVUZU = {
  // En popüler, dengeli Türkçe ASCII kelimeler (kullanıcının istediği gibi "bashekim" tarzı)
  genel: [
    "bashekim", "ogretmen", "ogrenci", "bilgisayar", "yazilim", "gelistirme", "programlama",
    "calisma", "arkadas", "kitap", "defter", "kalem", "yagmur", "ruzgar", "gokyuzu",
    "gunes", "bulut", "deniz", "dag", "orman", "agac", "cicek", "yaprak", "bahce",
    "sehir", "sokak", "cadde", "mahalle", "bina", "kapi", "pencere", "oda", "masa",
    "sandalye", "koltuk", "yatak", "mutfak", "banyo", "yemek", "kahvalti", "aksam",
    "sabah", "ogle", "gece", "zaman", "saat", "dakika", "saniye", "hafta", "ay",
    "mevsim", "bahar", "sonbahar", "kis", "sicak", "soguk", "ilik", "serin", "hava",
    "yolculuk", "araba", "otobus", "tren", "ucak", "gemi", "bisiklet", "durak", "istasyon",
    "havaalani", "liman", "kopru", "meydan", "park", "carşı", "pazar", "magaza", "dukkan",
    "alisveris", "para", "fiyat", "hesap", "odeme", "banka", "kredi", "cuzdan", "kart",
    "insan", "cocuk", "genc", "yasli", "kadin", "erkek", "anne", "baba", "kardes",
    "abla", "agabey", "dede", "nine", "amca", "dayi", "hala", "teyze", "kuzen",
    "aile", "akraba", "komsu", "dost", "tanidik", "misafir", "topluluk", "millet", "devlet",
    "vatan", "bayrak", "toprak", "tarih", "kultur", "sanat", "muzik", "resim", "tiyatro",
    "sinema", "oyun", "spor", "futbol", "basketbol", "voleybol", "yuzme", "kosu", "yuruyus",
    "saglik", "hastane", "doktor", "hemsire", "ilac", "eczane", "tedavi", "muayene", "ameliyat",
    "rahatsizlik", "sifa", "nefes", "kalp", "beyin", "goz", "kulak", "burun", "agiz",
    "dis", "el", "kol", "bacak", "ayak", "parmak", "omuz", "boyun", "sac",
    "dusunce", "fikir", "akil", "zeka", "mantik", "hayal", "ruya", "umut", "hedef",
    "arzu", "istek", "karar", "secim", "sonuc", "neden", "sebep", "firsat", "engel",
    "sorun", "cozum", "tecrube", "deneyim", "bilgi", "ogrenme", "egitim", "okul", "sinif",
    "ders", "sinav", "basari", "kazanc", "odul", "ceza", "kural", "kanun", "adalet",
    "hak", "hukuk", "mahkeme", "avukat", "hakim", "savci", "polis", "guvenlik", "huzur",
    "baris", "ozgurluk", "bagimsizlik", "esitlik", "sevgi", "saygi", "hosgoru", "yardim", "iyilik",
    "guzellik", "dogruluk", "durustluk", "guven", "sadakat", "vefa", "merhamet", "vicdan", "samimiyet",
    "neseli", "mutlu", "huzurlu", "sakin", "dingin", "heyecanli", "coskulu", "merakli", "istekli",
    "caliskan", "azimle", "sabirli", "guclu", "cesur", "kahraman", "yetkin", "becerikli", "yetenekli",
    "kolay", "zor", "basit", "karmasik", "hizli", "yavas", "cabuk", "erken", "gec",
    "yeni", "eski", "guncel", "modern", "geleneksel", "farkli", "ayni", "benzer", "ozel",
    "genel", "onemli", "degerli", "kiymetli", "gerekli", "zorunlu", "faydali", "yararli", "etkili",
    "verimli", "basarili", "kusursuz", "mukemmel", "harika", "enfes", "leziz", "tatli", "tuzlu",
    "aci", "eksi", "taze", "sicaklik", "parlak", "aydinlik", "karanlik", "golge", "isik",
    "renk", "kirmizi", "mavi", "sari", "yesil", "turuncu", "mor", "pembe", "beyaz",
    "siyah", "gri", "kahverengi", "lacivert", "gumus", "altin", "elmas", "inci", "yakut",
    "telefon", "tablet", "televizyon", "radyo", "hoparlor", "kulaklik", "kamera", "fotograf", "video",
    "internet", "web", "tarayici", "arama", "motoru", "sayfa", "baglanti", "adres", "mesaj",
    "e-posta", "bildirim", "haber", "bulten", "gazete", "dergi", "makale", "yazi", "yorum",
    "begen", "paylas", "kaydet", "indir", "yukle", "gonder", "alici", "iletisim", "sohbet",
    "konusma", "dinleme", "okuma", "yazma", "anlama", "anlatma", "ifade", "sozcuk", "kelime",
    "cumle", "paragraf", "metin", "baslik", "konu", "anahtar", "kilit", "sifre", "guvenli",
    "giris", "cikis", "baslat", "durdur", "bitir", "yenile", "temizle", "duzenle", "sil",
    "ekle", "cikar", "bol", "carp", "topla", "hesapla", "olcum", "miktar", "sayi",
    "rakam", "oran", "yuzde", "derece", "seviye", "kademe", "asamali", "adim", "surec",
    "proje", "plan", "program", "takvim", "gorev", "sorumluluk", "rol", "ekip", "takim",
    "birlik", "beraberlik", "dayanisma", "isbirligi", "anlasma", "sozlesme", "ortaklik", "sirket", "firma",
    "kurum", "kurulus", "vakif", "dernek", "odasi", "birlik", "merkez", "sube", "ofis",
    "buro", "fabrika", "atolyeler", "uretim", "tuketim", "ticaret", "ekonomi", "piyasa", "borsa",
    "yatirim", "sermaye", "gelir", "gider", "butce", "tasarruf", "kazanc", "zarar", "kar",
    "fatura", "fis", "makbuz", "belge", "evrak", "dosya", "rapor", "sunum", "toplanti",
    "gorusme", "mulakat", "ziyaret", "davet", "etkinlik", "organizasyon", "kutlama", "toren", "bayram",
    "tatil", "dinlenme", "eglence", "gezi", "seyahat", "turizm", "otel", "pansiyon", "kamp",
    "doga", "cevre", "iklim", "ekoloji", "canli", "hayvan", "bitki", "kus", "balik",
    "kedi", "kopek", "at", "kuzu", "koyun", "inek", "tavuk", "horoz", "ordek",
    "aslan", "kaplan", "ayi", "kurt", "tilki", "tavsan", "sincap", "kartal", "sahin",
    "guvercin", "kumru", "serce", "marti", "leylek", "yunus", "balina", "kopekbaligi", "akvaryum",
    "elma", "armut", "muz", "portakal", "mandalina", "limon", "uzum", "incir", "kavun",
    "karpuz", "cilek", "kiraz", "visne", "erik", "kayisi", "seftali", "nar", "ceviz",
    "findik", "fistik", "badem", "domates", "biber", "patlican", "salatalik", "kabak", "patates",
    "sogan", "sarimsak", "havuc", "marul", "ispanak", "pirasa", "lahana", "fasulye", "nohut",
    "mercimek", "bulgur", "pirinc", "makarna", "ekmek", "corek", "borek", "pasta", "tatli",
    "seker", "tuz", "karabiber", "nane", "kekik", "pulbiber", "zeytinyagi", "tereyagi", "sut",
    "yogurt", "peynir", "ayran", "cay", "kahve", "su", "meyvesuyu", "gazoz", "madensuyu"
  ],

  // Kısa ve tempolu kelimeler (yüksek WPM antrenmanı için)
  kisa: [
    "ben", "sen", "o", "biz", "siz", "onlar", "bu", "su", "o", "bir", "iki", "uc",
    "dort", "bes", "alti", "yedi", "sekiz", "dokuz", "on", "cok", "az", "iyi", "kotu",
    "var", "yok", "gel", "git", "al", "ver", "bak", "gor", "duy", "bil", "bul",
    "sev", "sor", "yaz", "oku", "kos", "dur", "ac", "kapa", "ic", "ye", "uyu",
    "kalk", "otur", "at", "tut", "sec", "cek", "bas", "kir", "kur", "vur", "sur",
    "ev", "is", "yol", "yer", "el", "kol", "goz", "dis", "bas", "dil", "kan",
    "gun", "ay", "yil", "an", "ses", "soz", "ad", "can", "ruh", "akil", "hak",
    "son", "ilk", "tam", "tek", "bos", "dolu", "zor", "dar", "gen", "sag", "sol",
    "ust", "alt", "on", "arka", "ic", "dis", "orta", "hiz", "renk", "guc", "tat",
    "koku", "his", "fark", "kural", "not", "sira", "grup", "tim", "ekip", "kart"
  ],

  // Uzun & zorlayıcı kelimeler (10 parmak reflekslerini geliştirmek için)
  zorlayici: [
    "bashekimlik", "programlamacilik", "degerlendirilebilirlik", "sorumluluklarimizdan",
    "gerceklestirilmesi", "surdurulebilirlik", "kisilestirilebilir", "kutuphanecilik",
    "cumhurbaskanligi", "gelistiricilerimiz", "organizasyonel", "verimlilestirmek",
    "bilgilendirme", "yapilandirma", "standardizasyon", "senkronizasyon", "entegrasyon",
    "faydalanamayanlar", "karsilastirma", "degistirebilmek", "yayginlastirmak",
    "somutlastirilmis", "ozellestirilmis", "mukemmelliyetcilik", "yetkilendirilmis",
    "bagimsizliklarimiz", "caliskanligimiz", "hemsirelik", "muhendislik", "ogretmenlik"
  ],

  // Teknoloji ve Yazılım Terimleri (ASCII Türkçe)
  teknoloji: [
    "bilgisayar", "yazilim", "donanim", "algoritma", "kodlama", "programlama", "veri",
    "veritabani", "sunucu", "istemci", "internet", "ag", "guvenlik", "sifreleme",
    "islemci", "bellek", "ekrankarti", "klavye", "fare", "kulaklik", "monitor",
    "yapayzeka", "makineogrenimi", "derinogrenme", "fonksiyon", "degisken", "dongu",
    "nesne", "sinif", "arayuz", "bilesen", "modul", "paket", "kutuphane", "cerceve",
    "terminal", "konsol", "komut", "dosya", "dizin", "surum", "depo", "dal", "birlestir",
    "hataayiklama", "test", "derleyici", "yorumlayici", "istek", "yanit", "protokol"
  ]
};

// Parmak eşleşmeleri (Türkçe Q Klavye için 10 Parmak düzeni)
// 0: Sol Serçe, 1: Sol Yüzük, 2: Sol Orta, 3: Sol İşaret, 4: Başparmaklar (Space),
// 5: Sağ İşaret, 6: Sağ Orta, 7: Sağ Yüzük, 8: Sağ Serçe
const PARMAK_REHBERI = {
  // Sol El
  'q': { parmak: 0, ad: 'Sol Serce', renk: '#ec4899', el: 'sol' },
  'a': { parmak: 0, ad: 'Sol Serce', renk: '#ec4899', el: 'sol' },
  'z': { parmak: 0, ad: 'Sol Serce', renk: '#ec4899', el: 'sol' },
  '1': { parmak: 0, ad: 'Sol Serce', renk: '#ec4899', el: 'sol' },

  'w': { parmak: 1, ad: 'Sol Yuzuk', renk: '#f97316', el: 'sol' },
  's': { parmak: 1, ad: 'Sol Yuzuk', renk: '#f97316', el: 'sol' },
  'x': { parmak: 1, ad: 'Sol Yuzuk', renk: '#f97316', el: 'sol' },
  '2': { parmak: 1, ad: 'Sol Yuzuk', renk: '#f97316', el: 'sol' },

  'e': { parmak: 2, ad: 'Sol Orta', renk: '#eab308', el: 'sol' },
  'd': { parmak: 2, ad: 'Sol Orta', renk: '#eab308', el: 'sol' },
  'c': { parmak: 2, ad: 'Sol Orta', renk: '#eab308', el: 'sol' },
  '3': { parmak: 2, ad: 'Sol Orta', renk: '#eab308', el: 'sol' },

  'r': { parmak: 3, ad: 'Sol Isaret', renk: '#10b981', el: 'sol' },
  't': { parmak: 3, ad: 'Sol Isaret', renk: '#10b981', el: 'sol' },
  'f': { parmak: 3, ad: 'Sol Isaret (Anahtar)', renk: '#10b981', el: 'sol', home: true },
  'g': { parmak: 3, ad: 'Sol Isaret', renk: '#10b981', el: 'sol' },
  'v': { parmak: 3, ad: 'Sol Isaret', renk: '#10b981', el: 'sol' },
  'b': { parmak: 3, ad: 'Sol Isaret', renk: '#10b981', el: 'sol' },
  '4': { parmak: 3, ad: 'Sol Isaret', renk: '#10b981', el: 'sol' },
  '5': { parmak: 3, ad: 'Sol Isaret', renk: '#10b981', el: 'sol' },

  // Başparmaklar
  ' ': { parmak: 4, ad: 'Basparmak (Bosluk)', renk: '#06b6d4', el: 'her-iki' },

  // Sağ El
  'y': { parmak: 5, ad: 'Sag Isaret', renk: '#0ea5e9', el: 'sag' },
  'u': { parmak: 5, ad: 'Sag Isaret', renk: '#0ea5e9', el: 'sag' },
  'h': { parmak: 5, ad: 'Sag Isaret', renk: '#0ea5e9', el: 'sag' },
  'j': { parmak: 5, ad: 'Sag Isaret (Anahtar)', renk: '#0ea5e9', el: 'sag', home: true },
  'n': { parmak: 5, ad: 'Sag Isaret', renk: '#0ea5e9', el: 'sag' },
  'm': { parmak: 5, ad: 'Sag Isaret', renk: '#0ea5e9', el: 'sag' },
  '6': { parmak: 5, ad: 'Sag Isaret', renk: '#0ea5e9', el: 'sag' },
  '7': { parmak: 5, ad: 'Sag Isaret', renk: '#0ea5e9', el: 'sag' },

  'i': { parmak: 6, ad: 'Sag Orta', renk: '#6366f1', el: 'sag' },
  'k': { parmak: 6, ad: 'Sag Orta', renk: '#6366f1', el: 'sag' },
  '8': { parmak: 6, ad: 'Sag Orta', renk: '#6366f1', el: 'sag' },
  ',': { parmak: 6, ad: 'Sag Orta', renk: '#6366f1', el: 'sag' },

  'o': { parmak: 7, ad: 'Sag Yuzuk', renk: '#8b5cf6', el: 'sag' },
  'l': { parmak: 7, ad: 'Sag Yuzuk', renk: '#8b5cf6', el: 'sag' },
  '9': { parmak: 7, ad: 'Sag Yuzuk', renk: '#8b5cf6', el: 'sag' },
  '.': { parmak: 7, ad: 'Sag Yuzuk', renk: '#8b5cf6', el: 'sag' },

  'p': { parmak: 8, ad: 'Sag Serce', renk: '#d946ef', el: 'sag' },
  '0': { parmak: 8, ad: 'Sag Serce', renk: '#d946ef', el: 'sag' },
  '-': { parmak: 8, ad: 'Sag Serce', renk: '#d946ef', el: 'sag' }
};
