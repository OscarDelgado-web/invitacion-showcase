/**
 * ==========================================================================
 * ACCESS GRANTED — INVITACIÓN WEB INTERACTIVA (ALTERNATIVA 3)
 * RETOS Showcase 2026 • Programa de Inglés, RETOS / FTS
 *
 * Arquitectura modular Vanilla ES6+ desacoplada:
 * 1. EVENT_META: Configuración centralizada y metadatos del evento
 * 2. FALLBACK_CONTENT: Respaldo local de agenda para protocolo file:// o sin red
 * 3. DOM Utilities: Manipulación defensiva y segura del DOM sin errores nulos
 * 4. DataService: Consumo asíncrono vía Fetch API de contenido.json (solo agenda)
 * 5. SoundEngine: Sintetizador Web Audio nativo (0 dependencias)
 * 6. CanvasEngine: Fondo interactivo de partículas cinéticas a 60 FPS
 * 7. CalendarService: Generador RFC 5545 (.ics) y enlace a Google Maps
 * 8. Toast: Sistema de notificaciones contextuales HUD
 * 9. VerificationModule: Escena 02 (Secuencia de verificación de credenciales)
 * 10. RSVPModule: Escena 08 (Validación semántica accesible y modo demostrativo)
 * 11. CountdownEngine: Cuenta regresiva oficial en tiempo real hacia el evento
 * 12. UIRenderer: Renderizado modular de la agenda formal y telemetría
 * 13. NavigationEngine: Router y conmutador de 9 escenas con A11Y e historial
 * 14. App Bootstrap: Inicialización tolerante a fallos
 * ==========================================================================
 */

'use strict';

/* ==========================================================================
   1. METADATOS Y CONFIGURACIÓN CENTRALIZADA DEL EVENTO (EVENT_META)
   Configuración técnica de logística, calendario, zona horaria y RSVP.
   No renderiza contenido textual estático (ese reside directamente en HTML).
   Zona horaria: America/El_Salvador (UTC-6, sin horario de verano).
   ========================================================================== */
const EVENT_META = {
  codigo: "RETOS-SHOWCASE-2026 - 2nd Edition",
  titulo: "RETOS Showcase 2026 - 2nd Edition",
  inicio: "2026-10-30T08:00:00",
  fin: "2026-10-30T12:30:00",
  sede: "Biblioteca RETOS",
  direccion: "Biblioteca RETOS, Instituto RETOS",
  ciudad: "La Libertad",
  pais: "El Salvador",
  mapsQuery: "Instituto Tecnológico RETOS de la Libertad, El Salvador",
  rsvpEndpoint: "/api/rsvp",
  latenciaSimuladaMs: 800
};

/* ==========================================================================
   2. RESPALDO LOCAL DE AGENDA (FALLBACK_CONTENT)
   Garantiza funcionamiento offline y en navegadores con restricciones de CORS
   cuando el archivo se ejecuta directamente mediante protocolo file://.
   ========================================================================== */
const FALLBACK_CONTENT = {
  agenda: [
    {
      id: "ag-01",
      fecha: "2026-10-30",
      horaInicio: "08:00",
      horaFin: "08:05",
      titulo: "Opening Ceremony",
      descripcion: "Ceremonia de apertura del RETOS Showcase 2026 y bienvenida a estudiantes e invitados.",
      responsable: "Estudiantes RETOS",
      estado: "destacado",
      tipo: "protocolo"
    },
    {
      id: "ag-02",
      fecha: "2026-10-30",
      horaInicio: "08:05",
      horaFin: "08:10",
      titulo: "RETOS Brainstorm",
      descripcion: "Dinámica de lluvia de ideas en inglés para dar inicio a la jornada.",
      responsable: "Estudiantes RETOS",
      estado: "confirmado",
      tipo: "debate"
    },
    {
      id: "ag-03",
      fecha: "2026-10-30",
      horaInicio: "08:10",
      horaFin: "08:25",
      titulo: "Logistics Project: Ice Cream and Popsicle Producer",
      descripcion: "Proyecto de Logística presentado en inglés: productor de helados y paletas.",
      responsable: "Estudiantes de Logística",
      estado: "confirmado",
      tipo: "showcase"
    },
    {
      id: "ag-04",
      fecha: "2026-10-30",
      horaInicio: "08:25",
      horaFin: "08:40",
      titulo: "Role-Play: The New Employee",
      descripcion: "Simulación en inglés de una situación laboral: la llegada de un nuevo empleado.",
      responsable: "Estudiantes RETOS",
      estado: "confirmado",
      tipo: "debate"
    },
    {
      id: "ag-05",
      fecha: "2026-10-30",
      horaInicio: "08:40",
      horaFin: "08:45",
      titulo: "NEO Certification Progress Overview",
      descripcion: "Resumen del avance de los estudiantes en las certificaciones de la plataforma Neo.",
      responsable: "Neo y Estudiantes RETOS",
      estado: "confirmado",
      tipo: "ponencia"
    },
    {
      id: "ag-06",
      fecha: "2026-10-30",
      horaInicio: "08:45",
      horaFin: "09:00",
      titulo: "Ice Breaker: Guess the Word",
      descripcion: "Dinámica participativa en inglés para adivinar la palabra.",
      responsable: "Estudiantes RETOS",
      estado: "confirmado",
      tipo: "networking"
    },
    {
      id: "ag-07",
      fecha: "2026-10-30",
      horaInicio: "09:00",
      horaFin: "09:20",
      titulo: "First English Certificate Award",
      descripcion: "Primera entrega de certificaciones de inglés alcanzadas por los estudiantes.",
      responsable: "Estudiantes RETOS",
      estado: "destacado",
      tipo: "inauguracion"
    },
    {
      id: "ag-08",
      fecha: "2026-10-30",
      horaInicio: "09:20",
      horaFin: "09:30",
      titulo: "Break",
      descripcion: "Receso de la jornada.",
      responsable: "RETOS / FTS",
      estado: "confirmado",
      tipo: "logistica"
    },
    {
      id: "ag-09",
      fecha: "2026-10-30",
      horaInicio: "09:30",
      horaFin: "09:45",
      titulo: "Ice Breaker: Treasure Hunt",
      descripcion: "Dinámica participativa en inglés: búsqueda del tesoro.",
      responsable: "Estudiantes RETOS",
      estado: "confirmado",
      tipo: "networking"
    },
    {
      id: "ag-10",
      fecha: "2026-10-30",
      horaInicio: "09:45",
      horaFin: "10:00",
      titulo: "Software Project: RETOS Mentor",
      descripcion: "Proyecto de Desarrollo de Software presentado en inglés: RETOS Mentor.",
      responsable: "Estudiantes de Desarrollo de Software",
      estado: "confirmado",
      tipo: "showcase"
    },
    {
      id: "ag-11",
      fecha: "2026-10-30",
      horaInicio: "10:00",
      horaFin: "10:15",
      titulo: "Role-Play: The Power of Neo Study",
      descripcion: "Simulación en inglés sobre el valor de estudiar con la plataforma Neo.",
      responsable: "Estudiantes RETOS",
      estado: "confirmado",
      tipo: "debate"
    },
    {
      id: "ag-12",
      fecha: "2026-10-30",
      horaInicio: "10:15",
      horaFin: "10:20",
      titulo: "NEO Study Experience Video",
      descripcion: "Video sobre la experiencia de estudio con Neo.",
      responsable: "Neo y Estudiantes RETOS",
      estado: "confirmado",
      tipo: "ponencia"
    },
    {
      id: "ag-13",
      fecha: "2026-10-30",
      horaInicio: "10:20",
      horaFin: "10:35",
      titulo: "Mechatronics Project: Pick and Place",
      descripcion: "Proyecto de Mecatrónica presentado en inglés: sistema Pick and Place.",
      responsable: "Estudiantes de Mecatrónica",
      estado: "confirmado",
      tipo: "showcase"
    },
    {
      id: "ag-14",
      fecha: "2026-10-30",
      horaInicio: "10:35",
      horaFin: "10:50",
      titulo: "Ice Breaker: The Queen Says",
      descripcion: "Dinámica participativa en inglés: The Queen Says.",
      responsable: "Estudiantes RETOS",
      estado: "confirmado",
      tipo: "networking"
    },
    {
      id: "ag-15",
      fecha: "2026-10-30",
      horaInicio: "10:50",
      horaFin: "11:05",
      titulo: "Role-Play: The PPE Incident",
      descripcion: "Simulación en inglés de una situación de seguridad industrial: el incidente del equipo de protección personal (PPE).",
      responsable: "Estudiantes RETOS",
      estado: "confirmado",
      tipo: "debate"
    },
    {
      id: "ag-16",
      fecha: "2026-10-30",
      horaInicio: "11:05",
      horaFin: "11:20",
      titulo: "Industrial Maintenance Project: Autodesk Inventor ('F1 car')",
      descripcion: "Proyecto de Mantenimiento Industrial presentado en inglés, diseñado en Autodesk Inventor: un auto de F1.",
      responsable: "Estudiantes de Mantenimiento Industrial",
      estado: "confirmado",
      tipo: "showcase"
    },
    {
      id: "ag-17",
      fecha: "2026-10-30",
      horaInicio: "11:20",
      horaFin: "11:35",
      titulo: "Ice Breaker: Vocabulary Challenge",
      descripcion: "Dinámica participativa en inglés: reto de vocabulario.",
      responsable: "Estudiantes RETOS",
      estado: "confirmado",
      tipo: "networking"
    },
    {
      id: "ag-18",
      fecha: "2026-10-30",
      horaInicio: "11:35",
      horaFin: "11:50",
      titulo: "Role-Play: Boss vs. Machine",
      descripcion: "Simulación en inglés de una situación laboral: el jefe frente a la máquina.",
      responsable: "Estudiantes RETOS",
      estado: "confirmado",
      tipo: "debate"
    },
    {
      id: "ag-19",
      fecha: "2026-10-30",
      horaInicio: "11:50",
      horaFin: "12:10",
      titulo: "Second English Certificate Award",
      descripcion: "Segunda entrega de certificaciones de inglés alcanzadas por los estudiantes.",
      responsable: "Estudiantes RETOS",
      estado: "destacado",
      tipo: "inauguracion"
    },
    {
      id: "ag-20",
      fecha: "2026-10-30",
      horaInicio: "12:10",
      horaFin: "12:15",
      titulo: "RETOS Video",
      descripcion: "Video institucional de RETOS.",
      responsable: "RETOS / FTS",
      estado: "confirmado",
      tipo: "ponencia"
    },
    {
      id: "ag-21",
      fecha: "2026-10-30",
      horaInicio: "12:15",
      horaFin: "12:25",
      titulo: "Closing Remarks",
      descripcion: "Palabras de cierre de la jornada.",
      responsable: "Estudiantes RETOS",
      estado: "confirmado",
      tipo: "protocolo"
    },
    {
      id: "ag-22",
      fecha: "2026-10-30",
      horaInicio: "12:25",
      horaFin: "12:30",
      titulo: "Official Closing",
      descripcion: "Clausura oficial del RETOS Showcase 2026.",
      responsable: "Estudiantes RETOS",
      estado: "destacado",
      tipo: "clausura"
    }
  ]
};

