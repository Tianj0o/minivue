import { h } from "../../lib/mini-vue.esm.js"

export const Bar = {

  setup(props, { emit }) {
    const add = () => {
      emit('add', 1, 3,)
      emit('change-test', 'testhhhh')
    }
    return {
      add
    }
  },
  render() {
    const btn = h('button', { onClick: this.add }, 'emitAdd')
    return h('div', {}, ['bar', btn])
  }
}