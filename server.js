/**
 * TusHiz - Sunucu & Vercel Entrypoint
 * NFT (Node File Trace) statik dosya önbelleği ile Vercel'de eksiksiz dosya sunumu.
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const scoresHandler = require('./api/scores');

// Vercel Lambda paketleyicisinin (NFT) tüm dosyaları dahil etmesi için statik önbellek:
const STATIC_FILES = {
  '/': {
    content: fs.readFileSync(path.join(__dirname, 'index.html'), 'utf-8'),
    type: 'text/html; charset=utf-8'
  },
  '/index.html': {
    content: fs.readFileSync(path.join(__dirname, 'index.html'), 'utf-8'),
    type: 'text/html; charset=utf-8'
  },
  '/style.css': {
    content: fs.readFileSync(path.join(__dirname, 'style.css'), 'utf-8'),
    type: 'text/css; charset=utf-8'
  },
  '/words.js': {
    content: fs.readFileSync(path.join(__dirname, 'words.js'), 'utf-8'),
    type: 'application/javascript; charset=utf-8'
  },
  '/sound.js': {
    content: fs.readFileSync(path.join(__dirname, 'sound.js'), 'utf-8'),
    type: 'application/javascript; charset=utf-8'
  },
  '/script.js': {
    content: fs.readFileSync(path.join(__dirname, 'script.js'), 'utf-8'),
    type: 'application/javascript; charset=utf-8'
  }
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

  // 2. Statik Dosyalar (Hafızadan anında sunum)
  if (STATIC_FILES[pathname]) {
    const file = STATIC_FILES[pathname];
    res.writeHead(200, {
      'Content-Type': file.type,
      'Cache-Control': 'public, max-age=3600'
    });
    return res.end(file.content);
  }

  // 3. Fallback: index.html
  const fallback = STATIC_FILES['/'];
  res.writeHead(200, { 'Content-Type': fallback.type });
  return res.end(fallback.content);
}

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
