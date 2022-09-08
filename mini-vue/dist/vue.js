(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.Vue = factory());
})(this, (function () { 'use strict';

  function _typeof(obj) {
    "@babel/helpers - typeof";

    return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) {
      return typeof obj;
    } : function (obj) {
      return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
    }, _typeof(obj);
  }

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  function _defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  function _createClass(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties(Constructor, staticProps);
    Object.defineProperty(Constructor, "prototype", {
      writable: false
    });
    return Constructor;
  }

  function _slicedToArray(arr, i) {
    return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest();
  }

  function _arrayWithHoles(arr) {
    if (Array.isArray(arr)) return arr;
  }

  function _iterableToArrayLimit(arr, i) {
    var _i = arr == null ? null : typeof Symbol !== "undefined" && arr[Symbol.iterator] || arr["@@iterator"];

    if (_i == null) return;
    var _arr = [];
    var _n = true;
    var _d = false;

    var _s, _e;

    try {
      for (_i = _i.call(arr); !(_n = (_s = _i.next()).done); _n = true) {
        _arr.push(_s.value);

        if (i && _arr.length === i) break;
      }
    } catch (err) {
      _d = true;
      _e = err;
    } finally {
      try {
        if (!_n && _i["return"] != null) _i["return"]();
      } finally {
        if (_d) throw _e;
      }
    }

    return _arr;
  }

  function _unsupportedIterableToArray(o, minLen) {
    if (!o) return;
    if (typeof o === "string") return _arrayLikeToArray(o, minLen);
    var n = Object.prototype.toString.call(o).slice(8, -1);
    if (n === "Object" && o.constructor) n = o.constructor.name;
    if (n === "Map" || n === "Set") return Array.from(o);
    if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);
  }

  function _arrayLikeToArray(arr, len) {
    if (len == null || len > arr.length) len = arr.length;

    for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i];

    return arr2;
  }

  function _nonIterableRest() {
    throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
  }

  var ncname = "[a-zA-Z_][\\-\\.0-9_a-zA-Z]*";
  var qnameCapture = "((?:" + ncname + "\\:)?" + ncname + ")";
  var startTagOpen = new RegExp("^<" + qnameCapture);
  var startTagClose = /^\s*(\/?)>/;
  var endTag = new RegExp("^<\\/" + qnameCapture + "[^>]*>");
  var attribute = /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/;
  function parseHTML(html) {
    var ELEMENT_TYPE = 1;
    var TEXT_TYPE = 3;
    var stack = []; //用于存放元素

    var currentParent; //指向的是栈中的最后一个

    var root; //截取字符串

    function advance(n) {
      html = html.substring(n);
    } //最终转换成抽象语法树


    function createAstElement(tag, attrs) {
      return {
        tag: tag,
        type: ELEMENT_TYPE,
        children: [],
        attrs: attrs,
        parent: null
      };
    }

    function start(tag, attrs) {
      var node = createAstElement(tag, attrs); //创造一个ast节点

      if (!root) {
        //看一下是否为空树
        root = node; //如果为空则当前是树的根节点
      }

      if (currentParent) {
        node.parent = currentParent;
        currentParent.children.push(node);
      }

      stack.push(node);
      currentParent = node; //currentParent为栈中最后一个
    }

    function chars(text) {
      text = text.replace(/\s/g, '');
      text && currentParent.children.push({
        //将文本存放在当前指向的节点
        type: TEXT_TYPE,
        text: text,
        parent: currentParent
      });
    }

    function end(tag) {
      stack.pop(); //弹出最后一个

      currentParent = stack[stack.length - 1];
    }

    function parseStartTag() {
      var start = html.match(startTagOpen);

      if (start) {
        var match = {
          tagName: start[1],
          attrs: []
        };
        advance(start[0].length); //如果不是开始标签的结束，就一直匹配下去

        var attr, _end;

        while (!(_end = html.match(startTagClose)) && (attr = html.match(attribute))) {
          advance(attr[0].length);
          match.attrs.push({
            name: attr[1],
            value: attr[3] || attr[4] || attr[5] || true
          });
        }

        if (_end) {
          advance(_end[0].length);
        }

        return match;
      }

      return false;
    }

    while (html) {
      var textEnd = html.indexOf('<'); //为0说明是开始标签或者结束标签

      if (textEnd == 0) {
        var startTagMatch = parseStartTag();

        if (startTagMatch) {
          start(startTagMatch.tagName, startTagMatch.attrs);
          continue;
        }

        var endTagMatch = html.match(endTag);

        if (endTagMatch) {
          advance(endTagMatch[0].length);
          end(endTagMatch[1]);
          continue;
        }

        break;
      }

      if (textEnd > 0) {
        var text = html.substring(0, textEnd);

        if (text) {
          chars(text);
          advance(text.length);
        }
      }
    }

    return root;
  }

  function genProps(attrs) {
    var str = ''; //{name,value}

    for (var i = 0; i < attrs.length; i++) {
      var attr = attrs[i];

      if (attr.name == "style") {
        (function () {
          var obj = {}; //color:red => {color:'red'}

          attr.value.split(';').forEach(function (item) {
            var _item$split = item.split(':'),
                _item$split2 = _slicedToArray(_item$split, 2),
                key = _item$split2[0],
                value = _item$split2[1];

            obj[key] = value;
          });
          attr.value = obj;
        })();
      }

      str += "".concat(attr.name, ":").concat(JSON.stringify(attr.value), ",");
    }

    return "{".concat(str.slice(0, -1), "}");
  }

  var defaultTagRE = /\{\{((?:.|\r?\n)+?)\}\}/g;

  function gen(node) {
    if (node.type === 1) {
      //如果节点为元素
      return codegen(node);
    } else {
      //文本
      var text = node.text;

      if (!defaultTagRE.test(text)) {
        return "_v(".concat(JSON.stringify(text), ")");
      } else {
        var tokens = [];
        var match;
        defaultTagRE.lastIndex = 0;
        var lastIndex = 0;

        while (match = defaultTagRE.exec(text)) {
          var index = match.index;

          if (index > lastIndex) {
            tokens.push(JSON.stringify(text.slice(lastIndex, index)));
          }

          tokens.push("_s(".concat(match[1].trim(), ")"));
          lastIndex = index + match[0].length;
        }

        if (lastIndex < text.length) {
          tokens.push(JSON.stringify(text.slice(lastIndex)));
        }

        return "_v(".concat(tokens.join('+'), ")");
      }
    }
  }

  function genChildren(el) {
    var children = el.children;

    if (children) {
      return children.map(function (child) {
        return gen(child);
      }).join(',');
    }
  }

  function codegen(ast) {
    var children = genChildren(ast);
    var code = "_c('".concat(ast.tag, "',").concat(ast.attrs.length > 0 ? genProps(ast.attrs) : 'null').concat(ast.children.length > 0 ? ",".concat(children) : '', ")");
    return code;
  }

  function compileToFunction(template) {
    //将模板转换成ast语法树
    var ast = parseHTML(template); //生成render方法{render方法返回的结果就是虚拟dom}
    //模板引擎的实现原理就是with + new Function

    var code = codegen(ast);
    code = "with(this){return ".concat(code, "}");
    var render = new Function(code);
    return render;
  }

  //静态方法
  var starts = {};
  var LIFECYCLE = ['beforeCreated', 'created'];
  LIFECYCLE.forEach(function (hook) {
    starts[hook] = function (p, c) {
      if (c) {
        if (p) {
          return p.concat(c);
        } else {
          return [c];
        }
      } else {
        return p;
      }
    };
  });
  function mergeOptions(parent, child) {
    var options = {};

    for (var key in parent) {
      mergeField(key);
    }

    for (var _key in child) {
      if (!parent.hasOwnProperty(_key)) {
        mergeField(_key);
      }
    }

    function mergeField(key) {
      //用策略模式减少if else
      if (starts[key]) {
        options[key] = starts[key](parent[key], child[key]);
      } else {
        options[key] = child[key] || parent[key];
      }
    }

    return options;
  }

  function initGlobalAPI(Vue) {
    Vue.options = {};

    Vue.mixin = function (options) {
      //将用户的选项与全局进行合并
      this.options = mergeOptions(this.options, options);
      return this;
    };
  }

  var oldArrayProto = Array.prototype;
  var newArrayProto = Object.create(oldArrayProto);
  var methods = ["pop", "push", "shift", "unshift", "sort", "reverse", "splice"]; //concat、slice不会改变原数组

  methods.forEach(function (method) {
    newArrayProto[method] = function () {
      var _oldArrayProto$method;

      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      //函数劫持
      var result = (_oldArrayProto$method = oldArrayProto[method]).call.apply(_oldArrayProto$method, [this].concat(args)); //对新增的数组再次进行劫持


      var inserted;
      var ob = this.__ob__;

      switch (method) {
        case "push":
        case "unshift":
          inserted = args;
          break;

        case "splice":
          inserted = args.slice(2);
          break;
      }

      if (inserted) {
        //对新增的内容再次进行观测
        ob.observeArray(inserted);
      }

      ob.dep.notify(); //数组变化了，通知对应watcher实现更新逻辑

      return result;
    };
  });

  var id$1 = 0;

  var Dep = /*#__PURE__*/function () {
    function Dep() {
      _classCallCheck(this, Dep);

      this.id = id$1++; //属性的dep要收集watcher

      this.subs = [];
    }

    _createClass(Dep, [{
      key: "depend",
      value: function depend() {
        //这里不放重复的watcher，
        Dep.target.addDep(this);
      } //添加watcher

    }, {
      key: "addSub",
      value: function addSub(watcher) {
        this.subs.push(watcher);
      } //通知更新

    }, {
      key: "notify",
      value: function notify() {
        this.subs.forEach(function (watcher) {
          return watcher.update();
        });
      }
    }]);

    return Dep;
  }();

  Dep.target = null;

  var Observer = /*#__PURE__*/function () {
    function Observer(data) {
      _classCallCheck(this, Observer);

      //给每个对象进行依赖收集
      this.dep = new Dep(); //如果data有__ob__属性，则说明数据被检测过

      Object.defineProperty(data, "__ob__", {
        value: this,
        enumerable: false
      }); //Object.defineProperty只能劫持已经存在的属性

      if (Array.isArray(data)) {
        //重写数组的push等方法
        data.__proto__ = newArrayProto; //如果数组中是对象则可以去监听

        this.observeArray(data);
      } else {
        this.walk(data);
      }
    }
    /**
     * 循环对象，对属性依次劫持
     * @param {*} data 
     */


    _createClass(Observer, [{
      key: "walk",
      value: function walk(data) {
        Object.keys(data).forEach(function (key) {
          return defineReactive(data, key, data[key]);
        });
      }
    }, {
      key: "observeArray",
      value: function observeArray(data) {
        data.forEach(function (item) {
          return observe(item);
        });
      }
    }]);

    return Observer;
  }();

  function dependArray(value) {
    for (var i = 0; i < value.length; i++) {
      var current = value[i];
      current.__ob__ && current.__ob__.dep.depend();

      if (Array.isArray(current)) {
        dependArray(current);
      }
    }
  }

  function defineReactive(target, key, value) {
    var childOb = observe(value);
    var dep = new Dep(); //每个属性都有一个Dep

    Object.defineProperty(target, key, {
      get: function get() {
        if (Dep.target) {
          dep.depend(); //让属性的收集器记住watcher

          if (childOb) {
            childOb.dep.depend();

            if (Array.isArray(value)) {
              dependArray(value);
            }
          }
        }

        return value;
      },
      set: function set() {
        var newValue = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : value;
        if (newValue == value) return;
        observe(newValue);
        value = newValue;
        dep.notify();
      }
    });
  }
  function observe(data) {
    if (_typeof(data) != "object" || data == null) {
      return;
    }

    if (data.__ob__ instanceof Observer) {
      return data.__ob__;
    }

    return new Observer(data);
  }

  var id = 0; //1)当我们创建watcher的时候会把当前渲染watcher放到Dep.target上
  //2)调用_render便取值，走到get上
  //每个属性有一个dep（属性就是被观察者），watcher就是观察者（属性变化了通知观察者来更新），观察者模式

  var Watcher = /*#__PURE__*/function () {
    //不同的组件有不同的Watcher，目前只有渲染根实例
    function Watcher(vm, fn, options) {
      _classCallCheck(this, Watcher);

      this.id = id++;
      this.renderWatcher = options; //是一个渲染Watcher

      this.getter = fn; //getter意味着调用这个函数可以发生取值操作

      this.deps = []; //后续我们实现计算属性，和组件清理工作

      this.depsId = new Set();
      this.get();
    }

    _createClass(Watcher, [{
      key: "addDep",
      value: function addDep(dep) {
        //一个组件对应多个属性，重复的也不用记录
        var id = dep.id;

        if (!this.depsId.has(dep.id)) {
          this.deps.push(dep);
          this.depsId.add(id);
          dep.addSub(this); //watcher记住了dep而且去重了，此时让dep记住watcher
        }
      }
    }, {
      key: "update",
      value: function update() {
        queneWatcher(this);
      }
    }, {
      key: "run",
      value: function run() {
        this.get();
      }
    }, {
      key: "get",
      value: function get() {
        Dep.target = this; //静态属性只有一份

        this.getter(); //会从vm取值

        Dep.target = null; //渲染完之后清空
      }
    }]);

    return Watcher;
  }();

  var quene = [];
  var has = {};
  var pending = false; //防抖

  function flushScheduleQuene() {
    var flushQuene = quene.slice(0);
    quene = [];
    has = {};
    pending = false;
    flushQuene.forEach(function (q) {
      return q.run();
    });
  }

  function queneWatcher(watcher) {
    var id = watcher.id;

    if (!has[id]) {
      quene.push(watcher);
      has[id] = true; //不管update执行多少次，最终只执行一次刷新操作

      if (!pending) {
        nextTick(flushScheduleQuene);
        pending = true;
      }
    }
  }

  var callbacks = [];
  var waiting = false;

  function flushCallbacks() {
    waiting = false;
    var cbs = callbacks.slice(0);
    callbacks = [];
    cbs.forEach(function (cb) {
      return cb();
    }); //按照顺序依次执行
  } //nextTick没有直接使用某个api，而是先用promise（ie不兼容）， MutationObserver(h5的api)，可以考虑ie专享的setImmediate setTimeout


  var timeFunc;

  if (Promise) {
    timeFunc = function timeFunc() {
      Promise.resolve().then(flushCallbacks);
    };
  } else if (MutationObserver) {
    var observer = new MutationObserver(flushCallbacks);
    var textNode = document.createTextNode(1);
    observer.observe(textNode, {
      characterData: true
    });

    timeFunc = function timeFunc() {
      textNode.textContent = 2;
    };
  } else if (setImmeidate) {
    timeFunc = function timeFunc() {
      setImmeidate(flushCallbacks);
    };
  } else {
    timeFunc = function timeFunc() {
      setTimeout(flushCallbacks);
    };
  }

  function nextTick(cb) {
    callbacks.push(cb);

    if (!waiting) {
      timeFunc();
      waiting = true;
    }
  }

  function initState(vm) {
    var opts = vm.$options;

    if (opts.data) {
      initData(vm);
    }
  }

  function proxy(vm, target, key) {
    Object.defineProperty(vm, key, {
      get: function get() {
        return vm[target][key];
      },
      set: function set(newValue) {
        vm[target][key] = newValue;
      }
    });
  }

  function initData(vm) {
    var data = vm.$options.data;
    data = typeof data == "function" ? data.call(this) : data;
    vm._data = data;
    observe(data);

    for (var key in data) {
      proxy(vm, "_data", key);
    }
  }

  function initStateMixin(Vue) {
    Vue.prototype.$nextTick = nextTick;

    Vue.prototype.$watch = function (exportOrFn, cb) {//new Watcher(this,exportOrFn,{user:true},cb);
    };
  }

  //_c
  function createElementVNode(vm, tag, data) {
    if (data === null) {
      data = {};
    }

    var key = data.key;

    if (key) {
      delete data.key;
    }

    for (var _len = arguments.length, children = new Array(_len > 3 ? _len - 3 : 0), _key = 3; _key < _len; _key++) {
      children[_key - 3] = arguments[_key];
    }

    return vnode(vm, tag, key, data, children);
  } //_v

  function createTextVNode(vm, text) {
    return vnode(vm, undefined, undefined, undefined, undefined, text);
  }

  function vnode(vm, tag, key, data, children, text) {
    return {
      vm: vm,
      tag: tag,
      key: key,
      data: data,
      children: children,
      text: text
    };
  }

  function isSameVnode(vnode1, vnode2) {
    return vnode1.tag == vnode2.tag && vnode1.key == vnode2.key;
  }

  function createElm(vnode) {
    var tag = vnode.tag,
        data = vnode.data,
        children = vnode.children,
        text = vnode.text;

    if (typeof tag == 'string') {
      vnode.el = document.createElement(tag);
      patchProps(vnode.el, {}, data);
      children.forEach(function (child) {
        vnode.el.appendChild(createElm(child));
      });
    } else {
      vnode.el = document.createTextNode(text);
    }

    return vnode.el;
  }
  function patchProps(el, oldProps, props) {
    //老的属性中有style中的元素，新的属性中没有，要删除老的
    var oldStyles = oldProps.style || {};
    var newStyles = props.style || {};

    for (var key in oldStyles) {
      if (!newStyles[key]) {
        el.style[key] = '';
      }
    } //新的属性没有老的属性，则删除老的属性


    for (var _key in oldProps) {
      if (!oldProps[_key]) {
        el.removeAttribute(_key);
      }
    }

    for (var _key2 in props) {
      //用新的覆盖老的
      if (_key2 === 'style') {
        for (var styleName in props.style) {
          el.style[styleName] = props.style[styleName];
        }
      } else {
        el.setAttribute(_key2, props[_key2]);
      }
    }
  }
  function patch(oldNode, vnode) {
    var isRealElement = oldNode.nodeType;

    if (isRealElement) {
      var elm = oldNode;
      var parentElm = elm.parentNode; //拿到父元素

      var newElm = createElm(vnode);
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
      var _el = createElm(vnode);

      oldVNode.el.parentNode.replaceChild(_el, oldVNode.el);
      return _el;
    } //文本的话，比较一下文本的内容


    var el = vnode.el = oldVNode.el; //复用老节点的元素

    if (!oldVNode.tag) {
      if (oldVNode.text !== vnode.text) {
        oldVNode.el.textContent = vnode.text; //用新的文本覆盖老的
      }
    } //是标签需要比对标签的属性


    patchProps(el, oldVNode.data, vnode.data); //比较儿子节点，一方有儿子，一方没儿子，或者两者都有儿子

    var oldChildren = oldVNode.children || [];
    var newChildren = vnode.children || [];

    if (oldChildren.length > 0 && newChildren.length > 0) {
      //完整的diff算法比较两个儿子
      updateChildren(el, oldChildren, newChildren);
    } else if (newChildren.length > 0) {
      //没有老的有新的
      mountChildren(el, newChildren);
    } else if (oldChildren.length > 0) {
      //新的没有有老的要删除
      el.innerHTML = '';
    }

    return el;
  }

  function mountChildren(el, newChildren) {
    for (var i = 0; i < newChildren.length; i++) {
      var child = newChildren[i];
      el.appendChild(createElm(child));
    }
  }

  function updateChildren(el, oldChildren, newChildren) {
    //我们操作列表，经常会有push、pop、shift、unshift、reverse、sort
    //vue2.0中采用双指针的方式比较，两个节点。
    //比较两个节点，增强性能优化。
    var oldStartIndex = 0;
    var newStartIndex = 0;
    var oldEndIndex = oldChildren.length - 1;
    var newEndIndex = newChildren.length - 1;
    oldChildren[oldStartIndex];
    newChildren[newStartIndex];
    oldChildren[oldEndIndex];
    newChildren[newEndIndex];
  }

  function initLifeCycle(Vue) {
    Vue.prototype._update = function (vnode) {
      //将vnode转换成真实dom
      var vm = this;
      var el = vm.$el; //patch既有初始化功能，也有更新的功能。

      vm.$el = patch(el, vnode);
    };

    Vue.prototype._v = function () {
      return createTextVNode.apply(void 0, [this].concat(Array.prototype.slice.call(arguments)));
    };

    Vue.prototype._c = function () {
      return createElementVNode.apply(void 0, [this].concat(Array.prototype.slice.call(arguments)));
    };

    Vue.prototype._s = function (value) {
      if (_typeof(value) != 'object') return value;
      return JSON.stringify(value);
    };

    Vue.prototype._render = function () {
      var vm = this;
      return vm.$options.render.call(vm);
    };
  }
  function mountComponent(vm, el) {
    vm.$el = el; //1、调用render方法产生虚拟节点，虚拟dom

    var updateComponent = function updateComponent() {
      vm._update(vm._render());
    };

    new Watcher(vm, updateComponent, true); //2、根据虚拟dom生成真实dom
    //3、插入el元素
  }
  function callHook(vm, hook) {
    var handlers = vm.$options[hook];

    if (handlers) {
      handlers.forEach(function (handler) {
        return handler.call(vm);
      });
    }
  }

  /**
   * 给Vue添加init方法
   * @param {*} Vue 
   */

  function initMixin(Vue) {
    /**
     * 用于初始化操作
     */
    Vue.prototype._init = function (options) {
      var vm = this;
      vm.$options = mergeOptions(this.constructor.options, options); //将用户的选项挂载到实例上

      callHook(vm, 'beforeCreated'); //初始化状态

      initState(vm);
      callHook(vm, 'created');

      if (options.el) {
        vm.$mount(options.el);
      }
    };

    Vue.prototype.$mount = function (el) {
      var vm = this;
      el = document.querySelector(el);
      var ops = vm.$options;

      if (!ops.render) {
        var template;

        if (!ops.template && el) {
          template = el.outerHTML;
        } else {
          if (el) {
            template = ops.template;
          }
        } //如果写了template，就用template


        if (template) {
          //对模板进行编译
          var render = compileToFunction(template);
          ops.render = render;
        }
      }

      mountComponent(vm, el); //组件的挂载
    };
  }

  /**
   * 用户的选项
   * @param {*} options 
   */

  function Vue(options) {
    this._init(options);
  } //扩展init方法


  initMixin(Vue);
  initLifeCycle(Vue); //vm._update,vm._render

  initGlobalAPI(Vue); //全局api的实现

  initStateMixin(Vue); //实现了nextTick、$watch

  var render1 = compileToFunction('<div style="background-color:yellow;">{{name}}</div>');
  var vm1 = new Vue({
    data: {
      name: 1
    }
  });
  var prevVnode1 = render1.call(vm1);
  var el = createElm(prevVnode1);
  document.body.appendChild(el);
  var render2 = compileToFunction('<span style="background-color:red;">{{name}}</span>');
  var vm2 = new Vue({
    data: {
      name: 2
    }
  });
  var prevVnode2 = render2.call(vm2);
  setTimeout(function () {
    patch(prevVnode1, prevVnode2);
  }, 1000);

  return Vue;

}));
//# sourceMappingURL=vue.js.map
