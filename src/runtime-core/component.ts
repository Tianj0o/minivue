import { shallowReadonly } from "../reactivity/reactive";
import { initProps } from "./componentProps";
import { publicInstanceProxyHandlers } from "./componentPublicInstance";

export function createComponentInstance(vnode) {
  const component = {
    vnode,
    type: vnode.type,
    setupState: {},
    props: {},
  };

  return component;
}
export function setupComponent(instance) {
  initProps(instance, instance.vnode.props);
  //initSlots

  //初始化有状态的组件
  setupStatefulComponent(instance);
}
function setupStatefulComponent(instance: any) {
  //获取组件对象
  const Component = instance.type;

  // this ctx -> proxy
  instance.proxy = new Proxy({ _: instance }, publicInstanceProxyHandlers);

  const { setup } = Component;
  if (setup) {
    //function || Object
    const setupResult = setup(shallowReadonly(instance.props));

    handleSetupResult(instance, setupResult);
  }
}
function handleSetupResult(instance: any, setupResult: any) {
  if (typeof setupResult === "object") {
    instance.setupState = setupResult;
  }

  finishComponentSetup(instance);
}
function finishComponentSetup(instance: any) {
  const Component = instance.type;
  instance.render = Component.render;
}
