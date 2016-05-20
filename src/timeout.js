
let timeoutTasks = [];

let windowSetTimeout = window.setTimeout;
let windowClearTimeout = window.clearTimeout;

let timeoutCount = 0;

let LESSER = -1;
let GREATER = 1;


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

function syncSetTimeout(method, time) {

    time = time || 0;

    let id = windowSetTimeout(function() {
        timeoutTasks.splice(timeoutTasks.indexOf(task), 1);
        method();
    }, time);

    let task = {
        id: id,
        time: time,
        method: method,
        count: timeoutCount++
    };

    timeoutTasks.push(task);

    return id;
};

function syncClearTimeout(id) {
    if (id === undefined) {
        return;
    }

    windowClearTimeout(id);

    var index = findIndex(timeoutTasks, task => task.id === id);
    timeoutTasks.splice(index, 1)
};

syncSetTimeout.flush = function() {

    while (timeoutTasks.length) {
        timeoutTasks.sort(function(a, b) {
            if (a.time  === b.time) {
                return a.count < b.count ? LESSER : GREATER;
            }
            return a.time < b.time ? LESSER : GREATER;
        });
        let task = timeoutTasks.shift();
        task.method();
        clearInterval(task.id);
    }
};


let intervalTasks = [];
let windowSetInterval = window.setInterval;
let windowClearInterval = window.clearInterval;
let intervalCount = 0;

function syncSetInterval(method, time) {

    let id = windowSetInterval(method, time);

    let task = {
        id: id,
        time: time,
        method: method,
        count: intervalCount++
    };

    intervalTasks.push(task);

    return id;
}

function syncClearInterval(id) {
    if (id === undefined) {
        return;
    }

    windowClearInterval(id);

    var index = findIndex(intervalTasks, task => task.id === id);
    intervalTasks.splice(index, 1)
}

syncSetInterval.cycle = function() {

    var length = intervalTasks.length;

    for (var i=0; i<length; i++) {
        let task = intervalTasks[i];
        task.method();
        windowClearInterval(task.id);
        setInterval(task.method, task.time);
    }
}



export function patchSetTimeout() {
    window.setTimeout = syncSetTimeout;
    window.clearTimeout = syncClearTimeout;
}

export function patchSetInterval() {
    window.setInterval = syncSetInterval;
    window.clearInterval = syncClearInterval;
}