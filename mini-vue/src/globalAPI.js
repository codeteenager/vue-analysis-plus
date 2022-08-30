import {mergeOptions} from './utils';
export function initGlobalAPI(Vue) {

    Vue.options = {};

    Vue.mixin = function (options) {
        //将用户的选项与全局进行合并
        this.options = mergeOptions(this.options, options);
        return this;
    }
}