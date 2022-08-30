import Dep from "./dep";

let id = 0;
//1)当我们创建watcher的时候会把当前渲染watcher放到Dep.target上
//2)调用_render便取值，走到get上

//每个属性有一个dep（属性就是被观察者），watcher就是观察者（属性变化了通知观察者来更新），观察者模式
class Watcher { //不同的组件有不同的Watcher，目前只有渲染根实例
    constructor(vm, fn, options) {
        this.id = id++;
        this.renderWatcher = options; //是一个渲染Watcher
        this.getter = fn; //getter意味着调用这个函数可以发生取值操作
        this.deps = []; //后续我们实现计算属性，和组件清理工作
        this.depsId = new Set();
        this.get();
    }

    addDep(dep) { //一个组件对应多个属性，重复的也不用记录
        let id = dep.id;
        if (!this.depsId.has(dep.id)) {
            this.deps.push(dep);
            this.depsId.add(id);
            dep.addSub(this); //watcher记住了dep而且去重了，此时让dep记住watcher
        }
    }

    update() {
        queneWatcher(this);
    }

    run() {
        this.get();
    }

    get() {
        Dep.target = this; //静态属性只有一份
        this.getter(); //会从vm取值
        Dep.target = null;//渲染完之后清空
    }
}

let quene = [];
let has = {};
let pending = false; //防抖

function flushScheduleQuene() {
    let flushQuene = quene.slice(0);
    quene = [];
    has = {};
    pending = false;
    flushQuene.forEach(q => q.run());
}

function queneWatcher(watcher) {
    let id = watcher.id;
    if (!has[id]) {
        quene.push(watcher);
        has[id] = true;
        //不管update执行多少次，最终只执行一次刷新操作
        if (!pending) {
            nextTick(flushScheduleQuene, 0);
            pending = true;
        }
    }
}

let callbacks = [];
let waiting = false;

function flushCallbacks() {
    waiting = false;
    let cbs = callbacks.slice(0);
    callbacks = [];
    cbs.forEach(cb => cb()); //按照顺序依次执行
}

//nextTick没有直接使用某个api，而是先用promise（ie不兼容）， MutationObserver(h5的api)，可以考虑ie专享的setImmediate setTimeout

let timeFunc;
if (Promise) {
    timeFunc = () => {
        Promise.resolve().then(flushCallbacks);
    }
} else if (MutationObserver) {
    let observer = new MutationObserver(flushCallbacks);
    let textNode = document.createTextNode(1);
    observer.observe(textNode, {
        characterData: true
    });
    timeFunc = () => {
        textNode.textContent = 2;
    }
} else if (setImmeidate) {
    timeFunc = () => {
        setImmeidate(flushCallbacks);
    }
} else  {
    timeFunc = () => {
        setTimeout(flushCallbacks);
    }
}

export function nextTick(cb) {
    callbacks.push(cb);
    if (!waiting) {
        timeFunc();
        waiting = true;
    }
}

export default Watcher;