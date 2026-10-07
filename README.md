# ⌨️ TusHiz — 10 Parmak Hız Testi (ASCII Türkçe) & Vercel Dağıtımı

Türkçe karakter olmadan (örneğin: **başhekim ➔ bashekim**, **öğretmen ➔ ogretmen**) tasarlanmış, **Vercel Serverless API** ve **Veritabanı (Supabase / PostgreSQL)** entegrasyonuna sahip profesyonel 10 parmak klavye hız testi uygulaması.

---

## 🚀 2 Dakikada Vercel'e Dağıtım (Deploy)

### Yöntem 1: Vercel CLI ile Tek Komutla (En Hızlısı)
Proje klasöründe terminali açıp şu komutu çalıştırın:
```bash
npx vercel
```
1. `Set up and deploy?` ➔ **y**
2. `Which scope?` ➔ Kendi Vercel hesabınızı seçin
3. `Link to existing project?` ➔ **N**
4. `Project name?` ➔ Enter (varsayılan)
5. `In which directory is your code located?` ➔ Enter (`./`)
*1 dakika içinde canlı URL adresiniz (örn: `https://tushiz-10-parmak.vercel.app`) hazır olacaktır.*

### Yöntem 2: GitHub Üzerinden
1. Projeyi bir GitHub reposuna yükleyin:
   ```bash
   git init
   git add .
   git commit -m "TusHiz 10 Parmak ve Vercel API"
   git branch -M main
   git remote add origin https://github.com/<kullanici-adi>/tushiz.git
   git push -u origin main
   ```
2. [vercel.com](https://vercel.com) adresine gidin, **"Add New" ➔ "Project"** seçin.
3. GitHub reponuzu bağlayıp **Deploy** butonuna basın.

---

## 🗄️ Veritabanı Entegrasyonu (Supabase / PostgreSQL)

Uygulama, bulut veritabanı olmasa bile **yerel depolama / bellek fallback** ile sorunsuz çalışır. Kalıcı ve ortak bir liderlik tablosu için ücretsiz bir **Supabase** projesi bağlayabilirsiniz:

### 1. Supabase Tablosunu Oluşturma
1. [supabase.com](https://supabase.com) adresinde ücretsiz bir proje açın.
2. Sol menüden **SQL Editor** sekmesine gidin.
3. Projedeki `schema.sql` dosyasının içeriğini yapıştırıp **Run** deyin:
   ```sql
   CREATE TABLE IF NOT EXISTS scores (
     id BIGSERIAL PRIMARY KEY,
     nickname VARCHAR(50) NOT NULL DEFAULT 'Anonim',
     wpm INT NOT NULL,
     accuracy INT NOT NULL,
     cpm INT NOT NULL,
     mode VARCHAR(20) NOT NULL DEFAULT 'time',
     mode_value INT NOT NULL DEFAULT 30,
     category VARCHAR(30) NOT NULL DEFAULT 'genel',
     created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
   );

   CREATE INDEX IF NOT EXISTS idx_scores_wpm ON scores (wpm DESC);
   CREATE INDEX IF NOT EXISTS idx_scores_mode_wpm ON scores (mode, mode_value, wpm DESC);
   ALTER TABLE scores ENABLE ROW LEVEL SECURITY;
   CREATE POLICY "Herkes Skor Ekleyebilir" ON scores FOR INSERT TO anon, authenticated WITH CHECK (true);
   CREATE POLICY "Herkes Skorlari Gorebilir" ON scores FOR SELECT TO anon, authenticated USING (true);
   ```

### 2. Vercel Ortam Değişkenleri (Environment Variables)
Vercel projenizin **Settings ➔ Environment Variables** bölümüne şu 2 değeri ekleyin:
- `SUPABASE_URL`: Supabase proje ayarlarındaki Project URL (örn: `https://xyz.supabase.co`)
- `SUPABASE_KEY`: Supabase Project Settings ➔ API altındaki `anon public` veya `service_role` anahtarı

*Eklediğiniz anda Vercel Serverless API (`/api/scores`) tüm oyuncuların skorlarını doğrudan Supabase bulut veritabanına kaydeder ve liderlik tablosunda canlı olarak listeler.*

---

## 💻 Yerel Geliştirme (Local Dev)

Uygulamayı yerel bilgisayarınızda hem arayüz hem de API olarak çalıştırmak için:
```bash
npm start
```
Tarayıcınızdan `http://localhost:5174` adresine gidin.

---

## 🌟 Öne Çıkan Özellikler
- **ASCII Türkçe Kelime Havuzu**: `ç, ğ, ı, ö, ş, ü` yerine `c, g, i, o, s, u` (örn: *bashekim, ogretmen, yagmur, saglik*).
- **10 Parmak Görsel Klavye Rehberi**: Hangi harf için hangi parmağın kullanılması gerektiğini canlı renklerle gösterir.
- **Mekanik Klavye Sesleri**: Web Audio API ile sıfır harici dosya yükü olmadan *Thock*, *Clicky*, *Daktilo* sesleri.
- **Türkçe ➔ ASCII Metin Dönüştürücü**: Kendi istediğiniz herhangi bir Türkçe metni yapıştırıp tek tıkla ASCII test metnine çevirebilme.
- **Canlı Liderlik Tablosu**: Oyuncu adı ile skor kaydı ve WPM sıralaması.
- **SVG Performans Grafiği**: Test bitiminde saniyelik hız ivmesi grafiği.
