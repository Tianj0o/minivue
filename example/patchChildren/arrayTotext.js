import { h, ref } from "../../lib/mini-vue.esm.js"
const oldChildren = [h('div', {}, 'a'), h('div', {}, 'b')]
const newChildren = 'text'
export default {
  setup() {
    const change = ref(false)
    window.change = change
    return {
      change
    }
  },
  render() {
    const self = this
    return this.change ? h('div', {}, newChildren) : h('div', {}, oldChildren)
  }
}