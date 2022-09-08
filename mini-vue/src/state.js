import { observe } from "./observe/index";
import Watcher, { nextTick } from "./observe/watcher";

export function initState(vm) {
    const opts = vm.$options;
    if (opts.data) {
        initData(vm);
    }
}

function proxy(vm, target, key) {
    Object.defineProperty(vm, key, {
        get() {
            return vm[target][key];
        },
        set(newValue) {
            vm[target][key] = newValue;
        }
    });
}

function initData(vm) {
    let data = vm.$options.data;
    data = typeof data == "function" ? data.call(this) : data;
    vm._data = data;
    observe(data);

    for (let key in data) {
        proxy(vm, "_data", key);
    }
}

export function initStateMixin(Vue) {
    Vue.prototype.$nextTick = nextTick;
    Vue.prototype.$watch = function (exportOrFn, cb) {
        //new Watcher(this,exportOrFn,{user:true},cb);
    }
}