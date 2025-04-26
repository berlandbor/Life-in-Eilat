const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

const upload = document.getElementById('upload');
const poster = document.getElementById('poster');
const posterInput = document.getElementById('posterInput');
const saturation = document.getElementById('saturation');
const saturationInput = document.getElementById('saturationInput');
const imageAlpha = document.getElementById('imageAlpha');
const imageAlphaVal = document.getElementById('imageAlphaVal');
const edgeThreshold = document.getElementById('edgeThreshold');
const edgeInput = document.getElementById('edgeInput');
const edgeColor = document.getElementById('edgeColor');
const edgeAlpha = document.getElementById('edgeAlpha');
const alphaVal = document.getElementById('alphaVal');
const showEdgesCheckbox = document.getElementById('showEdges');
const onlyEdges = document.getElementById('onlyEdges');
const bgColor = document.getElementById('bgColor');
const bgPicker = document.getElementById('bgPicker');

const targetColor = document.getElementById('targetColor');
const colorTolerance = document.getElementById('colorTolerance');
const colorToleranceVal = document.getElementById('colorToleranceVal');
const replacementColor = document.getElementById('replacementColor');
const replacementColorContainer = document.getElementById('replacementColorContainer');
const colorModeRadios = document.querySelectorAll('input[name="colorMode"]');
const enableColorFilter = document.getElementById('enableColorFilter');

const enableChannelFilter = document.getElementById('enableChannelFilter');
const channelType = document.getElementById('channelType');
const channelTolerance = document.getElementById('channelTolerance');
const channelToleranceVal = document.getElementById('channelToleranceVal');
const channelModeRadios = document.querySelectorAll('input[name="channelMode"]');

const zoomSlider = document.getElementById('zoom');
const zoomVal = document.getElementById('zoomVal');
const resetBtn = document.getElementById('resetBtn');
const downloadBtn = document.getElementById('downloadBtn');

const colorChannelToggle = document.getElementById('colorChannelToggle');
const channelColor = document.getElementById('channelColor');

const disableColors = [1, 2, 3, 4].map(i => ({
  enable: document.getElementById(`disableColor${i}`),
  color: document.getElementById(`color${i}`),
  tolerance: document.getElementById(`tolerance${i}`),
  tolVal: document.getElementById(`toleranceVal${i}`)
}));

const channels = [1, 2, 3].map(i => ({
  enable: document.getElementById(`channel${i}_enable`),
  color: document.getElementById(`channel${i}_color`),
  strength: document.getElementById(`channel${i}_strength`)
}));

let originalImage = null;

// ==== Вспомогательные ====

function hexToRGB(hex) {
  const bigint = parseInt(hex.slice(1), 16);
  return {
    r: (bigint >> 16) & 255,
    g: (bigint >> 8) & 255,
    b: bigint & 255
  };
}

function syncSliders(slider, input) {
  slider.addEventListener('input', () => {
    input.value = slider.value;
    applyFilter();
  });
  input.addEventListener('input', () => {
    slider.value = input.value;
    applyFilter();
  });
}

// ==== Синхронизация ====

syncSliders(poster, posterInput);
syncSliders(saturation, saturationInput);
syncSliders(imageAlpha, imageAlphaVal);
syncSliders(edgeThreshold, edgeInput);
syncSliders(edgeAlpha, alphaVal);
syncSliders(colorTolerance, colorToleranceVal);
syncSliders(channelTolerance, channelToleranceVal);
syncSliders(zoomSlider, zoomVal);

disableColors.forEach(ch => {
  syncSliders(ch.tolerance, ch.tolVal);
  [ch.enable, ch.color].forEach(el => el.addEventListener('input', applyFilter));
});

channels.forEach(ch => {
  syncSliders(ch.strength, ch.strength);
  [ch.enable, ch.color].forEach(el => el.addEventListener('input', applyFilter));
});

[colorChannelToggle, channelColor].forEach(el =>
  el.addEventListener('input', applyFilter)
);

// ==== События ====

upload.addEventListener('change', e => {
  const file = e.target.files[0];
  if (!file) return;
  const img = new Image();
  img.onload = () => {
    canvas.width = img.width;
    canvas.height = img.height;
    ctx.drawImage(img, 0, 0);
    originalImage = ctx.getImageData(0, 0, canvas.width, canvas.height);
    applyFilter();
  };
  img.src = URL.createObjectURL(file);
});

resetBtn.addEventListener('click', () => window.location.reload());

downloadBtn.addEventListener('click', () => {
  const link = document.createElement('a');
  link.download = 'filtered_image.png';
  link.href = canvas.toDataURL();
  link.click();
});

