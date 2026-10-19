/**
 * ==============================================================================
 * RETOS Showcase 2026 — Lógica del Dashboard de Asistencia (app.js)
 * Estilo: Dark Futuristic / High-Tech Academic & Institutional
 * Módulo Integrado: Escáner QR Óptico en Vivo & Validación contra Supabase
 * ==============================================================================
 */

'use strict';

(function () {
  /**
   * ============================================================================
   * MOTOR NATIVO DE CÓDIGO QR VECTORIAL Y PASE DIGITAL (QR ENGINE)
   * Cero dependencias externas. Totalmente offline y vectorial (SVG / Canvas).
   * ============================================================================
   */
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

      pushBits(0b0100, 4); // Byte mode
      pushBits(utf8.length, 8);
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

      generateSVG(text, size = 170) {
        if (!text) text = 'RETOS-SHOWCASE';
        const matrix = encode(text);
        const N = matrix.length;
        let paths = '';
        for (let r = 0; r < N; r++) {
          for (let c = 0; c < N; c++) {
            if (matrix[r][c] === 1) {
              paths += `<rect x="${c}" y="${r}" width="1" height="1" fill="#030708"/>`;
            }
          }
        }
        return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${N} ${N}" width="${size}" height="${size}" shape-rendering="crispEdges" role="img" aria-label="Código QR del Pase"><rect width="${N}" height="${N}" fill="#ffffff"/>${paths}</svg>`;
      },

      downloadPass(attendee) {
        if (!attendee || !attendee.codigo) return;
        const canvas = document.createElement('canvas');
        const width = 640;
        const height = 920;
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // 1. Fondo degradado
        const grad = ctx.createLinearGradient(0, 0, 0, height);
        grad.addColorStop(0, '#000000');
        grad.addColorStop(0.5, '#061710');
        grad.addColorStop(1, '#020605');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, width, height);

        // 2. Retícula técnica
        ctx.strokeStyle = 'rgba(160, 197, 37, 0.08)';
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
        ctx.strokeStyle = '#a0c525';
        ctx.lineWidth = 2;
        ctx.strokeRect(26, 26, width - 52, height - 52);

        // Esquinas acentuadas en verde neón / citron
        ctx.fillStyle = '#cbef52';
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
        ctx.fillStyle = '#cbef52';
        ctx.font = 'bold 12px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('INSTITUTO RETOS • PROGRAMA DE INGLÉS', width / 2, 68);

        ctx.fillStyle = '#ffffff';
        ctx.font = '900 26px sans-serif';
        ctx.fillText('RETOS SHOWCASE 2026 - 2nd Edition', width / 2, 106);

        ctx.fillStyle = '#a0c525';
        ctx.font = 'bold 11px monospace';
        ctx.fillText('PASE OFICIAL DE ACREDITACIÓN', width / 2, 132);

        // 5. Marco del código QR
        const qrBoxSize = 250;
        const qrX = (width - qrBoxSize) / 2;
        const qrY = 165;

        ctx.shadowColor = 'rgba(160, 197, 37, 0.45)';
        ctx.shadowBlur = 18;
        ctx.fillStyle = '#ffffff';
        if (ctx.roundRect) {
          ctx.beginPath();
          ctx.roundRect(qrX, qrY, qrBoxSize, qrBoxSize, 12);
          ctx.fill();
        } else {
          ctx.fillRect(qrX, qrY, qrBoxSize, qrBoxSize);
        }
        ctx.shadowBlur = 0;

        // 6. Dibujo del QR
        const attendeeCode = attendee.codigo || 'RETOS-SHOWCASE';
        const matrix = encode(attendeeCode);
        const N = matrix.length;
        const padding = 20;
        const cellSize = (qrBoxSize - padding * 2) / N;

        ctx.fillStyle = '#030708';
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
        ctx.fillStyle = '#cbef52';
        ctx.font = '900 24px monospace';
        ctx.fillText(attendeeCode, width / 2, qrY + qrBoxSize + 40);

        // 8. Ficha del asistente
        const infoY = qrY + qrBoxSize + 76;
        const boxW = width - 84;
        const boxX = 42;

        ctx.fillStyle = 'rgba(6, 22, 17, 0.7)';
        ctx.strokeStyle = 'rgba(160, 197, 37, 0.35)';
        ctx.lineWidth = 1;
        if (ctx.roundRect) {
          ctx.beginPath();
          ctx.roundRect(boxX, infoY, boxW, 230, 10);
          ctx.fill();
          ctx.stroke();
        } else {
          ctx.fillRect(boxX, infoY, boxW, 230);
          ctx.strokeRect(boxX, infoY, boxW, 230);
        }

        ctx.textAlign = 'left';
        const leftX = boxX + 24;

        const drawField = (label, value, y, valColor = '#ffffff') => {
          ctx.fillStyle = '#cbef52';
          ctx.font = 'bold 11px monospace';
          ctx.fillText(label, leftX, y);
          ctx.fillStyle = valColor;
          ctx.font = '600 15px sans-serif';
          ctx.fillText(value, leftX, y + 20);
        };

        drawField('TITULAR ACREDITADO:', attendee.nombre || 'Invitado Especial', infoY + 28, '#a0c525');
        drawField('PROCEDENCIA / INSTITUCIÓN:', attendee.organizacion || 'Participante Independiente', infoY + 78);
        drawField('FECHA & HORARIO:', 'Viernes 30 de Octubre 2026 • 08:00 - 12:30 hrs', infoY + 128);
        drawField('SEDE OFICIAL:', 'Biblioteca RETOS, Instituto RETOS • La Libertad', infoY + 178);

        // 9. Pie de seguridad
        ctx.textAlign = 'center';
        ctx.fillStyle = '#9cb8aa';
        ctx.font = '11px monospace';
        ctx.fillText('PRESENTA ESTE PASE DIGITAL AL INGRESAR AL RECINTO', width / 2, height - 52);

        // Descarga automática
        const link = document.createElement('a');
        link.download = `PASE-RETOS-${attendeeCode}.png`;
        link.href = canvas.toDataURL('image/png');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    };
  })();

  // Estado general de la aplicación
  const state = {
    registros: [],
    filtered: [],
    filterAttendance: 'all', // 'all' | 'si' | 'no'
    filterRole: 'all',
    searchQuery: '',
    sortOrder: 'date-desc',
    viewMode: 'stack', // 'stack' | 'grid' | 'table'
    isLoading: true,
    activeRecordForQr: null
  };

  // Estado del Escáner Óptico de Cámara
  const scannerState = {
    stream: null,
    scanning: false,
    facingMode: 'environment', // 'environment' | 'user'
    soundEnabled: true,
    lastScannedCode: null,
    lastScannedTime: 0,
    animationFrameId: null,
    stats: { total: 0, valid: 0, invalid: 0 }
  };

  // Sintetizador Web Audio API nativo
  let audioCtx = null;
  function playFeedbackSound(type = 'success') {
    if (!scannerState.soundEnabled) return;
    try {
      if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      }
      if (audioCtx.state === 'suspended') {
        audioCtx.resume();
      }
      const now = audioCtx.currentTime;

      if (type === 'success') {
        // Doble acorde futurista verde
        const osc1 = audioCtx.createOscillator();
        const osc2 = audioCtx.createOscillator();
        const gain = audioCtx.createGain();

        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(880, now);
        osc1.frequency.exponentialRampToValueAtTime(1320, now + 0.12);

        osc2.type = 'triangle';
        osc2.frequency.setValueAtTime(440, now);
        osc2.frequency.exponentialRampToValueAtTime(660, now + 0.12);

        gain.gain.setValueAtTime(0.18, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(audioCtx.destination);

        osc1.start(now);
        osc2.start(now);
        osc1.stop(now + 0.35);
        osc2.stop(now + 0.35);
      } else if (type === 'warning') {
        // Tono de alerta ambar
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(520, now);
        osc.frequency.setValueAtTime(400, now + 0.1);

        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(now);
        osc.stop(now + 0.3);
      } else {
        // Tono de rechazo rojo
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(280, now);
        osc.frequency.setValueAtTime(160, now + 0.18);

        gain.gain.setValueAtTime(0.22, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.38);

        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(now);
        osc.stop(now + 0.38);
      }
    } catch (_) {}
  }

  // Elementos del DOM
  const elements = {
    // KPIs
    kpiTotal: document.getElementById('kpi-total'),
    kpiYes: document.getElementById('kpi-yes'),
    kpiYesPct: document.getElementById('kpi-yes-pct'),
    kpiNo: document.getElementById('kpi-no'),
    kpiNoPct: document.getElementById('kpi-no-pct'),
    kpiOrgs: document.getElementById('kpi-orgs'),
    kpiLatestTs: document.getElementById('kpi-latest-ts'),
    footerCount: document.getElementById('footer-count'),

    // Contadores en tabs
    countAll: document.getElementById('count-all'),
    countYes: document.getElementById('count-yes'),
    countNo: document.getElementById('count-no'),

    // Filtros y Búsqueda
    searchInput: document.getElementById('search-input'),
    btnClearSearch: document.getElementById('btn-clear-search'),
    segBtns: document.querySelectorAll('.seg-btn'),
    filterRole: document.getElementById('filter-role'),
    sortOrder: document.getElementById('sort-order'),
    activeQueryBar: document.getElementById('active-query-bar'),
    querySummaryText: document.getElementById('query-summary-text'),
    btnResetFilters: document.getElementById('btn-reset-filters'),

    // Vistas y Contenedores
    btnRefresh: document.getElementById('btn-refresh'),
    btnExportCsv: document.getElementById('btn-export-csv'),
    viewStack: document.getElementById('view-stack'),
    viewGrid: document.getElementById('view-grid'),
    viewTable: document.getElementById('view-table'),
    cardsContainer: document.getElementById('cards-container'),
    tableContainer: document.getElementById('table-container'),
    tableBody: document.getElementById('table-body'),
    loadingState: document.getElementById('loading-state'),
    emptyState: document.getElementById('empty-state'),
    emptyStateMsg: document.getElementById('empty-state-msg'),

    // Modal Nuevo Registro
    btnAddModal: document.getElementById('btn-add-modal'),
    modalAdd: document.getElementById('modal-add'),
    btnCloseModal: document.getElementById('btn-close-modal'),
    btnCancelModal: document.getElementById('btn-cancel-modal'),
    formAddAttendee: document.getElementById('form-add-attendee'),
    btnSubmitRecord: document.getElementById('btn-submit-record'),

    // Modal QR & Pase
    modalQr: document.getElementById('modal-qr'),
    btnCloseQrModal: document.getElementById('btn-close-qr-modal'),
    btnDoneQrModal: document.getElementById('btn-done-qr-modal'),
    btnCopyCodeModal: document.getElementById('btn-copy-code-modal'),
    btnDownloadPassModal: document.getElementById('btn-download-pass-modal'),
    qrModalName: document.getElementById('qr-modal-name'),
    qrModalRole: document.getElementById('qr-modal-role'),
    qrModalStatusBadge: document.getElementById('qr-modal-status-badge'),
    qrSvgWrapper: document.getElementById('qr-svg-wrapper'),
    qrModalCode: document.getElementById('qr-modal-code'),
    qrModalOrg: document.getElementById('qr-modal-org'),
    qrModalDate: document.getElementById('qr-modal-date'),
    qrModalUuid: document.getElementById('qr-modal-uuid'),
    qrModalOrigin: document.getElementById('qr-modal-origin'),

    // Modal Escáner QR
    btnOpenScanner: document.getElementById('btn-open-scanner'),
    modalScanner: document.getElementById('modal-scanner'),
    btnCloseScannerModal: document.getElementById('btn-close-scanner-modal'),
    btnDoneScannerModal: document.getElementById('btn-done-scanner-modal'),
    scannerVideo: document.getElementById('scanner-video'),
    scannerCanvas: document.getElementById('scanner-canvas'),
    scannerCamStatus: document.getElementById('scanner-cam-status'),
    btnSwitchCamera: document.getElementById('btn-switch-camera'),
    btnUploadQr: document.getElementById('btn-upload-qr'),
    scannerFileInput: document.getElementById('scanner-file-input'),
    btnToggleSound: document.getElementById('btn-toggle-sound'),
    soundStatusLabel: document.getElementById('sound-status-label'),
    formManualCode: document.getElementById('form-manual-code'),
    scannerManualInput: document.getElementById('scanner-manual-input'),
    scannerResultContainer: document.getElementById('scanner-result-container'),
    btnClearScanResult: document.getElementById('btn-clear-scan-result'),
    scanCountTotal: document.getElementById('scan-count-total'),
    scanCountValid: document.getElementById('scan-count-valid'),
    scanCountInvalid: document.getElementById('scan-count-invalid'),

    // Elementos de Seguridad & Login Gate
    loginOverlay: document.getElementById('login-overlay'),
    formLogin: document.getElementById('form-login'),
    inputLoginPassword: document.getElementById('input-login-password'),
    btnTogglePassword: document.getElementById('btn-toggle-password'),
    eyeIcon: document.getElementById('eye-icon'),
    loginErrorAlert: document.getElementById('login-error-alert'),
    loginErrorText: document.getElementById('login-error-text'),
    btnSubmitLogin: document.getElementById('btn-submit-login'),
    btnLogout: document.getElementById('btn-logout'),

    // Toast Container
    toastContainer: document.getElementById('toast-container'),
    dbStatus: document.getElementById('db-status')
  };

  /**
   * ==============================================================================
   * GESTIÓN DE SESIÓN Y AUTENTICACIÓN ADMINISTRATIVA (JWT / HMAC TOKEN)
   * ==============================================================================
   */
  const TOKEN_KEY = 'retos_dashboard_token';

  function getSessionToken() {
    return sessionStorage.getItem(TOKEN_KEY) || '';
  }

  function setSessionToken(token) {
    if (token) {
      sessionStorage.setItem(TOKEN_KEY, token);
    } else {
      sessionStorage.removeItem(TOKEN_KEY);
    }
  }

  function showLoginOverlay(msg) {
    if (elements.loginErrorAlert) {
      if (msg) {
        elements.loginErrorAlert.style.display = 'flex';
        elements.loginErrorText.textContent = msg;
      } else {
        elements.loginErrorAlert.style.display = 'none';
      }
    }
    if (elements.inputLoginPassword) {
      elements.inputLoginPassword.value = '';
    }
    if (elements.loginOverlay) {
      elements.loginOverlay.classList.remove('is-hidden');
    }
    setTimeout(() => {
      if (elements.inputLoginPassword) elements.inputLoginPassword.focus();
    }, 150);
  }

  /**
   * Wrapper autenticado para llamadas a la API protegida
   */
  async function authenticatedFetch(url, options = {}) {
    const token = getSessionToken();
    const headers = Object.assign({}, options.headers || {}, {
      'Authorization': `Bearer ${token}`
    });

    const response = await fetch(url, Object.assign({}, options, { headers }));
    if (response.status === 401) {
      setSessionToken(null);
      showLoginOverlay('Sesión expirada o credenciales no autorizadas. Por favor reingresa la contraseña.');
      throw new Error('Sesión no autorizada');
    }
    return response;
  }

  /**
   * Mapeo de roles de la conferencia
   */
  const ROLE_MAP = {
    estudiante: { label: 'Estudiante', icon: '🎓' },
    docente: { label: 'Docente', icon: '👨‍🏫' },
    empresa: { label: 'Empresa / Industria', icon: '💼' },
    familiar: { label: 'Familiar', icon: '👨‍👩‍👧' },
    invitado: { label: 'Invitado Especial', icon: '🌟' }
  };

  /**
   * Muestra un mensaje flotante tipo Toast
   */
  function showToast(message, type = 'default') {
    const toast = document.createElement('div');
    toast.className = `toast ${type === 'success' ? 'toast-success' : type === 'error' ? 'toast-error' : ''}`;
    toast.innerHTML = `
      <span>${type === 'success' ? '✔' : type === 'error' ? '⚠' : 'ℹ'}</span>
      <span>${message}</span>
    `;
    elements.toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      setTimeout(() => toast.remove(), 250);
    }, 3400);
  }

  /**
   * Formateador de fecha legible
   */
  function formatDate(isoString) {
    if (!isoString) return '--';
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (_) {
      return isoString;
    }
  }

  /**
   * Consulta principal de datos hacia la API de Supabase (Autenticada)
   */
  async function fetchRegistros() {
    state.isLoading = true;
    elements.loadingState.style.display = 'flex';
    elements.emptyState.style.display = 'none';
    elements.cardsContainer.style.display = 'none';
    elements.tableContainer.style.display = 'none';
    elements.btnRefresh.classList.add('loading');

    try {
      const res = await authenticatedFetch('/api/registros');
      if (!res.ok) {
        throw new Error(`Error HTTP: ${res.status}`);
      }

      const json = await res.json();
      if (!json.ok) {
        throw new Error(json.error || 'Error desconocido al obtener registros');
      }

      state.registros = Array.isArray(json.data) ? json.data : [];
      updateKpis();
      applyFiltersAndRender();
      showToast(`${state.registros.length} registros cargados desde Supabase`, 'success');
    } catch (err) {
      console.error('[Dashboard Error]:', err);
      showToast(`Error al cargar datos: ${err.message}`, 'error');
      elements.loadingState.style.display = 'none';
      elements.emptyState.style.display = 'flex';
      elements.emptyStateMsg.textContent = `No se pudo conectar con el servidor: ${err.message}. Verifica que el servidor o la conexión a Supabase estén activos.`;
    } finally {
      state.isLoading = false;
      elements.btnRefresh.classList.remove('loading');
    }
  }

  /**
   * Actualiza los indicadores numéricos (KPIs)
   */
  function updateKpis() {
    const total = state.registros.length;
    const yesCount = state.registros.filter(r => (r.asistencia || '').toLowerCase() === 'si').length;
    const noCount = state.registros.filter(r => (r.asistencia || '').toLowerCase() === 'no').length;

    const yesPct = total > 0 ? Math.round((yesCount / total) * 100) : 0;
    const noPct = total > 0 ? Math.round((noCount / total) * 100) : 0;

    // Organizaciones únicas
    const orgsSet = new Set();
    state.registros.forEach(r => {
      if (r.organizacion && r.organizacion.trim()) {
        orgsSet.add(r.organizacion.trim().toLowerCase());
      }
    });

    elements.kpiTotal.textContent = total;
    elements.kpiYes.textContent = yesCount;
    elements.kpiYesPct.textContent = `${yesPct}%`;
    elements.kpiNo.textContent = noCount;
    elements.kpiNoPct.textContent = `${noPct}%`;
    elements.kpiOrgs.textContent = orgsSet.size;

    elements.countAll.textContent = total;
    elements.countYes.textContent = yesCount;
    elements.countNo.textContent = noCount;
    elements.footerCount.textContent = `Total en catálogo: ${total} registros`;

    if (state.registros.length > 0) {
      const latest = state.registros[0];
      elements.kpiLatestTs.textContent = `Último: ${formatDate(latest.created_at)}`;
    } else {
      elements.kpiLatestTs.textContent = 'Sin registros';
    }
  }

  /**
   * Aplica filtros de búsqueda, asistencia, rol y ordenamiento
   */
  function applyFiltersAndRender() {
    let list = [...state.registros];

    // 1. Filtro Asistencia
    if (state.filterAttendance !== 'all') {
      list = list.filter(r => (r.asistencia || '').toLowerCase() === state.filterAttendance);
    }

    // 2. Filtro Rol
    if (state.filterRole !== 'all') {
      list = list.filter(r => (r.rol || '').toLowerCase() === state.filterRole);
    }

    // 3. Filtro Búsqueda
    const q = state.searchQuery.trim().toLowerCase();
    if (q) {
      list = list.filter(r => {
        const nombre = (r.nombre || '').toLowerCase();
        const codigo = (r.codigo || '').toLowerCase();
        const org = (r.organizacion || '').toLowerCase();
        const rol = (r.rol || '').toLowerCase();
        return nombre.includes(q) || codigo.includes(q) || org.includes(q) || rol.includes(q);
      });
      elements.btnClearSearch.style.display = 'block';
    } else {
      elements.btnClearSearch.style.display = 'none';
    }

    // 4. Ordenamiento
    list.sort((a, b) => {
      if (state.sortOrder === 'date-desc') {
        return new Date(b.created_at || 0) - new Date(a.created_at || 0);
      }
      if (state.sortOrder === 'date-asc') {
        return new Date(a.created_at || 0) - new Date(b.created_at || 0);
      }
      if (state.sortOrder === 'name-asc') {
        return (a.nombre || '').localeCompare(b.nombre || '');
      }
      if (state.sortOrder === 'name-desc') {
        return (b.nombre || '').localeCompare(a.nombre || '');
      }
      return 0;
    });

    state.filtered = list;

    // Barra de resumen de filtros activos
    const hasActiveFilters = state.filterAttendance !== 'all' || state.filterRole !== 'all' || q.length > 0;
    if (hasActiveFilters) {
      elements.activeQueryBar.style.display = 'flex';
      elements.querySummaryText.textContent = `Mostrando ${list.length} de ${state.registros.length} registros según los criterios aplicados.`;
    } else {
      elements.activeQueryBar.style.display = 'none';
    }

    renderCurrentView();
  }

  /**
   * Renderiza la vista seleccionada (Cards Stack, Cards Grid o Tabla)
   */
  function renderCurrentView() {
    elements.loadingState.style.display = 'none';

    if (state.filtered.length === 0) {
      elements.cardsContainer.style.display = 'none';
      elements.tableContainer.style.display = 'none';
      elements.emptyState.style.display = 'flex';
      return;
    }

    elements.emptyState.style.display = 'none';

    if (state.viewMode === 'table') {
      elements.cardsContainer.style.display = 'none';
      elements.tableContainer.style.display = 'block';
      renderTable();
    } else {
      elements.tableContainer.style.display = 'none';
      elements.cardsContainer.style.display = state.viewMode === 'stack' ? 'flex' : 'grid';
      elements.cardsContainer.className = `cards-layout ${state.viewMode === 'stack' ? 'mode-stack' : 'mode-grid'}`;
      renderCards();
    }
  }

  /**
   * Renderizado de CARDS (Verdes si Asiste vs Negras/Rojas si Declina)
   */
  function renderCards() {
    elements.cardsContainer.innerHTML = '';

    state.filtered.forEach(record => {
      const isAttending = (record.asistencia || '').toLowerCase() === 'si';
      const roleInfo = ROLE_MAP[record.rol] || { label: record.rol || 'General', icon: '👤' };
      const orgDisplay = record.organizacion && record.organizacion.trim() ? record.organizacion.trim() : 'Participante Independiente';
      const isOrgEmpty = !record.organizacion || !record.organizacion.trim();

      const card = document.createElement('article');
      card.className = `rsvp-card ${isAttending ? 'card-attend-yes' : 'card-attend-no'}`;
      card.dataset.id = String(record.id);

      card.innerHTML = `
        <!-- HEADER DE LA CARD -->
        <div class="card-header-row">
          <div class="card-title-group">
            <h3 class="attendee-name">
              <span>${escapeHtml(record.nombre)}</span>
            </h3>
            <span class="role-badge role-${escapeHtml(record.rol)}">
              <span>${roleInfo.icon}</span>
              <span>${escapeHtml(roleInfo.label)}</span>
            </span>
          </div>

          <!-- STATUS BADGE -->
          <div class="status-pill ${isAttending ? 'status-yes' : 'status-no'}">
            <span>${isAttending ? '✓ ASISTIRÁ' : '✕ NO ASISTE'}</span>
          </div>
        </div>

        <!-- DETALLES: PROCEDENCIA (DE DÓNDE VIENE), FECHA -->
        <div class="card-details-grid">
          <!-- Procedencia -->
          <div class="detail-item">
            <svg class="detail-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M3 21h18M3 7v14M21 7v14M9 3h6v4H9zM9 11h2M9 15h2M13 11h2M13 15h2"/>
            </svg>
            <div class="detail-content">
              <span class="detail-label">De dónde viene / Institución:</span>
              <span class="detail-val ${isOrgEmpty ? 'is-empty' : ''}">${escapeHtml(orgDisplay)}</span>
            </div>
          </div>

          <!-- Fecha de registro -->
          <div class="detail-item">
            <svg class="detail-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
            <div class="detail-content">
              <span class="detail-label">Fecha de confirmación:</span>
              <span class="detail-val">${formatDate(record.created_at)}</span>
            </div>
          </div>
        </div>

        <!-- FOOTER: CÓDIGO RETOS & ACCIONES -->
        <div class="card-footer-row">
          <div class="code-chip" title="Haz clic para copiar el código" data-action="copy-code" data-code="${escapeHtml(record.codigo)}">
            <span>${escapeHtml(record.codigo || 'SIN-CÓDIGO')}</span>
            <svg class="copy-mini-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
            </svg>
          </div>

          <div class="card-actions-group">
            <button class="btn-card-action" data-action="view-qr" data-id="${String(record.id)}" title="Ver Pase y Código QR">
              <svg style="width: 14px; height: 14px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="3" width="7" height="7"></rect>
                <rect x="14" y="3" width="7" height="7"></rect>
                <rect x="14" y="14" width="7" height="7"></rect>
                <rect x="3" y="14" width="7" height="7"></rect>
              </svg>
              <span>Ver Pase / QR</span>
            </button>

            <button class="btn-card-action danger" data-action="delete" data-id="${String(record.id)}" data-name="${escapeHtml(record.nombre)}" title="Eliminar registro">
              <svg style="width: 14px; height: 14px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              </svg>
            </button>
          </div>
        </div>
      `;

      elements.cardsContainer.appendChild(card);
    });
  }

  /**
   * Renderizado de TABLA COMPLETA
   */
  function renderTable() {
    elements.tableBody.innerHTML = '';

    state.filtered.forEach(record => {
      const isAttending = (record.asistencia || '').toLowerCase() === 'si';
      const roleInfo = ROLE_MAP[record.rol] || { label: record.rol || 'General', icon: '👤' };
      const orgDisplay = record.organizacion && record.organizacion.trim() ? record.organizacion.trim() : 'Independiente';

      const tr = document.createElement('tr');
      tr.className = isAttending ? 'table-row-yes' : 'table-row-no';

      tr.innerHTML = `
        <td>
          <span class="status-pill ${isAttending ? 'status-yes' : 'status-no'}">
            ${isAttending ? '✓ ASISTIRÁ' : '✕ NO ASISTE'}
          </span>
        </td>
        <td>
          <strong style="color: #ffffff; font-size: 0.95rem;">${escapeHtml(record.nombre)}</strong>
        </td>
        <td>
          <span class="role-badge role-${escapeHtml(record.rol)}">
            <span>${roleInfo.icon}</span>
            <span>${escapeHtml(roleInfo.label)}</span>
          </span>
        </td>
        <td>
          <span>${escapeHtml(orgDisplay)}</span>
        </td>
        <td>
          <span class="code-chip" style="font-size: 0.78rem;" data-action="copy-code" data-code="${escapeHtml(record.codigo)}" title="Copiar código">
            ${escapeHtml(record.codigo)}
          </span>
        </td>
        <td style="color: var(--tx-secondary); font-family: var(--font-mono); font-size: 0.8rem;">
          ${formatDate(record.created_at)}
        </td>
        <td style="text-align: right;">
          <div style="display: inline-flex; gap: 0.4rem;">
            <button class="btn-card-action" data-action="view-qr" data-id="${String(record.id)}" title="Ver Pase QR">
              QR
            </button>
            <button class="btn-card-action danger" data-action="delete" data-id="${String(record.id)}" data-name="${escapeHtml(record.nombre)}" title="Eliminar registro">
              &times;
            </button>
          </div>
        </td>
      `;

      elements.tableBody.appendChild(tr);
    });
  }

  /**
   * Exporta los datos a formato CSV
   */
  function exportCsv() {
    if (!state.filtered || state.filtered.length === 0) {
      showToast('No hay registros para exportar', 'error');
      return;
    }

    const headers = ['ID', 'Nombre', 'Asistencia', 'Rol', 'Organizacion', 'Codigo', 'Fecha_Registro', 'Origen'];
    const rows = state.filtered.map(r => [
      `"${r.id || ''}"`,
      `"${(r.nombre || '').replace(/"/g, '""')}"`,
      `"${r.asistencia || ''}"`,
      `"${r.rol || ''}"`,
      `"${(r.organizacion || 'Independiente').replace(/"/g, '""')}"`,
      `"${r.codigo || ''}"`,
      `"${r.created_at || ''}"`,
      `"${r.origen || ''}"`
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `RETOS_Showcase_RSVP_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Archivo CSV descargado correctamente', 'success');
  }

  /**
   * Abre el modal del código QR y detalles del asistente
   */
  function openQrModal(recordId) {
    const record = state.registros.find(r => String(r.id) === String(recordId));
    if (!record) {
      showToast('No se encontró el registro seleccionado', 'error');
      return;
    }

    state.activeRecordForQr = record;
    const isAttending = (record.asistencia || '').toLowerCase() === 'si';
    const roleInfo = ROLE_MAP[record.rol] || { label: record.rol || 'General', icon: '👤' };

    elements.qrModalName.textContent = record.nombre || 'Sin Nombre';
    elements.qrModalRole.textContent = `${roleInfo.icon} ${roleInfo.label}`;
    elements.qrModalCode.textContent = record.codigo || 'RETOS-XXXXXX';
    elements.qrModalOrg.textContent = record.organizacion || 'Participante Independiente';
    elements.qrModalDate.textContent = formatDate(record.created_at);
    elements.qrModalUuid.textContent = record.id;
    elements.qrModalOrigin.textContent = record.origen || 'web_showcase_2026';

    elements.qrModalStatusBadge.innerHTML = `
      <span class="status-pill ${isAttending ? 'status-yes' : 'status-no'}">
        ${isAttending ? '✓ ASISTENCIA CONFIRMADA' : '✕ NO ASISTIRÁ (DECLINADO)'}
      </span>
    `;

    // Renderizado instantáneo de código QR vectorial local
    elements.qrSvgWrapper.innerHTML = QREngine.generateSVG(record.codigo || 'RETOS-DEMO', 170);

    elements.modalQr.classList.add('is-open');
    elements.modalQr.setAttribute('aria-hidden', 'false');
  }

  /**
   * Elimina un registro de Supabase
   */
  async function deleteRecord(id, name) {
    if (!confirm(`¿Estás seguro de que deseas eliminar el registro de "${name}" de Supabase? Esta acción no se puede revertir.`)) {
      return;
    }

    try {
      const res = await authenticatedFetch(`/api/registros?id=${encodeURIComponent(id)}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (!data.ok) {
        throw new Error(data.error || 'No se pudo eliminar de la base de datos');
      }

      showToast(`Registro de "${name}" eliminado`, 'success');
      state.registros = state.registros.filter(r => String(r.id) !== String(id));
      updateKpis();
      applyFiltersAndRender();
    } catch (err) {
      showToast(`Error al eliminar: ${err.message}`, 'error');
    }
  }

  /**
   * Copia texto al portapapeles con feedback
   */
  function copyToClipboard(text) {
    if (!text) return;
    navigator.clipboard.writeText(text).then(() => {
      showToast(`Código copiado: ${text}`, 'success');
    }).catch(() => {
      showToast(`Código: ${text}`);
    });
  }

  /**
   * ============================================================================
   * MÓDULO DE ESCANEO QR Y VALIDACIÓN EN VIVO (CAMERA SCANNER & CHECK-IN)
   * ============================================================================
   */

  /**
   * Extrae el código canónico RETOS-XXXXXX desde texto libre o URLs completas
   */
  function extractTicketCode(rawString) {
    if (!rawString || typeof rawString !== 'string') return '';
    const trimmed = rawString.trim();

    // 1. Si es URL completa, buscar query param 'code'
    try {
      if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
        const parsed = new URL(trimmed);
        const codeParam = parsed.searchParams.get('code');
        if (codeParam) return codeParam.trim().toUpperCase();
      }
    } catch (_) {}

    // 2. Extraer código con patrón estándar RETOS-XXXXXX
    const match = trimmed.match(/RETOS-[23456789ABCDEFGHJKLMNPQRSTUVWXYZ]{6}/i);
    if (match) return match[0].toUpperCase();

    // 3. Fallback a string directo si inicia con RETOS-
    if (trimmed.toUpperCase().startsWith('RETOS-')) {
      return trimmed.toUpperCase();
    }

    return trimmed.toUpperCase();
  }

  /**
   * Valida el código escaneado contra la base de datos local y Supabase
   */
  function validateScannedCode(rawCode) {
    const code = extractTicketCode(rawCode);
    if (!code) {
      showToast('Formato de código ilegible', 'error');
      return;
    }

    // Prevención de spam/doble escaneo en menos de 1.5 segundos
    const now = Date.now();
    if (scannerState.lastScannedCode === code && (now - scannerState.lastScannedTime) < 1600) {
      return;
    }
    scannerState.lastScannedCode = code;
    scannerState.lastScannedTime = now;

    scannerState.stats.total++;

    // Búsqueda en los registros actuales
    const record = state.registros.find(r => 
      (r.codigo || '').toUpperCase() === code || 
      String(r.id || '').toUpperCase() === code
    );

    if (record) {
      const isAttending = (record.asistencia || '').toLowerCase() === 'si';
      if (isAttending) {
        scannerState.stats.valid++;
        playFeedbackSound('success');
        renderScannerValidResult(record);
        showToast(`✔ Acceso Válido: ${record.nombre}`, 'success');
      } else {
        scannerState.stats.invalid++;
        playFeedbackSound('warning');
        renderScannerDeclinedResult(record);
        showToast(`⚠ Acceso Denegado (Marcó NO ASISTIRÁ): ${record.nombre}`, 'error');
      }
    } else {
      scannerState.stats.invalid++;
      playFeedbackSound('error');
      renderScannerInvalidResult(code);
      showToast(`✕ Ticket Inválido: ${code}`, 'error');
    }

    updateScannerStats();
  }

  /**
   * Actualiza el panel de estadísticas del escáner
   */
  function updateScannerStats() {
    if (elements.scanCountTotal) elements.scanCountTotal.textContent = scannerState.stats.total;
    if (elements.scanCountValid) elements.scanCountValid.textContent = scannerState.stats.valid;
    if (elements.scanCountInvalid) elements.scanCountInvalid.textContent = scannerState.stats.invalid;
  }

  /**
   * Renderiza el resultado cuando el TICKET ES VÁLIDO Y ASISTE
   */
  function renderScannerValidResult(record) {
    const roleInfo = ROLE_MAP[record.rol] || { label: record.rol || 'General', icon: '👤' };
    const org = record.organizacion || 'Participante Independiente';

    elements.scannerResultContainer.className = 'scanner-result-box result-state-valid';
    elements.scannerResultContainer.innerHTML = `
      <div class="val-card-header">
        <span class="val-badge val-badge-ok">
          <span>✓ TICKET VÁLIDO</span>
        </span>
        <span class="status-pill status-yes">ACCESO PERMITIDO</span>
      </div>

      <h3 class="val-attendee-name">${escapeHtml(record.nombre)}</h3>

      <div class="val-details-list">
        <div class="val-row">
          <span class="val-row-label">Perfil / Rol:</span>
          <span class="val-row-val">${roleInfo.icon} ${escapeHtml(roleInfo.label)}</span>
        </div>
        <div class="val-row">
          <span class="val-row-label">Procedencia:</span>
          <span class="val-row-val">${escapeHtml(org)}</span>
        </div>
        <div class="val-row">
          <span class="val-row-label">Código Acreditado:</span>
          <span class="val-row-code">${escapeHtml(record.codigo)}</span>
        </div>
        <div class="val-row">
          <span class="val-row-label">Fecha Registro:</span>
          <span class="val-row-val">${formatDate(record.created_at)}</span>
        </div>
      </div>

      <div style="display: flex; gap: 0.5rem; justify-content: flex-end; margin-top: 0.25rem;">
        <button type="button" class="btn btn-secondary btn-sm" onclick="window.copyToClipboard('${escapeHtml(record.codigo)}')">
          Copiar Código
        </button>
        <button type="button" class="btn btn-primary btn-sm" onclick="window.clearScannerResult()">
          Escanear Siguiente
        </button>
      </div>
    `;
  }

  /**
   * Renderiza el resultado cuando el registro existe pero DECLINÓ ASISTENCIA
   */
  function renderScannerDeclinedResult(record) {
    const roleInfo = ROLE_MAP[record.rol] || { label: record.rol || 'General', icon: '👤' };

    elements.scannerResultContainer.className = 'scanner-result-box result-state-declined';
    elements.scannerResultContainer.innerHTML = `
      <div class="val-card-header">
        <span class="val-badge val-badge-warn">
          <span>⚠ REGISTRO DECLINADO</span>
        </span>
        <span class="status-pill status-no">NO ASISTE</span>
      </div>

      <h3 class="val-attendee-name">${escapeHtml(record.nombre)}</h3>

      <div class="val-details-list">
        <div class="val-row">
          <span class="val-row-label">Estado:</span>
          <strong style="color: var(--c-amber);">El usuario confirmó que NO asistiría</strong>
        </div>
        <div class="val-row">
          <span class="val-row-label">Perfil:</span>
          <span class="val-row-val">${roleInfo.icon} ${escapeHtml(roleInfo.label)}</span>
        </div>
        <div class="val-row">
          <span class="val-row-label">Procedencia:</span>
          <span class="val-row-val">${escapeHtml(record.organizacion || 'Independiente')}</span>
        </div>
        <div class="val-row">
          <span class="val-row-label">Código:</span>
          <span class="val-row-code">${escapeHtml(record.codigo)}</span>
        </div>
      </div>

      <div style="display: flex; gap: 0.5rem; justify-content: flex-end;">
        <button type="button" class="btn btn-secondary btn-sm" onclick="window.clearScannerResult()">
          Continuar
        </button>
      </div>
    `;
  }

  /**
   * Renderiza el resultado cuando el TICKET NO ES VÁLIDO / NO EXISTE
   */
  function renderScannerInvalidResult(code) {
    elements.scannerResultContainer.className = 'scanner-result-box result-state-invalid';
    elements.scannerResultContainer.innerHTML = `
      <div class="val-card-header">
        <span class="val-badge val-badge-error">
          <span>✕ TICKET NO VÁLIDO</span>
        </span>
        <span class="status-pill status-no">DENEGADO</span>
      </div>

      <h3 class="val-attendee-name" style="color: var(--c-alert-red); font-size: 1.15rem;">
        Código no registrado en Supabase
      </h3>

      <div class="val-details-list">
        <div class="val-row">
          <span class="val-row-label">Lectura óptica:</span>
          <span class="val-row-code" style="color: var(--c-alert-red);">${escapeHtml(code)}</span>
        </div>
        <div class="val-row">
          <span class="val-row-label">Diagnóstico:</span>
          <span class="val-row-val" style="color: var(--tx-muted);">El código no existe en la base de datos de asistentes oficial.</span>
        </div>
      </div>

      <div style="display: flex; gap: 0.5rem; justify-content: flex-end;">
        <button type="button" class="btn btn-secondary btn-sm" onclick="window.clearScannerResult()">
          Volver a Escanear
        </button>
      </div>
    `;
  }

  /**
   * Limpia el visor de resultados del escáner
   */
  window.clearScannerResult = function () {
    scannerState.lastScannedCode = null;
    elements.scannerResultContainer.className = 'scanner-result-box empty-result';
    elements.scannerResultContainer.innerHTML = `
      <div class="result-placeholder">
        <div class="radar-pulse"></div>
        <h4 class="placeholder-title">Esperando Escaneo</h4>
        <p class="placeholder-text">Apunta el lector óptico hacia el código QR impreso o en pantalla del invitado.</p>
        <span class="hud-hint">Compatible con códigos directos RETOS-XXXXXX o URL del pase</span>
      </div>
    `;
    elements.scannerManualInput.value = '';
  };

  /**
   * Inicia el sensor óptico de cámara para el escaneo
   */
  async function startCameraScanner() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      elements.scannerCamStatus.textContent = 'Cámara no soportada en este navegador';
      return;
    }

    elements.scannerCamStatus.textContent = 'Iniciando sensor óptico...';

    // Detener stream previo si existiera
    stopCameraScanner();

    try {
      const constraints = {
        video: {
          facingMode: scannerState.facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      scannerState.stream = stream;
      elements.scannerVideo.srcObject = stream;

      elements.scannerVideo.onloadedmetadata = () => {
        elements.scannerVideo.play();
        scannerState.scanning = true;
        elements.scannerCamStatus.textContent = 'Sensor óptico en vivo • Buscando QR...';
        runScannerLoop();
      };
    } catch (err) {
      console.warn('[Scanner Camera]:', err);
      elements.scannerCamStatus.textContent = 'Acceso a cámara bloqueado o no disponible';
      showToast('Permiso de cámara denegado o no disponible. Puedes usar "Cargar Imagen" o validación manual.', 'error');
    }
  }

  /**
   * Detiene el sensor óptico de cámara
   */
  function stopCameraScanner() {
    scannerState.scanning = false;
    if (scannerState.animationFrameId) {
      cancelAnimationFrame(scannerState.animationFrameId);
      scannerState.animationFrameId = null;
    }
    if (scannerState.stream) {
      scannerState.stream.getTracks().forEach(track => track.stop());
      scannerState.stream = null;
    }
    if (elements.scannerVideo) {
      elements.scannerVideo.srcObject = null;
    }
    elements.scannerCamStatus.textContent = 'Sensor inactivo';
  }

  /**
   * Bucle de análisis continuo de fotogramas (Hardware BarcodeDetector + Fallback jsQR)
   */
  async function runScannerLoop() {
    if (!scannerState.scanning) return;

    const video = elements.scannerVideo;
    if (video.readyState === video.HAVE_ENOUGH_DATA) {
      // 1. Detección nativa de alta velocidad por hardware si está disponible
      if ('BarcodeDetector' in window) {
        try {
          const detector = new window.BarcodeDetector({ formats: ['qr_code'] });
          const barcodes = await detector.detect(video);
          if (barcodes.length > 0 && barcodes[0].rawValue) {
            validateScannedCode(barcodes[0].rawValue);
          }
        } catch (_) {}
      } else if (typeof window.jsQR === 'function') {
        // 2. Fallback universal con el motor jsQR cargado localmente
        const canvas = elements.scannerCanvas;
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const qrCode = window.jsQR(imgData.data, imgData.width, imgData.height, {
          inversionAttempts: 'dontInvert'
        });

        if (qrCode && qrCode.data) {
          validateScannedCode(qrCode.data);
        }
      }
    }

    if (scannerState.scanning) {
      scannerState.animationFrameId = requestAnimationFrame(runScannerLoop);
    }
  }

  /**
   * Decodifica y valida un código QR a partir de un archivo de imagen
   */
  function scanFromImageFile(file) {
    if (!file) return;
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();
      img.onload = async () => {
        // Detección nativa BarcodeDetector
        if ('BarcodeDetector' in window) {
          try {
            const detector = new window.BarcodeDetector({ formats: ['qr_code'] });
            const barcodes = await detector.detect(img);
            if (barcodes.length > 0 && barcodes[0].rawValue) {
              validateScannedCode(barcodes[0].rawValue);
              return;
            }
          } catch (_) {}
        }

        // Fallback jsQR
        if (typeof window.jsQR === 'function') {
          const canvas = elements.scannerCanvas;
          canvas.width = img.naturalWidth || img.width;
          canvas.height = img.naturalHeight || img.height;
          const ctx = canvas.getContext('2d', { willReadFrequently: true });
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const qrCode = window.jsQR(imgData.data, imgData.width, imgData.height, {
            inversionAttempts: 'dontInvert'
          });

          if (qrCode && qrCode.data) {
            validateScannedCode(qrCode.data);
            return;
          }
        }

        showToast('No se encontró ningún código QR legible en la imagen', 'error');
      };
      img.src = e.target.result;
    };

    reader.readAsDataURL(file);
  }

  /**
   * Restablece todos los filtros de la lista principal
   */
  window.resetAllFilters = function () {
    state.filterAttendance = 'all';
    state.filterRole = 'all';
    state.searchQuery = '';
    state.sortOrder = 'date-desc';

    elements.searchInput.value = '';
    elements.filterRole.value = 'all';
    elements.sortOrder.value = 'date-desc';

    elements.segBtns.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.filterAttendance === 'all');
    });

    applyFiltersAndRender();
  };

  /**
   * Escapar HTML preventivo contra XSS
   */
  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  /**
   * Inicialización de eventos del DOM
   */
  function setupEventListeners() {
    // Recargar datos
    elements.btnRefresh.addEventListener('click', fetchRegistros);

    // Exportar CSV
    elements.btnExportCsv.addEventListener('click', exportCsv);

    // Búsqueda en vivo (debounced)
    let searchDebounce;
    elements.searchInput.addEventListener('input', (e) => {
      clearTimeout(searchDebounce);
      searchDebounce = setTimeout(() => {
        state.searchQuery = e.target.value;
        applyFiltersAndRender();
      }, 150);
    });

    elements.btnClearSearch.addEventListener('click', () => {
      elements.searchInput.value = '';
      state.searchQuery = '';
      applyFiltersAndRender();
      elements.searchInput.focus();
    });

    // Filtros de asistencia (Tabs)
    elements.segBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        elements.segBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        state.filterAttendance = btn.dataset.filterAttendance;
        applyFiltersAndRender();
      });
    });

    // Filtro Rol
    elements.filterRole.addEventListener('change', (e) => {
      state.filterRole = e.target.value;
      applyFiltersAndRender();
    });

    // Ordenamiento
    elements.sortOrder.addEventListener('change', (e) => {
      state.sortOrder = e.target.value;
      applyFiltersAndRender();
    });

    // Reset filtros
    elements.btnResetFilters.addEventListener('click', window.resetAllFilters);

    // Cambio de vistas
    elements.viewStack.addEventListener('click', () => {
      state.viewMode = 'stack';
      elements.viewStack.classList.add('active');
      elements.viewGrid.classList.remove('active');
      elements.viewTable.classList.remove('active');
      renderCurrentView();
    });

    elements.viewGrid.addEventListener('click', () => {
      state.viewMode = 'grid';
      elements.viewStack.classList.remove('active');
      elements.viewGrid.classList.add('active');
      elements.viewTable.classList.remove('active');
      renderCurrentView();
    });

    elements.viewTable.addEventListener('click', () => {
      state.viewMode = 'table';
      elements.viewStack.classList.remove('active');
      elements.viewGrid.classList.remove('active');
      elements.viewTable.classList.add('active');
      renderCurrentView();
    });

    // Delegación de eventos en contenedores de registros
    const handleRecordAction = (e) => {
      const targetBtn = e.target.closest('[data-action]');
      if (!targetBtn) return;

      const action = targetBtn.dataset.action;
      if (action === 'view-qr') {
        const id = targetBtn.dataset.id;
        openQrModal(id);
      } else if (action === 'delete') {
        const id = targetBtn.dataset.id;
        const name = targetBtn.dataset.name || 'este registro';
        deleteRecord(id, name);
      } else if (action === 'copy-code') {
        const code = targetBtn.dataset.code;
        copyToClipboard(code);
      }
    };

    elements.cardsContainer.addEventListener('click', handleRecordAction);
    elements.tableBody.addEventListener('click', handleRecordAction);

    // Modales: Abrir Nuevo Registro
    elements.btnAddModal.addEventListener('click', () => {
      elements.formAddAttendee.reset();
      elements.modalAdd.classList.add('is-open');
      elements.modalAdd.setAttribute('aria-hidden', 'false');
      document.getElementById('input-nombre').focus();
    });

    const closeAddModal = () => {
      elements.modalAdd.classList.remove('is-open');
      elements.modalAdd.setAttribute('aria-hidden', 'true');
    };

    elements.btnCloseModal.addEventListener('click', closeAddModal);
    elements.btnCancelModal.addEventListener('click', closeAddModal);

    // Cerrar Modal QR
    const closeQrModal = () => {
      elements.modalQr.classList.remove('is-open');
      elements.modalQr.setAttribute('aria-hidden', 'true');
      state.activeRecordForQr = null;
    };

    elements.btnCloseQrModal.addEventListener('click', closeQrModal);
    elements.btnDoneQrModal.addEventListener('click', closeQrModal);

    // Copiar código en modal QR
    elements.btnCopyCodeModal.addEventListener('click', () => {
      if (state.activeRecordForQr && state.activeRecordForQr.codigo) {
        copyToClipboard(state.activeRecordForQr.codigo);
      }
    });

    // Descargar pase digital en modal QR
    if (elements.btnDownloadPassModal) {
      elements.btnDownloadPassModal.addEventListener('click', () => {
        if (state.activeRecordForQr) {
          QREngine.downloadPass(state.activeRecordForQr);
          showToast('Credencial digital generada y descargada', 'success');
        }
      });
    }

    // MODAL ESCÁNER QR: Apertura y Cierre
    const openScannerModal = () => {
      window.clearScannerResult();
      elements.modalScanner.classList.add('is-open');
      elements.modalScanner.setAttribute('aria-hidden', 'false');
      startCameraScanner();
    };
    window.openScannerModal = openScannerModal;

    const closeScannerModal = () => {
      stopCameraScanner();
      elements.modalScanner.classList.remove('is-open');
      elements.modalScanner.setAttribute('aria-hidden', 'true');
    };
    window.closeScannerModal = closeScannerModal;
    window.validateScannedCode = validateScannedCode;

    elements.btnOpenScanner.addEventListener('click', openScannerModal);
    elements.btnCloseScannerModal.addEventListener('click', closeScannerModal);
    elements.btnDoneScannerModal.addEventListener('click', closeScannerModal);
    elements.btnClearScanResult.addEventListener('click', window.clearScannerResult);

    // Alternar cámara (frontal / trasera)
    elements.btnSwitchCamera.addEventListener('click', () => {
      scannerState.facingMode = scannerState.facingMode === 'environment' ? 'user' : 'environment';
      startCameraScanner();
    });

    // Cargar imagen de QR
    elements.btnUploadQr.addEventListener('click', () => {
      elements.scannerFileInput.click();
    });

    elements.scannerFileInput.addEventListener('change', (e) => {
      const file = e.target.files && e.target.files[0];
      if (file) {
        scanFromImageFile(file);
      }
      elements.scannerFileInput.value = '';
    });

    // Alternar sonido de alertas
    elements.btnToggleSound.addEventListener('click', () => {
      scannerState.soundEnabled = !scannerState.soundEnabled;
      elements.soundStatusLabel.textContent = `Audio: ${scannerState.soundEnabled ? 'ON' : 'OFF'}`;
      showToast(`Audio de escáner: ${scannerState.soundEnabled ? 'Activado' : 'Silenciado'}`);
    });

    // Validación manual de código
    elements.formManualCode.addEventListener('submit', (e) => {
      e.preventDefault();
      const code = elements.scannerManualInput.value.trim();
      if (code) {
        validateScannedCode(code);
      }
    });

    // Cerrar modales al hacer clic en el backdrop
    [elements.modalAdd, elements.modalQr, elements.modalScanner].forEach(backdrop => {
      if (!backdrop) return;
      backdrop.addEventListener('click', (e) => {
        if (e.target === backdrop) {
          closeAddModal();
          closeQrModal();
          closeScannerModal();
        }
      });
    });

    // Formulario de Agregar Asistente
    elements.formAddAttendee.addEventListener('submit', async (e) => {
      e.preventDefault();

      const nombre = document.getElementById('input-nombre').value.trim();
      const rol = document.getElementById('input-rol').value;
      const organizacion = document.getElementById('input-org').value.trim();
      const asistenciaRadio = document.querySelector('input[name="asistencia"]:checked');
      const asistencia = asistenciaRadio ? asistenciaRadio.value : 'si';

      if (!nombre) {
        showToast('El nombre es obligatorio', 'error');
        return;
      }

      elements.btnSubmitRecord.disabled = true;
      elements.btnSubmitRecord.textContent = 'Guardando...';

      try {
        const res = await authenticatedFetch('/api/registros', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            nombre,
            rol,
            asistencia,
            organizacion: organizacion || null,
            origen: 'dashboard_manual'
          })
        });

        const json = await res.json();
        if (!json.ok) {
          throw new Error(json.error || 'Error al guardar en Supabase');
        }

        showToast(`Registro guardado (${asistencia === 'si' ? 'Card Verde' : 'Card Negra/Roja'})`, 'success');
        closeAddModal();

        // Agregar al inicio del arreglo
        if (json.registro) {
          state.registros.unshift(json.registro);
          updateKpis();
          applyFiltersAndRender();
        } else {
          fetchRegistros();
        }
      } catch (err) {
        showToast(`Error: ${err.message}`, 'error');
      } finally {
        elements.btnSubmitRecord.disabled = false;
        elements.btnSubmitRecord.textContent = 'Guardar Registro';
      }
    });

    // EVENTOS DE SEGURIDAD & LOGIN GATE
    // Alternar visibilidad de contraseña
    if (elements.btnTogglePassword && elements.inputLoginPassword) {
      elements.btnTogglePassword.addEventListener('click', () => {
        const isPassword = elements.inputLoginPassword.type === 'password';
        elements.inputLoginPassword.type = isPassword ? 'text' : 'password';
        if (elements.eyeIcon) {
          elements.eyeIcon.innerHTML = isPassword
            ? '<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line>'
            : '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle>';
        }
      });
    }

    // Envío del formulario de Login Administrativo
    if (elements.formLogin) {
      elements.formLogin.addEventListener('submit', async (e) => {
        e.preventDefault();
        const password = elements.inputLoginPassword.value.trim();
        if (!password) return;

        elements.btnSubmitLogin.disabled = true;
        elements.btnSubmitLogin.innerHTML = '<span>Verificando...</span>';
        if (elements.loginErrorAlert) elements.loginErrorAlert.style.display = 'none';

        try {
          const res = await fetch('/api/auth', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ password })
          });

          const data = await res.json();
          if (!res.ok || !data.ok) {
            throw new Error(data.error || 'Contraseña incorrecta');
          }

          // Guardar token HMAC firmado en sessionStorage
          setSessionToken(data.token);
          if (elements.loginOverlay) elements.loginOverlay.classList.add('is-hidden');
          showToast('Credencial validada • Acceso autorizado', 'success');

          // Cargar datos reales protegidos
          fetchRegistros();
        } catch (err) {
          if (elements.loginErrorAlert) {
            elements.loginErrorAlert.style.display = 'flex';
            elements.loginErrorText.textContent = err.message || 'Contraseña incorrecta. Acceso denegado.';
          }
          elements.inputLoginPassword.focus();
          elements.inputLoginPassword.select();
        } finally {
          elements.btnSubmitLogin.disabled = false;
          elements.btnSubmitLogin.innerHTML = `
            <span>Desbloquear Terminal</span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 16px; height: 16px;">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          `;
        }
      });
    }

    // Botón de Cerrar Sesión (Logout)
    if (elements.btnLogout) {
      elements.btnLogout.addEventListener('click', () => {
        setSessionToken(null);
        showLoginOverlay('Sesión finalizada de manera segura.');
      });
    }

    // Tecla Escape para cerrar modales
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        closeAddModal();
        closeQrModal();
        closeScannerModal();
      }
    });
  }

  // Exponer copyToClipboard global para callbacks de templates
  window.copyToClipboard = copyToClipboard;

  // Inicio de la aplicación con validación de credenciales
  setupEventListeners();

  if (!getSessionToken()) {
    showLoginOverlay();
  } else {
    if (elements.loginOverlay) elements.loginOverlay.classList.add('is-hidden');
    fetchRegistros();
  }
})();
