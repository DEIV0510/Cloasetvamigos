// Quita el fondo negro del logo (lo hace transparente) y genera PNG + WebP
// optimizados para usar sobre placas oscuras (preloader, footer).
const sharp = require('sharp');
const path = require('path');

const SRC = 'C:\\Users\\Lenovo\\Desktop\\closet\\logo.png';
const OUT = path.join(__dirname, 'assets', 'img');

(async () => {
  const { data, info } = await sharp(SRC).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const ch = info.channels;
  for (let i = 0; i < data.length; i += ch) {
    const m = Math.max(data[i], data[i + 1], data[i + 2]);
    if (m < 36) data[i + 3] = 0;                                   // negro puro -> transparente
    else if (m < 74) data[i + 3] = Math.round(((m - 36) / 38) * 255); // borde suave
  }
  const transparent = await sharp(data, { raw: { width: info.width, height: info.height, channels: ch } }).png().toBuffer();

  // recorta el borde transparente sobrante
  let trimmed;
  try { trimmed = await sharp(transparent).trim({ threshold: 12 }).toBuffer(); }
  catch { trimmed = transparent; }

  await sharp(trimmed).resize({ width: 560, withoutEnlargement: true }).png({ compressionLevel: 9 })
    .toFile(path.join(OUT, 'logo.png'));
  await sharp(trimmed).resize({ width: 560, withoutEnlargement: true }).webp({ quality: 92 })
    .toFile(path.join(OUT, 'logo.webp'));

  const fs = require('fs');
  console.log('Original:', info.width + 'x' + info.height);
  ['logo.png', 'logo.webp'].forEach(f => console.log(`${f}: ${(fs.statSync(path.join(OUT, f)).size / 1024).toFixed(0)} KB`));
})().catch(e => { console.error(e); process.exit(1); });
