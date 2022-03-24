import { createRenderer } from "../runtime-core/index";

function createElement(type) {
  return document.createElement(type);
}

export function patchProp(el, key, preValue, currentValue) {
  const isOn = (key: string) => /^on[A-Z]/.test(key);
  if (isOn(key)) {
    const event = key.slice(2).toLowerCase();
    el.addEventListener(event, currentValue);
  } else {
    if (currentValue === undefined || currentValue === null) {
      el.removeAttribute(key);
    } else {
      el.setAttribute(key, currentValue);
    }
  }
}

function insert(el, container) {
  container.append(el);
}

const renderer: any = createRenderer({
  createElement,
  patchProp,
  insert,
});

export function createApp(...args) {
  return renderer.createApp(...args);
}
export * from "../runtime-core/index";
