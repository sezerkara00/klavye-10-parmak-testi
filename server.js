/**
 * TusHiz - Sunucu & Vercel Entrypoint
 * Hem Vercel Node.js Serverless ortamında hem de yerel sunucu olarak çalışır.
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const scoresHandler = require('./api/scores');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon'
};

async function handler(req, res) {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;

  // CORS Başlıkları
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.statusCode = 200;
    return res.end();
  }

  // 1. API İstekleri (/api/scores)
  if (pathname.startsWith('/api/scores')) {
    req.query = parsedUrl.query;
    
    // Body henüz okunmadıysa topla
    if (!req.body && (req.method === 'POST' || req.method === 'PUT')) {
      let bodyData = '';
      await new Promise(resolve => {
        req.on('data', chunk => { bodyData += chunk; });
        req.on('end', resolve);
      });
      try {
        req.body = JSON.parse(bodyData);
      } catch (e) {
        req.body = bodyData;
      }
    }

    // Express uyumlu metodlar
    if (!res.status) {
      res.status = function(code) {
        this.statusCode = code;
        return this;
      };
    }
    if (!res.json) {
      res.json = function(data) {
        this.setHeader('Content-Type', 'application/json');
        this.end(JSON.stringify(data));
      };
    }

    return await scoresHandler(req, res);
  }

  // 2. Statik Dosyalar (index.html, style.css, script.js, words.js, sound.js vb.)
  const safePath = pathname === '/' ? 'index.html' : pathname.replace(/^\/+/, '');
  const filePath = path.join(__dirname, safePath);
  const ext = path.extname(filePath).toLowerCase();

  try {
    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
      const content = fs.readFileSync(filePath);
      const contentType = MIME_TYPES[ext] || 'application/octet-stream';
      res.writeHead(200, { 'Content-Type': contentType });
      return res.end(content);
    }
  } catch (err) {
    console.error('Statik dosya okuma hatası:', err);
  }

  // Dosya bulunamadıysa index.html'e yönlendir (SPA fallback)
  const indexFile = path.join(__dirname, 'index.html');
  if (fs.existsSync(indexFile)) {
    const content = fs.readFileSync(indexFile);
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    return res.end(content);
  }

  res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
  res.end('404 Dosya Bulunamadı');
}

// Vercel Serverless Function için export
module.exports = handler;

// Yerel sunucu başlatma
if (require.main === module) {
  const PORT = process.env.PORT || 5174;
  const server = http.createServer(handler);
  server.listen(PORT, () => {
    console.log(`\n======================================================`);
    console.log(`🚀 TusHiz 10 Parmak Sunucusu Çalışıyor!`);
    console.log(`🌐 Yerel Adres: http://localhost:${PORT}`);
    console.log(`📡 API Endpoint: http://localhost:${PORT}/api/scores`);
    console.log(`======================================================\n`);
  });
}
