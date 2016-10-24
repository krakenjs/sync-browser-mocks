
function trycatch(method, successHandler, errorHandler) {

    var isCalled = false;
    var isSuccess = false;
    var isError = false;
    var err, res;

    function flush() {
        if (isCalled) {
            if (isError) {
                return errorHandler(err);
            } else if (isSuccess) {
                return successHandler(res);
            }
        }
    }

    try {
        method(function(result) {
            res = result;
            isSuccess = true;
            flush();
        }, function(error) {
            err = error;
            isError = true;
            flush();
        });
    } catch (error) {
        return errorHandler(error);
    }

    isCalled = true;
    flush();
}

var possiblyUnhandledPromiseHandlers = [];
var possiblyUnhandledPromises = [];
var possiblyUnhandledPromiseTimeout;

function addPossiblyUnhandledPromise(promise) {
    possiblyUnhandledPromises.push(promise);
    possiblyUnhandledPromiseTimeout = possiblyUnhandledPromiseTimeout || setTimeout(flushPossiblyUnhandledPromises, 1);
}

function flushPossiblyUnhandledPromises() {
    possiblyUnhandledPromiseTimeout = null;
    var promises = possiblyUnhandledPromises;
    possiblyUnhandledPromises = [];
    for (var i=0; i<promises.length; i++) {
        var promise = promises[i];

        if (!promise.hasHandlers) {
            promise.handlers.push({
                onError(err) {
                    if (!promise.hasHandlers) {
                        logError(err);

                        for (var j=0; j<possiblyUnhandledPromiseHandlers.length; j++) {
                            possiblyUnhandledPromiseHandlers[j](promise.value);
                        }
                    }
                }
            });

            promise.dispatch();
        }
    }
}

let loggedErrors = [];

function logError(err) {

    if (loggedErrors.indexOf(err) !== -1) {
        return;
    }

    loggedErrors.push(err);

    setTimeout(() => {
        throw err;
    }, 1);
}


let toString = ({}).toString;

function isPromise(item) {
    try {
        if (!item) {
            return false;
        }

        if (window.Window && item instanceof window.Window) {
            return false;
        }

        if (window.constructor && item instanceof window.constructor) {
            return false;
        }

        if (toString) {
            let name = toString.call(item);

            if (name === '[object Window]' || name === '[object global]' || name === '[object DOMWindow]') {
                return false;
            }
        }

        if (item && item.then instanceof Function) {
            return true;
        }
    } catch (err) {
        return false
    }

    return false
}

export var SyncPromise = function SyncPromise(handler) {

    this.resolved = false;
    this.rejected = false;

    this.hasHandlers = false;

    this.handlers = [];

    addPossiblyUnhandledPromise(this);

    if (!handler) {
        return;
    }

    var self = this;

    trycatch(handler, function(res) {
        return self.resolve(res);
    }, function(err) {
        return self.reject(err);
    });
};

SyncPromise.resolve = function SyncPromiseResolve(value) {

    if (isPromise(value)) {
        return value;
    }

    return new SyncPromise().resolve(value);
};

SyncPromise.reject = function SyncPromiseResolve(error) {
    return new SyncPromise().reject(error);
};

SyncPromise.prototype.resolve = function (result) {
    if (this.resolved || this.rejected) {
        return this;
    }

    if (isPromise(result)) {
        throw new Error('Can not resolve promise with another promise');
    }

    this.resolved = true;
    this.value = result;
    this.dispatch();

    return this;
};

SyncPromise.prototype.reject = function(error) {
    if (this.resolved || this.rejected) {
        return this;
    }

    if (isPromise(error)) {
        throw new Error('Can not reject promise with another promise');
    }

    this.rejected = true;
    this.value = error;
    this.dispatch();

    return this;
};

SyncPromise.prototype.dispatch = function() {

    if (!this.resolved && !this.rejected) {
        return;
    }

    while (this.handlers.length) {

        let handler = this.handlers.shift();

        var result, error;

        try {
            if (this.resolved) {
                result = handler.onSuccess ? handler.onSuccess(this.value) : this.value;
            } else {
                if (handler.onError) {
                    result = handler.onError(this.value);
                } else {
                    error = this.value;
                }
            }
        } catch (err) {
            error = err;
        }

        if (result === this) {
            throw new Error('Can not return a promise from the the then handler of the same promise');
        }

        if (!handler.promise) {
            continue;
        }

        if (error) {
            handler.promise.reject(error);

        } else if (isPromise(result)) {
            result.then(res => { handler.promise.resolve(res); },
                        err => { handler.promise.reject(err);  });

        } else {
            handler.promise.resolve(result);
        }
    }
};

SyncPromise.prototype.then = function(onSuccess, onError) {

    var promise = new SyncPromise(null, this);

    this.handlers.push({
        promise: promise,
        onSuccess: onSuccess,
        onError: onError
    });

    this.hasHandlers = true;

    this.dispatch();

    return promise;
};

SyncPromise.prototype.catch = function(onError) {
    return this.then(null, onError);
};

SyncPromise.prototype.finally = function(handler) {
    return this.then(function(result) {
        return SyncPromise.try(handler)
            .then(() => {
                return result;
            });
    }, function(error) {
        return SyncPromise.try(handler)
            .then(() => {
                throw err;
            });
    });
};

SyncPromise.all = function(promises) {

    var promise = new SyncPromise();
    var count = promises.length;
    var results = [];

    for (let i = 0; i < promises.length; i++) {

        let prom = isPromise(promises[i]) ? promises[i] : SyncPromise.resolve(promises[i]);

        prom.then(function(result) {
            results[i] = result;
            count -= 1;
            if (count === 0) {
                promise.resolve(results);
            }
        }, function(err) {
            promise.reject(err);
        });
    }

    if (!count) {
        promise.resolve(results);
    }

    return promise;
};

SyncPromise.onPossiblyUnhandledException = function syncPromiseOnPossiblyUnhandledException(handler) {
    possiblyUnhandledPromiseHandlers.push(handler);
};

SyncPromise.try = function syncPromiseTry(method) {
    return SyncPromise.resolve().then(method);
}

SyncPromise.delay = function syncPromiseDelay(delay) {
    return new SyncPromise(resolve => {
        setTimeout(resolve, delay);
    });
}


export function patchPromise() {
    window.Promise = SyncPromise;
}
