/**
 * RandomPanel - 随机生成面板
 * 支持多种配色模式的随机生成
 */
const RandomPanel = (function() {
    'use strict';

    let state = {
        count: 5,
        mode: 'harmony',
        baseColor: '#FF6B6B'
    };

    let elements = {};

    /**
     * 初始化
     */
    function init() {
        elements = {
            countSelect: document.getElementById('randomCount'),
            modeSelect: document.getElementById('randomMode'),
            generateBtn: document.getElementById('randomGenerateBtn')
        };
        
        if (!elements.generateBtn) {
            console.error('[RandomPanel] Elements not found');
            return;
        }
        
        bindEvents();
    }

    /**
     * 绑定事件
     */
    function bindEvents() {
        elements.generateBtn.addEventListener('click', generate);
        
        // 绑定配色模式选择
        const modeButtons = document.querySelectorAll('[data-harmony]');
        modeButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const harmony = btn.dataset.harmony;
                setMode(harmony);
                updateModeButtons(harmony);
                generate();
            });
        });
        
        // 默认选中第一个
        const firstMode = document.querySelector('[data-harmony]');
        if (firstMode) {
            firstMode.classList.add('active');
        }
    }

    /**
     * 设置生成模式
     * @param {string} mode 
     */
    function setMode(mode) {
        state.mode = mode;
    }

    /**
     * 设置基色
     * @param {string} hex 
     */
    function setBaseColor(hex) {
        if (ColorUtils.isValidHex(hex)) {
            state.baseColor = hex;
        }
    }

    /**
     * 设置颜色数量
     * @param {number} count 
     */
    function setCount(count) {
        state.count = Math.max(2, Math.min(10, parseInt(count) || 5));
        if (elements.countSelect) {
            elements.countSelect.value = state.count;
        }
    }

    /**
     * 更新模式按钮状态
     */
    function updateModeButtons(activeMode) {
        const buttons = document.querySelectorAll('[data-harmony]');
        buttons.forEach(btn => {
            if (btn.dataset.harmony === activeMode) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    }

    /**
     * 生成配色方案
     */
    function generate() {
        let palette = [];
        
        switch (state.mode) {
            case 'complementary':
                palette = ColorUtils.generateHarmony(state.baseColor, 'complementary');
                break;
            case 'analogous':
                palette = ColorUtils.generateHarmony(state.baseColor, 'analogous');
                break;
            case 'triadic':
                palette = ColorUtils.generateHarmony(state.baseColor, 'triadic');
                break;
            case 'split-complementary':
                palette = ColorUtils.generateHarmony(state.baseColor, 'split-complementary');
                break;
            case 'tetradic':
                palette = ColorUtils.generateHarmony(state.baseColor, 'tetradic');
                break;
            case 'monochromatic':
                palette = ColorUtils.generateMonochromatic(state.baseColor, state.count);
                break;
            case 'harmony':
                palette = ColorUtils.generateHarmony(state.baseColor, 'analogous');
                while (palette.length < state.count) {
                    palette.push(ColorUtils.generateTintsAndShades(
                        state.baseColor, 
                        state.count
                    )[Math.floor(Math.random() * state.count)]);
                }
                break;
            default:
                palette = ColorUtils.randomColors(state.count);
        }
        
        // 确保数量一致
        if (palette.length < state.count) {
            const extra = ColorUtils.generateTintsAndShades(
                state.baseColor, 
                state.count - palette.length + 2
            );
            palette = [...palette, ...extra.slice(0, state.count - palette.length)];
        } else if (palette.length > state.count) {
            palette = palette.slice(0, state.count);
        }
        
        EventBus.emit('palette:generated', {
            colors: palette,
            mode: state.mode
        });
        
        return palette;
    }

    return {
        init,
        setMode,
        setBaseColor,
        setCount,
        generate
    };
})();