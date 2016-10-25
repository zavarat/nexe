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

The new file for constructing nexe! It supports, for now, the old `nexe.compile` method,
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

* [x] config: Implement `python`
* [ ] config: Implement ``
* [x] download: fix node extract first time version resolve bug
* [ ] compile: copy generated executable to output.
