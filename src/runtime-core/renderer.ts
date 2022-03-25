import { effect } from "../reactivity/effect";
import { ELEMENT_VALUE } from "../shared";
import { ShapeFlags } from "../shared/shapeFlags";
import { createComponentInstance, setupComponent } from "./component";
import { createAppAPI } from "./createApp";
import { Fragment, Text } from "./vnode";

export function createRenderer(options) {
  const {
    createElement: hostCreateElement,
    patchProp: hostPatchProp,
    insert: hostInsert,
    remove: hostRemove,
    setElementText: hostsetElementText,
  } = options;
  function render(vnode, container) {
    patch(null, vnode, container, null);
  }
  function patch(n1: any, n2: any, container: any, parentComponent) {
    const { shapeFlag, type } = n2;
    switch (type) {
      case Fragment:
        processFragment(n1, n2, container, parentComponent);
        break;
      case Text:
        processText(n1, n2, container);
        break;
      default:
        if (shapeFlag & ShapeFlags.ELEMENT) {
          //处理元素
          processElement(n1, n2, container, parentComponent);
        } else if (shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
          //处理组件
          processComponent(n1, n2, container, parentComponent);
        }
    }
    //通过vnode.type 判断这个vnode是组件 还是 htmlElement
  }
  function processText(n1, n2: any, container: any) {
    const { children } = n2;
    const textVnode = (n2.el = document.createTextNode(children));
    container.append(textVnode);
  }
  function processFragment(n1, n2: any, container, parentComponent) {
    mountChildren(n2, container, parentComponent);
  }
  function processElement(n1, n2: any, container: any, parentComponent) {
    if (!n1) {
      mountElement(n2, container, parentComponent);
    } else {
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
    if (curShapeFlag & ShapeFlags.TEXT_CHILDREN) {
      if (preShapeFlag & ShapeFlags.ARRAY_CHILDREN) {
        // 将老的chidlren 全部remove
        unmountChildren(c1);
        // 设置text
      }
      // 新children 为text
      // 判断 新旧 text是否相同
      if (c1 !== c2) hostsetElementText(container, c2);
    } else {
      // 2. new ->array 判断Old
      if (preShapeFlag & ShapeFlags.TEXT_CHILDREN) {
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
  function mountElement(vnode: any, container: any, parentComponent) {
    // vnode
    const el = (vnode.el = hostCreateElement(vnode.type));
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
      hostPatchProp(el, key, null, val);
    });

    hostInsert(el, container);
  }
  function mountChildren(vnode, container, parentComponent) {
    vnode.children.forEach((v) => {
      patch(null, v, container, parentComponent);
    });
  }
  function processComponent(n1, n2: any, container: any, parentComponent) {
    //挂载组件
    mountComponent(n2, container, parentComponent);
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
    effect(() => {
      if (!instance.isMounted) {
        const subTree = instance.render.call(instance.proxy);
        instance.subTree = subTree;
        patch(null, subTree, container, instance);

        // 组件处理完成 后
        vnode.el = subTree.el;
        instance.isMounted = true;
      } else {
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
