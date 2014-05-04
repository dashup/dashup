'use strict';

function Scheduler(runner) {
  this.scheduled = { 'timers': [], 'intervals': [] };

  this.runner = runner;
}


Scheduler.prototype.schedule =
Scheduler.prototype.once = function(task, config, done) {

  if (!task) {
    throw new Error('must provide task');
  }

  config = config || {};

  done = done || function() {};

  var now = Date.now();
  var due = config.due;

  var timeout = due ? Math.max(0, config.due - now) : 0;

  var runner = this.runner;

  var timer = setTimeout(function() {
    runner.execute(task, config.payload || {}, done);
  }, timeout);

  // do not prevent application from stoping
  timer.unref();
};


Scheduler.prototype.scheduleRepeated =
Scheduler.prototype.repeat = function(task, config) {

  if (!config) {
    throw new Error('mus specify task configuration');
  }

  var interval = config.interval;

  var delay = config.delay || 2000;

  if (!interval) {
    throw new Error('no interval given');
  }

  var runner = this.runner;

  var done = function() { };

  setTimeout(function() {

    var timer = setInterval(function() {
      runner.execute(task, config.payload || {}, done);
    }, interval);

    // do not prevent application from stoping
    timer.unref();
  }, delay);

};


module.exports = Scheduler;