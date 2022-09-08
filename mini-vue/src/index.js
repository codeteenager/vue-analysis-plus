import { compileToFunction } from "./compiler/index";
import { initGlobalAPI } from "./globalAPI";
import { initMixin } from "./init";
import { initLifeCycle } from "./lifecycle";
import { initStateMixin } from "./state";
import { createElm, patch } from "./vdom/patch";

/**
 * 用户的选项
 * @param {*} options 
 */
function Vue(options) {
    this._init(options);
}


//扩展init方法
initMixin(Vue);
initLifeCycle(Vue); //vm._update,vm._render
initGlobalAPI(Vue); //全局api的实现
initStateMixin(Vue);   //实现了nextTick、$watch

let render1 = compileToFunction('<div style="background-color:yellow;">{{name}}</div>');
let vm1 = new Vue({ data: { name: 1 } });
let prevVnode1 = render1.call(vm1);

let el = createElm(prevVnode1);
document.body.appendChild(el);

let render2 = compileToFunction('<span style="background-color:red;">{{name}}</span>');
let vm2 = new Vue({ data: { name: 2 } });
let prevVnode2 = render2.call(vm2);

setTimeout(() => {
    patch(prevVnode1, prevVnode2);
}, 1000);


export default Vue;