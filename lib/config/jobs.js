'use strict';

var _ = require('lodash');

var Synchronizer = require('../tools/synchronizer');


module.exports = function(db) {

  var jobs = require('../jobs');

  var github = require('../github').createClient();


  // register job executor

  jobs.runner.register('sync-stream', function(stream, done) {
    console.log('synchronizing stream <%s>', stream.name);

    new Synchronizer(github, stream).synchronize(done);
  });


  jobs.scheduler.once('start-stream-sync', { due: 5000 }, function(data) {

    db.Stream.findAll({ include: [ db.StreamSource ] }).success(function(streams) {

      var delay = 30000; // thirty seconds
      var interval = 1000 * 60 * 15; // 15 minutes

      _.forEach(streams, function(s, i) {
        console.log('scheduling sync for stream <%s>', s.name);

        jobs.scheduler.repeat('sync-stream', { interval: interval, delay: delay * i, payload: s });
      });

    });
  });
};