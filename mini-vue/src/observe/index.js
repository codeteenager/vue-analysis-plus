import { newArrayProto } from "./array";
import Dep from './dep';
class Observer {
    constructor(data) {
        //给每个对象进行依赖收集
        this.dep = new Dep();
        //如果data有__ob__属性，则说明数据被检测过
        Object.defineProperty(data, "__ob__", {
            value: this,
            enumerable: false
        });
        //Object.defineProperty只能劫持已经存在的属性
        if (Array.isArray(data)) {
            //重写数组的push等方法
            data.__proto__ = newArrayProto;
            //如果数组中是对象则可以去监听
            this.observeArray(data);
        } else {
            this.walk(data);
        }
    }
    /**
     * 循环对象，对属性依次劫持
     * @param {*} data 
     */
    walk(data) {
        Object.keys(data).forEach(key => defineReactive(data, key, data[key]));
    }

    observeArray(data) {
        data.forEach(item => observe(item));
    }
}

function dependArray(value) {
    for (let i = 0; i < value.length; i++) {
        let current = value[i];
        current.__ob__ && current.__ob__.dep.depend();
        if (Array.isArray(current)) {
            dependArray(current);
        }
    }
}

export function defineReactive(target, key, value) {
    let childOb = observe(value);
    let dep = new Dep(); //每个属性都有一个Dep
    Object.defineProperty(target, key, {
        get() {
            if (Dep.target) {
                dep.depend(); //让属性的收集器记住watcher
                if (childOb) {
                    childOb.dep.depend();
                    if (Array.isArray(value)) {
                        dependArray(value);
                    }
                }
            }
            return value;
        },
        set(newValue = value) {
            if (newValue == value) return;
            observe(newValue);
            value = newValue;
            dep.notify();
        }
    });
}

export function observe(data) {
    if (typeof data != "object" || data == null) {
        return;
    }
    if (data.__ob__ instanceof Observer) {
        return data.__ob__;
    }

    return new Observer(data);
}