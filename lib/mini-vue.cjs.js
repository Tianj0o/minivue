'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var isObject = function (val) {
    return val !== null && typeof val === "object";
};

function createComponentInstance(vnode) {
    var component = {
        vnode: vnode,
        type: vnode.type,
    };
    return component;
}
function setupComponent(instance) {
    //initProps
    //initSlots
    //初始化有状态的组件
    setupStatefulComponent(instance);
}
function setupStatefulComponent(instance) {
    //获取组件对象
    var Component = instance.type;
    var setup = Component.setup;
    if (setup) {
        //function || Object
        var setupResult = setup();
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
    //通过vnode.type 判断这个vnode是组件 还是 htmlElement
    if (typeof vnode.type === "string") {
        //处理元素
        processElement(vnode, container);
    }
    else if (isObject(vnode.type)) {
        //处理组件
        processComponent(vnode, container);
    }
}
function processElement(vnode, container) {
    mountElement(vnode, container);
}
function mountElement(vnode, container) {
    // vnode
    var el = document.createElement(vnode.type);
    var children = vnode.children;
    if (typeof children === "string") {
        el.textContent = vnode.children;
    }
    else if (Array.isArray(children)) {
        mountChildren(children, el);
    }
    //props {}
    Object.keys(vnode.props).forEach(function (key) {
        var val = vnode.props[key];
        el.setAttribute(key, val);
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
    setupRenderEffect(instance, container);
}
function setupRenderEffect(instance, container) {
    var subTree = instance.render.call(instance.setupState);
    patch(subTree, container);
}

function createVNode(type, props, children) {
    var vnode = {
        type: type,
        props: props,
        children: children,
    };
    return vnode;
}

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

exports.createApp = createApp;
exports.h = h;
