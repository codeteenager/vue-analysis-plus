import { isSameVnode } from "./index";

export function createElm(vnode) {
    let { tag, data, children, text } = vnode;
    if (typeof tag == 'string') {
        vnode.el = document.createElement(tag);
        patchProps(vnode.el, {}, data);
        children.forEach(child => {
            vnode.el.appendChild(createElm(child));
        });
    } else {
        vnode.el = document.createTextNode(text);
    }
    return vnode.el;
}

export function patchProps(el, oldProps = {}, props = {}) {
    //老的属性中有style中的元素，新的属性中没有，要删除老的
    let oldStyles = oldProps.style || {};
    let newStyles = props.style || {};
    for (let key in oldStyles) {
        if (!newStyles[key]) {
            el.style[key] = '';
        }
    }
    //新的属性没有老的属性，则删除老的属性
    for (let key in oldProps) {
        if (!oldProps[key]) {
            el.removeAttribute(key);
        }
    }

    for (let key in props) { //用新的覆盖老的
        if (key === 'style') {
            for (let styleName in props.style) {
                el.style[styleName] = props.style[styleName];
            }
        } else {
            el.setAttribute(key, props[key]);
        }
    }
}


export function patch(oldNode, vnode) {

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
        //两个节点不是同一个节点，直接删除老的换上新的（没有比对）
        //两个节点是同一个节点（判断节点的tag和key），比较两个节点的属性是否有差异（复用老的节点，将差异的地方更新）
        //节点比对完成后就比对儿子
        patchVNode(oldNode, vnode);
    }

}
function patchVNode(oldVNode, vnode) {
    if (!isSameVnode(oldVNode, vnode)) {
        let el = createElm(vnode);
        oldVNode.el.parentNode.replaceChild(el, oldVNode.el);
        return el;
    }
    //文本的话，比较一下文本的内容
    let el = vnode.el = oldVNode.el; //复用老节点的元素
    if (!oldVNode.tag) {
        if (oldVNode.text !== vnode.text) {
            oldVNode.el.textContent = vnode.text;//用新的文本覆盖老的
        }
    }
    //是标签需要比对标签的属性
    patchProps(el, oldVNode.data, vnode.data);
    //比较儿子节点，一方有儿子，一方没儿子，或者两者都有儿子
    let oldChildren = oldVNode.children || [];
    let newChildren = vnode.children || [];
    if (oldChildren.length > 0 && newChildren.length > 0) {
        //完整的diff算法比较两个儿子
        updateChildren(el, oldChildren, newChildren);
    } else if (newChildren.length > 0) {//没有老的有新的
        mountChildren(el, newChildren);
    } else if (oldChildren.length > 0) {//新的没有有老的要删除
        el.innerHTML = '';
    }
    return el;
}

function mountChildren(el, newChildren) {
    for (let i = 0; i < newChildren.length; i++) {
        let child = newChildren[i];
        el.appendChild(createElm(child));
    }
}



function updateChildren(el, oldChildren, newChildren) {
    //我们操作列表，经常会有push、pop、shift、unshift、reverse、sort
    //vue2.0中采用双指针的方式比较，两个节点。
    //比较两个节点，增强性能优化。
    let oldStartIndex = 0;
    let newStartIndex = 0;
    let oldEndIndex = oldChildren.length - 1;
    let newEndIndex = newChildren.length - 1;

    let oldStartNode = oldChildren[oldStartIndex];
    let newStartNode = newChildren[newStartIndex];
    let oldEndNode = oldChildren[oldEndIndex];
    let newEndNode = newChildren[newEndIndex];

    function makeIndexByKey(children) {
        let map = {};
        children.forEach((child, index) => {
            map[child.key] = index;
        });
        return map;
    }
    let map = makeIndexByKey(oldChildren);

    while (oldStartIndex <= oldEndIndex && newStartIndex <= newEndIndex) {
        if (!oldStartNode) {
            oldStartNode = oldChildren[++oldStartIndex];
        } else if (!oldEndNode) {
            oldEndNode = oldChildren[--oldEndIndex];
        } else if (isSameVnode(oldStartNode, newStartNode)) {
            patchVNode(oldStartNode, newStartNode);
            oldStartNode = oldChildren[++oldStartIndex];
            newStartNode = newChildren[++newStartIndex];
            //比较开头节点
        } else if (isSameVnode(oldEndNode, newEndNode)) {
            patchVNode(oldEndNode, newEndNode);
            oldEndNode = oldChildren[--oldEndIndex];
            newEndNode = newChildren[--newEndIndex];
            //比较尾部节点
        } else if (isSameVnode(oldEndNode, newStartNode)) {//交叉比对
            patchVNode(oldEndNode, newStartNode);
            //insertBefore具有移动性，会将原来的元素移动走
            el.insertBefore(oldEndNode.el, oldStartNode.el);//将老的尾部移动到老的前面去
            oldEndNode = oldChildren[--oldEndIndex];
            newStartNode = newChildren[++newStartIndex];
        } else if (isSameVnode(oldStartNode, newEndNode)) {
            patchVNode(oldStartNode, newEndNode);
            el.insertBefore(oldStartNode.el, oldEndNode.el.nextSibling);
            oldStartNode = oldChildren[++oldStartIndex];
            newEndNode = newChildren[--newEndIndex];
        } else {
            //在给动态列表添加key的时候，尽量避免用索引，因为索引前后都是从0开始，可能会发生错误复用。
            //乱序对比，根据老的列表做一个映射关系，用新的去找，找到则移动，找不到则添加，多余的则删除
            let moveIndex = map[newStartNode.key]; //如果拿到则说明是我要移动的索引
            if (moveIndex !== undefined) {
                let moveNode = oldChildren[moveIndex]; //找到虚拟节点，复用
                el.insertBefore(moveNode.el, oldStartNode.el);
                oldChildren[moveIndex] = undefined; //表示这个节点已经移动走了
                patchVNode(moveNode, newStartNode);
            } else {
                el.insertBefore(createElm(newStartNode), oldStartNode.el);
            }
            newStartNode = newChildren[++newStartIndex];
        }

    }
    if (newStartIndex <= newEndIndex) { //新的多余的节点就插进去
        for (let i = newStartIndex; i <= newEndIndex; i++) {
            let childEl = createElm(newChildren[i]);
            let anchor = newChildren[newEndIndex + 1] ? newChildren[newEndIndex + 1].el : null;
            el.insertBefore(childEl, anchor);
        }
    }
    if (oldStartIndex <= oldEndIndex) { //老的多余的就删除
        for (let i = oldStartIndex; i <= oldEndIndex; i++) {
            if (oldChildren[i]) {
                let childEl = oldChildren[i].el;
                el.removeChild(childEl);
            }
        }
    }
}