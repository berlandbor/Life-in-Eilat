// === Глобальные переменные ===
let originalImage = null;

// === Вспомогательные функции ===

// Конвертация HEX в RGB
function hexToRGB(hex) {
  const bigint = parseInt(hex.slice(1), 16);
  return {
    r: (bigint >> 16) & 255,
    g: (bigint >> 8) & 255,
    b: bigint & 255
  };
}

// Построение карты яркости для контуров
function buildGrayscale(src, width, height) {
  const gray = new Float32Array(width * height);
  for (let i = 0; i < src.length; i += 4) {
    gray[i / 4] = 0.3 * src[i] + 0.59 * src[i + 1] + 0.11 * src[i + 2];
  }
  return gray;
}

// Создание карты контуров (градиенты по яркости)
function detectEdges(gray, width, height, threshold, edgeColor, edgeAlpha) {
  const edgeData = new Uint8ClampedArray(width * height * 4);

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const i = y * width + x;
      const gx = gray[i + 1] - gray[i - 1];
      const gy = gray[i + width] - gray[i - width];
      const mag = Math.sqrt(gx * gx + gy * gy);
      const idx = i * 4;

      if (mag > threshold) {
        edgeData[idx] = edgeColor.r;
        edgeData[idx + 1] = edgeColor.g;
        edgeData[idx + 2] = edgeColor.b;
        edgeData[idx + 3] = edgeAlpha;
      } else {
        edgeData[idx + 3] = 0;
      }
    }
  }

  return new ImageData(edgeData, width, height);
}

// Применение коррекции цвета только к фону
function adjustBackgroundColor(src, backgroundHex, factor = 1.2, tolerance = 50) {
  const background = hexToRGB(backgroundHex);

  for (let i = 0; i < src.length; i += 4) {
    const dr = src[i] - background.r;
    const dg = src[i + 1] - background.g;
    const db = src[i + 2] - background.b;
    const dist = Math.sqrt(dr * dr + dg * dg + db * db);

    if (dist < tolerance) {
      src[i] = Math.min(255, background.r + (src[i] - background.r) * factor);
      src[i + 1] = Math.min(255, background.g + (src[i + 1] - background.g) * factor);
      src[i + 2] = Math.min(255, background.b + (src[i + 2] - background.b) * factor);
    }
  }
}

// Управление каналами: усиление/отключение
function adjustColorChannels(src, channels) {
  for (let i = 0; i < src.length; i += 4) {
    channels.forEach(ch => {
      if (!ch.enable.checked) {
        if (ch.channel === 'r') src[i] = 0;
        if (ch.channel === 'g') src[i + 1] = 0;
        if (ch.channel === 'b') src[i + 2] = 0;
      } else {
        const base = hexToRGB(ch.color.value);
        const strength = parseInt(ch.strength.value) / 100;
        if (ch.channel === 'r') src[i] = Math.min(255, base.r + (src[i] - base.r) * (1 + strength));
        if (ch.channel === 'g') src[i + 1] = Math.min(255, base.g + (src[i + 1] - base.g) * (1 + strength));
        if (ch.channel === 'b') src[i + 2] = Math.min(255, base.b + (src[i + 2] - base.b) * (1 + strength));
      }
    });
  }
}

// === Основная функция применения фильтра ===
function applyFilter() {
  if (!originalImage) return;

  const width = canvas.width;
  const height = canvas.height;
  const src = new Uint8ClampedArray(originalImage.data);

  const step = parseInt(poster.value);
  const alpha = parseInt(imageAlpha.value);

  // --- 1. Постеризация и насыщенность ---
  for (let i = 0; i < src.length; i += 4) {
    const avg = (src[i] + src[i + 1] + src[i + 2]) / 3;
    const s = parseFloat(saturation.value);

    src[i] = Math.floor((avg + (src[i] - avg) * s) / step) * step;
    src[i + 1] = Math.floor((avg + (src[i + 1] - avg) * s) / step) * step;
    src[i + 2] = Math.floor((avg + (src[i + 2] - avg) * s) / step) * step;
    src[i + 3] = alpha;
  }

  // --- 2. Фильтрация по цвету ---
  if (enableColorFilter.checked) {
    const target = hexToRGB(targetColor.value);
    const tolerance = parseInt(colorTolerance.value);
    const mode = [...colorModeRadios].find(r => r.checked)?.value;
    const repl = hexToRGB(replacementColor.value);

    for (let i = 0; i < src.length; i += 4) {
      const dr = src[i] - target.r;
      const dg = src[i + 1] - target.g;
      const db = src[i + 2] - target.b;
      const dist = Math.sqrt(dr * dr + dg * dg + db * db);

      if (dist > tolerance) {
        if (mode === 'bw') {
          const avg = (src[i] + src[i + 1] + src[i + 2]) / 3;
          src[i] = src[i + 1] = src[i + 2] = avg;
        } else if (mode === 'transparent') {
          src[i + 3] = 0;
        }
      } else if (mode === 'replace') {
        src[i] = repl.r;
        src[i + 1] = repl.g;
        src[i + 2] = repl.b;
      }
    }
  }

  // --- 3. Расширенная фильтрация по каналам ---
  if (enableChannelFilter.checked) {
    const type = channelType.value;
    const tolerance = parseInt(channelTolerance.value);
    const mode = [...channelModeRadios].find(r => r.checked)?.value;

    for (let i = 0; i < src.length; i += 4) {
      const r = src[i], g = src[i + 1], b = src[i + 2];
      let keep = false;

      if (type === 'red') keep = r - Math.max(g, b) > tolerance;
      else if (type === 'green') keep = g - Math.max(r, b) > tolerance;
      else if (type === 'blue') keep = b - Math.max(r, g) > tolerance;
      else if (type === 'yellow') keep = r > 180 && g > 180 && b < 130 && Math.abs(r - g) < 60;

      if (!keep) {
        if (mode === 'bw') {
          const avg = (r + g + b) / 3;
          src[i] = src[i + 1] = src[i + 2] = avg;
        } else {
          src[i + 3] = 0;
        }
      }
    }
  }

  // --- 4. Управление цветовыми каналами ---
  adjustColorChannels(src, [
    { enable: channelREnable, color: channelRColor, strength: channelRStrength, channel: 'r' },
    { enable: channelGEnable, color: channelGColor, strength: channelGStrength, channel: 'g' },
    { enable: channelBEnable, color: channelBColor, strength: channelBStrength, channel: 'b' }
  ]);

  // --- 5. Коррекция фона ---
  if (typeof backgroundColor !== 'undefined') {
    adjustBackgroundColor(src, backgroundColor.value, 1.2, 50);
  }

  // --- 6. Контуры ---
  if (showEdgesCheckbox.checked || onlyEdges.checked) {
    const gray = buildGrayscale(src, width, height);
    const edgeImg = detectEdges(
      gray,
      width,
      height,
      parseInt(edgeThreshold.value),
      hexToRGB(edgeColor.value),
      parseInt(edgeAlpha.value)
    );

    if (onlyEdges.checked) {
      ctx.fillStyle = bgColor.value;
      ctx.fillRect(0, 0, width, height);
    } else {
      ctx.putImageData(new ImageData(src, width, height), 0, 0);
    }

    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = width;
    tempCanvas.height = height;
    const tempCtx = tempCanvas.getContext('2d');
    tempCtx.putImageData(edgeImg, 0, 0);
    ctx.drawImage(tempCanvas, 0, 0);

    return;
  }

  // --- 7. Выводим картинку без контуров ---
  ctx.putImageData(new ImageData(src, width, height), 0, 0);
}