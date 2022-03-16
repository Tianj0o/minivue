import { camelize, toHandlerKey } from "../shared/index";

export function emit(instance, event, ...args) {
  // console.log(event + "------");

  const { props } = instance;
  // 1. add -> Add
  // 2 .add-foo -> addFoo

  const handlerName = toHandlerKey(camelize(event));
  // console.log(handlerName);
  const handle = props[handlerName];
  handle && handle(...args);
}
