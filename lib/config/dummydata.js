'use strict';

var fs = require('fs');

var _ = require('lodash');


module.exports = function(db) {

  var Stream = db.Stream,
      StreamSource = db.StreamSource;

  var streams = {};

  try {
    streams = JSON.parse(fs.readFileSync('streams.json', 'utf-8'));
  } catch (e) {
    // no data
  }

  _.forEach(streams, function(entries, name) {

    Stream.create({ name: name }).success(function(stream) {

      var sources = [];

      _.forEach(entries, function(e) {

        sources.push(_.extend({}, e, { stream_id: stream.id }));

        // include repo issues
        if (e.type === 'repo') {
          sources.push(_.extend({}, e, { type: 'repo-issues', stream_id: stream.id }));
        }
      });

      StreamSource.bulkCreate(sources).complete(function() {
        // done
      });
    });
  });
};