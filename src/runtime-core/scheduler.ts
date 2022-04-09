const queue: any[] = [];
let isFlushPending = false;
export function queueJob(job: any) {
  if (!queue.includes(job)) {
    queue.push(job);
  }

  queueFlush();
}
function queueFlush() {
  if (isFlushPending) return;
  isFlushPending = true;
  nextTick(flushJobs);
}
function flushJobs() {
  console.log("zhixing+++++++++");
  isFlushPending = false;
  while (queue.length !== 0) {
    let fn = queue.shift();
    fn?.();
  }
}
const p = Promise.resolve();
export function nextTick(fn) {
  return fn ? p.then(fn) : p;
}
