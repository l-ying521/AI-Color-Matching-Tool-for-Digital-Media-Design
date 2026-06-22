/**
 * ImagePanel - 图片取色面板
 * 支持上传图片并从中提取主色调
 */
const ImagePanel = (function() {
    'use strict';

    let state = {
        imageUrl: null,
        colorCount: 5,
        extractedColors: []
    };

    let elements = {};

    /**
     * 初始化
     */
    function init() {
        elements = {
            dropZone: document.getElementById('imageDropZone'),
            fileInput: document.getElementById('imageFileInput'),
            preview: document.getElementById('imagePreview'),
            colorCount: document.getElementById('extractColorCount'),
            extractBtn: document.getElementById('extractColorsBtn'),
            result: document.getElementById('extractedColors')
        };
        
        if (!elements.dropZone) {
            console.error('[ImagePanel] Elements not found');
            return;
        }
        
        ImageExtractor.init();
        bindEvents();
    }

    /**
     * 绑定事件
     */
    function bindEvents() {
        // 点击上传
        elements.dropZone.addEventListener('click', () => {
            elements.fileInput.click();
        });
        
        // 文件选择
        elements.fileInput.addEventListener('change', handleFileSelect);
        
        // 拖拽
        elements.dropZone.addEventListener('dragover', handleDragOver);
        elements.dropZone.addEventListener('dragleave', handleDragLeave);
        elements.dropZone.addEventListener('drop', handleDrop);
        
        // 提取按钮
        if (elements.extractBtn) {
            elements.extractBtn.addEventListener('click', extractColors);
        }
    }

    /**
     * 处理文件选择
     */
    function handleFileSelect(e) {
        const file = e.target.files[0];
        if (file && file.type.startsWith('image/')) {
            loadImage(file);
        }
    }

    /**
     * 处理拖拽
     */
    function handleDragOver(e) {
        e.preventDefault();
        elements.dropZone.classList.add('drag-over');
    }

    function handleDragLeave(e) {
        e.preventDefault();
        elements.dropZone.classList.remove('drag-over');
    }

    function handleDrop(e) {
        e.preventDefault();
        elements.dropZone.classList.remove('drag-over');
        
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) {
            loadImage(file);
        }
    }

    /**
     * 加载图片
     */
    function loadImage(file) {
        const reader = new FileReader();
        
        reader.onload = function(e) {
            state.imageUrl = e.target.result;
            
            // 显示预览
            elements.preview.innerHTML = `<img src="${state.imageUrl}" alt="预览" />`;
            elements.dropZone.classList.add('has-image');
            
            // 自动提取颜色
            setTimeout(extractColors, 300);
        };
        
        reader.readAsDataURL(file);
    }

    /**
     * 提取颜色
     */
    function extractColors() {
        if (!state.imageUrl) return;
        
        const count = parseInt(elements.colorCount?.value) || 5;
        state.colorCount = count;
        
        const img = elements.preview.querySelector('img');
        if (!img) return;
        
        // 显示加载状态
        elements.result.innerHTML = '<div class="loading">提取中...</div>';
        
        ImageExtractor.extractColors(img, count).then(colors => {
            state.extractedColors = colors;
            renderExtractedColors();
            
            EventBus.emit('image:colors-extracted', {
                colors,
                imageUrl: state.imageUrl
            });
        }).catch(err => {
            console.error('[ImagePanel] Extract failed:', err);
            elements.result.innerHTML = '<div class="error">提取失败，请重试</div>';
        });
    }

    /**
     * 渲染提取的颜色
     */
    function renderExtractedColors() {
        if (!elements.result) return;
        
        elements.result.innerHTML = `
            <div class="extracted-colors-title">
                <span>提取结果</span>
                <button class="apply-colors-btn" id="applyExtractedBtn">应用到色板</button>
            </div>
            <div class="extracted-colors-list">
                ${state.extractedColors.map((color, i) => `
                    <div class="extracted-color" style="background-color: ${color};" 
                         data-color="${color}" title="点击复制">
                        <span class="extracted-color-hex">${color.toUpperCase()}</span>
                    </div>
                `).join('')}
            </div>
        `;
        
        // 绑定应用按钮
        const applyBtn = document.getElementById('applyExtractedBtn');
        if (applyBtn) {
            applyBtn.addEventListener('click', () => {
                EventBus.emit('palette:generated', {
                    colors: state.extractedColors,
                    mode: 'image'
                });
            });
        }
        
        // 绑定点击复制
        const colorItems = elements.result.querySelectorAll('.extracted-color');
        colorItems.forEach(item => {
            item.addEventListener('click', () => {
                const color = item.dataset.color;
                copyToClipboard(color);
            });
        });
    }

    /**
     * 复制到剪贴板
     */
    function copyToClipboard(text) {
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(text.toUpperCase());
        }
    }

    /**
     * 获取提取的颜色
     * @returns {string[]}
     */
    function getExtractedColors() {
        return [...state.extractedColors];
    }

    return {
        init,
        extractColors,
        getExtractedColors
    };
})();