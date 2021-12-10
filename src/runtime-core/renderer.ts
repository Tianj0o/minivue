import { isObject } from "../shared/index";
import { createComponentInstance, setupComponent } from "./component";

export function render(vnode, container) {
  patch(vnode, container);
}
function patch(vnode: any, container: any) {
  //通过vnode.type 判断这个vnode是组件 还是 htmlElement
  if (typeof vnode.type === "string") {
    //处理元素
    processElement(vnode, container);
  } else if (isObject(vnode.type)) {
    //处理组件
    processComponent(vnode, container);
  }
}
function processElement(vnode: any, container: any) {
  mountElement(vnode, container);
}
function mountElement(vnode: any, container: any) {
  // vnode
  const el = document.createElement(vnode.type);

  const { children } = vnode;
  if (typeof children === "string") {
    el.textContent = vnode.children;
  } else if (Array.isArray(children)) {
    mountChildren(children, el);
  }

  //props {}
  Object.keys(vnode.props).forEach((key) => {
    const val = vnode.props[key];
    el.setAttribute(key, val);
  });

  container.append(el);
}
function mountChildren(vnode, container) {
  vnode.forEach((v) => {
    patch(v, container);
  });
}
function processComponent(vnode: any, container: any) {
  //挂载组件
  mountComponent(vnode, container);
}

function mountComponent(vnode: any, container) {
  // 创建组件实例
  const instance = createComponentInstance(vnode);
  // 初始化组件实例
  setupComponent(instance);

  // 调用Render函数
  setupRenderEffect(instance, container);
}
function setupRenderEffect(instance: any, container: any) {
  const subTree = instance.render.call(instance.setupState);

  patch(subTree, container);
}
