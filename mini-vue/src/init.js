import { compileToFunction } from './compiler/index';
import { initState } from "./state";
/**
 * 给Vue添加init方法
 * @param {*} Vue 
 */

export function initMixin(Vue) {
    /**
     * 用于初始化操作
     */
    Vue.prototype._init = function (options) {
        const vm = this;
        vm.$options = options; //将用户的选项挂载到实例上

        //初始化状态
        initState(vm);

        if (options.el) {
            vm.$mount(options.el);
        }
    }

    Vue.prototype.$mount = function (el) {
        const vm = this;
        el = document.querySelector(el);
        let ops = vm.$options;
        if (!ops.render) {
            let template;
            if (!ops.template && el) {
                template = el.outerHTML;
            } else {
                if (el) {
                    template = ops.template;
                }
            }

            //如果写了template，就用template
            if (template) {
                //对模板进行编译
                const render = compileToFunction(template);
                ops.render = render;
            }
        }
    }


}


