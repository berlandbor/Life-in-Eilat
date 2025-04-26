// === Вспомогательные функции ===

// Синхронизация ползунка и числового поля
function syncSliders(slider, input) {
  // Когда ползунок меняется — меняем значение в поле ввода
  slider.addEventListener('input', () => {
    input.value = slider.value;
    applyFilter(); // Перерисовываем изображение после изменения
  });

  // Когда поле ввода меняется — меняем значение ползунка
  input.addEventListener('input', () => {
    slider.value = input.value;
    applyFilter(); // Перерисовываем изображение после изменения
  });
}

// Показать элемент
function showElement(el) {
  el.style.display = '';
}

// Скрыть элемент
function hideElement(el) {
  el.style.display = 'none';
}

// Переключение элемента
function toggleElement(el) {
  if (el.style.display === 'none' || getComputedStyle(el).display === 'none') {
    showElement(el);
  } else {
    hideElement(el);
  }
}

// Ограничить значение в пределах min-max
function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}