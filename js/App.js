/**
 * App - 主控制器
 * 整合所有功能模块，适配现有HTML结构
 */
const App = (function() {
    'use strict';

    let state = {
        currentPalette: [],
        baseColor: '#FF6B6B',
        harmonyMode: 'analogous',
        colorCount: 5
    };

    let isInitialized = false;
    let wheelImageData = null;
    let isWheelDragging = false;
    let wheelCanvas, wheelCtx;
    let wheelCenterX, wheelCenterY, wheelRadius;

    /**
     * 初始化应用
     */
    function init() {
        if (isInitialized) return;

        console.log('[App] Initializing...');

        try {
            if (typeof StorageService !== 'undefined') {
                StorageService.init();
            }

            initColorWheel();
            bindAllEvents();
            loadPreferences();
            generateInitialPalette();
            loadHistory();

            isInitialized = true;
            console.log('[App] Initialized successfully!');

        } catch (e) {
            console.error('[App] Initialization failed:', e);
        }
    }

    // ========== 色轮相关 ==========

    function initColorWheel() {
        wheelCanvas = document.getElementById('colorWheel');
        if (!wheelCanvas) {
            console.error('[App] Color wheel canvas not found');
            return;
        }

        wheelCtx = wheelCanvas.getContext('2d');
        wheelCenterX = wheelCanvas.width / 2;
        wheelCenterY = wheelCanvas.height / 2;
        wheelRadius = Math.min(wheelCenterX, wheelCenterY) - 10;

        drawColorWheel();
        bindWheelEvents();
        updateWheelIndicator(0, 100);
    }

    function drawColorWheel() {
        for (let angle = 0; angle < 360; angle++) {
            const startAngle = (angle - 0.5) * Math.PI / 180;
            const endAngle = (angle + 0.5) * Math.PI / 180;

            wheelCtx.beginPath();
            wheelCtx.moveTo(wheelCenterX, wheelCenterY);
            wheelCtx.arc(wheelCenterX, wheelCenterY, wheelRadius, startAngle, endAngle);
            wheelCtx.closePath();
            wheelCtx.fillStyle = `hsl(${angle}, 100%, 50%)`;
            wheelCtx.fill();
        }

        const gradient = wheelCtx.createRadialGradient(
            wheelCenterX, wheelCenterY, 0,
            wheelCenterX, wheelCenterY, wheelRadius
        );
        gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
        gradient.addColorStop(0.7, 'rgba(255, 255, 255, 0.3)');
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

        wheelCtx.fillStyle = gradient;
        wheelCtx.beginPath();
        wheelCtx.arc(wheelCenterX, wheelCenterY, wheelRadius, 0, 2 * Math.PI);
        wheelCtx.fill();

        wheelImageData = wheelCtx.getImageData(0, 0, wheelCanvas.width, wheelCanvas.height);

        wheelCtx.beginPath();
        wheelCtx.arc(wheelCenterX, wheelCenterY, wheelRadius, 0, 2 * Math.PI);
        wheelCtx.strokeStyle = 'rgba(0,0,0,0.1)';
        wheelCtx.lineWidth = 2;
        wheelCtx.stroke();
    }

    function updateWheelIndicator(hue, sat) {
        if (wheelImageData) {
            wheelCtx.putImageData(wheelImageData, 0, 0);
        }

        const angle = hue * Math.PI / 180;
        const indicatorRadius = wheelRadius * (sat / 100);
        const indicatorX = wheelCenterX + indicatorRadius * Math.cos(angle);
        const indicatorY = wheelCenterY + indicatorRadius * Math.sin(angle);

        wheelCtx.shadowColor = 'rgba(0, 0, 0, 0.3)';
        wheelCtx.shadowBlur = 8;
        wheelCtx.shadowOffsetY = 2;

        wheelCtx.beginPath();
        wheelCtx.arc(indicatorX, indicatorY, 12, 0, 2 * Math.PI);
        wheelCtx.fillStyle = 'white';
        wheelCtx.fill();
        wheelCtx.strokeStyle = '#374151';
        wheelCtx.lineWidth = 2;
        wheelCtx.stroke();

        wheelCtx.beginPath();
        wheelCtx.arc(indicatorX, indicatorY, 8, 0, 2 * Math.PI);
        wheelCtx.fillStyle = `hsl(${hue}, ${sat}%, 50%)`;
        wheelCtx.fill();

        wheelCtx.shadowColor = 'transparent';
        wheelCtx.shadowBlur = 0;
        wheelCtx.shadowOffsetY = 0;
    }

    function bindWheelEvents() {
        wheelCanvas.addEventListener('mousedown', handleWheelMouseDown);
        document.addEventListener('mousemove', handleWheelMouseMove);
        document.addEventListener('mouseup', handleWheelMouseUp);

        wheelCanvas.addEventListener('touchstart', handleWheelTouchStart, { passive: false });
        document.addEventListener('touchmove', handleWheelTouchMove, { passive: false });
        document.addEventListener('touchend', handleWheelTouchEnd);
    }

    function getWheelPosition(e) {
        const rect = wheelCanvas.getBoundingClientRect();
        const scaleX = wheelCanvas.width / rect.width;
        const scaleY = wheelCanvas.height / rect.height;

        const x = (e.clientX - rect.left) * scaleX - wheelCenterX;
        const y = (e.clientY - rect.top) * scaleY - wheelCenterY;
        const distance = Math.sqrt(x * x + y * y);
        const angle = Math.atan2(y, x);
        const hue = (angle * 180 / Math.PI + 360) % 360;
        const sat = Math.min(100, Math.max(0, (distance / wheelRadius) * 100));

        return {
            hue: Math.round(hue),
            sat: Math.round(sat),
            isInside: distance <= wheelRadius + 10
        };
    }

    function handleWheelMouseDown(e) {
        const pos = getWheelPosition(e);
        if (pos.isInside) {
            isWheelDragging = true;
            updateWheelColor(pos.hue, pos.sat);
        }
    }

    function handleWheelMouseMove(e) {
        if (!isWheelDragging) return;
        const pos = getWheelPosition(e);
        updateWheelColor(pos.hue, pos.sat);
    }

    function handleWheelMouseUp() {
        if (isWheelDragging) {
            isWheelDragging = false;
            generatePaletteFromBase();
        }
    }

    function handleWheelTouchStart(e) {
        e.preventDefault();
        if (e.touches.length > 0) {
            const touch = e.touches[0];
            const pos = getWheelPosition(touch);
            if (pos.isInside) {
                isWheelDragging = true;
                updateWheelColor(pos.hue, pos.sat);
            }
        }
    }

    function handleWheelTouchMove(e) {
        e.preventDefault();
        if (!isWheelDragging || e.touches.length === 0) return;
        const touch = e.touches[0];
        const pos = getWheelPosition(touch);
        updateWheelColor(pos.hue, pos.sat);
    }

    function handleWheelTouchEnd() {
        if (isWheelDragging) {
            isWheelDragging = false;
            generatePaletteFromBase();
        }
    }

    function updateWheelColor(hue, sat) {
        const hex = ColorUtils.hslToHex(hue, sat, 50);
        state.baseColor = hex;
        updateWheelIndicator(hue, sat);

        const previewBox = document.getElementById('selectedColorPreview');
        const hexDisplay = document.getElementById('selectedHex');
        if (previewBox) previewBox.style.backgroundColor = hex;
        if (hexDisplay) hexDisplay.textContent = hex.toUpperCase();

        updateSlidersFromColor(hex);
    }

    // ========== 事件绑定 ==========

    function bindAllEvents() {
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const tab = btn.dataset.tab;
                switchTab(tab);
            });
        });

        document.querySelectorAll('.rule-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const rule = btn.dataset.rule;
                setHarmonyMode(rule);
                document.querySelectorAll('.rule-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
            });
        });

        const colorCount = document.getElementById('colorCount');
        const colorCountValue = document.getElementById('colorCountValue');
        if (colorCount) {
            colorCount.addEventListener('input', () => {
                state.colorCount = parseInt(colorCount.value);
                if (colorCountValue) colorCountValue.textContent = colorCount.value;
            });
            colorCount.addEventListener('change', () => {
                generatePaletteFromBase();
            });
        }

        const randomBtn = document.getElementById('randomGenerateBtn');
        if (randomBtn) {
            randomBtn.addEventListener('click', generateRandomPalette);
        }

        bindSliderEvents();

        const hexInput = document.getElementById('hexInput');
        if (hexInput) {
            hexInput.addEventListener('change', handleHexInputChange);
            hexInput.addEventListener('blur', handleHexInputChange);
        }

        document.querySelectorAll('.export-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const format = btn.dataset.format;
                exportPalette(format);
            });
        });

        document.querySelectorAll('.preview-tab').forEach(btn => {
            btn.addEventListener('click', () => {
                switchPreviewTemplate(btn);
            });
        });

        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', toggleTheme);
        }

        const aboutBtn = document.getElementById('aboutBtn');
        if (aboutBtn) {
            aboutBtn.addEventListener('click', showAboutModal);
        }

        const closeAboutBtn = document.getElementById('closeAboutBtn');
        if (closeAboutBtn) {
            closeAboutBtn.addEventListener('click', hideAboutModal);
        }

        const aboutModal = document.getElementById('aboutModal');
        if (aboutModal) {
            aboutModal.addEventListener('click', (e) => {
                if (e.target.classList.contains('modal-overlay')) {
                    hideAboutModal();
                }
            });
        }

        bindImageEvents();

        const clearHistoryBtn = document.getElementById('clearHistoryBtn');
        if (clearHistoryBtn) {
            clearHistoryBtn.addEventListener('click', clearHistory);
        }
    }

    function bindSliderEvents() {
        const hueSlider = document.getElementById('hueSlider');
        const satSlider = document.getElementById('satSlider');
        const valSlider = document.getElementById('valSlider');

        if (hueSlider) hueSlider.addEventListener('input', handleSliderChange);
        if (satSlider) satSlider.addEventListener('input', handleSliderChange);
        if (valSlider) valSlider.addEventListener('input', handleSliderChange);

        if (hueSlider) hueSlider.addEventListener('change', handleSliderChangeEnd);
        if (satSlider) satSlider.addEventListener('change', handleSliderChangeEnd);
        if (valSlider) valSlider.addEventListener('change', handleSliderChangeEnd);
    }

    function handleSliderChange() {
        const h = parseInt(document.getElementById('hueSlider').value);
        const s = parseInt(document.getElementById('satSlider').value);
        const v = parseInt(document.getElementById('valSlider').value);

        const hex = ColorUtils.hslToHex(h, s, v);

        const preview = document.getElementById('sliderColorPreview');
        if (preview) preview.style.backgroundColor = hex;

        const hexInput = document.getElementById('hexInput');
        if (hexInput) hexInput.value = hex.toUpperCase();

        document.getElementById('hueValue').textContent = h + '°';
        document.getElementById('satValue').textContent = s + '%';
        document.getElementById('valValue').textContent = v + '%';

        updateSliderBackgrounds(h, s, v);
    }

    function handleSliderChangeEnd() {
        const h = parseInt(document.getElementById('hueSlider').value);
        const s = parseInt(document.getElementById('satSlider').value);
        const v = parseInt(document.getElementById('valSlider').value);
        const hex = ColorUtils.hslToHex(h, s, v);

        const selectedIndex = PaletteDisplay.getSelectedIndex();
        if (state.currentPalette[selectedIndex] !== undefined) {
            state.currentPalette[selectedIndex] = hex;
            PaletteDisplay.setColors(state.currentPalette);
            updatePreview();

            if (selectedIndex === 0) {
                state.baseColor = hex;
                updateWheelIndicator(h, s);
                const previewBox = document.getElementById('selectedColorPreview');
                const hexDisplay = document.getElementById('selectedHex');
                if (previewBox) previewBox.style.backgroundColor = hex;
                if (hexDisplay) hexDisplay.textContent = hex.toUpperCase();
            }

            StorageService.saveLastPalette(state.currentPalette);
        }
    }

    function handleHexInputChange() {
        const hexInput = document.getElementById('hexInput');
        let hex = hexInput.value.trim();
        if (!hex.startsWith('#')) hex = '#' + hex;

        if (ColorUtils.isValidHex(hex)) {
            hex = hex.toLowerCase();
            updateSlidersFromColor(hex);

            const selectedIndex = PaletteDisplay.getSelectedIndex();
            if (state.currentPalette[selectedIndex] !== undefined) {
                state.currentPalette[selectedIndex] = hex;
                PaletteDisplay.setColors(state.currentPalette);
                updatePreview();

                if (selectedIndex === 0) {
                    state.baseColor = hex;
                    const hsl = ColorUtils.hexToHsl(hex);
                    updateWheelIndicator(hsl.h, hsl.s);
                    const previewBox = document.getElementById('selectedColorPreview');
                    const hexDisplay = document.getElementById('selectedHex');
                    if (previewBox) previewBox.style.backgroundColor = hex;
                    if (hexDisplay) hexDisplay.textContent = hex.toUpperCase();
                }

                StorageService.saveLastPalette(state.currentPalette);
            }
        } else {
            hexInput.value = (state.currentPalette[PaletteDisplay.getSelectedIndex()] || '').toUpperCase();
        }
    }

    function updateSlidersFromColor(hex) {
        const hsl = ColorUtils.hexToHsl(hex);

        document.getElementById('hueSlider').value = hsl.h;
        document.getElementById('satSlider').value = hsl.s;
        document.getElementById('valSlider').value = hsl.l;
        document.getElementById('hueValue').textContent = hsl.h + '°';
        document.getElementById('satValue').textContent = hsl.s + '%';
        document.getElementById('valValue').textContent = hsl.l + '%';

        const preview = document.getElementById('sliderColorPreview');
        if (preview) preview.style.backgroundColor = hex;

        const hexInput = document.getElementById('hexInput');
        if (hexInput) hexInput.value = hex.toUpperCase();

        updateSliderBackgrounds(hsl.h, hsl.s, hsl.l);
    }

    function updateSliderBackgrounds(h, s, v) {
        const satSlider = document.getElementById('satSlider');
        const valSlider = document.getElementById('valSlider');

        if (satSlider) {
            satSlider.style.background = `linear-gradient(to right, hsl(${h}, 0%, ${v}%), hsl(${h}, 100%, ${v}%))`;
        }
        if (valSlider) {
            valSlider.style.background = `linear-gradient(to right, hsl(${h}, ${s}%, 0%), hsl(${h}, ${s}%, 50%), hsl(${h}, ${s}%, 100%))`;
        }
    }

    // ========== 图片取色 ==========

    function bindImageEvents() {
        const uploadArea = document.getElementById('uploadArea');
        const imageInput = document.getElementById('imageInput');
        const extractBtn = document.getElementById('extractBtn');

        if (uploadArea && imageInput) {
            uploadArea.addEventListener('click', () => imageInput.click());
            imageInput.addEventListener('change', handleImageSelect);

            uploadArea.addEventListener('dragover', (e) => {
                e.preventDefault();
                uploadArea.classList.add('drag-over');
            });
            uploadArea.addEventListener('dragleave', () => {
                uploadArea.classList.remove('drag-over');
            });
            uploadArea.addEventListener('drop', (e) => {
                e.preventDefault();
                uploadArea.classList.remove('drag-over');
                const file = e.dataTransfer.files[0];
                if (file && file.type.startsWith('image/')) {
                    loadImage(file);
                }
            });
        }

        if (extractBtn) {
            extractBtn.addEventListener('click', extractImageColors);
        }

        const removeImageBtn = document.getElementById('removeImageBtn');
        if (removeImageBtn) {
            removeImageBtn.addEventListener('click', removeImage);
        }

        const extractCount = document.getElementById('extractCount');
        const extractCountValue = document.getElementById('extractCountValue');
        if (extractCount && extractCountValue) {
            extractCount.addEventListener('input', () => {
                extractCountValue.textContent = extractCount.value;
            });
        }
    }

    function handleImageSelect(e) {
        const file = e.target.files[0];
        if (file && file.type.startsWith('image/')) {
            loadImage(file);
        }
    }

    function loadImage(file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const imageUrl = e.target.result;
            const previewArea = document.getElementById('imagePreviewArea');
            const previewImage = document.getElementById('previewImage');
            const uploadArea = document.getElementById('uploadArea');
            const extractBtn = document.getElementById('extractBtn');

            if (previewImage) previewImage.src = imageUrl;
            if (previewArea) previewArea.style.display = 'block';
            if (uploadArea) uploadArea.style.display = 'none';
            if (extractBtn) extractBtn.disabled = false;

            setTimeout(extractImageColors, 300);
        };
        reader.readAsDataURL(file);
    }

    function removeImage() {
        const previewArea = document.getElementById('imagePreviewArea');
        const uploadArea = document.getElementById('uploadArea');
        const extractBtn = document.getElementById('extractBtn');

        if (previewArea) previewArea.style.display = 'none';
        if (uploadArea) uploadArea.style.display = 'block';
        if (extractBtn) extractBtn.disabled = true;

        const imageInput = document.getElementById('imageInput');
        if (imageInput) imageInput.value = '';
    }

    function extractImageColors() {
        const previewImage = document.getElementById('previewImage');
        const extractCount = parseInt(document.getElementById('extractCount')?.value) || 5;
        const loading = document.getElementById('extractLoading');

        if (!previewImage || !previewImage.src) return;

        if (loading) loading.style.display = 'flex';

        setTimeout(() => {
            ImageExtractor.init();
            ImageExtractor.extractColors(previewImage, extractCount).then(colors => {
                if (loading) loading.style.display = 'none';

                setPalette(colors);
                addToHistory(colors);
                showToast('已从图片提取 ' + colors.length + ' 种颜色');
            }).catch(err => {
                console.error('Extract failed:', err);
                if (loading) loading.style.display = 'none';
                showToast('提取失败，请重试');
            });
        }, 100);
    }

    // ========== 配色生成 ==========

    function generateInitialPalette() {
        const lastPalette = StorageService.getLastPalette();
        if (lastPalette && lastPalette.length > 0) {
            setPalette(lastPalette);
            state.baseColor = lastPalette[0];

            const hsl = ColorUtils.hexToHsl(lastPalette[0]);
            updateWheelIndicator(hsl.h, hsl.s);

            const previewBox = document.getElementById('selectedColorPreview');
            const hexDisplay = document.getElementById('selectedHex');
            if (previewBox) previewBox.style.backgroundColor = lastPalette[0];
            if (hexDisplay) hexDisplay.textContent = lastPalette[0].toUpperCase();

            updateSlidersFromColor(lastPalette[0]);
        } else {
            generatePaletteFromBase();
        }
    }

    function generatePaletteFromBase() {
        const count = state.colorCount;
        let colors;

        try {
            colors = ColorUtils.generateHarmony(state.baseColor, state.harmonyMode);
        } catch (e) {
            colors = ColorUtils.generateMonochromatic(state.baseColor, count);
        }

        if (colors.length < count) {
            const shades = ColorUtils.generateTintsAndShades(state.baseColor, count);
            while (colors.length < count) {
                colors.push(shades[colors.length % shades.length]);
            }
        } else if (colors.length > count) {
            colors = colors.slice(0, count);
        }

        setPalette(colors);
        addToHistory(colors);
    }

    function generateRandomPalette() {
        const count = state.colorCount;
        const satMin = parseInt(document.getElementById('satMin')?.value) || 40;
        const satMax = parseInt(document.getElementById('satMax')?.value) || 80;
        const lightMin = parseInt(document.getElementById('lightMin')?.value) || 35;
        const lightMax = parseInt(document.getElementById('lightMax')?.value) || 65;
        const harmonious = document.getElementById('harmoniousMode')?.checked !== false;

        let colors;

        if (harmonious) {
            const baseHue = Math.floor(Math.random() * 360);
            const baseSat = satMin + Math.random() * (satMax - satMin);
            const baseLight = lightMin + Math.random() * (lightMax - lightMin);
            const baseColor = ColorUtils.hslToHex(baseHue, baseSat, baseLight);

            const modes = ['analogous', 'complementary', 'triadic', 'split-complementary'];
            const mode = modes[Math.floor(Math.random() * modes.length)];

            colors = ColorUtils.generateHarmony(baseColor, mode);

            while (colors.length < count) {
                const extraHue = (baseHue + Math.random() * 60 - 30 + 360) % 360;
                const extraSat = satMin + Math.random() * (satMax - satMin);
                const extraLight = lightMin + Math.random() * (lightMax - lightMin);
                colors.push(ColorUtils.hslToHex(extraHue, extraSat, extraLight));
            }
            if (colors.length > count) {
                colors = colors.slice(0, count);
            }

            state.baseColor = colors[0];
            const hsl = ColorUtils.hexToHsl(colors[0]);
            updateWheelIndicator(hsl.h, hsl.s);
            const previewBox = document.getElementById('selectedColorPreview');
            const hexDisplay = document.getElementById('selectedHex');
            if (previewBox) previewBox.style.backgroundColor = colors[0];
            if (hexDisplay) hexDisplay.textContent = colors[0].toUpperCase();
        } else {
            colors = [];
            for (let i = 0; i < count; i++) {
                const hue = Math.floor(Math.random() * 360);
                const sat = satMin + Math.random() * (satMax - satMin);
                const light = lightMin + Math.random() * (lightMax - lightMin);
                colors.push(ColorUtils.hslToHex(hue, sat, light));
            }
        }

        setPalette(colors);
        addToHistory(colors);
    }

    function setPalette(colors) {
        state.currentPalette = [...colors];
        PaletteDisplay.init('colorPalette');
        PaletteDisplay.setColors(colors);
        PaletteDisplay.setSelected(0);
        updatePreview();
        updateSlidersFromColor(colors[0]);
        StorageService.saveLastPalette(colors);
    }

    function setHarmonyMode(mode) {
        state.harmonyMode = mode;
        generatePaletteFromBase();
    }

    // ========== 预览 ==========

    function updatePreview() {
        const colors = state.currentPalette;
        if (colors.length < 2) return;

        const colorMap = {
            primary: colors[0],
            secondary: colors[1] || colors[0],
            accent: colors[2] || colors[0],
            background: colors[3] || '#F7F9FC',
            text: colors[4] || '#2D3748'
        };

        updateCardPreview(colorMap);
        updateIllustrationPreview(colorMap);
        updatePosterPreview(colorMap);
    }

    function updateCardPreview(colors) {
        const card = document.querySelector('#template-card .mobile-card');
        if (!card) return;

        const cover = card.querySelector('.card-cover');
        const title = card.querySelector('.card-title');
        const desc = card.querySelector('.card-desc');
        const tags = card.querySelectorAll('.tag');
        const btn = card.querySelector('.card-btn');

        if (cover) cover.style.backgroundColor = colors.primary;
        if (title) title.style.color = colors.text || '#2D3748';
        if (desc) desc.style.color = colors.text || '#2D3748';
        if (btn) {
            btn.style.backgroundColor = colors.primary;
            btn.style.color = ColorUtils.getContrastColor(colors.primary);
        }
        tags.forEach((tag, i) => {
            const tagColors = [colors.primary, colors.secondary, colors.accent];
            const color = tagColors[i % tagColors.length];
            tag.style.backgroundColor = color + '20';
            tag.style.color = color;
        });
    }

    function updateIllustrationPreview(colors) {
        const scene = document.querySelector('.illustration-scene');
        if (!scene) return;

        const sky = scene.querySelector('.sky');
        const sun = scene.querySelector('.sun');
        const mountainBack = scene.querySelector('.mountain-back');
        const mountainFront = scene.querySelector('.mountain-front');
        const ground = scene.querySelector('.ground');
        const trees = scene.querySelectorAll('.tree');

        if (sky) sky.style.backgroundColor = colors.secondary + '40';
        if (sun) sun.style.backgroundColor = colors.accent;
        if (mountainBack) mountainBack.style.backgroundColor = colors.secondary + 'CC';
        if (mountainFront) mountainFront.style.backgroundColor = colors.primary;
        if (ground) ground.style.backgroundColor = colors.accent + '99';
        trees.forEach((tree, i) => {
            tree.style.backgroundColor = i === 0 ? colors.primary : colors.secondary;
        });
    }

    function updatePosterPreview(colors) {
        const poster = document.querySelector('#template-poster .poster-content');
        if (!poster) return;

        const deco1 = poster.querySelector('.deco-1');
        const deco2 = poster.querySelector('.deco-2');
        const title = poster.querySelector('.poster-title');
        const subtitle = poster.querySelector('.poster-subtitle');
        const text = poster.querySelector('.poster-text');
        const line = poster.querySelector('.poster-line');
        const date = poster.querySelector('.poster-date');

        if (deco1) deco1.style.backgroundColor = colors.primary;
        if (deco2) deco2.style.backgroundColor = colors.accent;
        if (title) title.style.color = colors.primary;
        if (subtitle) subtitle.style.color = colors.secondary;
        if (text) text.style.color = colors.text || '#2D3748';
        if (line) line.style.backgroundColor = colors.accent;
        if (date) date.style.color = colors.text || '#2D3748';

        poster.style.backgroundColor = colors.background || '#fff';
    }

    function switchPreviewTemplate(activeBtn) {
        document.querySelectorAll('.preview-tab').forEach(btn => {
            btn.classList.remove('active');
        });
        activeBtn.classList.add('active');

        const template = activeBtn.dataset.template;
        document.querySelectorAll('.preview-template').forEach(tpl => {
            tpl.classList.remove('active');
        });

        const targetTemplate = document.getElementById('template-' + template);
        if (targetTemplate) {
            targetTemplate.classList.add('active');
        }
    }

    // ========== 选项卡切换 ==========

    function switchTab(tabName) {
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tabName);
        });

        document.querySelectorAll('.tab-panel').forEach(panel => {
            panel.classList.toggle('active', panel.id === 'tab-' + tabName);
        });
    }

    // ========== 导出 ==========

    function exportPalette(format) {
        const colors = state.currentPalette;
        if (colors.length === 0) return;

        try {
            switch (format) {
                case 'css':
                    const css = ExportService.exportCSS(colors);
                    ExportService.downloadFile(css, 'palette.css', 'text/css');
                    showToast('CSS文件已下载');
                    break;
                case 'png':
                    ExportService.exportPNG(colors).then(dataUrl => {
                        ExportService.downloadDataURL(dataUrl, 'palette.png');
                        showToast('PNG图片已下载');
                    });
                    break;
                case 'json':
                    const json = ExportService.exportJSON(colors);
                    ExportService.downloadFile(json, 'palette.json', 'application/json');
                    showToast('JSON文件已下载');
                    break;
                default:
                    console.warn('Unknown export format:', format);
            }
        } catch (e) {
            console.error('Export failed:', e);
            showToast('导出失败');
        }
    }

    // ========== 历史记录 ==========

    function loadHistory() {
        const history = StorageService.getHistory() || [];
        renderHistory(history);
    }

    function addToHistory(colors) {
        if (!colors || colors.length === 0) return;

        const history = StorageService.getHistory() || [];
        
        // 避免重复
        if (history.length > 0) {
            const last = history[0];
            if (last.colors && last.colors.length === colors.length &&
                last.colors.every((c, i) => c.toLowerCase() === colors[i].toLowerCase())) {
                return;
            }
        }

        const newItem = {
            id: Date.now(),
            colors: [...colors],
            name: `方案 ${history.length + 1}`,
            createdAt: new Date().toISOString()
        };

        history.unshift(newItem);

        if (history.length > 20) {
            history.splice(20);
        }

        StorageService.saveHistory(history);
        renderHistory(history);
    }

    function renderHistory(history) {
        const historyList = document.getElementById('historyList');
        const emptyHistory = document.getElementById('emptyHistory');

        if (!historyList) return;

        if (!history || history.length === 0) {
            historyList.innerHTML = '';
            if (emptyHistory) emptyHistory.style.display = 'flex';
            return;
        }

        if (emptyHistory) emptyHistory.style.display = 'none';

        historyList.innerHTML = history.map(item => `
            <div class="history-item" data-id="${item.id}">
                <div class="history-colors">
                    ${item.colors.slice(0, 5).map(c => `
                        <div class="history-color" style="background-color: ${c};"></div>
                    `).join('')}
                </div>
                <div class="history-info">
                    <span class="history-name">${item.name}</span>
                    <span class="history-date">${formatDate(item.createdAt)}</span>
                </div>
            </div>
        `).join('');

        historyList.querySelectorAll('.history-item').forEach(item => {
            item.addEventListener('click', () => {
                const id = parseInt(item.dataset.id);
                const historyItem = history.find(h => h.id === id);
                if (historyItem) {
                    setPalette(historyItem.colors);
                    showToast('已应用配色方案');
                }
            });
        });
    }

    function clearHistory() {
        if (confirm('确定要清空所有历史记录吗？')) {
            StorageService.saveHistory([]);
            renderHistory([]);
            showToast('历史记录已清空');
        }
    }

    function formatDate(dateStr) {
        const date = new Date(dateStr);
        const now = new Date();
        const diff = now - date;

        if (diff < 60000) return '刚刚';
        if (diff < 3600000) return Math.floor(diff / 60000) + '分钟前';
        if (diff < 86400000) return Math.floor(diff / 3600000) + '小时前';
        if (diff < 604800000) return Math.floor(diff / 86400000) + '天前';
        return date.toLocaleDateString('zh-CN');
    }

    // ========== 主题 ==========

    function toggleTheme() {
        const body = document.body;
        const isDark = body.classList.toggle('dark-theme');

        StorageService.savePreferences({ theme: isDark ? 'dark' : 'light' });

        const btn = document.getElementById('themeToggle');
        if (btn) {
            btn.textContent = isDark ? '☀️' : '🌙';
        }
    }

    function loadPreferences() {
        const prefs = StorageService.getPreferences();

        if (prefs.theme === 'dark') {
            document.body.classList.add('dark-theme');
            const btn = document.getElementById('themeToggle');
            if (btn) btn.textContent = '☀️';
        }
    }

    // ========== 关于弹窗 ==========

    function showAboutModal() {
        const modal = document.getElementById('aboutModal');
        if (modal) modal.style.display = 'flex';
    }

    function hideAboutModal() {
        const modal = document.getElementById('aboutModal');
        if (modal) modal.style.display = 'none';
    }

    // ========== Toast ==========

    function showToast(message, duration = 2000) {
        const container = document.getElementById('toastContainer');
        if (!container) return;

        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.textContent = message;
        container.appendChild(toast);

        setTimeout(() => toast.classList.add('show'), 10);

        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, duration);
    }

    function getCurrentPalette() {
        return [...state.currentPalette];
    }

    return {
        init,
        getCurrentPalette,
        setPalette
    };
})();

document.addEventListener('DOMContentLoaded', function() {
    App.init();
});