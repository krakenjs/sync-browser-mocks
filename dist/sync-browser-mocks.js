(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define("syncBrowserMocks", [], factory);
	else if(typeof exports === 'object')
		exports["syncBrowserMocks"] = factory();
	else
		root["syncBrowserMocks"] = factory();
})(this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	exports.patchAll = patchAll;

	var _postMessage = __webpack_require__(1);

	Object.keys(_postMessage).forEach(function (key) {
	    if (key === "default") return;
	    Object.defineProperty(exports, key, {
	        enumerable: true,
	        get: function get() {
	            return _postMessage[key];
	        }
	    });
	});

	var _promise = __webpack_require__(2);

	Object.keys(_promise).forEach(function (key) {
	    if (key === "default") return;
	    Object.defineProperty(exports, key, {
	        enumerable: true,
	        get: function get() {
	            return _promise[key];
	        }
	    });
	});

	var _timeout = __webpack_require__(3);

	Object.keys(_timeout).forEach(function (key) {
	    if (key === "default") return;
	    Object.defineProperty(exports, key, {
	        enumerable: true,
	        get: function get() {
	            return _timeout[key];
	        }
	    });
	});

	var _xhr = __webpack_require__(4);

	Object.keys(_xhr).forEach(function (key) {
	    if (key === "default") return;
	    Object.defineProperty(exports, key, {
	        enumerable: true,
	        get: function get() {
	            return _xhr[key];
	        }
	    });
	});
	function patchAll() {
	    (0, _postMessage.patchPostMessage)();
	    (0, _promise.patchPromise)();
	    (0, _timeout.patchSetTimeout)();
	    (0, _timeout.patchSetInterval)();
	    (0, _xhr.patchXmlHttpRequest)();
	}

/***/ },
/* 1 */
/***/ function(module, exports) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.patchPostMessage = patchPostMessage;
	function patchPostMessage() {}

/***/ },
/* 2 */
/***/ function(module, exports) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	exports.patchPromise = patchPromise;
	var SyncPromise = exports.SyncPromise = function SyncPromise(handler) {

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

	SyncPromise.resolve = function (value) {
	    return new SyncPromise().resolve(value);
	};

	SyncPromise.reject = function (error) {
	    return new SyncPromise().reject(error);
	};

	SyncPromise.prototype.resolve = function (result) {
	    if (this.resolved || this.rejected) {
	        return this;
	    }

	    this.resolved = true;
	    this.value = result;
	    this.dispatch();

	    return this;
	};

	SyncPromise.prototype.reject = function (error) {
	    if (this.resolved || this.rejected) {
	        return this;
	    }

	    this.rejected = true;
	    this.value = error;
	    this.dispatch();

	    return this;
	};

	SyncPromise.prototype.dispatch = function () {

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
	            result.then(function (res) {
	                return handler.promise.resolve(res);
	            }, function (err) {
	                return handler.promise.reject(err);
	            });
	        } else {
	            handler.promise.resolve(result);
	        }
	    }
	};

	SyncPromise.prototype.then = function (onSuccess, onError) {

	    var promise = new SyncPromise();

	    this.handlers.push({
	        promise: promise,
	        onSuccess: onSuccess,
	        onError: onError
	    });

	    this.dispatch();

	    return promise;
	};

	SyncPromise.prototype["catch"] = function (onError) {
	    return this.then(null, onError);
	};

	function patchPromise() {
	    window.Promise = SyncPromise;
	}

