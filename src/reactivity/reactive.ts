import { mutalbleHandlers, readonlyHandlers } from "./baseHandlers";
export const enum ReactiveFlags {
  IS_Reactive = "__v_isReactive",
  IS_Readonly = "__v_isReadonly",
}
export function reactive(obj) {
  return createActiveObject(obj, mutalbleHandlers);
}

export function readonly(obj) {
  return createActiveObject(obj, readonlyHandlers);
}

export function isReactive(obj) {
  return !!obj[ReactiveFlags.IS_Reactive];
}
export function isReadonly(obj) {
  return !!obj[ReactiveFlags.IS_Readonly];
}

export function createActiveObject(obj, baseHandlers) {
  return new Proxy(obj, baseHandlers);
}
