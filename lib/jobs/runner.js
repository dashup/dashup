'use strict';

function Runner() {
  this.runners = { };
}


Runner.prototype.register = function(task, fn) {

  if (this.runners[task]) {
    throw new Error('task runner for <%s> already registered');
  }

  this.runners[task] = fn;
};


Runner.prototype.execute = function(task, payload, done) {
  var runner = this.runners[task];

  if (!runner) {
    return done(new Error('no runner for <' + task + '>'));
  }

  runner(payload, done);
};


module.exports = Runner;