import { initGlobalAPI } from "./globalAPI";
import { initMixin } from "./init";
import { initLifeCycle } from "./lifecycle";
import { initStateMixin } from "./state";

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

export default Vue;