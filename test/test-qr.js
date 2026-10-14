/**
 * Generador nativo de código QR y pase digital en Vanilla JS (Model 2, Version 1-4)
 */

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

const QREngine = {
  encode(text) {
    const utf8 = typeof Buffer !== 'undefined'
      ? Buffer.from(text, 'utf8')
      : new TextEncoder().encode(text);

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
    pushBits(utf8.length, 8); // Character count
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

    // Separators
    for (let i = 0; i < 8; i++) {
      if (7 < N && i < N) matrix[7][i] = 0;
      if (i < N && 7 < N) matrix[i][7] = 0;
      if (7 < N && N - 8 + i < N) matrix[7][N - 8 + i] = 0;
      if (i < N && N - 8 < N) matrix[i][N - 8] = 0;
      if (N - 8 < N && i < N) matrix[N - 8][i] = 0;
      if (N - 8 + i < N && 7 < N) matrix[N - 8 + i][7] = 0;
    }

    // Timing
    for (let i = 8; i < N - 8; i++) {
      if (matrix[6][i] === -1) matrix[6][i] = (i % 2 === 0) ? 1 : 0;
      if (matrix[i][6] === -1) matrix[i][6] = (i % 2 === 0) ? 1 : 0;
    }

    // Alignment
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

    // Dark module
    matrix[4 * verObj.v + 9][8] = 1;

    // Reserve format bits
    for (let i = 0; i < 9; i++) {
      if (matrix[8][i] === -1) matrix[8][i] = 0;
      if (matrix[i][8] === -1) matrix[i][8] = 0;
    }
    for (let i = 0; i < 8; i++) {
      if (matrix[8][N - 1 - i] === -1) matrix[8][N - 1 - i] = 0;
      if (matrix[N - 1 - i][8] === -1) matrix[N - 1 - i][8] = 0;
    }

    // Data bits zig-zag
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

    // Format bits for Error Correction M (00) and Mask 0 (000)
    const formatBits = 0x5412; // (0b00000 << 10 | BCH) ^ 0x5412
    for (let i = 0; i <= 5; i++) matrix[8][i] = (formatBits >>> (14 - i)) & 1;
    matrix[8][7] = (formatBits >>> 8) & 1;
    matrix[8][8] = (formatBits >>> 7) & 1;
    matrix[7][8] = (formatBits >>> 6) & 1;
    for (let i = 0; i <= 5; i++) matrix[5 - i][8] = (formatBits >>> (5 - i)) & 1;
    for (let i = 0; i < 7; i++) matrix[N - 1 - i][8] = (formatBits >>> i) & 1;
    for (let i = 0; i < 8; i++) matrix[8][N - 8 + i] = (formatBits >>> (7 + i)) & 1;

    return matrix;
  },

  generateSVG(text, size = 170) {
    const matrix = this.encode(text);
    const N = matrix.length;
    let paths = '';
    for (let r = 0; r < N; r++) {
      for (let c = 0; c < N; c++) {
        if (matrix[r][c] === 1) {
          paths += `<rect x="${c}" y="${r}" width="1" height="1" fill="#040809"/>`;
        }
      }
    }
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${N} ${N}" width="${size}" height="${size}" shape-rendering="crispEdges" role="img" aria-label="Código QR de Acreditación"><rect width="${N}" height="${N}" fill="#ffffff"/>${paths}</svg>`;
  }
};

const svg = QREngine.generateSVG('RETOS-4891-SI', 170);
console.log('SVG Length:', svg.length);
console.log('Starts with SVG:', svg.startsWith('<svg'));
console.log('Includes rect:', svg.includes('<rect'));
