import { isObject } from "../shared/index";
import { ShapeFlags } from "../shared/shapeFlags";
import { createComponentInstance, setupComponent } from "./component";

export function render(vnode, container) {
  patch(vnode, container);
}
function patch(vnode: any, container: any) {
  const { shapeFlag } = vnode;

  //通过vnode.type 判断这个vnode是组件 还是 htmlElement
  if (shapeFlag & ShapeFlags.ELEMENT) {
    //处理元素
    processElement(vnode, container);
  } else if (shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
    //处理组件
    processComponent(vnode, container);
  }
}
function processElement(vnode: any, container: any) {
  mountElement(vnode, container);
}
function mountElement(vnode: any, container: any) {
  // vnode
  const el = (vnode.el = document.createElement(vnode.type));

  const { children, shapeFlag } = vnode;
  if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
    el.textContent = vnode.children;
  } else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
    mountChildren(children, el);
  }

  //props {}
  const { props } = vnode;
  Object.keys(props).forEach((key) => {
    const val = vnode.props[key];
    const isOn = (key: string) => /^on[A-Z]/.test(key);
    if (isOn(key)) {
      const event = key.slice(2).toLowerCase();
      el.addEventListener(event, val);
    } else {
      el.setAttribute(key, val);
    }
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
  setupRenderEffect(instance, vnode, container);
}
function setupRenderEffect(instance: any, vnode: any, container: any) {
  const subTree = instance.render.call(instance.proxy);

  patch(subTree, container);

  // 组件处理完成 后
  vnode.el = subTree.el;
}
