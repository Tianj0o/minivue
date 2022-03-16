import { ShapeFlags } from "../shared/shapeFlags";

export function initSlots(instance, children) {
  const { vnode } = instance;
  if (vnode.shapeFlag & ShapeFlags.SLOT_CHILDREN)
    normalizeObjectSlot(instance, children);
}
function normalizeObjectSlot(instance, children) {
  const slots = {};
  for (const key in children) {
    const value = children[key];
    slots[key] = (props) => normalizeSlotValue(value(props));
  }
  instance.slots = slots;
}

function normalizeSlotValue(value) {
  return Array.isArray(value) ? value : [value];
}
