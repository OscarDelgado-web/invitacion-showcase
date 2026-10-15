/**
 * ==============================================================================
 * RETOS Showcase 2026 — Suite de Pruebas Automatizadas para api/rsvp.js
 * Archivo: test/test-rsvp.js
 *
 * Ejecuta pruebas unitarias e integradas con mock de Supabase PostgREST
 * para el esquema public.rsvp_registros:
 * nombre, asistencia, rol, organizacion, codigo, origen
 * ==============================================================================
 */

'use strict';

const http = require('http');
const handler = require('../api/rsvp.js');

// Helper para simular objetos req y res de Vercel/Node
function createMockHttp({ method = 'POST', headers = {}, body = null } = {}) {
  const req = {
    method,
    headers: {
      'content-type': 'application/json',
      ...headers
    },
    body
  };

  let statusCode = 200;
  let responseHeaders = {};
  let responseData = null;

  const res = {
    setHeader(key, val) {
      responseHeaders[key.toLowerCase()] = val;
    },
    status(code) {
      statusCode = code;
      return this;
    },
    json(data) {
      responseData = data;
      return this;
    },
    send(data) {
      responseData = data;
      return this;
    }
  };

  return {
    req,
    res,
    getResponse: () => ({
      status: statusCode,
      headers: responseHeaders,
      data: responseData
    })
  };
}

let passed = 0;
let failed = 0;

function assert(description, condition, actual) {
  if (condition) {
    console.log(`  ✔ PASS: ${description}`);
    passed++;
  } else {
    console.error(`  ✖ FAIL: ${description} (Resultado recibido:`, actual, ')');
    failed++;
  }
}

