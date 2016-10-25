'use strict';

const Nexe   = require('../construct.js');

describe('Compile', () => {
  it('works without options.', done => {
    let nexe = new Nexe({
      input:  './test/compile/01-hw.js',
      output: './test/compile/hw',
      python: '/usr/bin/python2',
      temp:   './temp'
    })

    nexe.compile(err => {
      return done(err);
    });
  })
})
