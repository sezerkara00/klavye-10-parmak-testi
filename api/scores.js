/**
 * Vercel Serverless Function - /api/scores
 * Skorları kaydetme ve Liderlik tablosunu getirme endpoint'i
 */

const { addScore, getLeaderboard } = require('./db');

module.exports = async (req, res) => {
  // CORS Başlıkları
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // GET: Liderlik Tablosunu Getir
    if (req.method === 'GET') {
      const { mode, mode_value, limit } = req.query || {};
      const result = await getLeaderboard({ mode, mode_value, limit });
      return res.status(200).json(result);
    }

    // POST: Yeni Skor Ekle
    if (req.method === 'POST') {
      let body = req.body;
      if (typeof body === 'string') {
        try {
          body = JSON.parse(body);
        } catch (e) {
          return res.status(400).json({ error: 'Geçersiz JSON verisi' });
        }
      }

      if (!body || typeof body.wpm === 'undefined') {
        return res.status(400).json({ error: 'wpm değeri zorunludur' });
      }

      const result = await addScore(body);
      return res.status(201).json(result);
    }

    return res.status(405).json({ error: 'Yönteme izin verilmiyor' });
  } catch (error) {
    console.error('API Hatası:', error);
    return res.status(500).json({ error: 'Sunucu hatası', details: error.message });
  }
};
