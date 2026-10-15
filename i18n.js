/**
 * ==============================================================================
 * SISTEMA BILINGÜE (i18n) — RETOS SHOWCASE 2026 - 2ND EDITION
 * Inglés por defecto, español opcional. 100% Vanilla JS sin dependencias.
 * Arquitectura optimizada para 3 escenas directas y accionables.
 * ==============================================================================
 */

(function () {
  'use strict';

  var STORAGE_KEY = 'retos_invitation_lang';
  var DEFAULT_LANG = 'en';

  var TRANSLATIONS = {
    en: {
      // Document & Global HUD
      docTitle: 'RETOS Showcase 2026 - 2nd Edition — RETOS Institute',
      brandLogoAlt: 'RETOS Institute logo',
      step1: 'Welcome',
      step2: 'Logistics',
      step3: 'Confirmation',
      step1Aria: 'Scene 1 of 3: Context and essence',
      step2Aria: 'Scene 2 of 3: Logistics and actionable agenda',
      step3Aria: 'Scene 3 of 3: Confirmation and QR pass',
      mobileNavToggleAria: 'Open navigation menu',
      mobileMenuAria: 'Scene navigation',
      mobileStep1Aria: 'Scene 1',
      mobileStep2Aria: 'Scene 2',
      mobileStep3Aria: 'Scene 3',
      audioAria: 'Toggle synthetic sound effects',
      audioTitle: 'Sound effects (Web Audio)',
      helpAria: 'Keyboard shortcuts and help',
      helpTitle: 'Keyboard shortcuts',
      langSelectorAria: 'Language selector / Selector de idioma',
      langEnAria: 'Switch language to English',
      langEsAria: 'Switch language to Spanish',

      // Scene 01: Context & Essence
      scene0Aria: 'Scene 1 of 3: Context and essence',
      s1Badge: 'SPECIAL INVITATION',
      s1LogoAlt: 'Event circular hologram logo',
      s1Institution: 'English Program • RETOS / FTS',
      s1HeroTitle: 'RETOS Showcase <span class="text-gradient">2026</span> - 2nd Edition',
      wteTitle: 'WHAT TO EXPECT',
      wteCard1Title: 'English Certification',
      wteCard2Title: 'Career-Based Projects',
      wteCard3Title: '100% English Environment',

      // Scene 01: Discover RETOS Showcase Card (Expandable definition, vision, mission)
      s1DiscoverHook: 'Want to know more about our Showcase?',
      s1DiscoverTitle: 'Discover RETOS Showcase',
      s1DiscoverSubtitle: 'Learn about RETOS Showcase, our vision, and mission.',
      s1DiscoverBtn: 'Explore RETOS Showcase',
      s1DiscoverBtnClose: 'Close details',
      s2Lead: 'RETOS Showcase is a space where students from each career demonstrate their English communication skills in real-world technical environments and showcase their progress toward English language accreditation according to the Common European Framework of Reference for Languages (CEFR).',
      s2MissionBadge: 'EDUCATIONAL PURPOSE',
      s2MissionTitle: 'Our Mission',
      s2MissionBody: 'To foster a space of learning, exchange, and certification that strengthens students’ communicative competence in English.',
      s2VisionBadge: 'STRATEGIC PROJECTION',
      s2VisionTitle: 'Our Vision',
      s2VisionBody: 'To be a flagship event promoting academic exchange in English and showcasing student talent toward national and international opportunities.',

      btnStart: 'START EXPERIENCE ',
      btnStartAria: 'Start experience and proceed to logistics',

      // Scene 02: Logistics & Actionable Agenda
      scene1Aria: 'Scene 2 of 3: Logistics and actionable agenda',
      s3Badge: 'CONFIRMED LOGISTICS',
      s3Coords: 'RETOS / FTS // VENUE & LOGISTICS',
      s3Kicker: '02 / DATE, VENUE & LOGISTICS',
      s3Title: 'Date, venue and <span class="text-gradient">logistics</span>',
      s3CardDateTag: 'EVENT DATE',
      s3CardDateVal: 'Friday, October 30, 2026',
      s3CardTimeTag: 'OFFICIAL TIME',
      s3CardTimeVal: '08:00 – 12:30',
      s3CardVenueTag: 'VENUE & ADDRESS',
      s3CardVenueVal: 'RETOS / FTS Institute Library',

      // Scene 02: Direct Action Cards
      actCardCalTitle: 'Add to Calendar',
      actCardCalDesc: 'Save the event date and time.',
      actCardCalBtn: 'Download .ics',
      actCardMapTitle: 'Get Directions',
      actCardMapDesc: 'Open location in Google Maps or Waze.',
      s3BtnGoogle: 'Google Maps ↗',
      s3BtnGoogleAria: 'Open location in Google Maps (opens in new tab)',
      s3BtnWaze: 'Waze ↗',
      s3BtnWazeAria: 'Open direct navigation in Waze (opens in new tab)',
      actCardAgendaTitle: 'View Event Agenda',
      actCardAgendaDesc: 'Discover schedules and presentations by career.',
      actCardAgendaBtn: 'View schedule',

      // Scene 02: Agenda Modal
      agendaModalBadge: 'OFFICIAL SCHEDULE',
      agendaModalTitle: 'Event Agenda & Schedule',
      agendaModalCloseAria: 'Close agenda modal window',
      s4SummaryDateLabel: 'DATE:',
      s4SummaryTimeLabel: 'TIME:',
      s4SummaryTimeVal: '08:00 — 12:30 hrs',
      s4BlocksCount: '22 CONFIRMED BLOCKS',
      agendaTimelineAria: 'Official event schedule timeline',
      modalAgendaAccept: 'Close Agenda',

      // Scene 02: Navigation
      s2BtnBack: '← Back to context',
      s2BtnNext: 'Confirm attendance →',

      // Scene 03: Confirmation & QR Pass (1-Step Confirmation)
      scene2Aria: 'Scene 3 of 3: Confirmation and QR pass',
      s5Step1Badge: 'REGISTRATION TERMINAL',
      s5Step1Coords: 'Confirmation PROTOCOL // OFFICIAL ACCESS',
      s5Step1Kicker: '03 / ATTENDANCE CONFIRMATION',
      s5Step1Title: 'Secure your <span class="text-gradient">attendance</span>',
      s5DemoNoticeBadge: 'LOCAL DEMO MODE',
      s5DemoNoticeText: 'Local demonstration environment. Confirmations generate a validated pass locally. In production, they connect to Supabase via a serverless function.',
      s5FieldNameLabel: 'FULL NAME *',
      s5FieldNameHint: 'At least 2 characters',
      s5FieldNamePlaceholder: 'E.g. Mr. John Doe',
      s5FieldRoleLabel: 'YOUR ROLE *',
      s5FieldRoleHint: 'Select institutional profile',
      s5RolePlaceholder: 'Select your role...',
      s5RoleEstudiante: 'Student',
      s5RoleDocente: 'Teacher / Faculty',
      s5RoleEmpresa: 'Company Representative',
      s5RoleFamiliar: 'Family Member',
      s5RoleInvitado: 'Special Guest',
      s5ErrRole: '⚠ Please select your role from the list.',
      s5FieldAttLabel: 'ATTENDANCE STATUS *',
      s5FieldAttHint: 'Select your response',
      s5AttYesTitle: 'Yes, I will attend',
      s5AttYesDesc: 'Reserve official seat',
      s5AttNoTitle: 'I cannot attend',
      s5FieldOrgLabel: 'ORGANIZATION / INSTITUTION (OPTIONAL)',
      s5FieldOrgPlaceholder: 'E.g. Company, University, or Institution',
      s5BtnSubmit: 'Confirm Attendance',
      s5PrivacyNotice: '<strong>Privacy notice:</strong> Provided information (name, role, attendance, and organization) is strictly used for official accreditation and organization of RETOS Showcase 2026 - 2nd Edition.',
      s5BtnBackToProg: '← Back to logistics',

      // Error Handling
      s5ErrorBadge: 'ERROR SUBMITTING CONFIRMATION',
      s5BtnRetry: 'Retry submission',

      // Scene 03: Completed Pass & Session
      s5Step3Coords: 'THANK YOU FOR YOUR Confirmation',
      s5Step3Kicker: '03 / ACCESS CONFIRMED',
      s5ClosingHeadline: 'Session <span class="text-gradient">completed.</span>',
      s5ClosingMessage: 'Your presence is a great motivation for our students. We look forward to having your valuable company.',
      s5ResultBadgeCompleted: 'REGISTRATION COMPLETED',
      s5ResultTitleReceived: 'Confirmation received',
      s5LabelHolder: 'NAME:',
      s5LabelResponse: 'RESPONSE:',
      s5LabelRole: 'ROLE:',
      s5LabelOrg: 'ORGANIZATION:',
      s5LabelCode: 'CONFIRMATION CODE:',
      s5QrSectionTitle: 'DIGITAL ACCREDITATION PASS',
      s5QrSectionDesc: 'Present this QR code from your mobile device or printed at the entrance of the RETOS Library.',
      s5BtnDownloadPass: 'DOWNLOAD DIGITAL PASS (PNG)',
      s5CountdownStatus: 'TIME REMAINING UNTIL START',
      s5CountdownLive: 'STANDBY // 30 OCT 2026',
      s5CdDays: 'DAYS',
      s5CdHours: 'HOURS',
      s5CdMin: 'MIN',
      s5CdSec: 'SEC',
      s5CdFullDate: 'Friday, October 30, 2026 // 08:00 hrs',
      s5MetaEventKey: 'EVENT',
      s5MetaDateKey: 'DATE & VENUE',
      s5MetaDateVal: 'RETOS / FTS Institute Library • La Libertad',
      s5MetaAccredKey: 'ACCREDITATION',
      s5MetaAccredVal: 'Active in system',
      s5BtnShare: 'Share our invitation',
      s5BtnRestart: '↺ Back to start',

      // Modal Shortcuts Guide
      modalTitle: 'Keyboard Shortcuts & Navigation Guide',
      modalCloseAria: 'Close modal window',
      modalIntro: 'This interactive web invitation allows seamless navigation across 3 scenes using keyboard or on-screen touch controls:',
      modalNext: 'Advance to next scene',
      modalPrev: 'Go back to previous scene',
      modalAudio: 'Enable / Mute audio effects',
      modalEsc: 'Close this window',
      modalAccept: 'Understood'
    },

    es: {
      // Document & Global HUD
      docTitle: 'RETOS Showcase 2026 - 2nd Edition — Instituto RETOS',
      brandLogoAlt: 'Logotipo del Instituto RETOS',
      step1: 'Bienvenida',
      step2: 'Logística',
      step3: 'Asistencia',
      step1Aria: 'Escena 1 de 3: Contexto y esencia del evento',
      step2Aria: 'Escena 2 de 3: Logística y agenda del evento',
      step3Aria: 'Escena 3 de 3: Confirmación de asistencia y pase QR',
      mobileNavToggleAria: 'Abrir menú de navegación',
      mobileMenuAria: 'Navegación entre escenas',
      mobileStep1Aria: 'Escena 1',
      mobileStep2Aria: 'Escena 2',
      mobileStep3Aria: 'Escena 3',
      audioAria: 'Activar o desactivar efectos de sonido',
      audioTitle: 'Efectos de sonido (Web Audio)',
      helpAria: 'Atajos de teclado y ayuda',
      helpTitle: 'Atajos de teclado',
      langSelectorAria: 'Selector de idioma / Language selector',
      langEnAria: 'Cambiar idioma a inglés',
      langEsAria: 'Cambiar idioma a español',

      // Escena 01: Contexto y Esencia
      scene0Aria: 'Escena 1 de 3: Contexto y esencia del evento',
      s1Badge: 'INVITACIÓN ESPECIAL',
      s1LogoAlt: 'Logotipo holográfico circular del evento',
      s1Institution: 'Programa de Inglés • RETOS / FTS',
      s1HeroTitle: 'RETOS Showcase <span class="text-gradient">2026</span> - 2nd Edition',
      wteTitle: '¿QUÉ ENCONTRARÁS?',
      wteCard1Title: 'Certificación de inglés',
      wteCard2Title: 'Proyectos aplicados por carrera',
      wteCard3Title: 'Ambiente 100% en inglés',

      // Escena 01: Tarjeta Descubre RETOS Showcase (desplegable de definición, visión y misión)
      s1DiscoverHook: '¿Quieres conocer más sobre nuestro Showcase?',
      s1DiscoverTitle: 'Descubre RETOS Showcase',
      s1DiscoverSubtitle: 'Conoce la esencia de RETOS Showcase, nuestra visión y misión.',
      s1DiscoverBtn: 'Conocer RETOS Showcase',
      s1DiscoverBtnClose: 'Ocultar detalles',
      s2Lead: 'RETOS Showcase es un espacio donde los estudiantes de cada carrera demuestran sus habilidades de comunicación en inglés aplicadas a entornos técnicos del mundo real y evidencian sus avances hacia la acreditación del idioma inglés, de acuerdo con el Marco Común Europeo de Referencia para las Lenguas (MCER).',
      s2MissionBadge: 'PROPÓSITO FORMATIVO',
      s2MissionTitle: 'Nuestra misión',
      s2MissionBody: 'Fomentar un espacio de aprendizaje, intercambio y certificación que fortalezca las competencias comunicativas en inglés de nuestros estudiantes.',
      s2VisionBadge: 'PROYECCIÓN ESTRATÉGICA',
      s2VisionTitle: 'Nuestra visión',
      s2VisionBody: 'Consolidarnos como un evento de referencia que impulse el intercambio académico en inglés y proyecte el talento estudiantil hacia oportunidades nacionales e internacionales.',

      btnStart: 'INICIAR EXPERIENCIA',
      btnStartAria: 'Iniciar experiencia y avanzar a la sección de logística',

      // Escena 02: Logística y Agenda
      scene1Aria: 'Escena 2 de 3: Logística y agenda del evento',
      s3Badge: 'LOGÍSTICA CONFIRMADA',
      s3Coords: 'RETOS / FTS // SEDE Y LOGÍSTICA',
      s3Kicker: '02 / FECHA, SEDE Y LOGÍSTICA',
      s3Title: 'Fecha, sede y <span class="text-gradient">logística</span>',
      s3CardDateTag: 'FECHA DEL EVENTO',
      s3CardDateVal: 'Viernes, 30 de octubre de 2026',
      s3CardTimeTag: 'HORARIO OFICIAL',
      s3CardTimeVal: '08:00 – 12:30',
      s3CardVenueTag: 'SEDE Y DIRECCIÓN',
      s3CardVenueVal: 'Biblioteca del Instituto RETOS / FTS',

      // Escena 02: 3 Tarjetas de Acción Directa
      actCardCalTitle: 'Agregar al calendario',
      actCardCalDesc: 'Guarda la fecha y el horario del evento.',
      actCardCalBtn: 'Descargar .ics',
      actCardMapTitle: 'Cómo llegar',
      actCardMapDesc: 'Abre la ubicación en Google Maps o Waze.',
      s3BtnGoogle: 'Google Maps ↗',
      s3BtnGoogleAria: 'Abrir la ubicación en Google Maps (se abre en una pestaña nueva)',
      s3BtnWaze: 'Waze ↗',
      s3BtnWazeAria: 'Abrir la ruta directa en Waze (se abre en una pestaña nueva)',
      actCardAgendaTitle: 'Agenda del evento',
      actCardAgendaDesc: 'Conoce los horarios y las presentaciones de cada carrera.',
      actCardAgendaBtn: 'Ver agenda',

      // Escena 02: Modal de Agenda
      agendaModalBadge: 'PROGRAMA OFICIAL',
      agendaModalTitle: 'Agenda y horarios del evento',
      agendaModalCloseAria: 'Cerrar ventana de la agenda',
      s4SummaryDateLabel: 'FECHA:',
      s4SummaryTimeLabel: 'HORARIO:',
      s4SummaryTimeVal: '08:00 — 12:30 hrs',
      s4BlocksCount: '22 BLOQUES CONFIRMADOS',
      agendaTimelineAria: 'Cronograma oficial de actividades del evento',
      modalAgendaAccept: 'Cerrar agenda',

      // Escena 02: Navegación
      s2BtnBack: '← Volver a la bienvenida',
      s2BtnNext: 'Confirmar asistencia →',

      // Escena 03: Confirmación y Pase QR (Confirmation en 1 Paso)
      scene2Aria: 'Escena 3 de 3: Confirmación de asistencia y pase QR',
      s5Step1Badge: 'MÓDULO DE REGISTRO',
      s5Step1Coords: 'REGISTRO DE ASISTENCIA // ACCESO OFICIAL',
      s5Step1Kicker: '03 / CONFIRMACIÓN DE ASISTENCIA',
      s5Step1Title: 'Confirma tu <span class="text-gradient">asistencia</span>',
      s5DemoNoticeBadge: 'MODO DE DEMOSTRACIÓN LOCAL',
      s5DemoNoticeText: 'Entorno de demostración local. Las confirmaciones generan un pase validado en tu navegador. En producción, el registro se conecta a Supabase mediante una función serverless.',
      s5FieldNameLabel: 'NOMBRE COMPLETO *',
      s5FieldNameHint: 'Mínimo 2 caracteres',
      s5FieldNamePlaceholder: 'Ej. Lic. Juan Pacheco',
      s5FieldRoleLabel: 'TU ROL *',
      s5FieldRoleHint: 'Selecciona tu perfil institucional',
      s5RolePlaceholder: 'Selecciona tu rol...',
      s5RoleEstudiante: 'Estudiante',
      s5RoleDocente: 'Docente / Cuerpo académico',
      s5RoleEmpresa: 'Representante de empresa',
      s5RoleFamiliar: 'Familiar',
      s5RoleInvitado: 'Invitado especial',
      s5ErrRole: '⚠ Por favor, selecciona tu rol en la lista.',
      s5FieldAttLabel: 'CONFIRMACIÓN DE ASISTENCIA *',
      s5FieldAttHint: 'Selecciona tu respuesta',
      s5AttYesTitle: 'Sí, asistiré',
      s5AttYesDesc: 'Reservar mi cupo oficial',
      s5AttNoTitle: 'No podré asistir',
      s5FieldOrgLabel: 'ORGANIZACIÓN O INSTITUCIÓN (OPCIONAL)',
      s5FieldOrgPlaceholder: 'Ej. Empresa, universidad o institución',
      s5BtnSubmit: 'Confirmar asistencia',
      s5PrivacyNotice: '<strong>Aviso de privacidad:</strong> Los datos proporcionados (nombre, rol, asistencia y organización) se utilizan exclusivamente para la acreditación oficial y la logística de RETOS Showcase 2026 - 2nd Edition.',
      s5BtnBackToProg: '← Volver a logística',

      // Errores
      s5ErrorBadge: 'ERROR AL ENVIAR EL REGISTRO',
      s5BtnRetry: 'Intentar de nuevo',

      // Escena 03: Pantalla final y Pase
      s5Step3Coords: 'GRACIAS POR CONFIRMAR TU ASISTENCIA',
      s5Step3Kicker: '03 / REGISTRO CONFIRMADO',
      s5ClosingHeadline: 'Registro <span class="text-gradient">completado.</span>',
      s5ClosingMessage: 'Tu presencia es una gran motivación para nuestros estudiantes. Será un gusto contar con tu valiosa compañía.',
      s5ResultBadgeCompleted: 'REGISTRO COMPLETADO',
      s5ResultTitleReceived: 'Confirmación recibida',
      s5LabelHolder: 'NOMBRE:',
      s5LabelResponse: 'RESPUESTA:',
      s5LabelRole: 'ROL:',
      s5LabelOrg: 'ORGANIZACIÓN:',
      s5LabelCode: 'CÓDIGO DE CONFIRMACIÓN:',
      s5QrSectionTitle: 'PASE DIGITAL DE ACREDITACIÓN',
      s5QrSectionDesc: 'Presenta este código QR desde tu celular o impreso al ingresar a la Biblioteca del Instituto RETOS.',
      s5BtnDownloadPass: 'DESCARGAR PASE DIGITAL (PNG)',
      s5CountdownStatus: 'TIEMPO RESTANTE PARA EL INICIO',
      s5CountdownLive: 'EN ESPERA // 30 OCT 2026',
      s5CdDays: 'DÍAS',
      s5CdHours: 'HORAS',
      s5CdMin: 'MIN',
      s5CdSec: 'SEG',
      s5CdFullDate: 'Viernes, 30 de octubre de 2026 // 08:00 hrs',
      s5MetaEventKey: 'EVENTO',
      s5MetaDateKey: 'FECHA Y SEDE',
      s5MetaDateVal: 'Biblioteca del Instituto RETOS / FTS • La Libertad',
      s5MetaAccredKey: 'ACREDITACIÓN',
      s5MetaAccredVal: 'Activa en el sistema',
      s5BtnShare: 'Compartir esta invitación',
      s5BtnRestart: '↺ Volver al inicio',

      // Modal de Ayuda y Atajos
      modalTitle: 'Atajos de teclado y guía de navegación',
      modalCloseAria: 'Cerrar ventana de ayuda',
      modalIntro: 'Puedes recorrer las 3 escenas de esta invitación interactiva usando el teclado o los controles táctiles en pantalla:',
      modalNext: 'Avanzar a la siguiente escena',
      modalPrev: 'Volver a la escena anterior',
      modalAudio: 'Activar o silenciar efectos de sonido',
      modalEsc: 'Cerrar esta ventana',
      modalAccept: 'Entendido'
    }
  };

  var currentLang = DEFAULT_LANG;

  function getStoredLang() {
    try {
      var saved = localStorage.getItem(STORAGE_KEY);
      if (saved === 'es' || saved === 'en') return saved;
    } catch (_) {}
    return DEFAULT_LANG;
  }

  function saveLang(lang) {
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch (_) {}
  }

  /**
   * Aplica un idioma a toda la página: actualiza textos marcados con data-i18n,
   * atributos marcados con data-i18n-attr, sincroniza selectores y actualiza <html lang>.
   * @param {string} lang 'en' | 'es'
   */
  function applyLang(lang) {
    if (lang !== 'es' && lang !== 'en') {
      lang = DEFAULT_LANG;
    }

    currentLang = lang;
    saveLang(lang);

    // 1. Actualizar atributo lang en el documento
    if (document.documentElement) {
      document.documentElement.lang = lang;
    }

    var dict = TRANSLATIONS[lang] || TRANSLATIONS.en;

    // 2. Actualizar título de documento si existe clave
    if (dict.docTitle) {
      document.title = dict.docTitle;
    }

    // 3. Actualizar nodos de texto con data-i18n
    var translatableNodes = document.querySelectorAll('[data-i18n]');
    for (var i = 0; i < translatableNodes.length; i++) {
      var el = translatableNodes[i];
      var key = el.getAttribute('data-i18n');
      if (key && dict[key] !== undefined) {
        var val = dict[key];
        if (el.tagName === 'OPTION') {
          el.textContent = val;
        } else if (typeof val === 'string' && (val.indexOf('<') !== -1 && val.indexOf('>') !== -1)) {
          el.innerHTML = val;
        } else {
          el.textContent = val;
        }
      }
    }

    // 4. Actualizar atributos con data-i18n-attr (ej. "aria-label:key,title:key,placeholder:key,alt:key")
    var attrNodes = document.querySelectorAll('[data-i18n-attr]');
    for (var j = 0; j < attrNodes.length; j++) {
      var attrEl = attrNodes[j];
      var rawMapping = attrEl.getAttribute('data-i18n-attr');
      if (!rawMapping) continue;

      var pairs = rawMapping.split(',');
      for (var k = 0; k < pairs.length; k++) {
        var pair = pairs[k].trim().split(':');
        if (pair.length === 2) {
          var attrName = pair[0].trim();
          var attrKey = pair[1].trim();
          if (attrName && attrKey && dict[attrKey] !== undefined) {
            attrEl.setAttribute(attrName, dict[attrKey]);
          }
        }
      }
    }

    // 5. Sincronizar todos los selectores de idioma en el DOM
    var langButtons = document.querySelectorAll('.lang-btn');
    for (var m = 0; m < langButtons.length; m++) {
      var btn = langButtons[m];
      var btnLang = btn.getAttribute('data-lang');
      var isActive = (btnLang === lang);
      btn.classList.toggle('active', isActive);
      btn.setAttribute('aria-pressed', isActive ? 'true' : 'false');
    }

    // 6. Notificar a otros módulos suscritos al cambio de idioma
    try {
      window.dispatchEvent(new CustomEvent('retos:langchange', {
        detail: { lang: lang }
      }));
    } catch (_) {}
  }

  // Inicialización con idioma guardado o inglés por defecto
  currentLang = getStoredLang();

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      applyLang(currentLang);
    });
  } else {
    applyLang(currentLang);
  }

  // Exponer API global
  window.applyLang = applyLang;
  window.getCurrentLang = function () {
    return currentLang;
  };
  window.i18nDict = TRANSLATIONS;

})();