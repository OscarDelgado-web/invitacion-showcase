/**
 * ==============================================================================
 * RETOS Showcae 2026 - 2nd Edition — Servidor de Desarrollo Local
 * Archivo: dev-server.js
 *
 * Servidor HTTP nativo de Node.js (cero dependencias de npm).
 * - Carga automáticamente las variables de entorno desde .env si existe.
 * - Enruta las peticiones POST a /api/rsvp hacia la función serverless api/rsvp.js.
 * - Sirve archivos estáticos (HTML, CSS, JS, JSON, assets) con tipos MIME adecuados.
 *
 * Uso:
 *   node dev-server.js
 * ==============================================================================
 */

'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');
const rsvpHandler = require('./api/rsvp.js');

// 1. Cargar archivo .env local si existe (sin dependencias externas)
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  try {
    const envContent = fs.readFileSync(envPath, 'utf8');
    envContent.split('\n').forEach(line => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) return;
      const eqIdx = trimmed.indexOf('=');
      if (eqIdx !== -1) {
        const key = trimmed.slice(0, eqIdx).trim();
        let val = trimmed.slice(eqIdx + 1).trim();
        // Quitar comillas si están presentes
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
          val = val.slice(1, -1);
        }
        if (!process.env[key]) {
          process.env[key] = val;
        }
      }
    });
    console.log('✔ [.env] Variables de entorno cargadas correctamente.');
  } catch (err) {
    console.warn('⚠ [.env] No se pudo leer el archivo .env:', err.message);
  }
}

// 2. Diccionario de tipos MIME
const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.ics': 'text/calendar; charset=utf-8',
  '.webp': 'image/webp'
};

const PORT = process.env.PORT || 3000;

const server = http.createServer(async (req, res) => {
  const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  let pathname = parsedUrl.pathname;

  // 3. Enrutador para la API de RSVP (/api/rsvp)
  if (pathname === '/api/rsvp') {
    if (req.method === 'POST') {
      let bodyData = '';
      req.on('data', chunk => { bodyData += chunk; });
      req.on('end', async () => {
        try {
          req.body = bodyData ? JSON.parse(bodyData) : {};
        } catch (_) {
          req.body = bodyData;
        }

        // Simular métodos helper de respuesta tipo Vercel/Express
        res.status = function (code) {
          res.statusCode = code;
          return res;
        };
        res.json = function (data) {
          res.setHeader('Content-Type', 'application/json; charset=utf-8');
          res.end(JSON.stringify(data));
          return res;
        };

        try {
          await rsvpHandler(req, res);
        } catch (err) {
          console.error('[dev-server RSVP Handler Error]:', err);
          if (!res.headersSent) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ ok: false, error: 'Error interno en el handler de desarrollo.' }));
          }
        }
      });
      return;
    } else {
      res.writeHead(405, { 'Content-Type': 'application/json', 'Allow': 'POST' });
      res.end(JSON.stringify({ ok: false, error: 'Método no permitido. Solo se acepta POST.' }));
      return;
    }
  }

  // 4. Servidor de archivos estáticos
  if (pathname === '/' || pathname === '') {
    pathname = '/index.html';
  }

  // Normalizar ruta para evitar path traversal
  const safePath = path.normalize(decodeURIComponent(pathname)).replace(/^(\.\.[\/\\])+/, '');
  const filePath = path.join(__dirname, safePath);

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end(`404 No Encontrado: ${pathname}`);
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    res.writeHead(200, {
      'Content-Type': contentType,
      'Cache-Control': 'no-cache'
    });

    const stream = fs.createReadStream(filePath);
    stream.pipe(res);
  });
});

server.listen(PORT, '127.0.0.1', () => {
  console.log('\n======================================================');
  console.log(` RETOS Showcae 2026 - 2nd Edition — Servidor Local Activo`);
  console.log(` URL: http://127.0.0.1:${PORT}/`);
  console.log(` Endpoint RSVP: http://127.0.0.1:${PORT}/api/rsvp`);
  console.log('======================================================\n');
});
