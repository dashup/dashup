var Synchronizer = require('../lib/tools/synchronizer');

var streamName = process.argv[2];
if (!streamName) {
  throw new Error('usage: script streamName');
}

new Synchronizer(streamName).synchronize(function(err) {
  if (err) {
    console.log('synchronization failed:', err);
  } else {
    console.log('synchronization success');
  }
});