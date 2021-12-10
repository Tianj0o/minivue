export function createComponentInstance(vnode) {
  const component = {
    vnode,
    type: vnode.type,
  };
  return component;
}
export function setupComponent(instance) {
  //initProps
  //initSlots

  //初始化有状态的组件
  setupStatefulComponent(instance);
}
function setupStatefulComponent(instance: any) {
  //获取组件对象
  const Component = instance.type;

  const { setup } = Component;
  if (setup) {
    //function || Object
    const setupResult = setup();

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
