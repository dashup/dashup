'use strict';

var Runner = require('./runner'),
    Scheduler = require('./scheduler');


var runner = new Runner(),
    scheduler = new Scheduler(runner);


module.exports = {
  runner: runner,
  scheduler: scheduler
};