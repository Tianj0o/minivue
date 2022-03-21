import { h, getCurrentInstance } from "../../lib/mini-vue.esm.js";
import { Foo } from "./Foo.js";


export const App = {
  name: "App",
  setup() {
    const instance = getCurrentInstance();
    console.log('App', instance)
    return 'app'
  },
  render() {
    return h('div', {}, [h('p', {}, 'App'), h(Foo)])
  }
}