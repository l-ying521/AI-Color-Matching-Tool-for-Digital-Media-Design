/**
 * PreviewPanel - 配色方案预览面板
 * 支持网页、UI界面、海报三种预览模板
 */
const PreviewPanel = (function() {
    'use strict';

    let container;
    let currentTemplate = 'web';
    let colors = {
        primary: '#FF6B6B',
        secondary: '#4ECDC4',
        accent: '#FFE66D',
        background: '#F7F9FC',
        text: '#2D3748'
    };

    /**
     * 初始化
     * @param {string} containerId 
     */
    function init(containerId) {
        container = document.getElementById(containerId);
        if (!container) {
            console.error('[PreviewPanel] Container not found:', containerId);
            return;
        }
        
        bindTemplateButtons();
        render();
    }

    /**
     * 设置配色方案
     * @param {Object} colorMap - 颜色映射 { primary, secondary, accent, background, text }
     */
    function setColors(colorMap) {
        colors = { ...colors, ...colorMap };
        render();
    }

    /**
     * 设置色板数组（自动映射）
     * @param {string[]} palette 
     */
    function setPalette(palette) {
        if (palette.length >= 5) {
            colors = {
                primary: palette[0],
                secondary: palette[1],
                accent: palette[2],
                background: palette[3],
                text: palette[4]
            };
        } else if (palette.length > 0) {
            // 不足5个颜色时自动扩展
            const extended = ColorUtils.generateTintsAndShades(palette[0], 5);
            colors = {
                primary: palette[0],
                secondary: palette[1] || extended[2],
                accent: palette[2] || extended[1],
                background: '#F7F9FC',
                text: palette[palette.length - 1] || '#2D3748'
            };
        }
        render();
    }

    /**
     * 切换模板
     * @param {string} template - web | ui | poster
     */
    function setTemplate(template) {
        currentTemplate = template;
        updateTemplateButtons();
        render();
    }

    /**
     * 渲染预览
     */
    function render() {
        if (!container) return;
        
        let content = '';
        
        switch (currentTemplate) {
            case 'web':
                content = renderWebTemplate();
                break;
            case 'ui':
                content = renderUiTemplate();
                break;
            case 'poster':
                content = renderPosterTemplate();
                break;
            default:
                content = renderWebTemplate();
        }
        
        container.innerHTML = content;
        applyColors();
    }

    /**
     * 网页模板
     */
    function renderWebTemplate() {
        return `
            <div class="preview-web">
                <header class="web-header" data-color="primary">
                    <div class="web-logo">LOGO</div>
                    <nav class="web-nav">
                        <span class="nav-item active">首页</span>
                        <span class="nav-item">产品</span>
                        <span class="nav-item">关于</span>
                        <span class="nav-item">联系</span>
                    </nav>
                    <button class="web-btn" data-color="accent">登录</button>
                </header>
                <section class="web-hero" data-color="background">
                    <h1 class="web-title" data-color="text">精彩标题</h1>
                    <p class="web-subtitle" data-color="text">这是一段描述文字，展示配色方案在网页中的实际效果</p>
                    <button class="web-btn primary" data-color="primary">开始使用</button>
                    <button class="web-btn secondary" data-color="secondary">了解更多</button>
                </section>
                <section class="web-cards">
                    <div class="web-card" data-color="background">
                        <div class="card-icon" data-color="primary">🎨</div>
                        <h3 data-color="text">功能一</h3>
                        <p data-color="text">功能描述文字</p>
                    </div>
                    <div class="web-card" data-color="background">
                        <div class="card-icon" data-color="secondary">⚡</div>
                        <h3 data-color="text">功能二</h3>
                        <p data-color="text">功能描述文字</p>
                    </div>
                    <div class="web-card" data-color="background">
                        <div class="card-icon" data-color="accent">✨</div>
                        <h3 data-color="text">功能三</h3>
                        <p data-color="text">功能描述文字</p>
                    </div>
                </section>
            </div>
        `;
    }

    /**
     * UI界面模板
     */
    function renderUiTemplate() {
        return `
            <div class="preview-ui">
                <div class="ui-card" data-color="background">
                    <div class="ui-header" data-color="primary">
                        <span class="ui-title">用户中心</span>
                        <span class="ui-menu">⋯</span>
                    </div>
                    <div class="ui-content">
                        <div class="ui-avatar" data-color="secondary">
                            <span>U</span>
                        </div>
                        <div class="ui-info">
                            <h4 data-color="text">用户名</h4>
                            <p data-color="text">user@example.com</p>
                        </div>
                    </div>
                    <div class="ui-list">
                        <div class="ui-item">
                            <span class="item-icon" data-color="primary">📊</span>
                            <span data-color="text">数据统计</span>
                            <span class="arrow">›</span>
                        </div>
                        <div class="ui-item">
                            <span class="item-icon" data-color="secondary">⚙️</span>
                            <span data-color="text">设置</span>
                            <span class="arrow">›</span>
                        </div>
                        <div class="ui-item">
                            <span class="item-icon" data-color="accent">🔔</span>
                            <span data-color="text">通知</span>
                            <span class="badge" data-color="accent">3</span>
                        </div>
                    </div>
                    <button class="ui-btn" data-color="primary">编辑资料</button>
                </div>
            </div>
        `;
    }

    /**
     * 海报模板
     */
    function renderPosterTemplate() {
        return `
            <div class="preview-poster" data-color="background">
                <div class="poster-content">
                    <div class="poster-tag" data-color="accent">限时活动</div>
                    <h1 class="poster-title" data-color="primary">SALE</h1>
                    <p class="poster-subtitle" data-color="text">全场五折起</p>
                    <div class="poster-date" data-color="text">
                        2024.01.01 - 2024.01.15
                    </div>
                    <div class="poster-shapes">
                        <div class="shape shape-1" data-color="primary"></div>
                        <div class="shape shape-2" data-color="secondary"></div>
                        <div class="shape shape-3" data-color="accent"></div>
                    </div>
                </div>
                <div class="poster-footer" data-color="text">
                    <span>品牌 LOGO</span>
                    <span>扫码了解详情</span>
                </div>
            </div>
        `;
    }

    /**
     * 应用颜色到预览
     */
    function applyColors() {
        if (!container) return;
        
        const elements = container.querySelectorAll('[data-color]');
        elements.forEach(el => {
            const colorType = el.dataset.color;
            const color = colors[colorType];
            
            if (colorType === 'background') {
                el.style.backgroundColor = color;
            } else if (colorType === 'text') {
                el.style.color = color;
            } else {
                // 对于按钮、图标等元素，判断是否有特定的样式类
                if (el.classList.contains('web-btn') || el.classList.contains('ui-btn')) {
                    el.style.backgroundColor = color;
                    el.style.color = ColorUtils.getContrastColor(color);
                } else if (el.classList.contains('card-icon') || el.classList.contains('item-icon') || el.classList.contains('badge')) {
                    el.style.backgroundColor = color + '20';
                    el.style.color = color;
                } else if (el.classList.contains('shape')) {
                    el.style.backgroundColor = color;
                } else if (el.classList.contains('web-header') || el.classList.contains('ui-header')) {
                    el.style.backgroundColor = color;
                    el.style.color = ColorUtils.getContrastColor(color);
                } else if (el.classList.contains('poster-tag')) {
                    el.style.backgroundColor = color;
                    el.style.color = ColorUtils.getContrastColor(color);
                } else {
                    el.style.color = color;
                }
            }
        });
    }

    /**
     * 绑定模板切换按钮
     */
    function bindTemplateButtons() {
        const buttons = document.querySelectorAll('[data-template]');
        buttons.forEach(btn => {
            btn.addEventListener('click', () => {
                const template = btn.dataset.template;
                setTemplate(template);
            });
        });
        updateTemplateButtons();
    }

    /**
     * 更新模板按钮状态
     */
    function updateTemplateButtons() {
        const buttons = document.querySelectorAll('[data-template]');
        buttons.forEach(btn => {
            if (btn.dataset.template === currentTemplate) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    }

    return {
        init,
        setColors,
        setPalette,
        setTemplate,
        render
    };
})();