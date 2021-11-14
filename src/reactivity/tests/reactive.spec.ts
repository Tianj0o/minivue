import { isReactive, reactive } from "../reactive";

describe("reactive", () => {
  it("happyPath", () => {
    const original = { foo: 1 };
    const observed = reactive(original);
    expect(observed).not.toBe(original);
    expect(observed.foo).toBe(1);
    expect(isReactive(original)).toBe(false);
    expect(isReactive(observed)).toBe(true);
  });
});
