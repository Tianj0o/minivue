import { hasChange, isObject } from "../shared";
import { isTracking, trackEffects, triggerEffects } from "./effect";
import { reactive } from "./reactive";

class RefImpl {
  private _value: any;
  deps: Set<unknown>;
  private _rawValue: any;
  constructor(value) {
    //当value 为一个对象时 用reactive包裹
    this._rawValue = value;
    this._value = convert(value);
    this.deps = new Set();
  }
  get value() {
    if (isTracking()) trackEffects(this.deps);
    return this._value;
  }
  set value(newVal) {
    if (hasChange(this._rawValue, newVal)) {
      this._rawValue = newVal;
      this._value = convert(newVal);
      triggerEffects(this.deps);
    }
  }
}
function convert(value) {
  return isObject(value) ? reactive(value) : value;
}
export function ref(val) {
  return new RefImpl(val);
}