onlyEdges.addEventListener('change', () => {
  bgPicker.style.display = onlyEdges.checked ? 'block' : 'none';
  applyFilter();
});

colorModeRadios.forEach(r => r.addEventListener('change', applyFilter));
channelModeRadios.forEach(r => r.addEventListener('change', applyFilter));

// ==== Основной фильтр ====

function applyFilter() {
  if (!originalImage) return;

  const width = canvas.width;
  const height = canvas.height;
  const src = new Uint8ClampedArray(originalImage.data);
  const step = parseInt(poster.value);
  const alpha = parseInt(imageAlpha.value);

  // Снижение насыщенности и постеризация
  for (let i = 0; i < src.length; i += 4) {
    const avg = (src[i] + src[i + 1] + src[i + 2]) / 3;
    const s = parseFloat(saturation.value);
    src[i] = Math.floor((avg + (src[i] - avg) * s) / step) * step;
    src[i + 1] = Math.floor((avg + (src[i + 1] - avg) * s) / step) * step;
    src[i + 2] = Math.floor((avg + (src[i + 2] - avg) * s) / step) * step;
    src[i + 3] = alpha;
  }

  // Цветовая фильтрация
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

  // Расширенная фильтрация по каналу
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

  // Отключение произвольных цветов
  disableColors.forEach(ch => {
    if (!ch.enable.checked) return;
    const c = hexToRGB(ch.color.value);
    const tol = parseInt(ch.tolerance.value);
    for (let i = 0; i < src.length; i += 4) {
      const dist = Math.sqrt(
        (src[i] - c.r) ** 2 +
        (src[i + 1] - c.g) ** 2 +
        (src[i + 2] - c.b) ** 2
      );
      if (dist < tol) {
        src[i] = src[i + 1] = src[i + 2] = 0;
      }
    }
  });

  // Тонкая настройка каналов
  channels.forEach(ch => {
    if (!ch.enable.checked) return;
    const base = hexToRGB(ch.color.value);
    const factor = 1 + parseInt(ch.strength.value) / 100;
    for (let i = 0; i < src.length; i += 4) {
      src[i] = Math.min(255, base.r + (src[i] - base.r) * factor);
      src[i + 1] = Math.min(255, base.g + (src[i + 1] - base.g) * factor);
      src[i + 2] = Math.min(255, base.b + (src[i + 2] - base.b) * factor);
    }
  });

  // Отключение канала по выбранному цвету
  if (colorChannelToggle.checked) {
    const c = hexToRGB(channelColor.value);
    if (c.r > 127) for (let i = 0; i < src.length; i += 4) src[i] = 0;
    if (c.g > 127) for (let i = 0; i < src.length; i += 4) src[i + 1] = 0;
    if (c.b > 127) for (let i = 0; i < src.length; i += 4) src[i + 2] = 0;
  }

  // Контуры
if (showEdgesCheckbox.checked || onlyEdges.checked) {
  const gray = new Float32Array(width * height);
  for (let i = 0; i < src.length; i += 4) {
    gray[i / 4] = 0.3 * src[i] + 0.59 * src[i + 1] + 0.11 * src[i + 2];
  }

  const thres = parseInt(edgeThreshold.value);
  const color = hexToRGB(edgeColor.value);
  const a = parseInt(edgeAlpha.value);

  const edgeData = new Uint8ClampedArray(src.length);

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const i = y * width + x;
      const gx = gray[i + 1] - gray[i - 1];
      const gy = gray[i + width] - gray[i - width];
      const mag = Math.sqrt(gx * gx + gy * gy);
      const idx = i * 4;
      if (mag > thres) {
        edgeData[idx] = color.r;
        edgeData[idx + 1] = color.g;
        edgeData[idx + 2] = color.b;
        edgeData[idx + 3] = a;
      } else {
        edgeData[idx + 3] = 0;
      }
    }
  }

  const edgeImg = new ImageData(edgeData, width, height);

  if (onlyEdges.checked) {
    ctx.fillStyle = bgColor.value;
    ctx.fillRect(0, 0, width, height);
  } else {
    ctx.putImageData(new ImageData(src, width, height), 0, 0); // сохраняем картинку
  }

  // создаём временный canvas и накладываем
  const tempCanvas = document.createElement('canvas');
  tempCanvas.width = width;
  tempCanvas.height = height;
  const tempCtx = tempCanvas.getContext('2d');
  tempCtx.putImageData(edgeImg, 0, 0);
  ctx.drawImage(tempCanvas, 0, 0);
  
  return;
}

  ctx.putImageData(new ImageData(src, width, height), 0, 0);
}