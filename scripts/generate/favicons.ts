import sharp from 'sharp';
import pngToIco from 'png-to-ico';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { log } from '../util/logger';

const PUBLIC_DIR = join(__dirname, '../..', 'website', 'public');

// The favicon SVG with the CL badge centered in a square
const svgSource = readFileSync(join(PUBLIC_DIR, 'favicon.svg'));

// Sizes to generate (YouTube-style: badge centered in square with padding)
const sizes = [
  { name: 'favicon-16x16.png', size: 16 },
  { name: 'favicon-32x32.png', size: 32 },
  { name: 'apple-touch-icon.png', size: 180 },
  { name: 'android-chrome-192x192.png', size: 192 },
  { name: 'android-chrome-512x512.png', size: 512 },
];

async function generate() {
  log.info('Generating favicon set from favicon.svg...');

  for (const { name, size } of sizes) {
    const outputPath = join(PUBLIC_DIR, name);
    await sharp(svgSource)
      .resize(size, size)
      .png()
      .toFile(outputPath);
    log.dim(`${name} (${size}x${size})`);
  }

  const png16 = readFileSync(join(PUBLIC_DIR, 'favicon-16x16.png'));
  const png32 = readFileSync(join(PUBLIC_DIR, 'favicon-32x32.png'));
  const ico = await pngToIco([png16, png32]);
  writeFileSync(join(PUBLIC_DIR, 'favicon.ico'), ico);
  log.dim('favicon.ico (16x16 + 32x32)');

  log.success('All favicon files written to website/public/');
}

generate().catch((err) => {
  log.error(`Favicon generation failed: ${err}`);
  process.exit(1);
});
