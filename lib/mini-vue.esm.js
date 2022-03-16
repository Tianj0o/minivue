var extend = Object.assign;
var isObject = function (val) {
    return val !== null && typeof val === "object";
};
var hasOwn = function (val, key) {
    return Object.prototype.hasOwnProperty.call(val, key);
};
var camelize = function (str) {
    return str.replace(/-(\w)/g, function (_, c) {
        return c ? c.toUpperCase() : "";
    });
};
var capitalize = function (str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
};
var toHandlerKey = function (str) {
    return str ? "on".concat(capitalize(str)) : "";
};

var targetMap = new Map();
function trigger(target, key) {
    var effectMap = targetMap.get(target);
    var effectFns = effectMap.get(key);
    triggerEffects(effectFns);
}
function triggerEffects(effectFns) {
    effectFns.forEach(function (effect) {
        if (effect.scheduler) {
            effect.scheduler();
        }
        else {
            effect._fn();
        }
    });
}

var get = createGetter();
var set = createSetter();
var readonlyGet = createGetter(true);
var shallowReadonlyGet = createGetter(true, true);
function createGetter(isReadonly, isShllowReadonly) {
    if (isReadonly === void 0) { isReadonly = false; }
    if (isShllowReadonly === void 0) { isShllowReadonly = false; }
    return function get(target, key) {
        if (key === "__v_isReactive" /* IS_Reactive */) {
            return !isReadonly;
        }
        else if (key === "__v_isReadonly" /* IS_Readonly */) {
            return isReadonly;
        }
        var res = Reflect.get(target, key);
        if (isShllowReadonly) {
            return res;
        }
        if (isObject(res)) {
            return isReadonly ? readonly(res) : reactive(res);
        }
        return res;
    };
}
function createSetter() {
    return function set(target, key, value) {
        var res = Reflect.set(target, key, value);
        trigger(target, key);
        return res;
    };
}
var mutalbleHandlers = {
    get: get,
    set: set,
};
var readonlyHandlers = {
    get: readonlyGet,
    set: function (target, key) {
        console.warn("can not set a readonly obj", target, key);
        return true;
    },
};
var shallowReadonlyHandlers = extend({}, readonlyHandlers, {
    get: shallowReadonlyGet,
});

function reactive(obj) {
    return createActiveObject(obj, mutalbleHandlers);
}
function readonly(obj) {
    return createActiveObject(obj, readonlyHandlers);
}
function shallowReadonly(obj) {
    return createActiveObject(obj, shallowReadonlyHandlers);
}
function createActiveObject(obj, baseHandlers) {
    return new Proxy(obj, baseHandlers);
}

function emit(instance, event) {
    // console.log(event + "------");
    var args = [];
    for (var _i = 2; _i < arguments.length; _i++) {
        args[_i - 2] = arguments[_i];
    }
    var props = instance.props;
    // 1. add -> Add
    // 2 .add-foo -> addFoo
    var handlerName = toHandlerKey(camelize(event));
    // console.log(handlerName);
    var handle = props[handlerName];
    handle && handle.apply(void 0, args);
}

function initProps(instance, props) {
    instance.props = props || {};
}

var publicPropertiesMap = {
    $el: function (i) { return i.vnode.el; },
    $slots: function (i) { return i.slots; },
};
var publicInstanceProxyHandlers = {
    get: function (_a, key) {
        var instance = _a._;
        var setupState = instance.setupState;
        if (hasOwn(setupState, key)) {
            return setupState[key];
        }
        else if (hasOwn(instance.props, key)) {
            return instance.props[key];
        }
        var publicGetter = publicPropertiesMap[key];
        if (publicGetter) {
            return publicGetter(instance);
        }
    },
};

function initSlots(instance, children) {
    var vnode = instance.vnode;
    if (vnode.shapeFlag & 16 /* SLOT_CHILDREN */)
        normalizeObjectSlot(instance, children);
}
function normalizeObjectSlot(instance, children) {
    var slots = {};
    var _loop_1 = function (key) {
        var value = children[key];
        slots[key] = function (props) { return normalizeSlotValue(value(props)); };
    };
    for (var key in children) {
        _loop_1(key);
    }
    instance.slots = slots;
}
function normalizeSlotValue(value) {
    return Array.isArray(value) ? value : [value];
}

