import { h } from '../../lib/mini-vue.esm.js'
import { Foo } from './Foo.js'
window.self = null
export const App = {
  render() {
    const app = h('p', {}, 'App组件')
    const foo = h(Foo, { count: 365 }, {
      header: ({ }) => h('p', {}, [app, h('h1', {}, 'test')]),
      footer: ({ age }) => h('p', {}, 'footer ' + age)
    })
    return h('div', { class: '父组件' }, [app, foo])
  },
  setup() {
    return {
      msg: 'mini-vue-2'
    }
  }
}