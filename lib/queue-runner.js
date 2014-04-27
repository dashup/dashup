'use strict';

var _ = require('lodash'),
    util = require('util');

var events = require('events');

var log = require('./utils').logger('queue-runner');


var Task = function(data) {
  _.extend(this, data);

  events.EventEmitter.call(this);
};

util.inherits(Task, events.EventEmitter);


var QueueRunner = function() {

  var running = false;
  var tasks = [];

  var id = 0;

  function finished(task, err, result) {
    tasks.splice(tasks.indexOf(task), 1);

    task.running = false;
    task.emit('complete', err, result);
  }

  function tick() {

    setTimeout(function() {

      var now = Date.now();

      var dueTasks = _.filter(tasks, function(t) {
        return !t.running && (!t.due || t.due < now);
      });

      _.forEach(dueTasks, function(t) {
        t.running = true;

        log('task ' + t.id + ' executing');

        t.run(function(err, result) {
          log('task ' + t.id + ' done');
          finished(t, err, result);
        });
      });

      if (running) {
        tick();
      }
    }, 1000);
  }

  function start() {

    if (!running) {
      running = true;
      log('starting runner');
      tick();
    }
  }

  function schedule(taskDefinition, done) {

    var task;

    if (taskDefinition.exclusive) {
      task = _.where(tasks, { exclusive: taskDefinition.exclusive })[0];
    }

    if (!task) {
      task = new Task(taskDefinition);
      task.id = id++;
      tasks.push(task);
    }

    task.on('complete', done);

    start();

    return task;
  }

  this.schedule = schedule;
  this.start = start;
};


module.exports = new QueueRunner();

module.exports.QueueRunner = QueueRunner;