(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('react')) :
	typeof define === 'function' && define.amd ? define(['exports', 'react'], factory) :
	(factory((global.xaret = {}),global.React));
}(this, (function (exports,React) { 'use strict';

var commonjsGlobal = typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};



function unwrapExports (x) {
	return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
}

function createCommonjsModule(fn, module) {
	return module = { exports: {} }, fn(module, module.exports), module.exports;
}

var ponyfill = createCommonjsModule(function (module, exports) {
	'use strict';

	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	exports['default'] = symbolObservablePonyfill;
	function symbolObservablePonyfill(root) {
		var result;
		var _Symbol = root.Symbol;

		if (typeof _Symbol === 'function') {
			if (_Symbol.observable) {
				result = _Symbol.observable;
			} else {
				result = _Symbol('observable');
				_Symbol.observable = result;
			}
		} else {
			result = '@@observable';
		}

		return result;
	}
});

unwrapExports(ponyfill);

var lib = createCommonjsModule(function (module, exports) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });

  var _ponyfill2 = _interopRequireDefault(ponyfill);

  function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : { 'default': obj };
  }

  var root; /* global window */

  if (typeof self !== 'undefined') {
    root = self;
  } else if (typeof window !== 'undefined') {
    root = window;
  } else if (typeof commonjsGlobal !== 'undefined') {
    root = commonjsGlobal;
  } else {
    root = module;
  }

  var result = (0, _ponyfill2['default'])(root);
  exports['default'] = result;
});

unwrapExports(lib);

var symbolObservable$1 = lib;

'use strict';
const symbolObservable = symbolObservable$1.default;

var isObservable = fn => Boolean(fn && fn[symbolObservable]);

var _require = require('infestines');
var array0 = _require.array0;
var dissocPartialU = _require.dissocPartialU;
var inherit = _require.inherit;
var isArray = _require.isArray;
var isString = _require.isString;
var object0 = _require.object0;

var VALUE = 'value';
var ERROR = 'error';
var END = 'end';
var STYLE = 'style';
var CHILDREN = 'children';
var LIFT = 'xaret-lift';
var DD_REF = '$$ref';

var reactElement = React.createElement;
var Component$1 = React.Component;

function doSubscribe(self, props) {
  self.at = 0;
  self.doSubscribe(props);
  self.at = 1;
}

var LiftedComponent = /*#__PURE__*/inherit(function LiftedComponent(props) {
  Component$1.call(this, props);
  this.at = 0;
}, Component$1, {
  componentWillReceiveProps: function componentWillReceiveProps(nextProps) {
    this.componentWillUnmount();
    doSubscribe(this, nextProps);
  },
  componentWillMount: function componentWillMount() {
    doSubscribe(this, this.props);
  }
});

var FromObservable = /*#__PURE__*/inherit(function FromObservable(props) {
  LiftedComponent.call(this, props);
  this.handlers = null;
  this.rendered = null;
}, LiftedComponent, {
  componentWillUnmount: function componentWillUnmount() {
    var handlder = isArray(this.handlers) ? this.hanlders.pop() : this.handlers;
    if (handlder) offAny1(handlder);
  },
  doSubscribe: function doSubscribe(_ref) {
    var _this = this;

    var observable = _ref.observable;

    if (isObservable(observable)) {
      var handler = function handler(e) {
        switch (e.type) {
          case VALUE:
            _this.rendered = e.value || null;
            _this.at && _this.forceUpdate();
            break;
          case ERROR:
            throw e.value;
          case END:
            _this.callback = null;
        }
      };
      this.hanlders = handler;
      onAny1(handler, observable);
    } else {
      this.rendered = observable || null;
    }
    this.at = 1;
  },
  render: function render() {
    return this.rendered;
  }
});

var fromObservable = function fromObservable(observable) {
  return reactElement(FromObservable, { observable: observable });
};

function renderChildren(children, self, values) {
  if (isObservable(children)) {
    return values[self.at++];
  } else if (isArray(children)) {
    var newChildren = children;
    for (var i = 0, n = children.length; i < n; ++i) {
      var childI = children[i];
      var newChildI = childI;
      if (isObservable(childI)) {
        newChildI = values[self.at++];
      } else if (isArray(childI)) {
        newChildI = renderChildren(childI, self, values);
      }
      if (newChildI !== childI) {
        if (newChildren === children) newChildren = children.slice(0);
        newChildren[i] = newChildI;
      }
    }
    return newChildren;
  } else {
    return children;
  }
}

function renderStyle(style, self, values) {
  var newStyle = null;
  for (var i in style) {
    var styleI = style[i];
    if (isObservable(styleI)) {
      if (!newStyle) {
        newStyle = {};
        for (var j in style) {
          if (j === i) break;
          newStyle[j] = style[j];
        }
      }
      newStyle[i] = values[self.at++];
    } else if (newStyle) {
      newStyle[i] = styleI;
    }
  }
  return newStyle || style;
}

function _render(self, values) {
  var props = self.props;

  var type = null;
  var newProps = null;
  var newChildren = null;

  self.at = 0;

  for (var key in props) {
    var val = props[key];
    if (CHILDREN === key) {
      newChildren = renderChildren(val, self, values);
    } else if ('$$type' === key) {
      type = props[key];
    } else if (DD_REF === key) {
      newProps = newProps || {};
      newProps.ref = isObservable(val) ? values[self.at++] : val;
    } else if (isObservable(val)) {
      newProps = newProps || {};
      newProps[key] = values[self.at++];
    } else if (STYLE === key) {
      newProps = newProps || {};
      newProps.style = renderStyle(val, self, values);
    } else {
      newProps = newProps || {};
      newProps[key] = val;
    }
  }

  return newChildren instanceof Array ? reactElement.apply(null, [type, newProps].concat(newChildren)) : null !== newChildren ? reactElement(type, newProps, newChildren) : reactElement(type, newProps);
}

