/**
 * HistoryPanel - 历史记录面板
 * 展示和管理保存的配色方案历史
 */
const HistoryPanel = (function() {
    'use strict';

    let container;
    let state = {
        history: [],
        maxItems: 20
    };

    /**
     * 初始化
     * @param {string} containerId 
     */
    function init(containerId) {
        container = document.getElementById(containerId);
        if (!container) {
            console.error('[HistoryPanel] Container not found:', containerId);
            return;
        }
        
        // 从存储加载
        const saved = StorageService.getHistory();
        state.history = saved || [];
        
        render();
        bindEvents();
    }

    /**
     * 绑定事件
     */
    function bindEvents() {
        // 事件委托
        container.addEventListener('click', handleClick);
    }

    /**
     * 处理点击
     */
    function handleClick(e) {
        const item = e.target.closest('.history-item');
        if (!item) return;
        
        const id = item.dataset.id;
        const action = e.target.dataset.action;
        
        if (action === 'delete') {
            deleteItem(id);
            e.stopPropagation();
        } else if (action === 'apply') {
            applyPalette(id);
            e.stopPropagation();
        } else {
            applyPalette(id);
        }
    }

    /**
     * 添加配色方案到历史
     * @param {string[]} colors 
     * @param {string} name 
     */
    function addPalette(colors, name = '') {
        const palette = {
            id: Date.now().toString(),
            colors: [...colors],
            name: name || `方案 ${state.history.length + 1}`,
            createdAt: new Date().toISOString()
        };
        
        state.history.unshift(palette);
        
        // 限制数量
        if (state.history.length > state.maxItems) {
            state.history = state.history.slice(0, state.maxItems);
        }
        
        save();
        render();
        
        return palette;
    }

    /**
     * 删除历史项
     */
    function deleteItem(id) {
        const index = state.history.findIndex(item => item.id === id);
        if (index > -1) {
            state.history.splice(index, 1);
            save();
            render();
        }
    }

    /**
     * 应用配色方案
     */
    function applyPalette(id) {
        const palette = state.history.find(item => item.id === id);
        if (palette) {
            EventBus.emit('palette:apply', {
                colors: palette.colors,
                id: palette.id
            });
        }
    }

    /**
     * 清空历史
     */
    function clearAll() {
        state.history = [];
        save();
        render();
    }

    /**
     * 保存到存储
     */
    function save() {
        StorageService.saveHistory(state.history);
    }

    /**
     * 渲染
     */
    function render() {
        if (!container) return;
        
        if (state.history.length === 0) {
            container.innerHTML = `
                <div class="empty-history">
                    <p>暂无历史记录</p>
                    <p class="hint">生成的配色方案会自动保存到这里</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = `
            <div class="history-header">
                <span class="history-count">${state.history.length} 个方案</span>
                <button class="clear-btn" data-action="clear-all">清空</button>
            </div>
            <div class="history-list">
                ${state.history.map(item => `
                    <div class="history-item" data-id="${item.id}">
                        <div class="history-colors">
                            ${item.colors.map(c => `
                                <div class="history-color" style="background-color: ${c};" title="${c}"></div>
                            `).join('')}
                        </div>
                        <div class="history-info">
                            <span class="history-name">${item.name}</span>
                            <span class="history-date">${formatDate(item.createdAt)}</span>
                        </div>
                        <div class="history-actions">
                            <button class="action-btn apply-btn" data-action="apply" title="应用">✓</button>
                            <button class="action-btn delete-btn" data-action="delete" title="删除">×</button>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
        
        // 绑定清空按钮
        const clearBtn = container.querySelector('[data-action="clear-all"]');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                if (confirm('确定要清空所有历史记录吗？')) {
                    clearAll();
                }
            });
        }
    }

    /**
     * 格式化日期
     */
    function formatDate(dateStr) {
        const date = new Date(dateStr);
        const now = new Date();
        const diff = now - date;
        
        if (diff < 60000) {
            return '刚刚';
        } else if (diff < 3600000) {
            return Math.floor(diff / 60000) + '分钟前';
        } else if (diff < 86400000) {
            return Math.floor(diff / 3600000) + '小时前';
        } else if (diff < 604800000) {
            return Math.floor(diff / 86400000) + '天前';
        } else {
            return date.toLocaleDateString('zh-CN');
        }
    }

    /**
     * 获取历史记录
     * @returns {Array}
     */
    function getHistory() {
        return [...state.history];
    }

    return {
        init,
        addPalette,
        deleteItem,
        applyPalette,
        clearAll,
        getHistory,
        render
    };
})();