'use strict';

// initialize node env
process.env.NODE_ENV = process.env.NODE_ENV || 'development';


var Streams = require('../lib/backend/streams'),
    Synchronizer = require('../lib/tools/synchronizer');


var github = require('../lib/github').createClient();

var streamName = process.argv[2];

Streams.get(streamName, function(err, stream) {

  if (err || !stream) {
    console.log('stream not found: %s', streamName);
    throw new Error('usage: script streamName');
  }

  new Synchronizer(github, stream).synchronize(function(err) {
    if (err) {
      console.log('[sync] failed', err);
    } else {
      console.log('[sync] success');
    }
  });
});