//

function forEachInChildrenArray(children, extra, fn) {
  for (var i = 0, n = children.length; i < n; ++i) {
    var childI = children[i];
    if (isObservable(childI)) fn(extra, childI);else if (isArray(childI)) forEachInChildrenArray(childI, extra, fn);
  }
}

function forEachInProps(props, extra, fn) {
  for (var key in props) {
    var val = props[key];
    if (isObservable(val)) {
      fn(extra, val);
    } else if (CHILDREN === key) {
      if (isArray(val)) forEachInChildrenArray(val, extra, fn);
    } else if (STYLE === key) {
      for (var k in val) {
        var valK = val[k];
        if (isObservable(valK)) fn(extra, valK);
      }
    }
  }
}

//

function incValues(self) {
  self.values += 1;
}

function wrapHandler(handler, type) {
  return function (value) {
    return handler({ type: type, value: value });
  };
}
function offAny1(handler) {
  handler.subscription.unsubscribe();
}
function offAny(handlers, obs) {
  var handler = handlers.pop();
  if (handler) offAny1(handler, obs);
}
function onAny1(handler, obs) {
  var subs = obs.subscribe({
    next: wrapHandler(handler, VALUE),
    error: wrapHandler(handler, ERROR),
    complete: wrapHandler(handler, END)
  });
  handler.subscription = subs;
}
function onAny(self, obs) {
  var handler = function handler(e) {
    var handlers = self.handlers;
    var idx = 0;
    while (handlers[idx] !== handler) {
      ++idx;
    }switch (e.type) {
      case VALUE:
        {
          var value = e.value;
          var values = self.values;
          if (values[idx] !== value) {
            values[idx] = value;
            self.at && self.forceUpdate();
          }
          break;
        }
      case ERROR:
        throw e.value;
      default:
        {
          handlers[idx] = null;
          var n = handlers.length;
          if (n !== self.values.length) return;
          for (var i = 0; i < n; ++i) {
            if (handlers[i]) return;
          }
          self.handlers = null;
        }
    }
  };
  self.handlers.push(handler);
  onAny1(handler, obs);
}

var FromClass = /*#__PURE__*/inherit(function FromClass(props) {
  LiftedComponent.call(this, props);
  this.values = this;
  this.handlers = null;
}, LiftedComponent, {
  componentWillUnmount: function componentWillUnmount() {
    var handlers = this.handlers;
    if (handlers instanceof Function) {
      forEachInProps(this.props, handlers, offAny1);
    } else if (handlers) {
      forEachInProps(this.props, handlers.reverse(), offAny);
    }
  },
  doSubscribe: function doSubscribe(props) {
    var _this2 = this;

    this.values = 0;
    forEachInProps(props, this, incValues);
    var n = this.values;

    switch (n) {
      case 0:
        this.values = array0;
        break;
      case 1:
        {
          this.values = this;
          forEachInProps(props, this.handlers = function (e) {
            switch (e.type) {
              case VALUE:
                {
                  var value = e.value;
                  if (_this2.values !== value) {
                    _this2.values = value;
                    _this2.at && _this2.forceUpdate();
                  }
                  break;
                }
              case ERROR:
                throw e.value;
              default:
                {
                  _this2.values = [_this2.values];
                  _this2.handlers = null;
                }
            }
          }, onAny1);
          break;
        }
      default:
        this.values = Array(n).fill(this);
        this.handlers = [];
        forEachInProps(props, this, onAny);
    }
  },
  render: function render() {
    if (this.handlers instanceof Function) {
      var value = this.values;
      if (value === this) return null;
      return _render(this, [value]);
    } else {
      var values = this.values;
      for (var i = 0, n = values.length; i < n; ++i) {
        if (values[i] === this) return null;
      }
      return _render(this, values);
    }
  }
});

function hasObsInChildrenArray(i, children) {
  for (var n = children.length; i < n; ++i) {
    var child = children[i];
    if (isObservable(child) || isArray(child) && hasObsInChildrenArray(0, child)) {
      return true;
    }
  }
  return false;
}

function hasObsInProps(props) {
  for (var key in props) {
    var val = props[key];
    if (isObservable(val)) {
      return true;
    } else if (CHILDREN === key) {
      if (isArray(val) && hasObsInChildrenArray(0, val)) return true;
    } else if (STYLE === key) {
      for (var k in val) {
        if (isObservable(val[k])) return true;
      }
    }
  }
  return false;
}

//

function filterProps(type, props) {
  var newProps = { '$$type': type };
  for (var key in props) {
    var val = props[key];
    if ('ref' === key) newProps[DD_REF] = val;else if (LIFT !== key) newProps[key] = val;
  }
  return newProps;
}

function createElement$1() {
  for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
    args[_key] = arguments[_key];
  }

  var type = args[0];
  var props = args[1] || object0;
  if (isString(type) || props[LIFT]) {
    if (hasObsInChildrenArray(2, args) || hasObsInProps(props)) {
      args[1] = filterProps(type, props);
      args[0] = FromClass;
    } else if (props[LIFT]) {
      args[1] = dissocPartialU(LIFT, props) || object0;
    }
  }
  return reactElement.apply(undefined, args);
}

var fromClass = function fromClass(Class) {
  return function (props) {
    return reactElement(FromClass, filterProps(Class, props));
  };
};

exports.fromObservable = fromObservable;
exports.createElement = createElement$1;
exports.fromClass = fromClass;

Object.defineProperty(exports, '__esModule', { value: true });

})));
