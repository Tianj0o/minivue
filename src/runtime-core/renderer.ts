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
    patch(null, vnode, container, null, null);
  }
  function patch(n1: any, n2: any, container: any, parentComponent, anchor) {
    const { shapeFlag, type } = n2;
    switch (type) {
      case Fragment:
        processFragment(n1, n2, container, parentComponent, anchor);
        break;
      case Text:
        processText(n1, n2, container);
        break;
      default:
        if (shapeFlag & ShapeFlags.ELEMENT) {
          //处理元素
          processElement(n1, n2, container, parentComponent, anchor);
        } else if (shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
          //处理组件
          processComponent(n1, n2, container, parentComponent, anchor);
        }
    }
    //通过vnode.type 判断这个vnode是组件 还是 htmlElement
  }
  function processText(n1, n2: any, container: any) {
    const { children } = n2;
    const textVnode = (n2.el = document.createTextNode(children));
    container.append(textVnode);
  }
  function processFragment(n1, n2: any, container, parentComponent, anchor) {
    mountChildren(n2, container, parentComponent, anchor);
  }
  function processElement(
    n1,
    n2: any,
    container: any,
    parentComponent,
    anchor
  ) {
    if (!n1) {
      mountElement(n2, container, parentComponent, anchor);
    } else {
      patchElement(n1, n2, container, parentComponent, anchor);
    }
  }
  function patchElement(n1, n2, container, parentComponent, anchor) {
    const el = (n2.el = n1.el);
    const oldProps = n1.props || ELEMENT_VALUE;
    const newProps = n2.props || ELEMENT_VALUE;
    patchProps(el, oldProps, newProps);

    patchChildren(n1, n2, el, parentComponent, anchor);
  }
  function patchChildren(n1, n2, container, parentComponent, anchor) {
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
        mountChildren(n2, container, parentComponent, anchor);
      } else {
        // old --> array

        patchKeyedChildren(c1, c2, container, parentComponent, anchor);
      }
    }
  }
  function patchKeyedChildren(c1, c2, container, parentComponent, anchor) {
    let i = 0;
    let e1 = c1.length - 1;
    let e2 = c2.length - 1;

    function isSameVnodeType(n1, n2) {
      return n1.type === n2.type && n1.key === n2.key;
    }

    // 左侧节点
    while (i <= e1 && i <= e2) {
      const n1 = c1[i],
        n2 = c2[i];
      if (isSameVnodeType(n1, n2)) {
        patch(n1, n2, container, parentComponent, anchor);
      } else {
        break;
      }
      i++;
    }
    console.log(i);
    // 右侧对比
    while (i <= e1 && i <= e2) {
      const n1 = c1[e1],
        n2 = c2[e2];
      if (isSameVnodeType(n1, n2)) {
        patch(n1, n2, container, parentComponent, anchor);
      } else {
        break;
      }
      e1--;
      e2--;
    }

    // 新的比旧的长 右边 插入 左右情况相同
    // a,b,c -> abcde
    if (i > e1) {
      if (i <= e2) {
        while (i <= e2) {
          const anchor = e2 + 1 < c2.length ? c2[e2 + 1].el : null;
          console.log(anchor);
          patch(null, c2[i], container, parentComponent, anchor);
          i++;
        }
      }
    } else if (i > e2) {
      // 旧的比新的长 移除旧的 左右情况相同
      while (i <= e1) {
        hostRemove(c1[i].el);
        i++;
      }
    } else {
      // 中间对比
      let s1 = i,
        s2 = i;
      // 待处理的新节点个数
      const toBePatched = e2 - i + 1;
      let patched = 0;
      const newIndexToOldIndexMap = new Array(toBePatched).fill(0);
      let moved = false;
      let maxNewIndexSoFar = 0;
      const keyToNewIndexMap = new Map();
      for (let i = s2; i <= e2; i++) {
        keyToNewIndexMap.set(c2[i].key, i);
      }
      for (let i = s1; i <= e1; i++) {
        const preChild = c1[i];
        if (patched >= toBePatched) {
          console.log("移除");
          hostRemove(preChild.el);
          continue;
        }

        // 用户给了key 就可以直接找到节点是否存在于新节点
        let newIndex;
        if (preChild.key != null) {
          newIndex = keyToNewIndexMap.get(preChild.key);
        } else {
          // 如果没有给key 通过遍历查找
          for (let j = s2; j <= e2; j++) {
            if (isSameVnodeType(preChild, c2[j])) {
              newIndex = j;
              break;
            }
          }
        }
        if (newIndex === undefined) {
          hostRemove(preChild.el);
        } else {
          if (newIndex >= maxNewIndexSoFar) {
            maxNewIndexSoFar = newIndex;
          } else {
            moved = true;
          }
          newIndexToOldIndexMap[newIndex - s2] = i + 1;
          patch(preChild, c2[newIndex], container, parentComponent, null);
          patched++;
        }
      }
      const increasingNewIndex = moved
        ? getSequence(newIndexToOldIndexMap)
        : [];
      // console.log(increasingNewIndex);
      let j = increasingNewIndex.length - 1;
      for (let i = toBePatched - 1; i >= 0; i--) {
        const nextIndex = i + s2;
        const nextChild = c2[nextIndex];
        const anchor = nextIndex + 1 < c2.length ? c2[nextIndex + 1].el : null;
        if (newIndexToOldIndexMap[i] === 0) {
          patch(null, nextChild, container, parentComponent, anchor);
        }
        if (moved) {
          if (j < 0 || i !== increasingNewIndex[j]) {
            console.log("修改位置", i);
            console.log(anchor);
            hostInsert(nextChild.el, container, anchor);
          } else {
            j--;
          }
        }
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
  function mountElement(vnode: any, container: any, parentComponent, anchor) {
    // vnode
    const el = (vnode.el = hostCreateElement(vnode.type));
    const { children, shapeFlag } = vnode;
    if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
      el.textContent = vnode.children;
    } else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
      mountChildren(vnode, el, parentComponent, anchor);
    }

    //props {}
    const { props } = vnode;
    Object.keys(props).forEach((key) => {
      const val = vnode.props[key];
      hostPatchProp(el, key, null, val);
    });

    hostInsert(el, container, anchor);
  }
  function mountChildren(vnode, container, parentComponent, anchor) {
    vnode.children.forEach((v) => {
      patch(null, v, container, parentComponent, anchor);
    });
  }
  function processComponent(
    n1,
    n2: any,
    container: any,
    parentComponent,
    anchor
  ) {
    //挂载组件
    mountComponent(n2, container, parentComponent, anchor);
  }

  function mountComponent(vnode: any, container, parentComponent, anchor) {
    // 创建组件实例
    const instance = createComponentInstance(vnode, parentComponent);
    // 初始化组件实例
    setupComponent(instance);

    // 调用Render函数
    setupRenderEffect(instance, vnode, container, anchor);
  }
  function setupRenderEffect(
    instance: any,
    vnode: any,
    container: any,
    anchor
  ) {
    effect(() => {
      if (!instance.isMounted) {
        const subTree = instance.render.call(instance.proxy);
        instance.subTree = subTree;
        patch(null, subTree, container, instance, anchor);

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
        patch(preSubTree, subTree, container, instance, anchor);
      }
    });
  }
  return {
    createApp: createAppAPI(render),
  };
}

function getSequence(arr: number[]): number[] {
  const p = arr.slice();
  const result = [0];
  let i, j, u, v, c;
  const len = arr.length;
  for (i = 0; i < len; i++) {
    const arrI = arr[i];
    if (arrI !== 0) {
      j = result[result.length - 1];
      if (arr[j] < arrI) {
        p[i] = j;
        result.push(i);
        continue;
      }
      u = 0;
      v = result.length - 1;
      while (u < v) {
        c = (u + v) >> 1;
        if (arr[result[c]] < arrI) {
          u = c + 1;
        } else {
          v = c;
        }
      }
      if (arrI < arr[result[u]]) {
        if (u > 0) {
          p[i] = result[u - 1];
        }
        result[u] = i;
      }
    }
  }
  u = result.length;
  v = result[u - 1];
  while (u-- > 0) {
    result[u] = v;
    v = p[v];
  }
  return result;
}
