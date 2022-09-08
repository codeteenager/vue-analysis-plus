let oldArrayProto = Array.prototype;

export let newArrayProto = Object.create(oldArrayProto);

let methods = [
    "pop",
    "push",
    "shift",
    "unshift",
    "sort",
    "reverse",
    "splice"
]; //concat、slice不会改变原数组

methods.forEach(method => {
    newArrayProto[method] = function (...args) { //函数劫持
        const result = oldArrayProto[method].call(this, ...args);
        //对新增的数组再次进行劫持
        let inserted;
        let ob = this.__ob__;
        switch (method) {
            case "push":
            case "unshift":
                inserted = args;
                break;
            case "splice":
                inserted = args.slice(2);
                break;
        }
        if(inserted){
            //对新增的内容再次进行观测
            ob.observeArray(inserted);
        }
        ob.dep.notify();//数组变化了，通知对应watcher实现更新逻辑
        return result;
    }
});