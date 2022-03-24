import { h, ref } from '../../lib/mini-vue.esm.js'
window.self = null
export const App = {

  // 更新props 三种情况 
  // 1. 修改某一属性
  // 2. 将一个属性赋值为undefined 或者 null
  // 3. 删除一个旧的属性
  setup() {
    const count = ref(1)
    const props = ref({
      foo: 'foo',
      bar: 'bar'
    })
    let i = 0;
    function onClick() {
      count.value++
      console.log(count.value)
    }
    function onChangeProps() {
      props.value.foo = `foo-change${i++}`
    }
    function onChangePropsToUndefined() {
      props.value.bar = undefined
    }
    function onDeleteProps() {
      debugger
      props.value = {
        foo: 'new-foo'
      }
    }
    return {
      count,
      onClick,
      props,
      onChangeProps,
      onChangePropsToUndefined,
      onDeleteProps,
    }
  },
  render() {
    return h('div', { ...this.props }, [h('div', {}, `count:${this.count}`), h('button', { onClick: this.onClick }, 'Add'),
    h('button', { onClick: this.onChangeProps }, 'changeProps'), h('button', { onClick: this.onChangePropsToUndefined }, 'ChangePropsToUndefined'), h('button', { onClick: this.onDeleteProps }, 'DeleteProps'), h(Foo, { ...this.props })])
  }
}


const Foo = {
  setup(props) {
    console.log('---', props)
    const foo = ref(5)
    function onClick() {
      foo.value++
      console.log(foo.value)
    }
    return {
      foo,
      onClick,
      props
    }
  },
  render() {
    return h('div', {}, [h('div', {}, `foo:${this.foo + '===' + this.props.foo}`), h('button', { onClick: this.onClick }, 'Add')])
  }
}