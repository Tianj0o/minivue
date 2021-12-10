import { createComponentInstance, setupComponent } from "./component";

export function render(vnode, container) {
  patch(vnode, container);
}
function patch(vnode: any, container: any) {
  //处理组件
  processComponent(vnode, container);
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
  const subTree = instance.render();

  patch(subTree, container);
}
