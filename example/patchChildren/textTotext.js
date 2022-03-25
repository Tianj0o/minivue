import { h, ref } from "../../lib/mini-vue.esm.js"
const oldChildren = 'oldText'
const newChildren = 'newText'
export default {
  setup() {
    const change = ref(false)
    window.change = change
    return {
      change
    }
  },
  render() {
    return this.change ? h('div', {}, newChildren) : h('div', {}, oldChildren)
  }
}