/**
 * Veritabanı Yönetim Katmanı (Vercel Serverless & Local uyumlu)
 * Desteklenen Veritabanları:
 * 1. Supabase (SUPABASE_URL + SUPABASE_KEY / SUPABASE_ANON_KEY)
 * 2. Neon / PostgreSQL (POSTGRES_URL / DATABASE_URL)
 * 3. Yerel Dosya / Bellek (Fallback)
 */

const fs = require('fs');
const path = require('path');

// Bellek ve Yerel Fallback
let memoryScores = [
  { id: 1, nickname: "EfsaneYazici", wpm: 92, accuracy: 99, cpm: 460, mode: "time", mode_value: 30, category: "genel", created_at: new Date(Date.now() - 3600000).toISOString() },
  { id: 2, nickname: "KodCanavari", wpm: 78, accuracy: 97, cpm: 390, mode: "time", mode_value: 30, category: "genel", created_at: new Date(Date.now() - 7200000).toISOString() },
  { id: 3, nickname: "HizliParmak", wpm: 65, accuracy: 95, cpm: 325, mode: "time", mode_value: 30, category: "genel", created_at: new Date(Date.now() - 10800000).toISOString() }
];

const LOCAL_DATA_FILE = path.join(__dirname, '..', 'data', 'scores.json');

function ensureLocalDataDir() {
  try {
    const dir = path.dirname(LOCAL_DATA_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    if (!fs.existsSync(LOCAL_DATA_FILE)) {
      fs.writeFileSync(LOCAL_DATA_FILE, JSON.stringify(memoryScores, null, 2));
    }
  } catch (err) {
    // Vercel read-only filesystem ortamında sessizce bellek kullan
  }
}

function getLocalScores() {
  try {
    if (fs.existsSync(LOCAL_DATA_FILE)) {
      const content = fs.readFileSync(LOCAL_DATA_FILE, 'utf-8');
      return JSON.parse(content);
    }
  } catch (e) {
    // Read error, fallback to memory
  }
  return memoryScores;
}

function saveLocalScore(score) {
  try {
    ensureLocalDataDir();
    const scores = getLocalScores();
    scores.unshift(score);
    // Maksimum 500 skor tut
    if (scores.length > 500) scores.length = 500;
    fs.writeFileSync(LOCAL_DATA_FILE, JSON.stringify(scores, null, 2));
    memoryScores = scores;
    return true;
  } catch (e) {
    // Read-only filesystem, bellek içine ekle
    memoryScores.unshift(score);
    return true;
  }
}

// Supabase Entegrasyonu (varsa)
let supabaseClient = null;
function getSupabase() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_KEY || process.env.SUPABASE_ANON_KEY;
  if (url && key) {
    if (!supabaseClient) {
      try {
        const { createClient } = require('@supabase/supabase-js');
        supabaseClient = createClient(url, key);
      } catch (err) {
        console.warn('Supabase paketi yüklenemedi:', err.message);
      }
    }
    return supabaseClient;
  }
  return null;
}

/**
 * Skor Kaydetme Fonksiyonu
 */
async function addScore(data) {
  const supabase = getSupabase();
  const newScore = {
    nickname: (data.nickname || 'Anonim').substring(0, 24).trim(),
    wpm: parseInt(data.wpm, 10) || 0,
    accuracy: parseInt(data.accuracy, 10) || 0,
    cpm: parseInt(data.cpm, 10) || 0,
    mode: data.mode || 'time',
    mode_value: parseInt(data.mode_value, 10) || 30,
    category: data.category || 'genel',
    created_at: new Date().toISOString()
  };

  // 1. Supabase varsa oraya yaz
  if (supabase) {
    try {
      const { data: inserted, error } = await supabase
        .from('scores')
        .insert([newScore])
        .select()
        .single();

      if (error) {
        console.error('Supabase insert hatası:', error);
      } else {
        return { success: true, source: 'supabase', score: inserted };
      }
    } catch (err) {
      console.error('Supabase bağlantı hatası:', err);
    }
  }

  // 2. Fallback: Yerel/Bellek Depolama
  newScore.id = Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
  saveLocalScore(newScore);
  return { success: true, source: 'local', score: newScore };
}

/**
 * Liderlik Tablosu & Skorları Getirme
 */
async function getLeaderboard(filters = {}) {
  const supabase = getSupabase();
  const limit = parseInt(filters.limit, 10) || 20;
  const mode = filters.mode;
  const mode_value = filters.mode_value ? parseInt(filters.mode_value, 10) : null;

  // 1. Supabase varsa oradan çek
  if (supabase) {
    try {
      let query = supabase
        .from('scores')
        .select('*')
        .order('wpm', { ascending: false })
        .limit(limit);

      if (mode) query = query.eq('mode', mode);
      if (mode_value) query = query.eq('mode_value', mode_value);

      const { data, error } = await query;
      if (!error && data) {
        return { success: true, source: 'supabase', scores: data };
      }
    } catch (err) {
      console.error('Supabase sorgu hatası:', err);
    }
  }

  // 2. Fallback: Yerel/Bellek
  let scores = getLocalScores();
  if (mode) {
    scores = scores.filter(s => s.mode === mode);
  }
  if (mode_value) {
    scores = scores.filter(s => s.mode_value === mode_value);
  }

  // En yüksek WPM'e göre sırala
  scores.sort((a, b) => b.wpm - a.wpm || b.accuracy - a.accuracy);

  return {
    success: true,
    source: 'local',
    scores: scores.slice(0, limit)
  };
}

module.exports = {
  addScore,
  getLeaderboard
};
