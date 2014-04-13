var _ = require('lodash');


function Importer(datasource) {

  function fetchEvents(element, sync, sources, loaded, done) {

    if (!element.id) {
      element.id = _.values(element.keys).join('-');

      console.log('assigned id', element.id, 'to', element.keys);
    }

    var elementSync = (sync[element.id] = sync[element.id] || {});
    
    var idx = 0;

    function next() {

      var source = sources[idx++];

      if (!source) {
        return done();
      }

      var syncData = elementSync[source.name] = elementSync[source.name] || { count: 0 };

      var message = _.extend({}, element.keys);
      var options = {};

      if (syncData.etag) {
        // do only fetch new events
        message.headers = {
          'If-None-Match': syncData.etag
        };
      } else {
        // try to fetch all events
        options.fetch = 'next';
      }

      datasource[source.method](message, options, function(err, result) {

        if (err) {
          return done(err);
        }

        loaded(element, source.name, syncData, result);

        next();
      });
    }

    next();
  }

  function fetchAllEvents(elements, sync, sources, loaded, done) {

    var idx = 0;

    function next() {
      var element = elements[idx++];

      if (!element) {
        return done();
      }

      fetchEvents(element, sync, sources, loaded, function(err) {
        if (err) {
          return done(err);
        }

        next();
      });
    }

    next();
  }


  // API

  this.fetchEvents = fetchEvents;
  this.fetchAllEvents = fetchAllEvents;
}


// module API

module.exports = Importer;