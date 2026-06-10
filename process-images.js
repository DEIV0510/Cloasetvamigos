/**
 * Procesamiento y optimización de imágenes para Clóset Los Amigos.
 * Realza fotos de proyectos reales (contraste, saturación, nitidez, iluminación)
 * sin distorsionar, y genera versiones WebP + JPG responsive (full / sm) + crops wide.
 */
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const RAW = path.join(__dirname, 'assets', 'raw');
const OUT = path.join(__dirname, 'assets', 'img');
fs.mkdirSync(OUT, { recursive: true });

// Mapa: archivo crudo -> nombre de salida normalizado (sin espacios/acentos)
const MAP = [
  ['closet1.png', 'closet1'],
  ['closet2.png', 'closet2'],
  ['closet3.png', 'closet3'],
  ['cocina1.png', 'cocina1'],
  ['cocina2.png', 'cocina2'],
  ['cocina3.png', 'cocina3'],
  ['mueble baño 1.png', 'bano1'],
  ['mueble baño2.png', 'bano2'],
  ['mueble baño 3.png', 'bano3'],
  ['puertas1.png', 'puertas1'],
  ['puertas2.png', 'puertas2'],
  ['puertas3.png', 'puertas3'],
];

// Realce premium consistente para fotos de celular apagadas (sin distorsión).
function enhance(pipe) {
  return pipe
    .modulate({ brightness: 1.05, saturation: 1.12 }) // ilumina + enriquece color
    .linear(1.07, -9)                                  // contraste suave en torno al gris medio
    .sharpen({ sigma: 1.0 });                          // nitidez perceptual
}

async function run() {
  const manifest = [];
  for (const [src, name] of MAP) {
    const input = path.join(RAW, src);
    const meta = await sharp(input).metadata();

    // FULL (1500px lado mayor) -> webp + jpg
    await enhance(sharp(input).resize({ width: 1500, height: 1500, fit: 'inside', withoutEnlargement: true }))
      .webp({ quality: 82 }).toFile(path.join(OUT, `${name}.webp`));
    await enhance(sharp(input).resize({ width: 1500, height: 1500, fit: 'inside', withoutEnlargement: true }))
      .jpeg({ quality: 86, mozjpeg: true }).toFile(path.join(OUT, `${name}.jpg`));

    // SM (820px) -> webp para móvil/thumbnails (srcset)
    await enhance(sharp(input).resize({ width: 820, height: 820, fit: 'inside', withoutEnlargement: true }))
      .webp({ quality: 74 }).toFile(path.join(OUT, `${name}-sm.webp`));

    manifest.push({ name, w: meta.width, h: meta.height, ratio: (meta.width / meta.height).toFixed(2) });
  }

  // Crop wide cinematográfico (16:7) de la cocina grafito para banda CTA con parallax.
  await enhance(sharp(path.join(RAW, 'cocina3.png')).resize({ width: 1920, height: 840, fit: 'cover', position: 'centre' }))
    .webp({ quality: 80 }).toFile(path.join(OUT, 'cta-wide.webp'));
  await enhance(sharp(path.join(RAW, 'cocina3.png')).resize({ width: 1920, height: 840, fit: 'cover', position: 'centre' }))
    .jpeg({ quality: 84, mozjpeg: true }).toFile(path.join(OUT, 'cta-wide.jpg'));

  // Crop wide de la cocina en L (madera) para banda secundaria.
  await enhance(sharp(path.join(RAW, 'cocina2.png')).resize({ width: 1920, height: 900, fit: 'cover', position: 'centre' }))
    .webp({ quality: 80 }).toFile(path.join(OUT, 'band-wide.webp'));

  console.log('Dimensiones originales:');
  manifest.forEach(m => console.log(`  ${m.name}: ${m.w}x${m.h} (ratio ${m.ratio})`));

  // Reporte de tamaños finales
  const files = fs.readdirSync(OUT).filter(f => /\.(webp|jpg)$/.test(f));
  let total = 0;
  console.log('\nArchivos generados:');
  files.sort().forEach(f => {
    const kb = fs.statSync(path.join(OUT, f)).size / 1024;
    total += kb;
    console.log(`  ${f}: ${kb.toFixed(0)} KB`);
  });
  console.log(`\nTOTAL: ${(total / 1024).toFixed(2)} MB en ${files.length} archivos`);
}

run().catch(e => { console.error(e); process.exit(1); });
