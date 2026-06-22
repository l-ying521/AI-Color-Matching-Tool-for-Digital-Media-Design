/**
 * ExportService - 导出服务
 * 支持CSS变量、JSON、图片等多种格式导出
 */
const ExportService = (function() {
    'use strict';

    /**
     * 导出CSS变量
     * @param {string[]} colors - 颜色数组
     * @param {Object} options - 选项
     * @returns {string} CSS内容
     */
    function exportCSS(colors, options = {}) {
        const { prefix = 'color', naming = 'index' } = options;
        
        let css = ':root {\n';
        
        colors.forEach((color, index) => {
            let name;
            if (naming === 'role') {
                const roles = ['primary', 'secondary', 'accent', 'background', 'text'];
                name = roles[index] || `${prefix}-${index + 1}`;
            } else {
                name = `${prefix}-${index + 1}`;
            }
            css += `  --${name}: ${color};\n`;
        });
        
        css += '}\n';
        return css;
    }

    /**
     * 导出SCSS变量
     * @param {string[]} colors 
     * @returns {string}
     */
    function exportSCSS(colors) {
        return colors.map((color, i) => `$color-${i + 1}: ${color};`).join('\n') + '\n';
    }

    /**
     * 导出JSON
     * @param {string[]} colors 
     * @returns {string}
     */
    function exportJSON(colors) {
        const data = {
            version: '1.0',
            count: colors.length,
            colors: colors.map((color, i) => ({
                name: `color-${i + 1}`,
                hex: color,
                rgb: ColorUtils.hexToRgb(color),
                hsl: ColorUtils.hexToHsl(color)
            }))
        };
        return JSON.stringify(data, null, 2) + '\n';
    }

    /**
     * 导出Tailwind配置
     * @param {string[]} colors 
     * @returns {string}
     */
    function exportTailwind(colors) {
        const colorNames = ['primary', 'secondary', 'accent', 'neutral', 'muted'];
        let config = `/** @type {import('tailwindcss').Config} */\nmodule.exports = {\n  theme: {\n    extend: {\n      colors: {\n`;
        
        colors.forEach((color, i) => {
            const name = colorNames[i] || `color-${i + 1}`;
            config += `        ${name}: '${color}',\n`;
        });
        
        config += `      }\n    }\n  }\n}\n`;
        return config;
    }

    /**
     * 导出为PNG图片
     * @param {string[]} colors 
     * @param {Object} options 
     * @returns {Promise<string>} DataURL
     */
    function exportPNG(colors, options = {}) {
        return new Promise((resolve) => {
            const { width = 800, height = 200, labels = true } = options;
            
            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            
            const colorWidth = width / colors.length;
            
            colors.forEach((color, i) => {
                // 绘制色块
                ctx.fillStyle = color;
                ctx.fillRect(i * colorWidth, 0, colorWidth, height);
                
                // 绘制标签
                if (labels) {
                    const textColor = ColorUtils.getContrastColor(color);
                    ctx.fillStyle = textColor;
                    ctx.font = 'bold 14px Arial';
                    ctx.textAlign = 'center';
                    ctx.fillText(color.toUpperCase(), i * colorWidth + colorWidth / 2, height / 2 + 5);
                }
            });
            
            resolve(canvas.toDataURL('image/png'));
        });
    }

    /**
     * 下载文件
     * @param {string} content - 文件内容
     * @param {string} filename - 文件名
     * @param {string} type - MIME类型
     */
    function downloadFile(content, filename, type = 'text/plain') {
        const blob = new Blob([content], { type });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    /**
     * 下载DataURL文件
     * @param {string} dataUrl 
     * @param {string} filename 
     */
    function downloadDataURL(dataUrl, filename) {
        const a = document.createElement('a');
        a.href = dataUrl;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }

    /**
     * 复制到剪贴板
     * @param {string} text 
     * @returns {Promise<boolean>}
     */
    function copyToClipboard(text) {
        if (navigator.clipboard && navigator.clipboard.writeText) {
            return navigator.clipboard.writeText(text).then(() => true).catch(() => false);
        }
        return Promise.resolve(false);
    }

    return {
        exportCSS,
        exportSCSS,
        exportJSON,
        exportTailwind,
        exportPNG,
        downloadFile,
        downloadDataURL,
        copyToClipboard
    };
})();