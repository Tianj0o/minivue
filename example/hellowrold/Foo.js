import { h } from "../../lib/mini-vue.esm.js";

export const Foo = {
  setup(props) {
    console.log(props)
    props.count++
    console.log(props)
  },
  render() {
    return h('div', {}, '子组件foo:' + this.count)
  }
}