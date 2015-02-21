# Gard

Gard is a dead simple library which protects your object against illegal access from outside using permissions definition you pass. And these permissions could be also dynamically generated so you can control access by currently logged user. Code is better than thousands of words.

## Usage

```js
var obj = {
    foo: 'bar',
    quo: 'vadis'
};

var perms = {
    foo: gard.READ
};

var handler = function (prop) {
    return 'cannot access the property: ' + prop;
};

var garded = gard(obj, perms);

garded.foo; // => "bar"
garded.quo; // => "cannot access the property: quo"
```

## IMPORTANT NOTE

Gard uses EcmaScript 6 [Proxy](https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Proxy) object. At the moment, Proxy is not [widely supported](https://kangax.github.io/compat-table/es6/#Proxy) but you can use a [shim](https://github.com/tvcutsem/harmony-reflect). Gard is not written for production ready sites, it's mostly for my learning purposes and maybe it can help somebody.

## Installation

### Node.js / io.js

```bash
$ npm install gard
```

```js
var gard = require('gard')
```

### Browser

```html
<script src="path/to/gard.min.js"></script>
```

```js
window.gard;
```

## More examples

```js
var countdown = {
    value: 10,
    tick: function () {
        console.log(this.value);
        this.value--;
    },
    start: function () {
        this.tick();

        if (!this.value) return;

        var self = this;
        setTimeout(function () {
            self.start();
        }, 1000);
    }
};

countdown = gard(countdown, {
    value: gard.READ,
    start: gard.CALL
}, function (property, object, action, type) {
    console.log('forbidden');
    if (type == 'function') return Function();
});

countdown.value = 5; // => "forbidden"
countdown.tick(); // => "forbidden"

countdown.start(); // => 10, 9, 8, ...

setTimeout(function () {
    console.log(countdown.value); // => 7
}, 2500);
```

## Known issues

- Gard does not support access permissions for nested objects yet.

```js
var garded = gard({
    nested: {
        property: 'foo'
    }
}, {
    nested: gard.READ
});

garded.nested.property = 'bar';
console.log(garded.nested.property); // => "bar" - wrong
```

## Todo

- add support for nested objects
- find a way how to test Gard (`harmony-reflect` does not work on all platforms)
- improve documentation

## License

Gard is MIT licensed. Feel free to use it, contribute or spread the word. Created with love by Petr Nevyhoštěný ([Twitter](https://twitter.com/pnevyk)).
