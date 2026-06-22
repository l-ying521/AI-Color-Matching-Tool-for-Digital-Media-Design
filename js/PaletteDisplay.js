/**
 * PaletteDisplay - 色板展示组件
 * 展示当前配色方案，支持复制、选中、锁定等交互
 */
const PaletteDisplay = (function() {
    'use strict';

    let container;
    let state = {
        colors: [],
        selectedIndex: 0,
        lockedIndices: [],
        showLockIcons: false
    };

    /**
     * 初始化
     * @param {string} containerId - 容器ID
     */
    function init(containerId) {
        container = document.getElementById(containerId);
        if (!container) {
            console.error('[PaletteDisplay] Container not found:', containerId);
            return;
        }
        
        bindEvents();
    }

    /**
     * 设置颜色并渲染
     * @param {string[]} colors - HEX颜色数组
     */
    function setColors(colors) {
        state.colors = [...colors];
        if (state.selectedIndex >= colors.length) {
            state.selectedIndex = 0;
        }
        render();
    }

    /**
     * 获取当前颜色
     * @returns {string[]}
     */
    function getColors() {
        return [...state.colors];
    }

    /**
     * 更新单个颜色
     * @param {number} index 
     * @param {string} hex 
     */
    function updateColor(index, hex) {
        if (index >= 0 && index < state.colors.length) {
            state.colors[index] = hex;
            render();
        }
    }

    /**
     * 设置选中的颜色索引
     * @param {number} index 
     */
    function setSelected(index) {
        if (index >= 0 && index < state.colors.length) {
            state.selectedIndex = index;
            render();
        }
    }

    /**
     * 获取选中的颜色索引
     * @returns {number}
     */
    function getSelectedIndex() {
        return state.selectedIndex;
    }

    /**
     * 获取选中的颜色
     * @returns {string}
     */
    function getSelectedColor() {
        return state.colors[state.selectedIndex];
    }

    /**
     * 切换锁定状态
     * @param {number} index 
     */
    function toggleLock(index) {
        const idx = state.lockedIndices.indexOf(index);
        if (idx > -1) {
            state.lockedIndices.splice(idx, 1);
        } else {
            state.lockedIndices.push(index);
        }
        render();
    }

    /**
     * 获取锁定的颜色索引
     * @returns {number[]}
     */
    function getLockedIndices() {
        return [...state.lockedIndices];
    }

    /**
     * 设置是否显示锁定图标
     * @param {boolean} show 
     */
    function setShowLockIcons(show) {
        state.showLockIcons = show;
        render();
    }

    /**
     * 渲染
     */
    function render() {
        if (!container || state.colors.length === 0) return;
        
        container.innerHTML = state.colors.map((color, index) => {
            const isSelected = state.selectedIndex === index;
            const isLocked = state.lockedIndices.includes(index);
            const textColor = ColorUtils.getContrastColor(color);
            
            return `
                <div class="color-swatch ${isSelected ? 'selected' : ''} ${isLocked ? 'locked' : ''}"
                     style="background-color: ${color};"
                     data-index="${index}">
                    ${state.showLockIcons ? `
                        <span class="lock-icon" data-action="lock" title="${isLocked ? '取消锁定' : '锁定颜色'}">
                            ${isLocked ? '🔒' : '🔓'}
                        </span>
                    ` : ''}
                    <span class="copy-icon" data-action="copy" title="复制色值">📋</span>
                    <span class="color-label" style="color: ${textColor};">${color.toUpperCase()}</span>
                    <span class="copy-toast">已复制</span>
                </div>
            `;
        }).join('');
    }

    /**
     * 绑定事件
     */
    function bindEvents() {
        if (!container) return;
        
        container.addEventListener('click', handleClick);
        container.addEventListener('dblclick', handleDblClick);
    }

    function handleClick(e) {
        const swatch = e.target.closest('.color-swatch');
        if (!swatch) return;
        
        const index = parseInt(swatch.dataset.index);
        const action = e.target.dataset.action;
        
        if (action === 'copy') {
            copyColor(index);
            e.stopPropagation();
        } else if (action === 'lock') {
            toggleLock(index);
            EventBus.emit('palette:lock-toggled', { index, locked: state.lockedIndices.includes(index) });
            e.stopPropagation();
        } else {
            selectColor(index);
        }
    }

    function handleDblClick(e) {
        const swatch = e.target.closest('.color-swatch');
        if (!swatch) return;
        
        const index = parseInt(swatch.dataset.index);
        copyColor(index);
    }

    /**
     * 选中颜色
     */
    function selectColor(index) {
        state.selectedIndex = index;
        render();
        
        EventBus.emit('color:selected', {
            index,
            hex: state.colors[index]
        });
    }

    /**
     * 复制颜色
     */
    function copyColor(index) {
        const hex = state.colors[index];
        
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(hex.toUpperCase()).then(() => {
                showCopyToast(index);
            }).catch(() => {
                fallbackCopy(hex, index);
            });
        } else {
            fallbackCopy(hex, index);
        }
        
        EventBus.emit('color:copied', { index, hex });
    }

    /**
     * 降级复制方案
     */
    function fallbackCopy(text, index) {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        
        try {
            document.execCommand('copy');
            showCopyToast(index);
        } catch (e) {
            console.warn('[PaletteDisplay] Copy failed');
        }
        
        document.body.removeChild(textarea);
    }

    /**
     * 显示复制成功提示
     */
    function showCopyToast(index) {
        const swatches = container.querySelectorAll('.color-swatch');
        if (swatches[index]) {
            const toast = swatches[index].querySelector('.copy-toast');
            if (toast) {
                toast.classList.add('show');
                setTimeout(() => toast.classList.remove('show'), 1500);
            }
        }
    }

    return {
        init,
        setColors,
        getColors,
        updateColor,
        setSelected,
        getSelectedIndex,
        getSelectedColor,
        toggleLock,
        getLockedIndices,
        setShowLockIcons,
        render
    };
})();