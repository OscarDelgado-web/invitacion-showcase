# INVITACIÓN WEB INTERACTIVA — ACCESS GRANTED: RETOS Showcae 2026 - 2nd Edition

Una experiencia web inmersiva, cinematográfica y accesible desarrollada para el **RETOS Showcae 2026 - 2nd Edition**, organizado por el **Programa de Inglés • RETOS / FTS**.

- **Fecha:** Viernes, 30 de octubre de 2026.
- **Horario Oficial:** 08:00 — 12:30 hrs (GMT-6).
- **Sede:** Biblioteca RETOS, Instituto RETOS • La Libertad, El Salvador.

---

## 📁 Estructura del Proyecto

```
alternativa 3/
├── index.html            # Estructura semántica HTML5, 9 escenas guiadas, Open Graph y A11Y
├── contenido.json        # ÚNICAMENTE la agenda formal dinámica del evento ({ "agenda": [...] })
├── script.js             # Configuración EVENT_META, router de 9 escenas, canvas, audio y RSVPModule
├── styles.css            # Sistema de diseño futurista oscuro (Abyss Dark, Electric Green, Cyber Cyan)
├── assets/               # Favicon local, logotipos del evento y archivo de calendario .ics
│   ├── evento-retos-showcase-2026.ics
│   ├── favicon.png
│   ├── logo-center.png
│   ├── logo-head.png
│   ├── logo-header.jpg
│   └── logo-header.png
├── api/                  # Funciones Serverless de Vercel
│   └── rsvp.js           # Endpoint POST /api/rsvp con Supabase PostgREST, validación y honeypot
├── supabase/             # Scripts de base de datos para Supabase
│   └── schema.sql        # Esquema SQL (tabla public.rsvp_registros, RLS, índices y triggers)
├── test/                 # Pruebas automatizadas locales
│   └── test-rsvp.js      # Suite de 24 pruebas con mock de Supabase PostgREST
├── .env.example          # Plantilla de variables de entorno seguras (valores vacíos)
├── .gitignore            # Exclusión de .env*, .vercel, node_modules y temporales
├── package.json          # Configuración mínima para scripts de desarrollo y pruebas
├── vercel.json           # Configuración de producción: Clean URLs, caché granular y CSP estricto
└── README.md             # Esta documentación técnica y operativa
```

---

## 🔐 Reglas de Seguridad y Variables de Entorno

El proyecto implementa un modelo de seguridad de **Cero Confianza** para credenciales:
- **Ninguna llave secreta va en el código frontend, el repositorio ni el README.**
- La llave `SUPABASE_SERVICE_ROLE_KEY` **nunca se expone al navegador**; se ejecuta exclusivamente dentro de la función serverless `api/rsvp.js`.
- La tabla `public.rsvp_registros` tiene **Row Level Security (RLS) habilitado sin políticas públicas**: ni el rol anónimo (`anon`) ni el autenticado (`authenticated`) tienen permisos de lectura ni escritura directos.

### Variables Requeridas

Copia el archivo `.env.example` como `.env.local` para pruebas con `vercel dev`, o agrégalas en el panel de Vercel (**Settings** → **Environment Variables**):

| Variable | Descripción | Ámbito |
| :--- | :--- | :--- |
| `SUPABASE_URL` | URL base del proyecto en Supabase (ej: `https://xyzcompany.supabase.co`) | Vercel Serverless Function |
| `SUPABASE_SERVICE_ROLE_KEY` | Llave secreta con rol de servicio (`service_role`) | Vercel Serverless Function |

> [!WARNING]
> Nunca uses la clave `anon` para la variable `SUPABASE_SERVICE_ROLE_KEY`. Al tener RLS cerrado, solo `service_role` puede insertar y actualizar los registros desde la función serverless.

---

## 🗄️ Base de Datos: Configuración en Supabase

