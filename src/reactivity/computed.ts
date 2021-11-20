import { effectFn } from "./effect";

class ComputedRefImpl {
  private _getter: any;
  private dirty = true;
  effect: effectFn;
  constructor(getter) {
    this._getter = getter;
    this.effect = new effectFn(getter, () => {
      if (!this.dirty) {
        this.dirty = true;
      }
    });
  }
  get value() {
    if (this.dirty) {
      this.dirty = false;
      return this.effect.run();
    }
  }
}

export const computed = (getter) => {
  return new ComputedRefImpl(getter);
};