/* ==========================================================================
   3. UTILITARIOS DEFENSIVOS DEL DOM (DOM HELPER)
   Previene errores de tipo 'Cannot set properties of null' en el ciclo de vida.
   ========================================================================== */
const DOM = {
  safeText(selectorOrEl, text) {
    const el = typeof selectorOrEl === 'string' ? document.querySelector(selectorOrEl) : selectorOrEl;
    if (el && text !== undefined && text !== null) {
      el.textContent = text;
    }
    return el;
  },

  safeHTML(selectorOrEl, html) {
    const el = typeof selectorOrEl === 'string' ? document.querySelector(selectorOrEl) : selectorOrEl;
    if (el && html !== undefined && html !== null) {
      el.innerHTML = html;
    }
    return el;
  },

  safeAttr(selectorOrEl, attr, value) {
    const el = typeof selectorOrEl === 'string' ? document.querySelector(selectorOrEl) : selectorOrEl;
    if (el && attr) {
      if (value === null) {
        el.removeAttribute(attr);
      } else {
        el.setAttribute(attr, value);
      }
    }
    return el;
  },

  show(selectorOrEl) {
    const el = typeof selectorOrEl === 'string' ? document.querySelector(selectorOrEl) : selectorOrEl;
    if (el) el.classList.remove('is-hidden');
    return el;
  },

  hide(selectorOrEl) {
    const el = typeof selectorOrEl === 'string' ? document.querySelector(selectorOrEl) : selectorOrEl;
    if (el) el.classList.add('is-hidden');
    return el;
  },

  toggle(selectorOrEl, visible) {
    const el = typeof selectorOrEl === 'string' ? document.querySelector(selectorOrEl) : selectorOrEl;
    if (el) el.classList.toggle('is-hidden', !visible);
    return el;
  }
};

/* ==========================================================================
   4. SERVICIO DE DATOS ASÍNCRONO (FETCH API)
   Carga desacoplada de la agenda desde contenido.json con fallback defensivo.
   ========================================================================== */
const DataService = {
  agenda: null,

  async loadAgenda(url = 'contenido.json') {
    try {
      const response = await fetch(url, {
        headers: { 'Accept': 'application/json' },
        cache: 'no-cache'
      });

      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}: ${response.statusText}`);
      }

      const json = await response.json();
      this.agenda = Array.isArray(json) ? json : (json.agenda || FALLBACK_CONTENT.agenda);
      console.log('✔ [DataService] Agenda cargada exitosamente desde:', url);
      return this.agenda;
    } catch (err) {
      console.warn('⚠ [DataService] Fetch falló o se bloqueó por política local (CORS/file://). Activando respaldo local tolerante a fallos.', err);
      this.agenda = FALLBACK_CONTENT.agenda;
      return this.agenda;
    }
  },

  getAgenda() {
    return this.agenda || FALLBACK_CONTENT.agenda;
  }
};

/* ==========================================================================
   5. MOTOR DE SONIDO SINTÉTICO (WEB AUDIO API)
   Genera retroalimentación háptica y acústica sin dependencias externas.
   ========================================================================== */
const SoundEngine = (() => {
  let ctx = null;
  let isMuted = false;

  const initCtx = () => {
    if (!ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) ctx = new AudioCtx();
    }
    if (ctx && ctx.state === 'suspended') {
      ctx.resume();
    }
  };

  const playBlip = (freq = 600, duration = 0.04, type = 'sine', gainVal = 0.06) => {
    if (isMuted) return;
    try {
      initCtx();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(freq * 0.5, ctx.currentTime + duration);

      gain.gain.setValueAtTime(gainVal, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (_) {}
  };

  const playSuccessChime = () => {
    if (isMuted) return;
    try {
      initCtx();
      if (!ctx) return;
      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
      notes.forEach((freq, idx) => {
        setTimeout(() => {
          try {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, ctx.currentTime);
            gain.gain.setValueAtTime(0.08, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.3);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start();
            osc.stop(ctx.currentTime + 0.3);
          } catch (_) {}
        }, idx * 65);
      });
    } catch (_) {}
  };

  const playErrorTone = () => {
    if (isMuted) return;
    try {
      initCtx();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(180, ctx.currentTime);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.15);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.15);
    } catch (_) {}
  };

  const toggleMute = () => {
    isMuted = !isMuted;
    return isMuted;
  };

  return {
    click: () => playBlip(800, 0.03, 'sine', 0.05),
    nav: () => playBlip(540, 0.05, 'triangle', 0.06),
    success: playSuccessChime,
    error: playErrorTone,
    toggleMute,
    isMuted: () => isMuted
  };
})();

/* ==========================================================================
   6. CANVAS DE FONDO AMBIENTAL Y PARTÍCULAS
   Optimizado para 60 FPS con pausa en inactividad y prefers-reduced-motion.
   ========================================================================== */
const CanvasEngine = (() => {
  const canvas = document.getElementById('ambient-canvas');
  if (!canvas) return { init: () => {} };

  const ctx = canvas.getContext('2d');
  let width = 0;
  let height = 0;
  let animId = null;
  let isRunning = false;
  const particles = [];
  const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  let prefersReduced = motionQuery.matches;

  const resize = () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    initParticles();
  };

  const initParticles = () => {
    particles.length = 0;
    if (prefersReduced) return;

    const count = Math.min(48, Math.floor(width / 28));
    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.35,
        vy: -0.15 - Math.random() * 0.45,
        size: Math.random() * 1.6 + 0.6,
        alpha: Math.random() * 0.5 + 0.2,
        cyan: Math.random() > 0.65
      });
    }
  };

  const render = () => {
    if (document.hidden || prefersReduced) {
      isRunning = false;
      return;
    }

    ctx.clearRect(0, 0, width, height);

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      p.x += p.vx;
      p.y += p.vy;

      if (p.y < 0) {
        p.y = height + 4;
        p.x = Math.random() * width;
      }
      if (p.x < 0) p.x = width;
      if (p.x > width) p.x = 0;

      ctx.fillStyle = p.cyan 
        ? `rgba(203, 239, 82, ${p.alpha})`
        : `rgba(160, 197, 37, ${p.alpha})`;
      ctx.fillRect(p.x, p.y, p.size, p.size);
    }

    // Líneas sutiles de interconexión reticular
    ctx.lineWidth = 0.5;
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = dx * dx + dy * dy;
        if (dist < 5400) {
          const lineAlpha = (1 - dist / 5400) * 0.12;
          ctx.strokeStyle = `rgba(160, 197, 37, ${lineAlpha})`;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
        }
      }
    }

    animId = requestAnimationFrame(render);
  };

  const startAnimation = () => {
    if (isRunning || prefersReduced || document.hidden) return;
    isRunning = true;
    animId = requestAnimationFrame(render);
  };

  const stopAnimation = () => {
    isRunning = false;
    if (animId) {
      cancelAnimationFrame(animId);
      animId = null;
    }
  };

  return {
    init: () => {
      resize();
      window.addEventListener('resize', resize, { passive: true });

      // Pausar completamente en segundo plano para ahorrar batería y GPU
      document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
          stopAnimation();
        } else {
          startAnimation();
        }
      });

      // Escuchar cambios dinámicos de prefers-reduced-motion
      if (motionQuery.addEventListener) {
        motionQuery.addEventListener('change', (e) => {
          prefersReduced = e.matches;
          if (prefersReduced) {
            stopAnimation();
            ctx.clearRect(0, 0, width, height);
          } else {
            initParticles();
            startAnimation();
          }
        });
      }

      startAnimation();
    }
  };
})();

/* ==========================================================================
   7. SERVICIO DE CALENDARIO (.ICS) Y LOCALIZACIÓN
   Lee exclusivamente de EVENT_META. Cumple con RFC 5545 para America/El_Salvador.
   ========================================================================== */
const CalendarService = {
  formatICSDate(dateStr) {
    const d = new Date(dateStr);
    const pad = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}T${pad(d.getHours())}${pad(d.getMinutes())}00`;
  },

  escapeICS(str) {
    if (!str) return '';
    return str
      .replace(/[\\;,]/g, '\\$&')
      .replace(/\r\n|\n|\r/g, '\\n');
  },

  downloadICS() {
    SoundEngine.click();

    const dtStamp = new Date().toISOString().replace(/[-:]|\.\d{3}/g, '');
    const dtStart = CalendarService.formatICSDate(EVENT_META.inicio);
    const dtEnd = CalendarService.formatICSDate(EVENT_META.fin);

    const descriptionText = `${EVENT_META.titulo} — Estudiantes RETOS.\nActividad presencial durante toda la mañana en la Biblioteca de RETOS / FTS.\nSe desarrollará la entrega de certificaciones y demostración de competencias comunicativas.`;
    const locationText = `${EVENT_META.sede}, ${EVENT_META.ciudad}, ${EVENT_META.pais}`;

    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Instituto RETOS//RETOS Showcase 2026//ES',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'BEGIN:VTIMEZONE',
      'TZID:America/El_Salvador',
      'LAST-MODIFIED:20260101T000000Z',
      'TZURL:http://tzurl.org/zoneinfo-outlook/America/El_Salvador',
      'X-LIC-LOCATION:America/El_Salvador',
      'BEGIN:STANDARD',
      'TZNAME:CST',
      'TZOFFSETFROM:-0600',
      'TZOFFSETTO:-0600',
      'DTSTART:19700101T000000',
      'END:STANDARD',
      'END:VTIMEZONE',
      'BEGIN:VEVENT',
      `UID:${Date.now()}-${Math.random().toString(36).substring(2, 9)}@retos.edu.sv`,
      `DTSTAMP:${dtStamp}`,
      `DTSTART;TZID=America/El_Salvador:${dtStart}`,
      `DTEND;TZID=America/El_Salvador:${dtEnd}`,
      `SUMMARY:${CalendarService.escapeICS(EVENT_META.titulo)}`,
      `DESCRIPTION:${CalendarService.escapeICS(descriptionText)}`,
      `LOCATION:${CalendarService.escapeICS(locationText)}`,
      'STATUS:CONFIRMED',
      'BEGIN:VALARM',
      'TRIGGER:-PT24H',
      'ACTION:DISPLAY',
      `DESCRIPTION:Recordatorio del evento ${EVENT_META.titulo}`,
      'END:VALARM',
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `evento-${(EVENT_META.codigo || 'retos').toLowerCase()}.ics`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 2000);

    Toast.show('✔ Archivo de calendario (.ics) descargado con éxito');
  },

  getQuery() {
    return EVENT_META.mapsQuery || `${EVENT_META.sede}, ${EVENT_META.ciudad}, ${EVENT_META.pais}`;
  },

  openGoogleMaps() {
    SoundEngine.click();
    const query = encodeURIComponent(this.getQuery());
    const mapsUrl = (EVENT_META.lat && EVENT_META.lng)
      ? `https://www.google.com/maps/dir/?api=1&destination=${EVENT_META.lat},${EVENT_META.lng}`
      : `https://www.google.com/maps/search/?api=1&query=${query}`;
    window.open(mapsUrl, '_blank', 'noopener,noreferrer');
  },

  openWaze() {
    SoundEngine.click();
    const query = encodeURIComponent(this.getQuery());
    const wazeUrl = (EVENT_META.lat && EVENT_META.lng)
      ? `https://waze.com/ul?ll=${EVENT_META.lat},${EVENT_META.lng}&navigate=yes`
      : `https://waze.com/ul?q=${query}&navigate=yes`;
    window.open(wazeUrl, '_blank', 'noopener,noreferrer');
  },

  openAppleMaps() {
    SoundEngine.click();
    const query = encodeURIComponent(this.getQuery());
    // Formato universal que abre la app en iOS/macOS y el visor web oficial en otras plataformas
    const appleUrl = (EVENT_META.lat && EVENT_META.lng)
      ? `https://maps.apple.com/?daddr=${EVENT_META.lat},${EVENT_META.lng}&q=${query}`
      : `https://maps.apple.com/?daddr=${query}`;
    window.open(appleUrl, '_blank', 'noopener,noreferrer');
  },

  openMap(provider) {
    switch ((provider || '').toLowerCase()) {
      case 'google': return this.openGoogleMaps();
      case 'waze': return this.openWaze();
      case 'apple': return this.openAppleMaps();
      default: return this.openGoogleMaps();
    }
  }
};

