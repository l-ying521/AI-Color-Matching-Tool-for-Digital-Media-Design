/**
 * ColorWheel - 色轮交互组件
 * 基于Canvas API绘制HSL色相环，支持鼠标拖拽选择基色
 */
const ColorWheel = (function() {
    'use strict';

    let canvas, ctx;
    let centerX, centerY, radius;
    let isDragging = false;
    let currentHue = 0;
    let currentSat = 100;
    let currentLight = 50;
    let wheelImageData = null;

    /**
     * 初始化色轮组件
     * @param {string} canvasId - Canvas元素ID
     */
    function init(canvasId) {
        canvas = document.getElementById(canvasId);
        if (!canvas) {
            console.error('[ColorWheel] Canvas not found:', canvasId);
            return;
        }
        
        ctx = canvas.getContext('2d');
        centerX = canvas.width / 2;
        centerY = canvas.height / 2;
        radius = Math.min(centerX, centerY) - 10;
        
        drawWheel();
        bindEvents();
        setColor('#FF6B6B');
    }

    /**
     * 绘制色相环
     */
    function drawWheel() {
        // 1. 绘制360个扇形
        for (let angle = 0; angle < 360; angle++) {
            const startAngle = (angle - 0.5) * Math.PI / 180;
            const endAngle = (angle + 0.5) * Math.PI / 180;
            
            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.arc(centerX, centerY, radius, startAngle, endAngle);
            ctx.closePath();
            ctx.fillStyle = `hsl(${angle}, 100%, 50%)`;
            ctx.fill();
        }
        
        // 2. 叠加白色径向渐变（中心白色向外过渡）
        const gradient = ctx.createRadialGradient(
            centerX, centerY, 0,
            centerX, centerY, radius
        );
        gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
        gradient.addColorStop(0.7, 'rgba(255, 255, 255, 0.3)');
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        
        ctx.globalCompositeOperation = 'source-over';
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
        ctx.fill();
        
        // 3. 保存色轮底图
        wheelImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        
        // 4. 绘制外圈边框
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
        ctx.strokeStyle = 'rgba(0,0,0,0.1)';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        drawIndicator();
    }

    /**
     * 绘制指示器
     */
    function drawIndicator() {
        const angle = currentHue * Math.PI / 180;
        const indicatorRadius = radius * (currentSat / 100);
        const indicatorX = centerX + indicatorRadius * Math.cos(angle);
        const indicatorY = centerY + indicatorRadius * Math.sin(angle);
        
        // 外阴影
        ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
        ctx.shadowBlur = 8;
        ctx.shadowOffsetY = 2;
        
        // 指示器外圈
        ctx.beginPath();
        ctx.arc(indicatorX, indicatorY, 12, 0, 2 * Math.PI);
        ctx.fillStyle = 'white';
        ctx.fill();
        ctx.strokeStyle = '#374151';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // 指示器内圈（显示当前颜色）
        ctx.beginPath();
        ctx.arc(indicatorX, indicatorY, 8, 0, 2 * Math.PI);
        ctx.fillStyle = `hsl(${currentHue}, ${currentSat}%, ${currentLight}%)`;
        ctx.fill();
        
        // 重置阴影
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
        ctx.shadowOffsetY = 0;
    }

    /**
     * 重新绘制（恢复底图 + 重绘指示器）
     */
    function redraw() {
        if (wheelImageData) {
            ctx.putImageData(wheelImageData, 0, 0);
        }
        drawIndicator();
    }

    /**
     * 计算鼠标在色轮中的位置
     */
    function getWheelPosition(e) {
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        
        const x = (e.clientX - rect.left) * scaleX - centerX;
        const y = (e.clientY - rect.top) * scaleY - centerY;
        const distance = Math.sqrt(x * x + y * y);
        const angle = Math.atan2(y, x);
        const hue = (angle * 180 / Math.PI + 360) % 360;
        const sat = Math.min(100, Math.max(0, (distance / radius) * 100));
        
        return {
            x, y, distance, angle,
            hue: Math.round(hue),
            sat: Math.round(sat),
            isInside: distance <= radius + 10
        };
    }

    /**
     * 绑定事件
     */
    function bindEvents() {
        canvas.addEventListener('mousedown', handleMouseDown);
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
        
        // 触摸支持
        canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
        document.addEventListener('touchmove', handleTouchMove, { passive: false });
        document.addEventListener('touchend', handleTouchEnd);
    }

    function handleMouseDown(e) {
        const pos = getWheelPosition(e);
        if (pos.isInside) {
            isDragging = true;
            updateColor(pos.hue, pos.sat);
        }
    }

    function handleMouseMove(e) {
        if (!isDragging) return;
        const pos = getWheelPosition(e);
        updateColor(pos.hue, pos.sat);
    }

    function handleMouseUp() {
        if (isDragging) {
            isDragging = false;
            EventBus.emit('color-wheel:selected', {
                hex: getColor(),
                hue: currentHue,
                sat: currentSat,
                light: currentLight
            });
        }
    }

    function handleTouchStart(e) {
        e.preventDefault();
        if (e.touches.length > 0) {
            const touch = e.touches[0];
            const pos = getWheelPosition(touch);
            if (pos.isInside) {
                isDragging = true;
                updateColor(pos.hue, pos.sat);
            }
        }
    }

    function handleTouchMove(e) {
        e.preventDefault();
        if (!isDragging || e.touches.length === 0) return;
        const touch = e.touches[0];
        const pos = getWheelPosition(touch);
        updateColor(pos.hue, pos.sat);
    }

    function handleTouchEnd() {
        if (isDragging) {
            isDragging = false;
            EventBus.emit('color-wheel:selected', {
                hex: getColor(),
                hue: currentHue,
                sat: currentSat,
                light: currentLight
            });
        }
    }

    /**
     * 更新颜色
     */
    function updateColor(hue, sat) {
        currentHue = hue;
        currentSat = sat;
        
        redraw();
        updatePreview();
        
        EventBus.emit('color-wheel:changed', {
            hex: getColor(),
            hue: currentHue,
            sat: currentSat,
            light: currentLight
        });
    }

    /**
     * 更新预览显示
     */
    function updatePreview() {
        const hex = getColor();
        const previewBox = document.getElementById('selectedColorPreview');
        const hexDisplay = document.getElementById('selectedHex');
        
        if (previewBox) {
            previewBox.style.backgroundColor = hex;
        }
        if (hexDisplay) {
            hexDisplay.textContent = hex.toUpperCase();
        }
    }

    /**
     * 获取当前颜色HEX值
     * @returns {string}
     */
    function getColor() {
        return ColorUtils.hslToHex(currentHue, currentSat, currentLight);
    }

    /**
     * 设置当前颜色
     * @param {string} hex - HEX颜色值
     */
    function setColor(hex) {
        if (!ColorUtils.isValidHex(hex)) return;
        
        const hsl = ColorUtils.hexToHsl(hex);
        currentHue = hsl.h;
        currentSat = hsl.s;
        currentLight = hsl.l;
        
        redraw();
        updatePreview();
    }

    /**
     * 设置明度
     */
    function setLight(light) {
        currentLight = ColorUtils.clamp(light, 0, 100);
        redraw();
        updatePreview();
    }

    /**
     * 获取HSL值
     */
    function getHSL() {
        return { h: currentHue, s: currentSat, l: currentLight };
    }

    /**
     * 销毁组件
     */
    function destroy() {
        // 移除事件监听器...
    }

    return {
        init,
        getColor,
        setColor,
        setLight,
        getHSL,
        destroy
    };
})();