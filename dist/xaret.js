(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('react'), require('infestines')) :
	typeof define === 'function' && define.amd ? define(['exports', 'react', 'infestines'], factory) :
	(factory((global.xaret = {}),global.React,global.I));
}(this, (function (exports,React,infestines) { 'use strict';

var Rx = require('rxjs/Rx');
var STYLE = "style";
var CHILDREN = "children";
var LIFT = "xaret-lift";
var DD_REF = "$$ref";

var reactElement = React.createElement;
var Component$1 = React.Component;

var isObs = function isObs(x) {
    return x instanceof Rx.Observable;
};

var LiftedComponent = infestines.inherit(function LiftedComponent(props) {
    Component$1.call(this, props);
}, Component$1, {
    componentWillReceiveProps: function componentWillReceiveProps(nextProps) {
        this.componentWillUnmount();
        this.doSubscribe(nextProps);
    },
    componentWillMount: function componentWillMount() {
        this.doSubscribe(this.props);
    }
});

var FromRx = infestines.inherit(function FromRx(props) {
    LiftedComponent.call(this, props);
    this.callback = null;
    this.rendered = null;
}, LiftedComponent, {
    componentWillUnmount: function componentWillUnmount() {
        if (this.subscription) this.subscription.unsubscribe();
    },
    doSubscribe: function doSubscribe(_ref) {
        var _this = this;

        var observable = _ref.observable;

        if (isObs(observable)) {
            var next = function next(value) {
                _this.rendered = value || null;
                _this.forceUpdate();
            };
            var error = function error(err) {
                throw err;
            };
            var complete = function complete() {
                _this.subscription = null;
            };
            this.subscription = observable.subscribe(next, error, complete);
        } else {
            this.rendered = observable || null;
        }
    },
    render: function render() {
        return this.rendered;
    }
});

var fromRx = function fromRx(observable) {
    return reactElement(FromRx, { observable: observable });
};

function renderChildren(children, at, values) {
    if (isObs(children)) {
        return values[++at[0]];
    } else if (infestines.isArray(children)) {
        var newChildren = children;
        for (var i = 0, n = children.length; i < n; ++i) {
            var childI = children[i];
            var newChildI = childI;
            if (isObs(childI)) {
                newChildI = values[++at[0]];
            } else if (infestines.isArray(childI)) {
                newChildI = renderChildren(childI, at, values);
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

function renderStyle(style, at, values) {
    var newStyle = undefined;
    for (var i in style) {
        var styleI = style[i];
        if (isObs(styleI)) {
            if (!newStyle) {
                newStyle = {};
                for (var j in style) {
                    if (j === i) break;
                    newStyle[j] = style[j];
                }
            }
            newStyle[i] = values[++at[0]];
        } else if (newStyle) {
            newStyle[i] = styleI;
        }
    }
    return newStyle || style;
}

function _render(props, values) {
    var type = null;
    var newProps = null;
    var newChildren = null;

    var at = [-1];

    for (var key in props) {
        var val = props[key];
        if (CHILDREN === key) {
            newChildren = renderChildren(val, at, values);
        } else if ("$$type" === key) {
            type = props[key];
        } else if (DD_REF === key) {
            newProps = newProps || {};
            newProps.ref = isObs(val) ? values[++at[0]] : val;
        } else if (isObs(val)) {
            newProps = newProps || {};
            newProps[key] = values[++at[0]];
        } else if (STYLE === key) {
            newProps = newProps || {};
            newProps.style = renderStyle(val, at, values) || val;
        } else {
            newProps = newProps || {};
            newProps[key] = val;
        }
    }

    return newChildren instanceof Array ? reactElement.apply(null, [type, newProps].concat(newChildren)) : newChildren ? reactElement(type, newProps, newChildren) : reactElement(type, newProps);
}

function forEachInChildrenArray(children, extra, fn) {
    for (var i = 0, n = children.length; i < n; ++i) {
        var childI = children[i];
        if (isObs(childI)) fn(extra, childI);else if (infestines.isArray(childI)) forEachInChildrenArray(childI, extra, fn);
    }
}

function forEachInProps(props, extra, fn) {
    for (var key in props) {
        var val = props[key];
        if (isObs(val)) {
            fn(extra, val);
        } else if (CHILDREN === key) {
            if (infestines.isArray(val)) forEachInChildrenArray(val, extra, fn);
        } else if (STYLE === key) {
            for (var k in val) {
                var valK = val[k];
                if (isObs(valK)) fn(extra, valK);
            }
        }
    }
}

function incValues(self) {
    self.values += 1;
}

function onAny1(handler, obs) {
    handler.subscription = obs.subscribe(handler.next, handler.error, handler.complete);
}

function onAny(self, obs) {
    var handler = function handler() {
        var handlers = self.handlers;
        var idx = 0;
        while (handlers[idx] !== handler) {
            ++idx;
        } // Found the index of this handler/value
        var next = function next(value) {
            var values = self.values;
            if (values[idx] !== value) {
                values[idx] = value;
                self.forceUpdate();
            }
        };
        var error = function error(err) {
            throw err;
        };
        var complete = function complete() {
            handlers[idx] = null;
            var n = handlers.length;
            if (n !== self.values.length) return;
            for (var i = 0; i < n; ++i) {
                if (handlers[i]) return;
            }self.handlers = null;
        };
        handler.next = next;
        handler.error = error;
        handler.complete = complete;
    };
    self.handlers.push(handler);
    onAny1(handler, obs);
}

function unsub(handler) {
    if (handler.subscription) {
        handler.subscription.unsubscribe();
    }
}
var FromClass = infestines.inherit(function FromClass(props) {
    LiftedComponent.call(this, props);
    this.values = this;
    this.handlers = null;
}, LiftedComponent, {
    componentWillUnmount: function componentWillUnmount() {
        var handlers = this.handlers;
        if (handlers instanceof Function) {
            handlers.subscription.unsubscribe();
        } else if (handlers) {
            handlers.forEach(unsub);
        }
    },
    doSubscribe: function doSubscribe(props) {
        var _this2 = this;

        this.values = 0;
        forEachInProps(props, this, incValues);
        var n = this.values; // Here this.values contains the number of observable values. Later on, it'll contain the actual values.

        switch (n) {
            case 0:
                this.values = infestines.array0;
                break;
            case 1:
                {

                    this.values = this;
                    var handlers = function handlers() {};
                    var next = function next(value) {
                        if (_this2.values !== value) {
                            _this2.values = value;
                            _this2.forceUpdate();
                        }
                    };
                    var error = function error(err) {
                        throw err;
                    };
                    var complete = function complete() {
                        _this2.values = [_this2.values];
                        _this2.handlers = null;
                    };
                    handlers.next = next;
                    handlers.error = error;
                    handlers.complete = complete;
                    this.handlers = handlers;
                    forEachInProps(props, handlers, onAny1);
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
            return _render(this.props, [value]);
        } else {
            var values = this.values;
            for (var i = 0, n = values.length; i < n; ++i) {
                if (values[i] === this) return null;
            }return _render(this.props, values);
        }
    }
});

function hasObsInChildrenArray(i, children) {
    for (var n = children.length; i < n; ++i) {
        var child = children[i];
        if (isObs(child) || infestines.isArray(child) && hasObsInChildrenArray(0, child)) return true;
    }
    return false;
}

function hasObsInProps(props) {
    for (var key in props) {
        var val = props[key];
        if (isObs(val)) {
            return true;
        } else if (CHILDREN === key) {
            if (infestines.isArray(val) && hasObsInChildrenArray(0, val)) return true;
        } else if (STYLE === key) {
            for (var k in val) {
                if (isObs(val[k])) return true;
            }
        }
    }
    return false;
}

function filterProps(type, props) {
    var newProps = { "$$type": type };
    for (var key in props) {
        var val = props[key];
        if ("ref" === key) newProps[DD_REF] = val;else if (LIFT !== key) newProps[key] = val;
    }
    return newProps;
}

function createElement$1() {
    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
    }

    var type = args[0];
    var props = args[1] || infestines.object0;
    if (infestines.isString(type) || props[LIFT]) {
        if (hasObsInChildrenArray(2, args) || hasObsInProps(props)) {
            args[1] = filterProps(type, props);
            args[0] = FromClass;
        } else if (props[LIFT]) {
            args[1] = infestines.dissocPartialU(LIFT, props) || infestines.object0;
        }
    }
    return reactElement.apply(undefined, args);
}

var fromClass = function fromClass(Class) {
    return function (props) {
        return reactElement(FromClass, filterProps(Class, props));
    };
};

exports.fromRx = fromRx;
exports.createElement = createElement$1;
exports.fromClass = fromClass;

Object.defineProperty(exports, '__esModule', { value: true });

})));
