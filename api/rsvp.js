/**
 * ==============================================================================
 * RETOS Showcase 2026 — Función Serverless RSVP (Vercel Node.js Runtime)
 * Archivo: api/rsvp.js
 *
 * Justificación: Se utiliza fetch nativo hacia la REST API de Supabase (PostgREST) para garantizar cero dependencias de npm, arranques en frío instantáneos y máxima ligereza en la función serverless.
 * ==============================================================================
 */

'use strict';

const crypto = require('crypto');

// Límites de validación técnica
const MAX_BODY_BYTES = 10 * 1024; // 10 KB
const EMAIL_REGEX = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
const VALID_ATTENDANCE = new Set(['si', 'no']);

/**
 * Genera un código de acreditación oficial con entropía criptográfica (crypto.randomInt).
 * Formato: RETOS-XXXX-<ASISTENCIA_MAYUS> (ej. RETOS-4891-SI)
 */
function generateAccessCode(attendance) {
  const randomSuffix = crypto.randomInt(1000, 10000); // 1000 a 9999 inclusive
  return `RETOS-${randomSuffix}-${attendance.toUpperCase()}`;
}

module.exports = async function handler(req, res) {
  // 1. Configurar cabeceras de seguridad y control de caché (mismo origen, sin almacenamiento en caché)
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

  // 4. Protección contra payload excesivo (DoS / Buffer overflow)
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
  // Si el campo oculto "website" contiene texto, se responde 200 ficticio sin persistir
  if (body.website && typeof body.website === 'string' && body.website.trim().length > 0) {
    return res.status(200).json({
      ok: true,
      code: 'RETOS-HONEY-OK'
    });
  }

  // 7. Extracción y normalización rigurosa en servidor (nunca confiar en el cliente)
  const nombreRaw = body.nombre !== undefined ? body.nombre : (body.name !== undefined ? body.name : '');
  const emailRaw = body.email !== undefined ? body.email : '';
  const asistenciaRaw = body.asistencia !== undefined ? body.asistencia : (body.attendance !== undefined ? body.attendance : '');
  const notasRaw = body.notas !== undefined ? body.notas : (body.notes !== undefined ? body.notes : '');

  const nombre = typeof nombreRaw === 'string' ? nombreRaw.trim() : '';
  const email = typeof emailRaw === 'string' ? emailRaw.trim().toLowerCase() : '';
  const asistencia = typeof asistenciaRaw === 'string' ? asistenciaRaw.trim().toLowerCase() : '';
  const notas = typeof notasRaw === 'string' ? notasRaw.trim() : '';

  // 8. Validación de reglas de negocio
  if (nombre.length < 2 || nombre.length > 120) {
    return res.status(400).json({
      ok: false,
      error: 'El nombre es obligatorio y debe tener entre 2 y 120 caracteres.'
    });
  }

  if (email.length > 254 || !EMAIL_REGEX.test(email)) {
    return res.status(400).json({
      ok: false,
      error: 'El correo electrónico proporcionado no es válido (máximo 254 caracteres).'
    });
  }

  if (!VALID_ATTENDANCE.has(asistencia)) {
    return res.status(400).json({
      ok: false,
      error: 'El estado de asistencia debe ser: si o no.'
    });
  }

  if (notas.length > 500) {
    return res.status(400).json({
      ok: false,
      error: 'Las notas adicionales no deben exceder 500 caracteres.'
    });
  }

  // 9. Verificación de credenciales de entorno para Supabase
  const supabaseUrl = process.env.SUPABASE_URL ? process.env.SUPABASE_URL.trim().replace(/\/+$/, '') : null;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY ? process.env.SUPABASE_SERVICE_ROLE_KEY.trim() : null;

  if (!supabaseUrl || !supabaseKey) {
    console.error('[RSVP Error]: Faltan las variables de entorno SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY.');
    return res.status(500).json({
      ok: false,
      error: 'Error interno en la configuración del servidor de confirmaciones. Contacta al organizador.'
    });
  }

  const commonHeaders = {
    'apikey': supabaseKey,
    'Authorization': `Bearer ${supabaseKey}`,
    'Accept': 'application/json'
  };

  try {
    // 10. Consultar si ya existe un registro con lower(email)
    const checkQueryUrl = `${supabaseUrl}/rest/v1/rsvp_registros?email=ilike.${encodeURIComponent(email)}&select=id,codigo`;
    const checkResponse = await fetch(checkQueryUrl, {
      method: 'GET',
      headers: commonHeaders
    });

    if (!checkResponse.ok) {
      const errorText = await checkResponse.text();
      console.error('[RSVP Supabase Check Error]:', checkResponse.status, errorText);
      return res.status(500).json({
        ok: false,
        error: 'No se pudo verificar el estado previo del registro en el sistema.'
      });
    }

    const existingRows = await checkResponse.json();

    // 11. Caso A: El correo ya existe -> Actualizar respuesta y conservar su código original
    if (Array.isArray(existingRows) && existingRows.length > 0) {
      const existing = existingRows[0];
      const existingCode = existing.codigo;

      const updateUrl = `${supabaseUrl}/rest/v1/rsvp_registros?id=eq.${encodeURIComponent(existing.id)}`;
      const updateResponse = await fetch(updateUrl, {
        method: 'PATCH',
        headers: {
          ...commonHeaders,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify({
          nombre,
          asistencia,
          notas: notas.length > 0 ? notas : null,
          updated_at: new Date().toISOString()
        })
      });

      if (!updateResponse.ok) {
        const updateError = await updateResponse.text();
        console.error('[RSVP Supabase Update Error]:', updateResponse.status, updateError);
        return res.status(500).json({
          ok: false,
          error: 'No fue posible actualizar tu confirmación en este momento.'
        });
      }

      return res.status(200).json({
        ok: true,
        code: existingCode
      });
    }

    // 12. Caso B: Correo nuevo -> Insertar con generación de código y reintento defensivo ante colisión
    let inserted = false;
    let finalCode = '';
    const maxRetries = 3;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      finalCode = generateAccessCode(asistencia);

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
          email,
          asistencia,
          notas: notas.length > 0 ? notas : null,
          codigo: finalCode,
          origen: 'web_showcase_2026'
        })
      });

      if (insertResponse.ok) {
        inserted = true;
        break;
      }

      const insertError = await insertResponse.text();
      // Si el error es por colisión de clave única en codigo, reintentar con otro número
      if (insertError.includes('codigo') || insertError.includes('duplicate key')) {
        console.warn(`[RSVP Collision]: Reintentando código para ${email} (intento ${attempt + 1})...`);
        continue;
      }

      console.error('[RSVP Supabase Insert Error]:', insertResponse.status, insertError);
      return res.status(500).json({
        ok: false,
        error: 'No se pudo registrar tu confirmación en el sistema.'
      });
    }

    if (!inserted) {
      console.error('[RSVP Collision Exhausted]: Se agotaron los reintentos de generación de código.');
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
