import { createElementVNode, createTextVNode } from './vdom/index';
export function initLifeCycle(Vue) {
    Vue.prototype._update = function () {

    }
    Vue.prototype._v = function () {
        return createTextVNode(this, ...arguments);
    }
    Vue.prototype._c = function () {
        return createElementVNode(this, ...arguments);
    }
    Vue.prototype._s = function (value) {
        return JSON.stringify(value);
    }
    Vue.prototype._render = function () {
        const vm = this;
        return vm.$options.render.call(vm);
    }
}
export function mountComponent(vm, el) {
    //1、调用render方法产生虚拟节点，虚拟dom
    vm._update(vm._render());
    //2、根据虚拟dom生成真实dom

    //3、插入el元素

}