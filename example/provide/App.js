import { h, provide, inject } from '../../lib/mini-vue.esm.js'
window.self = null

export const App = {
  name: 'App',
  setup() {
    provide('name', "App")
  },
  render() {
    const App = h('p', {}, 'App')
    return h('div', {}, [App, h(Provide)])
  }
}
const Provide = {
  name: 'Provide',
  setup() {
    provide('name', "Provide")
    const name = inject('name')
    return {
      name
    }
  },
  render() {
    const Provide = h('p', {}, `Provide:${this.name}`)
    return h('div', {}, [Provide, h(Foo)])
  }
}
const Foo = {
  name: 'Foo',
  setup() {
    const name = inject('name')
    const bar = inject('bar', 'barDefault')
    const baz = inject('baz', () => 'baz')
    return {
      name,
      bar,
      baz
    }
  },
  render() {
    return h('div', {}, `foo:${this.name}bar:${this.bar} baz:${this.baz}`)
  }
}

