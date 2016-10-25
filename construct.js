/**
 * this API "wrapper"
 *
 * @name this
 * @author Jared Allard <jaredallard@outlook.com>
 * @version 2.0.0
 * @license MIT
 **/

'use strict';

const path  = require('path');
const fs    = require('fs');
const async = require('async');
const debug = require('debug')('nexe:wrapper');

const LIB_DIR = path.join(__dirname, 'lib');

/**
 * this
 * @class
 **/
class Nexe {

  /**
   * this constructor
   *
   * @param {Object} config - this configuration object.
   *
   * @constructor
   **/
  constructor(config) {
    let self = this;

    this.libs = {};
    this.config = config;

    debug('LIB_PATH', LIB_DIR)

    if(!config.temp ) config.temp = './temp';
    if(!path.isAbsolute(config.temp)) {
      config.temp = path.join(__dirname, config.temp);
    }


    // Load our libraries, use sync because bad to use async in constructors
    let libs = fs.readdirSync(LIB_DIR);
    libs.forEach(lib => {
      debug('lib', lib);

      let LIB_PATH     = path.join(LIB_DIR, lib);
      let LIB_NAME     = path.parse(lib).name;

      // Require and the instance the lib.
      let LIB_CLASS    = require(LIB_PATH);

      let DOWNLOAD_DIR = config.temp;

      // If not absolute, use from CWD.
      if(!path.isAbsolute(config.temp)) {
        DOWNLOAD_DIR   = path.join(process.cwd(), config.temp);
      }

      // link it unto the this class.
      self.libs[LIB_NAME] = new LIB_CLASS(self.libs, self.config, DOWNLOAD_DIR);
    });


    let console = this.libs.log;
    console.log('this initialized.');
  }

  /**
   * Create a executable.
   *
   * @param {Function} done - when done.
   * @returns {undefined} undefined
   **/
  compile(done) {
    // Dry run.
    if(this.config.test) return true;

    let VERSION = this.config.version || 'latest';
    async.waterfall([
      /**
       * Download a version of node.
       **/
      next => {
        this.libs.download.downloadNode(VERSION, next);
      },

      /**
       * Extract Node.js
       **/
      (outFile, next) => {
        this.libs.download.extractNode(next);
      },

      /**
       * Bundle The Application.
       **/
      (location, version, next) => {
        let compfile = path.join(location, 'lib', 'nexe.js');
        this.libs.package.bundle(this.config.input, compfile, 'browserify', err => {
          return next(err, version);
        });
      },

      /**
       * Patch Node.
       **/
      (version, next) => {
        this.libs.patch.node(version, err => { return next(err, version); });
      },

      /**
       * Embed files into node.
       **/
      (version, next) => {
        this.libs.embed.files(version, [], '', {}, err => { return next(err, version) });
      },

      /**
       * Compile node.
       **/
      (version, next) => {
        this.libs.compile.node(version, next);
      }
    ], err => {
      return done(err);
    })
  }

  /**
   * Download, extract, and setup a version of node.
   *
   * @param {Integer} node_version - version of node to use. latest, for latest.
   * @param {Function} done        - callback.
   *
   * @returns {undefined} undefined
   **/
  setup(node_version, done) {
    if(!done) done = () => {}; // defaults.
  }
}

// v1 wrapper. Bit hacky...
Nexe.compile = opts => {
  debug('v1-wrapper', 'got opts:', opts);

  let instance = new Nexe(opts);
  return instance.compile();
};

module.exports = Nexe;
