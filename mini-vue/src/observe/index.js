import { newArrayProto } from "./array";
class Observer {
    constructor(data) {
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

export function defineReactive(target, key, value) {
    observe(value);
    Object.defineProperty(target, key, {
        get() {
            return value;
        },
        set(newValue = value) {
            if (newValue == value) return;
            observe(newValue);
            value = newValue;
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