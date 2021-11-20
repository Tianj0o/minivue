import { extend } from "../shared";

let activeFn;
let shouldTrack;
export class effectFn {
  _fn: any;
  scheduler?: any;
  deps: any[] = [];
  active = true;
  onStop?: () => void;
  constructor(fn, scheduler?) {
    this._fn = fn;
    this.scheduler = scheduler;
  }
  run() {
    if (!this.active) {
      return this._fn();
    }
    shouldTrack = true;
    activeFn = this;

    const res = this._fn();
    shouldTrack = false;
    return res;
  }
  stop() {
    if (this.active) {
      if (this.onStop) {
        this.onStop();
      }
      clearupEffect(this);
      this.active = false;
    }
  }
}
export function isTracking() {
  return shouldTrack && activeFn !== undefined;
}
function clearupEffect(effect) {
  effect.deps.forEach((dep: any) => {
    dep.delete(effect);
  });
}

export const targetMap = new Map();

export function track(target, key) {
  if (!isTracking()) return;
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
  trackEffects(effectFnSet);
}
export function trackEffects(effectFnSet) {
  if (effectFnSet.has(activeFn)) return;
  effectFnSet.add(activeFn);
  //给activeFn添加 收集到的set stop功能
  activeFn.deps.push(effectFnSet);
}
export function trigger(target, key) {
  const effectMap = targetMap.get(target);
  const effectFns = effectMap.get(key);
  triggerEffects(effectFns);
}
export function triggerEffects(effectFns) {
  effectFns.forEach((effect) => {
    if (effect.scheduler) {
      effect.scheduler();
    } else {
      effect._fn();
    }
  });
}
export const effect = function (fn, options: any = {}) {
  const effect = new effectFn(fn, options.scheduler);
  extend(effect, options);
  effect.run();
  const runner: any = effect.run.bind(effect);
  runner.effect = effect;
  return runner;
};

export const stop = (runner) => {
  runner.effect.stop();
};
