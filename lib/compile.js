/**
 * Compile Node.js from Node.js
 *
 * @name Compile
 * @author Jared Allard <jaredallard@outlook.com>
 * @license MIT
 **/

 'use strict';

 const path  = require('path'),
       async = require('async'),
       os    = require('os'),
       spawn = require('child_process').spawn,
       fs    = require('fs');


 // Not implemented: isWin.
 let isWin = false;
 let DOWNLOAD_DIR;


let self = null;
 module.exports = class Compile {
   constructor(libs, config, downloads, nexe) {

     // Add default.
     if(!config.onout) config.onout = () => {};

     this.libs   = libs;
     this.config = config;

     self = this;

     DOWNLOAD_DIR = downloads;
   }

   /**
    * Data abstraction for compile/make/etc output.
    *
    * @param {Buffer} data - child_process data.
    * @returns {String} data in string format.
    **/
   dataHandler(data) {
     let out = data.toString();

     self.config.onout(out);

     return out;
   }

   /**
    * Compile a version of Node.js
    *
    * @param {String} version - must be literal, no latest.
    * @param {Function} done  - callback
    * @returns {undefined} use callback.
    **/
    node(version, done) {
     let console = this.libs.log;
     let outPath  = path.join(DOWNLOAD_DIR, 'node', version, 'node-v'+version);

     if(!fs.existsSync(outPath)) {
       console.log('nexe:compile', 'outPath didn\'t exist, trying with latest.')
       outPath = path.join(DOWNLOAD_DIR, 'node', 'latest', 'node-v'+version);

       if(!fs.existsSync(outPath)) {
         console.log('nexe:compile', 'version hasn\'t been downloaded.')
         return done(new Error('Version Not Found.'));
       }
     }

     console.log('nexe:compile', 'found node.js', version, 'in', outPath);

     async.waterfall([
       /**
        * Execute Configure If on Linux.
        **/
       (next) => {
         if(isWin) {
           return next();
         }

         let cfg  = './configure';
         let conf = [cfg];

         // should work for all use cases now.
         let configure = spawn(this.config.python || 'python', conf, {
           cwd: outPath
         });

         configure.stdout.on('data', this.dataHandler)
         configure.stderr.on('data', this.dataHandler)

         configure.on('exit', code => {
           console.log('nexe:compile', 'configure closed with exit code', code);
           return next();
         })
       },

       /**
        * Modify configure to support custom python paths.
        **/
       (next) => {
         let python = this.config.python;
         let persit = path.join(outPath, '.have-run-nexe-python');


         if(!python) return next();

         let _loop = dir => {
           /* eventually try every python file */
           const pdir = fs.readdirSync(dir);

           /* iterate over the directory */
           pdir.forEach(file => {
             let filepath = path.join(dir, file);
             let fileext  = path.extname(filepath);
             let stat     = fs.statSync(filepath);

             let allowedExts = [
               '.mk',
               '.gyp',
               '.py',
               '.sh' ,
               '.gypi'
             ];


             // If is directory.
             if (stat.isDirectory()) {
               if(file === 'test') return; // ignore if test dir.

               // Recursive.
               return _loop(filepath);
             }

             // only process Makefiles and .mk targets.
             if (file !== 'Makefile' && allowedExts.indexOf(fileext) === -1 ) {
               return;
             }

             console.log('compile:python', 'patching', file);

             /* patch the file */
             let py = fs.readFileSync(filepath, {
               encoding: 'utf8'
             });

             // replace python with new python
             py = py.replace(/(\w|\/)*python(\d|)(?!_)(?! +=)/gm, python);

             fs.writeFileSync(filepath, py, {
               encoding: 'utf8'
             }); // write to file
           });
         }

         if(fs.existsSync(persit)) {
           // TDO: allow re-patching.
           console.log('compile:python', 'already patched python... dirty tree.')
           return next();
         }

         // write that we've run python patching before.
         fs.writeFileSync(persit, python, 'utf8');

         // begin
         _loop(outPath);

         console.log('compile:python', 'done')
         return next();
       },

       /**
        * Execute Make on Linux
        **/
       (next) => {
         if(isWin) {
           return next();
         }

         let platformMake = 'make';
         if(os.platform().match(/bsd$/) !== null) {
           platformMake = 'gmake';
         }

         let make = spawn(platformMake, [], {
           cwd: outPath
         });

         make.stdout.on('data', this.dataHandler)
         make.stderr.on('data', this.dataHandler)

         make.on('error', function(err) {
           console.log('nexe:compile', 'make failed.')
           return next(err);
         })

         make.on('exit', code => {
           console.log('nexe:compile', 'make exited with code', code);
           return next();
         });
       },

       /**
        * Execute VCBuild (Windows)
        **/
       (next) => {
         if(!isWin) {
           return next();
         }

         // spawn a vcbuild process with our custom enviroment.
         let vcbuild = spawn('vcbuild.bat', ['nosign', 'release'], {
           cwd: outPath
         });

         vcbuild.stdout.on('data', this.dataHandler)
         vcbuild.stderr.on('data', this.dataHandler)

         vcbuild.on('exit', code => {
           console.log('nexe:compile', 'vcbuild exited with code', code);
           return next();
         });
       }
     ], err => {
       if(err) {
         console.log('nexe:compile', 'got error via async');
         return done(err);
       }

       return done(false);
     })
   }
 }
