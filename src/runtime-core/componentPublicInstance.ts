import { hasOwn } from "../shared/index";

const publicPropertiesMap = {
  $el: (i) => i.vnode.el,
};

export const publicInstanceProxyHandlers = {
  get({ _: instance }, key) {
    const { setupState } = instance;

    if (hasOwn(setupState, key)) {
      return setupState[key];
    } else if (hasOwn(instance.props, key)) {
      return instance.props[key];
    }
    const publicGetter = publicPropertiesMap[key];
    if (publicGetter) {
      return publicGetter(instance);
    }
  },
};
