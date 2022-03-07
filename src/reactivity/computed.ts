import { effectFn } from "./effect";

class ComputedRefImpl {
  private _getter: any;
  private dirty = true;
  effect: effectFn;
  _value: any;
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
      this._value = this.effect.run();
    }
    return this._value;
  }
}

export const computed = (getter) => {
  return new ComputedRefImpl(getter);
};
