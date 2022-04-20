/* @flow */
const timeoutTasks = [];

const windowSetTimeout = window.setTimeout;
const windowClearTimeout = window.clearTimeout;

let timeoutCount = 0;

const LESSER = -1;
const GREATER = 1;

function findIndex(array, method) {
  if (!array) {
    return;
  }

  for (let i = 0; i < array.length; i++) {
    if (method(array[i])) {
      return i;
    }
  }
}

export function syncSetTimeout(method, time) {
  time = time || 0;

  const id = windowSetTimeout(() => {
    // eslint-disable-next-line no-use-before-define
    timeoutTasks.splice(timeoutTasks.indexOf(task), 1);
    method();
  }, time);

  const task = {
    id,
    time,
    method,
    count: timeoutCount++,
  };

  timeoutTasks.push(task);

  return id;
}

export function syncClearTimeout(id) {
  if (id === undefined) {
    return;
  }

  windowClearTimeout(id);

  const index = findIndex(timeoutTasks, (task) => task.id === id);
  timeoutTasks.splice(index, 1);
}

syncSetTimeout.flush = function () {
  while (timeoutTasks.length) {
    timeoutTasks.sort((a, b) => {
      if (a.time === b.time) {
        return a.count < b.count ? LESSER : GREATER;
      }
      return a.time < b.time ? LESSER : GREATER;
    });
    const task = timeoutTasks.shift();
    task.method();
    clearInterval(task.id);
  }
};

const intervalTasks = [];
const windowSetInterval = window.setInterval;
const windowClearInterval = window.clearInterval;
let intervalCount = 0;

export function syncSetInterval(method, time) {
  const id = windowSetInterval(method, time);

  const task = {
    id,
    time,
    method,
    count: intervalCount++,
  };

  intervalTasks.push(task);

  return id;
}

export function syncClearInterval(id) {
  if (id === undefined) {
    return;
  }

  windowClearInterval(id);

  const index = findIndex(intervalTasks, (task) => task.id === id);
  intervalTasks.splice(index, 1);
}

syncSetInterval.cycle = function () {
  const length = intervalTasks.length;

  for (let i = 0; i < length; i++) {
    const task = intervalTasks[i];
    task.method();
    windowClearInterval(task.id);
    setInterval(task.method, task.time);
  }
};

export function patchSetTimeout() {
  window.setTimeout = syncSetTimeout;
  window.clearTimeout = syncClearTimeout;
}

export function patchSetInterval() {
  window.setInterval = syncSetInterval;
  window.clearInterval = syncClearInterval;
}
