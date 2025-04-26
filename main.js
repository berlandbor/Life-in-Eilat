// === Запуск после загрузки страницы ===
window.addEventListener('DOMContentLoaded', () => {

  // Синхронизация ползунков и числовых полей
  syncSliders(poster, posterInput);
  syncSliders(saturation, saturationInput);
  syncSliders(imageAlpha, imageAlphaVal);
  syncSliders(edgeThreshold, edgeInput);
  syncSliders(edgeAlpha, alphaVal);
  syncSliders(colorTolerance, colorToleranceVal);
  syncSliders(channelTolerance, channelToleranceVal);
  syncSliders(zoomSlider, zoomVal);

  // Синхронизация новых управляющих каналов
  syncSliders(channelRStrength, channelRStrength);
  syncSliders(channelGStrength, channelGStrength);
  syncSliders(channelBStrength, channelBStrength);

  // Назначение обработчиков событий
  setupEventHandlers();

  // Отключение фильтров по умолчанию
  enableColorFilter.checked = false;
  enableChannelFilter.checked = false;
  colorChannelToggle.checked = false;

  // Скрыть контейнер для выбора цвета замены при старте
  replacementColorContainer.style.display = 'none';

  // Применить стартовый фильтр
  applyFilter();
});