1. Inicia sesión en tu consola de [Supabase](https://supabase.com) y selecciona tu proyecto.
2. Abre la pestaña **SQL Editor** en el panel lateral izquierdo.
3. Haz clic en **New Query**, copia el contenido completo del archivo [`supabase/schema.sql`](supabase/schema.sql) y pulsa **RUN**.
4. El script creará:
   - La tabla `public.rsvp_registros` con validaciones de longitud y formato (`nombre`, `email`, `asistencia`, `notas`, `codigo`).
   - El índice único `rsvp_registros_lower_email_idx` sobre `lower(email)`, permitiendo actualizar la respuesta si un asistente reenvía el formulario con el mismo correo conservando su código original.
   - La función y trigger para actualizar automáticamente la marca temporal `updated_at`.
   - El aislamiento estricto RLS.

### Consultas de Monitoreo en Supabase

Para consultar las respuestas en tiempo real desde el SQL Editor:

```sql
-- 1. Resumen de asistencia por tipo (si / no)
SELECT asistencia, COUNT(*) AS total
FROM public.rsvp_registros
GROUP BY asistencia
ORDER BY total DESC;

-- 2. Lista de asistentes confirmados con sus códigos oficiales
SELECT nombre, email, codigo, notas, updated_at
FROM public.rsvp_registros
WHERE asistencia = 'si'
ORDER BY updated_at DESC;
```

---

## 🚀 Despliegue en Vercel

### Opción A: Despliegue mediante Vercel CLI
```bash
# 1. Instalar Vercel CLI globalmente (si no lo tienes)
npm i -g vercel

# 2. Iniciar sesión y vincular el proyecto desde la carpeta 'alternativa 3'
vercel

# 3. Configurar variables de entorno en producción
vercel env add SUPABASE_URL
vercel env add SUPABASE_SERVICE_ROLE_KEY

# 4. Desplegar a producción
vercel --prod
```

### Opción B: Despliegue conectando repositorio Git (GitHub / GitLab)
1. Sube el repositorio a GitHub.
2. Importa el proyecto en [Vercel](https://vercel.com/new).
3. Si el repositorio contiene la carpeta `alternativa 3` como subcarpeta, define en Vercel:
   - **Root Directory:** `alternativa 3`
4. En **Environment Variables**, añade `SUPABASE_URL` y `SUPABASE_SERVICE_ROLE_KEY`.
5. Haz clic en **Deploy**.

> [!NOTE]
> Una vez desplegado, actualiza en `index.html` el placeholder `https://[TU-DOMINIO-VERCEL].vercel.app/` por tu dominio real de Vercel en las etiquetas `<link rel="canonical">`, Open Graph y Twitter Cards.

---

## 💻 Ejecución y Pruebas Locales

El proyecto soporta 3 modos de ejecución local:

### 1. Con Servidor de Desarrollo Local Integrado (`npm run dev`) — Recomendado
Permite probar tanto el frontend como la función serverless conectada a Supabase cargando tu archivo `.env` automáticamente sin dependencias externas:
```bash
npm run dev
# o directamente: node dev-server.js
```
Abre en tu navegador `http://127.0.0.1:3000`.

### 2. Con Vercel CLI (`npm run vercel:dev`)
Permite probar en el entorno CLI oficial de Vercel:
```bash
npm run vercel:dev
```

### 3. Con Servidor Estático Local (VS Code Live Server / Python)
```bash
python -m http.server 8080
# o Live Server en VS Code (puerto 5500)
```
En este modo, si la API `/api/rsvp` no está activa o el servidor estático rechaza peticiones POST (como Live Server con HTTP 405), el formulario activa automáticamente el **Modo Demostrativo Local**, permitiendo validar la experiencia, el código QR y la descarga del pase sin bloqueos.

### 4. Apertura directa mediante protocolo `file://`
El sitio está completamente optimizado para abrirse haciendo doble clic directamente en `index.html`. No requiere ningún servidor ni conexión a internet para renderizar el contenido institucional, audio Web Audio, animaciones de canvas y respaldo de la agenda cronológica (`FALLBACK_CONTENT`).

### 5. Ejecutar la Suite de Pruebas Automatizadas
Para verificar el comportamiento de la función serverless (validación de métodos, honeypot, límites de tamaño, reintentos de colisión y upsert sin duplicados):
```bash
npm test
# o: node test/test-rsvp.js
```

---

## 📝 Cómo Editar la Agenda de Actividades

La agenda formal cronológica de 22 bloques reside exclusivamente en [`contenido.json`](contenido.json). Para agregar, modificar o reprogramar actividades, edita dicho archivo manteniendo su estructura JSON:

```json
{
  "agenda": [
    {
      "id": "ag-01",
      "fecha": "2026-10-30",
      "horaInicio": "08:00",
      "horaFin": "08:05",
      "titulo": "Opening Ceremony",
      "descripcion": "Ceremonia de apertura del RETOS Showcae 2026 - 2nd Edition y bienvenida a estudiantes e invitados.",
      "responsable": "Programa de Inglés RETOS / FTS",
      "estado": "destacado",
      "tipo": "protocolo"
    }
  ]
}
```

- **Estados visuales admitidos:** `destacado`, `confirmado`, `en-curso`, `proximo`.
- **Tipos de actividad e iconografía:** `protocolo`, `inauguracion`, `ponencia`, `showcase`, `logistica`, `debate`, `networking`, `clausura`.
- Los contadores de bloques y el rango de horario se calculan y actualizan automáticamente en pantalla a partir de los datos del JSON.

---

## ♿ Accesibilidad y Rendimiento

- **Navegación por teclado:** Controles globales mediante flechas (<kbd>→</kbd>, <kbd>←</kbd>), <kbd>Espacio</kbd>, <kbd>AvPág</kbd>, <kbd>RePág</kbd> y <kbd>Esc</kbd>.
- **Lectores de pantalla:** Regiones ARIA en vivo (`aria-live="polite"` y `aria-live="assertive"`), atributos `aria-invalid` y `aria-busy` dinámicos en el formulario.
- **Eficiencia energética:** `CanvasEngine` detecta `visibilitychange` para suspender completamente los ciclos de renderizado cuando la pestaña pasa a segundo plano, y escucha cambios dinámicos de `prefers-reduced-motion`.
- **Audio Web Audio nativo:** Sintetizador sin archivos externos de audio, con opción de silenciado contextual mediante tecla <kbd>M</kbd>.
