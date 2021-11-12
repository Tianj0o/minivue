import { reactive } from "../reactive";
import { effect } from "../effect";
describe("happy path", () => {
  it("happy path", () => {
    const user = reactive({ age: 1 });
    let nextAge;
    effect(() => {
      nextAge = user.age + 1;
    });
    expect(nextAge).toBe(2);
    user.age++;
    expect(nextAge).toBe(3);
  });

  it("effect return func", () => {
    let num = 0;
    const runner = effect(() => {
      num++;
      return "hhhh";
    });
    expect(num).toBe(1);
    const res = runner();
    expect(res).toBe("hhhh");
    expect(num).toBe(2);
  });
});
