import { mutalbleHandlers, readonlyHandlers } from "./baseHandlers";

export function reactive(obj) {
  return createActiveObject(obj, mutalbleHandlers);
}

export function readonly(obj) {
  return createActiveObject(obj, readonlyHandlers);
}

export function createActiveObject(obj, baseHandlers) {
  return new Proxy(obj, baseHandlers);
}
