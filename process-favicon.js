// Genera favicons a partir del monograma real del logo (logo-mark.png)
// centrado sobre un cuadrado oscuro de marca.
const sharp = require('sharp');
const path = require('path');
const OUT = path.join(__dirname, 'assets', 'img');
const MARK = path.join(OUT, 'logo-mark.png');

(async () => {
  const make = async (size) => {
    const pad = Math.round(size * 0.13);
    const inner = size - 2 * pad;
    const mono = await sharp(MARK)
      .resize({ width: inner, height: inner, fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png().toBuffer();
    return sharp({ create: { width: size, height: size, channels: 4, background: { r: 20, g: 15, b: 8, alpha: 1 } } })
      .composite([{ input: mono, gravity: 'center' }]).png();
  };
  for (const s of [16, 32, 180, 512]) {
    await (await make(s)).toFile(path.join(OUT, `favicon-${s}.png`));
  }
  console.log('favicons generados: 16, 32, 180, 512');
})().catch(e => { console.error(e); process.exit(1); });
