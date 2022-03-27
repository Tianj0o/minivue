import { h, } from '../../lib/mini-vue.esm.js'
import arrayTotext from './arrayTotext.js'
import textTotext from './textTotext.js'
import textToarray from './textToarray.js'
import arrayToarray from './arrayToarray.js'
window.self = null
export const App = {
  setup() {
  },
  render() {
    return h('div', {}, [
      h('div', {}, 'main'),
      //1 array -> text
      // h(arrayTotext),

      //2 text -> text
      // h(textTotext)

      //3 text -> array
      // h(textToarray)

      //4 array -> array
      h(arrayToarray)
    ])
  }
}