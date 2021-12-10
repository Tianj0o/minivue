import { render } from "./renderer";
import { createVNode } from "./vnode";

export function createApp(rootComponent) {
  return {
    mount(rootContainer) {
      // 将组件 转换成vNode
      const vnode = createVNode(rootComponent);

      render(vnode, rootContainer);
    },
  };
}
