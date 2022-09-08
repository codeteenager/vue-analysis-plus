import { createElementVNode, createTextVNode } from './vdom/index';
import Watcher from './observe/watcher';
import {patch} from './vdom/patch';

export function initLifeCycle(Vue) {
    Vue.prototype._update = function (vnode) { //将vnode转换成真实dom
        const vm = this;
        const el = vm.$el;
        //patch既有初始化功能，也有更新的功能。
        vm.$el = patch(el, vnode);
    }
    Vue.prototype._v = function () {
        return createTextVNode(this, ...arguments);
    }
    Vue.prototype._c = function () {
        return createElementVNode(this, ...arguments);
    }
    Vue.prototype._s = function (value) {
        if (typeof value != 'object') return value;
        return JSON.stringify(value);
    }
    Vue.prototype._render = function () {
        const vm = this;
        return vm.$options.render.call(vm);
    }
}

export function mountComponent(vm, el) {
    vm.$el = el;
    //1、调用render方法产生虚拟节点，虚拟dom
    const updateComponent = () => {
        vm._update(vm._render());
    }

    new Watcher(vm, updateComponent, true);
    //2、根据虚拟dom生成真实dom

    //3、插入el元素

}

export function callHook(vm, hook) {
    const handlers = vm.$options[hook];
    if(handlers){
        handlers.forEach(handler=>handler.call(vm));
    }
}