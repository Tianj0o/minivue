import { h } from '../../lib/mini-vue.esm.js'
export const App = {
  render() {
    return h('div', {
      id: "test",
      class: 'red test'
    },
      //string
      // 'hello,' + this.msg
      //array
      [h('p', { class: 'red' }, 'hhhhh' + this.msg), h('p', { class: 'blue' }, 'bbbb' + this.msg)]
    )
  },
  setup() {
    return {
      msg: 'mini-vue'
    }
  }
}