/**
 * ==============================================================================
 * RETOS Showcase 2026 — API Handler de Registros (Protegido por Autenticación)
 * Archivo: api/registros.js
 *
 * Conexión segura con Supabase PostgREST usando SUPABASE_SERVICE_ROLE_KEY.
 * Requiere autenticación previa vía Token Bearer generado por api/auth.js.
 * Esquema: public.rsvp_registros
 * ==============================================================================
 */

'use strict';

const crypto = require('crypto');
const { verifySessionToken } = require('./auth.js');

const VALID_ATTENDANCE = new Set(['si', 'no']);
const VALID_ROLES = new Set(['estudiante', 'docente', 'empresa', 'familiar', 'invitado']);
const CODE_CHARSET = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';

function generateAccessCode() {
  const bytes = crypto.randomBytes(6);
  let suffix = '';
  for (let i = 0; i < 6; i++) {
    suffix += CODE_CHARSET[bytes[i] % CODE_CHARSET.length];
  }
  return `RETOS-${suffix}`;
}

module.exports = async function handler(req, res) {
  // CORS & Cache
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');

  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    return res.end();
  }

  // 1. VALIDACIÓN DE AUTENTICACIÓN (BLINDAJE DE DATOS SENSIBLES)
  const authHeader = req.headers['authorization'] || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : authHeader.trim();

  if (!verifySessionToken(token)) {
    res.statusCode = 401;
    return res.json({
      ok: false,
      error: 'Acceso no autorizado. Inicia sesión en el Dashboard de Control de Acceso.'
    });
  }

  // 2. Conexión a Supabase
  const supabaseUrl = (process.env.SUPABASE_URL || '').replace(/\/+$/, '').replace(/\/rest\/v1\/?$/i, '').replace(/\/+$/, '');
  const supabaseKey = (
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    ''
  ).trim();

  if (!supabaseUrl || !supabaseKey) {
    res.statusCode = 500;
    return res.json({
      ok: false,
      error: 'Variables de entorno SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY faltantes en el servidor.'
    });
  }

  const headers = {
    'apikey': supabaseKey,
    'Authorization': `Bearer ${supabaseKey}`,
    'Accept': 'application/json'
  };

  // 3. GET: Obtener lista completa de registros (con límite seguro)
  if (req.method === 'GET') {
    try {
      const url = new URL(req.url, 'http://localhost');
      const limitParam = parseInt(url.searchParams.get('limit') || '1000', 10);
      const safeLimit = Math.min(Math.max(1, isNaN(limitParam) ? 1000 : limitParam), 5000);
      const endpoint = `${supabaseUrl}/rest/v1/rsvp_registros?select=*&order=created_at.desc&limit=${safeLimit}`;

      const response = await fetch(endpoint, {
        method: 'GET',
        headers
      });

      if (!response.ok) {
        const errText = await response.text();
        console.error('[Dashboard API] Error al consultar Supabase:', response.status, errText);
        res.statusCode = response.status;
        return res.json({ ok: false, error: 'Error al consultar la base de datos Supabase.' });
      }

      const data = await response.json();
      return res.json({
        ok: true,
        total: data.length,
        data
      });
    } catch (err) {
      console.error('[Dashboard API] Error GET:', err);
      res.statusCode = 500;
      return res.json({ ok: false, error: err.message });
    }
  }

  // 4. POST: Crear un nuevo registro directamente desde el Dashboard
  if (req.method === 'POST') {
    try {
      const rawBodyStr = typeof req.body === 'string' ? req.body : JSON.stringify(req.body || {});
      if (Buffer.byteLength(rawBodyStr, 'utf8') > 15 * 1024) {
        res.statusCode = 413;
        return res.json({ ok: false, error: 'Cuerpo de solicitud excede el límite de 15KB.' });
      }

      let body = req.body;
      if (typeof body === 'string') {
        try {
          body = JSON.parse(body);
        } catch (_) {
          res.statusCode = 400;
          return res.json({ ok: false, error: 'JSON malformado.' });
        }
      }

      const nombre = (body.nombre || '').trim();
      const asistencia = (body.asistencia || '').trim().toLowerCase();
      const rol = (body.rol || '').trim().toLowerCase();
      const organizacion = (body.organizacion || '').trim() || null;
      let codigo = (body.codigo || '').trim().toUpperCase();
      const origen = (body.origen || 'dashboard_manual').trim().slice(0, 60);

      if (nombre.length < 2 || nombre.length > 120) {
        res.statusCode = 400;
        return res.json({ ok: false, error: 'El nombre debe tener entre 2 y 120 caracteres.' });
      }

      if (!VALID_ATTENDANCE.has(asistencia)) {
        res.statusCode = 400;
        return res.json({ ok: false, error: 'Asistencia debe ser "si" o "no".' });
      }

      if (!VALID_ROLES.has(rol)) {
        res.statusCode = 400;
        return res.json({ ok: false, error: 'Rol no válido. Permitidos: estudiante, docente, empresa, familiar, invitado.' });
      }

      if (!codigo || !codigo.startsWith('RETOS-')) {
        codigo = generateAccessCode();
      }

      const endpoint = `${supabaseUrl}/rest/v1/rsvp_registros`;
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          ...headers,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        },
        body: JSON.stringify({
          nombre,
          asistencia,
          rol,
          organizacion,
          codigo,
          origen
        })
      });

      if (!response.ok) {
        const errText = await response.text();
        console.error('[Dashboard API] Error al insertar:', response.status, errText);
        res.statusCode = 500;
        return res.json({ ok: false, error: 'No se pudo registrar en Supabase.' });
      }

      const created = await response.json();
      return res.json({
        ok: true,
        registro: created[0] || created
      });
    } catch (err) {
      console.error('[Dashboard API] Error POST:', err);
      res.statusCode = 500;
      return res.json({ ok: false, error: err.message });
    }
  }

  // 5. DELETE: Eliminar un registro por ID
  if (req.method === 'DELETE') {
    try {
      const url = new URL(req.url, 'http://localhost');
      const id = url.searchParams.get('id');

      if (!id) {
        res.statusCode = 400;
        return res.json({ ok: false, error: 'Falta el parámetro ID del registro.' });
      }

      const endpoint = `${supabaseUrl}/rest/v1/rsvp_registros?id=eq.${encodeURIComponent(id)}`;
      const response = await fetch(endpoint, {
        method: 'DELETE',
        headers: {
          ...headers,
          'Prefer': 'return=representation'
        }
      });

      if (!response.ok) {
        res.statusCode = 500;
        return res.json({ ok: false, error: 'Error al eliminar en Supabase.' });
      }

      return res.json({ ok: true, message: 'Registro eliminado con éxito.' });
    } catch (err) {
      console.error('[Dashboard API] Error DELETE:', err);
      res.statusCode = 500;
      return res.json({ ok: false, error: err.message });
    }
  }

  res.statusCode = 405;
  return res.json({ ok: false, error: 'Método no soportado.' });
};
