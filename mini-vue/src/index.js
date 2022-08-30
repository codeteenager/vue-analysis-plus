import { initGlobalAPI } from "./globalAPI";
import { initMixin } from "./init";
import { initLifeCycle } from "./lifecycle";
import { nextTick } from "./observe/watcher";

/**
 * 用户的选项
 * @param {*} options 
 */
function Vue(options) {
    this._init(options);
}

Vue.prototype.$nextTick = nextTick;

//扩展init方法
initMixin(Vue);
initLifeCycle(Vue);
initGlobalAPI(Vue);


export default Vue;