/***/ },
/* 3 */
/***/ function(module, exports) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	exports.syncSetTimeout = syncSetTimeout;
	exports.syncClearTimeout = syncClearTimeout;
	exports.syncSetInterval = syncSetInterval;
	exports.syncClearInterval = syncClearInterval;
	exports.patchSetTimeout = patchSetTimeout;
	exports.patchSetInterval = patchSetInterval;

	var timeoutTasks = [];

	var windowSetTimeout = window.setTimeout;
	var windowClearTimeout = window.clearTimeout;

	var timeoutCount = 0;

	var LESSER = -1;
	var GREATER = 1;

	function findIndex(array, method) {

	    if (!array) {
	        return;
	    }

	    for (var i = 0; i < array.length; i++) {
	        if (method(array[i])) {
	            return i;
	        }
	    }
	}

	function syncSetTimeout(method, time) {

	    time = time || 0;

	    var id = windowSetTimeout(function () {
	        timeoutTasks.splice(timeoutTasks.indexOf(task), 1);
	        method();
	    }, time);

	    var task = {
	        id: id,
	        time: time,
	        method: method,
	        count: timeoutCount++
	    };

	    timeoutTasks.push(task);

	    return id;
	}

	function syncClearTimeout(id) {
	    if (id === undefined) {
	        return;
	    }

	    windowClearTimeout(id);

	    var index = findIndex(timeoutTasks, function (task) {
	        return task.id === id;
	    });
	    timeoutTasks.splice(index, 1);
	}

	syncSetTimeout.flush = function () {

	    while (timeoutTasks.length) {
	        timeoutTasks.sort(function (a, b) {
	            if (a.time === b.time) {
	                return a.count < b.count ? LESSER : GREATER;
	            }
	            return a.time < b.time ? LESSER : GREATER;
	        });
	        var task = timeoutTasks.shift();
	        task.method();
	        clearInterval(task.id);
	    }
	};

	var intervalTasks = [];
	var windowSetInterval = window.setInterval;
	var windowClearInterval = window.clearInterval;
	var intervalCount = 0;

	function syncSetInterval(method, time) {

	    var id = windowSetInterval(method, time);

	    var task = {
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

	    var index = findIndex(intervalTasks, function (task) {
	        return task.id === id;
	    });
	    intervalTasks.splice(index, 1);
	}

	syncSetInterval.cycle = function () {

	    var length = intervalTasks.length;

	    for (var i = 0; i < length; i++) {
	        var task = intervalTasks[i];
	        task.method();
	        windowClearInterval(task.id);
	        setInterval(task.method, task.time);
	    }
	}; // eslint-disable-line semi

	function patchSetTimeout() {
	    window.setTimeout = syncSetTimeout;
	    window.clearTimeout = syncClearTimeout;
	}

	function patchSetInterval() {
	    window.setInterval = syncSetInterval;
	    window.clearInterval = syncClearInterval;
	}

/***/ },
/* 4 */
/***/ function(module, exports) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	exports.$mockEndpoint = $mockEndpoint;
	exports.SyncXMLHttpRequest = SyncXMLHttpRequest;
	exports.patchXmlHttpRequest = patchXmlHttpRequest;

	var endpoints = [];

	function $mockEndpoint(options) {

	    options.method = options.method || 'GET';

	    if (typeof options.uri === 'string') {
	        options.uri = options.uri.replace(/\?/g, '\\?');
	    }

	    this.status = options.status || 200;

	    this.rawMethod = options.method.toString();
	    this.rawUri = options.uri.toString();

	    this.method = options.method instanceof RegExp ? options.method : new RegExp(options.method, 'i');
	    this.uri = options.uri instanceof RegExp ? options.uri : new RegExp(options.uri, 'i');

	    this.handler = options.handler;
	    this.data = options.data;

	    endpoints.unshift(this);
	}

	$mockEndpoint.prototype = {

	    enabled: false,
	    expect: false,
	    called: false,

	    listen: function listen() {
	        this.listening = true;
	        this.enable();
	        return this;
	    },

	    enable: function enable() {
	        this.enabled = true;
	        return this;
	    },
	    disable: function disable() {
	        this.enabled = false;
	        this.expect = false;
	        return this;
	    },
	    match: function match(method, uri) {
	        return Boolean(this.method.test(method) && this.uri.test(uri));
	    },
	    call: function call(data, params) {

	        this.called = true;

	        if (this.handler) {
	            return this.handler(data, params);
	        }

	        return this.data;
	    },


	    expectCalls: function expectCalls() {

	        endpoints.splice(endpoints.indexOf(this), 1);
	        endpoints.unshift(this);

	        this.expect = true;
	        this.called = false;

	        this.enable();
	        return this;
	    },

	    done: function done() {

	        var notCalled = this.expect && !this.called;

	        if (!this.listening) {
	            this.disable();
	        }

	        this.expect = false;
	        this.called = false;

	        if (notCalled) {
	            throw new Error('Expected call to ' + this.rawMethod + ' ' + this.rawUri);
	        }
	    }
	};

	$mockEndpoint.register = function (options) {
	    return new $mockEndpoint(options);
	};

	$mockEndpoint.find = function (method, uri) {

	    var match;

	    endpoints.some(function (endpoint) {
	        if (endpoint.match(method, uri) && endpoint.enabled) {
	            match = endpoint;
	            return match;
	        }
	    });

	    return match;
	};

	function SyncXMLHttpRequest() {};

	SyncXMLHttpRequest.prototype = {

	    listen: function listen() {},

	    open: function open(method, uri) {
	        var _this = this;

	        this.method = method;
	        this.uri = uri;
	        this.mock = $mockEndpoint.find(method, uri);
	        this.params = {};
	        var params = uri.indexOf('?') >= 0 ? uri.substr(uri.indexOf('?') + 1).split('&') : [];
	        params.forEach(function (param) {
	            var temp = param.split('=');
	            _this.params[decodeURIComponent(temp[0])] = decodeURIComponent(temp[1]);
	        });

	        if (!this.mock) {
	            throw new Error('Unexpected ' + method.toUpperCase() + ' ' + uri);
	        }
	    },

	    setRequestHeader: function setRequestHeader() {},

	    getResponseHeader: function getResponseHeader() {},

	    getAllResponseHeaders: function getAllResponseHeaders() {
	        return 'Content-Type: application/json';
	    },

	    send: function send(data) {
	        var _this2 = this;

	        if (data) {
	            data = JSON.parse(data);
	        }

	        console.debug('REQUEST', this.method, this.uri, data);

	        var response = this.mock.call(data, this.params);

	        this._respond(this.mock.status, response);

	        var callback = void 0;

	        var descriptor = {
	            get: function get() {
	                return callback;
	            },
	            set: function set(value) {
	                callback = value;
	                _this2._respond(_this2.mock.status, response);
	            }
	        };

	        Object.defineProperty(this, 'onreadystatechange', descriptor);
	        Object.defineProperty(this, 'onload', descriptor);
	    },

	    _respond: function _respond(status, response) {

	        if (this._responded) {
	            return;
	        }

	        var callback = this.onreadystatechange || this.onload;

	        if (!callback) {
	            return;
	        }

	        this._responded = true;

	        console.debug('RESPONSE', status, JSON.stringify(response, 0, 2));

	        this.status = status;
	        this.response = this.responseText = JSON.stringify(response);
	        this.readyState = 4;

	        callback.call(this);
	    }
	};

	function patchXmlHttpRequest() {
	    window.XMLHttpRequest = SyncXMLHttpRequest;
	}

/***/ }
/******/ ])
});
;