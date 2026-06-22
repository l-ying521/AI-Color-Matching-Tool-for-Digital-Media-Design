/**
 * SlidersPanel - HSV颜色微调面板
 * 通过三个滑块精确调整选中颜色的色相、饱和度、明度
 */
const SlidersPanel = (function() {
    'use strict';

    let state = {
        targetIndex: 0,
        hue: 0,
        saturation: 100,
        value: 50,
        hex: '#FF6B6B'
    };

    let elements = {};

    /**
     * 初始化
     */
    function init() {
        elements = {
            hueSlider: document.getElementById('hueSlider'),
            satSlider: document.getElementById('satSlider'),
            valSlider: document.getElementById('valSlider'),
            hueValue: document.getElementById('hueValue'),
            satValue: document.getElementById('satValue'),
            valValue: document.getElementById('valValue'),
            hexInput: document.getElementById('hexInput'),
            preview: document.getElementById('sliderColorPreview')
        };
        
        if (!elements.hueSlider) {
            console.error('[SlidersPanel] Elements not found');
            return;
        }
        
        bindEvents();
        setColor('#FF6B6B', 0);
    }

    /**
     * 绑定事件
     */
    function bindEvents() {
        elements.hueSlider.addEventListener('input', handleSliderChange);
        elements.satSlider.addEventListener('input', handleSliderChange);
        elements.valSlider.addEventListener('input', handleSliderChange);
        
        elements.hueSlider.addEventListener('change', emitColorChanged);
        elements.satSlider.addEventListener('change', emitColorChanged);
        elements.valSlider.addEventListener('change', emitColorChanged);
        
        elements.hexInput.addEventListener('change', handleHexInput);
        elements.hexInput.addEventListener('blur', handleHexInput);
    }

    /**
     * 处理滑块变化
     */
    function handleSliderChange() {
        state.hue = parseInt(elements.hueSlider.value);
        state.saturation = parseInt(elements.satSlider.value);
        state.value = parseInt(elements.valSlider.value);
        
        updateHexFromHSL();
        updateDisplay();
    }

    /**
     * 发出颜色变化事件
     */
    function emitColorChanged() {
        EventBus.emit('color:changed', {
            index: state.targetIndex,
            hex: state.hex
        });
    }

    /**
     * 处理HEX输入
     */
    function handleHexInput() {
        let hex = elements.hexInput.value.trim();
        if (!hex.startsWith('#')) {
            hex = '#' + hex;
        }
        
        if (ColorUtils.isValidHex(hex)) {
            state.hex = hex.toLowerCase();
            updateHSLFromHex();
            updateSliders();
            updateDisplay();
            emitColorChanged();
        } else {
            // 恢复原值
            elements.hexInput.value = state.hex.toUpperCase();
        }
    }

    /**
     * 设置当前编辑的颜色
     * @param {string} hex - HEX颜色值
     * @param {number} index - 在色板中的索引
     */
    function setColor(hex, index) {
        if (!ColorUtils.isValidHex(hex)) return;
        
        state.targetIndex = index;
        state.hex = hex.toLowerCase();
        updateHSLFromHex();
        updateSliders();
        updateDisplay();
    }

    /**
     * 从HSL更新HEX
     */
    function updateHexFromHSL() {
        state.hex = ColorUtils.hslToHex(state.hue, state.saturation, state.value);
    }

    /**
     * 从HEX更新HSL
     */
    function updateHSLFromHex() {
        const hsl = ColorUtils.hexToHsl(state.hex);
        state.hue = hsl.h;
        state.saturation = hsl.s;
        state.value = hsl.l;
    }

    /**
     * 更新滑块值
     */
    function updateSliders() {
        elements.hueSlider.value = state.hue;
        elements.satSlider.value = state.saturation;
        elements.valSlider.value = state.value;
    }

    /**
     * 更新显示
     */
    function updateDisplay() {
        // 更新数值标签
        elements.hueValue.textContent = state.hue + '°';
        elements.satValue.textContent = state.saturation + '%';
        elements.valValue.textContent = state.value + '%';
        
        // 更新HEX输入
        elements.hexInput.value = state.hex.toUpperCase();
        
        // 更新预览
        if (elements.preview) {
            elements.preview.style.backgroundColor = state.hex;
        }
        
        // 更新饱和度滑块背景
        const satGradient = `linear-gradient(to right, 
            hsl(${state.hue}, 0%, ${state.value}%), 
            hsl(${state.hue}, 100%, ${state.value}%))`;
        elements.satSlider.style.background = satGradient;
        
        // 更新明度滑块背景
        const valGradient = `linear-gradient(to right, 
            hsl(${state.hue}, ${state.saturation}%, 0%), 
            hsl(${state.hue}, ${state.saturation}%, 50%), 
            hsl(${state.hue}, ${state.saturation}%, 100%))`;
        elements.valSlider.style.background = valGradient;
    }

    /**
     * 获取当前颜色
     * @returns {string}
     */
    function getColor() {
        return state.hex;
    }

    /**
     * 获取当前HSL
     * @returns {Object}
     */
    function getHSL() {
        return { h: state.hue, s: state.saturation, l: state.value };
    }

    return {
        init,
        setColor,
        getColor,
        getHSL
    };
})();