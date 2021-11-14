import { track, trigger } from "./effect";
import { ReactiveFlags } from "./reactive";
const get = createGetter();
const set = createSetter();
const readonlyGet = createGetter(true);
function createGetter(isReadonly: boolean = false) {
  return function get(target, key) {
    if (key === ReactiveFlags.IS_Reactive) {
      return !isReadonly;
    } else if (key === ReactiveFlags.IS_Readonly) {
      return isReadonly;
    }

    if (!isReadonly) {
      track(target, key);
    }
    return Reflect.get(target, key);
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
