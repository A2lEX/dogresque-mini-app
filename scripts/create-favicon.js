const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

async function createFavicon() {
  try {
    const svgPath = path.join(__dirname, '../public/logo.svg');
    const outputDir = path.join(__dirname, '../public');
    
    // Размеры для разных устройств
    const sizes = [
      { size: 16, name: 'favicon-16x16.png' },
      { size: 32, name: 'favicon-32x32.png' },
      { size: 48, name: 'favicon-48x48.png' },
      { size: 180, name: 'apple-touch-icon.png' },
      { size: 192, name: 'android-chrome-192x192.png' },
      { size: 512, name: 'android-chrome-512x512.png' },
    ];
    
    console.log('🔄 Создание favicon из SVG...');
    
    for (const { size, name } of sizes) {
      await sharp(svgPath)
        .resize(size, size, {
          fit: 'contain',
          background: { r: 0, g: 0, b: 0, alpha: 0 }
        })
        .png()
        .toFile(path.join(outputDir, name));
      
      console.log(`✅ Создан ${name} (${size}x${size})`);
    }
    
    // Основной favicon
    await sharp(svgPath)
      .resize(32, 32, {
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      })
      .png()
      .toFile(path.join(outputDir, 'favicon.png'));
    
    console.log('✅ Создан favicon.png');
    console.log('✅ Все favicon файлы созданы успешно!');
    
  } catch (error) {
    console.error('❌ Ошибка:', error.message);
    process.exit(1);
  }
}

createFavicon();

