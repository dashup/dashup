var config = require('../lib/config'),
    elastic = require('../lib/elasticsearch'),
    _ = require('lodash');


var es = elastic.createClient();

var indexName = 'dashub';


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


console.log('dropping index', indexName);

dropIndex(indexName, function(err) {

  if (err) {
    console.error('failed to drop', err);
    return es.close();
  }

  console.log('dropped');

  console.log('creating index', indexName);

  createIndex(indexName, {
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