const sharp = require('sharp');
const path = require('path');

async function removeBackground() {
  try {
    const inputPath = path.join(__dirname, '../public/logo.png');
    const outputPath = path.join(__dirname, '../public/logo.png');
    
    const image = sharp(inputPath);
    const { data, info } = await image
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });

    // Порог для определения фона (светлый бежевый/белый)
    const threshold = 240;
    
    // Обрабатываем пиксели
    const pixels = new Uint8ClampedArray(data);
    for (let i = 0; i < pixels.length; i += 4) {
      const r = pixels[i];
      const g = pixels[i + 1];
      const b = pixels[i + 2];
      
      // Если пиксель светлый (фон), делаем его прозрачным
      if (r > threshold && g > threshold && b > threshold) {
        pixels[i + 3] = 0; // Устанавливаем альфа-канал в 0
      }
    }
    
    // Сохраняем результат
    await sharp(pixels, {
      raw: {
        width: info.width,
        height: info.height,
        channels: 4
      }
    })
    .png()
    .toFile(outputPath);
    
    console.log('✅ Фон удален успешно!');
    
    // Также обновляем favicon
    await sharp(outputPath)
      .resize(32, 32, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .toFile(path.join(__dirname, '../public/favicon.png'));
    
    console.log('✅ Favicon создан!');
  } catch (error) {
    console.error('❌ Ошибка:', error.message);
    process.exit(1);
  }
}

removeBackground();

