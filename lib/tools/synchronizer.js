var config = require('../config'),
    github = require('../github');

var Importer = require('../github/importer'),
    DataSource = require('../github/datasource');

var elastic = require('../elasticsearch');

var _ = require('lodash');

var REPO_SOURCES = [
  { name: 'base', method: 'getRepositoryEvents' },
  { name: 'issues', method: 'getRepositoryIssueEvents' }
];

var ORG_SOURCES = [
  { name: 'base', method: 'getOrganizationEvents' }
];


function log() {
  console.log.apply(console, Array.prototype.slice.call(arguments));
}


function Synchronizer(streamName) {

  var datasource = new DataSource(github),
      importer = new Importer(datasource);

  var repositories = config.get('streams.' + streamName + '.track.repositories', []);
  var organizations = config.get('streams.' + streamName + '.track.organizations', []);

  var es = elastic.createClient();

  var sync = config.get('sync.' + streamName, {});

  function updateSync(fn) {

    return function(element, source, sync, result) {
      log(element.id, source, 'data loaded');

      var meta = result.meta;
      
      if (meta.etag) {
        sync.etag = meta.etag;
      }

      sync.count++;
      sync.last = new Date();

      if (meta.status == '304 Not Modified') {
        log('not modified');
      } else
      if (result.data.length) {
        fn(element, source, result.data);
      }
    };
  }

  function fetchRepositoryEvents(loaded, done) {
    importer.fetchAllEvents(repositories, sync, REPO_SOURCES, loaded, done);
  }

  function fetchOrganizationEvents(loaded, done) {
    importer.fetchAllEvents(organizations, sync, ORG_SOURCES, loaded, done);
  }


  function synchronize(done) {

    var active = 2;

    var errors = [];

    var events = {};

    var organizationEventsLoaded = updateSync(function(element, source, newEvents) {
      var type = 'event-org' + (source === 'issues' ? '-issue' : '');

      events[type] = (events[type] || []).concat(newEvents);
    });

    var repoEventsLoaded = updateSync(function(element, source, newEvents) {
      var type = 'event-repo' + (source === 'issues' ? '-issue' : '');
      events[type] = (events[type] || []).concat(newEvents);

      log('%s-%s: %d new events', element.id, source, newEvents.length);
    });

    function fetchDone(err) {
      if (err) {
        log('fetch error', err);
        errors.push(err);
      }

      if (!--active) {
        importEvents();
      }
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
            done(errors.length ? _.extend(new Error('import problems'), { nested: errors }) : null);
          }
        });

        active++;
      });
    }

    function finish(err) {
      log('finished sync');

      if (err) {
        log('with errors! resetting sync state');
        config.reload();
      } else {
        config.save();
      }

      // we are done
      es.close();

      done(err);
    }

    function importEvents() {
      
      if (errors.length) {
        log('skip import due to errors');
        return finish(_.extend(new Error('fetch problems'), { nested: errors }));
      }

      log('importing events to elastic search');

      var active = 0;

      _.forEach(events, function(elements, name) {
        active++;

        log('importing %s', name);
        importToElasicSearch(elements, { type: name, index: streamName }, function(err) {
            
          log('importing %s done', name);

          if (err) {
            errors.push(err);
          }

          if (!--active) {
            finish(errors.length ? _.extend(new Error('import problems'), { nested: errors }) : null);
          }
        });
      });

      if (!active) {
        finish();
      }
    }

    fetchOrganizationEvents(organizationEventsLoaded, fetchDone);
    fetchRepositoryEvents(repoEventsLoaded, fetchDone);
  }

  // API
  this.synchronize = synchronize;
}

module.exports = Synchronizer;