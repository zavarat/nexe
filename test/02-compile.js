'use strict';

const Nexe   = require('../construct.js');
const spawn  = require('child_process').spawnSync;
const path   = require('path');
const expect = require('chai').expect;

describe('Compile', () => {
  it('works without options.', done => {
    let nexe = new Nexe({
      input:  './test/compile/01-hw.js',
      output: './test/compile/01',
      python: '/usr/bin/python2',
      version: '7.0.0',
      temp:   './temp'
    })

    nexe.compile(err => {
      return done(err);
    });
  })

  it('can compile special characters: ─┬┌┐─┴└┘│├─┼│┤│█░▒▓', done => {
    let output = './test/compile/02';

    let nexe = new Nexe({
      input:  './test/compile/02-special-characters.js',
      output: output,
      python: '/usr/bin/python2',
      version: '7.0.0',
      temp:   './temp'
    })

    nexe.compile(err => {
      if(err) return done(err);

      let res = spawn(output, []);

      let out = res.output[1].toString();

      expect(out).to.equal('─┬┌┐─┴└┘│├─┼│┤│█░▒▓')
    });
  })
})
