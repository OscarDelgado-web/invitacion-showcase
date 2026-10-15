/**
 * ==============================================================================
 * RETOS Showcase 2026 — Función Serverless RSVP (Vercel Node.js Runtime)
 * Archivo: api/rsvp.js
 *
 * Utiliza fetch nativo hacia la REST API de Supabase (PostgREST) con service_role.
 * Esquema de datos: public.rsvp_registros
 * Columnas: id, created_at, updated_at, nombre, asistencia, rol, organizacion, codigo, origen.
 * ==============================================================================
 */

'use strict';

const crypto = require('crypto');

// Límites de validación técnica
const MAX_BODY_BYTES = 10 * 1024; // 10 KB
const VALID_ATTENDANCE = new Set(['si', 'no']);
const VALID_ROLES = new Set(['estudiante', 'docente', 'empresa', 'familiar', 'invitado']);
const CODE_CHARSET = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
const CODE_REGEX = /^RETOS-[23456789ABCDEFGHJKLMNPQRSTUVWXYZ]{6}$/;

/**
 * Genera un código de acreditación alfanumérico en mayúsculas sin 0, O, 1, I.
 * Formato: RETOS-XXXXXX (ej. RETOS-K9P42A)
 */
function generateAccessCode() {
  const bytes = crypto.randomBytes(6);
  let suffix = '';
  for (let i = 0; i < 6; i++) {
    suffix += CODE_CHARSET[bytes[i] % CODE_CHARSET.length];
  }
  return `RETOS-${suffix}`;
}

