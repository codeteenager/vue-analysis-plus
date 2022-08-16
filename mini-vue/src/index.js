import { initMixin } from "./init";
/**
 * 用户的选项
 * @param {*} options 
 */
function Vue(options) {
    this._init(options);
}

//扩展init方法
initMixin(Vue);

export default Vue;