async function runTests() {
  console.log('\n======================================================');
  console.log(' INICIANDO SUITE DE PRUEBAS: api/rsvp.js');
  console.log('======================================================\n');

  // 1. Método HTTP no permitido (GET, PUT, DELETE)
  console.log('--- 1. Validación de Métodos HTTP ---');
  {
    const { req, res, getResponse } = createMockHttp({ method: 'GET' });
    await handler(req, res);
    const result = getResponse();
    assert('Método GET responde con HTTP 405', result.status === 405, result.status);
    assert('Cabecera Allow: POST presente', result.headers['allow'] === 'POST', result.headers);
    assert('Respuesta ok: false', result.data && result.data.ok === false, result.data);
  }

  // 2. Validación de Content-Type
  console.log('\n--- 2. Validación de Encabezados (Content-Type) ---');
  {
    const { req, res, getResponse } = createMockHttp({
      method: 'POST',
      headers: { 'content-type': 'text/plain' },
      body: 'hola'
    });
    await handler(req, res);
    const result = getResponse();
    assert('Content-Type distinto a JSON responde HTTP 400', result.status === 400, result.status);
    assert('Mensaje de error claro en español', result.data && result.data.error.includes('Content-Type'), result.data);
  }

  // 3. Límite de tamaño de Payload (Payload Too Large)
  console.log('\n--- 3. Protección contra Payloads Excesivos (>10 KB) ---');
  {
    const giantPayload = {
      nombre: 'Test',
      asistencia: 'si',
      rol: 'docente',
      organizacion: 'A'.repeat(12000)
    };
    const { req, res, getResponse } = createMockHttp({
      method: 'POST',
      body: giantPayload
    });
    await handler(req, res);
    const result = getResponse();
    assert('Payload > 10 KB responde con HTTP 413', result.status === 413, result.status);
  }

  // 4. Honeypot Anti-Spam
  console.log('\n--- 4. Trampa Honeypot para Bots ---');
  {
    const { req, res, getResponse } = createMockHttp({
      method: 'POST',
      body: {
        nombre: 'Spam Bot',
        asistencia: 'si',
        rol: 'invitado',
        website: 'http://malicious-spam-link.com'
      }
    });
    await handler(req, res);
    const result = getResponse();
    assert('Honeypot lleno responde HTTP 200 sin error para engañar al bot', result.status === 200, result.status);
    assert('Respuesta simula éxito con ok: true', result.data && result.data.ok === true, result.data);
  }

  // 5. Validaciones de Reglas de Negocio en Servidor
  console.log('\n--- 5. Validaciones de Negocio en Servidor ---');
  {
    // Nombre muy corto
    const { req, res, getResponse } = createMockHttp({
      method: 'POST',
      body: { nombre: 'A', asistencia: 'si', rol: 'docente' }
    });
    await handler(req, res);
    const result = getResponse();
    assert('Nombre < 2 caracteres responde HTTP 400', result.status === 400, result.status);
  }

  {
    // Rol inválido
    const { req, res, getResponse } = createMockHttp({
      method: 'POST',
      body: { nombre: 'Dra. Carmen', asistencia: 'si', rol: 'astronauta' }
    });
    await handler(req, res);
    const result = getResponse();
    assert('Rol no permitido responde HTTP 400', result.status === 400, result.status);
  }

  {
    // Asistencia no permitida
    const { req, res, getResponse } = createMockHttp({
      method: 'POST',
      body: { nombre: 'Dra. Carmen', asistencia: 'talvez', rol: 'docente' }
    });
    await handler(req, res);
    const result = getResponse();
    assert('Asistencia fuera de {si, no} responde HTTP 400', result.status === 400, result.status);
  }

  {
    // Organización > 120 caracteres
    const { req, res, getResponse } = createMockHttp({
      method: 'POST',
      body: { nombre: 'Dra. Carmen', asistencia: 'si', rol: 'docente', organizacion: 'X'.repeat(121) }
    });
    await handler(req, res);
    const result = getResponse();
    assert('Organización > 120 caracteres responde HTTP 400', result.status === 400, result.status);
  }

  // 6. Sin credenciales de entorno configuradas
  console.log('\n--- 6. Manejo seguro de ausencia de credenciales ---');
  {
    const originalUrl = process.env.SUPABASE_URL;
    const originalKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    delete process.env.SUPABASE_URL;
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;

    const { req, res, getResponse } = createMockHttp({
      method: 'POST',
      body: { nombre: 'Dra. Carmen Velásquez', asistencia: 'si', rol: 'docente' }
    });
    await handler(req, res);
    const result = getResponse();
    assert('Falta de credenciales de entorno responde HTTP 500 amigable', result.status === 500, result.status);
    assert('No expone detalles internos de configuración al cliente', result.data && result.data.ok === false, result.data);

    // Restaurar si existían
    if (originalUrl) process.env.SUPABASE_URL = originalUrl;
    if (originalKey) process.env.SUPABASE_SERVICE_ROLE_KEY = originalKey;
  }

  // 7. Simulación Mock de Supabase REST API (PostgREST)
  console.log('\n--- 7. Mock de Supabase PostgREST (Insert y Unicidad 23505) ---');
  {
    const databaseMock = [];
    let collisionEmitted = false;

    // Servidor HTTP local para interceptar llamadas PostgREST de Supabase
    const mockServer = http.createServer(async (sReq, sRes) => {
      let bodyText = '';
      for await (const chunk of sReq) bodyText += chunk;

      // POST /rest/v1/rsvp_registros
      if (sReq.method === 'POST') {
        const payload = JSON.parse(bodyText);

        // Simulación defensiva de colisión de código único en el primer intento (23505)
        if (!collisionEmitted) {
          collisionEmitted = true;
          sRes.writeHead(409, { 'Content-Type': 'application/json' });
          sRes.end(JSON.stringify({ code: '23505', message: 'duplicate key value violates unique constraint rsvp_registros_codigo_key' }));
          return;
        }

        const id = 'uuid-' + Math.random().toString(36).substring(2);
        databaseMock.push({
          id,
          nombre: payload.nombre,
          asistencia: payload.asistencia,
          rol: payload.rol,
          organizacion: payload.organizacion,
          codigo: payload.codigo,
          origen: payload.origen,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

        sRes.writeHead(201, { 'Content-Type': 'application/json' });
        sRes.end(JSON.stringify([]));
        return;
      }

      sRes.writeHead(404);
      sRes.end();
    });

    await new Promise(resolve => mockServer.listen(0, '127.0.0.1', resolve));
    const port = mockServer.address().port;

    process.env.SUPABASE_URL = `http://127.0.0.1:${port}`;
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'mock-service-role-key-test-only';

    // 7.1 Envío válido inicial con manejo de colisión 23505
    {
      const { req, res, getResponse } = createMockHttp({
        method: 'POST',
        body: {
          nombre: 'Dra. Carmen Velásquez',
          asistencia: 'si',
          rol: 'docente',
          organizacion: 'Instituto RETOS',
          codigo: 'RETOS-AB2345',
          origen: 'web_showcase_2026'
        }
      });
      await handler(req, res);
      const result = getResponse();
      assert('Registro nuevo exitoso con HTTP 200', result.status === 200, result.status);
      assert('Devuelve código generado en formato RETOS-XXXXXX', /^RETOS-[23456789ABCDEFGHJKLMNPQRSTUVWXYZ]{6}$/.test(result.data.code), result.data.code);
      assert('Manejó colisión 23505 simulada con reintento automático', collisionEmitted === true, collisionEmitted);

      const saved = databaseMock[0];
      assert('Guardado en DB con nombre correcto', saved && saved.nombre === 'Dra. Carmen Velásquez', saved);
      assert('Código en DB coincide con respuesta', saved && saved.codigo === result.data.code, saved?.codigo);
    }

    // 7.2 Resiliencia de configuración: SUPABASE_URL con sufijo accidental /rest/v1/
    {
      process.env.SUPABASE_URL = `http://127.0.0.1:${port}/rest/v1/`;
      const { req, res, getResponse } = createMockHttp({
        method: 'POST',
        body: {
          nombre: 'Lic. Roberto Sánchez',
          asistencia: 'si',
          rol: 'empresa',
          organizacion: 'Tech Corp'
        }
      });
      await handler(req, res);
      const result = getResponse();
      assert('Normaliza SUPABASE_URL con sufijo /rest/v1/ y responde HTTP 200', result.status === 200, result.status);
      assert('Genera código correcto a pesar de URL con sufijo', /^RETOS-[23456789ABCDEFGHJKLMNPQRSTUVWXYZ]{6}$/.test(result.data?.code), result.data?.code);
    }

    // Limpiar variables de prueba y cerrar servidor mock
    delete process.env.SUPABASE_URL;
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;
    await new Promise(resolve => mockServer.close(resolve));
  }

  console.log('\n======================================================');
  console.log(` RESULTADOS FINALES: ${passed} PASADAS, ${failed} FALLADAS`);
  console.log('======================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch(err => {
  console.error('Error fatal durante la ejecución de pruebas:', err);
  process.exit(1);
});