/* ==========================================================================
   8. SISTEMA DE TOAST HUD
   ========================================================================== */
const Toast = {
  timeoutId: null,
  show(message, duration = 3200) {
    const el = document.getElementById('hud-toast');
    if (!el) return;
    el.textContent = message;
    el.classList.add('show');
    if (this.timeoutId) clearTimeout(this.timeoutId);
    this.timeoutId = setTimeout(() => {
      el.classList.remove('show');
    }, duration);
  }
};

/* ==========================================================================
   9. MÓDULO DE VERIFICACIÓN (ESCENA 02)
   Simula la autorización de acceso institucional de forma cinemática.
   ========================================================================== */
const VerificationModule = (() => {
  const steps = [
    { text: "Estableciendo enlace cifrado con el nodo institucional RETOS...", status: "CONECTADO" },
    { text: "Validando firma digital y protocolo de acreditación...", status: "VERIFICADO" },
    { text: "Sincronizando agenda académica y credenciales de sala...", status: "COMPLETADO" },
    { text: "Autorizando acceso oficial al entorno del evento...", status: "AUTORIZADO" }
  ];

  let timers = [];
  let isRunning = false;
  let isCompleted = false;

  const logList = document.getElementById('verification-log');
  const meterFill = document.getElementById('verification-progress-fill');
  const percentLabel = document.getElementById('verification-percent');
  const statusIndicator = document.getElementById('verify-status-indicator');
  const grantBanner = document.getElementById('access-grant-banner');
  const btnSkip = document.getElementById('btn-skip-verify');
  const getContinueBtn = () => document.getElementById('btn-confirm-attendance') || document.getElementById('btn-continue-verify');

  const clearTimers = () => {
    timers.forEach(t => clearTimeout(t));
    timers = [];
  };

  const completeVerification = () => {
    clearTimers();
    isRunning = false;
    isCompleted = true;

    if (logList) {
      logList.innerHTML = steps.map(s => `
        <li class="log-entry visible">
          <span class="log-prefix">&gt;</span>
          <span class="log-text">${s.text}</span>
          <span class="log-status ok">[${s.status}]</span>
        </li>
      `).join('');
    }

    if (meterFill) meterFill.style.width = '100%';
    if (percentLabel) percentLabel.textContent = '100%';
    if (statusIndicator) {
      statusIndicator.textContent = 'ACCESO CONCEDIDO';
    }

    if (grantBanner) grantBanner.classList.add('show');
    DOM.hide(btnSkip);
    const btnContinue = getContinueBtn();
    DOM.show(btnContinue);
    if (btnContinue) btnContinue.focus();

    SoundEngine.success();
  };

  const run = () => {
    if (isCompleted) return;
    isRunning = true;
    clearTimers();

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) {
      completeVerification();
      return;
    }

    if (logList) logList.innerHTML = '';
    if (meterFill) meterFill.style.width = '0%';
    if (percentLabel) percentLabel.textContent = '0%';
    if (statusIndicator) statusIndicator.textContent = 'PROCESANDO...';
    if (grantBanner) grantBanner.classList.remove('show');
    DOM.hide(getContinueBtn());
    DOM.show(btnSkip);

    const stepDuration = 550;

    steps.forEach((step, idx) => {
      const t = setTimeout(() => {
        if (!logList) return;
        const li = document.createElement('li');
        li.className = 'log-entry';
        li.innerHTML = `
          <span class="log-prefix">&gt;</span>
          <span class="log-text">${step.text}</span>
          <span class="log-status ok">[${step.status}]</span>
        `;
        logList.appendChild(li);
        requestAnimationFrame(() => li.classList.add('visible'));

        const pct = Math.round(((idx + 1) / steps.length) * 100);
        if (meterFill) meterFill.style.width = `${pct}%`;
        if (percentLabel) percentLabel.textContent = `${pct}%`;

        SoundEngine.click();
      }, (idx + 1) * stepDuration);
      timers.push(t);
    });

    const finalTimer = setTimeout(() => {
      completeVerification();
    }, (steps.length + 1) * stepDuration);
    timers.push(finalTimer);
  };

  return {
    start: run,
    skip: completeVerification,
    reset: () => {
      clearTimers();
      isCompleted = false;
      isRunning = false;
      if (logList) logList.innerHTML = '';
      if (meterFill) meterFill.style.width = '0%';
      if (percentLabel) percentLabel.textContent = '0%';
      if (statusIndicator) statusIndicator.textContent = 'PROCESANDO...';
      if (grantBanner) grantBanner.classList.remove('show');
      DOM.hide(getContinueBtn());
      DOM.show(btnSkip);
    }
  };
})();

/* ==========================================================================
   9b. MOTOR DE CÓDIGO QR VECTORIAL Y PASE DIGITAL DE ENTRADA (QR ENGINE)
   Generación nativa en cliente de matriz QR Model 2 y pase digital descargable.
   0 dependencias externas. Totalmente offline y compatible con CSP estricto.
   ========================================================================== */
