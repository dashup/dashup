var config = require('../lib/config'),
    elastic = require('../lib/elasticsearch'),
    _ = require('lodash');


var es = elastic.createClient();

var streamName = process.argv[2];
if (!streamName) {
  throw new Error('usage: script streamName');
}


function dropIndex(index, done) {
  var message = {
    index: index
  };

  es.indices.delete(message, done);
}


function createIndex(index, mappings, done) {

  var message = {
    index: index,
    mappings: mappings
  };

  es.indices.create(message, done);
}


console.log('dropping index', streamName);

dropIndex(streamName, function(err) {

  if (err) {
    console.error('failed to drop', err);
  } else {
    console.log('dropped');
  }

  console.log('creating index', streamName);

  createIndex(streamName, {
    'event-repo-issue': {
      'properties' : {
        'created_at' : { 'type' : 'date_time' }
      }
    },
    'event-repo': {
      'properties' : {
        'created_at' : { 'type' : 'date_time' }
      }
    },
    'event-org': {
      'properties' : {
        'created_at' : { 'type' : 'date_time' }
      }
    }
  }, function(err) {

    if (err) {
      console.error('failed to create', err);
    } else {
      console.log('created');
    }

    es.close();
  });
});