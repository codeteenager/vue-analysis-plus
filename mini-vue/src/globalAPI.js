import { mergeOptions } from './utils';
export function initGlobalAPI(Vue) {

    Vue.options = {
        _base: Vue
    };

    Vue.mixin = function (options) {
        //将用户的选项与全局进行合并
        this.options = mergeOptions(this.options, options);
        return this;
    }

    Vue.extend = function (options) {
        //就是实现根据用户的参数，返回一个构造函数而已
        function Sub() { //最终使用一个组件，就是new一个实例
            this._init(); //默认对子类进行初始化操作
        }

        Sub.prototype = Object.create(Vue.prototype);
        Sub.prototype.constructor = Sub;
        Sub.options = mergeOptions(Vue.options, options); //保存用户传入的选项
        return Sub;
    }
    Vue.options.components = {};
    Vue.component = function (id, definition) {
        //如果definition是一个函数，则已经调用Vue.extend
        definition = typeof definition === 'function' ? definition : Vue.extend(definition);
        Vue.options.components[id] = definition;
    }
}