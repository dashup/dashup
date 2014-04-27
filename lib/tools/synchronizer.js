'use strict';

var _ = require('lodash');

var async = require('async');

var Streams = require('../backend/streams'),
    DataSource = require('../github/datasource');

var elastic = require('../elasticsearch');


var SOURCE_EVENT_TYPE_MAP = {
  'repo':         'event-repo',
  'repo-issues':  'event-repo-issue',
  'organization': 'event-org'
};

var SOURCE_API_MAP = {
  'repo': 'getRepositoryEvents',
  'repo-issues': 'getRepositoryIssueEvents',
  'organization': 'getOrganizationEvents'
};


function Synchronizer(github, stream) {

  var log = require('../utils').logger('synchronizer', '[' + stream.name + ']');

  function sourceName(source) {
    return _.values(source.keys).join('-') + '-' + source.type;
  }

  /**
   * Fetch events from GitHub
   *
   * @param  {Function} done
   */
  function fetchEvents(done) {

    var datasource = new DataSource(github);

    var sources = stream.streamSources;

    var eventMap = {};

    if (!sources.length) {
      return done({});
    }

    function fetchSourceEvents(source, done) {

      /**
       * Update meta data
       *
       * @param {Function} done
       */
      function updateMetaData(done) {

        return function(err, result) {

          if (err) {
            log('[event-fetch] source data <%s> fetch error: ', sourceName(source), err);
            return done(err);
          }

          // update source meta-data
          log('[event-fetch] source data <%s> fetched', sourceName(source));

          var meta = result.meta;

          if (!meta) {
            console.log(result);
          } else {

            if (meta.etag) {
              source.etag = meta.etag;
            }

            if (meta.status == '304 Not Modified') {
              log('[event-fetch] not modified');
            }
          }

          source.lastSync = new Date();

          done(null, result);
        };
      }

      function storeEvents(done) {

        return function(err, result) {

          if (err) {
            return done(err);
          }

          // pages of newly fetched events
          var fetchedEvents = result.data;

          var eventType = SOURCE_EVENT_TYPE_MAP[source.type];

          eventMap[eventType] = (eventMap[eventType] || []).concat(_.flatten(fetchedEvents));

          done();
        };
      }

      function fetch(source, done) {

        var method = SOURCE_API_MAP[source.type];

        // configure message / options
        // based on source keys and stored etag

        var message = _.extend({}, source.keys);
        var options = {};

        if (source.etag) {
          // do only fetch new events
          message.headers = {
            'If-None-Match': source.etag
          };
        } else {
          // try to fetch all events
          options.fetch = 'next';
        }

        // fetch actual data

        datasource[method](message, options, done);
      }

      fetch(source, updateMetaData(storeEvents(done)));
    }


    log('[event-fetch] starting');

    async.map(sources, fetchSourceEvents, function(err) {
      var events = _.collect(eventMap, function(events, name) {
        return { name: name, events: events };
      });

      if (err) {
        log('[event-fetch] finished with error(s)', err);
      } else {
        log('[event-fetch] success');
      }

      done(err, events);
    });
  }


  /**
   * Import events to ElasticSearch
   *
   * @param  {Function} done
   */
  function importEvents(events, done) {

    var es = elastic.createClient();


    function importType(type, done) {

      var name = type.name,
          events = type.events;


      function importEvent(event, done) {

        var message = _.extend({
          id: event.id,
          body: event,
          type: name,
          index: stream.name
        });

        es.index(message, done);
      }

      async.eachSeries(events, importEvent, done);
    }

    log('[event-import] starting');


    async.eachSeries(events, importType, function(err) {

      if (err) {
        log('[event-import] finished with error(s)', err);
      } else {
        log('[event-import] success');
      }

      es.close();

      done(err);
    });

  }

  function save(done) {
    stream.lastSync = new Date();

    log('persisting changes');

    Streams.save(stream, done);
  }

  function synchronize(done) {

    fetchEvents(function(err, events) {

      if (err) {
        return done(err);
      }

      importEvents(events, function(err) {

        if (err) {
          return done(err);
        }

        save(done);
      });
    });
  }

  // API
  this.synchronize = synchronize;
}


module.exports = Synchronizer;