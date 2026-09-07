import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

function createPNG(width, height, drawFn) {
  // RGBA buffer
  const buffer = Buffer.alloc(width * height * 4);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      const [r, g, b, a] = drawFn(x, y, width, height);
      buffer[idx] = r;
      buffer[idx + 1] = g;
      buffer[idx + 2] = b;
      buffer[idx + 3] = a;
    }
  }

  // PNG chunks
  // Header: 137 80 78 71 13 10 26 10
  const header = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR chunk: width (4), height (4), bit depth (1), color type (6=RGBA), comp (0), filter (0), interlace (0)
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // 8 bit
  ihdrData[9] = 6; // RGBA
  ihdrData[10] = 0;
  ihdrData[11] = 0;
  ihdrData[12] = 0;
  const ihdr = makeChunk('IHDR', ihdrData);

  // Raw image scanlines with filter byte 0 (None)
  const scanlines = Buffer.alloc(height * (width * 4 + 1));
  for (let y = 0; y < height; y++) {
    const scanlineOffset = y * (width * 4 + 1);
    scanlines[scanlineOffset] = 0; // Filter byte: 0
    buffer.copy(scanlines, scanlineOffset + 1, y * width * 4, (y + 1) * width * 4);
  }

  const compressed = zlib.deflateSync(scanlines);
  const idat = makeChunk('IDAT', compressed);

  const iend = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([header, ihdr, idat, iend]);
}

function crc32(buf) {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc ^= buf[i];
    for (let j = 0; j < 8; j++) {
      crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function makeChunk(type, data) {
  const len = data.length;
  const chunk = Buffer.alloc(4 + 4 + len + 4);
  chunk.writeUInt32BE(len, 0);
  chunk.write(type, 4);
  data.copy(chunk, 8);
  const crcTarget = Buffer.concat([Buffer.from(type), data]);
  chunk.writeUInt32BE(crc32(crcTarget), 8 + len);
  return chunk;
}

// Draw GymGPT Logo
// Dark background #080808 with rounded corners and neon lime #E2FF31 dumbbell + G monogram
function gymLogo(x, y, w, h, isMaskable = false) {
  const cx = w / 2;
  const cy = h / 2;
  const scale = w / 192;

  // Background color: #080808
  let bgR = 8, bgG = 8, bgB = 8;
  
  const cornerR = isMaskable ? 0 : 36 * scale;
  // Rounded squircle check if not maskable
  if (!isMaskable) {
    const dx = Math.max(Math.abs(x - cx) - (cx - cornerR), 0);
    const dy = Math.max(Math.abs(y - cy) - (cy - cornerR), 0);
    if (dx * dx + dy * dy > cornerR * cornerR) {
      return [0, 0, 0, 0]; // Transparent outside squircle
    }
  }

  // Neon Lime: #E2FF31 (226, 255, 49)
  const neonR = 226, neonG = 255, neonB = 49;

  // Draw inner glow ring or dumbbell emblem
  const distFromCenter = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);
  const outerRingR = 64 * scale;
  const innerRingR = 52 * scale;

  // Outer circular border accent
  if (distFromCenter >= innerRingR && distFromCenter <= outerRingR) {
    // Top-right and bottom-left opening for dynamic look
    const angle = Math.atan2(y - cy, x - cx);
    if (!(angle > -0.8 && angle < 0.2)) {
      return [neonR, neonG, neonB, 255];
    }
  }

  // Central Bar of Dumbbell / 'G' crossbar
  const barHalfW = 28 * scale;
  const barHalfH = 7 * scale;
  if (Math.abs(x - cx) <= barHalfW && Math.abs(y - cy) <= barHalfH) {
    return [neonR, neonG, neonB, 255];
  }

  // Left Weight Plate
  const plateW = 9 * scale;
  const plateH = 26 * scale;
  const plateX = cx - 28 * scale;
  if (Math.abs(x - plateX) <= plateW / 2 && Math.abs(y - cy) <= plateH / 2) {
    return [neonR, neonG, neonB, 255];
  }

  // Right Weight Plate
  const plateRightX = cx + 28 * scale;
  if (Math.abs(x - plateRightX) <= plateW / 2 && Math.abs(y - cy) <= plateH / 2) {
    return [neonR, neonG, neonB, 255];
  }

  // Mini outer weights
  const smallPlateW = 5 * scale;
  const smallPlateH = 18 * scale;
  if (Math.abs(x - (plateX - 6 * scale)) <= smallPlateW / 2 && Math.abs(y - cy) <= smallPlateH / 2) {
    return [neonR, neonG, neonB, 255];
  }
  if (Math.abs(x - (plateRightX + 6 * scale)) <= smallPlateW / 2 && Math.abs(y - cy) <= smallPlateH / 2) {
    return [neonR, neonG, neonB, 255];
  }

  // Lightning bolt / energy core in the center
  const boltY = cy - 22 * scale;
  if (Math.abs(y - boltY) <= 8 * scale && Math.abs(x - cx) <= 6 * scale) {
    return [neonR, neonG, neonB, 255];
  }

  return [bgR, bgG, bgB, 255];
}

const publicDir = path.resolve('public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

console.log('Generating 192x192 PNG...');
const png192 = createPNG(192, 192, (x, y, w, h) => gymLogo(x, y, w, h, false));
fs.writeFileSync(path.join(publicDir, 'pwa-192x192.png'), png192);

console.log('Generating 512x512 PNG...');
const png512 = createPNG(512, 512, (x, y, w, h) => gymLogo(x, y, w, h, false));
fs.writeFileSync(path.join(publicDir, 'pwa-512x512.png'), png512);

console.log('Generating 512x512 Maskable PNG...');
const pngMaskable = createPNG(512, 512, (x, y, w, h) => gymLogo(x, y, w, h, true));
fs.writeFileSync(path.join(publicDir, 'pwa-maskable-512x512.png'), pngMaskable);

console.log('Generating Apple Touch Icon (180x180)...');
const appleIcon = createPNG(180, 180, (x, y, w, h) => gymLogo(x, y, w, h, false));
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), appleIcon);

console.log('Icons successfully created in /public');
