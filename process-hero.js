// Genera el fondo atmosférico del hero: cocina grafito oscurecida + desenfoque
// suave (bokeh) para dar profundidad sin competir con el contenido del frente.
const sharp = require('sharp');
const path = require('path');
const RAW = path.join(__dirname, 'assets', 'raw');
const OUT = path.join(__dirname, 'assets', 'img');

function ambient(p) {
  // Muy oscurecida + desenfoque fuerte => textura ambiental abstracta (no compite)
  return p.modulate({ brightness: 0.34, saturation: 0.82 }).blur(14).linear(0.92, -4);
}

(async () => {
  const src = path.join(RAW, 'cocina3.png');
  await ambient(sharp(src).resize({ width: 1800, height: 1150, fit: 'cover', position: 'centre' }))
    .webp({ quality: 64 }).toFile(path.join(OUT, 'hero-bg.webp'));
  await ambient(sharp(src).resize({ width: 1800, height: 1150, fit: 'cover', position: 'centre' }))
    .jpeg({ quality: 72, mozjpeg: true }).toFile(path.join(OUT, 'hero-bg.jpg'));

  const fs = require('fs');
  ['hero-bg.webp', 'hero-bg.jpg'].forEach(f => {
    console.log(`${f}: ${(fs.statSync(path.join(OUT, f)).size / 1024).toFixed(0)} KB`);
  });
})().catch(e => { console.error(e); process.exit(1); });
