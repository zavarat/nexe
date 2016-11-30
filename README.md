# nexe

Create a single executable from your node.js application.

### Requirements

* Python 2 (for node.js)
* Node >= 4.0

### Build Requirements

* Linux / Mac/ Windows / BSD
* Windows: Visual Studio (depends on which node ver)


### How To Use

`nexe` is invoked 2 ways.

Via CLI

```
nexe [OPTIONS]

... todo ...
```

or Via API.

```js
let nexe = new Nexe({ /* options */ });
```

## Migrating from v1 to v2

`nexe` is now a class, you must instance it before being able to use `<instance>.compile`

i.e

```js
const Nexe = require('nexe');

let nexe = new Nexe(/** options **/);

nexe.compile(callback) // etc
```

Using `nexe.compile` without instancing has been deprecated, but still works.
It'll be removed in the next 2.x release.

`nexe.compile` will take the same options as the package.json format, supports the
old ones until the next 2.x release.


Nexe no longer supports iojs :(

CLI may be removed / less feature focused in the near future.


# Contributors

* Jared Allard &lt;jaredallard@outlook.com&gt;
* The awesome open source developers who submit bug reports and write PRs. I &lt;3 You

# License

MIT
