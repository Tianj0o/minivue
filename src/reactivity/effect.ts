class effectFn {
  _fn: any;
  constructor(fn) {
    this._fn = fn;
  }
  run() {
    activeFn = this;
    this._fn();
  }
}
let activeFn;
export const targetMap = new Map();

export function track(target, key) {
  let effectMap = targetMap.get(target);
  if (!effectMap) {
    effectMap = new Map();
    targetMap.set(target, effectMap);
  }
  let effectFnSet = effectMap.get(key);
  if (!effectFnSet) {
    effectFnSet = new Set();
    effectMap.set(key, effectFnSet);
  }
  effectFnSet.add(activeFn);
}
export function trigger(target, key) {
  const effectMap = targetMap.get(target);
  const effectFns = effectMap.get(key);
  effectFns.forEach((fn) => fn.run());
}
export const effect = function (fn) {
  const effect = new effectFn(fn);
  effect.run();
};
