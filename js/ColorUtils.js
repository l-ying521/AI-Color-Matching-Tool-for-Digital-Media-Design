/**
 * ColorUtils - 色彩工具库
 * 提供色彩空间转换、色轮规则计算、随机颜色生成等基础能力
 */
const ColorUtils = (function() {
    'use strict';

    /**
     * HEX颜色值转RGB对象
     * @param {string} hex - HEX颜色值
     * @returns {Object} {r, g, b}
     */
    function hexToRgb(hex) {
        hex = hex.replace(/^#/, '');
        
        if (hex.length === 3) {
            hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
        }
        
        const r = parseInt(hex.substring(0, 2), 16);
        const g = parseInt(hex.substring(2, 4), 16);
        const b = parseInt(hex.substring(4, 6), 16);
        
        return { r, g, b };
    }

    /**
     * RGB值转HEX字符串
     * @param {number} r - 红色 (0-255)
     * @param {number} g - 绿色 (0-255)
     * @param {number} b - 蓝色 (0-255)
     * @returns {string} HEX颜色值
     */
    function rgbToHex(r, g, b) {
        const toHex = (n) => {
            const hex = Math.max(0, Math.min(255, Math.round(n))).toString(16);
            return hex.padStart(2, '0');
        };
        return '#' + toHex(r) + toHex(g) + toHex(b);
    }

    /**
     * RGB转HSL
     * @param {number} r - 红色 (0-255)
     * @param {number} g - 绿色 (0-255)
     * @param {number} b - 蓝色 (0-255)
     * @returns {Object} {h: 0-360, s: 0-100, l: 0-100}
     */
    function rgbToHsl(r, g, b) {
        r /= 255;
        g /= 255;
        b /= 255;
        
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        let h, s, l = (max + min) / 2;
        
        if (max === min) {
            h = s = 0;
        } else {
            const d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            
            switch (max) {
                case r:
                    h = (g - b) / d + (g < b ? 6 : 0);
                    break;
                case g:
                    h = (b - r) / d + 2;
                    break;
                case b:
                    h = (r - g) / d + 4;
                    break;
            }
            h /= 6;
        }
        
        return {
            h: Math.round(h * 360),
            s: Math.round(s * 100),
            l: Math.round(l * 100)
        };
    }

    /**
     * HSL转RGB
     * @param {number} h - 色相 (0-360)
     * @param {number} s - 饱和度 (0-100)
     * @param {number} l - 明度 (0-100)
     * @returns {Object} {r, g, b}
     */
    function hslToRgb(h, s, l) {
        h /= 360;
        s /= 100;
        l /= 100;
        
        let r, g, b;
        
        if (s === 0) {
            r = g = b = l;
        } else {
            const hue2rgb = (p, q, t) => {
                if (t < 0) t += 1;
                if (t > 1) t -= 1;
                if (t < 1/6) return p + (q - p) * 6 * t;
                if (t < 1/2) return q;
                if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
                return p;
            };
            
            const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            const p = 2 * l - q;
            r = hue2rgb(p, q, h + 1/3);
            g = hue2rgb(p, q, h);
            b = hue2rgb(p, q, h - 1/3);
        }
        
        return {
            r: Math.round(r * 255),
            g: Math.round(g * 255),
            b: Math.round(b * 255)
        };
    }

    /**
     * HEX转HSL
     * @param {string} hex - HEX颜色值
     * @returns {Object} {h, s, l}
     */
    function hexToHsl(hex) {
        const rgb = hexToRgb(hex);
        return rgbToHsl(rgb.r, rgb.g, rgb.b);
    }

    /**
     * HSL转HEX
     * @param {number} h - 色相
     * @param {number} s - 饱和度
     * @param {number} l - 明度
     * @returns {string} HEX颜色值
     */
    function hslToHex(h, s, l) {
        const rgb = hslToRgb(h, s, l);
        return rgbToHex(rgb.r, rgb.g, rgb.b);
    }

    /**
     * 数值夹紧
     * @param {number} value 
     * @param {number} min 
     * @param {number} max 
     * @returns {number}
     */
    function clamp(value, min, max) {
        return Math.max(min, Math.min(max, value));
    }

    /**
     * 根据基色和规则生成和谐配色
     * @param {string} baseHex - 基色HEX值
     * @param {string} rule - 规则名称
     * @returns {string[]} HEX颜色数组
     */
    function generateHarmony(baseHex, rule) {
        const baseHsl = hexToHsl(baseHex);
        const { h, s, l } = baseHsl;
        const colors = [];
        
        switch (rule) {
            case 'complementary':
                colors.push(hslToHex(h, s, clamp(l + 15, 0, 100)));
                colors.push(hslToHex(h, s, l));
                colors.push(hslToHex(h, s, clamp(l - 15, 0, 100)));
                colors.push(hslToHex((h + 180) % 360, s, l));
                colors.push(hslToHex((h + 180) % 360, clamp(s - 10, 0, 100), clamp(l + 20, 0, 100)));
                break;
                
            case 'analogous':
                colors.push(hslToHex((h + 60) % 360, clamp(s - 10, 0, 100), clamp(l + 5, 0, 100)));
                colors.push(hslToHex((h + 30) % 360, clamp(s - 5, 0, 100), clamp(l + 3, 0, 100)));
                colors.push(hslToHex(h, s, l));
                colors.push(hslToHex((h - 30 + 360) % 360, clamp(s - 5, 0, 100), clamp(l + 3, 0, 100)));
                colors.push(hslToHex((h - 60 + 360) % 360, clamp(s - 10, 0, 100), clamp(l + 5, 0, 100)));
                break;
                
            case 'triadic':
                colors.push(hslToHex(h, s, l));
                colors.push(hslToHex((h + 120) % 360, s, l));
                colors.push(hslToHex((h + 120) % 360, clamp(s - 15, 0, 100), clamp(l + 20, 0, 100)));
                colors.push(hslToHex((h + 240) % 360, s, l));
                colors.push(hslToHex((h + 240) % 360, clamp(s - 15, 0, 100), clamp(l + 20, 0, 100)));
                break;
                
            case 'split-complementary':
                colors.push(hslToHex(h, s, l));
                colors.push(hslToHex(h, clamp(s - 20, 0, 100), clamp(l + 15, 0, 100)));
                colors.push(hslToHex((h + 150) % 360, s, l));
                colors.push(hslToHex((h + 210) % 360, s, l));
                colors.push(hslToHex((h + 180) % 360, clamp(s - 25, 0, 100), clamp(l + 30, 0, 100)));
                break;
                
            case 'tetradic':
                colors.push(hslToHex(h, s, l));
                colors.push(hslToHex((h + 60) % 360, s, l));
                colors.push(hslToHex((h + 180) % 360, s, l));
                colors.push(hslToHex((h + 240) % 360, s, l));
                colors.push(hslToHex(h, clamp(s - 10, 0, 100), clamp(l + 25, 0, 100)));
                colors.push(hslToHex((h + 180) % 360, clamp(s - 10, 0, 100), clamp(l + 25, 0, 100)));
                break;
                
            case 'monochromatic':
                colors.push(hslToHex(h, clamp(s - 20, 0, 100), clamp(l + 30, 0, 100)));
                colors.push(hslToHex(h, clamp(s - 10, 0, 100), clamp(l + 15, 0, 100)));
                colors.push(hslToHex(h, s, l));
                colors.push(hslToHex(h, clamp(s + 10, 0, 100), clamp(l - 15, 0, 100)));
                colors.push(hslToHex(h, clamp(s + 20, 0, 100), clamp(l - 30, 0, 100)));
                break;
                
            default:
                colors.push(baseHex);
        }
        
        return colors;
    }

    /**
     * 生成随机配色
     * @param {number} count - 颜色数量
     * @param {Object} options - 约束选项
     * @returns {string[]} HEX颜色数组
     */
    function randomColors(count = 5, options = {}) {
        const {
            satRange = [40, 80],
            lightRange = [35, 65],
            harmonious = true
        } = options;
        
        const colors = [];
        
        if (harmonious) {
            const baseHue = Math.floor(Math.random() * 360);
            const baseSat = satRange[0] + Math.random() * (satRange[1] - satRange[0]);
            const baseLight = lightRange[0] + Math.random() * (lightRange[1] - lightRange[0]);
            
            const hueStep = Math.floor(360 / count);
            const hueVariation = 30;
            
            for (let i = 0; i < count; i++) {
                const hue = (baseHue + i * hueStep + (Math.random() - 0.5) * hueVariation + 360) % 360;
                const sat = Math.max(satRange[0], Math.min(satRange[1], baseSat + (Math.random() - 0.5) * 20));
                const light = Math.max(lightRange[0], Math.min(lightRange[1], baseLight + (Math.random() - 0.5) * 20));
                colors.push(hslToHex(hue, sat, light));
            }
        } else {
            for (let i = 0; i < count; i++) {
                const hue = Math.floor(Math.random() * 360);
                const sat = satRange[0] + Math.random() * (satRange[1] - satRange[0]);
                const light = lightRange[0] + Math.random() * (lightRange[1] - lightRange[0]);
                colors.push(hslToHex(hue, sat, light));
            }
        }
        
        return colors;
    }

    /**
     * 调整颜色的HSL值
     * @param {string} hex - 基色
     * @param {number} hDelta - 色相偏移
     * @param {number} sDelta - 饱和度偏移
     * @param {number} lDelta - 明度偏移
     * @returns {string} 调整后的HEX
     */
    function adjustColor(hex, hDelta, sDelta, lDelta) {
        const hsl = hexToHsl(hex);
        const h = (hsl.h + hDelta + 360) % 360;
        const s = clamp(hsl.s + sDelta, 0, 100);
        const l = clamp(hsl.l + lDelta, 0, 100);
        return hslToHex(h, s, l);
    }

    /**
     * 获取对比色（用于文字颜色判断）
     * @param {string} hex - 背景色
     * @returns {string} 白色或黑色HEX
     */
    function getContrastColor(hex) {
        const rgb = hexToRgb(hex);
        const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;
        return luminance > 0.5 ? '#000000' : '#FFFFFF';
    }

    /**
     * 验证HEX颜色值是否合法
     * @param {string} hex 
     * @returns {boolean}
     */
    function isValidHex(hex) {
        return /^#?([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(hex);
    }

    /**
     * 计算两个颜色的欧氏距离
     * @param {Object} c1 - {r, g, b}
     * @param {Object} c2 - {r, g, b}
     * @returns {number}
     */
    function colorDistance(c1, c2) {
        const dr = c1.r - c2.r;
        const dg = c1.g - c2.g;
        const db = c1.b - c2.b;
        return Math.sqrt(dr * dr + dg * dg + db * db);
    }

    return {
        hexToRgb,
        rgbToHex,
        rgbToHsl,
        hslToRgb,
        hexToHsl,
        hslToHex,
        generateHarmony,
        randomColors,
        adjustColor,
        getContrastColor,
        isValidHex,
        clamp,
        colorDistance
    };
})();