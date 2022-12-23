
//_c
const isReservedTag = (tag) =>{
    return ['a','div','p','span','button','ul','li',].includes(tag);
}

export function createElementVNode(vm, tag, data, ...children) {
    if (data === null) {
        data = {};
    }
    let key = data.key;
    if (key) {
        delete data.key;
    }
    if(isReservedTag){
        return vnode(vm, tag, key, data, children);
    }else{
        //创建一个组件的虚拟节点(包括构造函数)
        let Ctor = vm.options.components[tag];//组件的构造函数
        //ctor就是组件的定义，可能是一个Sub类，还可能是组件的obj选项
        return createComponentVNode(vm,tag,key,data,children,Ctor);
    }
}

function createComponentVNode(vm,tag,key,data,children,Ctor){
    if(typeof Ctor === 'object'){
        Ctor = vm.$options._base.extend(Ctor);
    }
    data.hook = {
        init(vnode){  //稍后创建真实节点，如果是组件则调用init
            //保存组件的实例到虚拟节点上
            let instance = vnode.componentInstance = new vnode.componentOptions.Ctor;
            instance.$mount();
        }
    }
    return vnode(vm, tag, key, data, children, null,{Ctor});
}

//_v
export function createTextVNode(vm, text) {
    return vnode(vm, undefined, undefined, undefined, undefined, text);
}

function vnode(vm, tag, key, data, children, text,componentOptions) {
    return {
        vm,
        tag,
        key,
        data,
        children,
        text,
        componentOptions //组件的构造函数
    };
}

export function isSameVnode(vnode1, vnode2) {
    return vnode1.tag == vnode2.tag && vnode1.key == vnode2.key;
}