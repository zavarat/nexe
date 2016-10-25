'use strict';

const expect = require('chai').expect;
const Nexe   = require('../construct.js');

describe('API', () => {

  let compileOpts = {
    test: true,
    temp: '../temp'
  }

  it('supports the old compile method', () => {
    Nexe.compile(compileOpts);
  })

  it('supports the new compile method', () => {
    let nexe = new Nexe(compileOpts);
    nexe.compile();
  })
})
