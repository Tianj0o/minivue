import { extend } from "../shared";

class effectFn {
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
    activeFn = this;
    return this._fn();
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

function clearupEffect(effect) {
  effect.deps.forEach((dep: any) => {
    dep.delete(effect);
  });
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
  if (!activeFn) return;
  effectFnSet.add(activeFn);

  //给activeFn添加 收集到的set stop功能
  activeFn.deps.push(effectFnSet);
}
export function trigger(target, key) {
  const effectMap = targetMap.get(target);
  const effectFns = effectMap.get(key);
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
