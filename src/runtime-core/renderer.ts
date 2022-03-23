import { ShapeFlags } from "../shared/shapeFlags";
import { createComponentInstance, setupComponent } from "./component";
import { createAppAPI } from "./createApp";
import { Fragment, Text } from "./vnode";

export function createRenderer(options) {
  const { createElement, patchProp, insert } = options;
  function render(vnode, container) {
    patch(vnode, container, null);
  }
  function patch(vnode: any, container: any, parentComponent) {
    const { shapeFlag, type } = vnode;
    switch (type) {
      case Fragment:
        processFragment(vnode, container, parentComponent);
        break;
      case Text:
        processText(vnode, container);
        break;
      default:
        if (shapeFlag & ShapeFlags.ELEMENT) {
          //处理元素
          processElement(vnode, container, parentComponent);
        } else if (shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
          //处理组件
          processComponent(vnode, container, parentComponent);
        }
    }
    //通过vnode.type 判断这个vnode是组件 还是 htmlElement
  }
  function processText(vnode: any, container: any) {
    const { children } = vnode;
    const textVnode = (vnode.el = document.createTextNode(children));
    container.append(textVnode);
  }
  function processFragment(vnode: any, container, parentComponent) {
    mountChildren(vnode, container, parentComponent);
  }
  function processElement(vnode: any, container: any, parentComponent) {
    mountElement(vnode, container, parentComponent);
  }
  function mountElement(vnode: any, container: any, parentComponent) {
    // vnode
    const el = (vnode.el = createElement(vnode.type));
    const { children, shapeFlag } = vnode;
    if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
      el.textContent = vnode.children;
    } else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
      mountChildren(vnode, el, parentComponent);
    }

    //props {}
    const { props } = vnode;
    Object.keys(props).forEach((key) => {
      const val = vnode.props[key];
      patchProp(el, key, val);
    });

    insert(el, container);
  }
  function mountChildren(vnode, container, parentComponent) {
    vnode.children.forEach((v) => {
      patch(v, container, parentComponent);
    });
  }
  function processComponent(vnode: any, container: any, parentComponent) {
    //挂载组件
    mountComponent(vnode, container, parentComponent);
  }

  function mountComponent(vnode: any, container, parentComponent) {
    // 创建组件实例
    const instance = createComponentInstance(vnode, parentComponent);
    // 初始化组件实例
    setupComponent(instance);

    // 调用Render函数
    setupRenderEffect(instance, vnode, container);
  }
  function setupRenderEffect(instance: any, vnode: any, container: any) {
    const subTree = instance.render.call(instance.proxy);

    patch(subTree, container, instance);

    // 组件处理完成 后
    vnode.el = subTree.el;
  }
  return {
    createApp: createAppAPI(render),
  };
}
