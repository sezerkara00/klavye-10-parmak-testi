-- ==========================================================
-- TusHiz 10 Parmak - Supabase / PostgreSQL Tablo Şeması
-- Supabase SQL Editor'e veya Neon / PostgreSQL konsoluna yapıştırın
-- ==========================================================

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

-- Yüksek performanslı indeksler
CREATE INDEX IF NOT EXISTS idx_scores_wpm ON scores (wpm DESC);
CREATE INDEX IF NOT EXISTS idx_scores_mode_wpm ON scores (mode, mode_value, wpm DESC);

-- Row Level Security (RLS) Politikaları
ALTER TABLE scores ENABLE ROW LEVEL SECURITY;

-- Herkes skor ekleyebilir
CREATE POLICY "Anonim Kullanıcılar Skor Ekleyebilir" 
  ON scores FOR INSERT 
  TO anon, authenticated 
  WITH CHECK (true);

-- Herkes liderlik tablosunu okuyabilir
CREATE POLICY "Herkes Skorları Okuyabilir" 
  ON scores FOR SELECT 
  TO anon, authenticated 
  USING (true);
