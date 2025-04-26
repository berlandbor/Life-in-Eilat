// === Основная функция подключения событий ===
function setupEventHandlers() {

  // === Загрузка изображения ===
  upload.addEventListener('change', handleUpload);

  // === Управление панелью (кнопка ☰) ===
  toggleSidebar.addEventListener('click', () => {
    sidebar.classList.toggle('hidden');
  });

  // === Сброс настроек ===
  resetBtn.addEventListener('click', () => window.location.reload());

  // === Скачать изображение ===
  downloadBtn.addEventListener('click', handleDownload);

  // === Отдельные переключатели ===
  showEdgesCheckbox.addEventListener('change', applyFilter);
  onlyEdges.addEventListener('change', () => {
    if (onlyEdges.checked) {
      showElement(bgPicker);
    } else {
      hideElement(bgPicker);
    }
    applyFilter();
  });

  enableColorFilter.addEventListener('change', () => {
    if (enableColorFilter.checked) {
      showElement(replacementColorContainer);
    } else {
      hideElement(replacementColorContainer);
    }
    applyFilter();
  });

  enableChannelFilter.addEventListener('change', applyFilter);
  colorChannelToggle.addEventListener('change', applyFilter);

  // === Радио-кнопки режима цветовой фильтрации ===
  colorModeRadios.forEach(radio => {
    radio.addEventListener('change', applyFilter);
  });

  // === Радио-кнопки режима фильтрации по каналам ===
  channelModeRadios.forEach(radio => {
    radio.addEventListener('change', applyFilter);
  });

  // === Любое изменение ползунков/цветов сразу применяет фильтр ===
  [
    poster, saturation, imageAlpha,
    edgeThreshold, edgeAlpha,
    targetColor, replacementColor, 
    channelType, channelTolerance,
    channelColor, zoomSlider,
    channelRColor, channelGColor, channelBColor,
    channelRStrength, channelGStrength, channelBStrength
  ].forEach(control => {
    control.addEventListener('input', applyFilter);
  });
}

// === Обработчик загрузки изображения ===
function handleUpload(e) {
  const file = e.target.files[0];
  if (!file) return;

  const img = new Image();
  img.onload = () => {
    canvas.width = img.width;
    canvas.height = img.height;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0);
    originalImage = ctx.getImageData(0, 0, canvas.width, canvas.height);
    applyFilter();
  };
  img.src = URL.createObjectURL(file);
}

// === Обработчик скачивания изображения ===
function handleDownload() {
  const link = document.createElement('a');
  link.download = 'filtered_image.png';
  link.href = canvas.toDataURL();
  link.click();
}