module.exports = async function handler(req, res) {
  // 1. Configurar cabeceras de seguridad y control de caché
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');

  // 2. Restringir método exclusivamente a POST
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({
      ok: false,
      error: 'Método no permitido. Solo se aceptan solicitudes POST.'
    });
  }

  // 3. Validar encabezado Content-Type
  const contentType = req.headers['content-type'] || '';
  if (!contentType.toLowerCase().includes('application/json')) {
    return res.status(400).json({
      ok: false,
      error: 'Formato de solicitud inválido. Se requiere Content-Type: application/json.'
    });
  }

  // 4. Protección contra payload excesivo
  const rawBody = typeof req.body === 'string' ? req.body : JSON.stringify(req.body || {});
  if (Buffer.byteLength(rawBody, 'utf8') > MAX_BODY_BYTES) {
    return res.status(413).json({
      ok: false,
      error: 'El cuerpo de la solicitud excede el límite de tamaño permitido (10 KB).'
    });
  }

  // 5. Parsear y normalizar el cuerpo JSON
  let body = req.body;
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch (_) {
      return res.status(400).json({
        ok: false,
        error: 'El cuerpo de la solicitud contiene JSON malformado.'
      });
    }
  }

  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return res.status(400).json({
      ok: false,
      error: 'Estructura de datos inválida.'
    });
  }

  // 6. Trampa Honeypot contra bots automatizados
  if (body.website && typeof body.website === 'string' && body.website.trim().length > 0) {
    return res.status(200).json({
      ok: true,
      code: 'RETOS-HONEY-OK'
    });
  }

  // 7. Extracción y normalización de las columnas del esquema public.rsvp_registros
  const nombreRaw = body.nombre !== undefined ? body.nombre : (body.name !== undefined ? body.name : '');
  const asistenciaRaw = body.asistencia !== undefined ? body.asistencia : (body.attendance !== undefined ? body.attendance : '');
  const rolRaw = body.rol !== undefined ? body.rol : (body.role !== undefined ? body.role : '');
  const orgRaw = body.organizacion !== undefined ? body.organizacion : (body.organization !== undefined ? body.organization : '');
  const codigoRaw = body.codigo !== undefined ? body.codigo : (body.code !== undefined ? body.code : '');
  const origenRaw = body.origen !== undefined ? body.origen : 'web_showcase_2026';

  const nombre = typeof nombreRaw === 'string' ? nombreRaw.trim() : '';
  const asistencia = typeof asistenciaRaw === 'string' ? asistenciaRaw.trim().toLowerCase() : '';
  const rol = typeof rolRaw === 'string' ? rolRaw.trim().toLowerCase() : '';
  const orgTrimmed = typeof orgRaw === 'string' ? orgRaw.trim() : '';
  const organizacion = orgTrimmed.length > 0 ? orgTrimmed : null;
  const codigoCandidate = typeof codigoRaw === 'string' ? codigoRaw.trim().toUpperCase() : '';
  const origen = typeof origenRaw === 'string' ? origenRaw.trim().slice(0, 60) : 'web_showcase_2026';

  // 8. Validación de restricciones CHECK de PostgreSQL
  if (nombre.length < 2 || nombre.length > 120) {
    return res.status(400).json({
      ok: false,
      error: 'El nombre es obligatorio y debe tener entre 2 y 120 caracteres.'
    });
  }

  if (!VALID_ATTENDANCE.has(asistencia)) {
    return res.status(400).json({
      ok: false,
      error: 'El estado de asistencia debe ser: si o no.'
    });
  }

  if (!VALID_ROLES.has(rol)) {
    return res.status(400).json({
      ok: false,
      error: 'El rol seleccionado no es válido. Opciones permitidas: estudiante, docente, empresa, familiar, invitado.'
    });
  }

  if (organizacion !== null && organizacion.length > 120) {
    return res.status(400).json({
      ok: false,
      error: 'La organización no debe exceder 120 caracteres.'
    });
  }

  // 9. Verificación de credenciales de entorno para Supabase
  let supabaseUrl = process.env.SUPABASE_URL ? process.env.SUPABASE_URL.trim() : null;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY ? process.env.SUPABASE_SERVICE_ROLE_KEY.trim() : null;

  if (!supabaseUrl || !supabaseKey) {
    console.error('[RSVP Error]: Faltan las variables de entorno SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY.');
    return res.status(500).json({
      ok: false,
      error: 'Error interno en la configuración del servidor de confirmaciones. Contacta al organizador.'
    });
  }

  // Normalización defensiva de SUPABASE_URL
  supabaseUrl = supabaseUrl.replace(/\/+$/, '').replace(/\/rest\/v1\/?$/i, '').replace(/\/+$/, '');

  const commonHeaders = {
    'apikey': supabaseKey,
    'Authorization': `Bearer ${supabaseKey}`,
    'Accept': 'application/json'
  };

  try {
    // 10. Inserción con reintento ante colisión de código único (error 23505)
    let inserted = false;
    let finalCode = CODE_REGEX.test(codigoCandidate) ? codigoCandidate : generateAccessCode();
    const maxRetries = 3;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      if (attempt > 0) {
        finalCode = generateAccessCode();
      }

      const insertUrl = `${supabaseUrl}/rest/v1/rsvp_registros`;
      const insertResponse = await fetch(insertUrl, {
        method: 'POST',
        headers: {
          ...commonHeaders,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify({
          nombre,
          asistencia,
          rol,
          organizacion,
          codigo: finalCode,
          origen
        })
      });

      if (insertResponse.ok) {
        inserted = true;
        break;
      }

      const insertError = await insertResponse.text();

      // Si el error es 23505 (violación de clave única en codigo), reintentar
      if (insertResponse.status === 409 || insertError.includes('23505') || insertError.includes('codigo') || insertError.includes('duplicate key')) {
        console.warn(`[RSVP Colisión 23505]: Reintentando generación de código (intento ${attempt + 1}/${maxRetries})...`);
        continue;
      }

      console.error('[RSVP Supabase Insert Error]:', insertResponse.status, insertError);
      return res.status(500).json({
        ok: false,
        error: 'No se pudo registrar tu confirmación en el sistema.'
      });
    }

    if (!inserted) {
      console.error('[RSVP Colisión Agotada]: Se agotaron los reintentos de código de acreditación.');
      return res.status(500).json({
        ok: false,
        error: 'Error temporal al asignar tu código de acreditación. Por favor, reintenta.'
      });
    }

    return res.status(200).json({
      ok: true,
      code: finalCode
    });

  } catch (err) {
    console.error('[RSVP Unexpected Server Error]:', err);
    return res.status(500).json({
      ok: false,
      error: 'Ocurrió un error inesperado al procesar la solicitud. Por favor intenta más tarde.'
    });
  }
};
