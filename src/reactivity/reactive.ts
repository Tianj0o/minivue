import { track, trigger } from "./effect";

export function reactive(obj) {
  return new Proxy(obj, {
    get(target, key) {
      //收集依赖
      track(target, key);
      return Reflect.get(target, key);
    },
    set(target, key, value) {
      const res = Reflect.set(target, key, value);
      trigger(target, key);
      return res;
    },
  });
}

export function readonly(obj) {
  return new Proxy(obj, {
    get(target, key) {
      track(target, key);
      return Reflect.get(target, key);
    },
    set(target, key, value) {
      console.warn("can not set Readonly");
      return true;
    },
  });
}
