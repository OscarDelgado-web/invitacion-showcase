/**
 * ==============================================================================
 * SISTEMA BILINGÜE (i18n) — RETOS SHOWCASE 2026 - 2ND EDITION
 * Inglés por defecto, español opcional. 100% Vanilla JS sin dependencias.
 * Soporta almacenamiento seguro en localStorage, conmutación reactiva y
 * sincronización de selectores visuales en Scene 1 y toggle fijo HUD.
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
      step2: 'Purpose',
      step3: 'Logistics',
      step4: 'Schedule',
      step5: 'RSVP',
      step1Aria: 'Scene 1 of 5: Welcome',
      step2Aria: 'Scene 2 of 5: Purpose',
      step3Aria: 'Scene 3 of 5: Logistics',
      step4Aria: 'Scene 4 of 5: Schedule',
      step5Aria: 'Scene 5 of 5: RSVP',
      mobileNavToggleAria: 'Open navigation menu',
      mobileMenuAria: 'Scene navigation',
      mobileStep1Aria: 'Scene 1',
      mobileStep2Aria: 'Scene 2',
      mobileStep3Aria: 'Scene 3',
      mobileStep4Aria: 'Scene 4',
      mobileStep5Aria: 'Scene 5',
      audioAria: 'Toggle synthetic sound effects',
      audioTitle: 'Sound effects (Web Audio)',
      helpAria: 'Keyboard shortcuts and help',
      helpTitle: 'Keyboard shortcuts',
      langSelectorAria: 'Language selector / Selector de idioma',
      langEnAria: 'Switch language to English',
      langEsAria: 'Switch language to Spanish',

      // Scene 01: Cover & Welcome
      scene0Aria: 'Scene 1 of 5: Cover and welcome',
      s1Badge: 'SPECIAL INVITATION',
      s1LogoAlt: 'Event circular hologram logo',
      s1Institution: 'English Program • RETOS / FTS',
      s1HeroTitle: 'RETOS Showcase <span class="text-gradient">2026</span> - 2nd Edition',
      wteTitle: 'What to expect',
      // Rule: "English Certification", "Career Based Project" and "English Environment Only" remain in English in both versions
      wteCard1Title: 'English Certification',
      wteCard1Desc: 'Through <strong>Neo Study</strong>, aligned with the <strong>Common European Framework of Reference for Languages (CEFR)</strong>.',
      wteCard2Title: 'Career Based Project',
      wteCard2Desc: 'Showcase of technical and professional skills acquired throughout the cycle.',
      wteCard3Title: 'English Environment Only',
      wteCard3Desc: 'Role plays and interactive activities in a fully immersive English environment.',
      wteFooterNote: 'During the event, all communication will be in English.',
      btnStart: 'Start experience',
      btnStartAria: 'Start experience and proceed to next scene',

      // Scene 02: Purpose & Experience
      scene1Aria: 'Scene 2 of 5: Purpose and experience',
      s2Badge: 'IDENTITY &amp; PURPOSE',
      s2Coords: 'RETOS / FTS // ENGLISH PROGRAM',
      s2Kicker: '02 / PURPOSE AND EXPERIENCE',
      s2Title: 'A space for connection and <span class="text-gradient">talent</span>',
      s2Lead: 'RETOS Showcase 2026 - 2nd Edition is a space where our students in Mechatronics, Industrial Maintenance, Logistics, and Software Development demonstrate their English communication skills applied to real-world technical environments.',
      s2MissionBadge: 'EDUCATIONAL PURPOSE',
      s2MissionTitle: 'Our Mission',
      s2MissionBody: 'To foster a space of learning, exchange, and certification that strengthens students’ communicative competence in English.',
      s2VisionBadge: 'STRATEGIC PROJECTION',
      s2VisionTitle: 'Our Vision',
      s2VisionBody: 'To be a flagship event promoting academic exchange in English and showcasing student talent toward national and international opportunities.',
      s2BtnBack: '← Back to cover',
      s2BtnNext: 'View coordinates &amp; logistics →',

      // Scene 03: Coordinates & Logistics
      scene2Aria: 'Scene 3 of 5: Coordinates and logistics',
      s3Badge: 'CONFIRMED LOGISTICS',
      s3Coords: 'COORDINATES // LOCATION',
      s3Kicker: '03 / EVENT COORDINATES',
      s3Title: 'Date, venue and <span class="text-gradient">logistics</span>',
      s3Lead: 'Review all essential information to plan your attendance and synchronize it with your calendar.',
      s3CardDateTag: 'EVENT DATE',
      s3CardDateVal: 'Friday, October 30, 2026',
      s3CardDateSub: 'Official gathering for academic year 2026',
      s3CardTimeTag: 'OFFICIAL TIME',
      s3CardTimeVal: '08:00 – 12:30',
      s3CardTimeSub: 'Continuous morning program',
      s3CardVenueTag: 'VENUE &amp; ADDRESS',
      s3CardVenueVal: 'RETOS / FTS Institute Library',
      s3CardVenueSub: 'RETOS Institute • La Libertad',
      s3CardAudienceTag: 'AUDIENCE &amp; ACCREDITATION',
      s3CardAudienceVal: 'RETOS / FTS Community, enterprises, institutions, and honored guests.',
      s3CardAudienceSub: 'In-person morning session. RSVP is kindly requested to support our students.',
      s3BannerTitle: 'How to get there and synchronize the event?',
      s3BannerSub: 'Open the navigation map or add the event to your personal calendar:',
      s3BtnGoogle: 'Open in Google Maps',
      s3BtnGoogleAria: 'Open location in Google Maps (opens in new tab)',
      s3BtnWaze: 'Open in Waze',
      s3BtnWazeAria: 'Open direct navigation in Waze (opens in new tab)',
      s3BtnBack: '← Purpose and experience',
      s3BtnNext: 'Explore schedule →',

      // Scene 04: Schedule / Formal Agenda
      scene3Aria: 'Scene 4 of 5: Event schedule',
      s4Badge: 'OFFICIAL SCHEDULE',
      s4Kicker: '04 / EVENT SCHEDULE',
      s4Title: 'Formal agenda and <span class="text-gradient">schedule</span>',
      s4Lead: 'Chronological schedule of the morning session, student presentations in technical contexts, certification awards, and institutional networking.',
      s4SummaryDateLabel: 'DATE:',
      s4SummaryTimeLabel: 'TIME:',
      s4SummaryTimeVal: '08:00 — 12:30 hrs',
      s4BlocksCount: '22 CONFIRMED BLOCKS',
      agendaTimelineAria: 'Official event schedule',
      s4BtnBack: '← Coordinates and logistics',
      s4BtnNext: 'Confirm attendance →',

      // Scene 05: Attendance Confirmation (RSVP Step 1)
      scene4Aria: 'Scene 5 of 5: Attendance confirmation',
      s5Step1Badge: 'REGISTRATION TERMINAL',
      s5Step1Coords: 'RSVP PROTOCOL // STEP 1 OF 3',
      s5Step1Kicker: '05 / ATTENDANCE CONFIRMATION',
      s5Step1Title: 'Secure your <span class="text-gradient">accreditation</span>',
      s5Step1Lead: 'Fill in your official details to reserve your seat at the institutional event.',
      s5DemoNoticeBadge: 'LOCAL DEMO MODE',
      s5DemoNoticeText: 'Local demonstration environment. Confirmations generate a simulated receipt to validate the interface. In production, they connect to Supabase via a serverless function.',
      s5FieldNameLabel: 'FULL NAME *',
      s5FieldNameHint: 'At least 2 characters',
      s5FieldNamePlaceholder: 'E.g. Mr. John Doe',
      s5FieldEmailLabel: 'EMAIL ADDRESS *',
      s5FieldEmailHint: 'Institutional or personal',
      s5FieldEmailPlaceholder: 'email@domain.com',
      s5FieldAttLabel: 'ATTENDANCE STATUS *',
      s5FieldAttHint: 'Select your response',
      s5AttYesTitle: 'Yes, I will attend',
      s5AttYesDesc: 'Reserve official seat',
      s5AttNoTitle: 'I cannot attend',
      s5FieldNotesLabel: 'ORGANIZATION / ADDITIONAL NOTES (OPTIONAL)',
      s5FieldNotesPlaceholder: 'E.g. University / Company / Special requests',
      s5BtnSubmit: 'Submit Form',
      s5PrivacyNotice: '🔒 <strong>Privacy notice:</strong> Provided information (name, email, attendance, and notes) is strictly used for official accreditation and organization of RETOS Showcase 2026 - 2nd Edition.',
      s5BtnBackToProg: '← Back to schedule',

      // Step 2: Verification Protocol
      s5Step2Badge: 'VERIFICATION PROTOCOL',
      s5Step2Coords: 'ENCRYPTED CHANNEL // STEP 2 OF 3',
      s5Step2Kicker: 'STEP 02 / CREDENTIAL VERIFICATION',
      s5Step2Title: 'Verifying <span class="text-gradient">accreditation</span>',
      s5Step2Lead: 'Synchronizing credentials prior to definitive institutional registration.',
      s5TerminalProcessing: 'PROCESSING...',
      s5TerminalSyncLabel: 'ACCESS SYNCHRONIZATION',
      verificationLogAria: 'Verification log',
      s5GrantTitle: 'ACCESS GRANTED',
      s5GrantSubtitle: 'Credentials validated. Ready to confirm your official registration.',
      s5ErrorBadge: 'ERROR SUBMITTING CONFIRMATION',
      s5BtnRetry: 'Retry submission',
      s5BtnModifyData: '← Edit information',
      s5BtnSkipAnim: 'Skip animation',
      s5BtnConfirmAttendance: 'Confirm attendance',
      s5BtnConfirming: 'CONFIRMING...',

      // Step 3: Access & Session Completed
      s5Step3Coords: 'THANK YOU FOR YOUR RSVP',
      s5Step3Kicker: '05 / ACCESS &amp; SESSION COMPLETED',
      s5ClosingHeadline: 'Session <span class="text-gradient">completed.</span>',
      s5ClosingMessage: 'Your presence is a great motivation for our students. We look forward to having your valuable company.',
      s5ResultBadgeCompleted: 'REGISTRATION COMPLETED',
      s5ResultTitleReceived: 'Confirmation received',
      s5LabelHolder: 'NAME:',
      s5LabelEmail: 'EMAIL:',
      s5LabelResponse: 'RESPONSE:',
      s5LabelCode: 'REGISTRATION CODE:',
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
      s5MetaDateKey: 'DATE &amp; VENUE',
      s5MetaDateVal: 'RETOS / FTS Institute Library • La Libertad',
      s5MetaAccredKey: 'ACCREDITATION',
      s5MetaAccredVal: 'Active in system',
      s5BtnShare: 'Share our invitation',
      s5BtnRestart: '↺ Back to start',

      // Modal Shortcuts Guide
      modalTitle: 'Keyboard Shortcuts &amp; Navigation Guide',
      modalCloseAria: 'Close modal window',
      modalIntro: 'This interactive web invitation allows seamless navigation across 5 scenes using keyboard or on-screen touch controls:',
      modalNext: 'Advance to next scene',
      modalPrev: 'Go back to previous scene',
      modalAudio: 'Enable / Mute audio effects',
      modalEsc: 'Close this window',
      modalAccept: 'Understood'
    },

    es: {
      // Document & Global HUD
      docTitle: 'RETOS Showcase 2026 - 2nd Edition — Instituto RETOS',
      brandLogoAlt: 'Logotipo Instituto RETOS',
      step1: 'Bienvenida',
      step2: 'Propósito',
      step3: 'Logística',
      step4: 'Programa',
      step5: 'Confirmación',
      step1Aria: 'Escena 1 de 5: Bienvenida',
      step2Aria: 'Escena 2 de 5: Propósito',
      step3Aria: 'Escena 3 de 5: Logística',
      step4Aria: 'Escena 4 de 5: Programa',
      step5Aria: 'Escena 5 de 5: Confirmación',
      mobileNavToggleAria: 'Abrir menú de navegación',
      mobileMenuAria: 'Navegación de escenas',
      mobileStep1Aria: 'Escena 1',
      mobileStep2Aria: 'Escena 2',
      mobileStep3Aria: 'Escena 3',
      mobileStep4Aria: 'Escena 4',
      mobileStep5Aria: 'Escena 5',
      audioAria: 'Alternar efectos de sonido sintéticos',
      audioTitle: 'Efectos de sonido (Web Audio)',
      helpAria: 'Atajos de teclado y ayuda',
      helpTitle: 'Atajos de teclado',
      langSelectorAria: 'Selector de idioma / Language selector',
      langEnAria: 'Cambiar idioma a Inglés',
      langEsAria: 'Cambiar idioma a Español',

      // Escena 01: Portada y Bienvenida
      scene0Aria: 'Escena 1 de 5: Portada y bienvenida',
      s1Badge: 'INVITACIÓN ESPECIAL',
      s1LogoAlt: 'Logotipo circular del evento',
      s1Institution: 'Programa de Inglés • RETOS / FTS',
      s1HeroTitle: 'RETOS Showcase <span class="text-gradient">2026</span> - 2nd Edition',
      wteTitle: '¿Qué esperar?',
      // Regla: "English Certification", "Career Based Project" y "English Environment Only" se mantienen en inglés en ambas versiones
      wteCard1Title: 'English Certification',
      wteCard1Desc: 'A través de <strong>Neo Study</strong>, según el <strong>Marco Común Europeo de Referencia para las Lenguas (MCERL)</strong>.',
      wteCard2Title: 'Career Based Project',
      wteCard2Desc: 'Demostración de las habilidades técnicas y profesionales adquiridas durante el ciclo formativo.',
      wteCard3Title: 'English Environment Only',
      wteCard3Desc: 'Role plays y actividades interactivas en un entorno de inmersión total.',
      wteFooterNote: 'Durante el evento, la comunicación será en inglés.',
      btnStart: 'Abrir Invitación',
      btnStartAria: 'Abrir Invitación y avanzar a la siguiente escena',

      // Escena 02: Propósito y Experiencia
      scene1Aria: 'Escena 2 de 5: Propósito y experiencia',
      s2Badge: 'IDENTIDAD &amp; PROPÓSITO',
      s2Coords: 'RETOS / FTS // PROGRAMA DE INGLÉS',
      s2Kicker: '02 / PROPÓSITO Y EXPERIENCIA',
      s2Title: 'Un espacio de encuentro y <span class="text-gradient">talento</span>',
      s2Lead: 'RETOS Showcase 2026 - 2nd Edition es un espacio donde nuestros estudiantes de Mecatrónica, Mantenimiento Industrial, Logística y Desarrollo de Software demuestran sus competencias comunicativas en inglés aplicadas a entornos técnicos reales.',
      s2MissionBadge: 'PROPÓSITO FORMATIVO',
      s2MissionTitle: 'Nuestra Misión',
      s2MissionBody: 'Promover un espacio de aprendizaje, intercambio y certificación que fortalezca las competencias comunicativas en inglés de los estudiantes.',
      s2VisionBadge: 'PROYECCIÓN ESTRATÉGICA',
      s2VisionTitle: 'Nuestra Visión',
      s2VisionBody: 'Ser un evento que impulse el intercambio académico en inglés y proyecte el talento de los estudiantes hacia oportunidades nacionales e internacionales.',
      s2BtnBack: '← Volver a portada',
      s2BtnNext: 'Ver coordenadas y logística →',

      // Escena 03: Coordenadas y Logística
      scene2Aria: 'Escena 3 de 5: Coordenadas y logística',
      s3Badge: 'LOGÍSTICA CONFIRMADA',
      s3Coords: 'COORDENADAS // LOCALIZACIÓN',
      s3Kicker: '03 / COORDENADAS DEL EVENTO',
      s3Title: 'Fecha, sede y <span class="text-gradient">logística</span>',
      s3Lead: 'Consulta toda la información esencial para planificar tu participación y sincronizarla con tu agenda personal.',
      s3CardDateTag: 'FECHA DEL EVENTO',
      s3CardDateVal: 'Viernes, 30 de octubre de 2026',
      s3CardDateSub: 'Convocatoria oficial para el año 2026',
      s3CardTimeTag: 'HORARIO OFICIAL',
      s3CardTimeVal: '08:00 – 12:30',
      s3CardTimeSub: 'Actividad matutina continua',
      s3CardVenueTag: 'SEDE &amp; DIRECCIÓN',
      s3CardVenueVal: 'Biblioteca de Instituto RETOS / FTS',
      s3CardVenueSub: 'Instituto RETOS • La Libertad',
      s3CardAudienceTag: 'AUDIENCIA &amp; ACREDITACIÓN',
      s3CardAudienceVal: 'Comunidad RETOS / FTS, empresas, instituciones e invitados especiales.',
      s3CardAudienceSub: 'Actividad presencial durante toda la mañana. Se solicita confirmar asistencia para acompañar a nuestros estudiantes.',
      s3BannerTitle: '¿Cómo llegar y sincronizar el evento?',
      s3BannerSub: 'Abre el mapa de navegación o añade el evento a tu agenda personal:',
      s3BtnGoogle: 'Abrir en Google Maps',
      s3BtnGoogleAria: 'Abrir ubicación en Google Maps (se abre en nueva pestaña)',
      s3BtnWaze: 'Abrir en Waze',
      s3BtnWazeAria: 'Abrir navegación directa en Waze (se abre en nueva pestaña)',
      s3BtnBack: '← Propósito y experiencia',
      s3BtnNext: 'Explorar programa →',

      // Escena 04: Programa y Cronograma
      scene3Aria: 'Escena 4 de 5: Programa del evento',
      s4Badge: 'PROGRAMA OFICIAL',
      s4Kicker: '04 / PROGRAMA DEL EVENTO',
      s4Title: 'Agenda formal y <span class="text-gradient">cronograma</span>',
      s4Lead: 'Estructura cronológica de la jornada matutina, presentaciones estudiantiles en contextos técnicos, entrega de certificaciones y vinculación institucional.',
      s4SummaryDateLabel: 'FECHA:',
      s4SummaryTimeLabel: 'HORARIO:',
      s4SummaryTimeVal: '08:00 — 12:30 hrs',
      s4BlocksCount: '22 BLOQUES CONFIRMADOS',
      agendaTimelineAria: 'Lista de actividades de la agenda',
      s4BtnBack: '← Coordenadas y logística',
      s4BtnNext: 'Confirmar asistencia →',

      // Escena 05: Confirmación de Asistencia (RSVP Paso 1)
      scene4Aria: 'Escena 5 de 5: Confirmación de asistencia',
      s5Step1Badge: 'TERMINAL DE REGISTRO',
      s5Step1Coords: 'PROTOCOLO RSVP // PASO 1 DE 3',
      s5Step1Kicker: '05 / CONFIRMACIÓN DE ASISTENCIA',
      s5Step1Title: 'Asegura tu <span class="text-gradient">acreditación</span>',
      s5Step1Lead: 'Completa tus datos oficiales para reservar tu plaza en el evento institucional.',
      s5DemoNoticeBadge: 'MODO DEMOSTRATIVO LOCAL',
      s5DemoNoticeText: 'Entorno local de demostración. Las confirmaciones generan un recibo simulado para validar la interfaz. En producción se conectan a Supabase mediante la función serverless.',
      s5FieldNameLabel: 'NOMBRE Y APELLIDO *',
      s5FieldNameHint: 'Mínimo 2 caracteres',
      s5FieldNamePlaceholder: 'Ej. Lic. Juan Pacheco',
      s5FieldEmailLabel: 'CORREO ELECTRÓNICO *',
      s5FieldEmailHint: 'Institucional o personal',
      s5FieldEmailPlaceholder: 'correo@dominio',
      s5FieldAttLabel: 'ESTADO DE ASISTENCIA *',
      s5FieldAttHint: 'Selecciona tu respuesta',
      s5AttYesTitle: 'Sí, asistiré',
      s5AttYesDesc: 'Reservar lugar oficial',
      s5AttNoTitle: 'No podré asistir',
      s5FieldNotesLabel: 'ORGANIZACIÓN / NOTAS ADICIONALES (OPCIONAL)',
      s5FieldNotesPlaceholder: 'Ej. Universidad / Empresa / Requerimientos',
      s5BtnSubmit: 'Enviar formulario',
      s5PrivacyNotice: '🔒 <strong>Aviso de privacidad:</strong> Los datos proporcionados (nombre, correo electrónico, asistencia y notas) se utilizan exclusivamente para la organización y acreditación oficial del RETOS Showcase 2026 - 2nd Edition.',
      s5BtnBackToProg: '← Volver al programa',

      // Paso 2 (Verificación)
      s5Step2Badge: 'PROTOCOLO DE VERIFICACIÓN',
      s5Step2Coords: 'CANAL CIFRADO // PASO 2 DE 3',
      s5Step2Kicker: 'PASO 02 / VERIFICACIÓN DE CREDENCIALES',
      s5Step2Title: 'Comprobando <span class="text-gradient">acreditación</span>',
      s5Step2Lead: 'Sincronizando credenciales antes del registro definitivo en el sistema institucional.',
      s5TerminalProcessing: 'PROCESANDO...',
      s5TerminalSyncLabel: 'SINCRONIZACIÓN DE ACCESO',
      verificationLogAria: 'Registro de comprobación',
      s5GrantTitle: 'ACCESS GRANTED',
      s5GrantSubtitle: 'Credenciales validadas. Listo para confirmar tu registro oficial.',
      s5ErrorBadge: 'ERROR AL ENVIAR CONFIRMACIÓN',
      s5BtnRetry: 'Reintentar envío',
      s5BtnModifyData: '← Modificar datos',
      s5BtnSkipAnim: 'Omitir animación',
      s5BtnConfirmAttendance: 'Confirmar asistencia',
      s5BtnConfirming: 'CONFIRMANDO...',

      // Paso 3 (Pantalla final)
      s5Step3Coords: 'GRACIAS POR TU ASISTENCIA',
      s5Step3Kicker: '05 / ACCESO Y SESIÓN COMPLETADA',
      s5ClosingHeadline: 'Sesión <span class="text-gradient">completada.</span>',
      s5ClosingMessage: 'Su presencia es una gran motivación para nuestros estudiantes. Esperamos contar con su valioso acompañamiento.',
      s5ResultBadgeCompleted: 'REGISTRO COMPLETADO',
      s5ResultTitleReceived: 'Confirmación recibida',
      s5LabelHolder: 'TITULAR:',
      s5LabelEmail: 'CORREO:',
      s5LabelResponse: 'RESPUESTA:',
      s5LabelCode: 'CÓDIGO DE REGISTRO:',
      s5QrSectionTitle: 'PASE DIGITAL DE ACREDITACIÓN',
      s5QrSectionDesc: 'Presenta este código QR desde tu teléfono o impreso en la entrada de la Biblioteca RETOS.',
      s5BtnDownloadPass: 'DESCARGAR PASE DIGITAL (PNG)',
      s5CountdownStatus: 'TIEMPO RESTANTE PARA EL INICIO',
      s5CountdownLive: 'EN ESPERA // 30 OCT 2026',
      s5CdDays: 'DÍAS',
      s5CdHours: 'HORAS',
      s5CdMin: 'MIN',
      s5CdSec: 'SEG',
      s5CdFullDate: 'Viernes, 30 de octubre de 2026 // 08:00 hrs',
      s5MetaEventKey: 'EVENTO',
      s5MetaDateKey: 'FECHA &amp; SEDE',
      s5MetaDateVal: 'Biblioteca de Instituto RETOS / FTS • La Libertad',
      s5MetaAccredKey: 'ACREDITACIÓN',
      s5MetaAccredVal: 'Activa en sistema',
      s5BtnShare: 'Comparte nuestra invitación',
      s5BtnRestart: '↺ Volver al inicio',

      // Modal de Ayuda y Atajos
      modalTitle: 'Atajos de Teclado &amp; Guía de Navegación',
      modalCloseAria: 'Cerrar ventana modal',
      modalIntro: 'Esta invitación web interactiva permite navegación fluida en 5 secciones mediante teclado o controles táctiles en pantalla:',
      modalNext: 'Avanzar a la siguiente escena',
      modalPrev: 'Retroceder a la escena anterior',
      modalAudio: 'Activar / Silenciar efectos de audio',
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
        if (typeof val === 'string' && (val.indexOf('<') !== -1 && val.indexOf('>') !== -1)) {
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
