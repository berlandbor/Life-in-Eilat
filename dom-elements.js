// === Канвас и контекст ===
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

// === Боковая панель и управление ===
const upload = document.getElementById('upload');
const resetBtn = document.getElementById('resetBtn');
const downloadBtn = document.getElementById('downloadBtn');
const toggleSidebar = document.getElementById('toggleSidebar');
const sidebar = document.getElementById('sidebar');

// === Параметры изображения ===
const poster = document.getElementById('poster');
const posterInput = document.getElementById('posterInput');
const saturation = document.getElementById('saturation');
const saturationInput = document.getElementById('saturationInput');
const imageAlpha = document.getElementById('imageAlpha');
const imageAlphaVal = document.getElementById('imageAlphaVal');

// === Контуры ===
const edgeThreshold = document.getElementById('edgeThreshold');
const edgeInput = document.getElementById('edgeInput');
const edgeColor = document.getElementById('edgeColor');
const edgeAlpha = document.getElementById('edgeAlpha');
const alphaVal = document.getElementById('alphaVal');
const showEdgesCheckbox = document.getElementById('showEdges');
const onlyEdges = document.getElementById('onlyEdges');
const bgColor = document.getElementById('bgColor');
const bgPicker = document.getElementById('bgPicker');

// === Фильтрация по цвету ===
const targetColor = document.getElementById('targetColor');
const colorTolerance = document.getElementById('colorTolerance');
const colorToleranceVal = document.getElementById('colorToleranceVal');
const colorModeRadios = document.querySelectorAll('input[name="colorMode"]');
const replacementColorContainer = document.getElementById('replacementColorContainer');
const replacementColor = document.getElementById('replacementColor');
const enableColorFilter = document.getElementById('enableColorFilter');

// === Расширенная фильтрация по каналам ===
const enableChannelFilter = document.getElementById('enableChannelFilter');
const channelType = document.getElementById('channelType');
const channelTolerance = document.getElementById('channelTolerance');
const channelToleranceVal = document.getElementById('channelToleranceVal');
const channelModeRadios = document.querySelectorAll('input[name="channelMode"]');

// === Управление цветовыми каналами (новая система) ===
const channelREnable = document.getElementById('channelREnable');
const channelRColor = document.getElementById('channelRColor');
const channelRStrength = document.getElementById('channelRStrength');

const channelGEnable = document.getElementById('channelGEnable');
const channelGColor = document.getElementById('channelGColor');
const channelGStrength = document.getElementById('channelGStrength');

const channelBEnable = document.getElementById('channelBEnable');
const channelBColor = document.getElementById('channelBColor');
const channelBStrength = document.getElementById('channelBStrength');

// === Отключение каналов по цвету ===
const colorChannelToggle = document.getElementById('colorChannelToggle');
const channelColor = document.getElementById('channelColor');

// === Масштабирование ===
const zoomSlider = document.getElementById('zoom');
const zoomVal = document.getElementById('zoomVal');

// === Боковая панель и кнопка ===
