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
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	exports.patchAll = patchAll;

	var _timeout = __webpack_require__(1);

	Object.keys(_timeout).forEach(function (key) {
	    if (key === "default" || key === "__esModule") return;
	    Object.defineProperty(exports, key, {
	        enumerable: true,
	        get: function get() {
	            return _timeout[key];
	        }
	    });
	});

	var _xhr = __webpack_require__(2);

	Object.keys(_xhr).forEach(function (key) {
	    if (key === "default" || key === "__esModule") return;
	    Object.defineProperty(exports, key, {
	        enumerable: true,
	        get: function get() {
	            return _xhr[key];
	        }
	    });
	});

	var _webSocket = __webpack_require__(3);

	Object.keys(_webSocket).forEach(function (key) {
	    if (key === "default" || key === "__esModule") return;
	    Object.defineProperty(exports, key, {
	        enumerable: true,
	        get: function get() {
	            return _webSocket[key];
	        }
	    });
	});

	var _websocket = __webpack_require__(4);

	function patchAll() {
	    (0, _timeout.patchSetTimeout)();
	    (0, _timeout.patchSetInterval)();
	    (0, _xhr.patchXmlHttpRequest)();
	    (0, _websocket.patchWebSocket)();
	}

/***/ }),
/* 1 */
/***/ (function(module, exports) {

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

/***/ }),
/* 2 */
/***/ (function(module, exports) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	exports.$mockEndpoint = $mockEndpoint;
	exports.SyncXMLHttpRequest = SyncXMLHttpRequest;
	exports.patchXmlHttpRequest = patchXmlHttpRequest;

	var endpoints = [];

	function $mockEndpoint(options) {
	    var _this = this;

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

	    if (options.headers) {
	        this.headers = {};
	        Object.keys(options.headers).forEach(function (key) {
	            _this.headers[key.toLowerCase()] = options.headers[key];
	        });
	    } else {
	        this.headers = {
	            'content-type': 'application/json'
	        };
	    }

	    endpoints.unshift(this);
	}

	$mockEndpoint.prototype = {

	    enabled: false,
	    expect: false,
	    called: false,
	    listeners: [],

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
	    call: function call(options) {

	        this.called = true;

	        this.listeners.forEach(function (listener) {
	            return listener();
	        });

	        if (this.handler) {
	            return this.handler(options);
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
	    onCall: function onCall(listener) {
	        this.listeners.push(listener);
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

	function SyncXMLHttpRequest() {
	    this._requestHeaders = {};
	    this._eventHandlers = {};
	}

	SyncXMLHttpRequest.prototype = {

	    DONE: 4,

	    listen: function listen() {},
	    open: function open(method, uri) {
	        var _this2 = this;

	        this.method = method;
	        this.uri = uri;
	        this.mock = $mockEndpoint.find(method, uri);
	        this.query = {};
	        var params = uri.indexOf('?') >= 0 ? uri.substr(uri.indexOf('?') + 1).split('&') : [];
	        params.forEach(function (param) {
	            var temp = param.split('=');
	            _this2.query[decodeURIComponent(temp[0])] = decodeURIComponent(temp[1]);
	        });

	        if (!this.mock) {
	            throw new Error('Unexpected ' + method.toUpperCase() + ' ' + uri);
	        }
	    },
	    addEventListener: function addEventListener(name, handler) {
	        this._eventHandlers[name] = this._eventHandlers[name] || [];
	        this._eventHandlers[name].push(handler);
	    },
	    setRequestHeader: function setRequestHeader(key, value) {
	        this._requestHeaders[key.toLowerCase()] = value;
	    },
	    getResponseHeader: function getResponseHeader(name) {
	        return this.mock.headers[name.toLowerCase()];
	    },
	    getAllResponseHeaders: function getAllResponseHeaders() {
	        var _this3 = this;

	        return Object.keys(this.mock.headers).map(function (key) {
	            return key + ': ' + _this3.mock.headers[key];
	        }).join('\n');
	    },
	    send: function send(data) {
	        var _this4 = this;

	        if (data && this._requestHeaders['content-type'] === 'application/json') {
	            data = JSON.parse(data);
	        }

	        console.debug('REQUEST', this.method, this.uri, data);

	        var response = this.mock.call({ data: data, query: this.query, headers: this._requestHeaders });

	        this._respond(this.mock.status, response);

	        var callback = void 0;

	        var descriptor = {
	            get: function get() {
	                return callback;
	            },
	            set: function set(value) {
	                callback = value;
	                _this4._respond(_this4.mock.status, response);
	            }
	        };

	        Object.defineProperty(this, 'onreadystatechange', descriptor);
	        Object.defineProperty(this, 'onload', descriptor);
	    },
	    _respond: function _respond(status, response) {

	        if (this._responded) {
	            return;
	        }

	        this.status = status;
	        this.response = this.responseText = JSON.stringify(response);
	        this.readyState = 4;

	        if (this._eventHandlers.load) {
	            var _iteratorNormalCompletion = true;
	            var _didIteratorError = false;
	            var _iteratorError = undefined;

	            try {
	                for (var _iterator = this._eventHandlers.load[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
	                    var handler = _step.value;

	                    handler.call(this);
	                }
	            } catch (err) {
	                _didIteratorError = true;
	                _iteratorError = err;
	            } finally {
	                try {
	                    if (!_iteratorNormalCompletion && _iterator['return']) {
	                        _iterator['return']();
	                    }
	                } finally {
	                    if (_didIteratorError) {
	                        throw _iteratorError;
	                    }
	                }
	            }
	        }

	        var callback = this.onreadystatechange || this.onload;

	        if (!callback) {
	            return;
	        }

	        this._responded = true;

	        console.debug('RESPONSE', status, JSON.stringify(response, 0, 2));

	        callback.call(this);
	    }
	};

	function patchXmlHttpRequest() {
	    window.XMLHttpRequest = SyncXMLHttpRequest;
	}

/***/ }),
/* 3 */
/***/ (function(module, exports) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	exports.mockWebSocket = mockWebSocket;
	exports.patchWebSocket = patchWebSocket;

	var mockWebSockets = [];

	function mockWebSocket(_ref) {
	    var uri = _ref.uri,
	        handler = _ref.handler;

	    var listening = false;
	    var hasCalls = false;

	    var mock = {
	        isListening: function isListening(mockUri) {
	            return listening && mockUri === uri;
	        },
	        listen: function listen() {
	            listening = true;
	            return {
	                cancel: function cancel() {
	                    listening = false;
	                }
	            };
	        },
	        receive: function receive(_ref2) {
	            var receiveData = _ref2.data,
	                socket = _ref2.socket;

	            hasCalls = true;

	            handler({
	                data: receiveData,
	                send: function send(sendData) {
	                    if (socket.onmessage) {
	                        socket.onmessage({
	                            data: sendData
	                        });
	                    }
	                }
	            });
	        },
	        expect: function expect() {
	            listening = true;
	            return {
	                done: function done() {
	                    listening = false;
	                    if (!hasCalls) {
	                        throw new Error('Expected websocket calls');
	                    }
	                }
	            };
	        }
	    };

	    mockWebSockets.push(mock);

	    return mock;
	}

	function SyncWebSocket(socketUri) {
	    var socket = {
	        send: function send(data) {
	            for (var i = mockWebSockets.length - 1; i >= 0; i--) {
	                var mock = mockWebSockets[i];

	                if (mock.isListening(socketUri)) {
	                    mock.receive({ data: data, socket: socket });
	                    return;
	                }
	            }
	        }
	    };

	    setTimeout(function () {
	        if (socket.onopen) {
	            socket.onopen();
	        }
	    });

	    return socket;
	}

	function patchWebSocket() {
	    window.WebSocket = SyncWebSocket;
	}

/***/ }),
/* 4 */
/***/ (function(module, exports) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	exports.mockWebSocket = mockWebSocket;
	exports.patchWebSocket = patchWebSocket;

	var mockWebSockets = [];

	function mockWebSocket(_ref) {
	    var uri = _ref.uri,
	        handler = _ref.handler;

	    var listening = false;
	    var hasCalls = false;

	    var mock = {
	        isListening: function isListening(mockUri) {
	            return listening && mockUri === uri;
	        },
	        listen: function listen() {
	            listening = true;
	            return {
	                cancel: function cancel() {
	                    listening = false;
	                }
	            };
	        },
	        receive: function receive(_ref2) {
	            var receiveData = _ref2.data,
	                socket = _ref2.socket;

	            hasCalls = true;

	            handler({
	                data: receiveData,
	                send: function send(sendData) {
	                    if (socket.onmessage) {
	                        socket.onmessage({
	                            data: sendData
	                        });
	                    }
	                }
	            });
	        },
	        expect: function expect() {
	            listening = true;
	            return {
	                done: function done() {
	                    listening = false;
	                    if (!hasCalls) {
	                        throw new Error('Expected websocket calls');
	                    }
	                }
	            };
	        }
	    };

	    mockWebSockets.push(mock);

	    return mock;
	}

	function SyncWebSocket(socketUri) {
	    var socket = {
	        send: function send(data) {
	            for (var i = mockWebSockets.length - 1; i >= 0; i--) {
	                var mock = mockWebSockets[i];

	                if (mock.isListening(socketUri)) {
	                    mock.receive({ data: data, socket: socket });
	                    return;
	                }
	            }
	        }
	    };

	    setTimeout(function () {
	        if (socket.onopen) {
	            socket.onopen();
	        }
	    });

	    return socket;
	}

	function patchWebSocket() {
	    window.WebSocket = SyncWebSocket;
	}

/***/ })
/******/ ])
});
;