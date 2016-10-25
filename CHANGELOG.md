# Pre v2

## Modules.

In an effort to reduce clatter and overall file size, I've made a system of
loading "modules" and instancing them.

Every file in ./lib is loaded into nexe.libs. Each module is instanced with two
objects (accessible via constructor), `(libs, config)`.

`libs` - access to the nexe.libs object, to allow modules to interact with one
another.

`config` - config object that nexe was instanced with.

### Log

This is the log object for nexe. Accessible via libs.log

It provides `1` method:

`log.log` - log output to the console.

This uses `debug`


### libs/download.js

* Downloads are now stored $TEMP/<framework>/<version> instead of $TEMP/<framework>/<version>/node-v<version>
* Node latest version no longer returns actual version in directory structure.

### construct.js

The new file for constructing nexe! It supports, for now, the old nexe.compile method,
but also has a new method. Construction:

```js
let nexe = new Nexe({
  input: './something.js',
  output: 'out.nexe',
  temp: './temp'
});
```

Which takes the old package.json format.

## package.json

New methods:

```js
{
  "package_method": "browserify" // or nexe, soon to be webpack, and jspack.
}
```

Since some packages work only with browserify or nexe's old packaging method, we support the ability to try both!


# TODO

* [ ] config: Implement `python`
* [ ] config: Implement ``
* [ ] download: fix node extract first time version resolve bug

Last Bug log:

```make
es.cc" CORE ../../src/js/macros.py ../../src/messages.h ../../src/js/prologue.js ../../src/js/runtime.js ../../src/js/v8natives.js ../../src/js/symbol.js ../../src/js/array.js ../../src/js/string.js ../../src/js/uri.js ../../src/js/math.js ../../src/third_party/fdlibm/fdlibm.js ../../src/js/regexp.js ../../src/js/arraybuffer.js ../../src/js/typedarray.js ../../src/js/iterator-prototype.js ../../src/js/generator.js ../../src/js/object-observe.js ../../src/js/collection.js ../../src/js/weak-collection.js ../../src/js/collection-iterator.js ../../src/js/promise.js ../../src/js/messages.js ../../src/js/json.js ../../src/js/array-iterator.js ../../src/js/string-iterator.js ../../src/js/templates.js ../../src/js/spread.js ../../src/js/proxy.js ../../src/debug/mirrors.js ../../src/debug/debug.js ../../src/debug/liveedit.js ../../src/js/i18n.js
  File "../../tools/js2c.py", line 189
    /usr/bin/python2match = PYTHON_MACRO_PATTERN.match(line)
    ^
SyntaxError: invalid syntax
make[1]: *** [deps/v8/tools/gyp/js2c.target.mk:13: /home/<>/Code/nexe/temp/node/latest/node-v6.9.1/out/Release/obj/gen/libraries.cc] Error 1
make[1]: Leaving directory '/home/<>/Code/nexe/temp/node/latest/node-v6.9.1/out'
make: *** [Makefile:67: node] Error 2
```
