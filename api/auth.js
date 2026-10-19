/**
 * ==============================================================================
 * RETOS Showcase 2026 — Función Serverless de Autenticación (Dashboard Admin)
 * Archivo: api/auth.js
 *
 * Valida la contraseña administrativa estática y emite un Token HMAC firmado
 * con expiración para proteger el acceso a los datos sensibles de los asistentes.
 * ==============================================================================
 */

'use strict';

const crypto = require('crypto');

// Contraseña por defecto solicitada o configurable vía variable de entorno en Vercel
const DEFAULT_PASSWORD = 'contraseniaParaDashboard123@!';

function getDashboardPassword() {
  return (process.env.DASHBOARD_PASSWORD || DEFAULT_PASSWORD).trim();
}

function getJwtSecret() {
  // Clave secreta para firmar tokens. Si no se define DASHBOARD_JWT_SECRET,
  // se deriva criptográficamente de la clave de servicio y el password.
  return process.env.DASHBOARD_JWT_SECRET || 
    crypto.createHash('sha256').update(getDashboardPassword() + (process.env.SUPABASE_SERVICE_ROLE_KEY || 'retos_2026_salt')).digest('hex');
}

/**
 * Comparación segura contra ataques de temporización (timing attacks)
 */
function safeCompare(input, expected) {
  if (typeof input !== 'string' || typeof expected !== 'string') return false;
  const inputBuffer = Buffer.from(input, 'utf8');
  const expectedBuffer = Buffer.from(expected, 'utf8');
  if (inputBuffer.length !== expectedBuffer.length) return false;
  return crypto.timingSafeEqual(inputBuffer, expectedBuffer);
}

/**
 * Genera un token HMAC firmado con vigencia de 12 horas
 */
function createSessionToken() {
  const payload = {
    user: 'admin',
    iat: Date.now(),
    exp: Date.now() + (12 * 60 * 60 * 1000) // 12 horas de validez para la jornada
  };
  const payloadB64 = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto.createHmac('sha256', getJwtSecret()).update(payloadB64).digest('base64url');
  return `${payloadB64}.${signature}`;
}

/**
 * Verifica la validez y expiración de un token de sesión
 */
function verifySessionToken(token) {
  if (!token || typeof token !== 'string') return false;
  const parts = token.split('.');
  if (parts.length !== 2) return false;

  const [payloadB64, signature] = parts;
  const expectedSig = crypto.createHmac('sha256', getJwtSecret()).update(payloadB64).digest('base64url');

  if (!safeCompare(signature, expectedSig)) {
    return false;
  }

  try {
    const payload = JSON.parse(Buffer.from(payloadB64, 'base64url').toString('utf8'));
    if (!payload.exp || Date.now() > payload.exp) {
      return false; // Token expirado
    }
    return true;
  } catch (_) {
    return false;
  }
}

module.exports = async function handler(req, res) {
  // Cabeceras de seguridad y control de caché
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');

  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    return res.end();
  }

  // 1. GET /api/auth: Comprobar si el token almacenado sigue siendo válido
  if (req.method === 'GET') {
    const authHeader = req.headers['authorization'] || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : authHeader.trim();

    if (verifySessionToken(token)) {
      res.statusCode = 200;
      return res.json({ ok: true, authenticated: true });
    } else {
      res.statusCode = 401;
      return res.json({ ok: false, authenticated: false, error: 'Sesión no válida o expirada' });
    }
  }

  // 2. POST /api/auth: Inicio de sesión con contraseña administrativa
  if (req.method === 'POST') {
    try {
      let body = req.body;
      if (typeof body === 'string') {
        try {
          body = JSON.parse(body);
        } catch (_) {
          res.statusCode = 400;
          return res.json({ ok: false, error: 'JSON malformado' });
        }
      }

      const inputPassword = (body.password || '').trim();
      const expectedPassword = getDashboardPassword();

      if (!inputPassword) {
        res.statusCode = 400;
        return res.json({ ok: false, error: 'Por favor ingresa la contraseña de acceso.' });
      }

      if (!safeCompare(inputPassword, expectedPassword)) {
        // Retardo leve intencional para mitigar ataques de fuerza bruta
        await new Promise(r => setTimeout(r, 400));
        res.statusCode = 401;
        return res.json({ ok: false, error: 'Contraseña incorrecta. Acceso denegado.' });
      }

      const token = createSessionToken();
      res.statusCode = 200;
      return res.json({
        ok: true,
        message: 'Acceso autorizado',
        token,
        expiresIn: '12h'
      });
    } catch (err) {
      console.error('[Auth API Error]:', err);
      res.statusCode = 500;
      return res.json({ ok: false, error: 'Error interno en el servidor de autenticación' });
    }
  }

  res.statusCode = 405;
  return res.json({ ok: false, error: 'Método no permitido' });
};

// Exportar helper para reutilización directa en api/registros.js
module.exports.verifySessionToken = verifySessionToken;
