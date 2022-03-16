import { h, renderSlots } from "../../lib/mini-vue.esm.js";

export const Foo = {
  setup(props) {
    return {
    }
  },
  render() {
    const foo = h('p', {}, 'FOO')
    console.log(this.$slots)
    const age = 255
    return h('div', {}, [renderSlots(this.$slots, 'footer', { age }), foo, renderSlots(this.$slots, 'header', { age })])
  }
}