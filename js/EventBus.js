/**
 * EventBus - 事件总线
 * 发布-订阅模式，实现组件间松耦合通信
 */
const EventBus = (function() {
    'use strict';

    class EventBusClass {
        constructor() {
            this.events = {};
        }

        /**
         * 订阅事件
         * @param {string} event - 事件名
         * @param {Function} callback - 回调函数
         * @returns {Function} 取消订阅函数
         */
        on(event, callback) {
            if (!this.events[event]) {
                this.events[event] = [];
            }
            this.events[event].push(callback);
            
            return () => this.off(event, callback);
        }

        /**
         * 取消订阅
         * @param {string} event - 事件名
         * @param {Function} callback - 回调函数
         */
        off(event, callback) {
            if (!this.events[event]) return;
            
            const index = this.events[event].indexOf(callback);
            if (index > -1) {
                this.events[event].splice(index, 1);
            }
        }

        /**
         * 发布事件
         * @param {string} event - 事件名
         * @param {*} data - 事件数据
         */
        emit(event, data) {
            if (!this.events[event]) return;
            
            this.events[event].forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error(`[EventBus] Error in "${event}" handler:`, error);
                }
            });
        }

        /**
         * 一次性订阅
         * @param {string} event - 事件名
         * @param {Function} callback - 回调函数
         * @returns {Function} 取消订阅函数
         */
        once(event, callback) {
            const wrapper = (data) => {
                callback(data);
                this.off(event, wrapper);
            };
            return this.on(event, wrapper);
        }

        /**
         * 清除所有事件监听
         */
        clear() {
            this.events = {};
        }
    }

    return new EventBusClass();
})();