import { createVNode } from "./vnode";

export function createAppAPI(render) {
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
