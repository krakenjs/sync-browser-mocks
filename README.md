Sync Browser Mocks
------------------

Synchronous browser mocks for common async browser apis: `window.postMessage`, `window.Promise`, `window.setTimeout`, `window.setInterval`, `window.XmlHttpRequest`

These mocks make it dramatically easier to write tests for browser-based code, by making the above utilities synchronous.
This way, you can write synchronous tests without having to care about timeouts, race conditions, and tests which pass sometimes
and fail other times because some async api did not return on time.

Inspired by [ngMock](https://docs.angularjs.org/api/ngMock)'s `$timeout`, `$interval` and `$httpBackend`, but works independently of Angular.

### Usage

```javascript
require('sync-browser-mocks').patchAll();
```

### Promise

```javascript
require('sync-browser-mocks').patchPromise();
```

No additional changes are needed to use synchronous Promises: as soon as your promise is resolved, rather than waiting for the next tick, your `.then()` and `.catch()` handlers will be immediately invoked.

```javascript
var x = new Promise(function(resolve) {
    resolve('foobar');
});

x.then(function() {
    console.log('This will be logged first');
});

console.log('This will be logged second');
```

Obviously, this relies on your code not containing any race conditions where you explicitly rely on `.then()` being called on the next tick.
These situations might break if you're using synchronous promises -- but that's a good thing, as they should be factored out.

### setTimeout

```javascript
require('sync-browser-mocks').patchSetTimeout();
```

Any time you want to flush any pending timeout functions, you will need to call `setTimeout.flush()`. For example:

```javascript
setTimeout(function() {
    console.log('This will be logged second');
}, 200);

setTimeout(function() {
    console.log('This will be logged first');
}, 100);

setTimeout.flush();
```


### setInterval

```javascript
require('sync-browser-mocks').patchSetInterval();
```

Any time you want to flush any pending interval functions, you will need to call `setInterval.cycle()`. For example:

```javascript
setInterval(function() {
    console.log('This will be logged second');
}, 200);

setInterval(function() {
    console.log('This will be logged first');
}, 100);

setInterval.cycle();
setInterval.cycle();
```


### XmlHttpRequest

```javascript
require('sync-browser-mocks').patchXmlHttpRequest();
```

This module sets up a mock http backend you can use to handle incoming ajax requests:

```javascript
var $mockEndpoint = require('sync-browser-mocks').$mockEndpoint;

$mockEndpoint.register({
    method: 'GET',
    uri: '/api/user/.+',
    data: {
        name: 'Zippy the Pinhead'
    }
}).listen();
```

Dynamic handler:

```javascript
$mockEndpoint.register({
    method: 'GET',
    uri: '/api/user/.+',
    handler: function() {
        return {
            name: 'Zippy the Pinhead'
        };
    }
}).listen();
```

Expecting calls in a test:

```javascript
var $mockEndpoint = require('sync-browser-mocks').$mockEndpoint;

var myListener = $mockEndpoint.register({
    method: 'GET',
    uri: '/api/user/.+',
    data: {
        name: 'Zippy the Pinhead'
    }
});

it('should correctly call /api/user', function() {

    myListener.expectCalls();
    
    // Run some code which would call the api

    myListener.done(); // This will throw if the api was not called
});
```
