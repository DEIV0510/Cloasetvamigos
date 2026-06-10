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

  // Monograma (recorte superior: CL + gráfico del clóset) para el header.
  // Se recorta del archivo ORIGINAL y se le aplica la transparencia al recorte.
  const W = info.width, H = info.height;
  const MARK = {
    left: Math.round(W * 0.19), top: Math.round(H * 0.10),
    width: Math.round(W * 0.62), height: Math.round(H * 0.48)
  };
  const crop = await sharp(SRC).extract(MARK).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const cd = crop.data, cch = crop.info.channels;
  for (let i = 0; i < cd.length; i += cch) {
    const m = Math.max(cd[i], cd[i + 1], cd[i + 2]);
    if (m < 36) cd[i + 3] = 0;
    else if (m < 74) cd[i + 3] = Math.round(((m - 36) / 38) * 255);
  }
  const markBuf = await sharp(cd, { raw: { width: crop.info.width, height: crop.info.height, channels: cch } }).png().toBuffer();
  for (const [ext, opts] of [['png', { compressionLevel: 9 }], ['webp', { quality: 92 }]]) {
    await sharp(markBuf).trim({ threshold: 12 }).resize({ width: 220, withoutEnlargement: true })[ext](opts)
      .toFile(path.join(OUT, `logo-mark.${ext}`));
  }

  const fs = require('fs');
  console.log('Original:', info.width + 'x' + info.height);
  ['logo.png', 'logo.webp'].forEach(f => console.log(`${f}: ${(fs.statSync(path.join(OUT, f)).size / 1024).toFixed(0)} KB`));
})().catch(e => { console.error(e); process.exit(1); });
