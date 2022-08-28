
//_c
export function createElementVNode(vm, tag, data = {}, ...children) {
    return vnode(vm, tag, data.key, data,);
}

//_v
export function createTextVNode() {

}

function vnode(vm, tag, key, data, children, text) {

}