const QREngine = (() => {
  const GF256_EXP = new Uint8Array(512);
  const GF256_LOG = new Uint8Array(256);

  (function initGF() {
    let x = 1;
    for (let i = 0; i < 255; i++) {
      GF256_EXP[i] = x;
      GF256_EXP[i + 255] = x;
      GF256_LOG[x] = i;
      x <<= 1;
      if (x & 256) x ^= 0x11d;
    }
    GF256_LOG[0] = 0;
  })();

  function gfMul(x, y) {
    if (x === 0 || y === 0) return 0;
    return GF256_EXP[GF256_LOG[x] + GF256_LOG[y]];
  }

  function polyMul(p1, p2) {
    const result = new Uint8Array(p1.length + p2.length - 1);
    for (let i = 0; i < p1.length; i++) {
      for (let j = 0; j < p2.length; j++) {
        result[i + j] ^= gfMul(p1[i], p2[j]);
      }
    }
    return result;
  }

  function rsCompute(data, eccLength) {
    let gen = new Uint8Array([1]);
    for (let i = 0; i < eccLength; i++) {
      gen = polyMul(gen, new Uint8Array([1, GF256_EXP[i]]));
    }
    const res = new Uint8Array(eccLength);
    for (let i = 0; i < data.length; i++) {
      const factor = data[i] ^ res[0];
      for (let j = 0; j < eccLength - 1; j++) {
        res[j] = res[j + 1] ^ gfMul(gen[j + 1], factor);
      }
      res[eccLength - 1] = gfMul(gen[eccLength], factor);
    }
    return res;
  }

  const QR_VERSIONS = [
    null,
    { v: 1, size: 21, dataCap: 16, ecBytes: 10, align: [] },
    { v: 2, size: 25, dataCap: 28, ecBytes: 16, align: [6, 18] },
    { v: 3, size: 29, dataCap: 44, ecBytes: 26, align: [6, 22] },
    { v: 4, size: 33, dataCap: 64, ecBytes: 36, align: [6, 26] },
    { v: 5, size: 37, dataCap: 86, ecBytes: 48, align: [6, 30] }
  ];

  function encode(text) {
    const utf8 = typeof TextEncoder !== 'undefined'
      ? new TextEncoder().encode(text)
      : Array.from(unescape(encodeURIComponent(text))).map(c => c.charCodeAt(0));

    let verObj = null;
    for (let i = 1; i < QR_VERSIONS.length; i++) {
      if (utf8.length + 3 <= QR_VERSIONS[i].dataCap) {
        verObj = QR_VERSIONS[i];
        break;
      }
    }
    if (!verObj) verObj = QR_VERSIONS[4];

    const bits = [];
    const pushBits = (val, len) => {
      for (let i = len - 1; i >= 0; i--) bits.push((val >>> i) & 1);
    };

    pushBits(0b0100, 4); // Modo Byte
    pushBits(utf8.length, 8); // Conteo de caracteres
    for (let i = 0; i < utf8.length; i++) pushBits(utf8[i], 8);

    const maxDataBits = verObj.dataCap * 8;
    const termLen = Math.min(4, maxDataBits - bits.length);
    pushBits(0, termLen);
    while (bits.length % 8 !== 0) bits.push(0);

    const dataBytes = new Uint8Array(verObj.dataCap);
    for (let i = 0; i < bits.length / 8; i++) {
      let b = 0;
      for (let j = 0; j < 8; j++) b = (b << 1) | bits[i * 8 + j];
      dataBytes[i] = b;
    }
    let padToggle = false;
    for (let i = bits.length / 8; i < verObj.dataCap; i++) {
      dataBytes[i] = padToggle ? 0x11 : 0xec;
      padToggle = !padToggle;
    }

    const ec = rsCompute(dataBytes, verObj.ecBytes);
    const allCodewords = new Uint8Array(verObj.dataCap + verObj.ecBytes);
    allCodewords.set(dataBytes, 0);
    allCodewords.set(ec, verObj.dataCap);

    const N = verObj.size;
    const matrix = Array.from({ length: N }, () => new Int8Array(N).fill(-1));

    const placeFinder = (row, col) => {
      for (let r = 0; r < 7; r++) {
        for (let c = 0; c < 7; c++) {
          const isBorder = (r === 0 || r === 6 || c === 0 || c === 6);
          const isCore = (r >= 2 && r <= 4 && c >= 2 && c <= 4);
          matrix[row + r][col + c] = (isBorder || isCore) ? 1 : 0;
        }
      }
    };

    placeFinder(0, 0);
    placeFinder(0, N - 7);
    placeFinder(N - 7, 0);

    for (let i = 0; i < 8; i++) {
      if (7 < N && i < N) matrix[7][i] = 0;
      if (i < N && 7 < N) matrix[i][7] = 0;
      if (7 < N && N - 8 + i < N) matrix[7][N - 8 + i] = 0;
      if (i < N && N - 8 < N) matrix[i][N - 8] = 0;
      if (N - 8 < N && i < N) matrix[N - 8][i] = 0;
      if (N - 8 + i < N && 7 < N) matrix[N - 8 + i][7] = 0;
    }

    for (let i = 8; i < N - 8; i++) {
      if (matrix[6][i] === -1) matrix[6][i] = (i % 2 === 0) ? 1 : 0;
      if (matrix[i][6] === -1) matrix[i][6] = (i % 2 === 0) ? 1 : 0;
    }

    if (verObj.align.length > 0) {
      for (const r of verObj.align) {
        for (const c of verObj.align) {
          if ((r <= 8 && c <= 8) || (r <= 8 && c >= N - 8) || (r >= N - 8 && c <= 8)) continue;
          for (let dr = -2; dr <= 2; dr++) {
            for (let dc = -2; dc <= 2; dc++) {
              const isBorder = Math.abs(dr) === 2 || Math.abs(dc) === 2;
              const isCenter = (dr === 0 && dc === 0);
              matrix[r + dr][c + dc] = (isBorder || isCenter) ? 1 : 0;
            }
          }
        }
      }
    }

    matrix[4 * verObj.v + 9][8] = 1;

    for (let i = 0; i < 9; i++) {
      if (matrix[8][i] === -1) matrix[8][i] = 0;
      if (matrix[i][8] === -1) matrix[i][8] = 0;
    }
    for (let i = 0; i < 8; i++) {
      if (matrix[8][N - 1 - i] === -1) matrix[8][N - 1 - i] = 0;
      if (matrix[N - 1 - i][8] === -1) matrix[N - 1 - i][8] = 0;
    }

    const allBits = [];
    for (let i = 0; i < allCodewords.length; i++) {
      for (let b = 7; b >= 0; b--) allBits.push((allCodewords[i] >>> b) & 1);
    }

    let bitIdx = 0;
    let dirUp = true;
    for (let right = N - 1; right > 0; right -= 2) {
      if (right === 6) right--;
      const rows = [];
      if (dirUp) {
        for (let r = N - 1; r >= 0; r--) rows.push(r);
      } else {
        for (let r = 0; r < N; r++) rows.push(r);
      }
      dirUp = !dirUp;

      for (const r of rows) {
        for (const c of [right, right - 1]) {
          if (matrix[r][c] === -1) {
            const bit = bitIdx < allBits.length ? allBits[bitIdx++] : 0;
            const mask = ((r + c) % 2 === 0);
            matrix[r][c] = (bit ^ (mask ? 1 : 0));
          }
        }
      }
    }

    const formatBits = 0x5412;
    for (let i = 0; i <= 5; i++) matrix[8][i] = (formatBits >>> (14 - i)) & 1;
    matrix[8][7] = (formatBits >>> 8) & 1;
    matrix[8][8] = (formatBits >>> 7) & 1;
    matrix[7][8] = (formatBits >>> 6) & 1;
    for (let i = 0; i <= 5; i++) matrix[5 - i][8] = (formatBits >>> (5 - i)) & 1;
    for (let i = 0; i < 7; i++) matrix[N - 1 - i][8] = (formatBits >>> i) & 1;
    for (let i = 0; i < 8; i++) matrix[8][N - 8 + i] = (formatBits >>> (7 + i)) & 1;

    return matrix;
  }

  return {
    encode,
    generateSVG(text, size = 168) {
      const matrix = encode(text);
      const N = matrix.length;
      let paths = '';
      for (let r = 0; r < N; r++) {
        for (let c = 0; c < N; c++) {
          if (matrix[r][c] === 1) {
            paths += `<rect x="${c}" y="${r}" width="1" height="1" fill="#040809"/>`;
          }
        }
      }
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${N} ${N}" width="${size}" height="${size}" shape-rendering="crispEdges" role="img" aria-label="Código QR del Pase"><rect width="${N}" height="${N}" fill="#ffffff"/>${paths}</svg>`;
    },

    downloadPass(attendee) {
      if (!attendee || !attendee.code) return;
      const canvas = document.createElement('canvas');
      const width = 640;
      const height = 920;
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // 1. Fondo degradado de alta densidad
      const grad = ctx.createLinearGradient(0, 0, 0, height);
      grad.addColorStop(0, '#030809');
      grad.addColorStop(0.5, '#071510');
      grad.addColorStop(1, '#020607');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      // 2. Retícula ambiental HUD
      ctx.strokeStyle = 'rgba(0, 229, 255, 0.07)';
      ctx.lineWidth = 1;
      for (let x = 20; x < width; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 20; y < height; y += 40) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // 3. Marco decorativo principal
      ctx.strokeStyle = '#00e5ff';
      ctx.lineWidth = 2;
      ctx.strokeRect(26, 26, width - 52, height - 52);

      // Esquinas acentuadas en verde neón
      ctx.fillStyle = '#45f573';
      const cL = 16;
      ctx.fillRect(22, 22, cL, 4);
      ctx.fillRect(22, 22, 4, cL);
      ctx.fillRect(width - 22 - cL, 22, cL, 4);
      ctx.fillRect(width - 26, 22, 4, cL);
      ctx.fillRect(22, height - 26, cL, 4);
      ctx.fillRect(22, height - 22 - cL, 4, cL);
      ctx.fillRect(width - 22 - cL, height - 26, cL, 4);
      ctx.fillRect(width - 26, height - 22 - cL, 4, cL);

      // 4. Encabezados
      ctx.fillStyle = '#00e5ff';
      ctx.font = 'bold 12px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('INSTITUTO RETOS • PROGRAMA DE INGLÉS', width / 2, 68);

      ctx.fillStyle = '#ffffff';
      ctx.font = '900 26px sans-serif';
      ctx.fillText('RETOS SHOWCASE 2026', width / 2, 106);

      ctx.fillStyle = '#45f573';
      ctx.font = 'bold 11px monospace';
      ctx.fillText('PASE OFICIAL DE ACREDITACIÓN', width / 2, 132);

      // 5. Marco del código QR
      const qrBoxSize = 250;
      const qrX = (width - qrBoxSize) / 2;
      const qrY = 165;

      ctx.shadowColor = 'rgba(0, 229, 255, 0.35)';
      ctx.shadowBlur = 16;
      ctx.fillStyle = '#ffffff';
      if (ctx.roundRect) {
        ctx.beginPath();
        ctx.roundRect(qrX, qrY, qrBoxSize, qrBoxSize, 8);
        ctx.fill();
      } else {
        ctx.fillRect(qrX, qrY, qrBoxSize, qrBoxSize);
      }
      ctx.shadowBlur = 0;

      // 6. Dibujo de módulos del código QR
      const matrix = encode(attendee.code);
      const N = matrix.length;
      const padding = 20;
      const cellSize = (qrBoxSize - padding * 2) / N;

      ctx.fillStyle = '#040809';
      for (let r = 0; r < N; r++) {
        for (let c = 0; c < N; c++) {
          if (matrix[r][c] === 1) {
            ctx.fillRect(
              qrX + padding + c * cellSize,
              qrY + padding + r * cellSize,
              cellSize + 0.3,
              cellSize + 0.3
            );
          }
        }
      }

      // 7. Código de acreditación
      ctx.fillStyle = '#45f573';
      ctx.font = '900 24px monospace';
      ctx.fillText(attendee.code, width / 2, qrY + qrBoxSize + 40);

      // 8. Ficha del asistente
      const infoY = qrY + qrBoxSize + 76;
      const boxW = width - 84;
      const boxX = 42;

      ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
      ctx.strokeStyle = 'rgba(69, 245, 115, 0.28)';
      ctx.lineWidth = 1;
      if (ctx.roundRect) {
        ctx.beginPath();
        ctx.roundRect(boxX, infoY, boxW, 230, 8);
        ctx.fill();
        ctx.stroke();
      } else {
        ctx.fillRect(boxX, infoY, boxW, 230);
        ctx.strokeRect(boxX, infoY, boxW, 230);
      }

      ctx.textAlign = 'left';
      const leftX = boxX + 24;

      const drawField = (label, value, y, valColor = '#ffffff') => {
        ctx.fillStyle = '#00e5ff';
        ctx.font = 'bold 11px monospace';
        ctx.fillText(label, leftX, y);
        ctx.fillStyle = valColor;
        ctx.font = '600 15px sans-serif';
        ctx.fillText(value, leftX, y + 20);
      };

      drawField('TITULAR ACREDITADO:', attendee.name || 'Invitado Especial', infoY + 28, '#45f573');
      drawField('FECHA OFICIAL:', 'Viernes, 30 de octubre de 2026', infoY + 78);
      drawField('HORARIO DEL EVENTO:', '08:00 — 12:30 hrs (GMT-6)', infoY + 128);
      drawField('SEDE & LOCALIZACIÓN:', 'Biblioteca RETOS, Instituto RETOS • La Libertad', infoY + 178);

      // 9. Pie de seguridad
      ctx.textAlign = 'center';
      ctx.fillStyle = '#7a9287';
      ctx.font = '11px monospace';
      ctx.fillText('PRESENTA ESTE PASE DIGITAL AL INGRESAR A LA BIBLIOTECA', width / 2, height - 52);
      ctx.fillStyle = '#45f573';
      ctx.font = 'bold 10px monospace';
      ctx.fillText('VÁLIDO PARA 1 PERSONA // ACREDITACIÓN INTRANSFERIBLE', width / 2, height - 36);

      // 10. Descargar archivo PNG
      try {
        const link = document.createElement('a');
        link.download = `pase-${attendee.code || 'retos-showcase-2026'}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
        if (typeof Toast !== 'undefined' && Toast.show) {
          Toast.show('✔ Pase digital descargado exitosamente');
        }
      } catch (err) {
        console.error('Error al generar imagen del pase:', err);
      }
    }
  };
})();

/* ==========================================================================
   10. MÓDULO DE FORMULARIO RSVP (ESCENA 05 — 3 PASOS)
   Paso 1: Formulario -> Paso 2: Verificación visual -> Paso 3: Confirmación final
   ========================================================================== */
const RSVPModule = (() => {
  const form = document.getElementById('rsvp-form');
  const step1 = document.getElementById('rsvp-step-1');
  const step2 = document.getElementById('rsvp-step-2');
  const step3 = document.getElementById('rsvp-step-3');

  const btnSubmitStep1 = document.getElementById('btn-submit-rsvp');
  const btnBackToStep1 = document.getElementById('btn-back-to-step1');
  const btnConfirmAttendance = document.getElementById('btn-confirm-attendance');
  const resultCard = document.getElementById('rsvp-result-card');

  const errName = document.getElementById('err-name');
  const errEmail = document.getElementById('err-email');
  const errAttendance = document.getElementById('err-attendance');

  let pendingPayload = null;
  let attendeeData = {
    name: '',
    email: '',
    attendance: '',
    code: ''
  };

  const isLocalEnvironment = () => {
    const proto = window.location.protocol;
    const host = window.location.hostname;
    return proto === 'file:' || ['localhost', '127.0.0.1'].includes(host);
  };

  const clearErrors = () => {
    DOM.safeText(errName, '');
    DOM.safeText(errEmail, '');
    DOM.safeText(errAttendance, '');
    const errorBanner = document.getElementById('submission-error-banner');
    if (errorBanner) DOM.hide(errorBanner);
    if (form) {
      if (form.name) form.name.removeAttribute('aria-invalid');
      if (form.email) form.email.removeAttribute('aria-invalid');
    }
  };

  const validate = () => {
    clearErrors();
    let hasError = false;
    let firstInvalid = null;

    if (!form) return null;
    const name = form.name ? form.name.value.trim() : '';
    const email = form.email ? form.email.value.trim().toLowerCase() : '';
    const attendance = form.attendance ? form.attendance.value : '';
    const notes = form.notes ? form.notes.value.trim() : '';
    const website = form.website ? form.website.value.trim() : '';

    if (name.length < 2 || name.length > 120) {
      hasError = true;
      DOM.safeText(errName, '⚠ Por favor, ingresa tu nombre (entre 2 y 120 caracteres).');
      if (form.name) {
        form.name.setAttribute('aria-invalid', 'true');
        if (!firstInvalid) firstInvalid = form.name;
      }
    }

    const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
    if (email.length > 254 || !emailRegex.test(email)) {
      hasError = true;
      DOM.safeText(errEmail, '⚠ Ingresa un correo electrónico válido (máx. 254 caracteres).');
      if (form.email) {
        form.email.setAttribute('aria-invalid', 'true');
        if (!firstInvalid) firstInvalid = form.email;
      }
    }

    if (!['si', 'no'].includes(attendance)) {
      hasError = true;
      DOM.safeText(errAttendance, '⚠ Selecciona si asistirás o no al evento.');
      const firstRadio = form.querySelector('input[name="attendance"]');
      if (!firstInvalid) firstInvalid = firstRadio;
    }

    if (notes.length > 500) {
      hasError = true;
      Toast.show('⚠ Las notas adicionales no deben exceder 500 caracteres.');
    }

    if (hasError) {
      SoundEngine.error();
      if (firstInvalid) firstInvalid.focus();
      return null;
    }

    return {
      name,
      email,
      attendance,
      notes,
      website
    };
  };

  const submitData = async (payload) => {
    // 1. Simulación demostrativa exclusivamente bajo protocolo file:// (apertura directa sin servidor)
    if (window.location.protocol === 'file:') {
      await new Promise(resolve => setTimeout(resolve, EVENT_META.latenciaSimuladaMs || 800));
      return {
        success: true,
        demoMode: true,
        message: "Modo demostrativo local (protocolo file://). Los datos fueron validados satisfactoriamente.",
        code: `DEMO-${Math.floor(1000 + Math.random() * 9000)}-${payload.attendance.toUpperCase()}`
      };
    }

    // 2. Envío real a la función serverless de producción con timeout estricto de 10 segundos
    const endpoint = EVENT_META.rsvpEndpoint || '/api/rsvp';
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          nombre: payload.name,
          email: payload.email,
          asistencia: payload.attendance,
          notas: payload.notes,
          website: payload.website
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      let resJson = null;
      try {
        resJson = await response.json();
      } catch (_) {
        resJson = null;
      }

      if (!response.ok) {
        const errorDetail = (resJson && resJson.error)
          ? resJson.error
          : `Error en el servidor de confirmaciones (HTTP ${response.status}).`;
        throw new Error(errorDetail);
      }

      if (!resJson || !resJson.ok || !resJson.code) {
        throw new Error((resJson && resJson.error) || "Respuesta incompleta del servidor.");
      }

      return {
        success: true,
        demoMode: false,
        message: "Confirmación guardada correctamente en el sistema institucional.",
        code: resJson.code
      };

    } catch (err) {
      clearTimeout(timeoutId);

      if (err.name === 'AbortError') {
        throw new Error('La solicitud tardó más de 10 segundos en responder. Por favor, reintenta.');
      }

      if (isLocalEnvironment() && (err.message.includes('HTTP 404') || err.message.includes('HTTP 405') || err.message.includes('HTTP 501') || err.message.includes('Failed to fetch') || err.message.includes('NetworkError'))) {
        console.warn('[RSVP Local Dev]: Servidor estático local (Live Server / http.server) sin backend serverless activo. Activando simulación demostrativa.');
        return {
          success: true,
          demoMode: true,
          message: "Modo demostrativo local (servidor estático sin backend serverless activo).",
          code: `DEMO-${Math.floor(1000 + Math.random() * 9000)}-${payload.attendance.toUpperCase()}`
        };
      }

      throw err;
    }
  };

  // Paso 1: Valida el formulario y avanza al Paso 2 (verificación visual)
  const handleStep1Submit = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    const payload = validate();
    if (!payload) return;

    pendingPayload = payload;
    SoundEngine.click();

    DOM.hide(step1);
    DOM.show(step2);
    VerificationModule.start();
  };

  // Paso 2: Volver al Paso 1 para corregir datos
  const handleBackToStep1 = () => {
    SoundEngine.click();
    VerificationModule.reset();
    DOM.hide(step2);
    DOM.show(step1);
  };

  // Paso 2 -> Paso 3: Confirmación definitiva y envío a Supabase / backend
  const handleConfirmAttendance = async () => {
    if (!pendingPayload) {
      handleBackToStep1();
      return;
    }

    const errorBannerEl = document.getElementById('submission-error-banner');
    if (errorBannerEl) DOM.hide(errorBannerEl);

    const spinner = btnConfirmAttendance ? btnConfirmAttendance.querySelector('.btn-spinner') : null;
    const btnText = btnConfirmAttendance ? btnConfirmAttendance.querySelector('.btn-text') : null;

    if (btnConfirmAttendance) {
      btnConfirmAttendance.disabled = true;
      btnConfirmAttendance.setAttribute('aria-busy', 'true');
    }
    DOM.show(spinner);
    DOM.safeText(btnText, 'CONFIRMANDO...');

    try {
      const result = await submitData(pendingPayload);

      attendeeData = {
        name: pendingPayload.name,
        email: pendingPayload.email,
        attendance: pendingPayload.attendance,
        code: result.code
      };

      const statusLabels = {
        'si': 'Asistencia Confirmada (Presencial)',
        'no': 'Inasistencia Registrada (Cupo Liberado)'
      };

      DOM.safeText('#res-attendee-name', pendingPayload.name);
      DOM.safeText('#res-attendee-email', pendingPayload.email);
      DOM.safeText('#res-attendee-status', statusLabels[pendingPayload.attendance] || pendingPayload.attendance);
      DOM.safeText('#res-attendee-code', result.code);

      const resBadgeEl = document.getElementById('result-badge-text');
      const resTitleEl = document.getElementById('result-title-text');
      const resMsgEl = document.getElementById('result-message-text');
      const qrContainerEl = document.getElementById('result-qr-container');
      const qrWrapperEl = document.getElementById('rsvp-qr-code-wrapper');

      if (pendingPayload.attendance === 'si') {
        if (qrWrapperEl) {
          qrWrapperEl.innerHTML = QREngine.generateSVG(result.code, 168);
        }
        if (qrContainerEl) DOM.show(qrContainerEl);

        if (resBadgeEl) {
          DOM.safeText(resBadgeEl, result.demoMode ? 'MODO DEMOSTRACIÓN LOCAL' : 'ACREDITACIÓN CONFIRMADA');
        }
        if (resTitleEl) {
          DOM.safeText(resTitleEl, '¡Tu lugar ha sido reservado!');
        }
        if (resMsgEl) {
          resMsgEl.innerHTML = result.demoMode
            ? `<strong>AVISO DE DEMOSTRACIÓN:</strong> Tu acreditación fue validada exitosamente en entorno local. En producción, la confirmación se almacena en Supabase. Puedes descargar tu pase digital a continuación.`
            : `Hemos reservado tu lugar oficial en la Biblioteca RETOS. Guarda o descarga tu pase digital de entrada para presentarlo el día del evento.`;
        }
      } else {
        if (qrContainerEl) DOM.hide(qrContainerEl);

        if (resBadgeEl) {
          DOM.safeText(resBadgeEl, 'RESPUESTA REGISTRADA');
        }
        if (resTitleEl) {
          DOM.safeText(resTitleEl, 'Agradecemos tu notificación');
        }
        if (resMsgEl) {
          resMsgEl.textContent = 'Hemos registrado que no podrás acompañarnos en esta ocasión y liberado el cupo. Si tu disponibilidad cambia antes del 30 de octubre, puedes volver a ingresar con este mismo correo para confirmar tu asistencia.';
        }
      }

      if (resultCard) DOM.show(resultCard);

      // Transición a Paso 3 (Pantalla final)
      DOM.hide(step2);
      DOM.show(step3);

      NavigationEngine.updateClosingPersonalization(attendeeData);

      SoundEngine.success();
      Toast.show('✔ Asistencia confirmada con éxito');

    } catch (err) {
      console.error("[RSVP Error]:", err);
      SoundEngine.error();
      Toast.show('⚠ Error al procesar confirmación');

      const errorTextEl = document.getElementById('submission-error-text');
      if (errorTextEl) {
        DOM.safeText(errorTextEl, err.message || 'No se pudo completar el registro. Por favor, reintenta.');
      }
      if (errorBannerEl) {
        DOM.show(errorBannerEl);
        errorBannerEl.focus();
      }

    } finally {
      if (btnConfirmAttendance) {
        btnConfirmAttendance.disabled = false;
        btnConfirmAttendance.removeAttribute('aria-busy');
      }
      DOM.hide(spinner);
      DOM.safeText(btnText, 'Confirmar asistencia');
    }
  };

  const reset = () => {
    if (form) {
      form.reset();
    }
    clearErrors();
    pendingPayload = null;
    attendeeData = { name: '', email: '', attendance: '', code: '' };
    VerificationModule.reset();

    if (resultCard) DOM.hide(resultCard);
    const qrContainerEl = document.getElementById('result-qr-container');
    if (qrContainerEl) DOM.hide(qrContainerEl);
    const qrWrapperEl = document.getElementById('rsvp-qr-code-wrapper');
    if (qrWrapperEl) qrWrapperEl.innerHTML = '';

    DOM.hide(step2);
    DOM.hide(step3);
    DOM.show(step1);
  };

  return {
    init: () => {
      const demoNotice = document.getElementById('demo-mode-notice');
      if (demoNotice) {
        if (window.location.protocol === 'file:') {
          DOM.show(demoNotice);
        } else {
          DOM.hide(demoNotice);
        }
      }

      // Paso 1: Envío de formulario
      if (form) form.addEventListener('submit', handleStep1Submit);

      // Paso 2: Volver a modificar datos
      if (btnBackToStep1) btnBackToStep1.addEventListener('click', handleBackToStep1);

      // Paso 2: Confirmación definitiva
      if (btnConfirmAttendance) btnConfirmAttendance.addEventListener('click', handleConfirmAttendance);

      // Reintento en el banner de error
      const btnRetry = document.getElementById('btn-retry-rsvp');
      if (btnRetry) {
        btnRetry.addEventListener('click', () => {
          handleConfirmAttendance();
        });
      }

      // Descarga de pase digital
      const btnDownloadPass = document.getElementById('btn-download-pass');
      if (btnDownloadPass) {
        btnDownloadPass.addEventListener('click', () => {
          if (attendeeData && attendeeData.code) {
            QREngine.downloadPass(attendeeData);
          }
        });
      }

      // Validación en vivo
      if (form && form.name) {
        form.name.addEventListener('input', () => {
          if (form.name.value.trim().length >= 2) {
            DOM.safeText(errName, '');
            form.name.removeAttribute('aria-invalid');
          }
        });
      }
      if (form && form.email) {
        form.email.addEventListener('input', () => {
          DOM.safeText(errEmail, '');
          form.email.removeAttribute('aria-invalid');
        });
      }
      if (form) {
        form.querySelectorAll('input[name="attendance"]').forEach(r => {
          r.addEventListener('change', () => {
            DOM.safeText(errAttendance, '');
          });
        });
      }
    },
    reset,
    getAttendee: () => attendeeData
  };
})();

/* ==========================================================================
   11. MOTOR DE CUENTA REGRESIVA EN TIEMPO REAL (COUNTDOWN ENGINE)
   Cuenta regresiva hacia el viernes 30 de octubre de 2026 a las 08:00 AM
   Zona horaria: America/El_Salvador (UTC-6).
   ========================================================================== */
const CountdownEngine = {
  timerId: null,

  init() {
    this.update();
    if (this.timerId) clearInterval(this.timerId);
    this.timerId = setInterval(() => this.update(), 1000);
  },

  update() {
    // Zona horaria de El Salvador es UTC-6 (sin horario de verano)
    const startDate = new Date(`${EVENT_META.inicio}-06:00`);
    const endDate = new Date(`${EVENT_META.fin}-06:00`);
    const now = new Date();

    const diffStart = startDate - now;
    const diffEnd = endDate - now;

    const daysEl = document.getElementById('cd-days');
    const hoursEl = document.getElementById('cd-hours');
    const minsEl = document.getElementById('cd-minutes');
    const secsEl = document.getElementById('cd-seconds');
    const statusLabel = document.getElementById('countdown-status-label');
    const liveBadge = document.getElementById('countdown-live-badge');

    if (!daysEl || !hoursEl || !minsEl || !secsEl) return;

    const pad = (n) => String(Math.max(0, n)).padStart(2, '0');

    // 1. Antes del inicio del evento
    if (diffStart > 0) {
      const days = Math.floor(diffStart / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diffStart % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diffStart % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diffStart % (1000 * 60)) / 1000);

      daysEl.textContent = pad(days);
      hoursEl.textContent = pad(hours);
      minsEl.textContent = pad(minutes);
      secsEl.textContent = pad(seconds);

      DOM.safeText(statusLabel, 'TIEMPO RESTANTE PARA EL INICIO');
      DOM.safeText(liveBadge, 'EN ESPERA // 30 OCT 2026');
      if (liveBadge) {
        liveBadge.className = 'countdown-status-indicator status-waiting';
      }
    } 
    // 2. Durante el evento (30 de octubre de 2026 de 08:00 a 12:00)
    else if (diffEnd > 0) {
      const hours = Math.floor(diffEnd / (1000 * 60 * 60));
      const minutes = Math.floor((diffEnd % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diffEnd % (1000 * 60)) / 1000);

      daysEl.textContent = '00';
      hoursEl.textContent = pad(hours);
      minsEl.textContent = pad(minutes);
      secsEl.textContent = pad(seconds);

      DOM.safeText(statusLabel, '¡EL EVENTO SE ESTÁ DESARROLLANDO EN ESTE MOMENTO!');
      DOM.safeText(liveBadge, '● EN CURSO EN ESTE MOMENTO');
      if (liveBadge) {
        liveBadge.className = 'countdown-status-indicator status-live';
      }
    } 
    // 3. Conclusión
    else {
      daysEl.textContent = '00';
      hoursEl.textContent = '00';
      minsEl.textContent = '00';
      secsEl.textContent = '00';

      DOM.safeText(statusLabel, 'SESIÓN CONCLUIDA');
      DOM.safeText(liveBadge, 'EVENTO FINALIZADO CON ÉXITO');
      if (liveBadge) {
        liveBadge.className = 'countdown-status-indicator status-ended';
      }
    }
  }
};

/* ==========================================================================
   12. RENDERIZADO MODULAR DE LA INTERFAZ (UI RENDERER)
   Se encarga exclusivamente del renderizado dinámico de la agenda formal
   y los contadores dependientes de ella.
   ========================================================================== */
const UIRenderer = {
  // Renderiza la Agenda formal cronológica (Escena 06) y calcula sus contadores
  renderFormalAgenda(agenda) {
    const container = document.getElementById('agenda-container');
    if (!container) return;

    if (!Array.isArray(agenda) || agenda.length === 0) {
      container.innerHTML = `
        <li class="agenda-timeline-item">
          <article class="agenda-item-card">
            <h3 class="agenda-event-title">Agenda por confirmar</h3>
            <p class="agenda-event-desc">El cronograma oficial de actividades se encuentra en proceso de sincronización.</p>
          </article>
        </li>
      `;
      DOM.safeText('#agenda-blocks-count', '0 BLOQUES');
      return;
    }

    // Cálculo de contadores a partir del array de la agenda
    DOM.safeText('#agenda-blocks-count', `${agenda.length} BLOQUES CONFIRMADOS`);

    const firstItem = agenda[0];
    const lastItem = agenda[agenda.length - 1];
    const fechaRef = firstItem.fecha || "2026-10-30";
    const horaInicioMin = firstItem.horaInicio || "08:00";
    const horaFinMax = lastItem.horaFin || "12:00";

    const [year, month, day] = fechaRef.split('-').map(Number);
    const dateObj = new Date(year, month - 1, day);
    const dateFormatOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const dateFormatted = new Intl.DateTimeFormat('es-ES', dateFormatOptions).format(dateObj);
    const dateCapitalized = dateFormatted.charAt(0).toUpperCase() + dateFormatted.slice(1);

    const dateShort = dateObj.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase();
    DOM.safeText('#agenda-date-coord', `${dateShort} // ${horaInicioMin} - ${horaFinMax} HRS`);

    const agendaSummaryDate = document.getElementById('agenda-summary-date');
    if (agendaSummaryDate) {
      agendaSummaryDate.innerHTML = `<time datetime="${fechaRef}">${dateCapitalized}</time>`;
    }
    DOM.safeText('#agenda-summary-time', `${horaInicioMin} — ${horaFinMax} hrs`);

    const iconMap = {
      protocolo: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" class="agenda-speaker-icon"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="22"/></svg>`,
      inauguracion: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" class="agenda-speaker-icon"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`,
      ponencia: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" class="agenda-speaker-icon"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>`,
      showcase: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" class="agenda-speaker-icon"><rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/></svg>`,
      logistica: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" class="agenda-speaker-icon"><path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/></svg>`,
      debate: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" class="agenda-speaker-icon"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>`,
      networking: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" class="agenda-speaker-icon"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`,
      clausura: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" class="agenda-speaker-icon"><circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/></svg>`
    };

    const statusLabels = {
      'confirmado': 'Confirmado',
      'destacado': 'Destacado',
      'en-curso': 'En Curso',
      'proximo': 'Programado'
    };

    container.innerHTML = agenda.map(item => `
      <li class="agenda-timeline-item" id="${item.id}">
        <article class="agenda-item-card ${item.estado === 'destacado' ? 'highlight' : ''}">
          <header class="agenda-item-header">
            <div class="agenda-time-badge">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="agenda-time-icon" aria-hidden="true">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12 6 12 12 16 14"/>
              </svg>
              <time datetime="${item.fecha}T${item.horaInicio}">${item.horaInicio}</time>
              <span>—</span>
              <time datetime="${item.fecha}T${item.horaFin}">${item.horaFin} hrs</time>
            </div>
            <span class="agenda-status-pill status-${item.estado || 'confirmado'}">
              ${statusLabels[item.estado] || item.estado}
            </span>
          </header>

          <h3 class="agenda-event-title">${item.titulo}</h3>
          <p class="agenda-event-desc">${item.descripcion}</p>

          <footer class="agenda-item-footer">
            <div class="agenda-speaker">
              ${iconMap[item.tipo] || iconMap.ponencia}
              <span>${item.responsable}</span>
            </div>
            <span class="agenda-type-tag">TIPO: ${item.tipo.toUpperCase()}</span>
          </footer>
        </article>
      </li>
    `).join('');
  },

  // Telemetría en tiempo real
  startTelemetryClock() {
  const el = document.getElementById('telemetry-time');
  if (!el) return;

  const fmt = new Intl.DateTimeFormat('es-SV', {
    timeZone: 'America/El_Salvador',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });

  const update = () => {
    el.textContent = ` ${fmt.format(new Date())}`;
  };

  update();
  setInterval(update, 1000);
},

  // Ejecución integrada de renderizado dinámico
  renderAll(agenda) {
    this.renderFormalAgenda(agenda);
    this.startTelemetryClock();
    CountdownEngine.init();
  }
};

/* ==========================================================================
   13. ENRUTADOR Y CONMUTADOR DINÁMICO DE VISTAS (NAVIGATION ENGINE)
   ========================================================================== */
const NavigationEngine = (() => {
  let currentIndex = 0;
  let scenesList = [];
  let stepNodesList = [];
  let routesMap = {}; // ruta -> índice

  const routeDisplayNames = {
    'bienvenida': 'Portada y Bienvenida',
    'proposito': 'Propósito y Experiencia',
    'coordenadas': 'Coordenadas y Logística',
    'programa': 'Programa y Ejes',
    'rsvp': 'Confirmación de Asistencia',
    // Alias para enlaces o hash previos
    'init': 'Portada y Bienvenida',
    'acceso': 'Portada y Bienvenida',
    'evento': 'Propósito y Experiencia',
    'institucion': 'Propósito y Experiencia',
    'agenda': 'Programa y Ejes',
    'ejes': 'Programa y Ejes',
    'cierre': 'Confirmación de Asistencia'
  };

  const navBtnBack = document.getElementById('nav-btn-back');
  const navBtnNext = document.getElementById('nav-btn-next');
  const sceneCounterCur = document.querySelector('.counter-cur');
  const sceneCounterTotal = document.querySelector('.counter-total');
  const sceneCounterName = document.getElementById('hud-scene-name');

  const refreshScenes = () => {
    scenesList = Array.from(document.querySelectorAll('.scene'));
    stepNodesList = Array.from(document.querySelectorAll('.step-node'));

    routesMap = {};
    scenesList.forEach((scene, idx) => {
      const route = scene.dataset.route || `step-${idx}`;
      routesMap[route] = idx;
    });

    if (sceneCounterTotal) {
      sceneCounterTotal.textContent = String(scenesList.length).padStart(2, '0');
    }
  };

  const goToScene = (target, updateHash = true, playSound = true) => {
    refreshScenes();
    const total = scenesList.length;
    if (total === 0) return;

    let targetIndex = currentIndex;

    if (typeof target === 'number') {
      targetIndex = Math.max(0, Math.min(total - 1, target));
    } else if (typeof target === 'string') {
      if (target === 'next') {
        targetIndex = Math.min(total - 1, currentIndex + 1);
      } else if (target === 'prev') {
        targetIndex = Math.max(0, currentIndex - 1);
      } else if (!isNaN(parseInt(target, 10)) && String(parseInt(target, 10)) === target.trim()) {
        targetIndex = Math.max(0, Math.min(total - 1, parseInt(target, 10)));
      } else if (routesMap[target] !== undefined) {
        targetIndex = routesMap[target];
      }
    }

    if (targetIndex === currentIndex && scenesList[targetIndex]?.classList.contains('active')) {
      return;
    }

    currentIndex = targetIndex;
    const activeScene = scenesList[currentIndex];
    const currentRoute = activeScene ? (activeScene.dataset.route || `scene-${currentIndex}`) : 'bienvenida';

    // 1. Conmutación limpia de escenas
    scenesList.forEach((scene, i) => {
      if (i === currentIndex) {
        scene.classList.add('active');
        scene.classList.remove('prev-out');
        scene.removeAttribute('aria-hidden');
        scene.scrollTop = 0;

        setTimeout(() => {
          const heading = scene.querySelector('h1, h2');
          if (heading) heading.focus({ preventScroll: true });
        }, 120);
      } else {
        scene.classList.remove('active');
        if (i < currentIndex) {
          scene.classList.add('prev-out');
        } else {
          scene.classList.remove('prev-out');
        }
        scene.setAttribute('aria-hidden', 'true');
      }
    });

    // 2. Sincronización del stepper
    stepNodesList.forEach((node, i) => {
      node.classList.toggle('active', i === currentIndex);
      node.classList.toggle('completed', i < currentIndex);
      if (i === currentIndex) {
        node.setAttribute('aria-current', 'step');
      } else {
        node.removeAttribute('aria-current');
      }
    });

    // 3. Actualización del HUD inferior
    if (sceneCounterCur) {
      sceneCounterCur.textContent = String(currentIndex + 1).padStart(2, '0');
    }
    if (sceneCounterName) {
      sceneCounterName.textContent = routeDisplayNames[currentRoute] || `Escena ${currentIndex + 1}`;
    }

    // 4. Visibilidad de botones de navegación inferior
    if (navBtnBack) {
      DOM.toggle(navBtnBack, currentIndex > 0);
    }
    if (navBtnNext) {
      const hideNext = currentIndex === 0 || currentIndex === total - 1;
      DOM.toggle(navBtnNext, !hideNext);
    }

    // 5. Sincronización de Hash en la URL
    if (updateHash && window.location.hash !== `#${currentRoute}`) {
      try {
        history.pushState(null, '', `#${currentRoute}`);
      } catch (_) {
        window.location.hash = currentRoute;
      }
    }

    if (playSound) {
      SoundEngine.nav();
    }
  };

  const handleHashChange = () => {
    const hash = window.location.hash.replace('#', '').trim();
    if (!hash) {
      goToScene(0, false, false);
      return;
    }
    if (routesMap[hash] !== undefined) {
      goToScene(routesMap[hash], false, false);
    }
  };

  const updateClosingPersonalization = (attendee) => {
    const headline = document.getElementById('closing-headline');
    const msg = document.getElementById('closing-personalized-message');

    let displayName = '';
    if (attendee && attendee.name) {
      const parts = attendee.name.trim().split(/\s+/);
      const titlePattern = /^(dr|dra|ing|prof|lic|msc|phd|sr|sra|srta)\.?$/i;
      if (parts.length > 1 && titlePattern.test(parts[0])) {
        displayName = parts[1];
      } else {
        displayName = parts[0];
      }
      displayName = displayName.replace(/[.,;:!]+$/, '');
    }

    if (headline) {
      if (displayName) {
        headline.innerHTML = `Sesión completada, <span class="text-gradient">${displayName}.</span>`;
      } else {
        headline.innerHTML = `Sesión <span class="text-gradient">completada.</span>`;
      }
    }

    if (msg) {
      msg.textContent = "Su presencia es una gran motivación para nuestros estudiantes. Esperamos contar con su valioso acompañamiento.";
    }
  };

  return {
    init: () => {
      refreshScenes();

      // Delegación centralizada de clics
      document.addEventListener('click', (e) => {
        const targetBtn = e.target.closest('[data-target]');
        if (targetBtn) {
          const targetVal = targetBtn.dataset.target;
          goToScene(targetVal);
          return;
        }

        const stepNode = e.target.closest('.step-node');
        if (stepNode) {
          const stepVal = stepNode.dataset.step;
          if (stepVal !== undefined) {
            goToScene(parseInt(stepVal, 10));
          }
        }
      });

      // Teclado en Stepper
      const stepper = document.getElementById('hud-stepper');
      if (stepper) {
        stepper.addEventListener('keydown', (e) => {
          const node = e.target.closest('.step-node');
          if (node && (e.key === 'Enter' || e.key === ' ')) {
            e.preventDefault();
            const stepVal = node.dataset.step;
            if (stepVal !== undefined) goToScene(parseInt(stepVal, 10));
          }
        });
      }

      if (navBtnBack) navBtnBack.addEventListener('click', () => goToScene('prev'));
      if (navBtnNext) navBtnNext.addEventListener('click', () => goToScene('next'));

      window.addEventListener('hashchange', handleHashChange);
      window.addEventListener('popstate', handleHashChange);

      // Atajos globales de teclado
      window.addEventListener('keydown', (e) => {
        const tag = e.target.tagName;
        if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;

        if (e.key === 'ArrowRight' || e.key === 'PageDown') {
          if (currentIndex < scenesList.length - 1) {
            e.preventDefault();
            goToScene('next');
          }
        } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
          if (currentIndex > 0) {
            e.preventDefault();
            goToScene('prev');
          }
        } else if (e.key.toLowerCase() === 'm') {
          const isMuted = SoundEngine.toggleMute();
          updateAudioIcon(isMuted);
          Toast.show(isMuted ? '🔇 Audio silenciado' : '🔊 Audio activado');
        } else if (e.key === 'Escape') {
          closeHelpModal();
        }
      });

      const initialHash = window.location.hash.replace('#', '').trim();
      if (initialHash && routesMap[initialHash] !== undefined) {
        goToScene(routesMap[initialHash], false, false);
      } else {
        goToScene(0, false, false);
      }
    },
    goTo: goToScene,
    getCurrentIndex: () => currentIndex,
    updateClosingPersonalization
  };
})();

/* ==========================================================================
   14. CONTROLES AUXILIARES (MODAL DE AYUDA, AUDIO, CALENDARIO, COMPARTIR)
   ========================================================================== */
const helpModal = document.getElementById('help-modal');
const helpToggle = document.getElementById('help-toggle');
const helpClose = document.getElementById('modal-help-close');
const helpAccept = document.getElementById('modal-help-accept');

function openHelpModal() {
  if (helpModal) {
    DOM.show(helpModal);
    if (helpClose) helpClose.focus();
    SoundEngine.click();
  }
}

function closeHelpModal() {
  if (helpModal) {
    DOM.hide(helpModal);
    if (helpToggle) helpToggle.focus();
    SoundEngine.click();
  }
}

if (helpToggle) helpToggle.addEventListener('click', openHelpModal);
if (helpClose) helpClose.addEventListener('click', closeHelpModal);
if (helpAccept) helpAccept.addEventListener('click', closeHelpModal);
if (helpModal) {
  helpModal.addEventListener('click', (e) => {
    if (e.target === helpModal) closeHelpModal();
  });
}

// Botón de alternar audio
const audioToggleBtn = document.getElementById('audio-toggle');
const audioIconOn = document.querySelector('.audio-icon-on');
const audioIconOff = document.querySelector('.audio-icon-off');

function updateAudioIcon(isMuted) {
  DOM.toggle(audioIconOn, !isMuted);
  DOM.toggle(audioIconOff, isMuted);
}

if (audioToggleBtn) {
  audioToggleBtn.addEventListener('click', () => {
    const isMuted = SoundEngine.toggleMute();
    updateAudioIcon(isMuted);
    Toast.show(isMuted ? '🔇 Efectos de sonido desactivados' : '🔊 Efectos de sonido activados');
  });
}

// Acciones de Calendario y Mapas
const btnDownloadIcs = document.getElementById('btn-download-ics');
const btnClosingIcs = document.getElementById('btn-closing-ics');
if (btnDownloadIcs) btnDownloadIcs.addEventListener('click', CalendarService.downloadICS);
if (btnClosingIcs) btnClosingIcs.addEventListener('click', CalendarService.downloadICS);

// Navegación GPS hacia la sede (Escena 05: Google Maps, Waze, Apple Maps)
const mapsButtonsContainer = document.querySelector('.details-cta-banner .cta-banner-buttons');
if (mapsButtonsContainer) {
  // Delegación de eventos para mayor rendimiento y resiliencia ante recargas de escena
  mapsButtonsContainer.addEventListener('click', (e) => {
    const trigger = e.target.closest('[data-map]');
    if (!trigger) return;

    // Si es un <button> o enlace sin href absoluto, ejecutamos la navegación programática
    if (trigger.tagName === 'BUTTON' || !trigger.getAttribute('href') || trigger.getAttribute('href') === '#') {
      e.preventDefault();
      const service = trigger.dataset.map;
      if (service && typeof CalendarService.openMap === 'function') {
        CalendarService.openMap(service);
      }
    } else {
      // Para enlaces semánticos <a> con target="_blank", disparamos el feedback de audio HUD
      SoundEngine.click();
    }
  });
} else {
  // Respaldo por ID individual si no se encuentra el contenedor
  const btnGoogle = document.getElementById('btn-map-google') || document.getElementById('btn-open-maps');
  const btnWaze = document.getElementById('btn-map-waze');
  const btnApple = document.getElementById('btn-map-apple');
  if (btnGoogle) btnGoogle.addEventListener('click', () => CalendarService.openGoogleMaps());
  if (btnWaze) btnWaze.addEventListener('click', () => CalendarService.openWaze());
  if (btnApple) btnApple.addEventListener('click', () => CalendarService.openAppleMaps());
}

// Omitir verificación en escena 02
const btnSkipVerify = document.getElementById('btn-skip-verify');
if (btnSkipVerify) {
  btnSkipVerify.addEventListener('click', () => {
    VerificationModule.skip();
  });
}

// Compartir invitación
const btnShare = document.getElementById('btn-share-invite');
if (btnShare) {
  btnShare.addEventListener('click', async () => {
    SoundEngine.click();
    const shareData = {
      title: `${EVENT_META.titulo} — Invitación Oficial`,
      text: `${EVENT_META.titulo} — Estudiantes RETOS. Viernes 30 de octubre de 2026.`,
      url: window.location.href
    };

    if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
        Toast.show('✔ Enlace compartido');
      } catch (_) {}
    } else {
      try {
        await navigator.clipboard.writeText(window.location.href);
        Toast.show('✔ Enlace copiado al portapapeles');
      } catch (_) {
        Toast.show('✔ Dirección: ' + window.location.href);
      }
    }
  });
}