function createComponentInstance(vnode) {
    var component = {
        vnode: vnode,
        type: vnode.type,
        setupState: {},
        props: {},
        emit: function () { },
        slots: {},
    };
    component.emit = emit.bind(null, component);
    return component;
}
function setupComponent(instance) {
    initProps(instance, instance.vnode.props);
    initSlots(instance, instance.vnode.children);
    //初始化有状态的组件
    setupStatefulComponent(instance);
}
function setupStatefulComponent(instance) {
    //获取组件对象
    var Component = instance.type;
    // this ctx -> proxy
    instance.proxy = new Proxy({ _: instance }, publicInstanceProxyHandlers);
    var setup = Component.setup;
    if (setup) {
        //function || Object
        var setupResult = setup(shallowReadonly(instance.props), {
            emit: instance.emit,
        });
        handleSetupResult(instance, setupResult);
    }
}
function handleSetupResult(instance, setupResult) {
    if (typeof setupResult === "object") {
        instance.setupState = setupResult;
    }
    finishComponentSetup(instance);
}
function finishComponentSetup(instance) {
    var Component = instance.type;
    instance.render = Component.render;
}

function render(vnode, container) {
    patch(vnode, container);
}
function patch(vnode, container) {
    var shapeFlag = vnode.shapeFlag;
    //通过vnode.type 判断这个vnode是组件 还是 htmlElement
    if (shapeFlag & 1 /* ELEMENT */) {
        //处理元素
        processElement(vnode, container);
    }
    else if (shapeFlag & 2 /* STATEFUL_COMPONENT */) {
        //处理组件
        processComponent(vnode, container);
    }
}
function processElement(vnode, container) {
    mountElement(vnode, container);
}
function mountElement(vnode, container) {
    // vnode
    var el = (vnode.el = document.createElement(vnode.type));
    var children = vnode.children, shapeFlag = vnode.shapeFlag;
    if (shapeFlag & 4 /* TEXT_CHILDREN */) {
        el.textContent = vnode.children;
    }
    else if (shapeFlag & 8 /* ARRAY_CHILDREN */) {
        mountChildren(children, el);
    }
    //props {}
    var props = vnode.props;
    Object.keys(props).forEach(function (key) {
        var val = vnode.props[key];
        var isOn = function (key) { return /^on[A-Z]/.test(key); };
        if (isOn(key)) {
            var event_1 = key.slice(2).toLowerCase();
            el.addEventListener(event_1, val);
        }
        else {
            el.setAttribute(key, val);
        }
    });
    container.append(el);
}
function mountChildren(vnode, container) {
    vnode.forEach(function (v) {
        patch(v, container);
    });
}
function processComponent(vnode, container) {
    //挂载组件
    mountComponent(vnode, container);
}
function mountComponent(vnode, container) {
    // 创建组件实例
    var instance = createComponentInstance(vnode);
    // 初始化组件实例
    setupComponent(instance);
    // 调用Render函数
    setupRenderEffect(instance, vnode, container);
}
function setupRenderEffect(instance, vnode, container) {
    var subTree = instance.render.call(instance.proxy);
    patch(subTree, container);
    // 组件处理完成 后
    vnode.el = subTree.el;
}

function createVNode(type, props, children) {
    var vnode = {
        type: type,
        props: props,
        shapeFlag: getShapeFlag(type),
        children: children,
        el: null,
    };
    if (typeof children === "string") {
        vnode.shapeFlag = vnode.shapeFlag | 4 /* TEXT_CHILDREN */;
    }
    else if (Array.isArray(children)) {
        vnode.shapeFlag = vnode.shapeFlag | 8 /* ARRAY_CHILDREN */;
    }
    if (vnode.shapeFlag & 2 /* STATEFUL_COMPONENT */) {
        if (typeof vnode.children === "object") {
            vnode.shapeFlag |= 16 /* SLOT_CHILDREN */;
        }
    }
    return vnode;
}
var getShapeFlag = function (type) {
    return typeof type === "string"
        ? 1 /* ELEMENT */
        : 2 /* STATEFUL_COMPONENT */;
};

function createApp(rootComponent) {
    return {
        mount: function (rootContainer) {
            // 将组件 转换成vNode
            var vnode = createVNode(rootComponent);
            render(vnode, rootContainer);
        },
    };
}

function h(type, props, children) {
    return createVNode(type, props, children);
}

function renderSlots(slots, name, props) {
    var slot = slots[name];
    if (slot) {
        if (typeof slot === "function")
            return createVNode("div", {}, slot(props));
    }
}

export { createApp, h, renderSlots };
