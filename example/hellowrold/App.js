import { h } from '../../lib/mini-vue.esm.js'
import { Foo } from './Foo.js'
window.self = null
export const App = {
  render() {
    window.self = this
    return h('div', {
      id: "test",
      class: 'red test',
      onClick: () => {
        console.log('click')
      },
      onMousedown: () => {
        console.log('mouseDown')
      }
    },
      //string
      // 'hello,' + this.msg
      //array
      [h('p', { class: 'red' }, 'hhhhh' + this.msg, this.$el), h('p', { class: 'blue' }, 'bbbb' + this.msg), h(Foo, { count: 1 })]
    )
  },
  setup() {
    return {
      msg: 'mini-vue-2'
    }
  }
}