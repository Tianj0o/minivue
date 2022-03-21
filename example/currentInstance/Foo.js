import { h, getCurrentInstance } from "../../lib/mini-vue.esm.js";

export const Foo = {
  name: "foo",
  setup() {
    const instance = getCurrentInstance();
    console.log('foo', instance)
  },
  render() {
    return h('div', {}, 'foo')
  }
}