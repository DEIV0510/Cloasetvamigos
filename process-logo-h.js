// Logo HORIZONTAL para el header sobre fondo claro:
// 1) quita el fondo negro (transparente)
// 2) recolorea el texto BLANCO/gris claro a tinta oscura (para que se lea sobre beige)
//    conservando el dorado intacto.
const sharp = require('sharp');
const path = require('path');

const SRC = 'C:\\Users\\Lenovo\\Desktop\\closet\\logohorizontal.png';
const OUT = path.join(__dirname, 'assets', 'img');

(async () => {
  const { data, info } = await sharp(SRC).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const ch = info.channels;
  for (let i = 0; i < data.length; i += ch) {
    const r = data[i], g = data[i + 1], b = data[i + 2];
    const maxc = Math.max(r, g, b), minc = Math.min(r, g, b), sat = maxc - minc;
    if (maxc < 34) { data[i + 3] = 0; continue; }              // fondo negro -> transparente
    if (maxc < 70) { data[i + 3] = Math.round(((maxc - 34) / 36) * 255); } // borde suave
    if (minc > 115 && sat < 46) {                              // blanco / gris claro -> tinta
      data[i] = 28; data[i + 1] = 22; data[i + 2] = 16;
    }
  }
  const buf = await sharp(data, { raw: { width: info.width, height: info.height, channels: ch } }).png().toBuffer();
  let trimmed; try { trimmed = await sharp(buf).trim({ threshold: 12 }).toBuffer(); } catch { trimmed = buf; }
  await sharp(trimmed).resize({ width: 640, withoutEnlargement: true }).png({ compressionLevel: 9 }).toFile(path.join(OUT, 'logo-h.png'));
  await sharp(trimmed).resize({ width: 640, withoutEnlargement: true }).webp({ quality: 92 }).toFile(path.join(OUT, 'logo-h.webp'));

  const fs = require('fs');
  console.log('Original:', info.width + 'x' + info.height);
  ['logo-h.png', 'logo-h.webp'].forEach(f => console.log(`${f}: ${(fs.statSync(path.join(OUT, f)).size / 1024).toFixed(0)} KB`));
})().catch(e => { console.error(e); process.exit(1); });
