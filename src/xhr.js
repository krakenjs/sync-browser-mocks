import { ZalgoPromise } from 'zalgo-promise';

var endpoints = [];

export function $mockEndpoint(options) {

    options.method = options.method || 'GET';

    if (typeof options.uri === 'string') {
        options.uri = options.uri.replace(/\?/g, '\\?');
    }

    this.status = options.status || 200;

    this.rawMethod = options.method.toString();
    this.rawUri = options.uri.toString();

    this.method = (options.method instanceof RegExp) ? options.method : new RegExp(options.method, 'i');
    this.uri = (options.uri instanceof RegExp) ? options.uri : new RegExp(options.uri, 'i');

    this.handler = options.handler;
    this.data = options.data;

    if (options.headers) {
        this.headers = {};
        Object.keys(options.headers).forEach(key => {
            this.headers[key.toLowerCase()] = options.headers[key];
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

    listen() {
        this.listening = true;
        this.enable();
        return this;
    },

    enable() {
        this.enabled = true;
        return this;
    },

    disable() {
        this.enabled = false;
        this.expect = false;
        return this;
    },

    match(method, uri) {
        return Boolean(this.method.test(method) && this.uri.test(uri));
    },

    call(options) {

        this.called = true;

        this.listeners.forEach(listener => listener());

        if (this.handler) {
            return this.handler(options);
        }

        return this.data;
    },

    expectCalls() {

        endpoints.splice(endpoints.indexOf(this), 1);
        endpoints.unshift(this);

        this.expect = true;
        this.called = false;

        this.enable();
        return this;
    },

    onCall(listener) {
        this.listeners.push(listener);
    },

    done() {

        var notCalled = this.expect && !this.called;

        if (!this.listening) {
            this.disable();
        }

        this.expect = false;
        this.called = false;

        if (notCalled) {
            throw new Error(`Expected call to ${this.rawMethod} ${this.rawUri}`);
        }
    }
};


$mockEndpoint.register = function(options) {
    return new $mockEndpoint(options);
};

$mockEndpoint.find = function(method, uri) {

    var match;

    endpoints.some(endpoint => {
        if (endpoint.match(method, uri) && endpoint.enabled) {
            match = endpoint;
            return match;
        }
    });

    return match;
};


export function SyncXMLHttpRequest() {
    this._requestHeaders = {};
    this._eventHandlers = {};
}

SyncXMLHttpRequest.prototype = {

    DONE: 4,

    listen() {

    },

    open(method, uri) {
        this.method = method;
        this.uri = uri;
        this.mock = $mockEndpoint.find(method, uri);
        this.query = {};
        var params = uri.indexOf('?') >= 0 ? uri.substr(uri.indexOf('?') + 1).split('&') : [];
        params.forEach((param) => {
            var temp = param.split('=');
            this.query[decodeURIComponent(temp[0])] = decodeURIComponent(temp[1]);
        });

        if (!this.mock) {
            throw new Error(`Unexpected ${method.toUpperCase()} ${uri}`);
        }
    },

    addEventListener(name, handler) {
        this._eventHandlers[name] = this._eventHandlers[name] || [];
        this._eventHandlers[name].push(handler);
    },

    setRequestHeader(key, value) {
        this._requestHeaders[key.toLowerCase()] = value;
    },

    getResponseHeader(name) {
        return this.mock.headers[name.toLowerCase()];
    },

    getAllResponseHeaders() {
        return Object.keys(this.mock.headers).map(key => {
            return `${key}: ${this.mock.headers[key]}`;
        }).join('\n');
    },

    send(data) {

        if (data && this._requestHeaders['content-type'] === 'application/json') {
            data = JSON.parse(data);
        }

        console.debug('REQUEST', this.method, this.uri, data);

        ZalgoPromise.try(() => {
            return this.mock.call({ uri: this.uri, method: this.method, data, query: this.query, headers: this._requestHeaders });
        }).then(response => {
            return { response, status: this.mock.status };
        }).catch(err => {
            return { response: err.stack || err.toString, status: 500 };
        }).then(({ response, status }) => {
            this._respond(status, response);

            let callback;
    
            let descriptor = {
                get: () => {
                    return callback;
                },
                set: (value) => {
                    callback = value;
                    this._respond(this.mock.status, response);
                }
            };
    
            Object.defineProperty(this, 'onreadystatechange', descriptor);
            Object.defineProperty(this, 'onload', descriptor);
        });
    },

    _respond(status, response) {

        if (this._responded) {
            return;
        }

        this.status = status;
        this.response = this.responseText = JSON.stringify(response);
        this.readyState = 4;

        if (this._eventHandlers.load) {
            for (let handler of this._eventHandlers.load) {
                handler.call(this);
            }
        }

        let callback = this.onreadystatechange || this.onload;

        if (!callback) {
            return;
        }

        this._responded = true;

        console.debug('RESPONSE', status, JSON.stringify(response, 0, 2));

        callback.call(this);
    }
};


export function patchXmlHttpRequest() {
    window.XMLHttpRequest = SyncXMLHttpRequest;
}
