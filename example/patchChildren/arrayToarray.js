import { h, ref } from '../../lib/mini-vue.esm.js'
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

//1. 左侧对比
// a,b,c -->  a,b,d e
// const oldChildren = [h('p', { key: 'A' }, 'A'), h('p', { key: 'B' }, 'B'), h('p', { key: 'C' }, 'C')]
// const newChildren = [h('p', { key: 'A' }, 'A'), h('p', { key: 'B' }, 'B'), h('p', { key: 'D' }, 'D'), h('p', { key: 'E' }, 'E')]

//2. 右侧对比
// const oldChildren = [h('p', { key: 'A' }, 'A'), h('p', { key: 'B', class: 'old' }, 'B'), h('p', { key: 'C' }, 'C')]
// const newChildren = [h('p', { key: 'D' }, 'D'), h('p', { key: 'E' }, 'E'), h('p', { key: 'B', class: 'new' }, 'B'), h('p', { key: 'C' }, 'C'),]

//3.新的比旧的长 创建新的 右侧长
// const oldChildren = [h('p', { key: 'A' }, 'A'), h('p', { key: 'B' }, 'B'), h('p', { key: 'D' }, 'D')]
// const newChildren = [h('p', { key: 'A' }, 'A'), h('p', { key: 'B' }, 'B'), h('p', { key: 'D' }, 'D'), h('p', { key: 'E' }, 'E'), h('p', { key: 'E' }, 'E')]

//4.新的比旧的长 创建新的 左侧长
// a,b --> cab
// const oldChildren = [h('p', { key: 'A' }, 'A'), h('p', { key: 'B' }, 'B')]
// const newChildren = [h('p', { key: 'C' }, 'C'), h('p', { key: 'D' }, 'D'), h('p', { key: 'A' }, 'A'), h('p', { key: 'B' }, 'B'),]

// 5 旧的比新的长 删除 右边
// const oldChildren = [h('p', { key: 'C' }, 'C'), h('p', { key: 'D' }, 'D'), h('p', { key: 'A' }, 'A'), h('p', { key: 'B' }, 'B'),]
// const newChildren = [h('p', { key: 'A' }, 'A'), h('p', { key: 'B' }, 'B')]
//-----------------------
// 6 删除中间部分中 新节点中不存在的节点
// abcdef
// abecf
// 删除d
// const oldChildren = [h('p', { key: 'A' }, 'A'), h('p', { key: 'B' }, 'B'), h('p', { key: 'C', class: 'old' }, 'C'), h('p', { key: 'D' }, 'D'), h('p', { key: 'E' }, 'E'), h('p', { key: 'F' }, 'F'), h('p', { key: 'H' }, 'H'), h('p', { key: 'H' }, 'H')]
// const newChildren = [h('p', { key: 'A' }, 'A'), h('p', { key: 'B' }, 'B'), h('p', { key: 'E' }, 'E'), h('p', { key: 'C', class: 'new' }, 'C'), h('p', { key: 'F' }, 'F')]


// 7 移动
// abcdefg
//abecdfg
const oldChildren = [h('p', { key: 'A' }, 'A'), h('p', { key: 'B' }, 'B'), h('p', { key: 'C', class: 'old' }, 'C'), h('p', { key: 'D' }, 'D'), h('p', { key: 'E' }, 'E'), h('p', { key: 'F' }, 'F'), h('p', {}, 'G')]
const newChildren = [h('p', { key: 'A' }, 'A'), h('p', { key: 'B' }, 'B'), h('p', { key: 'E' }, 'E'), h('p', { key: '0' }, '0'), h('p', { key: 'C', class: 'new' }, 'C'), h('p', { key: 'D' }, 'D'), h('p', {}, 'F'), h('p', { key: 'G' }, 'G')]

