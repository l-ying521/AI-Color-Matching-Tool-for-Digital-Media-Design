/**
 * StorageService - 本地存储服务
 * 提供配色历史记录和用户偏好设置的持久化存储
 * 优先使用 localStorage 实现，简化版本
 */
const StorageService = (function() {
    'use strict';

    const KEY_HISTORY = 'colorpal_history';
    const KEY_PREFS = 'colorpal_preferences';
    const KEY_LAST_PALETTE = 'colorpal_last_palette';
    const MAX_HISTORY = 50;

    let available = false;

    /**
     * 初始化存储服务
     */
    function init() {
        try {
            const testKey = '__storage_test__';
            localStorage.setItem(testKey, testKey);
            localStorage.removeItem(testKey);
            available = true;
        } catch (e) {
            available = false;
            console.warn('[StorageService] localStorage is not available');
        }
    }

    /**
     * 保存配色到历史
     * @param {string[]} colors - 颜色数组
     * @param {string} source - 来源
     * @param {string} sourceDetail - 来源详情
     * @returns {Object} 记录对象
     */
    function savePalette(colors, source, sourceDetail) {
        if (!available) return null;

        const record = {
            id: 'palette_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
            colors: [...colors],
            source: source || 'unknown',
            sourceDetail: sourceDetail || '',
            createdAt: Date.now()
        };

        const history = getHistory();
        history.unshift(record);
        
        if (history.length > MAX_HISTORY) {
            history.length = MAX_HISTORY;
        }

        try {
            localStorage.setItem(KEY_HISTORY, JSON.stringify(history));
        } catch (e) {
            console.error('[StorageService] Failed to save history:', e);
        }

        return record;
    }

    /**
     * 获取全部历史记录
     * @returns {Object[]} 记录数组
     */
    function getHistory() {
        if (!available) return [];

        try {
            const data = localStorage.getItem(KEY_HISTORY);
            return data ? JSON.parse(data) : [];
        } catch (e) {
            console.error('[StorageService] Failed to load history:', e);
            return [];
        }
    }

    /**
     * 删除单条历史记录
     * @param {string} id - 记录ID
     */
    function deleteHistoryItem(id) {
        if (!available) return;

        const history = getHistory();
        const index = history.findIndex(item => item.id === id);
        
        if (index > -1) {
            history.splice(index, 1);
            try {
                localStorage.setItem(KEY_HISTORY, JSON.stringify(history));
            } catch (e) {
                console.error('[StorageService] Failed to delete history item:', e);
            }
        }
    }

    /**
     * 清空全部历史记录
     */
    function clearHistory() {
        if (!available) return;
        
        try {
            localStorage.removeItem(KEY_HISTORY);
        } catch (e) {
            console.error('[StorageService] Failed to clear history:', e);
        }
    }

    /**
     * 获取用户偏好
     * @returns {Object} 偏好对象
     */
    function getPreferences() {
        const defaults = {
            theme: 'light',
            defaultRule: 'complementary',
            satRange: [40, 80],
            lightRange: [35, 65],
            harmoniousMode: true,
            colorCount: 5,
            extractCount: 5,
            previewTemplate: 'card'
        };

        if (!available) return defaults;

        try {
            const data = localStorage.getItem(KEY_PREFS);
            return data ? { ...defaults, ...JSON.parse(data) } : defaults;
        } catch (e) {
            console.error('[StorageService] Failed to load preferences:', e);
            return defaults;
        }
    }

    /**
     * 保存用户偏好
     * @param {Object} prefs - 偏好对象
     */
    function setPreferences(prefs) {
        if (!available) return;

        try {
            const existing = getPreferences();
            const merged = { ...existing, ...prefs };
            localStorage.setItem(KEY_PREFS, JSON.stringify(merged));
        } catch (e) {
            console.error('[StorageService] Failed to save preferences:', e);
        }
    }

    /**
     * 检查存储是否可用
     * @returns {boolean}
     */
    function isAvailable() {
        return available;
    }

    /**
     * 获取最后使用的配色方案
     * @returns {string[]|null}
     */
    function getLastPalette() {
        if (!available) return null;

        try {
            const data = localStorage.getItem(KEY_LAST_PALETTE);
            return data ? JSON.parse(data) : null;
        } catch (e) {
            console.error('[StorageService] Failed to get last palette:', e);
            return null;
        }
    }

    /**
     * 保存最后使用的配色方案
     * @param {string[]} colors
     */
    function saveLastPalette(colors) {
        if (!available) return;

        try {
            localStorage.setItem(KEY_LAST_PALETTE, JSON.stringify(colors));
        } catch (e) {
            console.error('[StorageService] Failed to save last palette:', e);
        }
    }

    /**
     * 保存整个历史记录数组
     * @param {Array} history
     */
    function saveHistory(history) {
        if (!available) return;

        try {
            localStorage.setItem(KEY_HISTORY, JSON.stringify(history));
        } catch (e) {
            console.error('[StorageService] Failed to save history:', e);
        }
    }

    /**
     * 保存用户偏好（别名）
     * @param {Object} prefs
     */
    function savePreferences(prefs) {
        setPreferences(prefs);
    }

    return {
        init,
        savePalette,
        getHistory,
        deleteHistoryItem,
        clearHistory,
        getPreferences,
        setPreferences,
        savePreferences,
        isAvailable,
        getLastPalette,
        saveLastPalette,
        saveHistory
    };
})();