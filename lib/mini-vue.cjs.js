'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

const Fragment = Symbol("Fragment");
const Text = Symbol("Text");
function createVNode(type, props, children) {
    const vnode = {
        type,
        props,
        shapeFlag: getShapeFlag(type),
        children,
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
function createTextVnode(children) {
    return createVNode(Text, {}, children);
}
const getShapeFlag = (type) => {
    return typeof type === "string"
        ? 1 /* ELEMENT */
        : 2 /* STATEFUL_COMPONENT */;
};

function h(type, props, children) {
    return createVNode(type, props, children);
}

function renderSlots(slots, name, props) {
    const slot = slots[name];
    if (slot) {
        if (typeof slot === "function")
            return createVNode(Fragment, {}, slot(props));
    }
}

const extend = Object.assign;
const ELEMENT_VALUE = {};
const isObject = (val) => {
    return val !== null && typeof val === "object";
};
const hasChange = (val, newVal) => {
    return !Object.is(val, newVal);
};
const hasOwn = (val, key) => Object.prototype.hasOwnProperty.call(val, key);
const camelize = (str) => {
    return str.replace(/-(\w)/g, (_, c) => {
        return c ? c.toUpperCase() : "";
    });
};
const capitalize = (str) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
};
const toHandlerKey = (str) => {
    return str ? `on${capitalize(str)}` : "";
};

let activeFn;
let shouldTrack;
class effectFn {
    constructor(fn, scheduler) {
        this.deps = [];
        this.active = true;
        this._fn = fn;
        this.scheduler = scheduler;
    }
    run() {
        if (!this.active) {
            return this._fn();
        }
        shouldTrack = true;
        activeFn = this;
        const res = this._fn();
        shouldTrack = false;
        return res;
    }
    stop() {
        if (this.active) {
            clearupEffect(this);
            if (this.onStop) {
                this.onStop();
            }
            this.active = false;
        }
    }
}
function isTracking() {
    return shouldTrack && activeFn !== undefined;
}
function clearupEffect(effect) {
    effect.deps.forEach((dep) => {
        dep.delete(effect);
    });
}
const targetMap = new Map();
function track(target, key) {
    if (!isTracking())
        return;
    let effectMap = targetMap.get(target);
    if (!effectMap) {
        effectMap = new Map();
        targetMap.set(target, effectMap);
    }
    let effectFnSet = effectMap.get(key);
    if (!effectFnSet) {
        effectFnSet = new Set();
        effectMap.set(key, effectFnSet);
    }
    trackEffects(effectFnSet);
}
function trackEffects(effectFnSet) {
    if (effectFnSet.has(activeFn))
        return;
    effectFnSet.add(activeFn);
    //给activeFn添加 收集到的set stop功能
    activeFn.deps.push(effectFnSet);
}
function trigger(target, key) {
    const effectMap = targetMap.get(target);
    const effectFns = effectMap.get(key);
    triggerEffects(effectFns);
}
function triggerEffects(effectFns) {
    effectFns.forEach((effect) => {
        if (effect.scheduler) {
            effect.scheduler();
        }
        else {
            effect.run();
        }
    });
}
const effect = function (fn, options = {}) {
    const effect = new effectFn(fn, options.scheduler);
    extend(effect, options);
    effect.run();
    const runner = effect.run.bind(effect);
    runner.effect = effect;
    return runner;
};

const get = createGetter();
const set = createSetter();
const readonlyGet = createGetter(true);
const shallowReadonlyGet = createGetter(true, true);
function createGetter(isReadonly = false, isShllowReadonly = false) {
    return function get(target, key) {
        if (key === "__v_isReactive" /* IS_Reactive */) {
            return !isReadonly;
        }
        else if (key === "__v_isReadonly" /* IS_Readonly */) {
            return isReadonly;
        }
        const res = Reflect.get(target, key);
        if (isShllowReadonly) {
            return res;
        }
        if (isObject(res)) {
            return isReadonly ? readonly(res) : reactive(res);
        }
        if (!isReadonly) {
            track(target, key);
        }
        return res;
    };
}
function createSetter() {
    return function set(target, key, value) {
        const res = Reflect.set(target, key, value);
        trigger(target, key);
        return res;
    };
}
const mutalbleHandlers = {
    get,
    set,
};
const readonlyHandlers = {
    get: readonlyGet,
    set: function (target, key) {
        console.warn("can not set a readonly obj", target, key);
        return true;
    },
};
const shallowReadonlyHandlers = extend({}, readonlyHandlers, {
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

class RefImpl {
    constructor(value) {
        //当value 为一个对象时 用reactive包裹
        this.__v_isRef = true;
        this._rawValue = value;
        this._value = convert(value);
        this.deps = new Set();
    }
    get value() {
        if (isTracking())
            trackEffects(this.deps);
        return this._value;
    }
    set value(newVal) {
        if (hasChange(this._rawValue, newVal)) {
            this._rawValue = newVal;
            this._value = convert(newVal);
            triggerEffects(this.deps);
        }
    }
}
function convert(value) {
    return isObject(value) ? reactive(value) : value;
}
function ref(val) {
    return new RefImpl(val);
}
function isRef(ref) {
    return !!ref.__v_isRef;
}
function unRef(ref) {
    return isRef(ref) ? ref.value : ref;
}
function proxyRefs(obj) {
    return new Proxy(obj, {
        get(target, key) {
            return unRef(Reflect.get(target, key));
        },
        set(target, key, value) {
            if (isRef(target[key]) && !isRef(value)) {
                return (target[key].value = value);
            }
            else {
                return Reflect.set(target, key, value);
            }
        },
    });
}

function emit(instance, event, ...args) {
    // console.log(event + "------");
    const { props } = instance;
    // 1. add -> Add
    // 2 .add-foo -> addFoo
    const handlerName = toHandlerKey(camelize(event));
    // console.log(handlerName);
    const handle = props[handlerName];
    handle && handle(...args);
}

function initProps(instance, props) {
    instance.props = props || {};
}

const publicPropertiesMap = {
    $el: (i) => i.vnode.el,
    $slots: (i) => i.slots,
};
const publicInstanceProxyHandlers = {
    get({ _: instance }, key) {
        const { setupState } = instance;
        if (hasOwn(setupState, key)) {
            return setupState[key];
        }
        else if (hasOwn(instance.props, key)) {
            return instance.props[key];
        }
        const publicGetter = publicPropertiesMap[key];
        if (publicGetter) {
            return publicGetter(instance);
        }
    },
};

function initSlots(instance, children) {
    const { vnode } = instance;
    if (vnode.shapeFlag & 16 /* SLOT_CHILDREN */)
        normalizeObjectSlot(instance, children);
}
function normalizeObjectSlot(instance, children) {
    const slots = {};
    for (const key in children) {
        const value = children[key];
        slots[key] = (props) => normalizeSlotValue(value(props));
    }
    instance.slots = slots;
}
function normalizeSlotValue(value) {
    return Array.isArray(value) ? value : [value];
}

function createComponentInstance(vnode, parent) {
    const component = {
        vnode,
        type: vnode.type,
        setupState: {},
        props: {},
        emit: () => { },
        slots: {},
        provides: parent ? parent.provides : {},
        parent,
        isMounted: false,
        subTree: {},
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
    const Component = instance.type;
    // this ctx -> proxy
    instance.proxy = new Proxy({ _: instance }, publicInstanceProxyHandlers);
    const { setup } = Component;
    if (setup) {
        //function || Object
        setCurrentInstance(instance);
        const setupResult = setup(shallowReadonly(instance.props), {
            emit: instance.emit,
        });
        setCurrentInstance(null);
        handleSetupResult(instance, setupResult);
    }
}
function handleSetupResult(instance, setupResult) {
    if (typeof setupResult === "object") {
        instance.setupState = proxyRefs(setupResult);
    }
    finishComponentSetup(instance);
}
function finishComponentSetup(instance) {
    const Component = instance.type;
    instance.render = Component.render;
}
let currentInstance;
function getCurrentInstance() {
    return currentInstance;
}
function setCurrentInstance(instance) {
    currentInstance = instance;
}

function provide(key, val) {
    const currentInstance = getCurrentInstance();
    if (currentInstance) {
        let { provides } = currentInstance;
        const parentProvides = currentInstance.parent && currentInstance.parent.provides;
        if (provides === parentProvides) {
            provides = currentInstance.provides = Object.create(parentProvides);
        }
        provides[key] = val;
    }
}
function inject(key, defaultValue) {
    const currentInstance = getCurrentInstance();
    if (currentInstance) {
        const parentProvides = currentInstance.parent.provides;
        if (key in parentProvides) {
            return parentProvides[key];
        }
        else if (defaultValue) {
            if (typeof defaultValue === "function") {
                return defaultValue();
            }
            return defaultValue;
        }
    }
}

function createAppAPI(render) {
    return function createApp(rootComponent) {
        return {
            mount(rootContainer) {
                // 将组件 转换成vNode
                const vnode = createVNode(rootComponent);
                render(vnode, rootContainer);
            },
        };
    };
}

function createRenderer(options) {
    const { createElement: hostCreateElement, patchProp: hostPatchProp, insert: hostInsert, remove: hostRemove, setElementText: hostsetElementText, } = options;
    function render(vnode, container) {
        patch(null, vnode, container, null);
    }
    function patch(n1, n2, container, parentComponent) {
        const { shapeFlag, type } = n2;
        switch (type) {
            case Fragment:
                processFragment(n1, n2, container, parentComponent);
                break;
            case Text:
                processText(n1, n2, container);
                break;
            default:
                if (shapeFlag & 1 /* ELEMENT */) {
                    //处理元素
                    processElement(n1, n2, container, parentComponent);
                }
                else if (shapeFlag & 2 /* STATEFUL_COMPONENT */) {
                    //处理组件
                    processComponent(n1, n2, container, parentComponent);
                }
        }
        //通过vnode.type 判断这个vnode是组件 还是 htmlElement
    }
    function processText(n1, n2, container) {
        const { children } = n2;
        const textVnode = (n2.el = document.createTextNode(children));
        container.append(textVnode);
    }
    function processFragment(n1, n2, container, parentComponent) {
        mountChildren(n2, container, parentComponent);
    }
    function processElement(n1, n2, container, parentComponent) {
        if (!n1) {
            mountElement(n2, container, parentComponent);
        }
        else {
            patchElement(n1, n2, container, parentComponent);
        }
    }
    function patchElement(n1, n2, container, parentComponent) {
        const el = (n2.el = n1.el);
        const oldProps = n1.props || ELEMENT_VALUE;
        const newProps = n2.props || ELEMENT_VALUE;
        patchProps(el, oldProps, newProps);
        patchChildren(n1, n2, el, parentComponent);
        console.log("patchElement");
    }
    function patchChildren(n1, n2, container, parentComponent) {
        const preShapeFlag = n1.shapeFlag;
        const curShapeFlag = n2.shapeFlag;
        // 1. new ->text  判断Old
        const c1 = n1.children;
        const c2 = n2.children;
        if (curShapeFlag & 4 /* TEXT_CHILDREN */) {
            if (preShapeFlag & 8 /* ARRAY_CHILDREN */) {
                // 将老的chidlren 全部remove
                unmountChildren(c1);
                // 设置text
            }
            // 新children 为text
            // 判断 新旧 text是否相同
            if (c1 !== c2)
                hostsetElementText(container, c2);
        }
        else {
            // 2. new ->array 判断Old
            if (preShapeFlag & 4 /* TEXT_CHILDREN */) {
                hostsetElementText(container, "");
                mountChildren(n2, container, parentComponent);
            }
        }
    }
    function unmountChildren(children) {
        for (const element of children) {
            hostRemove(element.el);
        }
    }
    function patchProps(el, oldProps, newProps) {
        if (oldProps !== newProps) {
            for (const key in newProps) {
                const oldValue = oldProps[key];
                const newValue = newProps[key];
                if (newValue !== oldValue) {
                    hostPatchProp(el, key, oldValue, newValue);
                }
            }
            if (oldProps !== ELEMENT_VALUE) {
                for (const key in oldProps) {
                    if (!(key in newProps)) {
                        hostPatchProp(el, key, oldProps[key], null);
                    }
                }
            }
        }
    }
    function mountElement(vnode, container, parentComponent) {
        // vnode
        const el = (vnode.el = hostCreateElement(vnode.type));
        const { children, shapeFlag } = vnode;
        if (shapeFlag & 4 /* TEXT_CHILDREN */) {
            el.textContent = vnode.children;
        }
        else if (shapeFlag & 8 /* ARRAY_CHILDREN */) {
            mountChildren(vnode, el, parentComponent);
        }
        //props {}
        const { props } = vnode;
        Object.keys(props).forEach((key) => {
            const val = vnode.props[key];
            hostPatchProp(el, key, null, val);
        });
        hostInsert(el, container);
    }
    function mountChildren(vnode, container, parentComponent) {
        vnode.children.forEach((v) => {
            patch(null, v, container, parentComponent);
        });
    }
    function processComponent(n1, n2, container, parentComponent) {
        //挂载组件
        mountComponent(n2, container, parentComponent);
    }
    function mountComponent(vnode, container, parentComponent) {
        // 创建组件实例
        const instance = createComponentInstance(vnode, parentComponent);
        // 初始化组件实例
        setupComponent(instance);
        // 调用Render函数
        setupRenderEffect(instance, vnode, container);
    }
    function setupRenderEffect(instance, vnode, container) {
        effect(() => {
            if (!instance.isMounted) {
                const subTree = instance.render.call(instance.proxy);
                instance.subTree = subTree;
                patch(null, subTree, container, instance);
                // 组件处理完成 后
                vnode.el = subTree.el;
                instance.isMounted = true;
            }
            else {
                const subTree = instance.render.call(instance.proxy);
                const preSubTree = instance.subTree;
                instance.subTree = subTree;
                // console.log("cur", subTree);
                // console.log("pre", preSubTree);
                // console.log("update");
                patch(preSubTree, subTree, container, instance);
            }
        });
    }
    return {
        createApp: createAppAPI(render),
    };
}

function createElement(type) {
    return document.createElement(type);
}
function patchProp(el, key, preValue, currentValue) {
    const isOn = (key) => /^on[A-Z]/.test(key);
    if (isOn(key)) {
        const event = key.slice(2).toLowerCase();
        el.addEventListener(event, currentValue);
    }
    else {
        if (currentValue === undefined || currentValue === null) {
            el.removeAttribute(key);
        }
        else {
            el.setAttribute(key, currentValue);
        }
    }
}
function insert(el, container) {
    container.append(el);
}
function remove(child) {
    const parent = child.parentNode;
    if (parent) {
        parent.removeChild(child);
    }
}
function setElementText(el, textContent) {
    el.textContent = textContent;
}
const renderer = createRenderer({
    createElement,
    patchProp,
    insert,
    remove,
    setElementText,
});
function createApp(...args) {
    return renderer.createApp(...args);
}

exports.createApp = createApp;
exports.createRenderer = createRenderer;
exports.createTextVnode = createTextVnode;
exports.getCurrentInstance = getCurrentInstance;
exports.h = h;
exports.inject = inject;
exports.patchProp = patchProp;
exports.provide = provide;
exports.proxyRefs = proxyRefs;
exports.ref = ref;
exports.renderSlots = renderSlots;
