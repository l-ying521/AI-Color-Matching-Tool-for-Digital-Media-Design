/**
 * ImageExtractor - 图片颜色提取器
 * 使用Canvas API从图片中提取主色调
 */
const ImageExtractor = (function() {
    'use strict';

    let canvas, ctx;

    /**
     * 初始化
     */
    function init() {
        canvas = document.createElement('canvas');
        ctx = canvas.getContext('2d');
    }

    /**
     * 从图片提取颜色
     * @param {HTMLImageElement} img - 图片元素
     * @param {number} colorCount - 提取颜色数量
     * @returns {Promise<string[]>} HEX颜色数组
     */
    function extractColors(img, colorCount = 5) {
        return new Promise((resolve, reject) => {
            try {
                // 缩放到合适大小以提高性能
                const maxSize = 150;
                let width = img.naturalWidth || img.width;
                let height = img.naturalHeight || img.height;
                
                if (width > height) {
                    if (width > maxSize) {
                        height = height * (maxSize / width);
                        width = maxSize;
                    }
                } else {
                    if (height > maxSize) {
                        width = width * (maxSize / height);
                        height = maxSize;
                    }
                }
                
                canvas.width = Math.floor(width);
                canvas.height = Math.floor(height);
                
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                
                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                const pixels = imageData.data;
                
                // 收集所有像素颜色
                const colorMap = {};
                
                for (let i = 0; i < pixels.length; i += 4) {
                    const r = pixels[i];
                    const g = pixels[i + 1];
                    const b = pixels[i + 2];
                    const a = pixels[i + 3];
                    
                    // 跳过透明像素
                    if (a < 128) continue;
                    
                    // 量化颜色（减少颜色数量）
                    const qr = Math.round(r / 16) * 16;
                    const qg = Math.round(g / 16) * 16;
                    const qb = Math.round(b / 16) * 16;
                    
                    const key = `${qr},${qg},${qb}`;
                    if (colorMap[key]) {
                        colorMap[key].count++;
                        colorMap[key].totalR += r;
                        colorMap[key].totalG += g;
                        colorMap[key].totalB += b;
                    } else {
                        colorMap[key] = {
                            count: 1,
                            totalR: r,
                            totalG: g,
                            totalB: b
                        };
                    }
                }
                
                // 排序并取前N个
                const sortedColors = Object.values(colorMap)
                    .sort((a, b) => b.count - a.count)
                    .slice(0, colorCount * 3) // 多取一些，然后做去重
                    .map(c => ({
                        r: Math.round(c.totalR / c.count),
                        g: Math.round(c.totalG / c.count),
                        b: Math.round(c.totalB / c.count),
                        count: c.count
                    }));
                
                // 过滤相似颜色
                const result = filterSimilarColors(sortedColors, colorCount);
                
                resolve(result);
            } catch (e) {
                reject(e);
            }
        });
    }

    /**
     * 过滤相似颜色
     */
    function filterSimilarColors(colors, count) {
        const result = [];
        const minDistance = 50; // 最小颜色距离
        
        for (const color of colors) {
            if (result.length >= count) break;
            
            let isSimilar = false;
            for (const existing of result) {
                const distance = colorDistance(color, existing);
                if (distance < minDistance) {
                    isSimilar = true;
                    break;
                }
            }
            
            if (!isSimilar) {
                result.push(color);
            }
        }
        
        // 如果不够，放宽条件
        if (result.length < count) {
            for (const color of colors) {
                if (result.length >= count) break;
                if (!result.includes(color)) {
                    result.push(color);
                }
            }
        }
        
        return result.slice(0, count).map(c => ColorUtils.rgbToHex(c.r, c.g, c.b));
    }

    /**
     * 计算颜色距离（欧几里得距离）
     */
    function colorDistance(c1, c2) {
        const dr = c1.r - c2.r;
        const dg = c1.g - c2.g;
        const db = c1.b - c2.b;
        return Math.sqrt(dr * dr + dg * dg + db * db);
    }

    return {
        init,
        extractColors
    };
})();