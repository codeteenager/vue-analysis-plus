(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.Vue = factory());
})(this, (function () { 'use strict';

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

      console.log(root);
      return root;
    }

    function compileToFunction(template) {
      parseHTML(template);
    }

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

        return result;
      };
    });

    var Observer = /*#__PURE__*/function () {
      function Observer(data) {
        _classCallCheck(this, Observer);

        //如果data有__ob__属性，则说明数据被检测过
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

    function defineReactive(target, key, value) {
      observe(value);
      Object.defineProperty(target, key, {
        get: function get() {
          return value;
        },
        set: function set() {
          var newValue = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : value;
          if (newValue == value) return;
          observe(newValue);
          value = newValue;
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
        vm.$options = options; //将用户的选项挂载到实例上
        //初始化状态

        initState(vm);

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

    return Vue;

}));
//# sourceMappingURL=vue.js.map
