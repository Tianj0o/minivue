import { hasChange, isObject } from "../shared";
import { isTracking, trackEffects, triggerEffects } from "./effect";
import { reactive } from "./reactive";

class RefImpl {
  private _value: any;
  deps: Set<unknown>;
  private _rawValue: any;
  public __v_isRef = true;
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

export function isRef(ref) {
  return !!ref.__v_isRef;
}

export function unRef(ref) {
  return isRef(ref) ? ref.value : ref;
}

export function proxyRefs(obj) {
  return new Proxy(obj, {
    get(target, key) {
      return unRef(Reflect.get(target, key));
    },
    set(target, key, value) {
      if (isRef(target[key]) && !isRef(value)) {
        return (target[key].value = value);
      } else {
        return Reflect.set(target, key, value);
      }
    },
  });
}
