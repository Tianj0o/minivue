import { extend, isObject } from "../shared/index";
import { track, trigger } from "./effect";
import { reactive, ReactiveFlags, readonly } from "./reactive";
const get = createGetter();
const set = createSetter();
const readonlyGet = createGetter(true);
const shallowReadonlyGet = createGetter(true, true);
function createGetter(
  isReadonly: boolean = false,
  isShllowReadonly: boolean = false
) {
  return function get(target, key) {
    if (key === ReactiveFlags.IS_Reactive) {
      return !isReadonly;
    } else if (key === ReactiveFlags.IS_Readonly) {
      return isReadonly;
    }
    const res = Reflect.get(target, key);
    if (isShllowReadonly) {
      return res;
    }
    if (isObject(res)) {
      return isReadonly ? readonly(res) : reactive(res);
    }
    if (!isReadonly) {
      track(target, key);
    }
    return res;
  };
}
function createSetter() {
  return function set(target, key, value) {
    const res = Reflect.set(target, key, value);
    trigger(target, key);
    return res;
  };
}
export const mutalbleHandlers = {
  get,
  set,
};
export const readonlyHandlers = {
  get: readonlyGet,
  set: function (target, key) {
    console.warn("can not set a readonly obj", target, key);
    return true;
  },
};

export const shallowReadonlyHandlers = extend({}, readonlyHandlers, {
  get: shallowReadonlyGet,
});
