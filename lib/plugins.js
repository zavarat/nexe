/**
 * Plugin Library,
 *
 * @author Jared Allard <jaredallard@outlook.com>
 * @license MIT
 * @license 1.0.0
 **/

class Plugins {
  constructor(libs, config) {
    this.libs   = libs;
    this.config = config;

    this.queue = [];
  }

  /**
   * Add a plugin to the queue.
   *
   * @param {Function} func - function (middleware) to add.
   * @returns {Boolean} success or not.
   **/
  add(func) {
    if(typeof func === 'function') return false;
    this.queue.push(func);

    return true;
  }


  /**
   * Run all plugins with func
   *
   * @param {Function} func - function to run with each plugin.
   * @param {Function} done - callback.
   * @returns {Integer} (callback) number of plugins ran.
   **/
  run(func, done) {
    let i = 0;

    this.queue.forEach(plugin => {
      return func(plugin, ++i);
    })

    return done(i);
  }
}

module.exports = class PluginWrapper {
  constructor(libs, config, downloads, nexe) {
    nexe.plugins = new Plugins();
  }
}
