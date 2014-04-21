var fs = require('fs'),
    _ = require('lodash'),
    minimatch = require('minimatch');

var config = require('../lib/config'),
    elastic = require('../lib/elasticsearch'),
    read = require('../lib/tools/data').read;


var es = elastic.createClient();

var streamName = process.argv[2];
if (!streamName) {
  throw new Error('usage: script streamName');
}


function importToElasicSearch(elements, type, done) {

  var active = 0;
  var errors = [];

  if (!elements.length) {
    return done();
  }

  _.forEach(elements, function(e) {
    var message = _.extend({
      id: e.id,
      body: e
    }, type);

    es.index(message, function(err) {
      if (err) {
        errors.push(err);
      }

      if (!--active) {
        done(errors.length ? _.extend(new Error('some import problems'), { nested: errors }) : null);
      }
    });

    active++;
  });

}

function importFiles(files, type, done) {

  var idx = 0;

  function next() {

    var file = files[idx++];

    if (!file) {
      return done();
    }

    var fileName = 'data/' + file;
    var contents = read(fileName);
    
    console.log('importing', type, '(' + contents.length + ' events from ' + fileName + ')');

    importToElasicSearch(contents, type, function(err) {
      if (err) {
        console.log(err);
      }

      next();
    });
  }

  next();
}

var dataFiles = fs.readdirSync('data');

function match(pattern) {
  return minimatch.match(dataFiles, pattern, {});
}

var running = 3;

function done(type) {

  console.log('imported ' + type);

  if (!--running) {
    console.log('all done');
    es.close();
  }
}

importFiles(match('events-org-*.json'), { index: streamName, type: 'event-org' }, function(err) {
  done('events-org');
});

importFiles(match('events-repo-*-base-*.json'), { index: streamName, type: 'event-repo' }, function(err) {
  done('events-repo');
});

importFiles(match('events-repo-*-issues-*.json'), { index: streamName, type: 'event-repo-issue' }, function(err) {
  done('events-repo-issue');
});
