/**
 * Download / Manage Node.js Versions.
 *
 * @name Download
 * @author Jared Allard <jaredallard@outlook.com>
 * @license MIT
 **/

'use strict';

const request   = require('request'),
      fs        = require('fs'),
      tarstream = require('tar-stream'),
      gunzip    = require('gunzip-maybe'),
      spawn     = require('child_process').spawn,
      mkdirp    = require('mkdirp'),
      path      = require('path');

let DOWNLOAD_DIR;
let isWin = false;

module.exports = class Download {

  /**
   * Download Class Constructor.
   *
   * @param {Object} libs - nexe library object.
   * @param {Object} config - nexe config object.
   * @param {String} downloads - downloads location.
   * @constructor
   **/
  constructor(libs, config, downloads) {
    this.libs   = libs;
    this.config = config;

    DOWNLOAD_DIR = downloads;
  }

  /**
   * Download a Node.js Version.
   *
   * @param {String} version - node.js version, or latest for latest.
   * @param {Function} next  - callback (err, location)
   * @returns {undefiend} use callback.
   **/
  downloadNode(version, next) {
    let console = this.libs.log;
    let outPath = path.join(DOWNLOAD_DIR, 'node', version);
    let outFile = path.join(outPath, 'node-'+version+'.tar.gz');

    console.log('download:node_ver', '->', version);
    this.node_version = version;


    if(fs.existsSync(outFile)) {
      return next(false, outFile);
    }

    // Create the Directories.
    mkdirp.sync(outPath);

    // open the WriteStream.
    let out    = fs.createWriteStream(outFile, {
      flags: 'w+'
    });

    // Default Prefix and URL.
    let prefix = 'https://nodejs.org/dist';
    let url    = prefix + '/v' + version + '/node-v' + version + '.tar.gz';

    // If latest, modify the URL.
    if (version === 'latest') {
      url = prefix + '/node-' + version + '.tar.gz';
    }

    console.log('download', 'nodejs from', url);
    request({
      url: url,
      headers: {
        'User-Agent': 'nexe'
      }
    }).pipe(out);

    out.on('close', function() {
      console.log('download', 'WriteStream on', outFile, 'closed');
      return next(false, outFile);
    });
  }

  /**
   * Extract last downloaded node version.
   *
   * @param {Function} next  - callback on finished.
   * @returns {undefined} use callback.
   **/
  extractNode(next) {
    let version = this.node_version;
    let console = this.libs.log;
    let outPath = path.join(DOWNLOAD_DIR, 'node', version);
    let tarFile = path.join(outPath, 'node-'+version+'.tar.gz');

    let computedOut = outPath + ('/node-v'+version);

    // Check if the version actually exists.
    if(!fs.existsSync(tarFile)) {
      return next('Tar File Not Found');
    }

    // Check if out already exists.
    if(fs.existsSync(computedOut)) {
      console.log('extract', 'out already exists', computedOut);
      return next(false, computedOut, version);
    }

    let onError = err => {
      console.log('extract', 'failed to extract node source');
      return next(err);
    }

    let done   = (compout, ver) => {
      if(ver === 'latest') {
        fs.readdirSync(outPath).forEach(file => {
          let file_loc = path.join(outPath, file);
          let isDir    = fs.lstatSync(file_loc).isDirectory();
          let rversion = /node-v([0-9.]+)/.exec(file);

          // Dump non directoryies.
          if(!isDir) return console.log('extractNode:latest', 'process', file, 'discarded: not dir');
          if(!version[1]) return console.log('extractNode:latest', 'process', file, 'discarded: didn\'t match regex.');

          console.log('extractNode:latest', 'process', file, 'estimating version as:', rversion[1]);
          console.log('extractNode:latest', 'set computedOut', rversion[1])

          compout  = outPath + ('/node-v'+rversion[1]);
          ver      = rversion[1];
        })
      }

      return next(false, compout, ver);
    }

    // Extract manually
    if (isWin) {
      let read = fs.createReadStream(tarFile);
      let extract = tarstream.extract()

      console.log('extract:/extract/', 'using tar-stream')

      // Use tar-stream to extract the tar file manually.
      extract.on('entry', (header, stream, callback) => {
        let absolutepath = path.join(outPath, header.name);
        if (header.type === 'directory') {
          console.log('extract:tar-stream', 'create directory', header.name)
          mkdirp.sync(absolutepath);
          return callback();
        }

        let write = fs.createWriteStream(absolutepath);

        // Pipe the tar-stream file stream into the file path.
        stream.pipe(write);

        write.on('close', function() {
          return callback();
        });

        stream.on('error', function(err) {
          return onError(err);
        })

        write.on('error', function(err) {
          return onError(err);
        });

        stream.resume() // just auto drain the stream
      })

      // When finished.
      extract.on('finish', () => {
        console.log('extract', 'finished');
        return done(computedOut, version);
      })

      // Gunzip it if it's gzip'd via gunzip-maybe.
      read.pipe(gunzip()).pipe(extract);
    } else {
      console.log('extract', 'using native tar');

      let cmd = ['tar', '-xf', tarFile, '-C', outPath];

      // Spawn tar to extract the tar file.
      let tar = spawn(cmd.shift(), cmd);
      tar.stderr.pipe(process.stderr);

      tar.on('close', () => {
        return done(computedOut, version);
      });

      tar.on('error', onError);
    }
  }
}
