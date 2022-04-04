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

	var _webSocket = __webpack_require__(5);

	Object.keys(_webSocket).forEach(function (key) {
	    if (key === "default" || key === "__esModule") return;
	    Object.defineProperty(exports, key, {
	        enumerable: true,
	        get: function get() {
	            return _webSocket[key];
	        }
	    });
	});

	var _websocket = __webpack_require__(6);

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
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	exports.$mockEndpoint = $mockEndpoint;
	exports.SyncXMLHttpRequest = SyncXMLHttpRequest;
	exports.patchXmlHttpRequest = patchXmlHttpRequest;

	var _zalgoPromise = __webpack_require__(3);

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

	        _zalgoPromise.ZalgoPromise['try'](function () {
	            return _this4.mock.call({ uri: _this4.uri, method: _this4.method, data: data, query: _this4.query, headers: _this4._requestHeaders });
	        }).then(function (response) {
	            return { response: response, status: _this4.mock.status };
	        })['catch'](function (err) {
	            return { response: err.stack || err.toString, status: 500 };
	        }).then(function (_ref) {
	            var response = _ref.response,
	                status = _ref.status;

	            _this4._respond(status, response);

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

	            Object.defineProperty(_this4, 'onreadystatechange', descriptor);
	            Object.defineProperty(_this4, 'onload', descriptor);
	        });
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
/***/ (function(module, exports, __webpack_require__) {

	/* eslint flowtype/require-valid-file-annotation: off, import/no-commonjs: off */
	module.exports = __webpack_require__(4);


/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

	!function(e,t){ true?module.exports=t():"function"==typeof define&&define.amd?define("ZalgoPromise",[],t):"object"==typeof exports?exports.ZalgoPromise=t():e.ZalgoPromise=t()}("undefined"!=typeof self?self:this,(function(){return function(e){var t={};function r(n){if(t[n])return t[n].exports;var o=t[n]={i:n,l:!1,exports:{}};return e[n].call(o.exports,o,o.exports,r),o.l=!0,o.exports}return r.m=e,r.c=t,r.d=function(e,t,n){r.o(e,t)||Object.defineProperty(e,t,{enumerable:!0,get:n})},r.r=function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},r.t=function(e,t){if(1&t&&(e=r(e)),8&t)return e;if(4&t&&"object"==typeof e&&e&&e.__esModule)return e;var n=Object.create(null);if(r.r(n),Object.defineProperty(n,"default",{enumerable:!0,value:e}),2&t&&"string"!=typeof e)for(var o in e)r.d(n,o,function(t){return e[t]}.bind(null,o));return n},r.n=function(e){var t=e&&e.__esModule?function(){return e.default}:function(){return e};return r.d(t,"a",t),t},r.o=function(e,t){return{}.hasOwnProperty.call(e,t)},r.p="",r(r.s=0)}([function(e,t,r){"use strict";function n(e){try{if(!e)return!1;if("undefined"!=typeof Promise&&e instanceof Promise)return!0;if("undefined"!=typeof window&&"function"==typeof window.Window&&e instanceof window.Window)return!1;if("undefined"!=typeof window&&"function"==typeof window.constructor&&e instanceof window.constructor)return!1;var t={}.toString;if(t){var r=t.call(e);if("[object Window]"===r||"[object global]"===r||"[object DOMWindow]"===r)return!1}if("function"==typeof e.then)return!0}catch(e){return!1}return!1}r.r(t),r.d(t,"ZalgoPromise",(function(){return a}));var o,i=[],c=[],u=0;function s(){if(!u&&o){var e=o;o=null,e.resolve()}}function f(){u+=1}function l(){u-=1,s()}var a=function(){function e(e){var t=this;if(this.resolved=void 0,this.rejected=void 0,this.errorHandled=void 0,this.value=void 0,this.error=void 0,this.handlers=void 0,this.dispatching=void 0,this.stack=void 0,this.resolved=!1,this.rejected=!1,this.errorHandled=!1,this.handlers=[],e){var r,n,o=!1,i=!1,c=!1;f();try{e((function(e){c?t.resolve(e):(o=!0,r=e)}),(function(e){c?t.reject(e):(i=!0,n=e)}))}catch(e){return l(),void this.reject(e)}l(),c=!0,o?this.resolve(r):i&&this.reject(n)}}var t=e.prototype;return t.resolve=function(e){if(this.resolved||this.rejected)return this;if(n(e))throw new Error("Can not resolve promise with another promise");return this.resolved=!0,this.value=e,this.dispatch(),this},t.reject=function(e){var t=this;if(this.resolved||this.rejected)return this;if(n(e))throw new Error("Can not reject promise with another promise");if(!e){var r=e&&"function"==typeof e.toString?e.toString():{}.toString.call(e);e=new Error("Expected reject to be called with Error, got "+r)}return this.rejected=!0,this.error=e,this.errorHandled||setTimeout((function(){t.errorHandled||function(e,t){if(-1===i.indexOf(e)){i.push(e),setTimeout((function(){throw e}),1);for(var r=0;r<c.length;r++)c[r](e,t)}}(e,t)}),1),this.dispatch(),this},t.asyncReject=function(e){return this.errorHandled=!0,this.reject(e),this},t.dispatch=function(){var t=this.resolved,r=this.rejected,o=this.handlers;if(!this.dispatching&&(t||r)){this.dispatching=!0,f();for(var i=function(e,t){return e.then((function(e){t.resolve(e)}),(function(e){t.reject(e)}))},c=0;c<o.length;c++){var u=o[c],s=u.onSuccess,a=u.onError,h=u.promise,d=void 0;if(t)try{d=s?s(this.value):this.value}catch(e){h.reject(e);continue}else if(r){if(!a){h.reject(this.error);continue}try{d=a(this.error)}catch(e){h.reject(e);continue}}if(d instanceof e&&(d.resolved||d.rejected)){var v=d;v.resolved?h.resolve(v.value):h.reject(v.error),v.errorHandled=!0}else n(d)?d instanceof e&&(d.resolved||d.rejected)?d.resolved?h.resolve(d.value):h.reject(d.error):i(d,h):h.resolve(d)}o.length=0,this.dispatching=!1,l()}},t.then=function(t,r){if(t&&"function"!=typeof t&&!t.call)throw new Error("Promise.then expected a function for success handler");if(r&&"function"!=typeof r&&!r.call)throw new Error("Promise.then expected a function for error handler");var n=new e;return this.handlers.push({promise:n,onSuccess:t,onError:r}),this.errorHandled=!0,this.dispatch(),n},t.catch=function(e){return this.then(void 0,e)},t.finally=function(t){if(t&&"function"!=typeof t&&!t.call)throw new Error("Promise.finally expected a function");return this.then((function(r){return e.try(t).then((function(){return r}))}),(function(r){return e.try(t).then((function(){throw r}))}))},t.timeout=function(e,t){var r=this;if(this.resolved||this.rejected)return this;var n=setTimeout((function(){r.resolved||r.rejected||r.reject(t||new Error("Promise timed out after "+e+"ms"))}),e);return this.then((function(e){return clearTimeout(n),e}))},t.toPromise=function(){if("undefined"==typeof Promise)throw new TypeError("Could not find Promise");return Promise.resolve(this)},t.lazy=function(){return this.errorHandled=!0,this},e.resolve=function(t){return t instanceof e?t:n(t)?new e((function(e,r){return t.then(e,r)})):(new e).resolve(t)},e.reject=function(t){return(new e).reject(t)},e.asyncReject=function(t){return(new e).asyncReject(t)},e.all=function(t){var r=new e,o=t.length,i=[].slice();if(!o)return r.resolve(i),r;for(var c=function(e,t,n){return t.then((function(t){i[e]=t,0==(o-=1)&&r.resolve(i)}),(function(e){n.reject(e)}))},u=0;u<t.length;u++){var s=t[u];if(s instanceof e){if(s.resolved){i[u]=s.value,o-=1;continue}}else if(!n(s)){i[u]=s,o-=1;continue}c(u,e.resolve(s),r)}return 0===o&&r.resolve(i),r},e.hash=function(t){var r={},o=[],i=function(e){if(t.hasOwnProperty(e)){var i=t[e];n(i)?o.push(i.then((function(t){r[e]=t}))):r[e]=i}};for(var c in t)i(c);return e.all(o).then((function(){return r}))},e.map=function(t,r){return e.all(t.map(r))},e.onPossiblyUnhandledException=function(e){return function(e){return c.push(e),{cancel:function(){c.splice(c.indexOf(e),1)}}}(e)},e.try=function(t,r,n){if(t&&"function"!=typeof t&&!t.call)throw new Error("Promise.try expected a function");var o;f();try{o=t.apply(r,n||[])}catch(t){return l(),e.reject(t)}return l(),e.resolve(o)},e.delay=function(t){return new e((function(e){setTimeout(e,t)}))},e.isPromise=function(t){return!!(t&&t instanceof e)||n(t)},e.flush=function(){return t=o=o||new e,s(),t;var t},e}()}])}));
	//# sourceMappingURL=zalgo-promise.js.map

/***/ }),
/* 5 */
/***/ (function(module, exports) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	exports.mockWebSocket = mockWebSocket;
	exports.patchWebSocket = patchWebSocket;

	var mockWebSockets = [];
	var websockets = [];

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
	            var receiveData = _ref2.data;

	            hasCalls = true;

	            handler({
	                data: receiveData,
	                respond: function respond(sendData) {
	                    return mock.send(sendData);
	                }
	            });
	        },
	        send: function send(sendData) {
	            var _iteratorNormalCompletion = true;
	            var _didIteratorError = false;
	            var _iteratorError = undefined;

	            try {
	                for (var _iterator = websockets[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
	                    var websocket = _step.value;

	                    if (websocket.readyState === WebSocket.OPEN && websocket.onmessage) {
	                        websocket.onmessage({
	                            data: sendData
	                        });
	                        return;
	                    }
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

	    var getListeningMock = function getListeningMock() {
	        for (var i = mockWebSockets.length - 1; i >= 0; i--) {
	            var mock = mockWebSockets[i];

	            if (mock.isListening(socketUri)) {
	                return mock;
	            }
	        }
	    };

	    var socket = {
	        readyState: WebSocket.OPEN,
	        send: function send(data) {
	            if (socket.readyState !== WebSocket.OPEN) {
	                throw new Error('Socket is closed');
	            }

	            var mock = getListeningMock();
	            if (mock) {
	                mock.receive({ data: data });
	                return;
	            }
	        },
	        close: function close() {
	            socket.readyState = WebSocket.CLOSED;
	            if (socket.onclose) {
	                socket.onclose();
	            }
	        },
	        get onopen() {
	            return socket._onopen;
	        },
	        set onopen(value) {
	            socket._onopen = value;
	            if (getListeningMock()) {
	                socket._onopen();
	            }
	        },
	        get onerror() {
	            return socket._onerror;
	        },
	        set onerror(value) {
	            socket._onerror = value;
	            if (!getListeningMock()) {
	                socket._onerror(new Error('No socket server found'));
	            }
	        },
	        get onclose() {
	            return socket._onclose;
	        },
	        set onclose(value) {
	            socket._onclose = value;
	            if (!getListeningMock()) {
	                socket._onclose();
	            }
	        }
	    };

	    websockets.push(socket);

	    return socket;
	}

	SyncWebSocket.OPEN = WebSocket.OPEN;
	SyncWebSocket.CLOSED = WebSocket.CLOSED;

	function patchWebSocket() {
	    window.WebSocket = SyncWebSocket;
	}

/***/ }),
/* 6 */
/***/ (function(module, exports) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	exports.mockWebSocket = mockWebSocket;
	exports.patchWebSocket = patchWebSocket;

	var mockWebSockets = [];
	var websockets = [];

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
	            var receiveData = _ref2.data;

	            hasCalls = true;

	            handler({
	                data: receiveData,
	                respond: function respond(sendData) {
	                    return mock.send(sendData);
	                }
	            });
	        },
	        send: function send(sendData) {
	            var _iteratorNormalCompletion = true;
	            var _didIteratorError = false;
	            var _iteratorError = undefined;

	            try {
	                for (var _iterator = websockets[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
	                    var websocket = _step.value;

	                    if (websocket.readyState === WebSocket.OPEN && websocket.onmessage) {
	                        websocket.onmessage({
	                            data: sendData
	                        });
	                        return;
	                    }
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

	    var getListeningMock = function getListeningMock() {
	        for (var i = mockWebSockets.length - 1; i >= 0; i--) {
	            var mock = mockWebSockets[i];

	            if (mock.isListening(socketUri)) {
	                return mock;
	            }
	        }
	    };

	    var socket = {
	        readyState: WebSocket.OPEN,
	        send: function send(data) {
	            if (socket.readyState !== WebSocket.OPEN) {
	                throw new Error('Socket is closed');
	            }

	            var mock = getListeningMock();
	            if (mock) {
	                mock.receive({ data: data });
	                return;
	            }
	        },
	        close: function close() {
	            socket.readyState = WebSocket.CLOSED;
	            if (socket.onclose) {
	                socket.onclose();
	            }
	        },
	        get onopen() {
	            return socket._onopen;
	        },
	        set onopen(value) {
	            socket._onopen = value;
	            if (getListeningMock()) {
	                socket._onopen();
	            }
	        },
	        get onerror() {
	            return socket._onerror;
	        },
	        set onerror(value) {
	            socket._onerror = value;
	            if (!getListeningMock()) {
	                socket._onerror(new Error('No socket server found'));
	            }
	        },
	        get onclose() {
	            return socket._onclose;
	        },
	        set onclose(value) {
	            socket._onclose = value;
	            if (!getListeningMock()) {
	                socket._onclose();
	            }
	        }
	    };

	    websockets.push(socket);

	    return socket;
	}

	SyncWebSocket.OPEN = WebSocket.OPEN;
	SyncWebSocket.CLOSED = WebSocket.CLOSED;

	function patchWebSocket() {
	    window.WebSocket = SyncWebSocket;
	}

/***/ })
/******/ ])
});
;