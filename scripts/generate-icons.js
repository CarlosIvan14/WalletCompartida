const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const inputSvg = path.join(__dirname, '../public/icons/icon.svg');
const appleSvg = path.join(__dirname, '../public/icons/apple-touch-icon.svg');
const faviconSvg = path.join(__dirname, '../public/icons/favicon.svg');
const outputDir = path.join(__dirname, '../public/icons');

async function generateIcons() {
  console.log('Generando iconos PWA...');
  
  for (const size of sizes) {
    const outputPath = path.join(outputDir, `${size}.png`);
    await sharp(inputSvg)
      .resize(size, size)
      .png()
      .toFile(outputPath);
    console.log(`✓ ${size}x${size}.png`);
  }

  // Apple touch icon (180x180)
  await sharp(appleSvg)
    .resize(180, 180)
    .png()
    .toFile(path.join(outputDir, 'apple-touch-icon.png'));
  console.log('✓ apple-touch-icon.png');

  // Favicon (32x32)
  await sharp(faviconSvg)
    .resize(32, 32)
    .png()
    .toFile(path.join(outputDir, 'favicon-32.png'));
  console.log('✓ favicon-32.png');

  // Favicon 16x16
  await sharp(faviconSvg)
    .resize(16, 16)
    .png()
    .toFile(path.join(outputDir, 'favicon-16.png'));
  console.log('✓ favicon-16.png');

  // Safari pinned tab (mask icon)
  await sharp(faviconSvg)
    .resize(32, 32)
    .png()
    .toFile(path.join(outputDir, 'safari-pinned-tab.png'));
  console.log('✓ safari-pinned-tab.png');

  console.log('\n✅ Todos los iconos generados en public/icons/');
}

generateIcons().catch(console.error);