// Reiniciar experiencia
const btnRestart = document.getElementById('btn-restart-experience');
if (btnRestart) {
  btnRestart.addEventListener('click', () => {
    SoundEngine.click();
    RSVPModule.reset();
    VerificationModule.reset();
    NavigationEngine.goTo(0);
    Toast.show('↺ Experiencia reiniciada');
  });
}

/* ==========================================================================
   15. INICIALIZACIÓN GENERAL DEL SISTEMA (BOOTSTRAP ASÍNCRONO)
   ========================================================================== */
document.addEventListener('DOMContentLoaded', async () => {
  try {
    // 1. Cargar únicamente la agenda dinámica desde contenido.json (con fallback)
    const agenda = await DataService.loadAgenda('contenido.json');

    // 2. Renderizar componentes dinámicos de agenda
    UIRenderer.renderAll(agenda);

    // 3. Inicializar motores gráficos y de interacción
    CanvasEngine.init();
    RSVPModule.init();

    // 4. Inicializar enrutador y listeners de navegación
    NavigationEngine.init();

    console.log('%c[ACCESS GRANTED] RETOS Showcase 2026 - 2nd Edition — Inicialización completa.', 'color:#a0c525; font-weight:bold; font-size:12px;');
  } catch (criticalErr) {
    console.error('Error durante la inicialización de la aplicación:', criticalErr);
    try {
      UIRenderer.renderAll(FALLBACK_CONTENT.agenda);
      NavigationEngine.init();
    } catch (_) {}
  }
});
