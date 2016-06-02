
export var SyncPromise = function SyncPromise(handler) {

    this.resolved = false;
    this.rejected = false;

    this.handlers = [];

    if (!handler) {
        return;
    }

    var self = this;

    handler(function resolver(result) {
        self.resolve(result);
    }, function rejector(error) {
        self.reject(error);
    });
};

SyncPromise.resolve = function(value) {
    return new SyncPromise().resolve(value);
};

SyncPromise.reject = function(error) {
    return new SyncPromise().reject(error);
};

SyncPromise.prototype.resolve = function(result) {
    if (this.resolved || this.rejected) {
        return this;
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

        var handler = this.handlers.shift();

        var result, error;

        try {
            if (this.resolved) {
                result = handler.onSuccess ? handler.onSuccess(this.value) : this;
            } else {
                result = handler.onError ? handler.onError(this.value) : this;
            }
        } catch (err) {
            console.log(err.stack || err.toString());
            error = err;
        }

        if (error) {
            handler.promise.reject(error);

        } else if (result instanceof SyncPromise) {
            result.then(res => handler.promise.resolve(res),
                        err => handler.promise.reject(err));

        } else {
            handler.promise.resolve(result);
        }
    }

};

SyncPromise.prototype.then = function(onSuccess, onError) {

    var promise = new SyncPromise();

    this.handlers.push({
        promise: promise,
        onSuccess: onSuccess,
        onError: onError
    });

    this.dispatch();

    return promise;
};

SyncPromise.prototype.catch = function(onError) {
    return this.then(null, onError);
};


export function patchPromise() {
    window.Promise = SyncPromise;
}
