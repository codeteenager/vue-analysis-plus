import { createElementVNode, createTextVNode } from './vdom/index';
import Watcher from './observe/watcher';


function createElm(vnode) {
    let { tag, data, children, text } = vnode;
    if (typeof tag == 'string') {
        vnode.el = document.createElement(tag);
        patchProps(vnode.el, data);
        children.forEach(child => {
            vnode.el.appendChild(createElm(child));
        });
    } else {
        vnode.el = document.createTextNode(text);
    }
    return vnode.el;
}

function patchProps(el, props) {
    for (let key in props) {
        if (key === 'style') {
            for (let styleName in props.style) {
                el.style[styleName] = props.style[styleName];
            }
        } else {
            el.setAttribute(key, props[key]);
        }
    }
}


function patch(oldNode, vnode) {
    const isRealElement = oldNode.nodeType;
    if (isRealElement) {
        const elm = oldNode;
        const parentElm = elm.parentNode; //拿到父元素
        let newElm = createElm(vnode);
        parentElm.insertBefore(newElm, elm.nextSibling);
        parentElm.removeChild(elm); //删除老节点
        return newElm;
    } else {
        //diff算法
    }

}

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