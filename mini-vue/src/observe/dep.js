let id = 0;

class Dep {
    constructor() {
        this.id = id++; //属性的dep要收集watcher
        this.subs = [];
    }

    depend() {
        //这里不放重复的watcher，
        Dep.target.addDep(this);
    }

    //添加watcher
    addSub(watcher) {
        this.subs.push(watcher);
    }

    //通知更新
    notify() {
        this.subs.forEach(watcher => watcher.update());
    }
}

Dep.target = null;

export default Dep;